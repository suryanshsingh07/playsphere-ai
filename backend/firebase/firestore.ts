import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import { Venue, Booking, UserProfile, VenueFilters, ApprovalStatus } from '@/shared/types';
import { generateTicketId } from '@/shared/helpers/ticket';

// ── VENUES ──────────────────────────────────────────────────────────────────

export async function getAllVenues(): Promise<Venue[]> {
  const snap = await getDocs(collection(db, 'venues'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Venue));
}

/** Fetch only active venues from Firestore owned by approved owners.
 *  Firestore is the single source of truth — no static fallback. */
export async function getApprovedVenues(): Promise<Venue[]> {
  const q = query(
    collection(db, 'venues'),
    where('available', '==', true)
  );
  const snap = await getDocs(q);
  const venues = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Venue));
  return venues.filter((v) => v.ownerId !== 'system' && v.approvalStatus === 'approved');
}

export async function getVenueById(id: string): Promise<Venue | null> {
  const snap = await getDoc(doc(db, 'venues', id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Venue) : null;
}

export async function getFilteredVenues(filters: VenueFilters): Promise<Venue[]> {
  let q = query(collection(db, 'venues'));

  if (filters.sport) {
    q = query(q, where('sport', '==', filters.sport));
  }
  if (filters.area) {
    q = query(q, where('area', '==', filters.area));
  }
  if (filters.skillLevel) {
    q = query(q, where('skillLevel', 'in', [filters.skillLevel, 'all']));
  }

  const snap = await getDocs(q);
  let venues = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Venue));

  // Client-side filters for fields not supported by Firestore compound queries
  if (filters.maxPrice) {
    venues = venues.filter((v) => v.price <= filters.maxPrice!);
  }
  if (filters.minPrice) {
    venues = venues.filter((v) => v.price >= filters.minPrice!);
  }
  if (filters.minRating) {
    venues = venues.filter((v) => v.rating >= filters.minRating!);
  }
  if (filters.searchQuery) {
    const searchQ = filters.searchQuery.toLowerCase();
    venues = venues.filter(
      (v) =>
        v.name.toLowerCase().includes(searchQ) ||
        v.area.toLowerCase().includes(searchQ) ||
        v.description.toLowerCase().includes(searchQ)
    );
  }

  // Filter out system seed venues and keep only approved active venues
  return venues.filter((v) => v.ownerId !== 'system' && v.approvalStatus === 'approved' && v.available === true);
}

export async function addVenue(venue: Omit<Venue, 'id' | 'createdAt'>): Promise<string> {
  let ownerName = 'System';
  if (venue.ownerId && venue.ownerId !== 'system') {
    try {
      const profile = await getUserProfile(venue.ownerId);
      if (profile) {
        ownerName = profile.displayName;
      }
    } catch (err) {
      console.error('Error fetching owner profile in addVenue:', err);
    }
  }

  const ref = await addDoc(collection(db, 'venues'), {
    ...venue,
    ownerName,
    venueName: venue.name,
    sportType: venue.sport,
    location: venue.address || venue.area,
    status: venue.available ? 'active' : 'inactive',
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateVenue(id: string, data: Partial<Venue>): Promise<void> {
  const updates: any = { ...data };
  if (data.name) updates.venueName = data.name;
  if (data.sport) updates.sportType = data.sport;
  if (data.address || data.area) updates.location = data.address || data.area;
  if (data.available !== undefined) {
    updates.status = data.available ? 'active' : 'inactive';
  }
  await updateDoc(doc(db, 'venues', id), updates);
}

export async function deleteVenue(id: string): Promise<void> {
  await deleteDoc(doc(db, 'venues', id));
}

/** Fetch all venues owned by a specific owner */
export async function getOwnerVenues(ownerId: string): Promise<Venue[]> {
  const q = query(collection(db, 'venues'), where('ownerId', '==', ownerId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Venue));
}

/** Real-time listener for owner's venues */
export function subscribeOwnerVenues(ownerId: string, callback: (venues: Venue[]) => void): Unsubscribe {
  const q = query(collection(db, 'venues'), where('ownerId', '==', ownerId));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Venue)));
  });
}

