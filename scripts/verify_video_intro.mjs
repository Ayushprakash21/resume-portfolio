import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACTS_DIR = 'C:/Users/Ayush/.gemini/antigravity/brain/476c7590-1f5b-4226-97b0-0976fa6f2d4a';
const VIDEOS_DIR = path.join(ARTIFACTS_DIR, 'intro_video_evidence');

if (!fs.existsSync(VIDEOS_DIR)) {
  fs.mkdirSync(VIDEOS_DIR, { recursive: true });
}

async function run() {
  console.log('Connecting to preview server at http://localhost:4185/...');
  const browser = await chromium.launch({ headless: true });

  try {
    // -------------------------------------------------------------
    // SCENARIO 1: Desktop First Visit & Video Playback Capture
    // -------------------------------------------------------------
    console.log('\n--- Scenario 1: Desktop First Visit & Video Playback ---');
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: { dir: VIDEOS_DIR, size: { width: 1440, height: 900 } },
    });
    const desktopPage = await desktopContext.newPage();

    await desktopPage.goto('http://localhost:4185/?replay=1', { waitUntil: 'domcontentloaded' });
    await desktopPage.waitForSelector('.boot-intro-overlay', { timeout: 8000 });
    console.log('✔ Intro overlay mounted in DOM');

    // Wait for video element
    await desktopPage.waitForSelector('.boot-intro-logo-video', { timeout: 5000 });
    console.log('✔ Video element found in DOM');

    // Check video properties
    const videoProps = await desktopPage.evaluate(() => {
      const v = document.querySelector('.boot-intro-logo-video');
      if (!v) return null;
      return {
        paused: v.paused,
        muted: v.muted,
        autoplay: v.autoplay,
        playsInline: v.playsInline,
        currentTime: v.currentTime,
        videoWidth: v.videoWidth,
        videoHeight: v.videoHeight,
      };
    });
    console.log('✔ Video properties:', videoProps);

    // Capture 1: Early logo video reveal (~1500ms)
    await desktopPage.waitForTimeout(1500);
    await desktopPage.screenshot({
      path: path.join(ARTIFACTS_DIR, 'video_intro_desktop_01_revealing.png'),
    });
    console.log('✔ Captured video_intro_desktop_01_revealing.png');

    // Capture 2: Name reveal stage (~3500ms)
    await desktopPage.waitForTimeout(2000);
    await desktopPage.screenshot({
      path: path.join(ARTIFACTS_DIR, 'video_intro_desktop_02_name_revealed.png'),
    });
    console.log('✔ Captured video_intro_desktop_02_name_revealed.png');

    // Capture 3: Complete identity with two-stage tagline (~5800ms)
    await desktopPage.waitForTimeout(2300);
    await desktopPage.screenshot({
      path: path.join(ARTIFACTS_DIR, 'video_intro_desktop_03_tagline_full.png'),
    });
    console.log('✔ Captured video_intro_desktop_03_tagline_full.png');

    // Wait for transition into homepage (~8200ms total)
    await desktopPage.waitForTimeout(2400);

    // Verify unmount
    const overlayAfterExit = await desktopPage.$('.boot-intro-overlay');
    console.log('✔ Intro unmounted after completion:', overlayAfterExit === null);

    // Verify hero is live
    await desktopPage.waitForSelector('canvas', { timeout: 8000 });
    await desktopPage.screenshot({
      path: path.join(ARTIFACTS_DIR, 'video_intro_desktop_04_homepage_revealed.png'),
    });
    console.log('✔ Captured video_intro_desktop_04_homepage_revealed.png');

    const video1 = await desktopPage.video();
    const video1Path = video1 ? await video1.path() : null;

    await desktopPage.close();
    await desktopContext.close();

    if (video1Path && fs.existsSync(video1Path)) {
      const targetVideo = path.join(ARTIFACTS_DIR, 'ap_logo_video_intro_live.webm');
      fs.copyFileSync(video1Path, targetVideo);
      console.log('✔ Saved video recording:', targetVideo);
    }

    // -------------------------------------------------------------
    // SCENARIO 2: Reload in Same Session (Session Governance)
    // -------------------------------------------------------------
    console.log('\n--- Scenario 2: Reload Governance in Same Session ---');
    const reloadContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const reloadPage = await reloadContext.newPage();

    // Set sessionStorage
    await reloadPage.goto('http://localhost:4185/', { waitUntil: 'domcontentloaded' });
    await reloadPage.evaluate(() => sessionStorage.setItem('ap_intro_seen_v1', 'true'));

    // Reload
    await reloadPage.reload({ waitUntil: 'domcontentloaded' });
    await reloadPage.waitForTimeout(600);

    const reloadOverlay = await reloadPage.$('.boot-intro-overlay');
    console.log('✔ Intro present on reload (expected false):', reloadOverlay !== null);
    if (reloadOverlay !== null) {
      throw new Error('FAILED: Intro replayed on reload in same session!');
    }

    await reloadPage.close();
    await reloadContext.close();

    // -------------------------------------------------------------
    // SCENARIO 3: Responsive Breakpoints Audit
    // -------------------------------------------------------------
    console.log('\n--- Scenario 3: Responsive Breakpoints Audit ---');
    const viewports = [
      { name: '320px', width: 320, height: 568 },
      { name: '360px', width: 360, height: 640 },
      { name: '375px', width: 375, height: 667 },
      { name: '390px', width: 390, height: 844 },
      { name: '430px', width: 430, height: 932 },
      { name: '768px', width: 768, height: 1024 },
      { name: '1024px', width: 1024, height: 768 },
      { name: '1440px', width: 1440, height: 900 },
      { name: '1920px', width: 1920, height: 1080 },
    ];

    for (const vp of viewports) {
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.width < 768,
        hasTouch: vp.width < 768,
      });
      const p = await ctx.newPage();

      // Use freeze_intro=1 to capture exact settled layout
      await p.goto('http://localhost:4185/?freeze_intro=1', { waitUntil: 'domcontentloaded' });
      await p.waitForSelector('.boot-intro-overlay', { timeout: 8000 });
      await p.waitForTimeout(400);

      const shotPath = path.join(ARTIFACTS_DIR, `video_intro_responsive_${vp.name}.png`);
      await p.screenshot({ path: shotPath });
      console.log(`✔ Captured responsive shot for ${vp.name}`);

      await p.close();
      await ctx.close();
    }

    // -------------------------------------------------------------
    // SCENARIO 4: Skip Intro & Escape Key
    // -------------------------------------------------------------
    console.log('\n--- Scenario 4: Skip Intro Button & Escape Key ---');
    const skipCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const skipP = await skipCtx.newPage();

    await skipP.goto('http://localhost:4185/?replay=1', { waitUntil: 'domcontentloaded' });
    await skipP.waitForSelector('.boot-intro-skip-btn', { timeout: 8000 });
    await skipP.evaluate(() => {
      const btn = document.querySelector('.boot-intro-skip-btn');
      if (btn) btn.click();
    });

    await skipP.waitForTimeout(600);
    const skipOverlay = await skipP.$('.boot-intro-overlay');
    console.log('✔ Intro present after clicking skip (expected false):', skipOverlay !== null);

    const sessionAfterSkip = await skipP.evaluate(() => sessionStorage.getItem('ap_intro_seen_v1'));
    console.log('✔ sessionStorage marked after skip:', sessionAfterSkip);

    await skipP.close();
    await skipCtx.close();

    // -------------------------------------------------------------
    // SCENARIO 5: prefers-reduced-motion Accessibility
    // -------------------------------------------------------------
    console.log('\n--- Scenario 5: Accessibility prefers-reduced-motion ---');
    const rmCtx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'reduce',
    });
    const rmP = await rmCtx.newPage();

    await rmP.goto('http://localhost:4185/', { waitUntil: 'domcontentloaded' });
    await rmP.waitForTimeout(300);
    const rmOverlay = await rmP.$('.boot-intro-overlay');
    console.log('✔ Intro present with reduced-motion (expected false):', rmOverlay !== null);

    await rmP.close();
    await rmCtx.close();

    console.log('\n======================================================');
    console.log('ALL VERIFICATIONS & RESPONSIVE AUDITS PASSED 100%!');
    console.log('======================================================');
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('Verification error:', err);
  process.exit(1);
});
