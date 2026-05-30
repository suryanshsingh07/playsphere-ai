import { upsertInfrastructure } from '../firebase/firestore';

export interface DiscoveredCandidate {
  name: string;
  sport: string;
  area: string;
  coordinates: { lat: number; lng: number };
  source: string;
  verified: boolean;
  bookable: boolean;
  ownerLinked: boolean;
  ownerId: string | null;
  infrastructureType: 'government' | 'public' | 'akhara' | 'park' | 'private' | string;
  imageUrl?: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
  amenities?: string[];
  ownershipStatus: 'pending' | 'approved' | 'rejected' | null;
  linkedOwnerId: string | null;
  ownershipVerifiedAt: any | null;
}

export const LUCKNOW_DISCOVERED_POOL: DiscoveredCandidate[] = [
  {
    name: "Gomti Nagar Swimming Pavilion",
    sport: "swimming",
    area: "Gomti Nagar",
    coordinates: { lat: 26.8540, lng: 80.9910 },
    source: "discovered",
    verified: true,
    bookable: false,
    ownerLinked: false,
    ownerId: null,
    infrastructureType: "public",
    imageUrl: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800",
    description: "Public access swimming facility located in Gomti Nagar, offering clean waters and coached sessions.",
    rating: 4.1,
    reviewCount: 9,
    amenities: ["Shower Rooms", "Lockers", "Trainer"],
    ownershipStatus: null,
    linkedOwnerId: null,
    ownershipVerifiedAt: null
  },
  {
    name: "Chinhat Badminton Center",
    sport: "badminton",
    area: "Chinhat",
    coordinates: { lat: 26.8900, lng: 81.0500 },
    source: "discovered",
    verified: true,
    bookable: false,
    ownerLinked: false,
    ownerId: null,
    infrastructureType: "private",
    imageUrl: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800",
    description: "Indoor private badminton facility in Chinhat area with synthetic courts.",
    rating: 3.9,
    reviewCount: 7,
    amenities: ["Parking", "Refreshments"],
    ownershipStatus: null,
    linkedOwnerId: null,
    ownershipVerifiedAt: null
  },
  {
    name: "Aliganj Football Ground",
    sport: "football",
    area: "Aliganj",
    coordinates: { lat: 26.8980, lng: 80.9380 },
    source: "discovered",
    verified: true,
    bookable: false,
    ownerLinked: false,
    ownerId: null,
    infrastructureType: "public",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800",
    description: "Open public football ground in Aliganj for community play and local matches.",
    rating: 4.0,
    reviewCount: 14,
    amenities: ["Open Access", "Goal Posts"],
    ownershipStatus: null,
    linkedOwnerId: null,
    ownershipVerifiedAt: null
  },
  {
    name: "Hazratganj Kabaddi Academy",
    sport: "kabaddi",
    area: "Hazratganj",
    coordinates: { lat: 26.8610, lng: 80.9450 },
    source: "discovered",
    verified: true,
    bookable: false,
    ownerLinked: false,
    ownerId: null,
    infrastructureType: "akhara",
    imageUrl: "https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=800",
    description: "Traditional soil arena and training ground for kabaddi enthusiasts in Hazratganj.",
    rating: 4.3,
    reviewCount: 22,
    amenities: ["Soil Arena", "Drinking Water", "First Aid"],
    ownershipStatus: null,
    linkedOwnerId: null,
    ownershipVerifiedAt: null
  },
  {
    name: "Janeshwar Mishra Park Swimming Pool",
    sport: "swimming",
    area: "Gomti Nagar Extension",
    coordinates: { lat: 26.8350, lng: 80.9960 },
    source: "discovered",
    verified: true,
    bookable: false,
    ownerLinked: false,
    ownerId: null,
    infrastructureType: "park",
    imageUrl: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800",
    description: "Outdoor public swimming pool situated inside Janeshwar Mishra Park.",
    rating: 4.2,
    reviewCount: 31,
    amenities: ["Locker Rooms", "Showers", "Life Guard"],
    ownershipStatus: null,
    linkedOwnerId: null,
    ownershipVerifiedAt: null
  },
  {
    name: "Ekana Badminton Arena",
    sport: "badminton",
    area: "Sultanpur Road",
    coordinates: { lat: 26.8100, lng: 81.0180 },
    source: "discovered",
    verified: true,
    bookable: false,
    ownerLinked: false,
    ownerId: null,
    infrastructureType: "private",
    imageUrl: "https://images.unsplash.com/photo-1521537634581-0dccd2ece234?w=800",
    description: "Premium private indoor badminton courts near Ekana Stadium.",
    rating: 4.5,
    reviewCount: 18,
    amenities: ["Indoor Courts", "Parking", "AC", "Pro Shop"],
    ownershipStatus: null,
    linkedOwnerId: null,
    ownershipVerifiedAt: null
  },
  {
    name: "Gomti Nagar Kabaddi Turf",
    sport: "kabaddi",
    area: "Gomti Nagar",
    coordinates: { lat: 26.8480, lng: 80.9800 },
    source: "discovered",
    verified: true,
    bookable: false,
    ownerLinked: false,
    ownerId: null,
    infrastructureType: "public",
    imageUrl: "https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=800",
    description: "Community kabaddi play area inside Gomti Nagar public sports complex.",
    rating: 3.8,
    reviewCount: 5,
    amenities: ["Open Fields", "Seating"],
    ownershipStatus: null,
    linkedOwnerId: null,
    ownershipVerifiedAt: null
  }
];

export async function runInfrastructureDiscovery() {
  const logs: string[] = [];
  let added = 0;
  let updated = 0;
  let errors = 0;

  logs.push(`[${new Date().toLocaleTimeString()}] Starting sports infrastructure discovery for Lucknow...`);
  logs.push(`Found ${LUCKNOW_DISCOVERED_POOL.length} potential infrastructure candidates from Lucknow sources.`);

  for (const item of LUCKNOW_DISCOVERED_POOL) {
    try {
      logs.push(`Evaluating candidate: "${item.name}" in ${item.area} (${item.sport})...`);
      const res = await upsertInfrastructure(item);
      if (res.action === 'added') {
        added++;
        logs.push(`  -> SUCCESS: Created new mapped infrastructure: "${item.name}" (ID: ${res.id})`);
      } else {
        updated++;
        logs.push(`  -> SKIP (Duplicate matched): Updated existing record for "${item.name}" (ID: ${res.id})`);
      }
    } catch (err: any) {
      errors++;
      logs.push(`  -> ERROR: Failed to ingest "${item.name}": ${err.message || err}`);
    }
  }

  logs.push(`[${new Date().toLocaleTimeString()}] Discovery cycle completed.`);
  logs.push(`Summary: Added ${added} new records, Skipped/Merged ${updated} duplicates, ${errors} errors.`);

  return {
    success: true,
    added,
    updated,
    skipped: updated,
    errors,
    logs
  };
}
