import React, { useState, useEffect } from 'react';
import {
  ActiveTab,
  Address,
  AppRole,
  Booking,
  BookingStatus,
  CartItem,
  CategoryId,
  ServiceCategory,
  ServiceItem,
} from './types';
import {
  DEFAULT_ADDRESSES,
  DEFAULT_PROVIDER,
  INITIAL_BOOKINGS,
  SERVICE_CATEGORIES,
} from './data/mockData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { CategoryScreen } from './components/CategoryScreen';
import { ConfirmBookingScreen } from './components/ConfirmBookingScreen';
import { LiveBookingTracker } from './components/LiveBookingTracker';
import { BookingsListScreen } from './components/BookingsListScreen';
import { SupportScreen } from './components/SupportScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { NashikLiveCoverageMap } from './components/NashikLiveCoverageMap';
import { PromiseModal } from './components/PromiseModal';
import { ProviderDashboard } from './components/ProviderDashboard';
import { OperationsConsole } from './components/OperationsConsole';
import { AdminConsole } from './components/AdminConsole';
import { AuthModal } from './components/AuthModal';
import { auth, onAuthStateChanged, FirebaseUser } from './lib/firebase';
import { apiClient } from './services/apiClient';
import { pushNotificationClient } from './services/pushNotificationClient';
import {
  seedInitialDataIfNeeded,
  subscribeBookings,
  subscribeAddresses,
  createBookingInFirestore,
  updateBookingStatusInFirestore,
  submitBookingReviewInFirestore,
  saveAddressToFirestore,
  deleteAddressFromFirestore,
} from './services/firebaseService';

const DEFAULT_NASHIK_LOCATION: Address = {
  id: 'current-loc',
  title: 'Current Location',
  line1: 'Indira Nagar',
  locality: 'Indira Nagar',
  city: 'Nashik',
  pincode: '422009',
  isDefault: true,
};

