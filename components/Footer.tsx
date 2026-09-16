"use client"
import { useState, useEffect } from 'react';
import { Instagram, Twitter, Github, Mail, Phone, MapPin, Heart, ArrowUp, ExternalLink, Send } from 'lucide-react';

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

const ClubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 11.5c-2.5-2.2-4.5-1.4-5.1.2-.6 1.7.5 3.3 2.6 3.8.3.1.5.3.5.6 0 .3-.2.5-.5.6-3 .3-4.5 2-4.5 4.1 0 1.8 1.4 3 3.5 3 .9 0 1.7-.2 2.3-.6v1.3s-1.2.5-1.2 1.5h8.8c0-1-1.2-1.5-1.2-1.5v-1.3c.6.4 1.4.6 2.3.6 2.1 0 3.5-1.2 3.5-3 0-2.1-1.5-3.8-4.5-4.1-.3-.1-.5-.3-.5-.6 0-.3.2-.5.5-.6 2.1-.5 3.2-2.1 2.6-3.8-.6-1.6-2.6-2.4-5.1-.2 1.1-2 .5-4.1-1.3-4.6-1.7-.5-3.5 1-2.4 4.6z"/>
  </svg>
);

const DiamondIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2L2 12l10 10 10-10L12 2z"/>
  </svg>
);


export default function ScoreCardFooter() {
  const [email, setEmail] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    setEmail('');
  };

  return (
    <footer className="relative bg-black text-white overflow-hidden border-t border-neutral-900">
      {/* Dynamic gradient background */}
      <div 
        className="absolute inset-0 opacity-20 transition-all duration-1000 ease-out pointer-events-none"
        style={{
          background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, 
            rgba(16, 185, 129, 0.15), 
            rgba(6, 182, 212, 0.1), 
            transparent 50%)`
        }}
      />

      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-20 animate-float-slow">
          <div className="w-8 h-8 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-center shadow-xl opacity-60">
            <SpadeIcon className="w-4 h-4 text-emerald-500" />
          </div>
        </div>
        <div className="absolute top-32 right-32 animate-bounce-gentle">
          <div className="w-6 h-6 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-center shadow-lg opacity-40">
            <HeartIcon className="w-3 h-3 text-red-500" />
          </div>
        </div>
        <div className="absolute bottom-20 left-1/4 animate-pulse">
          <div className="w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-center shadow-xl opacity-50">
            <DiamondIcon className="w-5 h-5 text-cyan-500" />
          </div>
        </div>
        <div className="absolute top-1/2 right-20 animate-spin-slow">
          <div className="w-12 h-12 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-center shadow-2xl opacity-30">
            <ClubIcon className="w-6 h-6 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="relative z-10">
   

        {/* Main footer links */}
        <div className="py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              
              {/* Brand section */}
              <div className="md:col-span-1">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-xl">
                      <SpadeIcon className="w-6 h-6 text-neutral-950" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                      ScoreCard
                    </h3>
                    <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">App</p>
                  </div>
                </div>
                
                <p className="text-neutral-400 mb-6 leading-relaxed">
                  The ultimate digital scorecard for your classic card games. Say goodbye to pen and paper and let us handle the math.
                </p>
                
                {/* Social links */}
                <div className="flex items-center space-x-4">
                  <a href="#" className="group w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-center hover:border-emerald-500/50 transition-all shadow-lg">
                    <Instagram className="w-5 h-5 text-neutral-400 group-hover:text-emerald-400 transition-colors" />
                  </a>
                  <a href="#" className="group w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-center hover:border-cyan-500/50 transition-all shadow-lg">
                    <Twitter className="w-5 h-5 text-neutral-400 group-hover:text-cyan-400 transition-colors" />
                  </a>
                  <a href="#" className="group w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-center hover:border-emerald-500/50 transition-all shadow-lg">
                    <Github className="w-5 h-5 text-neutral-400 group-hover:text-emerald-400 transition-colors" />
                  </a>
                </div>
              </div>

              {/* Product links */}
              <div>
                <h4 className="text-lg font-bold text-white mb-6">Play</h4>
                <ul className="space-y-4">
                  {['Create Game', 'Dashboard', 'Teams Mode', 'Individual Mode'].map((link, i) => (
                    <li key={i}>
                      <a href="#" className="text-neutral-400 hover:text-emerald-400 transition-colors flex items-center gap-2 group">
                        <span className="group-hover:translate-x-1 transition-transform">{link}</span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h4 className="text-lg font-bold text-white mb-6">Resources</h4>
                <ul className="space-y-4">
                  {['Game Rules', 'Scoring Guide', 'Help Center', 'Contact Support'].map((link, i) => (
                    <li key={i}>
                      <a href="#" className="text-neutral-400 hover:text-cyan-400 transition-colors flex items-center gap-2 group">
                        <span className="group-hover:translate-x-1 transition-transform">{link}</span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Newsletter */}
              <div>
                <h4 className="text-lg font-bold text-white mb-6">Stay Updated</h4>
                <p className="text-neutral-400 mb-6">
                  Get the latest updates and new game modes delivered to your inbox.
                </p>
                
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
                    />
                    <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-500" />
                  </div>
                  <button
                    onClick={handleNewsletterSubmit}
                    className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-neutral-950 py-3 rounded-xl font-black hover:opacity-90 transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                  >
                    <Send className="w-4 h-4" />
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-neutral-900 py-8 bg-black">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              
              {/* Copyright */}
              <div className="flex items-center gap-6 text-neutral-500 text-sm">
                <p>© 2024 ScoreCard. All rights reserved.</p>
                <div className="hidden md:flex items-center gap-1">
                  <span>Made with</span>
                  <Heart className="w-4 h-4 text-emerald-500 animate-pulse" />
                  <span>for card players</span>
                </div>
              </div>

              {/* Legal links */}
              <div className="flex items-center gap-6 text-neutral-500 text-sm">
                <a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a>
              </div>

              {/* Contact */}
              <div className="flex items-center gap-4 text-neutral-500 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+91 9588368052</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:opacity-90 transition-all transform hover:scale-110 group"
        >
          <ArrowUp className="w-6 h-6 text-neutral-950 group-hover:-translate-y-1 transition-transform" />
        </button>
      )}

      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(180deg); }
        }
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 3s ease-in-out infinite 1s;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </footer>
  );
}