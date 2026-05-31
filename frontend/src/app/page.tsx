import Link from 'next/link';
import { ArrowRight, Bot, MapPin, Star, Zap, ChevronRight, Shield, TrendingUp } from 'lucide-react';
import { SPORTS_LIST } from '@/shared/constants/venues';
import { getApprovedVenues } from '@/backend/firebase/firestore';
import { VenueCard } from '@/components/venue/VenueCard';
import { AIConciergePreview } from '@/components/ai/AIConciergePreview';
import { VenueDiscoveryInsights } from '@/components/ai/VenueDiscoveryInsights';
import { serializeFirestoreData } from '@/shared/helpers/utils';
import { Venue } from '@/shared/types';

export default async function HomePage() {
  const venues = await getApprovedVenues().catch(() => []);
  const rawFeaturedVenues = venues.filter((v) => (v.rating || 0) >= 4.7).slice(0, 3);
  const featuredVenues = serializeFirestoreData(rawFeaturedVenues) as Venue[];

  return (
    <div className="min-h-screen">
      {/* ── HERO SECTION ─────────────────────────────────────── */}
      <section className="relative hero-gradient pt-28 pb-20 px-4 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-40 right-10 w-3 h-3 bg-cyan-400 border border-black rounded-sm animate-float" />
          <div className="absolute top-60 left-16 w-3 h-3 bg-yellow-400 border border-black rounded-sm animate-float animation-delay-1s" />
          <div className="absolute bottom-40 right-20 w-3 h-3 bg-pink-400 border border-black rounded-sm animate-float animation-delay-2s" />
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-slate-900 border-2 border-black rounded-md px-4 py-1.5 mb-8 shadow-[2px_2px_0px_#000]">
            <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
            <span className="text-xs font-bold text-cyan-400 tracking-wide uppercase">APL Final Round 2026 — Team DeepStack</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl md:text-7xl font-black leading-tight mb-6 tracking-tight [text-shadow:3px_3px_0px_#000]">
            Find Your Perfect
            <br />
            <span className="gradient-text">Sports Venue</span>
            <br />
            <span className="text-slate-200">with AI</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Discover and book badminton courts, football turfs, swimming pools, and akharas across{' '}
            <span className="text-cyan-400 font-bold">Lucknow</span> with smart AI recommendations.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/venues" className="btn-primary text-base px-8 py-4">
              Explore Venues <ArrowRight className="w-5 h-5 stroke-[2.5px]" />
            </Link>
            <Link href="/#ai-concierge" className="btn-secondary text-base px-8 py-4">
              <Bot className="w-5 h-5" /> Ask AI Concierge
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { value: '15+', label: 'Venues' },
              { value: '4', label: 'Sports' },
              { value: 'AI', label: 'Powered' },
            ].map((stat) => (
              <div key={stat.label} className="bg-slate-900 border-2 border-black rounded-lg p-4 text-center shadow-[3px_3px_0px_#000]">
                <div className="font-display text-2xl font-black text-slate-200">{stat.value}</div>
                <div className="text-cyan-400 text-xs font-bold uppercase mt-1 tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI VENUE DISCOVERY ───────────────────────────────── */}
      <section className="py-12 px-4 border-b-3 border-black bg-slate-900/40">
        <div className="max-w-6xl mx-auto">
          <VenueDiscoveryInsights />
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="py-20 px-4 bg-slate-900/10 border-b-3 border-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 uppercase tracking-tight">
              How <span className="gradient-text">PlaySphere AI</span> Works
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto font-medium">From intent to booking in seconds, powered by AI</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: Bot, title: 'Describe in Natural Language', desc: '"Beginner badminton near Gomti Nagar under ₹300"', color: 'bg-cyan-400 text-black', num: '01' },
              { icon: Zap, title: 'AI Analyzes & Recommends', desc: 'AI understands your intent and finds the best match', color: 'bg-yellow-400 text-black', num: '02' },
              { icon: MapPin, title: 'Explore on Map', desc: 'See venues pinned on Google Maps with distances', color: 'bg-pink-400 text-black', num: '03' },
              { icon: Shield, title: 'Book Instantly', desc: 'Select your time slot and confirm your booking', color: 'bg-emerald-400 text-black', num: '04' },
            ].map((step) => (
              <div key={step.num} className="relative bg-slate-900 border-2 border-black rounded-lg p-6 card-hover shadow-[4px_4px_0px_#000]">
                <div className="text-3xl font-display font-black text-slate-200/20 absolute top-4 right-4">{step.num}</div>
                <div className={`w-10 h-10 rounded-md border-2 border-black flex items-center justify-center mb-4 shadow-[2px_2px_0px_#000] ${step.color}`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-slate-200 mb-2 text-base uppercase tracking-wide">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPORTS CATEGORIES ─────────────────────────────────── */}
      <section className="py-20 px-4 border-b-3 border-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 uppercase tracking-tight">
              Sports We <span className="gradient-text">Cover</span>
            </h2>
            <p className="text-slate-400 font-medium">Every sport, every level, every budget</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SPORTS_LIST.map((sport) => (
              <Link
                key={sport.value}
                href={`/venues?sport=${sport.value}`}
                className="bg-slate-900 border-2 border-black rounded-lg p-6 text-center card-hover group cursor-pointer shadow-[4px_4px_0px_#000]"
              >
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform select-none">
                  {sport.emoji}
                </div>
                <h3 className="font-display font-black text-slate-200 text-lg tracking-wide mb-1 uppercase">{sport.label}</h3>
                <div className="mt-3 text-xs font-bold text-slate-400 flex items-center justify-center gap-1 group-hover:text-cyan-400 transition-colors">
                  Explore <ChevronRight className="w-3.5 h-3.5 stroke-[3px]" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED VENUES ──────────────────────────────────── */}
      <section className="py-20 px-4 bg-slate-900/10 border-b-3 border-black">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-2 uppercase tracking-tight">
                Top Rated <span className="gradient-text">Venues</span>
              </h2>
              <p className="text-slate-400 font-medium">Highest rated sports facilities in Lucknow</p>
            </div>
            <Link href="/venues" className="btn-secondary text-sm hidden md:flex">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredVenues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link href="/venues" className="btn-secondary">
              View All Venues <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── AI CONCIERGE PREVIEW ─────────────────────────────── */}
      <section id="ai-concierge" className="py-20 px-4 border-b-3 border-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 bg-slate-900 border-2 border-black mb-6 shadow-[2px_2px_0px_#000]">
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs text-cyan-400 font-extrabold uppercase tracking-wider">Powered by Llama 3.1</span>
              </div>
              <h2 className="font-display text-3xl md:text-5xl font-black mb-6 tracking-tight uppercase [text-shadow:2px_2px_0px_#000]">
                Meet Your AI
                <br />
                <span className="gradient-text">Sports Concierge</span>
              </h2>
              <p className="text-slate-300 leading-relaxed mb-8 font-medium">
                Just describe what you want in plain English. Our AI understands your intent, considers your budget, skill level, and location — then recommends the perfect venue with a clear explanation.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  '"Beginner badminton near Gomti Nagar under ₹300"',
                  '"Football turf for 10 friends this weekend"',
                  '"Cheapest swimming pool near Hazratganj"',
                ].map((example) => (
                  <div key={example} className="flex items-center gap-3 bg-slate-900 border-2 border-black rounded-lg px-4 py-3 shadow-[2px_2px_0px_#000]">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 border border-black" />
                    <span className="text-slate-300 text-sm font-medium italic">{example}</span>
                  </div>
                ))}
              </div>
              <Link href="/#ai-concierge" className="btn-primary">
                Try AI Concierge <ArrowRight className="w-4 h-4 stroke-[2.5px]" />
              </Link>
            </div>
            <div>
              <AIConciergePreview />
            </div>
          </div>
        </div>
      </section>

      {/* ── PEAK PRICING CALLOUT ─────────────────────────────── */}
      <section className="py-20 px-4 bg-slate-900/10 border-b-3 border-black">
        <div className="max-w-6xl mx-auto">
          <div className="bg-slate-900 border-3 border-black rounded-lg p-8 md:p-12 shadow-[6px_6px_0px_#000]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 bg-slate-950 border-2 border-black mb-4 shadow-[2px_2px_0px_#000]">
                  <TrendingUp className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-xs text-yellow-400 font-extrabold uppercase tracking-wider">Smart Pricing</span>
                </div>
                <h2 className="font-display text-3xl font-black mb-4 uppercase tracking-tight">
                  <span className="text-slate-200">Save up to </span>
                  <span className="gradient-text-sport">15%</span>
                  <br /><span className="text-slate-200">with smart timing</span>
                </h2>
                <p className="text-slate-300 leading-relaxed font-medium">
                  Our AI knows when prices are lowest. Book afternoon slots to save significantly over peak evening rates.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Morning', time: '5–8 AM', icon: '🌅', price: 'Normal', color: 'border-blue-500/30' },
                  { label: 'Afternoon', time: '11 AM–4 PM', icon: '☀️', price: '15% Off', color: 'border-emerald-500/30', badge: 'BEST VALUE' },
                  { label: 'Evening', time: '5–10 PM', icon: '🌆', price: '+30%', color: 'border-red-500/30', badge: 'PEAK' },
                ].map((slot) => (
                  <div key={slot.label} className={`bg-slate-950 border-2 border-black rounded-lg p-4 text-center shadow-[3px_3px_0px_#000] relative`}>
                    {slot.badge && (
                      <div className={`text-[10px] font-black uppercase mb-2 inline-block border-2 border-black px-2 py-0.5 rounded-md ${slot.badge === 'BEST VALUE' ? 'bg-emerald-400 text-black' : 'bg-rose-400 text-black'}`}>
                        {slot.badge}
                      </div>
                    )}
                    <div className="text-2xl mb-2 select-none">{slot.icon}</div>
                    <div className="font-display font-bold text-slate-200 text-sm uppercase">{slot.label}</div>
                    <div className="text-xs text-slate-400 mt-1">{slot.time}</div>
                    <div className={`text-sm font-extrabold mt-2 ${slot.badge === 'BEST VALUE' ? 'text-emerald-400' : slot.badge === 'PEAK' ? 'text-rose-400' : 'text-cyan-400'}`}>
                      {slot.price}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST / TESTIMONIALS ─────────────────────────────── */}
      <section className="py-20 px-4 border-b-3 border-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl font-black mb-4 uppercase tracking-tight">
              Loved by <span className="gradient-text">Athletes</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Arjun Sharma', sport: 'Badminton Player', text: 'Found the perfect court in Gomti Nagar in seconds. The AI knew exactly what I needed — beginner-friendly and under budget!', rating: 5 },
              { name: 'Priya Gupta', sport: 'Football Enthusiast', text: 'Organized a 10-person football session with one AI query. The turf was exactly as described. Amazing experience!', rating: 5 },
              { name: 'Rahul Verma', sport: 'Swimming Learner', text: 'As a complete beginner, the AI Guidance Mode gave me tips I never expected. Now I swim 3x a week!', rating: 5 },
            ].map((review) => (
              <div key={review.name} className="bg-slate-900 border-2 border-black rounded-lg p-6 card-hover shadow-[4px_4px_0px_#000]">
                <div className="flex text-amber-400 mb-4">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-4 italic font-medium">&ldquo;{review.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-cyan-400 border-2 border-black flex items-center justify-center text-black text-sm font-black shadow-[2px_2px_0px_#000]">
                    {review.name[0]}
                  </div>
                  <div>
                    <div className="text-slate-200 text-sm font-bold">{review.name}</div>
                    <div className="text-slate-500 text-xs font-bold uppercase">{review.sport}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ──────────────────────────────────────── */}
      <section className="py-20 px-4 bg-slate-900/10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-slate-900 border-3 border-black rounded-lg p-12 shadow-[6px_6px_0px_#000]">
            <div className="text-5xl mb-6 select-none">🏆</div>
            <h2 className="font-display text-4xl font-black mb-4 uppercase tracking-tight">
              Ready to <span className="gradient-text">Play?</span>
            </h2>
            <p className="text-slate-300 mb-8 text-lg font-medium">
              Join the revolution in sports facility discovery. Your next great game starts here.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/signup" className="btn-primary text-base px-10 py-4">
                Get Started Free <ArrowRight className="w-5 h-5 stroke-[2.5px]" />
              </Link>
              <Link href="/venues" className="btn-secondary text-base px-10 py-4">
                <MapPin className="w-5 h-5" /> Browse Venues
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
