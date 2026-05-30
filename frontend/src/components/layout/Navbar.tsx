'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Zap, LogOut, LayoutDashboard, Building2, Shield, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthProvider';
import { useTheme } from '@/contexts/ThemeProvider';
import { logOut } from '@/backend/firebase/auth';
import { cn } from '@/shared/helpers/utils';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAdmin, isOwner } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  const navLinks = [
    { href: '/venues', label: 'Discover' },
    { href: '/venues?tab=map', label: 'Map View' },
    { href: '/#ai-concierge', label: 'AI Concierge' },
  ];

  // Role-aware dashboard link
  const dashboardHref = isAdmin ? '/admin' : isOwner ? '/owner' : '/dashboard';
  const dashboardLabel = isAdmin ? 'Admin' : isOwner ? 'Owner Panel' : 'Dashboard';
  const DashboardIcon = isAdmin ? Shield : isOwner ? Building2 : LayoutDashboard;
  const dashboardStyle = isAdmin
    ? 'border-purple-500 text-purple-400 hover:text-purple-300'
    : isOwner
    ? 'border-amber-500 text-amber-400 hover:text-amber-300'
    : 'border-black text-slate-300 hover:text-white';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#080a10] border-b-3 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-display font-bold text-xl">
            <div className="w-8 h-8 rounded-md bg-yellow-400 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
              <Zap className="w-4 h-4 text-black fill-black" />
            </div>
            <span className="gradient-text">PlaySphere AI</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-bold transition-colors hover:text-cyan-400',
                  pathname === link.href ? 'text-cyan-400' : 'text-slate-300'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-9 h-9 text-slate-300 hover:text-cyan-400 bg-slate-900 border-2 border-black rounded-md shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer transition-all"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {user ? (
              <>
                <Link
                  href={dashboardHref}
                  className={cn(
                    'flex items-center gap-2 text-sm font-bold transition-all bg-slate-900 border-2 px-3 py-1.5 rounded-md shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 active:translate-y-0',
                    dashboardStyle
                  )}
                >
                  <DashboardIcon className="w-4 h-4" />
                  {dashboardLabel}
                </Link>
                <button
                  onClick={() => logOut()}
                  className="flex items-center justify-center w-9 h-9 text-slate-400 hover:text-red-400 transition-colors bg-slate-900 border-2 border-black rounded-md shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 active:translate-y-0"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="btn-secondary text-xs py-2 px-4 h-10 flex items-center">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="btn-primary text-xs py-2 px-4 h-10 flex items-center">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-slate-300 hover:text-white bg-slate-900 border-2 border-black p-1.5 rounded-md shadow-[2px_2px_0px_#000]"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#080a10] border-t-2 border-b-3 border-black">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block text-sm font-bold text-slate-300 hover:text-cyan-400 transition-colors py-2"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t-2 border-black flex flex-col gap-2">
              <button
                onClick={() => { toggleTheme(); setIsOpen(false); }}
                className="btn-secondary text-sm justify-center py-2 flex items-center gap-2"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
              {user ? (
                <>
                  <Link
                    href={dashboardHref}
                    onClick={() => setIsOpen(false)}
                    className={cn('btn-secondary text-sm justify-center py-2 flex items-center gap-2', dashboardStyle)}
                  >
                    <DashboardIcon className="w-4 h-4" /> {dashboardLabel}
                  </Link>
                  <button
                    onClick={() => { logOut(); setIsOpen(false); }}
                    className="btn-secondary text-sm justify-center text-rose-500 py-2"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setIsOpen(false)} className="btn-secondary text-sm justify-center py-2">Sign In</Link>
                  <Link href="/auth/signup" onClick={() => setIsOpen(false)} className="btn-primary text-sm justify-center py-2">Get Started</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
