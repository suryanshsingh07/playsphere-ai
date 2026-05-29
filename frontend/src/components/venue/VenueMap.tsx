'use client';

import { useMemo, useState } from 'react';
import { GoogleMap, useLoadScript, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { Venue } from '@/shared/types';
import { Loader2, MapPin } from 'lucide-react';
import { formatCurrency, getSportEmoji } from '@/shared/helpers/utils';

interface VenueMapProps {
  venues: Venue[];
}

export function VenueMap({ venues }: VenueMapProps) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  });

  const center = useMemo(() => ({ lat: 26.8467, lng: 80.9462 }), []);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  if (!isLoaded) {
    return (
      <div className="h-[400px] sm:h-[500px] md:h-[600px] w-full flex items-center justify-center glass rounded-2xl border-2 border-black">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-medium">Loading map...</p>
        </div>
      </div>
    );
  }

  // Sleek dark mode map style
  const mapStyles = [
    { elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
    { featureType: 'poi.sports_complex', elementType: 'geometry', stylers: [{ color: '#064e3b' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#334155' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1e293b' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
    { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#334155' }] },
  ];

  return (
    <div className="h-[400px] sm:h-[500px] md:h-[600px] w-full rounded-xl overflow-hidden relative border-2 border-black shadow-[4px_4px_0px_0px_#000]">
      <GoogleMap
        zoom={12}
        center={center}
        mapContainerClassName="w-full h-full"
        options={{
          styles: mapStyles,
          disableDefaultUI: true,
          zoomControl: true,
          zoomControlOptions: {
            position: typeof google !== 'undefined' ? google.maps.ControlPosition.RIGHT_BOTTOM : undefined,
          },
          gestureHandling: 'cooperative',
        }}
      >
        {venues.map((venue) => (
          <MarkerF
            key={venue.id}
            position={{ lat: venue.coordinates.lat, lng: venue.coordinates.lng }}
            onClick={() => setSelectedVenue(venue)}
            icon={{
              path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
              fillColor: venue.available ? '#22d3ee' : '#64748b',
              fillOpacity: 1,
              strokeWeight: 1.5,
              strokeColor: '#000000',
              scale: 1.8,
              anchor: typeof google !== 'undefined' ? new google.maps.Point(12, 24) : undefined,
            }}
          />
        ))}

        {selectedVenue && (
          <InfoWindowF
            position={{ lat: selectedVenue.coordinates.lat, lng: selectedVenue.coordinates.lng }}
            onCloseClick={() => setSelectedVenue(null)}
            options={{
              pixelOffset: typeof google !== 'undefined' ? new google.maps.Size(0, -36) : undefined,
              disableAutoPan: false,
            }}
          >
            {/* Dark-styled InfoWindow — overrides Google's white default via wrapper */}
            <div className="rounded-lg overflow-hidden bg-[#0f172a] border-2 border-black shadow-[4px_4px_0px_#000] min-w-[220px] max-w-[280px] text-white">
              {/* Venue image */}
              <div className="relative h-28 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedVenue.imageUrl}
                  alt={selectedVenue.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                <div className="absolute bottom-2 left-2 text-xs font-bold px-2 py-0.5 rounded border border-black bg-[#22d3ee] text-black">
                  {getSportEmoji(selectedVenue.sport)} {selectedVenue.sport}
                </div>
                {!selectedVenue.available && (
                  <div className="absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded border border-black bg-[#f43f5e] text-black">
                    Unavailable
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <div className="font-extrabold text-sm mb-1 font-sans">
                  {selectedVenue.name}
                </div>
                <div className="text-slate-400 text-xs mb-2 flex items-center gap-1">
                  <span>📍</span> {selectedVenue.area}
                </div>
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-[#22d3ee] font-bold text-sm">{formatCurrency(selectedVenue.price)}/hr</span>
                  <span className="text-[#fbbf24] text-xs font-semibold">★ {selectedVenue.rating}</span>
                </div>
                <a
                  href={`/venues/${selectedVenue.id}`}
                  className="block text-center bg-[#22d3ee] text-black font-bold text-xs py-2 px-3 rounded-md border-2 border-black shadow-[2px_2px_0px_#000] no-underline"
                >
                  View & Book →
                </a>
              </div>
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>

      {/* Venue count badge */}
      <div className="absolute top-3 left-3 bg-slate-900 border-2 border-black rounded-md px-3 py-1.5 text-xs font-bold text-white shadow-[3px_3px_0px_0px_#000] pointer-events-none">
        <MapPin className="w-3.5 h-3.5 inline mr-1.5 text-cyan-400" />
        {venues.filter((v) => v.available).length} active venues
      </div>
    </div>
  );
}
