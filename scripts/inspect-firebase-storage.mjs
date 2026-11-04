import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getStorage, ref, listAll, getMetadata, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  projectId: "orion9-dev-db-2026",
  appId: "1:1031466156269:web:1d8b92bd6adea9b09b8ce4",
  apiKey: "AIzaSyC5qgG4DkMfCEdhNYHIb8hsIQ00pIkYRGo",
  authDomain: "orion9-dev-db-2026.firebaseapp.com",
  storageBucket: "orion9-dev-db-2026.firebasestorage.app",
  messagingSenderId: "1031466156269",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

async function listFiles(path) {
  console.log(`Checking Firebase Storage path: "${path}"`);
  try {
    const listRef = ref(storage, path);
    const res = await listAll(listRef);
    console.log(`Prefixes in "${path}":`, res.prefixes.map(p => p.fullPath));
    console.log(`Items in "${path}":`, res.items.map(i => i.fullPath));
    for (const itemRef of res.items) {
      try {
        const meta = await getMetadata(itemRef);
        const url = await getDownloadURL(itemRef);
        console.log(`  File: ${itemRef.fullPath}`, {
          size: meta.size,
          contentType: meta.contentType,
          created: meta.timeCreated,
          url
        });
      } catch (e) {
        console.error(`  Error reading file ${itemRef.fullPath}:`, e.message);
      }
    }
    for (const prefix of res.prefixes) {
      await listFiles(prefix.fullPath);
    }
  } catch (err) {
    console.error(`Error in path "${path}":`, err.message);
  }
}

async function run() {
  try {
    const userCred = await signInWithEmailAndPassword(auth, 'ayush-admin@portfolio.internal', 'AP-Admin-Secure-2026-Vault-7f89b');
    console.log('Successfully authenticated as:', userCred.user.email, 'uid:', userCred.user.uid);
  } catch (authErr) {
    console.warn('Auth failed:', authErr.message);
  }
  await listFiles('');
  await listFiles('media');
  await listFiles('resumes');
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
