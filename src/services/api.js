import { db } from './firebase';
import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc,
  query, where, Timestamp, runTransaction
} from 'firebase/firestore';
import { geohashQueryBounds, distanceBetween } from 'geofire-common';

// --- UTILITY ---
/**
 * Transforms a Firestore document snapshot into a more usable object.
 * @param {DocumentSnapshot} doc - The Firestore document snapshot.
 * @returns {object} The transformed document data with its ID.
 */
const transformDoc = (doc) => {
  const data = doc.data();
  // Convert all Timestamp fields to ISO strings for consistency
  for (const key in data) {
    if (data[key] instanceof Timestamp) {
      data[key] = data[key].toDate().toISOString();
    }
  }
  return { id: doc.id, ...data };
};


// --- SALOON & BARBER FUNCTIONS ---

/**
 * **NEW**: Fetches saloons within a specific radius of a center point.
 * @param {[number, number]} center - The [latitude, longitude] of the user.
 * @param {number} radiusInM - The search radius in meters.
 * @returns {Promise<Array>} A promise that resolves to an array of saloon objects.
 */
export const getNearbySaloons = async (center, radiusInM) => {
  const saloonsRef = collection(db, 'saloons');
  const bounds = geohashQueryBounds(center, radiusInM);
  const promises = [];

  for (const b of bounds) {
    const q = query(saloonsRef, where('geohash', '>=', b[0]), where('geohash', '<=', b[1]));
    promises.push(getDocs(q));
  }

  const snapshots = await Promise.all(promises);
  const matchingDocs = [];

  for (const snap of snapshots) {
    for (const doc of snap.docs) {
      const lat = doc.get('location.latitude');
      const lng = doc.get('location.longitude');
      const distanceInM = distanceBetween([lat, lng], center) * 1000;
      if (distanceInM <= radiusInM) {
        matchingDocs.push(transformDoc(doc));
      }
    }
  }
  return matchingDocs;
};

// Other saloon/barber functions remain similar but use the transformDoc utility
export const getSaloonById = async (saloonId) => {
    const docSnap = await getDoc(doc(db, 'saloons', saloonId));
    if (!docSnap.exists()) throw new Error("Saloon not found");
    return transformDoc(docSnap);
}

export const getBarbersBySaloon = async (saloonId) => {
    const barbersRef = collection(db, 'barbers');
    const q = query(barbersRef, where('saloonId', '==', saloonId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(transformDoc);
}


// --- BOOKING FUNCTIONS ---

/**
 * **UPDATED**: Creates a new booking using a transaction to prevent double-booking.
 * @param {object} bookingData - All data for the new booking.
 * @returns {Promise<string>} The ID of the new booking document.
 */
export const createBooking = async (bookingData) => {
  try {
    const newBookingId = await runTransaction(db, async (transaction) => {
      const { barberId, bookingTime, duration } = bookingData;
      
      const bookingStart = new Date(bookingTime);
      const bookingEnd = new Date(bookingStart.getTime() + duration * 60000);

      // 1. Check for conflicting bookings for the selected barber
      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef, where('barberId', '==', barberId));
      const querySnapshot = await getDocs(q); // Note: In a transaction, all reads must happen before writes.

      for (const doc of querySnapshot.docs) {
        const existingBooking = doc.data();
        const existingStart = existingBooking.bookingTime.toDate();
        const existingEnd = new Date(existingStart.getTime() + existingBooking.duration * 60000);

        // Check for time overlap
        if (bookingStart < existingEnd && bookingEnd > existingStart) {
          throw new Error("This time slot is no longer available. Please select another time.");
        }
      }

      // 2. If no conflicts, create the new booking
      const newBookingRef = doc(collection(db, 'bookings')); // Create a new doc reference
      const finalBookingData = {
          ...bookingData,
          bookingTime: Timestamp.fromDate(bookingStart), // Ensure it's a Timestamp
          createdAt: Timestamp.now()
      };
      transaction.set(newBookingRef, finalBookingData);
      
      return newBookingRef.id;
    });

    return newBookingId;

  } catch (error) {
    console.error("Booking Transaction Failed:", error);
    throw error; // Re-throw the specific error to be handled by the UI
  }
};

// Other functions... (getUserBookings, updateBookingStatus, etc. would also use transformDoc)
export const getUserBookings = async (userId) => {
    const bookingsRef = collection(db, 'bookings');
    const q = query(bookingsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(transformDoc);
}