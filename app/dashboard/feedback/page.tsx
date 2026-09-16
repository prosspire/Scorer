"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Send, ArrowLeft, Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { submitFeedback } from '@/lib/actions/feedback';

export default function FeedbackPage() {
    const router = useRouter();
    const [type, setType] = useState('feature_request');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            await submitFeedback(type, message);
            setSuccess(true);
            setMessage('');
            
            // Auto redirect back to dashboard after 3 seconds
            setTimeout(() => {
                router.push('/dashboard');
            }, 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit feedback');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white p-6 relative overflow-hidden flex flex-col">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/4 w-[50%] h-[50%] rounded-full bg-emerald-600/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[50%] h-[50%] rounded-full bg-cyan-600/20 blur-[120px] pointer-events-none" />

            <div className="max-w-2xl mx-auto w-full relative z-10">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-6 group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </Link>
                    
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                            <Sparkles className="w-6 h-6 text-neutral-950" />
                        </div>
                        <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                            Share Your Thoughts
                        </h1>
                    </div>
                    <p className="text-neutral-400 text-lg">
                        Have a feature idea or found a bug? Let us know!
                    </p>
                </div>

                {/* Main Form Card */}
                <div className="relative group">
                    {/* Glowing Border Effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                    
                    <div className="relative bg-neutral-900/90 backdrop-blur-2xl border border-neutral-800 rounded-3xl p-8 shadow-2xl">
                        
                        {success ? (
                            <div className="text-center py-12">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 mb-6 relative">
                                    <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin opacity-20"></div>
                                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Feedback Received!</h3>
                                <p className="text-neutral-400">Thank you for helping us improve ScoreCard. Redirecting you back...</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-center gap-3">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        <p className="text-sm font-medium">{error}</p>
                                    </div>
                                )}

                                {/* Type Selector */}
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-neutral-300 uppercase tracking-wider">Feedback Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setType('feature_request')}
                                            className={`p-4 rounded-xl border transition-all text-sm font-bold flex flex-col items-center gap-2 ${
                                                type === 'feature_request' 
                                                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                                                : 'bg-neutral-950 border-neutral-800 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300'
                                            }`}
                                        >
                                            <Sparkles className="w-5 h-5" />
                                            Feature Request
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setType('bug')}
                                            className={`p-4 rounded-xl border transition-all text-sm font-bold flex flex-col items-center gap-2 ${
                                                type === 'bug' 
                                                ? 'bg-red-500/10 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                                                : 'bg-neutral-950 border-neutral-800 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300'
                                            }`}
                                        >
                                            <AlertCircle className="w-5 h-5" />
                                            Report a Bug
                                        </button>
                                    </div>
                                </div>

                                {/* Message Input */}
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-neutral-300 uppercase tracking-wider">Your Message</label>
                                    <div className="relative">
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Tell us what's on your mind..."
                                            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 min-h-[150px] text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none shadow-inner"
                                            required
                                        />
                                        <MessageSquare className="absolute right-4 top-4 w-5 h-5 text-neutral-600 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading || !message.trim()}
                                    className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-neutral-950 py-4 rounded-xl text-lg font-black hover:opacity-90 transition-all transform hover:-translate-y-1 shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Submit Feedback
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
