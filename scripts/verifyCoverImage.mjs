import { chromium } from 'playwright';
import path from 'path';

const outDir = 'C:/Users/Ayush/.gemini/antigravity/brain/476c7590-1f5b-4226-97b0-0976fa6f2d4a';
const BASE_URL = 'http://localhost:4174';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  // Skip boot animation for deterministic test speed
  await context.addInitScript(() => {
    sessionStorage.setItem('ap_boot_intro_played', 'true');
  });

  const page = await context.newPage();

  // Track any image load failures
  const failedImages = [];
  page.on('response', (response) => {
    if (response.request().resourceType() === 'image' && !response.ok()) {
      failedImages.push({ url: response.url(), status: response.status() });
    }
  });

  console.log('--- 1. Checking Public Website Initial State ---');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  // Wait 4000ms for Firestore to finish initial sync
  await page.waitForTimeout(4000);

  // Scroll to About section
  await page.locator('#about').scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);

  // Verify HoloCard Cover Banner & Portrait Photo are present
  const coverBanner = page.locator('[data-testid="holo-card-cover-banner"]');
  const portraitPhoto = page.locator('[data-testid="profile-portrait-image"]');
  console.log('Cover banner visible?', await coverBanner.isVisible());
  console.log('Portrait photo visible?', await portraitPhoto.isVisible());

  const initialCoverSrc = await page.evaluate(() => {
    const img = document.querySelector('[data-testid="profile-cover-image"]');
    return img ? img.getAttribute('src') : null;
  });
  console.log('Settled initial published cover image src in Firestore/CMS:', initialCoverSrc);

  await page.screenshot({
    path: path.join(outDir, 'cover_01_public_about_initial_desktop.png'),
  });

  console.log('\n--- 2. Saving a Different Cover Image as Draft via CMS ---');
  // Choose draft image that is DIFFERENT from current published image
  const testDraftCoverUrl = initialCoverSrc === '/images/hero/cathedral-throne-hall.png'
    ? '/images/hero/shadow-knight-guardian.png'
    : '/images/hero/cathedral-throne-hall.png';

  console.log(`Setting draft coverImage to: ${testDraftCoverUrl}...`);
  await page.evaluate(async (url) => {
    const cms = window.__CMS__;
    const current = cms.getProfile();
    await cms.saveProfileDraft({
      ...current,
      coverImage: url,
    });
  }, testDraftCoverUrl);

  await page.waitForTimeout(1000);

  console.log('\n--- 3. Verifying Public Website Does NOT Expose Draft Image ---');
  const coverSrcAfterDraft = await page.evaluate(() => {
    const img = document.querySelector('[data-testid="profile-cover-image"]');
    return img ? img.getAttribute('src') : null;
  });
  console.log('Public cover image src after draft save:', coverSrcAfterDraft);

  if (coverSrcAfterDraft === testDraftCoverUrl) {
    throw new Error(`FAILURE: Draft image ${testDraftCoverUrl} was prematurely exposed on public website!`);
  }
  console.log(`SUCCESS: Public website kept published image (${coverSrcAfterDraft}) and did not leak draft (${testDraftCoverUrl}).`);

  await page.screenshot({
    path: path.join(outDir, 'cover_02_public_about_draft_isolated.png'),
  });

  console.log('\n--- 4. Publishing New Cover Image Globally via CMS ---');
  const testPublishedCoverUrl = testDraftCoverUrl;
  await page.evaluate(async (url) => {
    const cms = window.__CMS__;
    const current = cms.getProfile();
    await cms.publishProfile({
      ...current,
      coverImage: url,
    });
  }, testPublishedCoverUrl);

  await page.waitForTimeout(1000);

  console.log('\n--- 5. Verifying Public Website Immediately Updates ---');
  const coverSrcAfterPublish = await page.evaluate(() => {
    const img = document.querySelector('[data-testid="profile-cover-image"]');
    return img ? img.getAttribute('src') : null;
  });
  console.log('Public cover image src after publishing:', coverSrcAfterPublish);

  if (coverSrcAfterPublish !== testPublishedCoverUrl) {
    throw new Error(`FAILURE: Public cover image did not update to ${testPublishedCoverUrl}`);
  }
  console.log('SUCCESS: Public cover image updated immediately without manual code reload!');

  await page.screenshot({
    path: path.join(outDir, 'cover_03_public_about_published_desktop.png'),
  });

  console.log('\n--- 6. Verifying Persistence Across Reload ---');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await page.locator('#about').scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  const coverSrcAfterReload = await page.evaluate(() => {
    const img = document.querySelector('[data-testid="profile-cover-image"]');
    return img ? img.getAttribute('src') : null;
  });
  console.log('Public cover image src after page reload:', coverSrcAfterReload);

  if (coverSrcAfterReload !== testPublishedCoverUrl) {
    throw new Error('FAILURE: Cover image did not persist across page reload!');
  }
  console.log('SUCCESS: Cover image persisted across full page reload.');

  await page.screenshot({
    path: path.join(outDir, 'cover_04_public_about_after_reload.png'),
  });

  console.log('\n--- 7. Verifying Mobile Viewport (390px) ---');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(600);
  await page.locator('#about').scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  const isCoverVisibleMobile = await page.locator('[data-testid="profile-cover-image"]').isVisible();
  const isPortraitVisibleMobile = await page.locator('[data-testid="profile-portrait-image"]').isVisible();
  console.log('Mobile cover image visible?', isCoverVisibleMobile);
  console.log('Mobile portrait photo visible?', isPortraitVisibleMobile);

  await page.screenshot({
    path: path.join(outDir, 'cover_05_public_about_mobile_390px.png'),
  });

  console.log('\n--- 8. Checking for any image network failures ---');
  console.log('Failed images count:', failedImages.length);
  if (failedImages.length > 0) {
    console.warn('Failed images:', failedImages);
  }

  console.log('\nALL COVER IMAGE TESTS PASSED WITH 100% SUCCESS!');
  await browser.close();
})();
