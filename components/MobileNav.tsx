"use client"
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, PlusSquare, MessageSquare, LogOut } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { useUser, userSession } from '@/lib/store/user';

export default function MobileNav() {
    const pathname = usePathname();
    const router = useRouter();
    const setUser = useUser((state) => state.setUser);
    const setSession = userSession((state) => state.Setsession);

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

    const isActive = (path: string) => pathname === path;

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-2xl border-t border-neutral-800 pb-safe">
            <div className="flex justify-around items-center p-3">
                <Link href="/dashboard" className={`flex flex-col items-center gap-1 ${isActive('/dashboard') ? 'text-emerald-400' : 'text-neutral-500'}`}>
                    <Home className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Home</span>
                </Link>
                <Link href="/dashboard/games/create" className={`flex flex-col items-center gap-1 ${isActive('/dashboard/games/create') ? 'text-cyan-400' : 'text-neutral-500'}`}>
                    <PlusSquare className="w-6 h-6" />
                    <span className="text-[10px] font-bold">New Game</span>
                </Link>
                <Link href="/dashboard/feedback" className={`flex flex-col items-center gap-1 ${isActive('/dashboard/feedback') ? 'text-emerald-400' : 'text-neutral-500'}`}>
                    <MessageSquare className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Feedback</span>
                </Link>
                <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-neutral-500 hover:text-red-400 transition-colors">
                    <LogOut className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Logout</span>
                </button>
            </div>
        </div>
    );
}
