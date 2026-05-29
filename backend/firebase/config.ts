// Firebase configuration and initialization
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, type Auth } from 'firebase/auth';
import { initializeFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Lazy initialization — prevents crash during Next.js build when env vars are missing
let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

function getFirebaseApp(): FirebaseApp {
  if (!_app) {
    _app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }
  return _app;
}

// Use getters so Firebase only initializes when actually accessed at runtime
export const auth: Auth = new Proxy({} as Auth, {
  get(_target, prop) {
    if (!_auth) {
      _auth = getAuth(getFirebaseApp());
      // Set persistence explicitly to browser local persistence
      if (typeof window !== 'undefined') {
        setPersistence(_auth, browserLocalPersistence).catch((err) => {
          console.error('Failed to set Firebase Auth persistence:', err);
        });
      }
    }
    return (_auth as any)[prop];
  },
});

export const db: Firestore = new Proxy({} as Firestore, {
  get(_target, prop) {
    if (!_db) {
      _db = initializeFirestore(getFirebaseApp(), {
        experimentalForceLongPolling: true,
      });
    }
    return (_db as any)[prop];
  },
});

export default new Proxy({} as FirebaseApp, {
  get(_target, prop) {
    return (getFirebaseApp() as any)[prop];
  },
});
