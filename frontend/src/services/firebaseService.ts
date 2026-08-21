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

// Firestore collection names
const BOOKINGS_COLLECTION = 'bookings';
const ADDRESSES_COLLECTION = 'addresses';
const REVIEWS_COLLECTION = 'reviews';
const TICKETS_COLLECTION = 'supportTickets';

/**
 * Initialize / Seed default data in Firestore if needed (No fake user data seeded in production)
 */
export async function seedInitialDataIfNeeded(_userId?: string): Promise<void> {
  // Clean production state: No mock or fake user data is seeded into Firestore.
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
    const q = userId && role === 'customer'
      ? query(coll, where('userId', '==', userId))
      : query(coll);

    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          onData([]);
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
        onData([]);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe bookings:', err);
    onData([]);
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
    userId: userId || booking.userId || 'guest_user',
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
    userId: userId || 'guest_user',
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
          onData([]);
          return;
        }
        const list: Address[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Address);
        });
        onData(list);
      },
      (err) => {
        console.error('Firestore addresses error:', err);
        onData([]);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe addresses:', err);
    onData([]);
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
    userId: userId || 'guest_user',
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
          onData([]);
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
        onData([]);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe reviews:', err);
    onData([]);
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
    const q = userId ? query(coll, where('userId', '==', userId)) : query(coll);
    return onSnapshot(
      q,
      (snapshot) => {
        const list: SupportTicket[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as SupportTicket);
        });
        onData(list);
      },
      (err) => {
        console.error('Firestore support tickets listener error:', err);
        onData([]);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe support tickets:', err);
    onData([]);
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
    userId: userId || 'guest_user',
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
