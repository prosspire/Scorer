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
  Copy,
  Check,
  Calendar,
  Target,
  ArrowLeft,
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  Facebook,
  Twitter,
  Link as LinkIcon
} from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/lib/store/user';
import { castVote , getUserVote } from '@/lib/actions/blog';
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
  creator: string;
  voting_enabled: boolean;
  battle_duration: string;
}

interface BattleContentProps {
  battle: Battle;
  isActive: boolean;
  hasEnded: boolean;
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  battle: Battle;
}

const ShareModal = ({ isOpen, onClose, battle }: ShareModalProps) => {
  const [copied, setCopied] = useState(false);
  
  if (!isOpen) return null;

  const battleUrl = `${window.location.origin}/battle/${battle.slug}`;
  const battleTitle = `${battle.participant_a_username} VS ${battle.participant_b_username}`;
  const shareText = `Check out this epic Instagram battle: ${battleTitle} on Famosa! ${battle.total_votes} votes and counting!`;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(battleUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(battleUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(battleUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${battleUrl}`)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(battleUrl)}&text=${encodeURIComponent(shareText)}`
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl border border-white/20 max-w-md w-full shadow-2xl">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Share Battle</h3>
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
            <h4 className="font-semibold text-white mb-2">{battleTitle}</h4>
            <p className="text-gray-400 text-sm">{battle.total_votes} votes • {battle.category}</p>
          </div>
          
          {/* Copy URL */}
          <div className="mb-6">
            <label className="text-gray-300 text-sm font-medium mb-2 block">Battle URL</label>
            <div className="flex items-center gap-2 p-3 bg-gray-800 rounded-xl border border-gray-700">
              <input 
                type="text" 
                value={battleUrl}
                readOnly
                className="flex-1 bg-transparent text-white text-sm focus:outline-none"
              />
              <button
                onClick={copyToClipboard}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
          </div>
          
          {/* Social Share Buttons */}
          <div className="space-y-3">
            <p className="text-gray-300 text-sm font-medium">Share on social media</p>
            <div className="grid grid-cols-2 gap-3">
              <a
                href={shareLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-blue-500/20 border border-blue-500/30 rounded-xl hover:bg-blue-500/30 transition-colors"
              >
                <Twitter className="w-5 h-5 text-blue-400" />
                <span className="text-blue-300 font-medium">Twitter</span>
              </a>
              
              <a
                href={shareLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-blue-600/20 border border-blue-600/30 rounded-xl hover:bg-blue-600/30 transition-colors"
              >
                <Facebook className="w-5 h-5 text-blue-400" />
                <span className="text-blue-300 font-medium">Facebook</span>
              </a>
              
              <a
                href={shareLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-green-500/20 border border-green-500/30 rounded-xl hover:bg-green-500/30 transition-colors"
              >
                <LinkIcon className="w-5 h-5 text-green-400" />
                <span className="text-green-300 font-medium">WhatsApp</span>
              </a>
              
              <a
                href={shareLinks.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-cyan-500/20 border border-cyan-500/30 rounded-xl hover:bg-cyan-500/30 transition-colors"
              >
                <LinkIcon className="w-5 h-5 text-cyan-400" />
                <span className="text-cyan-300 font-medium">Telegram</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function BattleContent({ battle, isActive, hasEnded }: BattleContentProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVoting, setIsVoting] = useState(false);
  const [userVote, setUserVote] = useState<'A' | 'B' | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [shareModal, setShareModal] = useState(false);
  const [battleData, setBattleData] = useState(battle);

  const user = useUser((state) => state.user);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Check user's existing vote
  useEffect(() => {
    const checkUserVote = async () => {
      if (user?.id) {
        try {
          const { data: vote } = await getUserVote(battle.id, user.id);
          if (vote) {
            setUserVote(vote.voted_for as 'A' | 'B');
          }
        } catch (error) {
          console.error('Error checking user vote:', error);
        }
      }
    };

    checkUserVote();
  }, [user?.id, battle.id]);

  const handleVote = async (participant: 'A' | 'B') => {
    if (!user?.id) {
      setNotification({ message: 'Please login to vote', type: 'error' });
      return;
    }

    if (!isActive) {
      setNotification({ message: 'This battle has ended', type: 'error' });
      return;
    }

    if (userVote) {
      setNotification({ message: 'You have already voted in this battle', type: 'error' });
      return;
    }

    try {
      setIsVoting(true);
      const result = await castVote(battle.id, participant, user.id);
      
      if (result.error) {
        setNotification({ message: result.error.message, type: 'error' });
      } else {
        setNotification({ message: 'Vote cast successfully!', type: 'success' });
        setUserVote(participant);
        
        // Update battle data optimistically
        setBattleData(prev => ({
          ...prev,
          participant_a_votes: participant === 'A' ? prev.participant_a_votes + 1 : prev.participant_a_votes,
          participant_b_votes: participant === 'B' ? prev.participant_b_votes + 1 : prev.participant_b_votes,
          total_votes: prev.total_votes + 1
        }));
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

    if (diff <= 0) return 'Battle Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const getWinnerInfo = () => {
    if (battleData.participant_a_votes > battleData.participant_b_votes) {
      return { winner: 'A', name: battleData.participant_a_username, color: 'red' };
    } else if (battleData.participant_b_votes > battleData.participant_a_votes) {
      return { winner: 'B', name: battleData.participant_b_username, color: 'blue' };
    }
    return { winner: 'tie', name: 'Tied', color: 'purple' };
  };

  // Show notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const winnerInfo = getWinnerInfo();

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

      {/* Header */}
      <div className="relative z-10 bg-black/80 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/battles" className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <ArrowLeft className="md:w-6 md:h-6 h-4 w-4 text-gray-400 hover:text-white" />
              </Link>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Crown className="md:w-7 md:h-7 w-6 h-4 text-white" />
              </div>
              <div>
                <h1 className=" text-sm md:text-2xl font-black text-white">{battleData.title}</h1>
                <div className="flex items-center gap-4 text-gray-400 text-sm">
                  <span className="capitalize">{battleData.category}</span>
                  <span>•</span>
                  <span>{new Date(battleData.created_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <div className={`flex items-center gap-1 ${isActive ? 'text-green-400' : 'text-red-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                    {isActive ? 'LIVE' : 'ENDED'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShareModal(true)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl font-medium transition-all"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              
              <div className="text-right">
                <div className="text-lg font-bold text-white">{battleData.total_votes}</div>
                <div className="text-gray-400 text-sm">Total Votes</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Battle Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        
        {/* Battle Description */}
        <div className="text-center mb-12">
          <p className="text-sm md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {battleData.description}
          </p>
        </div>

        {/* Main Battle Arena */}
        <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl mb-8">
          
          {/* Battle Status */}
          <div className="text-center mb-8">
            {hasEnded ? (
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-gray-600/20 to-gray-700/20 border border-gray-600/30 rounded-full px-6 py-3">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-bold">
                  {winnerInfo.winner === 'tie' ? 'Battle Tied!' : `${winnerInfo.name} Wins!`}
                </span>
                <div className="text-gray-400 text-sm">Battle Ended</div>
              </div>
            ) : (
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full px-6 py-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-bold">LIVE BATTLE</span>
                <div className="text-gray-300 text-sm">{formatTimeRemaining(battleData.ends_at)}</div>
              </div>
            )}
          </div>

          {/* Battle Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
            
            {/* Participant A */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-3xl p-8 border-2 border-red-500/30 hover:border-red-400/50 transition-all">
                <div className="text-center">
                  <div className="relative mb-6 inline-block">
                    <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl mx-auto">
                      {battleData.participant_a_image ? (
                        <img 
                          src={battleData.participant_a_image} 
                          alt={battleData.participant_a_username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <Users className="w-12 h-12 text-white" />
                      )}
                    </div>
                    <div className="absolute -top-2 -right-2 bg-red-500 rounded-full px-3 py-1 text-sm font-bold text-white">
                      RED
                    </div>
                    {userVote === 'A' && (
                      <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">@{battleData.participant_a_username}</h3>
                  <div className="flex items-center justify-center gap-2 text-gray-300 mb-6">
                    <Instagram className="w-5 h-5 text-red-400" />
                    <span>{battleData.participant_a_followers} followers</span>
                  </div>
                  
                  <div className="text-center mb-6">
                    <div className="text-5xl font-black text-red-400 mb-2">{battleData.participant_a_votes}</div>
                    <div className="text-red-300 font-medium">VOTES</div>
                    <div className="mt-3">
                      <div className="text-lg text-white">
                        {battleData.total_votes > 0 
                          ? `${Math.round((battleData.participant_a_votes / battleData.total_votes) * 100)}%`
                          : '0%'
                        }
                      </div>
                      <div className="w-full bg-red-900/50 rounded-full h-3 mt-2">
                        <div 
                          className="bg-gradient-to-r from-red-500 to-pink-500 h-3 rounded-full transition-all duration-1000"
                          style={{ 
                            width: `${battleData.total_votes > 0 ? (battleData.participant_a_votes / battleData.total_votes) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {isActive && (
                    <PrivateRoute fallback={
                      <Link href="/login">
                        <button className="w-full bg-gradient-to-r from-red-500 to-pink-500 py-4 rounded-2xl font-bold text-lg hover:from-red-600 hover:to-pink-600 transition-all">
                          Login to Vote Red
                        </button>
                      </Link>
                    }>
                      <button 
                        onClick={() => handleVote('A')}
                        disabled={isVoting || !!userVote}
                        className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
                          userVote === 'A'
                            ? 'bg-green-500 text-white cursor-default'
                            : userVote === 'B'
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white'
                        }`}
                      >
                        {isVoting ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Voting...
                          </div>
                        ) : userVote === 'A' ? (
                          <div className="flex items-center justify-center gap-2">
                            <Check className="w-5 h-5" />
                            You Voted Red
                          </div>
                        ) : userVote === 'B' ? (
                          'Already Voted Blue'
                        ) : (
                          'Vote Red Team'
                        )}
                      </button>
                    </PrivateRoute>
                  )}
                </div>
              </div>
            </div>

            {/* VS Section */}
            <div className="lg:col-span-1 flex flex-col items-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center font-black text-2xl shadow-2xl animate-pulse">
                  VS
                </div>
                <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full animate-ping opacity-20"></div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{battleData.total_votes}</div>
                <div className="text-gray-400 text-sm mb-4">Total Votes</div>
                
                {/* Battle Progress Bar */}
                <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-pink-500 h-full transition-all duration-1000 rounded-full"
                    style={{ 
                      width: `${battleData.total_votes > 0 ? (battleData.participant_a_votes / battleData.total_votes) * 100 : 50}%` 
                    }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>RED</span>
                  <span>BLUE</span>
                </div>
              </div>
            </div>

            {/* Participant B */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-3xl p-8 border-2 border-blue-500/30 hover:border-blue-400/50 transition-all">
                <div className="text-center">
                  <div className="relative mb-6 inline-block">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl mx-auto">
                      {battleData.participant_b_image ? (
                        <img 
                          src={battleData.participant_b_image} 
                          alt={battleData.participant_b_username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <Users className="w-12 h-12 text-white" />
                      )}
                    </div>
                    <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full px-3 py-1 text-sm font-bold text-white">
                      BLUE
                    </div>
                    {userVote === 'B' && (
                      <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">@{battleData.participant_b_username}</h3>
                  <div className="flex items-center justify-center gap-2 text-gray-300 mb-6">
                    <Instagram className="w-5 h-5 text-blue-400" />
                    <span>{battleData.participant_b_followers} followers</span>
                  </div>
                  
                  <div className="text-center mb-6">
                    <div className="text-5xl font-black text-blue-400 mb-2">{battleData.participant_b_votes}</div>
                    <div className="text-blue-300 font-medium">VOTES</div>
                    <div className="mt-3">
                      <div className="text-lg text-white">
                        {battleData.total_votes > 0 
                          ? `${Math.round((battleData.participant_b_votes / battleData.total_votes) * 100)}%`
                          : '0%'
                        }
                      </div>
                      <div className="w-full bg-blue-900/50 rounded-full h-3 mt-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-1000"
                          style={{ 
                            width: `${battleData.total_votes > 0 ? (battleData.participant_b_votes / battleData.total_votes) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {isActive && (
                    <PrivateRoute fallback={
                      <Link href="/login">
                        <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 py-4 rounded-2xl font-bold text-lg hover:from-blue-600 hover:to-cyan-600 transition-all">
                          Login to Vote Blue
                        </button>
                      </Link>
                    }>
                      <button 
                        onClick={() => handleVote('B')}
                        disabled={isVoting || !!userVote}
                        className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
                          userVote === 'B'
                            ? 'bg-green-500 text-white cursor-default'
                            : userVote === 'A'
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white'
                        }`}
                      >
                        {isVoting ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Voting...
                          </div>
                        ) : userVote === 'B' ? (
                          <div className="flex items-center justify-center gap-2">
                            <Check className="w-5 h-5" />
                            You Voted Blue
                          </div>
                        ) : userVote === 'A' ? (
                          'Already Voted Red'
                        ) : (
                          'Vote Blue Team'
                        )}
                      </button>
                    </PrivateRoute>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Battle Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Vote className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{battleData.total_votes}</div>
            <div className="text-gray-400 text-sm">Total Votes</div>
          </div>
          
          <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{formatTimeRemaining(battleData.ends_at).split(' ')[0]}</div>
            <div className="text-gray-400 text-sm">{formatTimeRemaining(battleData.ends_at).split(' ').slice(1).join(' ')}</div>
          </div>
          
          <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{Math.round(battleData.total_votes * 4.2)}</div>
            <div className="text-gray-400 text-sm">Est. Views</div>
          </div>
          
          <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white mb-1 capitalize">{battleData.category}</div>
            <div className="text-gray-400 text-sm">Category</div>
          </div>
        </div>

        {/* Battle Info */}
        <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6">Battle Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-300 mb-4">Battle Details</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Created:</span>
                  <span className="text-white">{new Date(battleData.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Duration:</span>
                  <span className="text-white">{battleData.battle_duration} hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={isActive ? 'text-green-400' : 'text-red-400'}>
                    {isActive ? 'Active' : 'Ended'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Voting:</span>
                  <span className={battleData.voting_enabled ? 'text-green-400' : 'text-red-400'}>
                    {battleData.voting_enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-300 mb-4">Quick Actions</h4>
              <div className="space-y-3">
                <button
                  onClick={() => setShareModal(true)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Share Battle
                </button>
                
                <Link href="/battles">
                  <button className="w-full bg-white/10 hover:bg-white/20 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Browse More Battles
                  </button>
                </Link>
                
                <Link href="/dashboard/battle/create">
                  <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center justify-center gap-2">
                    <Crown className="w-5 h-5" />
                    Create Your Battle
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModal}
        onClose={() => setShareModal(false)}
        battle={battleData}
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