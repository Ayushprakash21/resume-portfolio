import { initializeApp } from 'firebase/app';
import { getAuth, EmailAuthProvider, signInWithCredential } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import {
  DEFAULT_PROFILE,
  DEFAULT_EXPERIENCES,
  DEFAULT_PROJECTS,
  DEFAULT_CERTIFICATIONS,
  DEFAULT_SKILLS,
  DEFAULT_EDUCATION,
  DEFAULT_HOMEPAGE_SETTINGS,
  DEFAULT_ABOUT_SETTINGS,
  DEFAULT_RESUME_RECORD,
  DEFAULT_SECTIONS_CONFIG,
  DEFAULT_APPEARANCE_SETTINGS,
  DEFAULT_OPEN_TO_WORK_SETTINGS,
  DEFAULT_MEDIA_ASSETS,
} from '../src/data/seedData';

const firebaseConfig = {
  projectId: 'orion9-dev-db-2026',
  appId: '1:1031466156269:web:1d8b92bd6adea9b09b8ce4',
  apiKey: 'AIzaSyC5qgG4DkMfCEdhNYHIb8hsIQ00pIkYRGo',
  authDomain: 'orion9-dev-db-2026.firebaseapp.com',
  storageBucket: 'orion9-dev-db-2026.firebasestorage.app',
};

async function main() {
  console.log('[Firestore Seeder] Initializing Firebase Auth & Firestore...');
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const cred = EmailAuthProvider.credential('ayush-admin@portfolio.internal', 'AP-Admin-Secure-2026-Vault-7f89b');
  const userCred = await signInWithCredential(auth, cred);
  console.log('[Firestore Seeder] Authenticated as:', userCred.user.email);

  const db = getFirestore(app);

  // 1. Profile: preserve existing Indore data, ensure stateProvince and locationVisibility
  const profileRef = doc(db, 'profile', 'main');
  const profileSnap = await getDoc(profileRef);
  if (profileSnap.exists()) {
    const existing = profileSnap.data();
    console.log('[Firestore Seeder] Existing profile found. Location:', existing.location, 'City:', existing.city);
    await setDoc(profileRef, {
      ...existing,
      stateProvince: existing.stateProvince || 'Madhya Pradesh',
      countryRegion: existing.countryRegion || 'India',
      city: existing.city || 'Indore',
      location: existing.location || 'Indore, Madhya Pradesh, India',
      isLocationVisible: existing.isLocationVisible !== undefined ? existing.isLocationVisible : true,
      status: 'published',
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    console.log('[Firestore Seeder] Profile verified in Firestore.');
  } else {
    console.log('[Firestore Seeder] Writing initial profile with Indore, Madhya Pradesh, India...');
    await setDoc(profileRef, {
      ...DEFAULT_PROFILE,
      city: 'Indore',
      stateProvince: 'Madhya Pradesh',
      countryRegion: 'India',
      location: 'Indore, Madhya Pradesh, India',
      isLocationVisible: true,
      status: 'published',
      updatedAt: new Date().toISOString(),
    });
  }

  // 2. Experiences
  const expSnap = await getDocs(collection(db, 'experiences'));
  if (expSnap.empty) {
    console.log('[Firestore Seeder] Seeding experiences...');
    for (const exp of DEFAULT_EXPERIENCES) {
      await setDoc(doc(db, 'experiences', exp.id), {
        ...exp,
        status: 'published',
        updatedAt: new Date().toISOString(),
      });
    }
    console.log(`[Firestore Seeder] Seeded ${DEFAULT_EXPERIENCES.length} experiences.`);
  } else {
    console.log(`[Firestore Seeder] Experiences already present (${expSnap.size}).`);
  }

  // 3. Projects
  const projSnap = await getDocs(collection(db, 'projects'));
  if (projSnap.empty) {
    console.log('[Firestore Seeder] Seeding projects...');
    for (const proj of DEFAULT_PROJECTS) {
      await setDoc(doc(db, 'projects', proj.id), {
        ...proj,
        status: 'published',
        updatedAt: new Date().toISOString(),
      });
    }
    console.log(`[Firestore Seeder] Seeded ${DEFAULT_PROJECTS.length} projects.`);
  } else {
    console.log(`[Firestore Seeder] Projects already present (${projSnap.size}).`);
  }

  // 4. Certifications
  const certSnap = await getDocs(collection(db, 'certifications'));
  if (certSnap.empty) {
    console.log('[Firestore Seeder] Seeding certifications...');
    for (const cert of DEFAULT_CERTIFICATIONS) {
      await setDoc(doc(db, 'certifications', cert.id), {
        ...cert,
        status: 'published',
        updatedAt: new Date().toISOString(),
      });
    }
    console.log(`[Firestore Seeder] Seeded ${DEFAULT_CERTIFICATIONS.length} certifications.`);
  } else {
    console.log(`[Firestore Seeder] Certifications already present (${certSnap.size}).`);
  }

  // 5. Skills
  const skillSnap = await getDocs(collection(db, 'skills'));
  if (skillSnap.empty) {
    console.log('[Firestore Seeder] Seeding skills...');
    for (const skill of DEFAULT_SKILLS) {
      await setDoc(doc(db, 'skills', skill.id), {
        ...skill,
        updatedAt: new Date().toISOString(),
      });
    }
    console.log(`[Firestore Seeder] Seeded ${DEFAULT_SKILLS.length} skills.`);
  } else {
    console.log(`[Firestore Seeder] Skills already present (${skillSnap.size}).`);
  }

  // 6. Education
  const eduSnap = await getDocs(collection(db, 'education'));
  if (eduSnap.empty) {
    console.log('[Firestore Seeder] Seeding education...');
    for (const edu of DEFAULT_EDUCATION) {
      await setDoc(doc(db, 'education', edu.id), {
        ...edu,
        updatedAt: new Date().toISOString(),
      });
    }
    console.log(`[Firestore Seeder] Seeded ${DEFAULT_EDUCATION.length} education records.`);
  } else {
    console.log(`[Firestore Seeder] Education already present (${eduSnap.size}).`);
  }

  // 7. Settings: About
  await setDoc(doc(db, 'settings', 'about'), {
    ...DEFAULT_ABOUT_SETTINGS,
    status: 'published',
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  // 8. Settings: Homepage
  await setDoc(doc(db, 'settings', 'homepage'), {
    ...DEFAULT_HOMEPAGE_SETTINGS,
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  // 9. Settings: Open to Work
  await setDoc(doc(db, 'settings', 'openToWork'), {
    ...DEFAULT_OPEN_TO_WORK_SETTINGS,
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  // 10. Settings: Sections Config
  await setDoc(doc(db, 'settings', 'sections'), {
    list: DEFAULT_SECTIONS_CONFIG,
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  // 11. Settings: Appearance
  await setDoc(doc(db, 'settings', 'appearance'), {
    ...DEFAULT_APPEARANCE_SETTINGS,
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  // 12. Resume
  await setDoc(doc(db, 'resume', 'primary'), {
    ...DEFAULT_RESUME_RECORD,
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  console.log('[Firestore Seeder] ALL FIRESTORE COLLECTIONS AND SETTINGS INITIALIZED SUCCESSFULLY!');
}

main().catch((err) => {
  console.error('[Firestore Seeder] Error:', err);
  process.exit(1);
});
