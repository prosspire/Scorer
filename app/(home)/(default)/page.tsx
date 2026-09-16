"use client"
import { useState, useEffect } from 'react';
import { Trophy, Users, Shield, Target, Plus, Play, ChevronRight, Menu, X, ArrowRight, LogIn } from 'lucide-react';
import FamosaFooter from '@/components/Footer';
import Link from 'next/link';
import { useUser } from '@/lib/store/user';

// Custom Card Suit Icons
const SpadeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.2c-.3 0-.7.3-1.1.7-2.7 3.5-5.9 7.6-7.8 9.9-1.9 2.3-2.1 4.7-1 6.5 1.1 1.8 3.5 1.5 4.5 1.1.8-.4 1.7-1.1 2.3-2.1v2.1c0 1.2-1.4 1.6-1.4 1.6h9s-1.4-.4-1.4-1.6v-2.1c.6 1 1.5 1.7 2.3 2.1 1 .4 3.4.7 4.5-1.1 1.1-1.8.9-4.2-1-6.5-1.9-2.3-5.1-6.4-7.8-9.9-.4-.4-.8-.7-1.1-.7z" />
  </svg>
);

const HeartIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const ClubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 11.5c-2.5-2.2-4.5-1.4-5.1.2-.6 1.7.5 3.3 2.6 3.8.3.1.5.3.5.6 0 .3-.2.5-.5.6-3 .3-4.5 2-4.5 4.1 0 1.8 1.4 3 3.5 3 .9 0 1.7-.2 2.3-.6v1.3s-1.2.5-1.2 1.5h8.8c0-1-1.2-1.5-1.2-1.5v-1.3c.6.4 1.4.6 2.3.6 2.1 0 3.5-1.2 3.5-3 0-2.1-1.5-3.8-4.5-4.1-.3-.1-.5-.3-.5-.6 0-.3.2-.5.5-.6 2.1-.5 3.2-2.1 2.6-3.8-.6-1.6-2.6-2.4-5.1-.2 1.1-2 .5-4.1-1.3-4.6-1.7-.5-3.5 1-2.4 4.6z" />
  </svg>
);

const DiamondIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2L2 12l10 10 10-10L12 2z" />
  </svg>
);

const PlayingCard = ({ value, suit, color, className }: { value: string, suit: React.ReactNode, color: string, className?: string }) => (
  <div className={`bg-white rounded-xl shadow-2xl border-4 border-neutral-200 flex flex-col justify-between p-3 w-32 h-44 ${className}`}>
    <div className={`text-xl font-black ${color} flex flex-col items-center leading-none`}>
      <span>{value}</span>
      <div className="w-5 h-5">{suit}</div>
    </div>
    <div className={`w-12 h-12 self-center ${color}`}>
      {suit}
    </div>
    <div className={`text-xl font-black ${color} flex flex-col items-center leading-none rotate-180`}>
      <span>{value}</span>
      <div className="w-5 h-5">{suit}</div>
    </div>
  </div>
);

