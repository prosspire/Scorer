"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Loader2, Trophy, Flame, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { getCardGameById, getGameRounds, createGameRound, scoreGameRound, getGamePenalties, addGamePenalty } from '@/lib/actions/card-games';

export default function GameScorecard({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [game, setGame] = useState<any>(null);
  const [rounds, setRounds] = useState<any[]>([]);
  const [penalties, setPenalties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Round State
  const [isCreatingRound, setIsCreatingRound] = useState(false);
  const [bids, setBids] = useState({ a: 5, b: 7, p3: 0, p4: 0 });

  // Score Active Round State
  const [scoringRound, setScoringRound] = useState<any>(null);
  const [results, setResults] = useState({
      a: { success: true, actual: 0 },
      b: { success: true, actual: 0 },
      p3: { success: true, actual: 0 },
      p4: { success: true, actual: 0 }
  });

  // Penalty Modal State
  const [isPenaltyModalOpen, setIsPenaltyModalOpen] = useState(false);
  const [penaltyTarget, setPenaltyTarget] = useState('team_a');
  const [penaltyPoints, setPenaltyPoints] = useState(5);
  const [penaltyReason, setPenaltyReason] = useState('');

  const fetchGameData = async () => {
    try {
      setIsLoading(true);
      const gameData = await getCardGameById(params.id);
      if (gameData) {
        setGame(gameData);
        const roundsData = await getGameRounds(params.id);
        setRounds(roundsData || []);
        const penaltiesData = await getGamePenalties(params.id);
        setPenalties(penaltiesData || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGameData();
  }, [params.id]);

  const isIndividual = game?.game_type === 'individual';
  const activeRound = rounds.find(r => !r.is_completed);
  const completedRounds = rounds.filter(r => r.is_completed);
  
  // Calculate Scores
  let totalScoreA = completedRounds.reduce((acc, r) => acc + (r.team_a_score || 0), 0) + penalties.filter(p => p.target_player === 'team_a').reduce((acc, p) => acc + p.points, 0);
  let totalScoreB = completedRounds.reduce((acc, r) => acc + (r.team_b_score || 0), 0) + penalties.filter(p => p.target_player === 'team_b').reduce((acc, p) => acc + p.points, 0);
  let totalScoreP3 = completedRounds.reduce((acc, r) => acc + (r.p3_score || 0), 0) + penalties.filter(p => p.target_player === 'p3').reduce((acc, p) => acc + p.points, 0);
  let totalScoreP4 = completedRounds.reduce((acc, r) => acc + (r.p4_score || 0), 0) + penalties.filter(p => p.target_player === 'p4').reduce((acc, p) => acc + p.points, 0);

  const players = isIndividual ? [
      { id: 'team_a', name: game?.team_a_name, score: totalScoreA, bidKey: 'a' as const },
      { id: 'team_b', name: game?.team_b_name, score: totalScoreB, bidKey: 'b' as const },
      { id: 'p3', name: game?.player3_name, score: totalScoreP3, bidKey: 'p3' as const },
      { id: 'p4', name: game?.player4_name, score: totalScoreP4, bidKey: 'p4' as const },
  ] : [
      { id: 'team_a', name: game?.team_a_name, score: totalScoreA, bidKey: 'a' as const },
      { id: 'team_b', name: game?.team_b_name, score: totalScoreB, bidKey: 'b' as const },
  ];

  const handleCreateRound = async () => {
    try {
        setIsSubmitting(true);
        setError(null);
        
        const isHighBid = bids.a >= 10 || bids.b >= 10 || (isIndividual && (bids.p3 >= 10 || bids.p4 >= 10));
        
        // If someone bid >= 10, force others to 0
        const finalBidA = (isHighBid && bids.a < 10) ? 0 : bids.a;
        const finalBidB = (isHighBid && bids.b < 10) ? 0 : bids.b;
        const finalBidP3 = isIndividual ? ((isHighBid && bids.p3 < 10) ? 0 : bids.p3) : null;
        const finalBidP4 = isIndividual ? ((isHighBid && bids.p4 < 10) ? 0 : bids.p4) : null;

        await createGameRound(params.id, finalBidA, finalBidB, finalBidP3, finalBidP4);
        await fetchGameData();
        setIsCreatingRound(false);
        setBids({ a: 5, b: 7, p3: 0, p4: 0 });
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create round');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleScoreRound = async () => {
      if (!scoringRound) return;

      try {
          setIsSubmitting(true);
          setError(null);
          
          const anyHighBid = scoringRound.team_a_bid >= 10 || scoringRound.team_b_bid >= 10 || (scoringRound.p3_bid !== null && scoringRound.p3_bid >= 10) || (scoringRound.p4_bid !== null && scoringRound.p4_bid >= 10);
          
          const buildResult = (bid: number, result: any) => {
              if (anyHighBid && bid < 10) return { hands: result.actual };
              return { success: result.success };
          };

          const tAR = buildResult(scoringRound.team_a_bid, results.a);
          const tBR = buildResult(scoringRound.team_b_bid, results.b);
          const p3R = isIndividual ? buildResult(scoringRound.p3_bid, results.p3) : undefined;
          const p4R = isIndividual ? buildResult(scoringRound.p4_bid, results.p4) : undefined;

          await scoreGameRound(scoringRound.id, params.id, tAR, tBR, p3R, p4R);
          await fetchGameData();
          setScoringRound(null);
          setResults({
              a: { success: true, actual: 0 },
              b: { success: true, actual: 0 },
              p3: { success: true, actual: 0 },
              p4: { success: true, actual: 0 }
          });
      } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to score round');
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleAddPenalty = async () => {
      try {
          setIsSubmitting(true);
          setError(null);
          await addGamePenalty(params.id, penaltyTarget, penaltyPoints, penaltyReason);
          await fetchGameData();
          setIsPenaltyModalOpen(false);
          setPenaltyReason('');
      } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to add penalty');
      } finally {
          setIsSubmitting(false);
      }
  };

  if (isLoading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-emerald-500" /></div>;
  if (!game) return <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white"><h1 className="text-2xl font-bold mb-4">Game not found</h1><Link href="/dashboard" className="text-emerald-400">Return to Dashboard</Link></div>;

  const totalCurrentBid = bids.a + bids.b + (isIndividual ? bids.p3 + bids.p4 : 0);
  const anyHighBidActive = bids.a >= 10 || bids.b >= 10 || (isIndividual && (bids.p3 >= 10 || bids.p4 >= 10));

  const isGameStarted = completedRounds.length > 0 || penalties.length > 0;
  const maxScore = Math.max(...players.map(p => p.score));

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-3 md:p-4 relative overflow-hidden">
        <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10">
            <div className="flex justify-between items-center mb-4">
                <Link href="/dashboard" className="inline-flex items-center text-neutral-400 hover:text-emerald-400 transition-colors text-sm group">
                    <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                    Back to Games
                </Link>
                <button 
                    onClick={() => setIsPenaltyModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20 flex items-center gap-1.5 hover:bg-red-500/20 transition-colors"
                >
                    <AlertTriangle className="w-3 h-3" />
                    Add Penalty
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-xs font-medium">
                    {error}
                </div>
            )}

            {/* Active Round Controls - Moved to Top */}
            {scoringRound ? (
                <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-2xl p-4 md:p-5 mb-6 animate-in fade-in slide-in-from-bottom-4">
                    <h3 className="text-lg md:text-xl font-bold text-white mb-1">Score Round {scoringRound.round_number}</h3>
                    <p className="text-emerald-400 mb-4 text-xs md:text-sm">Did the players achieve their bids?</p>
                    
                    <div className={`grid grid-cols-1 ${isIndividual ? 'md:grid-cols-2 gap-3' : 'md:grid-cols-2 gap-4'} mb-5`}>
                        {players.map((p) => {
                            const dbBidKey = p.bidKey === 'a' ? 'team_a_bid' : p.bidKey === 'b' ? 'team_b_bid' : `${p.bidKey}_bid`;
                            const bid = scoringRound[dbBidKey] || 0;
                            const anyHigh = scoringRound.team_a_bid >= 10 || scoringRound.team_b_bid >= 10 || scoringRound.p3_bid >= 10 || scoringRound.p4_bid >= 10;
                            const isCountingActuals = anyHigh && bid < 10;

                            return (
                                <div key={p.id} className="bg-neutral-900 rounded-xl p-4 border border-neutral-800 flex flex-col items-center">
                                    <label className="block text-sm font-bold text-neutral-300 mb-2 truncate max-w-full">{p.name}</label>
                                    
                                    {isCountingActuals ? (
                                        <>
                                            <span className="text-xs text-neutral-500 mb-2">Enter hands made</span>
                                            <input 
                                                type="range" min="0" max="13" 
                                                value={results[p.bidKey].actual}
                                                onChange={(e) => setResults(prev => ({ ...prev, [p.bidKey]: { ...prev[p.bidKey], actual: parseInt(e.target.value) } }))}
                                                className="w-full accent-emerald-500 mb-2 min-h-[36px]"
                                            />
                                            <div className="text-xl font-black text-center text-white">{results[p.bidKey].actual}</div>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-xs text-neutral-500 mb-3">Bid: {bid}</span>
                                            <div className="flex gap-2 w-full">
                                                <button 
                                                    onClick={() => setResults(prev => ({ ...prev, [p.bidKey]: { ...prev[p.bidKey], success: true } }))}
                                                    className={`flex-1 py-2 text-sm rounded-lg font-bold transition-all ${results[p.bidKey].success ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}
                                                >
                                                    Won
                                                </button>
                                                <button 
                                                    onClick={() => setResults(prev => ({ ...prev, [p.bidKey]: { ...prev[p.bidKey], success: false } }))}
                                                    className={`flex-1 py-2 text-sm rounded-lg font-bold transition-all ${!results[p.bidKey].success ? 'bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}
                                                >
                                                    Lost
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="flex gap-3">
                        <button 
                            onClick={handleScoreRound}
                            disabled={isSubmitting}
                            className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg py-2 text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Confirm Score'}
                        </button>
                        <button 
                            onClick={() => setScoringRound(null)}
                            disabled={isSubmitting}
                            className="px-6 bg-neutral-800 text-white rounded-lg py-2 text-sm font-bold hover:bg-neutral-700 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : activeRound ? (
                <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-2xl p-4 md:p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="text-base font-bold text-white mb-1">Round {activeRound.round_number} in progress</h3>
                        <div className="flex gap-3 mt-2">
                            {players.map(p => {
                                const dbBidKey = p.bidKey === 'a' ? 'team_a_bid' : p.bidKey === 'b' ? 'team_b_bid' : `${p.bidKey}_bid`;
                                return (
                                    <div key={p.id} className="flex flex-col">
                                        <span className="text-neutral-500 text-[10px] uppercase">{p.name}</span>
                                        <span className="text-emerald-400 font-bold text-sm">{activeRound[dbBidKey] || 0}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <button 
                        onClick={() => { setScoringRound(activeRound); setError(null); }}
                        className="bg-white text-black rounded-lg px-6 py-2 text-sm font-bold hover:bg-neutral-200 transition-all hover:scale-105 whitespace-nowrap"
                    >
                        Score Round
                    </button>
                </div>
            ) : isCreatingRound ? (
                <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-2xl p-4 md:p-5 mb-6 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg md:text-xl font-bold text-white mb-1">New Round Bids</h3>
                    <p className="text-neutral-400 text-xs mb-5">Ask hands for all players.</p>
                    
                    <div className={`grid grid-cols-2 ${isIndividual ? 'md:grid-cols-4' : ''} gap-3 md:gap-4 mb-5`}>
                        {players.map((p) => {
                            const isFaded = anyHighBidActive && bids[p.bidKey] < 10;
                            return (
                                <div key={p.id} className={`transition-opacity ${isFaded ? 'opacity-30 pointer-events-none' : ''}`}>
                                    <label className="block text-xs font-bold text-neutral-300 mb-1 truncate">{p.name}</label>
                                    <input 
                                        type="range" min="1" max="13" 
                                        value={isFaded ? 0 : bids[p.bidKey]}
                                        onChange={(e) => setBids(prev => ({ ...prev, [p.bidKey]: parseInt(e.target.value) }))}
                                        className="w-full accent-emerald-500 mb-1 min-h-[32px]"
                                    />
                                    <div className="text-2xl font-black text-center text-emerald-400">
                                        {isFaded ? '—' : bids[p.bidKey]}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-lg border border-neutral-800 mb-5">
                        <span className="text-xs font-bold text-neutral-400">Total Bid</span>
                        <span className={`text-lg font-black ${anyHighBidActive ? 'text-emerald-400' : totalCurrentBid <= 11 ? 'text-cyan-400' : 'text-emerald-400'}`}>
                            {anyHighBidActive ? 'High Bid' : totalCurrentBid}
                        </span>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={handleCreateRound}
                            disabled={isSubmitting}
                            className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg py-2 text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Start Round'}
                        </button>
                        <button 
                            onClick={() => { setIsCreatingRound(false); setError(null); }}
                            disabled={isSubmitting}
                            className="px-6 bg-neutral-800 text-white rounded-lg py-2 text-sm font-bold hover:bg-neutral-700 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <button 
                    onClick={() => { setIsCreatingRound(true); setError(null); }}
                    className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-3 mb-6 flex flex-row items-center justify-center gap-2 transition-all group"
                >
                    <Plus className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-all" />
                    <span className="font-bold text-emerald-400 text-sm">Start New Round</span>
                </button>
            )}

            {/* Scoreboard Header */}
            <div className="mb-6">
                <div className="flex flex-row justify-between items-center mb-3">
                    <h1 className="text-sm text-neutral-400 font-bold uppercase tracking-widest">Scoreboard</h1>
                    <div className="px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] md:text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        Round {rounds.length + 1}
                    </div>
                </div>

                <div className={`grid grid-cols-2 ${isIndividual ? 'md:grid-cols-4 gap-2 md:gap-3' : 'gap-3'} items-stretch justify-between`}>
                    {players.map((p, idx) => {
                        const isLeader = isGameStarted && p.score === maxScore;
                        return (
                            <div key={p.id} className={`flex flex-col text-center w-full rounded-2xl p-4 md:p-5 border relative overflow-hidden transition-all ${isLeader ? 'bg-gradient-to-b from-emerald-900/40 to-neutral-950 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-neutral-900/50 border-neutral-800'}`}>
                                {isLeader && (
                                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                                )}
                                <div className="flex items-center justify-center gap-1.5 mb-2 relative z-10">
                                    {isLeader && <Trophy className="w-3.5 h-3.5 text-emerald-400" />}
                                    <h2 className={`text-xs md:text-sm font-bold truncate ${isLeader ? 'text-emerald-400' : 'text-neutral-400'}`}>{p.name}</h2>
                                </div>
                                <div className={`text-2xl md:text-4xl font-black relative z-10 ${isLeader ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'text-neutral-300'}`}>
                                    {p.score}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Penalty Modal */}
            {isPenaltyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl w-full max-w-sm">
                        <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> Add Penalty</h3>
                        
                        <div className="space-y-3 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-neutral-400 mb-1">Select Player/Team</label>
                                <select 
                                    value={penaltyTarget} 
                                    onChange={(e) => setPenaltyTarget(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                                >
                                    {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-400 mb-1">Points to Deduct</label>
                                <input 
                                    type="number" min="1" max="100"
                                    value={penaltyPoints}
                                    onChange={(e) => setPenaltyPoints(parseInt(e.target.value) || 0)}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-400 mb-1">Reason (Optional)</label>
                                <input 
                                    type="text"
                                    value={penaltyReason}
                                    onChange={(e) => setPenaltyReason(e.target.value)}
                                    placeholder="e.g. Cheating, Wrong Card"
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={handleAddPenalty}
                                disabled={isSubmitting || penaltyPoints <= 0}
                                className="flex-1 bg-red-500 text-white rounded-lg py-2 text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Apply Penalty'}
                            </button>
                            <button 
                                onClick={() => setIsPenaltyModalOpen(false)}
                                className="px-5 bg-neutral-800 text-white rounded-lg py-2 text-sm font-bold hover:bg-neutral-700 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rounds & Penalties History */}
            <div className="bg-neutral-900/50 backdrop-blur-xl rounded-2xl border border-neutral-800 overflow-hidden">
                <div className="p-4 border-b border-neutral-800">
                    <h3 className="text-sm md:text-base font-bold flex items-center gap-2 text-white">
                        <Trophy className="w-4 h-4 text-emerald-400" />
                        Match History
                    </h3>
                </div>
                
                {completedRounds.length === 0 && penalties.length === 0 ? (
                    <div className="p-6 text-center text-neutral-500 text-sm font-medium">
                        No rounds or penalties yet.
                    </div>
                ) : (
                    <div className="divide-y divide-neutral-800/50">
                        {/* Render Penalties visually distinct */}
                        {penalties.map(p => {
                            const targetName = players.find(player => player.id === p.target_player)?.name || p.target_player;
                            return (
                                <div key={p.id} className="p-3 bg-red-950/20 hover:bg-red-950/40 transition-colors flex items-center justify-between border-l-4 border-red-500">
                                    <div>
                                        <div className="text-xs font-bold text-red-400 mb-0.5 flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3" /> Penalty: {targetName}
                                        </div>
                                        {p.reason && <div className="text-[10px] text-neutral-400">{p.reason}</div>}
                                    </div>
                                    <div className="text-lg font-black text-red-500">-{p.points}</div>
                                </div>
                            );
                        })}

                        {/* Render Rounds */}
                        {completedRounds.map((round) => (
                            <div key={round.id} className="p-4 hover:bg-neutral-800/30 transition-colors">
                                <div className="text-xs font-bold text-neutral-500 mb-3 uppercase tracking-wider">
                                    Round {round.round_number}
                                </div>
                                <div className={`grid grid-cols-2 ${isIndividual ? 'md:grid-cols-4' : ''} gap-3`}>
                                    {players.map(p => {
                                        const bidKey = p.bidKey === 'a' ? 'team_a_bid' : p.bidKey === 'b' ? 'team_b_bid' : `${p.bidKey}_bid`;
                                        const wonKey = p.bidKey === 'a' ? 'team_a_won' : p.bidKey === 'b' ? 'team_b_won' : `${p.bidKey}_won`;
                                        const scoreKey = p.bidKey === 'a' ? 'team_a_score' : p.bidKey === 'b' ? 'team_b_score' : `${p.bidKey}_score`;
                                        
                                        const anyHigh = round.team_a_bid >= 10 || round.team_b_bid >= 10 || round.p3_bid >= 10 || round.p4_bid >= 10;
                                        const isCountingActuals = anyHigh && round[bidKey] < 10;
                                        
                                        const score = round[scoreKey] || 0;
                                        
                                        return (
                                            <div key={p.id} className="flex flex-col gap-1">
                                                <div className="text-[10px] md:text-xs text-neutral-400 truncate">{p.name}</div>
                                                <div className="text-[10px] text-neutral-500">
                                                    Bid: {round[bidKey]} • {isCountingActuals ? <span className="text-cyan-400">{round[wonKey]} hands</span> : round[wonKey] === 1 ? <span className="text-emerald-500">Won</span> : <span className="text-red-500">Lost</span>}
                                                </div>
                                                <div className={`text-base md:text-lg font-black ${score > 0 ? 'text-emerald-400' : score < 0 ? 'text-red-400' : 'text-neutral-400'}`}>
                                                    {score > 0 ? '+' : ''}{score}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
