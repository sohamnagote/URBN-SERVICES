import {
  db,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from '../lib/firebase';
import { Address, Booking, BookingStatus, BookingStatusStep, Review, SupportTicket } from '../types';
import { DEFAULT_ADDRESSES, INITIAL_BOOKINGS, MOCK_REVIEWS as REVIEWS_DATA } from '../data/mockData';

// Firestore collection names
const BOOKINGS_COLLECTION = 'bookings';
const ADDRESSES_COLLECTION = 'addresses';
const REVIEWS_COLLECTION = 'reviews';
const TICKETS_COLLECTION = 'supportTickets';

/**
 * Initialize / Seed default data in Firestore if collection is empty
 */
export async function seedInitialDataIfNeeded(userId?: string) {
  try {
    // Check and seed reviews
    const reviewsSnap = await getDocs(collection(db, REVIEWS_COLLECTION));
    if (reviewsSnap.empty) {
      for (const rev of REVIEWS_DATA) {
        await setDoc(doc(db, REVIEWS_COLLECTION, rev.id), {
          ...rev,
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Check and seed default addresses for user (or demo user)
    const effectiveUserId = userId || 'demo-user-nashik';
    const addrQuery = query(
      collection(db, ADDRESSES_COLLECTION),
      where('userId', '==', effectiveUserId)
    );
    const addrSnap = await getDocs(addrQuery);
    if (addrSnap.empty) {
      for (const addr of DEFAULT_ADDRESSES) {
        await setDoc(doc(db, ADDRESSES_COLLECTION, addr.id), {
          ...addr,
          userId: effectiveUserId,
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Check and seed initial bookings
    const bookingsSnap = await getDocs(collection(db, BOOKINGS_COLLECTION));
    if (bookingsSnap.empty) {
      for (const b of INITIAL_BOOKINGS) {
        await setDoc(doc(db, BOOKINGS_COLLECTION, b.id), {
          ...b,
          userId: effectiveUserId,
          createdAt: b.createdAt || new Date().toISOString(),
        });
      }
    }
  } catch (error) {
    console.warn('Firestore seeding check (non-blocking):', error);
  }
}

/**
 * Real-time Bookings Subscription
 */
export function subscribeBookings(
  userId: string | undefined,
  role: 'customer' | 'provider' | 'operations',
  onData: (bookings: Booking[]) => void
) {
  try {
    const coll = collection(db, BOOKINGS_COLLECTION);
    // Ops and Providers can see all bookings in Nashik; customers see their own or all for demo
    const q = query(coll);

    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          onData(INITIAL_BOOKINGS);
          return;
        }
        const list: Booking[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Booking);
        });
        // Sort newest first
        list.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
        onData(list);
      },
      (error) => {
        console.error('Firestore bookings listener error:', error);
        onData(INITIAL_BOOKINGS);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe bookings:', err);
    onData(INITIAL_BOOKINGS);
    return () => {};
  }
}

/**
 * Save new booking to Firestore
 */
export async function createBookingInFirestore(booking: Booking, userId?: string): Promise<void> {
  const docRef = doc(db, BOOKINGS_COLLECTION, booking.id);
  await setDoc(docRef, {
    ...booking,
    userId: userId || 'demo-user-nashik',
    createdAt: new Date().toISOString(),
    serverCreatedAt: serverTimestamp(),
  });
}

/**
 * Update booking status and timeline in Firestore
 */
export async function updateBookingStatusInFirestore(
  bookingId: string,
  newStatus: BookingStatus,
  statusHistory: BookingStatusStep[]
): Promise<void> {
  const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
  await updateDoc(docRef, {
    status: newStatus,
    statusHistory,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Save review & rating for a booking in Firestore
 */
export async function submitBookingReviewInFirestore(
  bookingId: string,
  rating: number,
  reviewComment: string,
  authorName: string,
  locality: string,
  serviceTitle: string,
  userId?: string
): Promise<void> {
  // 1. Update the booking document
  const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
  await updateDoc(bookingRef, {
    userRating: rating,
    userReview: reviewComment,
  });

  // 2. Add to public reviews collection
  const reviewId = `rev-${Date.now()}`;
  const newReview: Review = {
    id: reviewId,
    author: authorName || 'Nashik Resident',
    locality: locality || 'Nashik',
    rating,
    comment: reviewComment,
    timeAgo: 'Just now',
    serviceTitle,
    verified: true,
    avatarInitials: (authorName || 'NR').substring(0, 2).toUpperCase(),
    avatarColor: 'bg-blue-600',
  };

  const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
  await setDoc(reviewRef, {
    ...newReview,
    bookingId,
    userId: userId || 'demo-user-nashik',
    createdAt: new Date().toISOString(),
  });
}

/**
 * Real-time Saved Addresses Subscription
 */
export function subscribeAddresses(
  userId: string | undefined,
  onData: (addresses: Address[]) => void
) {
  try {
    const coll = collection(db, ADDRESSES_COLLECTION);
    const q = userId ? query(coll, where('userId', '==', userId)) : query(coll);

    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          onData(DEFAULT_ADDRESSES);
          return;
        }
        const list: Address[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Address);
        });
        onData(list.length > 0 ? list : DEFAULT_ADDRESSES);
      },
      (err) => {
        console.error('Firestore addresses error:', err);
        onData(DEFAULT_ADDRESSES);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe addresses:', err);
    onData(DEFAULT_ADDRESSES);
    return () => {};
  }
}

/**
 * Save new address to Firestore
 */
export async function saveAddressToFirestore(address: Address, userId?: string): Promise<void> {
  const docRef = doc(db, ADDRESSES_COLLECTION, address.id);
  await setDoc(docRef, {
    ...address,
    userId: userId || 'demo-user-nashik',
    createdAt: new Date().toISOString(),
  });
}

/**
 * Delete address from Firestore
 */
export async function deleteAddressFromFirestore(addressId: string): Promise<void> {
  const docRef = doc(db, ADDRESSES_COLLECTION, addressId);
  await deleteDoc(docRef);
}

/**
 * Real-time Reviews Subscription
 */
export function subscribeReviews(onData: (reviews: Review[]) => void) {
  try {
    const coll = collection(db, REVIEWS_COLLECTION);
    return onSnapshot(
      coll,
      (snapshot) => {
        if (snapshot.empty) {
          onData(REVIEWS_DATA);
          return;
        }
        const list: Review[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Review);
        });
        onData(list);
      },
      (err) => {
        console.error('Firestore reviews listener error:', err);
        onData(REVIEWS_DATA);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe reviews:', err);
    onData(REVIEWS_DATA);
    return () => {};
  }
}

/**
 * Real-time Support Tickets Subscription
 */
export function subscribeSupportTickets(
  userId: string | undefined,
  onData: (tickets: SupportTicket[]) => void
) {
  try {
    const coll = collection(db, TICKETS_COLLECTION);
    return onSnapshot(
      coll,
      (snapshot) => {
        const list: SupportTicket[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as SupportTicket);
        });
        onData(list);
      },
      (err) => {
        console.error('Firestore support tickets listener error:', err);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe support tickets:', err);
    return () => {};
  }
}

/**
 * Create Support Ticket in Firestore
 */
export async function createSupportTicketInFirestore(
  ticket: SupportTicket,
  userId?: string
): Promise<void> {
  const docRef = doc(db, TICKETS_COLLECTION, ticket.id);
  await setDoc(docRef, {
    ...ticket,
    userId: userId || 'demo-user-nashik',
    createdAt: new Date().toISOString(),
  });
}

/**
 * Add Message to Support Ticket in Firestore
 */
export async function addMessageToSupportTicketInFirestore(
  ticketId: string,
  newMessage: {
    id: string;
    sender: 'user' | 'agent' | 'bot';
    senderName: string;
    text: string;
    timestamp: string;
  }
): Promise<void> {
  const docRef = doc(db, TICKETS_COLLECTION, ticketId);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    const current = snap.data() as SupportTicket;
    const updatedMessages = [...(current.messages || []), newMessage];
    await updateDoc(docRef, {
      messages: updatedMessages,
      lastUpdated: 'Just now',
    });
  }
}