// ── BOOKINGS ─────────────────────────────────────────────────────────────────

export async function getUserBookings(userId: string): Promise<Booking[]> {
  const q = query(
    collection(db, 'bookings'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking));
}

export async function createBooking(booking: Omit<Booking, 'id' | 'bookingId' | 'createdAt'>): Promise<string> {
  const docRef = doc(collection(db, 'bookings'));
  const bookingId = docRef.id;
  const bookingData = {
    ...booking,
    bookingId,
    id: bookingId,
    userId: booking.playerId || (booking as any).userId,
    playerId: booking.playerId || (booking as any).userId,
    amount: booking.amount || (booking as any).price || 0,
    price: booking.amount || (booking as any).price || 0,
    paymentStatus: 'payment_pending',
    bookingStatus: 'pending',
    status: 'pending', // legacy compatibility
    utrNumber: '',
    screenshotUrl: '',
    ticketId: '',
    ticketNumber: '', // legacy compatibility
    createdAt: serverTimestamp(),
  };
  await setDoc(docRef, bookingData);
  return bookingId;
}

export async function submitPaymentProof(bookingId: string, utrNumber: string, screenshotUrl: string): Promise<void> {
  await updateDoc(doc(db, 'bookings', bookingId), {
    paymentStatus: 'verification_pending',
    utrNumber,
    screenshotUrl,
  });
}

export async function approvePayment(bookingId: string): Promise<void> {
  const bookingRef = doc(db, 'bookings', bookingId);
  const snap = await getDoc(bookingRef);
  if (!snap.exists()) {
    throw new Error('Booking not found');
  }
  const booking = snap.data() as Booking;
  const ticketId = generateTicketId(booking.sport);
  await updateDoc(bookingRef, {
    paymentStatus: 'paid',
    bookingStatus: 'confirmed',
    status: 'confirmed', // legacy compatibility
    ticketId,
    ticketNumber: ticketId, // legacy compatibility
  });
}

export async function rejectPayment(bookingId: string): Promise<void> {
  await updateDoc(doc(db, 'bookings', bookingId), {
    paymentStatus: 'rejected',
    bookingStatus: 'pending',
    status: 'pending', // legacy compatibility
  });
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  await updateDoc(doc(db, 'users', uid), data);
}

export async function cancelBooking(bookingId: string): Promise<void> {
  await updateDoc(doc(db, 'bookings', bookingId), {
    bookingStatus: 'cancelled',
    status: 'cancelled', // legacy compatibility
  });
}

export async function getBookingById(bookingId: string): Promise<Booking | null> {
  const snap = await getDoc(doc(db, 'bookings', bookingId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Booking) : null;
}

/** Fetch all bookings for a list of venue IDs (for owner dashboard) */
export async function getVenueBookingsForOwner(venueIds: string[]): Promise<Booking[]> {
  if (venueIds.length === 0) return [];
  // Firestore 'in' supports up to 30 items
  const chunks: string[][] = [];
  for (let i = 0; i < venueIds.length; i += 30) {
    chunks.push(venueIds.slice(i, i + 30));
  }
  const results: Booking[] = [];
  for (const chunk of chunks) {
    const q = query(
      collection(db, 'bookings'),
      where('venueId', 'in', chunk),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    results.push(...snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking)));
  }
  return results;
}

/** Real-time listener for bookings on a set of venue IDs */
export function subscribeVenueBookings(venueIds: string[], callback: (bookings: Booking[]) => void): Unsubscribe {
  if (venueIds.length === 0) {
    callback([]);
    return () => {};
  }
  const q = query(
    collection(db, 'bookings'),
    where('venueId', 'in', venueIds.slice(0, 30)),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking)));
  });
}

/** Admin: fetch ALL bookings */
export async function getAllBookings(): Promise<Booking[]> {
  const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking));
}

// ── SAVED VENUES ─────────────────────────────────────────────────────────────

export async function toggleSavedVenue(userId: string, venueId: string, isSaved: boolean): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    savedVenues: isSaved ? arrayRemove(venueId) : arrayUnion(venueId),
  });
}

