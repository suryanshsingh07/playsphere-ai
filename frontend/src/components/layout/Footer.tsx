import Link from 'next/link';
import { Zap, Globe, MessageCircle, Camera } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t-3 border-black bg-[#080a10] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-display font-bold text-xl mb-3">
              <div className="w-8 h-8 rounded-md bg-yellow-400 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
                <Zap className="w-4 h-4 text-black fill-black" />
              </div>
              <span className="gradient-text">PlaySphere AI</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              AI-powered sports venue discovery and booking for Lucknow. Find your perfect game, anytime.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="#" className="w-8 h-8 rounded-md bg-slate-900 border-2 border-black flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors shadow-[2px_2px_0px_#000]"><Globe className="w-4 h-4" /></a>
              <a href="#" className="w-8 h-8 rounded-md bg-slate-900 border-2 border-black flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors shadow-[2px_2px_0px_#000]"><MessageCircle className="w-4 h-4" /></a>
              <a href="#" className="w-8 h-8 rounded-md bg-slate-900 border-2 border-black flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors shadow-[2px_2px_0px_#000]"><Camera className="w-4 h-4" /></a>
            </div>
          </div>
 
          {/* Links */}
          <div>
            <h4 className="text-white font-bold mb-4 font-display uppercase tracking-wider text-sm">Platform</h4>
            <ul className="space-y-2">
              {['Discover Venues', 'AI Concierge', 'Map View', 'Bookings'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors font-medium">{item}</a>
                </li>
              ))}
            </ul>
          </div>
 
          <div>
            <h4 className="text-white font-bold mb-4 font-display uppercase tracking-wider text-sm">Sports</h4>
            <ul className="space-y-2">
              {['🏸 Badminton', '⚽ Football', '🏊 Swimming', '🤼 Kabaddi'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors font-medium">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
 
        <div className="border-t-2 border-black mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © 2026 PlaySphere AI — Built by <span className="text-cyan-400 font-bold">Team DeepStack</span> for APL Qualifiers
          </p>
          <p className="text-slate-600 text-xs font-bold">
            Powered by Llama 3.1 via Groq • Firebase • Next.js
          </p>
        </div>
      </div>
    </footer>
  );
}
