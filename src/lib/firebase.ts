import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import rawConfig from '../../firebase-applet-config.json';

const firebaseConfig = {
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) || rawConfig.projectId,
  appId: (import.meta.env.VITE_FIREBASE_APP_ID as string) || rawConfig.appId,
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string) || rawConfig.apiKey,
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) || rawConfig.authDomain,
  firestoreDatabaseId: (import.meta.env.VITE_FIREBASE_DATABASE_ID as string) || rawConfig.firestoreDatabaseId,
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) || rawConfig.storageBucket,
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || rawConfig.messagingSenderId,
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const databaseId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? firebaseConfig.firestoreDatabaseId
  : undefined;

// Initialize Firestore using the standard databaseId as specified by Firebase skill guidelines.
// Avoid forcing experimentalForceLongPolling, which triggers network timeout and code=unavailable errors in web clients.
export const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
export const auth = getAuth(app);

// Validate connection on initial boot
export async function validateConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is operating in offline mode or reconnecting.');
      return false;
    }
    // Any other response (like doc not existing or permissions check) indicates the server was reached
    return true;
  }
}

// Initial connection check
void validateConnection();


