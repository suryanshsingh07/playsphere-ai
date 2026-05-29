'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RefreshCw, Zap, ArrowRight } from 'lucide-react';
import { cn } from '@/shared/helpers/utils';

interface DiscoveryInsight {
  type: 'gap' | 'opportunity' | 'trend' | 'value';
  title: string;
  description: string;
  area?: string;
  sport?: string;
  emoji: string;
  urgency: 'high' | 'medium' | 'low';
}

export function VenueDiscoveryInsights() {
  const [insights, setInsights] = useState<DiscoveryInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/discover', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setInsights(data.insights || []);
      }
    } catch (error) {
      console.error('Failed to fetch insights', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch('/api/ai/discover', { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          if (active) setInsights(data.insights || []);
        }
      } catch (error) {
        console.error('Failed to fetch insights', error);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'gap': return 'bg-rose-400 text-black';
      case 'opportunity': return 'bg-emerald-400 text-black';
      case 'trend': return 'bg-amber-400 text-black';
      case 'value': return 'bg-cyan-400 text-black';
      default: return 'bg-slate-700 text-white';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    if (urgency === 'high') return '🔴 HIGH';
    if (urgency === 'medium') return '🟡 MED';
    return '🟢 LOW';
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-yellow-400 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
            <Zap className="w-4 h-4 text-black fill-black" />
          </div>
          <h2 className="font-display font-bold text-xl text-white">AI Venue Discovery</h2>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 text-xs font-bold bg-slate-900 border-2 border-black text-slate-300 px-3 py-1.5 rounded-md shadow-[2px_2px_0px_#000] hover:text-white hover:-translate-y-0.5 transition-all disabled:opacity-50"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-hide snap-x snap-mandatory">
        {loading && insights.length === 0 ? (
          // Loading Skeleton
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="min-w-[280px] md:min-w-[320px] bg-slate-900 border-3 border-black rounded-lg p-5 shadow-[5px_5px_0px_#000] animate-pulse snap-center">
              <div className="h-6 w-32 bg-slate-800 rounded mb-4" />
              <div className="h-4 w-full bg-slate-800 rounded mb-2" />
              <div className="h-4 w-4/5 bg-slate-800 rounded mb-6" />
              <div className="h-4 w-24 bg-slate-800 rounded" />
            </div>
          ))
        ) : (
          insights.map((insight, i) => (
            <div
              key={i}
              className="min-w-[280px] md:min-w-[320px] bg-[#121620] border-3 border-black rounded-lg flex flex-col shadow-[5px_5px_0px_#000] hover:-translate-y-1 hover:shadow-[7px_7px_0px_#000] transition-all snap-center group"
            >
              <div className={cn("px-4 py-3 border-b-3 border-black flex items-center gap-2 font-display font-bold rounded-t-[5px]", getTypeColor(insight.type))}>
                <span className="text-xl">{insight.emoji}</span>
                {insight.title}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <p className="text-slate-300 text-sm leading-relaxed mb-6 flex-1">
                  {insight.description}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <Link
                    href={`/venues?${insight.sport ? `sport=${insight.sport}&` : ''}${insight.area ? `area=${encodeURIComponent(insight.area)}` : ''}`}
                    className="text-xs font-bold text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1 transition-colors"
                  >
                    Explore {insight.sport ? insight.sport.charAt(0).toUpperCase() + insight.sport.slice(1) : 'Venues'} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <span className="text-[10px] font-black tracking-wider text-slate-500">
                    {getUrgencyIcon(insight.urgency)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
