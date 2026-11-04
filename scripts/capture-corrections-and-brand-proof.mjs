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
  console.log('--- Starting Preview Server on port 4196 for Corrections & Brand Proof ---');
  const server = spawn('node', ['./node_modules/vite/bin/vite.js', 'preview', '--port', '4196', '--strictPort'], {
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
    console.log('Capturing Desktop 1440x900...');
    const context1440 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page1440 = await context1440.newPage();
    await page1440.goto('http://localhost:4196', { waitUntil: 'domcontentloaded' });
    await page1440.waitForTimeout(2500);

    // Hero Viewport with Oversized Typography and Header Brand Lockup
    const shotHero = path.join(SCREENSHOT_DIR, 'screenshot_brand_hero_1440.png');
    await page1440.screenshot({ path: shotHero, fullPage: false });
    fs.copyFileSync(shotHero, path.join(ARTIFACT_DIR, 'screenshot_brand_hero_1440.png'));
    console.log(`📸 Saved: ${shotHero}`);

    // Capabilities Section (Concave Carousel)
    console.log('Scrolling to #capabilities (Concave Carousel)...');
    const capabilitiesElem = page1440.locator('#capabilities');
    if (await capabilitiesElem.count() > 0) {
      await capabilitiesElem.scrollIntoViewIfNeeded();
      await page1440.waitForTimeout(1000);
      const shotCapabilities = path.join(SCREENSHOT_DIR, 'screenshot_capabilities_concave_1440.png');
      await page1440.screenshot({ path: shotCapabilities, fullPage: false });
      fs.copyFileSync(shotCapabilities, path.join(ARTIFACT_DIR, 'screenshot_capabilities_concave_1440.png'));
      console.log(`📸 Saved: ${shotCapabilities}`);
    }

    // Projects Section (Restored Compact Horizontal Cards)
    console.log('Scrolling to #projects (Restored Horizontal Cards)...');
    const projectsElem = page1440.locator('#projects');
    if (await projectsElem.count() > 0) {
      await projectsElem.scrollIntoViewIfNeeded();
      await page1440.waitForTimeout(1000);
      const shotProjects = path.join(SCREENSHOT_DIR, 'screenshot_projects_restored_1440.png');
      await page1440.screenshot({ path: shotProjects, fullPage: false });
      fs.copyFileSync(shotProjects, path.join(ARTIFACT_DIR, 'screenshot_projects_restored_1440.png'));
      console.log(`📸 Saved: ${shotProjects}`);
    }

    // Open to Work Section (Auto Height Cards)
    console.log('Scrolling to #opentowork...');
    const openElem = page1440.locator('#opentowork');
    if (await openElem.count() > 0) {
      await openElem.scrollIntoViewIfNeeded();
      await page1440.waitForTimeout(1000);
      const shotOpen = path.join(SCREENSHOT_DIR, 'screenshot_opentowork_auto_height_1440.png');
      await page1440.screenshot({ path: shotOpen, fullPage: false });
      fs.copyFileSync(shotOpen, path.join(ARTIFACT_DIR, 'screenshot_opentowork_auto_height_1440.png'));
      console.log(`📸 Saved: ${shotOpen}`);
    }

    // Open to Work to Experience Transition (Checking Gap)
    console.log('Capturing Open to Work -> Experience Transition...');
    const expElem = page1440.locator('#experience');
    if (await expElem.count() > 0) {
      // scroll to just above experience
      await page1440.evaluate(() => {
        const exp = document.getElementById('experience');
        if (exp) {
          const rect = exp.getBoundingClientRect();
          window.scrollBy(0, rect.top - 200);
        }
      });
      await page1440.waitForTimeout(1000);
      const shotGap = path.join(SCREENSHOT_DIR, 'screenshot_opentowork_to_experience_gap_1440.png');
      await page1440.screenshot({ path: shotGap, fullPage: false });
      fs.copyFileSync(shotGap, path.join(ARTIFACT_DIR, 'screenshot_opentowork_to_experience_gap_1440.png'));
      console.log(`📸 Saved: ${shotGap}`);
    }

    // 2. Mobile 390x844
    console.log('Capturing Mobile 390x844...');
    const context390 = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page390 = await context390.newPage();
    await page390.goto('http://localhost:4196', { waitUntil: 'domcontentloaded' });
    await page390.waitForTimeout(2500);

    const shotMobileHero = path.join(SCREENSHOT_DIR, 'screenshot_mobile_brand_hero_390.png');
    await page390.screenshot({ path: shotMobileHero, fullPage: false });
    fs.copyFileSync(shotMobileHero, path.join(ARTIFACT_DIR, 'screenshot_mobile_brand_hero_390.png'));
    console.log(`📸 Saved: ${shotMobileHero}`);

    // Verify measurements and layout invariants
    const measurements = await page1440.evaluate(() => {
      const headerLogo = document.querySelector('.ap-header-monogram');
      const headerName = document.querySelector('.ap-header-name');
      const heroFirstName = document.querySelector('.hero-first-name');
      const heroLastName = document.querySelector('.hero-last-name');
      const concaveInCapabilities = !!document.querySelector('#capabilities .concave-carousel');
      const concaveInProjects = !!document.querySelector('#projects .concave-carousel');
      const openToWorkGrid = document.querySelector('.open-to-work-grid');
      const openToWorkSection = document.querySelector('#opentowork');
      const experienceSection = document.querySelector('#experience');

      let gapPx = 0;
      if (openToWorkSection && experienceSection) {
        const openRect = openToWorkSection.getBoundingClientRect();
        const expRect = experienceSection.getBoundingClientRect();
        gapPx = expRect.top - openRect.bottom;
      }

      return {
        headerLogoWidth: headerLogo ? headerLogo.getBoundingClientRect().width : 0,
        headerNameFontSize: headerName ? window.getComputedStyle(headerName).fontSize : '',
        heroFirstNameFontSize: heroFirstName ? window.getComputedStyle(heroFirstName).fontSize : '',
        heroLastNameFontSize: heroLastName ? window.getComputedStyle(heroLastName).fontSize : '',
        concaveInCapabilities,
        concaveInProjects,
        openToWorkGridHeight: openToWorkGrid ? openToWorkGrid.getBoundingClientRect().height : 0,
        gapPx,
      };
    });

    console.log('Verification Measurements:', measurements);

  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    await browser.close();
    server.kill();
    console.log('--- Proof Capture Completed & Server Stopped ---');
  }
}

capture();