export default function ScoreCardHomepage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const user = useUser((state) => state.user);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-white overflow-hidden relative">
      {/* Dynamic gradient background matching the dashboard vibe */}
      <div
        className="fixed inset-0 opacity-20 transition-all duration-1000 ease-out"
        style={{
          background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, 
            rgba(16, 185, 129, 0.15), 
            rgba(6, 182, 212, 0.1), 
            transparent 50%)`
        }}
      />

      {/* Floating Card Suits */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-20 left-[10%] animate-float">
          <div className="w-16 h-16 text-emerald-500/30 rotate-12">
            <SpadeIcon className="w-full h-full" />
          </div>
        </div>
        <div className="absolute top-40 right-[15%] animate-float-delayed">
          <div className="w-12 h-12 text-red-500/30 -rotate-12">
            <HeartIcon className="w-full h-full" />
          </div>
        </div>
        <div className="absolute bottom-40 left-[20%] animate-bounce-slow">
          <div className="w-20 h-20 text-emerald-500/30 rotate-45">
            <ClubIcon className="w-full h-full" />
          </div>
        </div>
        <div className="absolute top-1/2 right-[10%] animate-pulse">
          <div className="w-14 h-14 text-red-500/30 -rotate-45">
            <DiamondIcon className="w-full h-full" />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 bg-neutral-950/80 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-xl">
                <SpadeIcon className="w-5 h-5 text-neutral-950" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white via-emerald-100 to-cyan-100 bg-clip-text text-transparent tracking-widest">
                  SCORECARD
                </h1>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-all hover:scale-105 font-medium">Features</a>
              <a href="#modes" className="text-gray-300 hover:text-white transition-all hover:scale-105 font-medium">Game Modes</a>

              {user ? (
                <Link href="/dashboard" rel="noopener noreferrer">
                  <button className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-neutral-950 px-6 py-2.5 rounded-full font-bold hover:from-emerald-400 hover:to-cyan-400 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    Dashboard
                  </button>
                </Link>
              ) : (
                <Link href="/login" rel="noopener noreferrer">
                  <button className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full font-bold hover:bg-neutral-200 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    <LogIn className="w-4 h-4" />
                    Login
                  </button>
                </Link>
              )}
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-6 min-h-[80vh] flex items-center">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Text */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-8">
              <Trophy className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-bold text-emerald-300 uppercase tracking-wider">The Ultimate Companion</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              <span className="block text-white">Ditch the</span>
              <span className="block bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Pen & Paper
              </span>
            </h1>

            <p className="text-xl text-neutral-400 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Track rounds, manage bids, and instantly calculate scores for your favorite card games. Whether playing <strong className="text-white">2v2 Teams</strong> or <strong className="text-white">4-Player Individual</strong> modes, we keep the game fair and fast.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
              <Link href={user ? "/dashboard/games/create" : "/login"}>
                <button className="group bg-gradient-to-r from-emerald-500 to-cyan-500 text-neutral-950 px-8 py-4 rounded-2xl text-lg font-black hover:opacity-90 transition-all transform hover:-translate-y-1 shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center gap-3">
                  Create a Game
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <a href="#features" className="group bg-neutral-900 px-8 py-4 rounded-2xl text-lg font-bold border border-neutral-800 hover:bg-neutral-800 transition-all flex items-center gap-3 text-neutral-300">
                Explore Features
              </a>
            </div>
          </div>

          {/* Right Visual Dashboard Mockup with Cards */}
          <div className="relative hidden lg:block h-[500px]">
            {/* Literal Playing Cards */}
            <div className="absolute top-10 right-20 z-10 animate-float-delayed rotate-12">
              <PlayingCard value="A" suit={<SpadeIcon />} color="text-neutral-900" />
            </div>
            <div className="absolute top-32 right-10 z-20 animate-float -rotate-6">
              <PlayingCard value="K" suit={<HeartIcon />} color="text-red-600" />
            </div>

            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 blur-3xl rounded-[3rem]" />
            <div className="absolute top-1/2 left-0 -translate-y-1/2 z-30 bg-neutral-950/90 backdrop-blur-2xl border border-neutral-800 rounded-3xl p-6 shadow-2xl w-80">
              {/* Header Mock */}
              <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
                <div className="text-neutral-400 font-bold uppercase tracking-widest text-sm">Scoreboard</div>
                <div className="text-emerald-400 font-bold text-xs bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Round 4</div>
              </div>

              {/* Score Grid Mock */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-neutral-900 rounded-xl p-4 border border-emerald-500/50 text-center relative overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
                  <div className="text-xs font-bold text-neutral-400 mb-1">TEAM A</div>
                  <div className="text-3xl font-black text-white">42</div>
                </div>
                <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800 text-center">
                  <div className="text-xs font-bold text-neutral-400 mb-1">TEAM B</div>
                  <div className="text-3xl font-black text-white">28</div>
                </div>
              </div>

              {/* Match History Mock */}
              <div className="space-y-3">
                <div className="bg-neutral-900/50 rounded-lg p-3 border border-neutral-800/50 flex justify-between items-center text-xs">
                  <span className="text-neutral-500 font-bold uppercase">Round 3</span>
                  <div className="flex gap-4">
                    <span className="text-emerald-400 font-black">+12</span>
                    <span className="text-cyan-400 font-black">+8</span>
                  </div>
                </div>
                <div className="bg-neutral-900/50 rounded-lg p-3 border border-neutral-800/50 flex justify-between items-center text-xs">
                  <span className="text-neutral-500 font-bold uppercase">Round 2</span>
                  <div className="flex gap-4">
                    <span className="text-emerald-400 font-black">+15</span>
                    <span className="text-red-400 font-black">-5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-neutral-900/30 border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Built for <span className="text-emerald-400">Card Players</span>
            </h2>
            <p className="text-xl text-neutral-400">Everything you need to keep the game flowing.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Smart Bidding Logic",
                desc: "Automatically handles 'High Bid' exceptions and instantly completes rounds if total bids are 11 or lower.",
                color: "text-cyan-400",
                bg: "bg-cyan-500/10"
              },
              {
                icon: Users,
                title: "Flexible Modes",
                desc: "Switch seamlessly between 2v2 Team battles or intense 4-Player Individual matchups.",
                color: "text-emerald-400",
                bg: "bg-emerald-500/10"
              },
              {
                icon: Shield,
                title: "Penalty System",
                desc: "Someone cheated? Played a wrong card? Deduct penalty points instantly with a single tap.",
                color: "text-red-400",
                bg: "bg-red-500/10"
              }
            ].map((feature, i) => (
              <div key={i} className="bg-neutral-950 rounded-3xl p-8 border border-neutral-800 hover:border-emerald-500/30 transition-all group">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${feature.bg} group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-neutral-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(16,185,129,0.3)] rotate-12">
            <SpadeIcon className="w-10 h-10 text-neutral-950" />
          </div>

          <h2 className="text-5xl md:text-7xl font-black mb-8">
            Your Table Is <br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Ready</span>
          </h2>

          <p className="text-xl text-neutral-400 mb-12 max-w-2xl mx-auto">
            Stop arguing over scores and start playing. Create your first digital scorecard in seconds.
          </p>

          <Link href={user ? "/dashboard" : "/login"}>
            <button className="bg-white text-black px-12 py-5 rounded-full text-xl font-black hover:bg-neutral-200 transition-all transform hover:scale-105 shadow-2xl flex items-center gap-4 mx-auto">
              {user ? "Open Dashboard" : "Get Started"}
              <ArrowRight className="w-6 h-6" />
            </button>
          </Link>
        </div>
      </section>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(12deg); }
          50% { transform: translateY(-20px) rotate(15deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(-12deg); }
          50% { transform: translateY(-15px) rotate(-15deg); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px) rotate(45deg); }
          50% { transform: translateY(-10px) rotate(48deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite 2s;
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite 1s;
        }
      `}</style>

      <FamosaFooter />
    </div>
  );
}