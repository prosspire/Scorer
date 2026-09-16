"use client";
import { useState, useEffect } from 'react';
import { 
  Crown, 
  Instagram, 
  Flame, 
  Trophy, 
  Users, 
  Vote, 
  Eye, 
  Heart, 
  Share2, 
  Clock, 
  Filter,
  Search,
  TrendingUp,
  Zap,
  Target,
  Star,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/lib/store/user';
import { getActiveBattles , castVote, getUserVote, getTrendingBattles, getBattlesByCategory } from '@/lib/actions/blog';
import PrivateRoute from '@/components/editor/PrivateRoute';
interface Battle {
  id: string;
  title: string;
  participant_a_username: string;
  participant_b_username: string;
  participant_a_image?: string;
  participant_b_image?: string;
  participant_a_followers: string;
  participant_b_followers: string;
  participant_a_votes: number;
  participant_b_votes: number;
  total_votes: number;
  description: string;
  slug: string;
  category: string;
  created_at: string;
  ends_at: string;
  is_active: boolean;
}

interface VoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  battle: Battle | null;
  onVote: (battleId: string, participant: 'A' | 'B') => void;
  isVoting: boolean;
}

const VoteModal = ({ isOpen, onClose, battle, onVote, isVoting }: VoteModalProps) => {
  if (!isOpen || !battle) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl border border-white/20 max-w-2xl w-full shadow-2xl">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white">Cast Your Vote</h3>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="text-center mb-6">
            <h4 className="text-xl font-semibold text-white mb-2">{battle.title}</h4>
            <p className="text-gray-300">{battle.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Participant A */}
            <button
              onClick={() => onVote(battle.id, 'A')}
              disabled={isVoting}
              className="group bg-gradient-to-br from-red-500/20 to-pink-500/20 border-2 border-red-500/30 hover:border-red-400/50 rounded-3xl p-6 transition-all transform hover:scale-105 disabled:opacity-50"
            >
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl">
                    {battle.participant_a_image ? (
                      <img 
                        src={battle.participant_a_image} 
                        alt={battle.participant_a_username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <Users className="w-10 h-10 text-white" />
                    )}
                  </div>
                  <div className="absolute -top-2 -right-2 bg-red-500 rounded-full px-2 py-1 text-xs font-bold text-white">
                    RED
                  </div>
                </div>
                
                <h5 className="text-lg font-bold text-white mb-1">@{battle.participant_a_username}</h5>
                <div className="flex items-center gap-1 text-gray-300 text-sm mb-3">
                  <Instagram className="w-4 h-4" />
                  <span>{battle.participant_a_followers} followers</span>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-black text-red-400 mb-1">{battle.participant_a_votes}</div>
                  <div className="text-red-300 text-sm font-medium">VOTES</div>
                </div>
              </div>
              
              <div className="mt-4 bg-red-500 text-white py-2 rounded-xl font-bold group-hover:bg-red-600 transition-colors">
                {isVoting ? 'Voting...' : 'Vote Red Team'}
              </div>
            </button>

            {/* Participant B */}
            <button
              onClick={() => onVote(battle.id, 'B')}
              disabled={isVoting}
              className="group bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/30 hover:border-blue-400/50 rounded-3xl p-6 transition-all transform hover:scale-105 disabled:opacity-50"
            >
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-xl">
                    {battle.participant_b_image ? (
                      <img 
                        src={battle.participant_b_image} 
                        alt={battle.participant_b_username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <Users className="w-10 h-10 text-white" />
                    )}
                  </div>
                  <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full px-2 py-1 text-xs font-bold text-white">
                    BLUE
                  </div>
                </div>
                
                <h5 className="text-lg font-bold text-white mb-1">@{battle.participant_b_username}</h5>
                <div className="flex items-center gap-1 text-gray-300 text-sm mb-3">
                  <Instagram className="w-4 h-4" />
                  <span>{battle.participant_b_followers} followers</span>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-black text-blue-400 mb-1">{battle.participant_b_votes}</div>
                  <div className="text-blue-300 text-sm font-medium">VOTES</div>
                </div>
              </div>
              
              <div className="mt-4 bg-blue-500 text-white py-2 rounded-xl font-bold group-hover:bg-blue-600 transition-colors">
                {isVoting ? 'Voting...' : 'Vote Blue Team'}
              </div>
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Vote className="w-4 h-4" />
                <span>{battle.total_votes} total votes</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{new Date(battle.ends_at) > new Date() ? 'Active' : 'Ended'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PublicBattlesPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [battles, setBattles] = useState<Battle[]>([]);
  const [trendingBattles, setTrendingBattles] = useState<Battle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [voteModal, setVoteModal] = useState<{ isOpen: boolean; battle: Battle | null }>({
    isOpen: false,
    battle: null
  });
  const [isVoting, setIsVoting] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const user = useUser((state) => state.user);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Fetch battles
  useEffect(() => {
    const fetchBattles = async () => {
      try {
        setIsLoading(true);
        
        // Fetch active battles
        const { data: activeBattles } = await getActiveBattles(20, 0);
        setBattles(activeBattles || []);
        
        // Fetch trending battles
        const { data: trending } = await getTrendingBattles(5);
        setTrendingBattles(trending || []);
        
      } catch (error) {
        console.error('Error fetching battles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBattles();
  }, []);

  // Filter battles based on category and search
  const filteredBattles = battles.filter(battle => {
    const matchesCategory = selectedCategory === 'all' || battle.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      battle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      battle.participant_a_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      battle.participant_b_username.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const handleVote = async (battleId: string, participant: 'A' | 'B') => {
    if (!user?.id) {
      setNotification({ message: 'Please login to vote', type: 'error' });
      return;
    }

    try {
      setIsVoting(true);
      const result = await castVote(battleId, participant, user.id);
      
      if (result.error) {
        setNotification({ message: result.error.message, type: 'error' });
      } else {
        setNotification({ message: 'Vote cast successfully!', type: 'success' });
        // Refresh battles to show updated vote counts
        const { data: activeBattles } = await getActiveBattles(20, 0);
        setBattles(activeBattles || []);
        setVoteModal({ isOpen: false, battle: null });
      }
    } catch (error) {
      setNotification({ message: 'Failed to cast vote', type: 'error' });
    } finally {
      setIsVoting(false);
    }
  };

  const formatTimeRemaining = (endsAt: string) => {
    const now = new Date();
    const endTime = new Date(endsAt);
    const diff = endTime.getTime() - now.getTime();

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  const categories = ['all', 'general', 'lifestyle', 'fitness', 'fashion', 'tech', 'entertainment'];

  // Show notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Dynamic gradient background */}
      <div 
        className="fixed inset-0 opacity-30 transition-all duration-1000 ease-out"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, 
            rgba(147, 51, 234, 0.15), 
            rgba(219, 39, 119, 0.1), 
            transparent 40%)`
        }}
      />

      {/* Floating elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 animate-float">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
            <Trophy className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="absolute bottom-32 left-20 animate-bounce-slow">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-red-500 rounded-xl flex items-center justify-center shadow-xl">
            <Flame className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="absolute top-1/2 left-10 animate-pulse">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-xl">
            <Vote className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-black/80 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Crown className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white">Live Battles</h1>
                <p className="text-gray-400">Vote for your favorite Instagram profiles</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search battles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 w-full sm:w-64"
                />
              </div>
              
              {/* Category Filter */}
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                {categories.map(category => (
                  <option key={category} value={category} className="bg-gray-900 capitalize">
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-gradient-to-r from-gray-900 to-black border border-white/20 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
            <span className="text-white font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        
        {/* Trending Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Trending Now</h2>
            <div className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-red-400 text-sm font-medium animate-pulse">
              LIVE
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {trendingBattles.map((battle, index) => (
              <div key={battle.id} className="bg-gradient-to-br from-gray-900/80 to-black/80 rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all group cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold">
                    #{index + 1}
                  </div>
                  <div className="text-xs text-gray-400">{formatTimeRemaining(battle.ends_at)}</div>
                </div>
                
                <h4 className="text-sm font-bold text-white mb-2 truncate">
                  @{battle.participant_a_username} vs @{battle.participant_b_username}
                </h4>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-red-400">
                    <span>{battle.participant_a_votes}</span>
                  </div>
                  <div className="text-gray-400">VS</div>
                  <div className="flex items-center gap-1 text-blue-400">
                    <span>{battle.participant_b_votes}</span>
                  </div>
                </div>
                
                <div className="mt-3">
                  <PrivateRoute fallback={
                    <Link href="/login">
                      <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-2 rounded-lg text-xs font-bold hover:from-purple-700 hover:to-pink-700 transition-all">
                        Login to Vote
                      </button>
                    </Link>
                  }>
                    <button 
                      onClick={() => setVoteModal({ isOpen: true, battle })}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-2 rounded-lg text-xs font-bold hover:from-purple-700 hover:to-pink-700 transition-all"
                    >
                      Vote Now
                    </button>
                  </PrivateRoute>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Battles Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Active Battles</h2>
            </div>
            
            <div className="text-gray-400 text-sm">
              {filteredBattles.length} battles found
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center gap-3 text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-xl">Loading epic battles...</span>
              </div>
            </div>
          ) : filteredBattles.length === 0 ? (
            <div className="text-center py-20">
              <Trophy className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-300 mb-2">No battles found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your search or category filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredBattles.map((battle) => (
                <div key={battle.id} className="bg-gradient-to-br from-gray-900/80 to-black/80 rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <h3 className="text-lg font-bold text-white">{battle.title}</h3>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">
                        LIVE
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 capitalize">{battle.category}</div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-6">{battle.description}</p>
                  
                  {/* Battle Arena */}
                  <div className="grid grid-cols-5 gap-4 items-center mb-6">
                    {/* Participant A */}
                    <div className="col-span-2 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-2xl p-4 border border-red-500/30 text-center">
                      <div className="relative mb-3 mx-auto w-12 h-12">
                        <div className="w-full h-full bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                          {battle.participant_a_image ? (
                            <img 
                              src={battle.participant_a_image} 
                              alt={battle.participant_a_username}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <Users className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div className="absolute -top-1 -right-1 bg-red-500 rounded-full px-1.5 py-0.5 text-xs font-bold">
                          A
                        </div>
                      </div>
                      <div className="text-sm font-bold text-white truncate">@{battle.participant_a_username}</div>
                      <div className="text-xs text-red-300 mb-2">{battle.participant_a_followers}</div>
                      <div className="text-xl font-black text-red-400">{battle.participant_a_votes}</div>
                    </div>
                    
                    {/* VS */}
                    <div className="col-span-1 text-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto font-bold text-sm mb-2">
                        VS
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-1">
                        <div 
                          className="bg-gradient-to-r from-red-500 to-pink-500 h-1 rounded-full transition-all"
                          style={{ width: `${battle.total_votes ? (battle.participant_a_votes / battle.total_votes) * 100 : 50}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Participant B */}
                    <div className="col-span-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-4 border border-blue-500/30 text-center">
                      <div className="relative mb-3 mx-auto w-12 h-12">
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                          {battle.participant_b_image ? (
                            <img 
                              src={battle.participant_b_image} 
                              alt={battle.participant_b_username}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <Users className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full px-1.5 py-0.5 text-xs font-bold">
                          B
                        </div>
                      </div>
                      <div className="text-sm font-bold text-white truncate">@{battle.participant_b_username}</div>
                      <div className="text-xs text-blue-300 mb-2">{battle.participant_b_followers}</div>
                      <div className="text-xl font-black text-blue-400">{battle.participant_b_votes}</div>
                    </div>
                  </div>
                  
                  {/* Battle Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6 text-center text-sm">
                    <div>
                      <div className="text-lg font-bold text-purple-400">{battle.total_votes}</div>
                      <div className="text-gray-400">Total Votes</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-400">{formatTimeRemaining(battle.ends_at)}</div>
                      <div className="text-gray-400">Time Left</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-yellow-400">{Math.round(battle.total_votes * 4.2)}</div>
                      <div className="text-gray-400">Views</div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                      <Link href={`/battle/${battle.slug}`}>
                        <button className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </Link>
                    </div>
                    
                    <PrivateRoute fallback={
                      <Link href="/login">
                        <button className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2">
                          <Vote className="w-4 h-4" />
                          Login to Vote
                        </button>
                      </Link>
                    }>
                      <button 
                        onClick={() => setVoteModal({ isOpen: true, battle })}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
                      >
                        <Vote className="w-4 h-4" />
                        Vote Now
                      </button>
                    </PrivateRoute>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Vote Modal */}
      <VoteModal
        isOpen={voteModal.isOpen}
        onClose={() => setVoteModal({ isOpen: false, battle: null })}
        battle={voteModal.battle}
        onVote={handleVote}
        isVoting={isVoting}
      />

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite 1s;
        }
      `}</style>
    </div>
  );
}