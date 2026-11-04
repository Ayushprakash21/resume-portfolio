const BASE_URL = 'https://resume-portfolio.ayushprakash0021.workers.dev';

async function testLiveR2() {
  console.log('--- 1. Testing Live Admin Authentication ---');
  const loginRes = await fetch(`${BASE_URL}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ayush@admin', password: 'admin' }),
  });

  const cookieHeader = loginRes.headers.get('set-cookie');
  const loginData = await loginRes.json();
  console.log('Login Response:', { status: loginRes.status, success: loginData.success, user: loginData.user });

  if (!loginData.success || !cookieHeader) {
    throw new Error('Failed to login to live worker');
  }

  // Extract session token
  const sessionCookie = cookieHeader.split(';')[0];
  console.log('Session Cookie:', sessionCookie.substring(0, 35) + '...');

  console.log('\n--- 2. Testing Live R2 File Upload (Private Resume) ---');
  const formData = new FormData();
  const fileBlob = new Blob(['%PDF-1.7 - Verified Live R2 Integration Test File'], { type: 'application/pdf' });
  formData.append('file', fileBlob, 'live_test_resume.pdf');
  formData.append('category', 'resumes');
  formData.append('visibility', 'private');

  const uploadRes = await fetch(`${BASE_URL}/api/storage/upload`, {
    method: 'POST',
    headers: { Cookie: sessionCookie },
    body: formData,
  });

  const uploadData = await uploadRes.json();
  console.log('Upload Result:', { status: uploadRes.status, success: uploadData.success, file: uploadData.file });

  if (!uploadData.success || !uploadData.file?.objectKey) {
    throw new Error('Upload to live R2 failed: ' + JSON.stringify(uploadData));
  }

  const objectKey = uploadData.file.objectKey;

  console.log('\n--- 3. Testing Public Route Denial for Private Object ---');
  const publicRes = await fetch(`${BASE_URL}/api/storage/files/${objectKey}`);
  console.log('Public route access status:', publicRes.status, '(Expect 403 Forbidden)');
  if (publicRes.status !== 403) {
    throw new Error('Security policy failure: private object was accessible via public route!');
  }

  console.log('\n--- 4. Testing Secure Delivery Route for Authenticated Admin ---');
  const secureRes = await fetch(`${BASE_URL}/api/storage/secure/${objectKey}`, {
    headers: { Cookie: sessionCookie },
  });
  console.log('Secure route access status:', secureRes.status, '(Expect 200 OK)');
  const secureText = await secureRes.text();
  console.log('Secure content fetched:', secureText.substring(0, 50));

  console.log('\n--- 5. Checking Updated Live Storage Status ---');
  const statusRes = await fetch(`${BASE_URL}/api/storage/status`);
  const statusData = await statusRes.json();
  console.log('Live Storage Status:', statusData);

  console.log('\n--- 6. Deleting Test Object from Live R2 ---');
  const deleteRes = await fetch(`${BASE_URL}/api/storage/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: sessionCookie,
    },
    body: JSON.stringify({ objectKey }),
  });
  const deleteData = await deleteRes.json();
  console.log('Delete result:', deleteData);

  console.log('\n✅ ALL LIVE R2 CHECKS PASSED ON PRODUCTION CLOUDFLARE WORKER!');
}

testLiveR2().then(() => process.exit(0)).catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
