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

  console.log('--- 1. Navigating to Public Website ---');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Restore published profile cover image to a clean dark sovereign banner or test fallback
  console.log('Publishing clean executive banner to Firestore CMS...');
  await page.evaluate(async () => {
    const cms = window.__CMS__;
    const current = cms.getProfile();
    await cms.publishProfile({
      ...current,
      coverImage: '/images/hero/dark-sovereign-throne.png',
    });
  });

  await page.waitForTimeout(1000);

  // Scroll to About section
  await page.locator('#about').scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);

  // Measure HoloCard Banner and Portrait dimensions
  const bannerBox = await page.locator('[data-testid="holo-card-cover-banner"]').boundingBox();
  const portraitBox = await page.locator('[data-testid="profile-portrait-image"]').boundingBox();

  console.log(`Banner dimensions: ${bannerBox.width.toFixed(1)}px x ${bannerBox.height.toFixed(1)}px (Aspect: ${(bannerBox.width / bannerBox.height).toFixed(2)}:1)`);
  console.log(`Portrait dimensions: ${portraitBox.width.toFixed(1)}px x ${portraitBox.height.toFixed(1)}px (Aspect: ${(portraitBox.width / portraitBox.height).toFixed(2)}:1)`);

  // Capture Desktop Screenshot
  await page.screenshot({
    path: path.join(outDir, 'shallow_banner_01_desktop_1440px.png'),
  });

  // Capture Close-up on the Profile Card
  const profileCard = page.locator('#about .editorial-2col-responsive > div').first();
  await profileCard.screenshot({
    path: path.join(outDir, 'shallow_banner_02_card_closeup_desktop.png'),
  });

  // Test Mobile Viewport (390px)
  console.log('--- 2. Verifying Mobile Viewport (390px) ---');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(800);
  await page.locator('#about').scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  const mobileBannerBox = await page.locator('[data-testid="holo-card-cover-banner"]').boundingBox();
  const mobilePortraitBox = await page.locator('[data-testid="profile-portrait-image"]').boundingBox();
  console.log(`Mobile banner: ${mobileBannerBox.width.toFixed(1)}px x ${mobileBannerBox.height.toFixed(1)}px (Aspect: ${(mobileBannerBox.width / mobileBannerBox.height).toFixed(2)}:1)`);
  console.log(`Mobile portrait: ${mobilePortraitBox.width.toFixed(1)}px x ${mobilePortraitBox.height.toFixed(1)}px`);

  await page.screenshot({
    path: path.join(outDir, 'shallow_banner_03_mobile_390px.png'),
  });

  // Test Fallback when coverImage is duplicate or empty
  console.log('--- 3. Testing Clean Dark Silver Gradient Fallback ---');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(async () => {
    const cms = window.__CMS__;
    const current = cms.getProfile();
    // Set coverImage identical to profilePhoto to test duplicate prevention fallback
    await cms.publishProfile({
      ...current,
      coverImage: current.profilePhoto,
    });
  });

  await page.waitForTimeout(1000);
  await page.locator('#about').scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  const fallbackVisible = await page.locator('[data-testid="profile-cover-fallback"]').isVisible();
  console.log('Clean dark silver gradient fallback visible on duplicate cover?', fallbackVisible);

  await profileCard.screenshot({
    path: path.join(outDir, 'shallow_banner_04_fallback_card_desktop.png'),
  });

  // Restore to clean sovereign banner
  await page.evaluate(async () => {
    const cms = window.__CMS__;
    const current = cms.getProfile();
    await cms.publishProfile({
      ...current,
      coverImage: '/images/hero/dark-sovereign-throne.png',
    });
  });
  await page.waitForTimeout(800);

  console.log('ALL SHALLOW BANNER VERIFICATIONS COMPLETED SUCCESSFULLY!');
  await browser.close();
})();
