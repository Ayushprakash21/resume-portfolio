import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "orion9-dev-db-2026",
  appId: "1:1031466156269:web:1d8b92bd6adea9b09b8ce4",
  apiKey: "AIzaSyC5qgG4DkMfCEdhNYHIb8hsIQ00pIkYRGo",
  authDomain: "orion9-dev-db-2026.firebaseapp.com",
  storageBucket: "orion9-dev-db-2026.firebasestorage.app",
  messagingSenderId: "1031466156269",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const collections = ['profile', 'projects', 'experiences', 'certifications', 'skills', 'education', 'settings', 'resume', 'mediaAssets'];

async function inspect() {
  console.log('--- Inspecting Firestore Collections on (default) ---');
  for (const col of collections) {
    try {
      const snap = await getDocs(collection(db, col));
      console.log(`Collection "${col}": ${snap.docs.length} docs`);
      snap.docs.forEach(d => {
        const data = d.data();
        console.log(`  Doc [${d.id}]:`, JSON.stringify(data).substring(0, 160));
      });
    } catch (err) {
      console.error(`Collection "${col}" error:`, err.message);
    }
  }
}

inspect().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
