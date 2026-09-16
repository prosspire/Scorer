"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createCardGame } from '@/lib/actions/card-games';

export default function CreateGame() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [gameType, setGameType] = useState<'teams' | 'individual'>('teams');
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [player3, setPlayer3] = useState('');
  const [player4, setPlayer4] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamA.trim() || !teamB.trim() || (gameType === 'individual' && (!player3.trim() || !player4.trim()))) {
      setError("All required names must be filled.");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const game = await createCardGame({
        game_type: gameType,
        team_a_name: teamA.trim(),
        team_b_name: teamB.trim(),
        player3_name: gameType === 'individual' ? player3.trim() : undefined,
        player4_name: gameType === 'individual' ? player4.trim() : undefined,
      });
      
      router.push(`/dashboard/games/${game.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create game');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-6 relative overflow-hidden flex flex-col items-center justify-center">
        {/* Background Effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none" />
        
        <div className="w-full max-w-md relative z-10">
            <Link href="/dashboard" className="inline-flex items-center text-neutral-400 hover:text-emerald-400 transition-colors mb-6 md:mb-8 group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
            </Link>
            
            <div className="bg-neutral-900/80 backdrop-blur-xl p-5 md:p-8 rounded-3xl border border-neutral-800 shadow-2xl">
                <div className="flex items-center gap-4 mb-6 md:mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white">New Match</h1>
                        <p className="text-neutral-400 text-sm">Set up the teams</p>
                    </div>
                </div>

                <div className="flex gap-4 mb-8 p-1 bg-neutral-950 rounded-xl border border-neutral-800">
                    <button
                        onClick={() => setGameType('teams')}
                        className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${gameType === 'teams' ? 'bg-emerald-500 text-black shadow-lg' : 'text-neutral-400 hover:text-white'}`}
                    >
                        Teams (2v2)
                    </button>
                    <button
                        onClick={() => setGameType('individual')}
                        className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${gameType === 'individual' ? 'bg-emerald-500 text-black shadow-lg' : 'text-neutral-400 hover:text-white'}`}
                    >
                        Individual (4P)
                    </button>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 text-sm font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-neutral-300 mb-2">
                            {gameType === 'teams' ? 'Team A Name' : 'Player 1 Name'}
                        </label>
                        <input
                            type="text"
                            value={teamA}
                            onChange={(e) => setTeamA(e.target.value)}
                            placeholder={gameType === 'teams' ? "e.g. The Kings" : "Player 1"}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-neutral-600"
                            maxLength={20}
                        />
                    </div>
                    
                    {gameType === 'teams' && (
                        <div className="flex items-center justify-center py-2">
                            <div className="px-4 py-1 rounded-full bg-neutral-800 text-xs font-black text-neutral-500 border border-neutral-700">
                                VS
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-neutral-300 mb-2">
                            {gameType === 'teams' ? 'Team B Name' : 'Player 2 Name'}
                        </label>
                        <input
                            type="text"
                            value={teamB}
                            onChange={(e) => setTeamB(e.target.value)}
                            placeholder={gameType === 'teams' ? "e.g. The Aces" : "Player 2"}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-neutral-600"
                            maxLength={20}
                        />
                    </div>

                    {gameType === 'individual' && (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-neutral-300 mb-2">Player 3 Name</label>
                                <input
                                    type="text"
                                    value={player3}
                                    onChange={(e) => setPlayer3(e.target.value)}
                                    placeholder="Player 3"
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-neutral-600"
                                    maxLength={20}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-neutral-300 mb-2">Player 4 Name</label>
                                <input
                                    type="text"
                                    value={player4}
                                    onChange={(e) => setPlayer4(e.target.value)}
                                    placeholder="Player 4"
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-neutral-600"
                                    maxLength={20}
                                />
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting || !teamA.trim() || !teamB.trim()}
                        className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl py-4 font-bold text-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] mt-4"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                Starting...
                            </>
                        ) : (
                            'Start Game'
                        )}
                    </button>
                </form>
            </div>
        </div>
    </div>
  );
}
