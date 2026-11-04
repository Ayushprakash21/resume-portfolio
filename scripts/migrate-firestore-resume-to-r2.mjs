import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';

const BASE_URL = 'https://resume-portfolio.ayushprakash0021.workers.dev';

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

async function migrateResume() {
  console.log('1. Reading resume/primary from Firestore...');
  const resumeSnap = await getDoc(doc(db, 'resume', 'primary'));
  if (!resumeSnap.exists()) {
    console.log('No resume document found in Firestore.');
    return;
  }

  const data = resumeSnap.data();
  console.log('Found resume record:', {
    fileName: data.fileName,
    fileSize: data.fileSizeBytes,
    isDataUrl: data.fileUrl?.startsWith('data:'),
  });

  if (!data.fileUrl?.startsWith('data:')) {
    console.log('Resume is not a base64 data URL. Current URL:', data.fileUrl);
    return;
  }

  // 2. Convert base64 data-URL to buffer/Blob
  const base64Data = data.fileUrl.split(',')[1];
  const buffer = Buffer.from(base64Data, 'base64');
  const blob = new Blob([buffer], { type: 'application/pdf' });

  // 3. Authenticate with worker
  console.log('2. Authenticating with production worker...');
  const loginRes = await fetch(`${BASE_URL}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ayush@admin', password: 'admin' }),
  });
  const cookieHeader = loginRes.headers.get('set-cookie');
  const sessionCookie = cookieHeader ? cookieHeader.split(';')[0] : '';

  // 4. Upload to R2 private quadrant
  console.log('3. Uploading resume to Cloudflare R2 private quadrant...');
  const formData = new FormData();
  formData.append('file', blob, data.fileName || 'Ayush_Prakash_Master_Resume.pdf');
  formData.append('category', 'resumes');
  formData.append('visibility', 'private');

  const uploadRes = await fetch(`${BASE_URL}/api/storage/upload`, {
    method: 'POST',
    headers: { Cookie: sessionCookie },
    body: formData,
  });

  const uploadData = await uploadRes.json();
  console.log('Upload result:', uploadData);

  if (!uploadData.success || !uploadData.file) {
    throw new Error('R2 upload failed: ' + JSON.stringify(uploadData));
  }

  // 5. Update Firestore record
  console.log('4. Updating Firestore resume/primary record with R2 metadata...');
  await updateDoc(doc(db, 'resume', 'primary'), {
    fileUrl: uploadData.file.secureUrl,
    storageProvider: 'cloudflare-r2',
    objectKey: uploadData.file.objectKey,
    fileSizeBytes: buffer.length,
    updatedAt: new Date().toISOString(),
  });

  console.log('✅ Successfully migrated resume/primary from base64 to Cloudflare R2!');
}

migrateResume().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
