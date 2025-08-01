/*
================================================================================
| FILE: /src/services/api.js
| DESCRIPTION: Contains all the CRUD (Create, Read, Update, Delete) functions
| for interacting with your Firestore database collections.
================================================================================
*/

import { db } from './firebase';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp
} from 'firebase/firestore';

// --- USER FUNCTIONS ---

/**
 * Creates a new user document in Firestore after they sign up.
 * @param {string} userId - The user's UID from Firebase Auth.
 * @param {object} userData - Data like name, email, phone.
 */
export const createUser = (userId, userData) => {
  // Use setDoc here to specify the document ID as the user's UID
  return setDoc(doc(db, 'users', userId), userData);
};

/**
 * Gets a specific user's document from Firestore.
 * @param {string} userId - The UID of the user to fetch.
 */
export const getUser = (userId) => {
  return getDoc(doc(db, 'users', userId));
};

// --- SALOON & BARBER FUNCTIONS ---

/**
 * Fetches all documents from the 'saloons' collection.
 */
export const getAllSaloons = () => {
  const saloonsRef = collection(db, 'saloons');
  return getDocs(saloonsRef);
};

/**
 * Fetches a single saloon by its ID.
 * @param {string} saloonId 
 */
export const getSaloonById = (saloonId) => {
    return getDoc(doc(db, 'saloons', saloonId));
}

/**
 * Fetches all barbers that work at a specific saloon.
 * @param {string} saloonId - The ID of the saloon.
 */
export const getBarbersBySaloon = (saloonId) => {
  const barbersRef = collection(db, 'barbers');
  const q = query(barbersRef, where('saloonId', '==', saloonId));
  return getDocs(q);
};


// --- BOOKING FUNCTIONS ---

/**
 * Creates a new booking document.
 * @param {object} bookingData - All data for the new booking.
 * e.g., { userId, saloonId, barberId, serviceId, bookingTime, status, price, duration, paymentDetails }
 */
export const createBooking = (bookingData) => {
  // Ensure bookingTime is a Firestore Timestamp
  if (bookingData.bookingTime && !(bookingData.bookingTime instanceof Timestamp)) {
      bookingData.bookingTime = Timestamp.fromDate(new Date(bookingData.bookingTime));
  }
  return addDoc(collection(db, 'bookings'), bookingData);
};

/**
 * Fetches all bookings for a specific user.
 * @param {string} userId
 */
export const getUserBookings = (userId) => {
  const bookingsRef = collection(db, 'bookings');
  const q = query(bookingsRef, where('userId', '==', userId));
  return getDocs(q);
};

/**
 * Fetches all bookings for a specific barber to check their availability.
 * @param {string} barberId
 */
export const getBarberBookings = (barberId) => {
    const bookingsRef = collection(db, 'bookings');
    const q = query(bookingsRef, where('barberId', '==', barberId));
    return getDocs(q);
}

/**
 * Updates the status of a booking (e.g., to 'Cancelled' or 'Completed').
 * @param {string} bookingId
 * @param {string} newStatus
 */
export const updateBookingStatus = (bookingId, newStatus) => {
  const bookingRef = doc(db, 'bookings', bookingId);
  return updateDoc(bookingRef, { status: newStatus });
};


// --- REVIEW FUNCTIONS ---

/**
 * Adds a new review for a saloon or barber.
 * @param {object} reviewData - { userId, saloonId, barberId (optional), rating, comment }
 */
export const addReview = (reviewData) => {
    // Add a timestamp for when the review was created
    reviewData.createdAt = Timestamp.now();
    return addDoc(collection(db, 'reviews'), reviewData);
}

/**
 * Fetches all reviews for a specific saloon.
 * @param {string} saloonId 
 */
export const getSaloonReviews = (saloonId) => {
    const reviewsRef = collection(db, 'reviews');
    const q = query(reviewsRef, where('saloonId', '==', saloonId));
    return getDocs(q);
}

