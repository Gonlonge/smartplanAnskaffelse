/**
 * Firebase Configuration
 *
 * Initialize Firebase services (Auth, Firestore, Storage)
 *
 * To use this, you need to:
 * 1. Create a Firebase project at https://console.firebase.google.com
 * 2. Enable Authentication (Email/Password)
 * 3. Enable Firestore Database
 * 4. Enable Storage
 * 5. Copy your config values and set them as environment variables or replace the placeholder values below
 */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
// Values are loaded from .env file (see .env.example for reference)
// Fallback values are your actual Firebase project config
const firebaseConfig = {
    apiKey:
        import.meta.env.VITE_FIREBASE_API_KEY ||
        "AIzaSyDQWPExwHXpywk42-6ylxIEaB9biXugfo8",
    authDomain:
        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
        "smartworkease.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "smartworkease",
    storageBucket:
        import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
        "smartworkease.appspot.com",
    messagingSenderId:
        import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "875546905076",
    appId:
        import.meta.env.VITE_FIREBASE_APP_ID ||
        "1:875546905076:web:daf64beb24654b5fb311a1",
    measurementId:
        import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-DBNXV98415",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