export default function App() {
  // Auth State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Global App State
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [currentRole, setCurrentRole] = useState<AppRole>('customer');
  const [savedAddresses, setSavedAddresses] = useState<Address[]>(DEFAULT_ADDRESSES);
  const [currentAddress, setCurrentAddress] = useState<Address>(
    DEFAULT_ADDRESSES[0] || DEFAULT_NASHIK_LOCATION
  );
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(0);

  // Navigation Sub-states
  const [selectedCategoryId, setSelectedCategoryId] = useState<CategoryId | null>(null);
  const [isConfirmingBooking, setIsConfirmingBooking] = useState(false);
  const [activeTrackingBookingId, setActiveTrackingBookingId] = useState<string | null>(null);
  const [supportBookingId, setSupportBookingId] = useState<string | undefined>(undefined);
  const [isPromiseModalOpen, setIsPromiseModalOpen] = useState(false);

  // 1. Listen for Firebase Auth user changes and register device
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        seedInitialDataIfNeeded(user.uid);
        // Register Push Notification device token on login
        pushNotificationClient.initDeviceRegistration(user.uid, currentRole).catch(() => {});
      } else {
        seedInitialDataIfNeeded();
        pushNotificationClient.initDeviceRegistration(undefined, currentRole).catch(() => {});
      }
    });
    return () => unsubscribeAuth();
  }, [currentRole]);

  // Push Notification service worker registration on mount
  useEffect(() => {
    pushNotificationClient.registerServiceWorker();
  }, []);

  // Poll for unread notification count
  const syncNotificationBadge = async () => {
    try {
      const res = await apiClient.getUserNotifications(currentUser?.uid);
      if (res && typeof res.unreadCount === 'number') {
        setUnreadNotificationCount(res.unreadCount);
      }
    } catch {
      // Graceful fallback
    }
  };

  useEffect(() => {
    syncNotificationBadge();
    const timer = setInterval(syncNotificationBadge, 15000);
    return () => clearInterval(timer);
  }, [currentUser?.uid]);

  // Deep link router for rich push notification actions
  const handleNavigateDeepLink = (deepLink: string) => {
    if (!deepLink) return;
    const cleanPath = deepLink.toLowerCase().trim();

    if (cleanPath.startsWith('/booking/')) {
      const bId = deepLink.split('/booking/')[1];
      if (bId) {
        setSelectedCategoryId(null);
        setIsConfirmingBooking(false);
        setActiveTrackingBookingId(bId);
      }
    } else if (cleanPath.startsWith('/category/')) {
      const cat = deepLink.split('/category/')[1] as CategoryId;
      if (cat) {
        setIsConfirmingBooking(false);
        setActiveTrackingBookingId(null);
        setSelectedCategoryId(cat);
      }
    } else if (cleanPath.includes('bookings') || cleanPath === '/bookings') {
      setSelectedCategoryId(null);
      setIsConfirmingBooking(false);
      setActiveTrackingBookingId(null);
      setActiveTab('bookings');
    } else if (cleanPath.includes('support') || cleanPath === '/support') {
      setSelectedCategoryId(null);
      setIsConfirmingBooking(false);
      setActiveTrackingBookingId(null);
      setActiveTab('support');
    } else if (cleanPath.includes('map') || cleanPath === '/maps') {
      setSelectedCategoryId(null);
      setIsConfirmingBooking(false);
      setActiveTrackingBookingId(null);
      setActiveTab('maps');
    } else if (cleanPath.includes('profile') || cleanPath === '/profile') {
      setSelectedCategoryId(null);
      setIsConfirmingBooking(false);
      setActiveTrackingBookingId(null);
      setActiveTab('profile');
    } else if (cleanPath.includes('admin') || cleanPath === '/admin') {
      setCurrentRole('admin');
    } else {
      setActiveTab('home');
      setSelectedCategoryId(null);
      setIsConfirmingBooking(false);
      setActiveTrackingBookingId(null);
    }
  };

  // 2. Real-time Firestore subscriptions for Bookings
  useEffect(() => {
    const unsubscribeBookings = subscribeBookings(
      currentUser?.uid,
      currentRole,
      (firestoreBookings) => {
        if (firestoreBookings && firestoreBookings.length > 0) {
          setBookings(firestoreBookings);
        }
      }
    );
    return () => unsubscribeBookings();
  }, [currentUser?.uid, currentRole]);

  // 3. Real-time Firestore subscriptions for Saved Addresses
  useEffect(() => {
    const unsubscribeAddresses = subscribeAddresses(
      currentUser?.uid,
      (firestoreAddresses) => {
        if (firestoreAddresses && firestoreAddresses.length > 0) {
          setSavedAddresses(firestoreAddresses);
          // Keep current address valid
          setCurrentAddress((prev) => {
            const match = firestoreAddresses.find((a) => a.id === prev.id);
            return match || firestoreAddresses[0];
          });
        }
      }
    );
    return () => unsubscribeAddresses();
  }, [currentUser?.uid]);

  // Cart operations
  const handleAddToCart = (service: ServiceItem) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.service.id === service.id);
      if (existing) {
        return prev.map((item) =>
          item.service.id === service.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { service, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (serviceId: string) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.service.id === serviceId);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        return prev.filter((item) => item.service.id !== serviceId);
      }
      return prev.map((item) =>
        item.service.id === serviceId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    });
  };

  const handleInstantBookService = (service: ServiceItem) => {
    setCartItems([{ service, quantity: 1 }]);
    setSelectedCategoryId(null);
    setIsConfirmingBooking(true);
  };

  // Real data input -> Save booking directly to backend API & Firestore
  const handleCreateBooking = async (bookingDetails: {
    selectedSlot: { dateLabel: string; time: string };
    paymentMethod: 'UPI' | 'Card' | 'Cash on Service';
    bill: any;
  }) => {
    const primaryService = cartItems[0]?.service || SERVICE_CATEGORIES[0].services[0];
    const newId = `UB-${Math.floor(10000 + Math.random() * 90000)}`;

    const newBooking: Booking = {
      id: newId,
      primaryServiceTitle:
        cartItems.length > 1
          ? `${primaryService.title} + ${cartItems.length - 1} more`
          : primaryService.title,
      primaryServiceImage: primaryService.image,
      category: primaryService.categoryId,
      items: [...cartItems],
      address: currentAddress,
      date: bookingDetails.selectedSlot.dateLabel,
      timeSlot: bookingDetails.selectedSlot.time,
      status: 'On the Way',
      statusHistory: [
        {
          status: 'Requested',
          label: 'Requested',
          time: 'Just now',
          completed: true,
          description: `Booking logged at Nashik Hub for ${currentAddress.locality}`,
        },
        {
          status: 'Assigned',
          label: 'Assigned',
          time: 'Just now',
          completed: true,
          description: 'Assigned to verified pro Ramesh Jadhav',
        },
        {
          status: 'On the Way',
          label: 'Professional On The Way',
          time: 'Expected in 12 mins',
          completed: false,
          current: true,
          description: 'Technician departed with tools',
        },
        {
          status: 'Started',
          label: 'Service Started',
          completed: false,
          description: 'Requires 4-digit OTP verification',
        },
        {
          status: 'Completed',
          label: 'Completed',
          completed: false,
          description: 'Includes 30-day warranty card & digital invoice',
        },
      ],
      provider: DEFAULT_PROVIDER,
      bill: bookingDetails.bill,
      paymentMethod: bookingDetails.paymentMethod,
      paymentStatus: bookingDetails.paymentMethod === 'Cash on Service' ? 'Pending' : 'Paid',
      createdAt: new Date().toISOString(),
      promiseDeadline: 'Guaranteed resolution within 24 hours (1-Day Promise)',
      otp: `${Math.floor(1000 + Math.random() * 9000)}`,
    };

    // Optimistic state update
    setBookings((prev) => [newBooking, ...prev]);
    setIsConfirmingBooking(false);
    setSelectedCategoryId(null);
    setActiveTrackingBookingId(newId);

    // Call Backend API & Firestore
    try {
      await apiClient.createBooking({
        userId: currentUser?.uid,
        items: cartItems,
        address: currentAddress,
        date: bookingDetails.selectedSlot.dateLabel,
        timeSlot: bookingDetails.selectedSlot.time,
        paymentMethod: bookingDetails.paymentMethod,
      }).catch((e) => console.warn('Backend booking API fallback:', e));

      await createBookingInFirestore(newBooking, currentUser?.uid);
    } catch (err) {
      console.error('Failed to persist booking:', err);
    }
  };

  // Update booking status in Backend & Firestore
  const handleUpdateBookingStatus = async (bookingId: string, newStatus: BookingStatus) => {
    const targetBooking = bookings.find((b) => b.id === bookingId);
    const updatedHistory = (targetBooking?.statusHistory || []).map((step) => {
      if (step.status === newStatus) {
        return { ...step, completed: true, current: true, time: 'Just now' };
      }
      if (
        (newStatus === 'Completed' &&
          (step.status === 'Requested' ||
            step.status === 'Assigned' ||
            step.status === 'On the Way' ||
            step.status === 'Started')) ||
        (newStatus === 'Started' &&
          (step.status === 'Requested' ||
            step.status === 'Assigned' ||
            step.status === 'On the Way')) ||
        (newStatus === 'On the Way' &&
          (step.status === 'Requested' || step.status === 'Assigned'))
      ) {
        return { ...step, completed: true, current: false };
      }
      return { ...step, current: false };
    });

    // Optimistic update
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId) return b;
        return {
          ...b,
          status: newStatus,
          statusHistory: updatedHistory,
          paymentStatus: newStatus === 'Completed' ? 'Paid' : b.paymentStatus,
        };
      })
    );

    // Persist to Backend API & Firestore
    try {
      await apiClient.updateBookingStatus(bookingId, newStatus, currentRole).catch((e) =>
        console.warn('Backend status update fallback:', e)
      );
      await updateBookingStatusInFirestore(bookingId, newStatus, updatedHistory);
    } catch (err) {
      console.error('Failed to update booking status:', err);
    }
  };

  // Submit real review to Backend & Firestore
  const handleSubmitReview = async (bookingId: string, rating: number, comment: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, userRating: rating, userReview: comment } : b))
    );

    try {
      await apiClient.submitReview({
        bookingId,
        rating,
        comment,
        authorName: currentUser?.displayName || 'Rahul Deshmukh',
        locality: booking?.address.locality || 'Nashik',
        serviceTitle: booking?.primaryServiceTitle || 'Household Service',
        userId: currentUser?.uid,
      }).catch((e) => console.warn('Backend review fallback:', e));

      await submitBookingReviewInFirestore(
        bookingId,
        rating,
        comment,
        currentUser?.displayName || 'Rahul Deshmukh',
        booking?.address.locality || 'Nashik',
        booking?.primaryServiceTitle || 'Household Service',
        currentUser?.uid
      );
    } catch (err) {
      console.error('Failed to submit review:', err);
    }
  };

  // Add address to Firestore
  const handleAddAddress = async (newAddr: Address) => {
    setSavedAddresses((prev) => [...prev, newAddr]);
    setCurrentAddress(newAddr);
    try {
      await saveAddressToFirestore(newAddr, currentUser?.uid);
    } catch (err) {
      console.error('Failed to save address to Firestore:', err);
    }
  };

  // Delete address from Firestore
  const handleDeleteAddress = async (id: string) => {
    setSavedAddresses((prev) => prev.filter((a) => a.id !== id));
    try {
      await deleteAddressFromFirestore(id);
    } catch (err) {
      console.error('Failed to delete address from Firestore:', err);
    }
  };

  const selectedCategory = SERVICE_CATEGORIES.find((c) => c.id === selectedCategoryId);
  const activeTrackingBooking = bookings.find((b) => b.id === activeTrackingBookingId);
  const activeBookingsCount = bookings.filter((b) => b.status !== 'Completed' && b.status !== 'Cancelled').length;

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] font-sans antialiased selection:bg-[#003d9b] selection:text-white">
      {/* Top Header */}
      {!selectedCategoryId && !isConfirmingBooking && !activeTrackingBookingId && (
        <Header
          currentAddress={currentAddress}
          onSelectAddress={setCurrentAddress}
          savedAddresses={savedAddresses}
          currentRole={currentRole}
          onChangeRole={setCurrentRole}
          onNavigateHome={() => {
            setActiveTab('home');
            setSelectedCategoryId(null);
            setIsConfirmingBooking(false);
            setActiveTrackingBookingId(null);
          }}
          notificationCount={unreadNotificationCount}
          currentUser={currentUser}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenProfile={() => setActiveTab('profile')}
          onOpenLiveMap={() => {
            setActiveTab('maps');
            setSelectedCategoryId(null);
            setIsConfirmingBooking(false);
            setActiveTrackingBookingId(null);
          }}
          onNavigateDeepLink={handleNavigateDeepLink}
        />
      )}

      {/* Main Content Area */}
      <div className={!selectedCategoryId && !isConfirmingBooking && !activeTrackingBookingId ? 'pt-16' : ''}>
        {/* Role View: Provider Dashboard */}
        {currentRole === 'provider' ? (
          <ProviderDashboard
            bookings={bookings}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onSwitchToCustomer={() => setCurrentRole('customer')}
          />
        ) : currentRole === 'admin' || currentRole === 'operations' ? (
          <AdminConsole
            currentUser={currentUser}
            onExitAdmin={() => setCurrentRole('customer')}
            onOpenBookingDetails={(b) => {
              setCurrentRole('customer');
              setActiveTrackingBookingId(b.id);
            }}
          />
        ) : (
          /* Customer Portal Views */
          <>
            {/* View 1: Active Live Tracking Screen */}
            {activeTrackingBooking ? (
              <LiveBookingTracker
                booking={activeTrackingBooking}
                onBack={() => setActiveTrackingBookingId(null)}
                onUpdateBookingStatus={handleUpdateBookingStatus}
                onOpenSupport={(bId) => {
                  setActiveTrackingBookingId(null);
                  setActiveTab('support');
                  setSupportBookingId(bId);
                }}
                onSubmitReview={handleSubmitReview}
              />
            ) : isConfirmingBooking ? (
              /* View 2: Confirm Booking Page */
              <ConfirmBookingScreen
                cartItems={cartItems}
                currentAddress={currentAddress}
                onSelectAddress={setCurrentAddress}
                savedAddresses={savedAddresses}
                onBack={() => setIsConfirmingBooking(false)}
                onConfirmBooking={handleCreateBooking}
              />
            ) : selectedCategory ? (
              /* View 3: Category Detail Page */
              <CategoryScreen
                category={selectedCategory}
                onBack={() => setSelectedCategoryId(null)}
                cartItems={cartItems}
                onAddToCart={handleAddToCart}
                onRemoveFromCart={handleRemoveFromCart}
                onProceedToBooking={() => setIsConfirmingBooking(true)}
                onOpenPromiseModal={() => setIsPromiseModalOpen(true)}
              />
            ) : (
              /* View 4: Tab Navigation Views */
              <>
                {activeTab === 'home' && (
                  <HomeScreen
                    onSelectCategory={(catId) => setSelectedCategoryId(catId)}
                    onInstantBookService={handleInstantBookService}
                    onOpenPromiseModal={() => setIsPromiseModalOpen(true)}
                    onOpenLiveMap={() => setActiveTab('maps')}
                  />
                )}

                {activeTab === 'maps' && (
                  <NashikLiveCoverageMap
                    currentAddress={currentAddress}
                    onSelectLocality={(locality) => {
                      setCurrentAddress((prev) => ({
                        ...prev,
                        locality,
                      }));
                    }}
                    onBookService={(categoryId) => {
                      setSelectedCategoryId(categoryId as CategoryId);
                    }}
                  />
                )}

                {activeTab === 'bookings' && (
                  <BookingsListScreen
                    bookings={bookings}
                    onSelectBooking={(b) => setActiveTrackingBookingId(b.id)}
                    onNewBookingClick={() => {
                      setActiveTab('home');
                      setSelectedCategoryId('plumbing');
                    }}
                    onOpenSupport={(bId) => {
                      setActiveTab('support');
                      setSupportBookingId(bId);
                    }}
                  />
                )}

                {activeTab === 'support' && (
                  <SupportScreen
                    recentBookings={bookings}
                    onSelectBookingHelp={(b) => setSupportBookingId(b.id)}
                    preselectedBookingId={supportBookingId}
                  />
                )}

                {activeTab === 'profile' && (
                  <ProfileScreen
                    currentAddress={currentAddress}
                    savedAddresses={savedAddresses}
                    onSelectAddress={setCurrentAddress}
                    onAddAddress={handleAddAddress}
                    onDeleteAddress={handleDeleteAddress}
                    currentRole={currentRole}
                    onChangeRole={setCurrentRole}
                    onOpenPromiseModal={() => setIsPromiseModalOpen(true)}
                    onOpenSupport={() => setActiveTab('support')}
                    currentUser={currentUser}
                    onOpenAuthModal={() => setIsAuthModalOpen(true)}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* 1-Day Promise Explanatory Modal */}
      <PromiseModal
        isOpen={isPromiseModalOpen}
        onClose={() => setIsPromiseModalOpen(false)}
      />

      {/* Auth Modal for Google / Email Sign In */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
      />

      {/* Bottom Navigation */}
      {currentRole === 'customer' && !selectedCategoryId && !isConfirmingBooking && !activeTrackingBookingId && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setSelectedCategoryId(null);
            setIsConfirmingBooking(false);
            setActiveTrackingBookingId(null);
          }}
          activeBookingCount={activeBookingsCount}
        />
      )}
    </div>
  );
}
