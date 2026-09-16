"use client"
import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Trophy, 
  Calendar,
  Clock,
  Share2,
  Eye,
  Vote,
  Crown,
  Instagram,
  Flame,
  Target,
  Activity,
  PieChart,
  ArrowUp,
  ArrowDown,
  Loader2,
  Filter,
  Download,
  RefreshCw,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/lib/store/user';
import { getBattleAnalytics } from '@/lib/actions/blog';
interface BattleAnalytics {
  id: string;
  title: string;
  participant_a_username: string;
  participant_b_username: string;
  participant_a_votes: number;
  participant_b_votes: number;
  total_votes: number;
  created_at: string;
  category: string;
  is_active: boolean;
  battle_votes: { created_at: string }[];
}

interface AnalyticsOverview {
  totalBattles: number;
  activeBattles: number;
  totalVotes: number;
  avgVotesPerBattle: number;
  totalEngagement: number;
  topCategory: string;
  winRate: number;
  peakVotingHour: string;
}

export default function BattleAnalytics() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [battles, setBattles] = useState<BattleAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);

  const user = useUser((state) => state.user);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const { data: analyticsData } = await getBattleAnalytics();
        
        if (analyticsData) {
          const formattedData = analyticsData.map(battle => ({
            ...battle,
            participant_a_username: battle.participant_a_username || 'Unknown',
            participant_b_username: battle.participant_b_username || 'Unknown'
          })) as BattleAnalytics[];
          setBattles(formattedData);
          
          // Calculate overview metrics
          const totalBattles = analyticsData.length;
          const activeBattles = analyticsData.filter(b => b.is_active).length;
          const totalVotes = analyticsData.reduce((sum, b) => sum + b.total_votes, 0);
          const avgVotesPerBattle = totalBattles > 0 ? Math.round(totalVotes / totalBattles) : 0;
          
          // Category analysis
          const categoryCount = analyticsData.reduce((acc, b) => {
            acc[b.category] = (acc[b.category] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          const topCategory = Object.entries(categoryCount).sort(([,a], [,b]) => b - a)[0]?.[0] || 'general';
          
          // Win rate calculation (battles where participant A has more votes)
          const wins = analyticsData.filter(b => b.participant_a_votes > b.participant_b_votes).length;
          const winRate = totalBattles > 0 ? Math.round((wins / totalBattles) * 100) : 0;
          
          // Peak voting hour analysis
          const votingHours = analyticsData.flatMap(b => 
            b.battle_votes?.map(v => new Date(v.created_at).getHours()) || []
          );
          const hourCounts = votingHours.reduce((acc, hour) => {
            acc[hour] = (acc[hour] || 0) + 1;
            return acc;
          }, {} as Record<number, number>);
          const peakHour = Object.entries(hourCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || '12';
          const peakVotingHour = `${peakHour}:00`;
          
          setAnalytics({
            totalBattles,
            activeBattles,
            totalVotes,
            avgVotesPerBattle,
            totalEngagement: totalVotes * 4.2, // Estimated engagement
            topCategory,
            winRate,
            peakVotingHour
          });
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [user?.id, timeRange]);

  // Get voting trend data for charts
  const getVotingTrend = () => {
    const last7Days = Array.from({length: 7}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        votes: Math.floor(Math.random() * 200) + 50 // Mock data - replace with real calculations
      };
    }).reverse();
    return last7Days;
  };

  // Get category performance
const getCategoryPerformance = () => {
  const categories = battles.reduce((acc, battle) => {
    const category = battle.category || "uncategorized";

    if (!acc[category]) {
      acc[category] = { battles: 0, votes: 0 };
    }

    acc[category]!.battles++;
    acc[category]!.votes += battle.total_votes || 0;

    return acc;
  }, {} as Record<string, { battles: number; votes: number }>);

  return Object.entries(categories).map(([category, data]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    battles: data.battles,
    votes: data.votes,
    avgVotes: data.battles ? Math.round(data.votes / data.battles) : 0,
  }));
};


  const overviewStats = [
    {
      title: "Total Battles",
      value: analytics?.totalBattles || 0,
      change: "+12%",
      positive: true,
      icon: Trophy,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Total Votes",
      value: analytics?.totalVotes?.toLocaleString() || "0",
      change: "+24%",
      positive: true,
      icon: Vote,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Avg Votes/Battle",
      value: analytics?.avgVotesPerBattle || 0,
      change: "+8%",
      positive: true,
      icon: Target,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Win Rate",
      value: `${analytics?.winRate || 0}%`,
      change: "-3%",
      positive: false,
      icon: Crown,
      color: "from-yellow-500 to-orange-500"
    }
  ];

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
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="absolute bottom-32 left-20 animate-bounce-slow">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-xl">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="absolute top-1/2 left-10 animate-pulse">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl">
            <Activity className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-black/80 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl hover:scale-105 transition-transform">
                <BarChart3 className="w-7 h-7 text-white" />
              </Link>
              <div>
                <h1 className="text-3xl font-black text-white">Analytics</h1>
                <p className="text-gray-400">Battle performance insights</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Time Range Selector */}
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="7d" className="bg-gray-900">Last 7 days</option>
                <option value="30d" className="bg-gray-900">Last 30 days</option>
                <option value="90d" className="bg-gray-900">Last 90 days</option>
                <option value="all" className="bg-gray-900">All time</option>
              </select>
              
              <button className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all">
                <RefreshCw className="w-5 h-5" />
              </button>
              
              <button className="bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 rounded-xl font-medium hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-xl">Loading analytics...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {overviewStats.map((stat, index) => (
                <div key={index} className="bg-black/60 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-medium ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>
                      {stat.positive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                      {stat.change}
                    </div>
                  </div>
                  
                  <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                  <div className="text-gray-400 text-sm">{stat.title}</div>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              
              {/* Voting Trend Chart */}
              <div className="bg-black/60 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Voting Trends</h3>
                    <p className="text-gray-400 text-sm">Daily vote patterns</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                </div>
                
                {/* Simple Bar Chart */}
                <div className="space-y-4">
                  {getVotingTrend().map((day, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-12 text-gray-400 text-sm">{day.date}</div>
                      <div className="flex-1 bg-gray-800 rounded-full h-3 relative overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-1000"
                          style={{ width: `${(day.votes / 250) * 100}%` }}
                        ></div>
                      </div>
                      <div className="w-12 text-white text-sm font-medium">{day.votes}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Performance */}
              <div className="bg-black/60 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Category Performance</h3>
                    <p className="text-gray-400 text-sm">Battle success by category</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <PieChart className="w-5 h-5 text-white" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  {getCategoryPerformance().map((category, index) => (
                    <div key={index} className="bg-gradient-to-r from-gray-900/50 to-black/50 rounded-2xl p-4 border border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-white">{category.category}</div>
                        <div className="text-gray-400 text-sm">{category.battles} battles</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-blue-400">{category.avgVotes}</div>
                        <div className="text-gray-400 text-sm">avg votes</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Performing Battles */}
            <div className="bg-black/60 backdrop-blur-xl rounded-3xl border border-white/10 mb-8">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">Top Performing Battles</h3>
                    <p className="text-gray-400">Your most successful showdowns</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {battles
                    .sort((a, b) => b.total_votes - a.total_votes)
                    .slice(0, 5)
                    .map((battle, index) => (
                    <div key={battle.id} className="bg-gradient-to-r from-gray-900/80 to-black/80 rounded-2xl p-6 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-sm">
                            #{index + 1}
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-white">
                              @{battle.participant_a_username} vs @{battle.participant_b_username}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span className="capitalize">{battle.category}</span>
                              <span>{new Date(battle.created_at).toLocaleDateString()}</span>
                              <span className={battle.is_active ? 'text-green-400' : 'text-gray-400'}>
                                {battle.is_active ? 'Active' : 'Completed'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6 text-right">
                          <div>
                            <div className="text-2xl font-bold text-white">{battle.total_votes}</div>
                            <div className="text-gray-400 text-sm">Total Votes</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-red-400">{battle.participant_a_votes}</div>
                            <div className="text-red-300 text-xs">RED</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-blue-400">{battle.participant_b_votes}</div>
                            <div className="text-blue-300 text-xs">BLUE</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Insights & Recommendations */}
            <div className="bg-black/60 backdrop-blur-xl rounded-3xl border border-white/10">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">Insights & Recommendations</h3>
                    <p className="text-gray-400">AI-powered suggestions to boost your battles</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Clock className="w-6 h-6 text-purple-400" />
                      <h4 className="font-bold text-white">Best Posting Time</h4>
                    </div>
                    <p className="text-gray-300 mb-2">
                      Your battles get the most votes around <span className="text-purple-400 font-bold">{analytics?.peakVotingHour}</span>
                    </p>
                    <p className="text-gray-400 text-sm">
                      Consider creating battles during peak engagement hours for maximum visibility.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Target className="w-6 h-6 text-blue-400" />
                      <h4 className="font-bold text-white">Top Category</h4>
                    </div>
                    <p className="text-gray-300 mb-2">
                      <span className="text-blue-400 font-bold capitalize">{analytics?.topCategory}</span> battles perform best for you
                    </p>
                    <p className="text-gray-400 text-sm">
                      Focus more on this category to maximize engagement and votes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

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