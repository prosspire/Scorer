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

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-6 relative overflow-hidden">
        <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10">
            <Link href="/dashboard" className="inline-flex items-center text-neutral-400 hover:text-emerald-400 transition-colors mb-6 md:mb-8 group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Games
            </Link>

            {/* Scoreboard Header */}
            <div className="bg-neutral-900/50 backdrop-blur-2xl rounded-3xl border border-neutral-800 p-5 md:p-8 shadow-2xl mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <h1 className="text-xl text-neutral-400 font-bold uppercase tracking-widest">Scoreboard</h1>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => setIsPenaltyModalOpen(true)}
                            className="px-4 py-1 rounded-full bg-red-500/20 text-red-400 text-sm font-bold border border-red-500/30 flex items-center gap-2 hover:bg-red-500/30 transition-colors"
                        >
                            <AlertTriangle className="w-4 h-4" />
                            Penalty
                        </button>
                        <div className="px-4 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-bold border border-emerald-500/30 flex items-center gap-2">
                            <Flame className="w-4 h-4" />
                            Round {rounds.length + 1}
                        </div>
                    </div>
                </div>

                <div className={`grid grid-cols-2 ${isIndividual ? 'md:grid-cols-4 gap-3 md:gap-4' : 'gap-4 md:gap-8'} items-center justify-between`}>
                    {players.map((p, idx) => (
                        <div key={p.id} className="flex-1 text-center w-full bg-neutral-950 rounded-2xl p-4 md:p-6 border border-neutral-800 relative overflow-hidden">
                            <h2 className="text-sm md:text-xl font-black text-white mb-2 truncate">{p.name}</h2>
                            <div className="text-2xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-emerald-400 to-cyan-400">
                                {p.score}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-8 text-sm font-medium">
                    {error}
                </div>
            )}

            {/* Penalty Modal */}
            {isPenaltyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-neutral-900 border border-neutral-800 p-5 md:p-8 rounded-3xl w-full max-w-md">
                        <h3 className="text-xl md:text-2xl font-bold text-red-400 mb-6 flex items-center gap-2"><AlertTriangle /> Add Penalty</h3>
                        
                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="block text-sm font-bold text-neutral-400 mb-2">Select Player/Team</label>
                                <select 
                                    value={penaltyTarget} 
                                    onChange={(e) => setPenaltyTarget(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                                >
                                    {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-neutral-400 mb-2">Points to Deduct</label>
                                <input 
                                    type="number" min="1" max="100"
                                    value={penaltyPoints}
                                    onChange={(e) => setPenaltyPoints(parseInt(e.target.value) || 0)}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-neutral-400 mb-2">Reason (Optional)</label>
                                <input 
                                    type="text"
                                    value={penaltyReason}
                                    onChange={(e) => setPenaltyReason(e.target.value)}
                                    placeholder="e.g. Cheating, Wrong Card"
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button 
                                onClick={handleAddPenalty}
                                disabled={isSubmitting || penaltyPoints <= 0}
                                className="flex-1 bg-red-500 text-white rounded-xl py-3 font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Apply Penalty'}
                            </button>
                            <button 
                                onClick={() => setIsPenaltyModalOpen(false)}
                                className="px-6 bg-neutral-800 text-white rounded-xl py-3 font-bold hover:bg-neutral-700 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Active Round Controls */}
            {scoringRound ? (
                <div className="bg-neutral-900/50 backdrop-blur-2xl border border-neutral-800 rounded-3xl p-5 md:p-8 mb-8 animate-in fade-in slide-in-from-bottom-4">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-6">Score Round {scoringRound.round_number}</h3>
                    <p className="text-emerald-400 mb-6 md:mb-8 text-sm md:text-base">Did the players achieve their bids?</p>
                    
                    <div className={`grid grid-cols-1 ${isIndividual ? 'md:grid-cols-2 gap-4' : 'md:grid-cols-2 gap-8'} mb-8`}>
                        {players.map((p) => {
                            const dbBidKey = p.bidKey === 'a' ? 'team_a_bid' : p.bidKey === 'b' ? 'team_b_bid' : `${p.bidKey}_bid`;
                            const bid = scoringRound[dbBidKey] || 0;
                            const anyHigh = scoringRound.team_a_bid >= 10 || scoringRound.team_b_bid >= 10 || scoringRound.p3_bid >= 10 || scoringRound.p4_bid >= 10;
                            const isCountingActuals = anyHigh && bid < 10;

                            return (
                                <div key={p.id} className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800 flex flex-col items-center">
                                    <label className="block text-lg font-bold text-neutral-300 mb-2 truncate max-w-full">{p.name}</label>
                                    
                                    {isCountingActuals ? (
                                        <>
                                            <span className="text-sm text-neutral-500 mb-6">Enter hands made</span>
                                            <input 
                                                type="range" min="0" max="13" 
                                                value={results[p.bidKey].actual}
                                                onChange={(e) => setResults(prev => ({ ...prev, [p.bidKey]: { ...prev[p.bidKey], actual: parseInt(e.target.value) } }))}
                                                className="w-full accent-emerald-500 mb-4 min-h-[44px]"
                                            />
                                            <div className="text-3xl font-black text-center text-white">{results[p.bidKey].actual}</div>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-sm text-neutral-500 mb-6">Bid: {bid}</span>
                                            <div className="flex gap-4 w-full">
                                                <button 
                                                    onClick={() => setResults(prev => ({ ...prev, [p.bidKey]: { ...prev[p.bidKey], success: true } }))}
                                                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${results[p.bidKey].success ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}
                                                >
                                                    Won
                                                </button>
                                                <button 
                                                    onClick={() => setResults(prev => ({ ...prev, [p.bidKey]: { ...prev[p.bidKey], success: false } }))}
                                                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${!results[p.bidKey].success ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}
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
                    
                    <div className="flex gap-4">
                        <button 
                            onClick={handleScoreRound}
                            disabled={isSubmitting}
                            className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl py-4 font-bold hover:opacity-90 transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm Score'}
                        </button>
                        <button 
                            onClick={() => setScoringRound(null)}
                            disabled={isSubmitting}
                            className="px-8 bg-neutral-800 text-white rounded-xl py-4 font-bold hover:bg-neutral-700 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : activeRound ? (
                <div className="bg-neutral-900/50 backdrop-blur-2xl border border-neutral-800 rounded-3xl p-5 md:p-8 mb-8 flex flex-col items-center justify-center">
                    <h3 className="text-xl font-bold text-white mb-2">Round {activeRound.round_number} is in progress!</h3>
                    <p className="text-neutral-400 mb-6">Play the round. When finished, input the scores.</p>
                    <div className={`grid grid-cols-2 ${isIndividual ? 'md:grid-cols-4' : ''} gap-4 mb-8 text-center bg-neutral-950 px-6 py-4 rounded-xl border border-neutral-800 w-full`}>
                        {players.map(p => {
                            const dbBidKey = p.bidKey === 'a' ? 'team_a_bid' : p.bidKey === 'b' ? 'team_b_bid' : `${p.bidKey}_bid`;
                            return (
                                <div key={p.id} className="flex flex-col">
                                    <span className="text-neutral-500 text-xs truncate">{p.name}</span>
                                    <span className="text-emerald-400 font-black text-xl">{activeRound[dbBidKey] || 0}</span>
                                </div>
                            );
                        })}
                    </div>
                    <button 
                        onClick={() => { setScoringRound(activeRound); setError(null); }}
                        className="bg-white text-black rounded-xl px-8 py-3 font-bold hover:bg-neutral-200 transition-all hover:scale-105"
                    >
                        Score Round
                    </button>
                </div>
            ) : isCreatingRound ? (
                <div className="bg-neutral-900/50 backdrop-blur-2xl border border-neutral-800 rounded-3xl p-5 md:p-8 mb-8 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2">New Round Bids</h3>
                    <p className="text-neutral-400 mb-8">Ask hands for all players. If total is 11 or less, round instantly completes and all win their bids.</p>
                    
                    <div className={`grid grid-cols-1 ${isIndividual ? 'md:grid-cols-2 lg:grid-cols-4 gap-4' : 'md:grid-cols-2 gap-8'} mb-8`}>
                        {players.map((p) => {
                            const isFaded = anyHighBidActive && bids[p.bidKey] < 10;
                            return (
                                <div key={p.id} className={`transition-opacity ${isFaded ? 'opacity-30 pointer-events-none' : ''}`}>
                                    <label className="block text-sm font-bold text-neutral-300 mb-2 truncate">{p.name}</label>
                                    <input 
                                        type="range" min="1" max="13" 
                                        value={isFaded ? 0 : bids[p.bidKey]}
                                        onChange={(e) => setBids(prev => ({ ...prev, [p.bidKey]: parseInt(e.target.value) }))}
                                        className="w-full accent-emerald-500 mb-2 min-h-[44px]"
                                    />
                                    <div className="text-4xl font-black text-center text-emerald-400">
                                        {isFaded ? '—' : bids[p.bidKey]}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-neutral-950 rounded-xl border border-neutral-800 mb-8">
                        <span className="font-bold text-neutral-400">Total Bid</span>
                        <span className={`text-2xl font-black ${anyHighBidActive ? 'text-emerald-400' : totalCurrentBid <= 11 ? 'text-cyan-400' : 'text-emerald-400'}`}>
                            {anyHighBidActive ? 'High Bid' : totalCurrentBid}
                        </span>
                    </div>

                    <div className="flex gap-4">
                        <button 
                            onClick={handleCreateRound}
                            disabled={isSubmitting}
                            className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl py-4 font-bold hover:opacity-90 transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Start Round'}
                        </button>
                        <button 
                            onClick={() => { setIsCreatingRound(false); setError(null); }}
                            disabled={isSubmitting}
                            className="px-8 bg-neutral-800 text-white rounded-xl py-4 font-bold hover:bg-neutral-700 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <button 
                    onClick={() => { setIsCreatingRound(true); setError(null); }}
                    className="w-full bg-neutral-900/80 hover:bg-neutral-800 backdrop-blur-xl border border-neutral-800 border-dashed rounded-3xl p-8 mb-8 flex flex-col items-center justify-center transition-all group"
                >
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
                        <Plus className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-white text-lg">Start New Round</span>
                </button>
            )}

            {/* Rounds & Penalties History */}
            <div className="bg-neutral-900/50 backdrop-blur-xl rounded-3xl border border-neutral-800 overflow-hidden">
                <div className="p-6 border-b border-neutral-800">
                    <h3 className="text-xl font-bold flex items-center gap-3 text-white">
                        <Trophy className="w-5 h-5 text-emerald-400" />
                        Match History
                    </h3>
                </div>
                
                {completedRounds.length === 0 && penalties.length === 0 ? (
                    <div className="p-8 text-center text-neutral-500 font-medium">
                        No rounds or penalties yet.
                    </div>
                ) : (
                    <div className="divide-y divide-neutral-800/50">
                        {/* Render Penalties visually distinct */}
                        {penalties.map(p => {
                            const targetName = players.find(player => player.id === p.target_player)?.name || p.target_player;
                            return (
                                <div key={p.id} className="p-4 bg-red-950/20 hover:bg-red-950/40 transition-colors flex items-center justify-between border-l-4 border-red-500">
                                    <div>
                                        <div className="text-sm font-bold text-red-400 mb-1 flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4" /> Penalty: {targetName}
                                        </div>
                                        {p.reason && <div className="text-xs text-neutral-400">{p.reason}</div>}
                                    </div>
                                    <div className="text-xl font-black text-red-500">{p.points}</div>
                                </div>
                            );
                        })}

                        {/* Render Rounds */}
                        {completedRounds.map((round) => (
                            <div key={round.id} className="p-6 hover:bg-neutral-800/30 transition-colors">
                                <div className="text-sm font-bold text-neutral-500 mb-4 uppercase tracking-wider">
                                    Round {round.round_number}
                                </div>
                                <div className={`grid grid-cols-2 ${isIndividual ? 'md:grid-cols-4' : ''} gap-4`}>
                                    {players.map(p => {
                                        const bidKey = p.bidKey === 'a' ? 'team_a_bid' : p.bidKey === 'b' ? 'team_b_bid' : `${p.bidKey}_bid`;
                                        const wonKey = p.bidKey === 'a' ? 'team_a_won' : p.bidKey === 'b' ? 'team_b_won' : `${p.bidKey}_won`;
                                        const scoreKey = p.bidKey === 'a' ? 'team_a_score' : p.bidKey === 'b' ? 'team_b_score' : `${p.bidKey}_score`;
                                        
                                        const anyHigh = round.team_a_bid >= 10 || round.team_b_bid >= 10 || round.p3_bid >= 10 || round.p4_bid >= 10;
                                        const isCountingActuals = anyHigh && round[bidKey] < 10;
                                        
                                        const score = round[scoreKey] || 0;
                                        
                                        return (
                                            <div key={p.id} className="flex flex-col gap-2">
                                                <div className="text-xs text-neutral-400 truncate">{p.name}</div>
                                                <div className="text-xs text-neutral-500">
                                                    Bid: {round[bidKey]} • {isCountingActuals ? <span className="text-cyan-400">{round[wonKey]} hands</span> : round[wonKey] === 1 ? <span className="text-emerald-500">Won</span> : <span className="text-red-500">Lost</span>}
                                                </div>
                                                <div className={`text-xl font-black ${score > 0 ? 'text-emerald-400' : score < 0 ? 'text-red-400' : 'text-neutral-400'}`}>
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
