import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = 'https://resume-portfolio.ayushprakash0021.workers.dev';

async function runProductionMigration() {
  console.log('--- Authenticating with production worker ---');
  const loginRes = await fetch(`${BASE_URL}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ayush@admin', password: 'admin' }),
  });
  const cookieHeader = loginRes.headers.get('set-cookie');
  const sessionCookie = cookieHeader ? cookieHeader.split(';')[0] : '';

  if (!sessionCookie) {
    throw new Error('Authentication failed');
  }
  console.log('Authentication successful.');

  const assetsToMigrate = [
    {
      name: 'Ayush_Prakash_Master_Resume.pdf',
      category: 'resumes',
      visibility: 'private',
      localPath: 'public/Ayush_Prakash_Resume.pdf',
      mimeType: 'application/pdf',
    },
    {
      name: 'orion9_monogram_metallic.png',
      category: 'projects',
      visibility: 'public',
      localPath: 'public/projects/logos/orion9_monogram_metallic.png',
      mimeType: 'image/png',
    },
  ];

  for (const asset of assetsToMigrate) {
    if (fs.existsSync(asset.localPath)) {
      console.log(`Uploading local asset ${asset.name}...`);
      const fileBuffer = fs.readFileSync(asset.localPath);
      const blob = new Blob([fileBuffer], { type: asset.mimeType });

      const formData = new FormData();
      formData.append('file', blob, asset.name);
      formData.append('category', asset.category);
      formData.append('visibility', asset.visibility);

      const uploadRes = await fetch(`${BASE_URL}/api/storage/upload`, {
        method: 'POST',
        headers: { Cookie: sessionCookie },
        body: formData,
      });

      const uploadData = await uploadRes.json();
      console.log(`  ✔ Uploaded: ${uploadData.file?.objectKey}`);
    } else {
      console.log(`  File ${asset.localPath} not found on disk.`);
    }
  }

  const statusRes = await fetch(`${BASE_URL}/api/storage/status`);
  const statusData = await statusRes.json();
  console.log('\n--- Final R2 Storage Status ---');
  console.log(statusData);
}

runProductionMigration().then(() => process.exit(0)).catch(console.error);
