import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const requiredFirebaseEnv = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
] as const;

const missingFirebaseEnv = requiredFirebaseEnv.filter(
  (key) => !String(import.meta.env[key] || '').trim()
);

if (missingFirebaseEnv.length > 0) {
  throw new Error(
    `Missing Firebase env vars: ${missingFirebaseEnv.join(', ')}. Add them to frontend/.env and restart Vite.`
  );
}

const firebaseConfig = {
  apiKey: String(import.meta.env.VITE_FIREBASE_API_KEY).trim(),
  authDomain: String(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN).trim(),
  projectId: String(import.meta.env.VITE_FIREBASE_PROJECT_ID).trim(),
  appId: String(import.meta.env.VITE_FIREBASE_APP_ID).trim(),
  messagingSenderId: String(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID).trim(),
  storageBucket: String(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '').trim(),
};

const firebaseApp = initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(firebaseApp);
