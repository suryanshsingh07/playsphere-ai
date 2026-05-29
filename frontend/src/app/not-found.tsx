'use client';

import Link from 'next/link';
import { Zap, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2 font-display font-bold text-xl mb-12">
          <div className="w-8 h-8 rounded-md bg-yellow-400 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
            <Zap className="w-4 h-4 text-black fill-black" />
          </div>
          <span className="gradient-text">PlaySphere AI</span>
        </Link>

        {/* 404 Display */}
        <div className="relative mb-8">
          <div className="font-display text-[10rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-indigo-500 leading-none [text-shadow:none] select-none">
            404
          </div>
          <div className="absolute inset-0 font-display text-[10rem] font-black text-black leading-none translate-x-2 translate-y-2 -z-10 select-none">
            404
          </div>
        </div>

        <h1 className="font-display text-3xl font-black text-white uppercase tracking-wide mb-4 [text-shadow:2px_2px_0px_#000]">
          Page Not Found
        </h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          Looks like this venue doesn&apos;t exist in our playbook. The page you&apos;re looking for may have moved or been removed.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-primary justify-center py-3">
            <Home className="w-4 h-4" /> Back to Home
          </Link>
          <Link href="/venues" className="btn-secondary justify-center py-3">
            <Search className="w-4 h-4" /> Browse Venues
          </Link>
        </div>

        {/* Decorative */}
        <div className="mt-16 flex justify-center gap-4 opacity-30">
          {['🏸', '⚽', '🏊', '🤼'].map((emoji) => (
            <span key={emoji} className="text-3xl">{emoji}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
