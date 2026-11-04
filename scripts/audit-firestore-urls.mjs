import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

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

async function fullAudit() {
  const inventory = [];
  for (const col of collections) {
    const snap = await getDocs(collection(db, col));
    snap.docs.forEach(d => {
      const data = d.data();
      const findUrls = (obj, path = '') => {
        if (!obj) return;
        if (typeof obj === 'string') {
          if (obj.startsWith('http') || obj.startsWith('/') || obj.startsWith('data:') || obj.includes('.png') || obj.includes('.pdf') || obj.includes('.svg') || obj.includes('.jpg')) {
            inventory.push({
              collection: col,
              docId: d.id,
              fieldPath: path,
              value: obj.length > 100 ? (obj.startsWith('data:') ? obj.substring(0, 50) + '... [base64 ' + obj.length + ' chars]' : obj) : obj,
              isBase64: obj.startsWith('data:'),
              isFirebaseStorage: obj.includes('firebasestorage.googleapis.com'),
              isRelative: obj.startsWith('/') && !obj.startsWith('//'),
              isExternal: obj.startsWith('http') && !obj.includes('firebasestorage.googleapis.com')
            });
          }
        } else if (Array.isArray(obj)) {
          obj.forEach((item, idx) => findUrls(item, `${path}[${idx}]`));
        } else if (typeof obj === 'object') {
          Object.keys(obj).forEach(k => findUrls(obj[k], path ? `${path}.${k}` : k));
        }
      };
      findUrls(data);
    });
  }
  console.log(JSON.stringify(inventory, null, 2));
}

fullAudit().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
