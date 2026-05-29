'use client';

import Link from 'next/link';
import { MapPin, Star, Bookmark, BookmarkCheck, ArrowRight } from 'lucide-react';
import { Venue } from '@/shared/types';
import { cn, formatCurrency, getSportEmoji, getSportColor, getSkillBadgeColor } from '@/shared/helpers/utils';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { toggleSavedVenue } from '@/backend/firebase/firestore';
import { useRouter } from 'next/navigation';

interface VenueCardProps {
  venue: Venue;
  className?: string;
}

export function VenueCard({ venue, className }: VenueCardProps) {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const isSaved = profile?.savedVenues?.includes(venue.id) || false;
  const sportColor = getSportColor(venue.sport);

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setSaving(true);
    try {
      await toggleSavedVenue(user.uid, venue.id, isSaved);
    } catch (err) {
      console.error('Error toggling saved venue:', err);
      alert('Unable to save venue. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={cn('glass rounded-lg overflow-hidden card-hover group', className)}>
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-slate-800 border-b-2 border-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={venue.imageUrl}
          alt={venue.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Sport badge */}
        <div className={cn("absolute top-3 left-3 rounded-md px-2.5 py-1 text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black", sportColor)}>
          {getSportEmoji(venue.sport)} {venue.sport.charAt(0).toUpperCase() + venue.sport.slice(1)}
        </div>
        {/* Availability */}
        {!venue.available && (
          <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
            <span className="text-black font-extrabold text-sm bg-rose-500 px-3 py-1 rounded-md border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">Unavailable</span>
          </div>
        )}
        {/* Save button */}
        <button
          onClick={handleSaveToggle}
          disabled={saving}
          className="absolute top-3 right-3 w-8 h-8 rounded-md bg-slate-900 border-2 border-black flex items-center justify-center text-white hover:text-cyan-400 transition-colors disabled:opacity-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          {isSaved ? <BookmarkCheck className="w-4 h-4 text-cyan-400" /> : <Bookmark className="w-4 h-4" />}
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-display font-bold text-white text-base leading-tight flex-1 pr-2">{venue.name}</h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-amber-400 text-sm font-semibold">{venue.rating}</span>
            <span className="text-slate-500 text-xs">({venue.reviewCount})</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-400 text-sm mb-3">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{venue.area}</span>
        </div>

        {/* Skill level badge */}
        <div className="mb-3">
          <span className={cn('inline-block text-xs px-2.5 py-1 rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border border-black', getSkillBadgeColor(venue.skillLevel))}>
            {venue.skillLevel === 'all' ? 'All Levels' : venue.skillLevel.charAt(0).toUpperCase() + venue.skillLevel.slice(1)}
          </span>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1.5 mt-3 mb-4">
          {venue.amenities.slice(0, 3).map((amenity) => (
            <span key={amenity} className="text-xs text-slate-300 bg-slate-900 px-2 py-0.5 rounded-md border border-black/40">
              {amenity}
            </span>
          ))}
          {venue.amenities.length > 3 && (
            <span className="text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-black/40">
              +{venue.amenities.length - 3}
            </span>
          )}
        </div>

        {/* Footer: price + CTA */}
        <div className="flex items-center justify-between border-t border-black/30 pt-4">
          <div>
            <span className="text-xl font-display font-bold text-white">{formatCurrency(venue.price)}</span>
            <span className="text-slate-500 text-xs ml-1">/hr</span>
          </div>
          <Link
            href={`/venues/${venue.id}`}
            className={cn(
              'flex items-center gap-1.5 text-sm font-semibold transition-colors',
              venue.available
                ? 'text-cyan-400 hover:text-cyan-300'
                : 'text-slate-500 pointer-events-none'
            )}
          >
            {venue.available ? 'Book Now' : 'Unavailable'}
            {venue.available && <ArrowRight className="w-3.5 h-3.5" />}
          </Link>
        </div>
      </div>
    </div>
  );
}
