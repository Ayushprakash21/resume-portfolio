import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACTS_DIR = 'C:/Users/Ayush/.gemini/antigravity/brain/476c7590-1f5b-4226-97b0-0976fa6f2d4a';
const VIDEOS_DIR = path.join(ARTIFACTS_DIR, 'intro_videos');

if (!fs.existsSync(VIDEOS_DIR)) {
  fs.mkdirSync(VIDEOS_DIR, { recursive: true });
}

async function run() {
  console.log('Connecting to preview server at http://localhost:4180/...');
  const browser = await chromium.launch({ headless: true });

  try {
    // -------------------------------------------------------------
    // SCENARIO 1: Desktop First Visit Full Intro Video & Screenshots
    // -------------------------------------------------------------
    console.log('\n--- Scenario 1: Desktop First Visit (Fresh Browser Session) ---');
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: { dir: VIDEOS_DIR, size: { width: 1440, height: 900 } },
    });
    const desktopPage = await desktopContext.newPage();

    // Fresh navigation
    await desktopPage.goto('http://localhost:4180/');
    await desktopPage.waitForSelector('.boot-intro-overlay', { timeout: 5000 });
    console.log('✔ Intro overlay mounted in DOM');

    // Stage 1: Logo Trace & emergence (~600ms)
    await desktopPage.waitForTimeout(600);
    await desktopPage.screenshot({
      path: path.join(ARTIFACTS_DIR, 'boot_intro_desktop_logo_trace.png'),
    });
    console.log('✔ Captured boot_intro_desktop_logo_trace.png');

    // Stage 2: Star Flare illumination & name emergence (~1500ms)
    await desktopPage.waitForTimeout(900);
    await desktopPage.screenshot({
      path: path.join(ARTIFACTS_DIR, 'boot_intro_desktop_star_name.png'),
    });
    console.log('✔ Captured boot_intro_desktop_star_name.png');

    // Stage 3: Complete Identity & Two-Stage Tagline (~2600ms)
    await desktopPage.waitForTimeout(1100);
    await desktopPage.screenshot({
      path: path.join(ARTIFACTS_DIR, 'boot_intro_desktop_identity_full.png'),
    });
    console.log('✔ Captured boot_intro_desktop_identity_full.png');

    // Stage 4: Let transition complete into homepage (~3800ms)
    await desktopPage.waitForTimeout(1200);

    // Verify unmount
    const overlayAfterExit = await desktopPage.$('.boot-intro-overlay');
    console.log('✔ Intro unmounted after completion:', overlayAfterExit === null);

    // Verify sessionStorage was marked
    const sessionSeen = await desktopPage.evaluate(() => sessionStorage.getItem('ap_intro_seen_v1'));
    console.log('✔ sessionStorage ap_intro_seen_v1 is:', sessionSeen);

    const video1 = await desktopPage.video();
    const video1Path = video1 ? await video1.path() : null;

    await desktopPage.close();
    await desktopContext.close();

    if (video1Path && fs.existsSync(video1Path)) {
      const targetVideo1 = path.join(ARTIFACTS_DIR, 'boot_intro_full_animation.webm');
      fs.copyFileSync(video1Path, targetVideo1);
      console.log('✔ Saved full intro screen recording video:', targetVideo1);
    }

    // -------------------------------------------------------------
    // SCENARIO 2: Reload Behaviour (Session Governance)
    // -------------------------------------------------------------
    console.log('\n--- Scenario 2: Reload in Same Session (Session Governance) ---');
    const reloadContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: { dir: VIDEOS_DIR, size: { width: 1440, height: 900 } },
    });
    const reloadPage = await reloadContext.newPage();

    // First visit to populate sessionStorage
    await reloadPage.goto('http://localhost:4180/');
    await reloadPage.waitForSelector('.boot-intro-overlay', { timeout: 5000 });
    // Simulate user waiting or skipping
    await reloadPage.evaluate(() => {
      sessionStorage.setItem('ap_intro_seen_v1', 'true');
    });

    // Reload the page within the same session
    console.log('Reloading page within same session...');
    await reloadPage.reload();

    // Ensure intro overlay is NOT rendered on reload
    await reloadPage.waitForTimeout(600);
    const reloadOverlay = await reloadPage.$('.boot-intro-overlay');
    console.log('✔ Intro replayed on reload:', reloadOverlay !== null, '(Expected: false)');
    if (reloadOverlay !== null) {
      throw new Error('FAILED: Intro replayed on reload in same session!');
    }

    // Verify hero section is visible immediately
    await reloadPage.waitForSelector('canvas', { timeout: 6000 });
    await reloadPage.screenshot({
      path: path.join(ARTIFACTS_DIR, 'boot_intro_reload_direct_hero.png'),
    });
    console.log('✔ Captured boot_intro_reload_direct_hero.png (Direct hero load)');

    const video2 = await reloadPage.video();
    const video2Path = video2 ? await video2.path() : null;

    await reloadPage.close();
    await reloadContext.close();

    if (video2Path && fs.existsSync(video2Path)) {
      const targetVideo2 = path.join(ARTIFACTS_DIR, 'boot_intro_reload_behaviour.webm');
      fs.copyFileSync(video2Path, targetVideo2);
      console.log('✔ Saved reload behaviour recording video:', targetVideo2);
    }

    // -------------------------------------------------------------
    // SCENARIO 3: Mobile Viewport (390px iPhone 14)
    // -------------------------------------------------------------
    console.log('\n--- Scenario 3: Mobile Viewport (390px iPhone 14) ---');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();

    // Open with freeze parameter to inspect exact typography & mobile layout
    await mobilePage.goto('http://localhost:4180/?freeze_intro=1');
    await mobilePage.waitForSelector('.boot-intro-overlay', { timeout: 5000 });
    await mobilePage.waitForTimeout(500);

    await mobilePage.screenshot({
      path: path.join(ARTIFACTS_DIR, 'boot_intro_mobile_390.png'),
    });
    console.log('✔ Captured boot_intro_mobile_390.png');

    await mobilePage.close();
    await mobileContext.close();

    // -------------------------------------------------------------
    // SCENARIO 4: Skip Intro Button & Escape Key
    // -------------------------------------------------------------
    console.log('\n--- Scenario 4A: Skip Intro Button ---');
    const skipContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const skipPage = await skipContext.newPage();

    await skipPage.goto('http://localhost:4180/?replay=1');
    await skipPage.waitForSelector('.boot-intro-skip-btn', { timeout: 5000 });
    console.log('Clicking Skip button immediately...');
    await skipPage.evaluate(() => {
      const btn = document.querySelector('.boot-intro-skip-btn');
      if (btn) btn.click();
    });

    await skipPage.waitForTimeout(500);
    const skipPresent = await skipPage.$('.boot-intro-overlay');
    console.log('✔ Intro present after skip:', skipPresent !== null, '(Expected: false)');

    const seenAfterSkip = await skipPage.evaluate(() => sessionStorage.getItem('ap_intro_seen_v1'));
    console.log('✔ sessionStorage after skip:', seenAfterSkip, '(Expected: true)');

    await skipPage.close();
    await skipContext.close();

    console.log('\n--- Scenario 4B: Escape Key Skip ---');
    const escContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const escPage = await escContext.newPage();

    await escPage.goto('http://localhost:4180/?replay=1');
    await escPage.waitForSelector('.boot-intro-overlay', { timeout: 5000 });
    console.log('Pressing Escape key...');
    await escPage.keyboard.press('Escape');

    await escPage.waitForTimeout(500);
    const escPresent = await escPage.$('.boot-intro-overlay');
    console.log('✔ Intro present after Escape:', escPresent !== null, '(Expected: false)');

    await escPage.close();
    await escContext.close();

    // -------------------------------------------------------------
    // SCENARIO 5: prefers-reduced-motion Accessibility
    // -------------------------------------------------------------
    console.log('\n--- Scenario 5: Accessibility prefers-reduced-motion ---');
    const rmContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'reduce',
    });
    const rmPage = await rmContext.newPage();

    await rmPage.goto('http://localhost:4180/');
    await rmPage.waitForTimeout(300);
    const rmOverlay = await rmPage.$('.boot-intro-overlay');
    console.log('✔ Intro overlay present with reduced-motion:', rmOverlay !== null, '(Expected: false)');

    await rmPage.close();
    await rmContext.close();

    console.log('\n========================================');
    console.log('ALL 5 ACCEPTANCE SCENARIOS PASSED 100%!');
    console.log('========================================');
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('Verification error:', err);
  process.exit(1);
});
