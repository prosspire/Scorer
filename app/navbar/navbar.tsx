"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useUser } from "@/lib/store/user";
import Profile from "./profile";
import Logout from "@/components/logout";
import { Button } from "@/components/ui/button";
import { usePathname } from 'next/navigation'
import logo from "../../public/logoashish.png";
import Image from "next/image";
import { Menu, X, Crown, Zap, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const user = useUser((state) => state.user);

  useEffect(() => {
    const userLoggedIn = user?.id ? true : false;
    setIsLoggedIn(userLoggedIn); 
  }, [user]);

  useEffect(() => {
    const handleMouseMove = (e : MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlNavbar);
    return () => {
      window.removeEventListener('scroll', controlNavbar);
    };
  }, [lastScrollY]);

  useEffect(() => {
    const handleClickOutside = () => {
      setIsMobileMenuOpen(false);
    };

    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className={`z-50 bg-black/80 backdrop-blur-2xl border-b border-white/10 w-full fixed transition-transform duration-300 ease-in-out ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      {/* Dynamic gradient background */}
      <div 
        className="absolute inset-0 opacity-20 transition-all duration-1000 ease-out"
        style={{
          background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, 
            rgba(147, 51, 234, 0.1), 
            rgba(219, 39, 119, 0.05), 
            transparent 40%)`
        }}
      />

      <nav className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <div className="flex md:ml-0 ml-14 items-center">
              <Link href="/" className="flex items-center group">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl mr-3 group-hover:scale-110 transition-transform">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div className="hidden md:block">
                  <h1 className="text-2xl font-black text-white">FAMOSA</h1>
                  <p className="text-xs text-gray-400 -mt-1">Battle Platform</p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              <Link 
                href="/courses" 
                className="text-gray-300 hover:text-white px-4 py-2 text-lg font-medium transition-all duration-200 rounded-xl hover:bg-white/10 relative group"
              >
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Courses
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
              </Link>
              <Link 
                href="/blogs" 
                className="text-gray-300 hover:text-white px-4 py-2 text-lg font-medium transition-all duration-200 rounded-xl hover:bg-white/10 relative group"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Blogs
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
              </Link>
            </div>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {user?.id ? (
                <>
                  <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl px-3 py-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span className="font-bold text-yellow-400 text-sm">PRO</span>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="h-12 w-12 rounded-full border-2 border-gradient-to-r from-purple-500 to-pink-500 p-0.5 hover:scale-110 transition-transform">
                        <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                          <Profile />
                        </div>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-black/90 backdrop-blur-xl border-white/10 text-white" align="end">
                      <DropdownMenuLabel className="text-gray-300">My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator className="border-white/10" />
                      <DropdownMenuItem className="hover:bg-white/10 text-gray-300 hover:text-white">
                        <Link href={pathname === '/profile' ? '/dashboard' : '/profile'} className="w-full">
                          {pathname === '/profile' ? 'Dashboard' : 'Profile'}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-white/10 text-gray-300 hover:text-white">
                        <Link href={pathname === '/' ? '/dashboard' : '/'} className="w-full">
                          {pathname === '/' ? 'Dashboard' : 'Home'}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="border-white/10" />
                      <DropdownMenuItem className="hover:bg-red-500/20 text-red-400 hover:text-red-300">
                        <Link href="/login" className="w-full">
                          <Logout />
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Link href="/login">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 px-6 py-2 rounded-xl font-bold transform hover:scale-105 transition-all shadow-lg">
                    Login
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Mobile User Profile (if logged in) */}
              {user?.id && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="h-10 w-10 rounded-full border border-white/20 p-0.5 hover:scale-110 transition-transform">
                      <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                        <Profile />
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 bg-black/90 backdrop-blur-xl border-white/10 text-white" align="end">
                    <DropdownMenuLabel className="text-gray-300">My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator className="border-white/10" />
                    <DropdownMenuItem className="hover:bg-white/10 text-gray-300 hover:text-white">
                      <Link href={pathname === '/profile' ? '/dashboard' : '/profile'} className="w-full">
                        {pathname === '/profile' ? 'Dashboard' : 'Profile'}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-white/10 text-gray-300 hover:text-white">
                      <Link href={pathname === '/' ? '/dashboard' : '/'} className="w-full">
                        {pathname === '/' ? 'Dashboard' : 'Home'}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="border-white/10" />
                    <DropdownMenuItem className="hover:bg-red-500/20 text-red-400 hover:text-red-300">
                      <Link href="/login" className="w-full">
                        <Logout />
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Mobile Menu Toggle */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleMobileMenu}
                className="h-10 w-10 p-0 text-white hover:bg-white/10"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl border-b border-white/10 shadow-2xl">
            <div className="px-4 py-4 space-y-2">
              <Link 
                href="/courses" 
                className="block px-4 py-3 text-base font-medium text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-pink-600/20 rounded-xl transition-all duration-200 border border-transparent hover:border-white/10"
                onClick={closeMobileMenu}
              >
                <span className="flex items-center gap-3">
                  <Zap className="w-5 h-5" />
                  Courses
                </span>
              </Link>
              <Link 
                href="/blogs" 
                className="block px-4 py-3 text-base font-medium text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-cyan-600/20 rounded-xl transition-all duration-200 border border-transparent hover:border-white/10"
                onClick={closeMobileMenu}
              >
                <span className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5" />
                  Blogs
                </span>
              </Link>
              
              {/* Mobile Login Button (if not logged in) */}
              {!user?.id && (
                <div className="pt-3 border-t border-white/10">
                  <Link 
                    href="/login" 
                    className="block"
                    onClick={closeMobileMenu}
                  >
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 rounded-xl font-bold text-white text-center hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105">
                      Login
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}