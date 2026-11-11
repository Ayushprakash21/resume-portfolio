import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'node:fs';

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

const collections = ['profile', 'settings', 'experiences', 'projects', 'certifications', 'skills', 'education', 'resume', 'mediaAssets'];

async function runAudit() {
  const result = {};
  for (const col of collections) {
    try {
      const snap = await getDocs(collection(db, col));
      result[col] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      console.log(`Collection "${col}": ${snap.docs.length} docs`);
    } catch (err) {
      console.error(`Collection "${col}" error:`, err.message);
      result[col] = { error: err.message };
    }
  }
  fs.writeFileSync('C:/Users/Ayush/.gemini/antigravity/brain/476c7590-1f5b-4226-97b0-0976fa6f2d4a/scratch/firestore_audit_before.json', JSON.stringify(result, null, 2));
  console.log('Full Firestore audit dumped to scratch/firestore_audit_before.json');
}

runAudit().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
