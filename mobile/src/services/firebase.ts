/**
 * Firebase client initialization (modular SDK v9+).
 *
 * Keys come from Expo public env vars (`EXPO_PUBLIC_FIREBASE_*`) so they are
 * available at build/runtime without embedding secrets in source. These client
 * config values are safe to ship in a mobile app; security is enforced via
 * Firebase Auth + Firestore Security Rules (added in later steps).
 *
 * Copy `.env.example` → `.env` and replace placeholders before using Auth/Firestore.
 */
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

/** True when every required Expo public Firebase env var is set and non-empty. */
export function isFirebaseConfigured(): boolean {
  return Object.values(firebaseConfig).every(
    (value) => typeof value === 'string' && value.trim().length > 0 && !value.includes('YOUR_'),
  );
}

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

/**
 * Lazily initializes the Firebase app so Expo Go can still launch when
 * placeholders remain in `.env` (Step 1 smoke test).
 */
export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Firebase is not configured. Copy mobile/.env.example to mobile/.env and fill in your Firebase project values.',
    );
  }

  if (!app) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }

  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

export function getFirestoreDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }
  return db;
}
