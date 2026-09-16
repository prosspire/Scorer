"use client"
import { useState, useEffect } from 'react';
import { Trophy, Plus, Play, Loader2, AlertCircle, Users, LogOut, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser, userSession } from '@/lib/store/user';
import { getCardGames } from '@/lib/actions/card-games';
import { supabaseBrowser } from '@/lib/supabase/browser';

interface CardGame {
  id: string;
  creator_id: string;
  game_type?: 'teams' | 'individual';
  team_a_name: string;
  team_b_name: string;
  player3_name?: string;
  player4_name?: string;
  status: string;
  created_at: string;
  scores: {
    team_a: number;
    team_b: number;
    p3: number;
    p4: number;
  };
}

export default function Dashboard() {
  const [games, setGames] = useState<CardGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = useUser((state) => state.user);
  const setUser = useUser((state) => state.setUser);
  const setSession = userSession((state) => state.Setsession);
  const router = useRouter();

  const handleLogout = async () => {
      try {
          const supabase = supabaseBrowser();
          await supabase.auth.signOut();
          setUser(undefined);
          setSession(null);
          router.push('/');
      } catch (err) {
          console.error('Error logging out:', err);
      }
  };

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const gamesData = await getCardGames();
        setGames(gamesData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load games');
        console.error('Error fetching games:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
        fetchGames();
    }
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-6 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2">
                        My Card Games
                    </h1>
                    <p className="text-neutral-400 text-base md:text-lg">
                        Welcome back, {user?.email?.split('@')[0] || 'Player'}! Ready for a new match?
                    </p>
                </div>
                
                <div className="hidden md:flex flex-row gap-3">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-neutral-900 text-neutral-400 px-5 py-3 rounded-2xl font-bold hover:bg-neutral-800 hover:text-white transition-all shadow-lg"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                    <Link href="/dashboard/feedback">
                        <button className="flex items-center gap-2 bg-neutral-900 border border-emerald-500/50 text-emerald-400 px-6 py-3 rounded-2xl font-bold hover:bg-emerald-500/10 transition-all shadow-lg w-full sm:w-auto justify-center">
                            <MessageSquare className="w-5 h-5" />
                            Feedback
                        </button>
                    </Link>
                    <Link href="/dashboard/games/create">
                        <button className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-2xl font-bold hover:bg-neutral-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105 w-full sm:w-auto justify-center">
                            <Plus className="w-5 h-5" />
                            Create New Game
                        </button>
                    </Link>
                </div>
            </div>

            {/* Games List */}
            <div className="bg-neutral-900/50 backdrop-blur-2xl rounded-3xl border border-neutral-800 p-5 md:p-8 shadow-2xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4">
                    <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3">
                        <Trophy className="text-emerald-400 w-5 h-5 md:w-6 md:h-6" />
                        Recent Matches
                    </h2>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
                        <Loader2 className="w-10 h-10 animate-spin mb-4 text-emerald-500" />
                        <p className="font-medium">Loading your games...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 text-red-400 bg-red-950/20 rounded-2xl border border-red-900/50">
                        <AlertCircle className="w-10 h-10 mb-4" />
                        <p className="font-medium">{error}</p>
                    </div>
                ) : games.length === 0 ? (
                    <div className="text-center py-24 bg-neutral-950/50 rounded-2xl border border-neutral-800/50">
                        <Users className="w-16 h-16 text-neutral-600 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold text-neutral-300 mb-3">No games yet</h3>
                        <p className="text-neutral-500 mb-8 max-w-md mx-auto">Start your first 4-player team game and keep track of your scores like a pro.</p>
                        <Link href="/dashboard/games/create">
                            <button className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all hover:scale-105">
                                Start a Match
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {games.map((game) => (
                            <Link href={`/dashboard/games/${game.id}`} key={game.id}>
                                <div className="group bg-neutral-950 border border-neutral-800 hover:border-emerald-500/50 rounded-2xl p-6 transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] cursor-pointer transform hover:-translate-y-1">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                <Users className="w-5 h-5 text-emerald-400" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-emerald-500 tracking-wider uppercase mb-1">
                                                    {game.status === 'active' ? '● Active Game' : 'Completed'}
                                                </div>
                                                <div className="text-neutral-400 text-xs">
                                                    {new Date(game.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                                            <Play className="w-4 h-4 ml-1" />
                                        </div>
                                    </div>
                                    
                                    {game.game_type === 'individual' ? (
                                        <div className="flex flex-col gap-3 mt-4">
                                            <div className="grid grid-cols-4 text-center text-sm gap-2">
                                                <div className="bg-neutral-900 rounded-lg p-2 border border-neutral-800 flex flex-col items-center justify-center overflow-hidden">
                                                    <span className="font-bold text-white truncate w-full text-xs mb-1">{game.team_a_name}</span>
                                                    <span className={`font-black ${game.scores?.team_a > 0 ? 'text-emerald-400' : game.scores?.team_a < 0 ? 'text-red-400' : 'text-neutral-500'}`}>{game.scores?.team_a || 0}</span>
                                                </div>
                                                <div className="bg-neutral-900 rounded-lg p-2 border border-neutral-800 flex flex-col items-center justify-center overflow-hidden">
                                                    <span className="font-bold text-white truncate w-full text-xs mb-1">{game.team_b_name}</span>
                                                    <span className={`font-black ${game.scores?.team_b > 0 ? 'text-emerald-400' : game.scores?.team_b < 0 ? 'text-red-400' : 'text-neutral-500'}`}>{game.scores?.team_b || 0}</span>
                                                </div>
                                                <div className="bg-neutral-900 rounded-lg p-2 border border-neutral-800 flex flex-col items-center justify-center overflow-hidden">
                                                    <span className="font-bold text-white truncate w-full text-xs mb-1">{game.player3_name}</span>
                                                    <span className={`font-black ${game.scores?.p3 > 0 ? 'text-emerald-400' : game.scores?.p3 < 0 ? 'text-red-400' : 'text-neutral-500'}`}>{game.scores?.p3 || 0}</span>
                                                </div>
                                                <div className="bg-neutral-900 rounded-lg p-2 border border-neutral-800 flex flex-col items-center justify-center overflow-hidden">
                                                    <span className="font-bold text-white truncate w-full text-xs mb-1">{game.player4_name}</span>
                                                    <span className={`font-black ${game.scores?.p4 > 0 ? 'text-emerald-400' : game.scores?.p4 < 0 ? 'text-red-400' : 'text-neutral-500'}`}>{game.scores?.p4 || 0}</span>
                                                </div>
                                            </div>
                                            
                                            {(() => {
                                                if (!game.scores) return null;
                                                const players = [
                                                    { name: game.team_a_name, score: game.scores.team_a },
                                                    { name: game.team_b_name, score: game.scores.team_b },
                                                    { name: game.player3_name, score: game.scores.p3 },
                                                    { name: game.player4_name, score: game.scores.p4 },
                                                ];
                                                const maxScore = Math.max(...players.map(p => p.score));
                                                if (maxScore > 0) {
                                                    const winners = players.filter(p => p.score === maxScore);
                                                    return (
                                                        <div className="text-center text-xs text-emerald-400 font-bold bg-emerald-900/30 py-1.5 rounded-full border border-emerald-500/20 truncate px-2">
                                                            🏆 Leading: {winners.map(w => w.name).join(', ')} ({maxScore})
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-3 mt-4">
                                            <div className="flex items-center justify-between bg-neutral-900 rounded-xl p-4 border border-neutral-800">
                                                <div className="text-center flex-1 overflow-hidden">
                                                    <div className="font-bold text-sm text-white truncate max-w-[100px] mx-auto">{game.team_a_name}</div>
                                                    <div className={`font-black text-xl mt-1 ${game.scores?.team_a > 0 ? 'text-emerald-400' : game.scores?.team_a < 0 ? 'text-red-400' : 'text-neutral-500'}`}>{game.scores?.team_a || 0}</div>
                                                </div>
                                                <div className="px-4 py-1 rounded-full bg-neutral-800 text-xs font-black text-neutral-400 mx-2 shrink-0">
                                                    VS
                                                </div>
                                                <div className="text-center flex-1 overflow-hidden">
                                                    <div className="font-bold text-sm text-white truncate max-w-[100px] mx-auto">{game.team_b_name}</div>
                                                    <div className={`font-black text-xl mt-1 ${game.scores?.team_b > 0 ? 'text-emerald-400' : game.scores?.team_b < 0 ? 'text-red-400' : 'text-neutral-500'}`}>{game.scores?.team_b || 0}</div>
                                                </div>
                                            </div>
                                            
                                            {(() => {
                                                if (!game.scores) return null;
                                                if (game.scores.team_a > game.scores.team_b && game.scores.team_a > 0) {
                                                    return (
                                                        <div className="text-center text-xs text-emerald-400 font-bold bg-emerald-900/30 py-1.5 rounded-full border border-emerald-500/20 truncate px-2">
                                                            🏆 Leading: {game.team_a_name} ({game.scores.team_a})
                                                        </div>
                                                    );
                                                } else if (game.scores.team_b > game.scores.team_a && game.scores.team_b > 0) {
                                                    return (
                                                        <div className="text-center text-xs text-emerald-400 font-bold bg-emerald-900/30 py-1.5 rounded-full border border-emerald-500/20 truncate px-2">
                                                            🏆 Leading: {game.team_b_name} ({game.scores.team_b})
                                                        </div>
                                                    );
                                                } else if (game.scores.team_a === game.scores.team_b && game.scores.team_a > 0) {
                                                    return (
                                                        <div className="text-center text-xs text-cyan-400 font-bold bg-cyan-900/30 py-1.5 rounded-full border border-cyan-500/20 truncate px-2">
                                                            🤝 Tied ({game.scores.team_a})
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}