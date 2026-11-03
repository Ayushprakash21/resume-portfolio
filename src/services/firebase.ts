import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Production Firebase Configuration for Ayush: The Intelligence Universe
export const firebaseConfig = {
  projectId: "orion9-dev-db-2026",
  appId: "1:1031466156269:web:1d8b92bd6adea9b09b8ce4",
  apiKey: "AIzaSyC5qgG4DkMfCEdhNYHIb8hsIQ00pIkYRGo",
  authDomain: "orion9-dev-db-2026.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-orion9theintelli-c9e042d6-9d0a-4a41-91ee-a78214c20b1b",
  storageBucket: "orion9-dev-db-2026.firebasestorage.app",
  messagingSenderId: "1031466156269",
};

let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (err) {
  console.warn('[Firebase] Initialization notice: Running in resilient client mode.', err);
}

export { app, auth, db, storage };
