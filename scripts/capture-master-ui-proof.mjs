import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('responsive_screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function capture() {
  console.log('--- Starting Preview Server on port 4195 for Master UI Proof ---');
  const server = spawn('node', ['./node_modules/vite/bin/vite.js', 'preview', '--port', '4195', '--strictPort'], {
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
    // 1. Desktop 1440x900 - Hero Viewport (Intro card grounded in typography column)
    console.log('Capturing Desktop 1440x900 Hero...');
    const context1440 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page1440 = await context1440.newPage();
    await page1440.goto('http://localhost:4195', { waitUntil: 'domcontentloaded' });
    await page1440.waitForTimeout(2000);

    const shotHero = path.join(SCREENSHOT_DIR, 'screenshot_hero_repositioned_1440.png');
    await page1440.screenshot({ path: shotHero, fullPage: false });
    console.log(`📸 Saved: ${shotHero}`);

    // 2. Concave Carousel in Projects Section
    console.log('Scrolling to #projects (Concave Carousel)...');
    const projectsElem = page1440.locator('#projects');
    if (await projectsElem.count() > 0) {
      await projectsElem.scrollIntoViewIfNeeded();
      await page1440.waitForTimeout(1000);
      const shotProjects = path.join(SCREENSHOT_DIR, 'screenshot_concave_carousel_1440.png');
      await page1440.screenshot({ path: shotProjects, fullPage: false });
      console.log(`📸 Saved: ${shotProjects}`);
    }

    // 3. Capabilities Section (4-column grid)
    console.log('Scrolling to #capabilities (4-column grid)...');
    const capabilitiesElem = page1440.locator('#capabilities');
    if (await capabilitiesElem.count() > 0) {
      await capabilitiesElem.scrollIntoViewIfNeeded();
      await page1440.waitForTimeout(1000);
      const shotCapabilities = path.join(SCREENSHOT_DIR, 'screenshot_capabilities_4col_1440.png');
      await page1440.screenshot({ path: shotCapabilities, fullPage: false });
      console.log(`📸 Saved: ${shotCapabilities}`);
    }

    // 4. About Section
    console.log('Scrolling to #about...');
    const aboutElem = page1440.locator('#about');
    if (await aboutElem.count() > 0) {
      await aboutElem.scrollIntoViewIfNeeded();
      await page1440.waitForTimeout(1000);
      const shotAbout = path.join(SCREENSHOT_DIR, 'screenshot_editorial_about_1440.png');
      await page1440.screenshot({ path: shotAbout, fullPage: false });
      console.log(`📸 Saved: ${shotAbout}`);
    }

    // 5. Open to Work Section
    console.log('Scrolling to #opentowork...');
    const openElem = page1440.locator('#opentowork');
    if (await openElem.count() > 0) {
      await openElem.scrollIntoViewIfNeeded();
      await page1440.waitForTimeout(1000);
      const shotOpen = path.join(SCREENSHOT_DIR, 'screenshot_editorial_opentowork_1440.png');
      await page1440.screenshot({ path: shotOpen, fullPage: false });
      console.log(`📸 Saved: ${shotOpen}`);
    }

    // 6. Experience Section
    console.log('Scrolling to #experience...');
    const expElem = page1440.locator('#experience');
    if (await expElem.count() > 0) {
      await expElem.scrollIntoViewIfNeeded();
      await page1440.waitForTimeout(1000);
      const shotExp = path.join(SCREENSHOT_DIR, 'screenshot_editorial_experience_1440.png');
      await page1440.screenshot({ path: shotExp, fullPage: false });
      console.log(`📸 Saved: ${shotExp}`);
    }

    // 7. Verify Invariants on 1440
    const pageInvariants = await page1440.evaluate(() => {
      const hasConcave = !!document.querySelector('.concave-carousel');
      const hasStandaloneOrionShowcase = !!document.querySelector('.orion9-showcase-heading') || (document.body.innerText.includes('Orion-9 Subsystem Navigator'));
      const hasStandaloneOrionSection = !!document.querySelector('section#orion9');
      const hasOptionWheel = !!document.querySelector('.option-wheel');
      const introPanelInBottomRow = !!document.querySelector('.hero-intro-panel');
      const capabilitiesCols = document.querySelectorAll('#capabilities .glass-card').length;
      return {
        hasConcave,
        hasStandaloneOrionShowcase,
        hasStandaloneOrionSection,
        hasOptionWheel,
        introPanelInBottomRow,
        capabilitiesCols,
      };
    });
    console.log('Page Invariants Verification:', pageInvariants);

    // 8. Mobile 390x844
    console.log('Capturing Mobile 390x844...');
    const context390 = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page390 = await context390.newPage();
    await page390.goto('http://localhost:4195', { waitUntil: 'domcontentloaded' });
    await page390.waitForTimeout(2000);

    const shotMobileHero = path.join(SCREENSHOT_DIR, 'screenshot_mobile_hero_390.png');
    await page390.screenshot({ path: shotMobileHero, fullPage: false });
    console.log(`📸 Saved: ${shotMobileHero}`);

    const mobileProjects = page390.locator('#projects');
    if (await mobileProjects.count() > 0) {
      await mobileProjects.scrollIntoViewIfNeeded();
      await page390.waitForTimeout(1000);
      const shotMobileProjects = path.join(SCREENSHOT_DIR, 'screenshot_mobile_concave_carousel_390.png');
      await page390.screenshot({ path: shotMobileProjects, fullPage: false });
      console.log(`📸 Saved: ${shotMobileProjects}`);
    }

  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    await browser.close();
    server.kill();
    console.log('--- Proof Capture Completed & Server Stopped ---');
  }
}

capture();
