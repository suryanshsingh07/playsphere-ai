'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Star, Clock, ArrowLeft, Calendar, Check, Loader2, Shield, Zap, Ticket } from 'lucide-react';
import { Venue } from '@/shared/types';
import { formatCurrency, getSportEmoji, getSportColor, getSkillBadgeColor, cn } from '@/shared/helpers/utils';
import { generateTimeSlots } from '@/shared/helpers/pricing';
import { useAuth } from '@/contexts/AuthProvider';
import { createBooking, getVenueBookings, checkSlotAvailability, getVenueById } from '@/backend/firebase/firestore';

const MIN_DATE = new Date().toISOString().split('T')[0];
const MAX_DATE = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

export default function VenueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [venueLoading, setVenueLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState(MIN_DATE);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [slots, setSlots] = useState<ReturnType<typeof generateTimeSlots>>([]);
  const [booking, setBooking] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const confirmedTicket = '';

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) setVenueLoading(true);
      getVenueById(id)
        .then((dbVenue) => {
          if (!active) return;
          setVenue(dbVenue || null);
        })
        .catch(() => {
          if (!active) return;
          setVenue(null);
        })
        .finally(() => {
          if (active) setVenueLoading(false);
        });
    });
    return () => { active = false; };
  }, [id]);

  useEffect(() => {
    let active = true;
    if (venue) {
      const generatedSlots = generateTimeSlots(venue.timings.open, venue.timings.close, venue.price, selectedDate);
      
      Promise.resolve().then(() => {
        if (active) setSelectedSlot(null);
      });

      getVenueBookings(venue.id, selectedDate)
        .then((bookings) => {
          if (!active) return;
          const bookedSlots = new Set(bookings.map((b) => b.slot));
          const updatedSlots = generatedSlots.map((s) => ({
            ...s,
            available: s.available && !bookedSlots.has(s.label),
          }));
          setSlots(updatedSlots);
        })
        .catch((err) => {
          console.error('Error fetching bookings:', err);
          if (active) setSlots(generatedSlots);
        });
    }
    return () => { active = false; };
  }, [venue, selectedDate]);

  const handleBook = async () => {
    if (!user || !venue || !selectedSlot) return;
    setBooking('loading');
    try {
      const isAvailable = await checkSlotAvailability(venue.id, selectedDate, selectedSlot);
      if (!isAvailable) {
        setBooking('error');
        return;
      }

      const bookingId = await createBooking({
        playerId: user.uid,
        userId: user.uid,
        ownerId: venue.ownerId || 'system',
        venueId: venue.id,
        venueName: venue.name,
        venueArea: venue.area,
        sport: venue.sport,
        date: selectedDate,
        slot: selectedSlot,
        amount: selectedPrice,
        price: selectedPrice,
        paymentMethod: 'UPI',
        paymentStatus: 'payment_pending',
        bookingStatus: 'pending',
        status: 'pending',
        utrNumber: '',
        screenshotUrl: '',
        ticketId: '',
        ticketNumber: '',
        playerName: user.displayName || 'Player',
        playerEmail: user.email || '',
      });

      router.push(`/bookings/${bookingId}/payment`);
    } catch (err) {
      console.error('Error creating booking:', err);
      setBooking('error');
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (venueLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-medium">Loading venue details...</p>
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="font-display text-2xl font-bold text-white mb-2">Venue not found</h2>
          <p className="text-slate-400 mb-6">This venue may have been removed or doesn&apos;t exist.</p>
          <Link href="/venues" className="btn-secondary mt-4">Browse All Venues</Link>
        </div>
      </div>
    );
  }

  const sportColor = getSportColor(venue.sport);

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Image */}
      <div className="relative h-72 md:h-96 overflow-hidden border-b-3 border-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={venue.imageUrl} alt={venue.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 max-w-7xl mx-auto">
          <Link href="/venues" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Venues
          </Link>
          <div>
            <div className={cn("inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-md mb-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black", sportColor)}>
              {getSportEmoji(venue.sport)} {venue.sport.charAt(0).toUpperCase() + venue.sport.slice(1)}
            </div>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-white tracking-tight [text-shadow:2px_2px_0px_#000]">{venue.name}</h1>
          <div className="flex items-center gap-3 mt-2 text-slate-300 text-sm">
            <MapPin className="w-4 h-4 text-cyan-400" /> {venue.area}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-16 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="glass rounded-lg p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center border-r-2 border-black/30 last:border-0">
                <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="font-bold text-lg text-white">{venue.rating}</span>
                </div>
                <div className="text-slate-400 text-xs">{venue.reviewCount} reviews</div>
              </div>
              <div className="text-center border-r-2 border-black/30 last:border-0">
                <div className="font-display font-bold text-lg text-white mb-1">{formatCurrency(venue.price)}</div>
                <div className="text-slate-400 text-xs">per hour</div>
              </div>
              <div className="text-center border-r-2 border-black/30 last:border-0">
                <div className="font-display font-bold text-lg text-white mb-1">{venue.area}</div>
                <div className="text-slate-400 text-xs">Location</div>
              </div>
              <div className="text-center">
                <div className="font-display font-bold text-lg text-white mb-1">
                  {venue.timings.open} – {venue.timings.close}
                </div>
                <div className="text-slate-400 text-xs">Open hours</div>
              </div>
            </div>

            {/* Description */}
            <div className="glass rounded-lg p-6">
              <h2 className="font-display font-bold text-white text-lg mb-3">About this venue</h2>
              <p className="text-slate-300 leading-relaxed mb-4">{venue.description}</p>
              <div>
                <span className={cn('text-sm font-semibold px-3 py-1.5 rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black', getSkillBadgeColor(venue.skillLevel))}>
                  {venue.skillLevel === 'all' ? 'All Skill Levels' : `${venue.skillLevel.charAt(0).toUpperCase() + venue.skillLevel.slice(1)} Level`}
                </span>
              </div>
            </div>

            {/* Amenities */}
            <div className="glass rounded-lg p-6">
              <h2 className="font-display font-bold text-white text-lg mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {venue.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2 text-slate-300 text-sm bg-slate-900/50 p-2.5 rounded-md border border-black/40">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {amenity}
                  </div>
                ))}
              </div>
            </div>

            {/* Peak Pricing Info */}
            <div className="glass rounded-lg p-6 border-2 border-black">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-400" />
                <h2 className="font-display font-bold text-white text-lg">Smart Pricing</h2>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Morning', time: '5–8 AM', price: venue.peakPricing.morning, emoji: '🌅', isCheap: false },
                  { label: 'Afternoon', time: '11 AM–4 PM', price: venue.peakPricing.afternoon, emoji: '☀️', isCheap: true },
                  { label: 'Evening', time: '5–10 PM', price: venue.peakPricing.evening, emoji: '🌆', isCheap: false },
                ].map((t) => (
                  <div key={t.label} className={`text-center p-3 rounded-md border-2 border-black ${t.isCheap ? 'bg-emerald-400 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold' : 'bg-slate-900 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'}`}>
                    <div className="text-xl mb-1">{t.emoji}</div>
                    <div className={`text-xs ${t.isCheap ? 'text-black' : 'text-slate-400'}`}>{t.label}</div>
                    <div className={`text-xs ${t.isCheap ? 'text-black/70' : 'text-slate-500'}`}>{t.time}</div>
                    <div className="font-bold text-sm mt-1">{formatCurrency(t.price)}</div>
                    {t.isCheap && <div className="text-[10px] text-black font-extrabold tracking-wider mt-0.5">BEST VALUE</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Booking */}
          <div>
            <div className="glass rounded-lg p-6 sticky top-24 border-2 border-black">
              {booking === 'success' ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-md bg-emerald-400 border-2 border-black flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Check className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-white mb-2">Booking Confirmed!</h3>
                  <p className="text-slate-400 text-sm mb-4">Your slot is reserved.</p>
                  {confirmedTicket && (
                    <div className="bg-slate-900 border-2 border-cyan-400 rounded-md p-3 shadow-[3px_3px_0px_0px_#22d3ee] mb-4">
                      <div className="flex items-center justify-center gap-2 text-cyan-400">
                        <Ticket className="w-4 h-4" />
                        <span className="font-mono font-bold text-sm tracking-widest">{confirmedTicket}</span>
                      </div>
                      <p className="text-slate-500 text-xs mt-1">Your ticket number</p>
                    </div>
                  )}
                  <p className="text-slate-500 text-xs">Redirecting to dashboard...</p>
                </div>
              ) : (
                <>
                  <h2 className="font-display font-bold text-white text-lg mb-4">Book a Slot</h2>

                  {/* Date Picker */}
                  <div className="mb-4">
                    <label htmlFor="booking-date" className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                      <Calendar className="w-3.5 h-3.5 inline mr-1" />Select Date
                    </label>
                    <input
                      id="booking-date"
                      type="date"
                      value={selectedDate}
                      min={MIN_DATE}
                      max={MAX_DATE}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      placeholder="Select booking date"
                      title="Booking Date"
                      className="w-full bg-[#121620] border-2 border-black rounded-md px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    />
                  </div>

                  {/* Time Slots */}
                  <div className="mb-5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                      <Clock className="w-3.5 h-3.5 inline mr-1" />Time Slot
                    </label>
                    <div className="grid grid-cols-2 gap-2.5 max-h-60 overflow-y-auto scrollbar-hide p-1">
                      {slots.map((slot) => (
                        <button
                          key={slot.time}
                          disabled={!slot.available}
                          onClick={() => { setSelectedSlot(slot.label); setSelectedPrice(slot.finalPrice); }}
                          className={cn(
                            'text-xs rounded-md px-2 py-2.5 border-2 border-black transition-all text-center font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
                            !slot.available && 'opacity-40 cursor-not-allowed line-through bg-slate-800 text-slate-500 shadow-none border-dashed border-black/30',
                            slot.available && selectedSlot !== slot.label && 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]',
                            slot.available && selectedSlot === slot.label && 'bg-cyan-400 text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] translate-x-0.5 translate-y-0.5'
                          )}
                        >
                          <div className="font-medium">{slot.time}</div>
                          <div className={cn("font-bold text-[11px]", selectedSlot === slot.label ? "text-black" : "text-emerald-400")}>
                            {formatCurrency(slot.finalPrice)}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Summary */}
                  {selectedSlot && (
                    <div className="bg-[#121620] border-2 border-black rounded-md p-4 mb-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Slot</span>
                        <span className="text-white font-bold">{selectedSlot}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-2 pt-2 border-t border-black">
                        <span className="text-slate-400">Total</span>
                        <span className="text-cyan-400 font-extrabold text-base">{formatCurrency(selectedPrice)}</span>
                      </div>
                    </div>
                  )}

                  {booking === 'error' && (
                    <div className="bg-rose-500 border-2 border-black text-black font-bold rounded-md px-4 py-3 text-sm mb-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                      Slot unavailable. Please pick a different time.
                    </div>
                  )}

                  {user ? (
                    <button
                      onClick={handleBook}
                      disabled={!selectedSlot || booking === 'loading' || !venue.available}
                      className="w-full btn-primary justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {booking === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Booking'}
                    </button>
                  ) : (
                    <Link href="/auth/login" className="w-full btn-primary justify-center py-3">
                      Sign In to Book
                    </Link>
                  )}

                  <div className="flex items-center gap-2 mt-4 text-xs text-slate-500 justify-center">
                    <Shield className="w-3.5 h-3.5" />
                    Secure simulated booking • No payment required
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
