import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID,
};

// Check if Firebase config is valid
const isFirebaseConfigValid = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== 'undefined';

if (!isFirebaseConfigValid) {
  console.warn(
    'Firebase API Key is missing. Please set VITE_FIREBASE_API_KEY in your environment variables. ' +
    'Authentication features will be disabled until configured.'
  );
  console.log('Firebase Config Status:', {
    hasApiKey: !!firebaseConfig.apiKey,
    hasAuthDomain: !!firebaseConfig.authDomain,
    hasProjectId: !!firebaseConfig.projectId
  });
}

// Initialize Firebase only if config is valid, otherwise provide a mock-like behavior or handle nulls
const app = isFirebaseConfigValid 
  ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp())
  : null;

const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

export { auth, db, isFirebaseConfigValid };