/** Fetch venue documents by array of IDs (for saved venues) */
export async function getVenuesByIds(ids: string[]): Promise<Venue[]> {
  if (ids.length === 0) return [];
  const results: Venue[] = [];
  await Promise.all(
    ids.map(async (id) => {
      const snap = await getDoc(doc(db, 'venues', id));
      if (snap.exists()) results.push({ id: snap.id, ...snap.data() } as Venue);
    })
  );
  return results;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function getVenueBookings(venueId: string, date: string): Promise<Booking[]> {
  const q = query(
    collection(db, 'bookings'),
    where('venueId', '==', venueId),
    where('date', '==', date)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as Booking))
    .filter((b) => b.status !== 'cancelled');
}

export async function checkSlotAvailability(venueId: string, date: string, slot: string): Promise<boolean> {
  const bookings = await getVenueBookings(venueId, date);
  return !bookings.some(b => b.slot === slot);
}

// ── USERS (Admin) ─────────────────────────────────────────────────────────────

/**
 * Admin: fetch all user profiles.
 * CRITICAL FIX: Legacy player docs do NOT store `uid` inside the document body —
 * only in the document path. We always inject uid from d.id to ensure it's populated.
 */
export async function getAllUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map((d) => ({
    uid: d.id,         // Always inject from document path — never rely on stored uid field
    ...d.data(),
  } as UserProfile));
}

/** Admin: update an owner's approval status */
export async function updateOwnerApproval(uid: string, status: ApprovalStatus): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { approvalStatus: status });
}

/** Get users with a specific role */
export async function getUsersByRole(role: 'player' | 'owner' | 'admin'): Promise<UserProfile[]> {
  const q = query(collection(db, 'users'), where('role', '==', role));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    uid: d.id,
    ...d.data(),
  } as UserProfile));
}

// ── ADMIN REALTIME LISTENERS ──────────────────────────────────────────────────

/**
 * Admin: realtime listener for ALL users.
 * Injects uid from document path so legacy docs without stored uid field still work.
 */
export function subscribeAllUsers(callback: (users: UserProfile[]) => void): Unsubscribe {
  return onSnapshot(collection(db, 'users'), (snap) => {
    callback(snap.docs.map((d) => ({
      uid: d.id,
      ...d.data(),
    } as UserProfile)));
  }, (err) => {
    console.error('[Admin] Users listener error:', err);
    callback([]);
  });
}

/**
 * Admin: realtime listener for ALL venues.
 */
export function subscribeAllVenues(callback: (venues: Venue[]) => void): Unsubscribe {
  return onSnapshot(collection(db, 'venues'), (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Venue)));
  }, (err) => {
    console.error('[Admin] Venues listener error:', err);
    callback([]);
  });
}

/**
 * Admin: realtime listener for ALL bookings (ordered by creation desc).
 */
export function subscribeAllBookings(callback: (bookings: Booking[]) => void): Unsubscribe {
  const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking)));
  }, (err) => {
    console.error('[Admin] Bookings listener error:', err);
    callback([]);
  });
}

/** Realtime listener for approved active venues */
export function subscribeApprovedVenues(callback: (venues: Venue[]) => void): Unsubscribe {
  const q = query(
    collection(db, 'venues'),
    where('available', '==', true)
  );
  return onSnapshot(q, (snap) => {
    const venues = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Venue));
    callback(venues.filter((v) => v.ownerId !== 'system' && v.approvalStatus === 'approved'));
  }, (err) => {
    console.error('Error in approved venues listener:', err);
    callback([]);
  });
}

/** Realtime listener for bookings belonging to a specific owner */
export function subscribeOwnerBookings(ownerId: string, callback: (bookings: Booking[]) => void): Unsubscribe {
  const q = query(collection(db, 'bookings'), where('ownerId', '==', ownerId));
  return onSnapshot(q, (snap) => {
    const bookings = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking));
    // Sort by createdAt desc client-side to avoid composite index requirements
    bookings.sort((a, b) => {
      const timeA = (a.createdAt as any)?.seconds || 0;
      const timeB = (b.createdAt as any)?.seconds || 0;
      return timeB - timeA;
    });
    callback(bookings);
  }, (err) => {
    console.error('Error in owner bookings listener:', err);
    callback([]);
  });
}
