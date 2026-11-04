import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = path.resolve('C:/Users/Ayush/.gemini/antigravity/brain/c69caf70-c01e-497a-a727-89e524f71e6f');
const SCREENSHOT_DIR = path.resolve('responsive_screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function capture() {
  console.log('--- Starting Preview Server on port 4198 for Approved Hero Brand Proof ---');
  const server = spawn('node', ['./node_modules/vite/bin/vite.js', 'preview', '--port', '4198', '--strictPort'], {
    stdio: 'pipe',
  });

  server.stdout.on('data', (d) => process.stdout.write(d.toString()));
  server.stderr.on('data', (d) => process.stderr.write(d.toString()));

  await new Promise((res) => {
    server.stdout.on('data', (d) => {
      if (d.toString().includes('Local:')) res();
    });
    setTimeout(res, 4000);
  });

  const browser = await chromium.launch({ headless: true });

  try {
    // 1. Desktop 1440x900
    console.log('Capturing Desktop 1440x900 Hero...');
    const context1440 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page1440 = await context1440.newPage();
    await page1440.goto('http://localhost:4198', { waitUntil: 'domcontentloaded' });
    await page1440.waitForTimeout(2500);

    const shotHero1440 = path.join(SCREENSHOT_DIR, 'screenshot_approved_hero_1440.png');
    await page1440.screenshot({ path: shotHero1440, fullPage: false });
    fs.copyFileSync(shotHero1440, path.join(ARTIFACT_DIR, 'screenshot_approved_hero_1440.png'));
    console.log(`📸 Saved: ${shotHero1440}`);

    // Verify ordering and layout invariants on 1440
    const check1440 = await page1440.evaluate(() => {
      const headerWordmark = document.querySelector('.ap-header-name');
      const headerLogo = document.querySelector('.ap-header-monogram');
      const introPanel = document.querySelector('.hero-intro-panel');
      const standaloneLogo = document.querySelector('.hero-standalone-monogram img');
      const founderName = document.querySelector('.hero-founder-name');
      const headline = document.evaluate("//div[contains(text(),'BUSINESS. SYSTEMS.')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      const subtitleBadge = document.querySelector('.hero-brand-signature');

      const introRect = introPanel ? introPanel.getBoundingClientRect() : null;
      const logoRect = standaloneLogo ? standaloneLogo.getBoundingClientRect() : null;
      const nameRect = founderName ? founderName.getBoundingClientRect() : null;
      const headRect = headline ? headline.getBoundingClientRect() : null;

      const isIntroAboveLogo = introRect && logoRect ? introRect.bottom <= logoRect.top : false;
      const isLogoAboveName = logoRect && nameRect ? logoRect.bottom <= nameRect.top : false;
      const isNameAboveHeadline = nameRect && headRect ? nameRect.bottom <= headRect.top : false;

      return {
        headerHasWordmark: !!headerWordmark,
        headerHasLogo: !!headerLogo,
        hasOldBadge: !!subtitleBadge,
        standaloneLogoWidth: logoRect ? logoRect.width : 0,
        isIntroAboveLogo,
        isLogoAboveName,
        isNameAboveHeadline,
      };
    });
    console.log('1440px Invariants Verification:', check1440);

    // 2. Desktop 1920x1080
    console.log('Capturing Desktop 1920x1080 Hero...');
    const context1920 = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page1920 = await context1920.newPage();
    await page1920.goto('http://localhost:4198', { waitUntil: 'domcontentloaded' });
    await page1920.waitForTimeout(2500);

    const shotHero1920 = path.join(SCREENSHOT_DIR, 'screenshot_approved_hero_1920.png');
    await page1920.screenshot({ path: shotHero1920, fullPage: false });
    fs.copyFileSync(shotHero1920, path.join(ARTIFACT_DIR, 'screenshot_approved_hero_1920.png'));
    console.log(`📸 Saved: ${shotHero1920}`);

    // 3. Mobile 390x844
    console.log('Capturing Mobile 390x844 Hero...');
    const context390 = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page390 = await context390.newPage();
    await page390.goto('http://localhost:4198', { waitUntil: 'domcontentloaded' });
    await page390.waitForTimeout(2500);

    const shotMobileHero390 = path.join(SCREENSHOT_DIR, 'screenshot_approved_hero_390.png');
    await page390.screenshot({ path: shotMobileHero390, fullPage: false });
    fs.copyFileSync(shotMobileHero390, path.join(ARTIFACT_DIR, 'screenshot_approved_hero_390.png'));
    console.log(`📸 Saved: ${shotMobileHero390}`);

  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    await browser.close();
    server.kill();
    console.log('--- Proof Capture Completed & Server Stopped ---');
  }
}

capture();
