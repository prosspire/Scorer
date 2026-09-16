"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/lib/store/user";
import { Shield, ArrowRight, Home, LogIn, Lock } from "lucide-react";

// Custom Card Suit Icons
const SpadeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.2c-.3 0-.7.3-1.1.7-2.7 3.5-5.9 7.6-7.8 9.9-1.9 2.3-2.1 4.7-1 6.5 1.1 1.8 3.5 1.5 4.5 1.1.8-.4 1.7-1.1 2.3-2.1v2.1c0 1.2-1.4 1.6-1.4 1.6h9s-1.4-.4-1.4-1.6v-2.1c.6 1 1.5 1.7 2.3 2.1 1 .4 3.4.7 4.5-1.1 1.1-1.8.9-4.2-1-6.5-1.9-2.3-5.1-6.4-7.8-9.9-.4-.4-.8-.7-1.1-.7z"/>
  </svg>
);

const HeartIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

const DiamondIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2L2 12l10 10 10-10L12 2z"/>
  </svg>
);

interface PrivateRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, fallback }) => {
  const user = useUser((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    // Give some time for the user state to load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
        {/* Dynamic gradient background */}
        <div
          className="fixed inset-0 opacity-30 transition-all duration-1000 ease-out"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, 
              rgba(16, 185, 129, 0.15), 
              rgba(6, 182, 212, 0.1), 
              transparent 40%)`
          }}
        />

        {/* Floating elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 animate-float">
            <div className="w-12 h-12 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center shadow-2xl opacity-50">
              <SpadeIcon className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
          <div className="absolute top-40 right-20 animate-pulse">
            <div className="w-8 h-8 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-center shadow-xl opacity-30">
              <HeartIcon className="w-4 h-4 text-red-500" />
            </div>
          </div>
          <div className="absolute bottom-40 left-20 animate-bounce">
            <div className="w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center shadow-xl opacity-40">
              <DiamondIcon className="w-5 h-5 text-cyan-500" />
            </div>
          </div>
        </div>

        <div className="text-center space-y-6 z-10">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
              <SpadeIcon className="w-10 h-10 text-neutral-950 animate-pulse" />
            </div>
            <div className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-3xl animate-ping opacity-20 mx-auto"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Loading ScoreCard
            </h3>
            <p className="text-neutral-400 font-medium">Preparing your scorecard...</p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent"></div>
          </div>
        </div>

        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  // If user is not logged in, show fallback or default login prompt
  if (!user?.id) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        {/* Dynamic gradient background */}
        <div
          className="fixed inset-0 opacity-30 transition-all duration-1000 ease-out"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, 
              rgba(16, 185, 129, 0.15), 
              rgba(6, 182, 212, 0.1), 
              transparent 40%)`
          }}
        />

        {/* Floating elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 animate-float">
            <div className="w-12 h-12 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center shadow-2xl opacity-50">
              <SpadeIcon className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
          <div className="absolute top-40 right-20 animate-pulse">
            <div className="w-8 h-8 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-center shadow-xl opacity-30">
              <HeartIcon className="w-4 h-4 text-red-500" />
            </div>
          </div>
          <div className="absolute bottom-40 left-20 animate-bounce">
            <div className="w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center shadow-xl opacity-40">
              <DiamondIcon className="w-5 h-5 text-cyan-500" />
            </div>
          </div>
          <div className="absolute top-1/2 right-10 animate-pulse">
            <div className="w-14 h-14 bg-neutral-900 border border-neutral-800 rounded-3xl flex items-center justify-center shadow-2xl opacity-25">
              <Lock className="w-7 h-7 text-emerald-500" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-screen p-4 relative z-10">
          <div className="w-full max-w-md">
            {/* Main card with glassmorphism effect */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-3xl blur-xl opacity-20 animate-pulse"></div>
              <div className="relative bg-neutral-950/80 backdrop-blur-2xl border border-neutral-800 rounded-3xl p-8 shadow-2xl">

                {/* Header with animated icon */}
                <div className="text-center mb-8">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                      <Lock className="w-10 h-10 text-neutral-950" />
                    </div>
                    <div className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-3xl animate-ping opacity-20 mx-auto"></div>
                  </div>

                  <h2 className="text-3xl font-black mb-3">
                    <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                      ScoreCard Access
                    </span>
                  </h2>
                  <p className="text-neutral-400 font-medium">
                    Please log in to view this scorecard
                  </p>
                </div>

                {/* Description */}
                <div className="text-center mb-8 space-y-4">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                    <Shield className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-neutral-300 text-sm">
                      You need to sign in to create new games and manage your scores.
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="space-y-4">
                  <Link href="/auth/login" className="block">
                    <button className="group w-full bg-gradient-to-r from-emerald-500 to-cyan-500 py-4 rounded-2xl text-lg font-black text-neutral-950 hover:opacity-90 transition-all transform hover:scale-105 shadow-xl flex items-center justify-center gap-3">
                      <LogIn className="w-5 h-5" />
                      Login Now
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>

                  <Link href="/" className="block">
                    <button className="w-full bg-neutral-900 py-4 rounded-2xl text-lg font-bold border border-neutral-800 hover:bg-neutral-800 transition-all flex items-center justify-center gap-3 text-neutral-300">
                      <Home className="w-5 h-5" />
                      Back to Home
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
};

export default PrivateRoute;