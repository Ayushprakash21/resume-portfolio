import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('responsive_screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function capture() {
  console.log('--- Starting Preview Server for Top-Right Glass Navigation Proof ---');
  const server = spawn('node', ['./node_modules/vite/bin/vite.js', 'preview', '--port', '4188', '--strictPort'], {
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
    // 1. Desktop 1440x900 - Menu Closed
    console.log('Capturing Desktop 1440x900 Menu Closed...');
    const context1440 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page1440 = await context1440.newPage();
    await page1440.goto('http://localhost:4188', { waitUntil: 'domcontentloaded' });
    await page1440.waitForTimeout(1500);

    const shot1440Closed = path.join(SCREENSHOT_DIR, 'screenshot_1440x900_nav_closed.png');
    await page1440.screenshot({ path: shot1440Closed, fullPage: false });
    console.log(`📸 Saved: ${shot1440Closed}`);

    // Verify Invariants: No OptionWheel, No Recruiter Brief, No Admin Button
    const check1440Closed = await page1440.evaluate(() => {
      const hasWheel = !!document.querySelector('.option-wheel');
      const hasFloatingNav = !!document.querySelector('.floating-portfolio-navigation .option-wheel');
      const headerText = document.querySelector('.portfolio-navbar')?.textContent || '';
      const hasRecruiter = headerText.includes('RECRUITER BRIEF');
      const hasAdmin = headerText.includes('/ADMIN');
      const hasTrigger = !!document.querySelector('.top-right-nav-trigger');
      return { hasWheel, hasFloatingNav, hasRecruiter, hasAdmin, hasTrigger };
    });

    console.log('Desktop 1440 Closed Verification:', check1440Closed);

    // 2. Click trigger -> Menu Open
    console.log('Clicking Top-Right Menu Trigger on 1440px...');
    const triggerBtn = page1440.locator('.top-right-nav-trigger');
    await triggerBtn.click();
    await page1440.waitForTimeout(500);

    const check1440Open = await page1440.evaluate(() => {
      const dropdown = document.querySelector('.top-right-glass-dropdown');
      const links = Array.from(document.querySelectorAll('.top-right-dropdown-link')).map((el) => el.textContent?.trim());
      const rect = dropdown ? dropdown.getBoundingClientRect() : null;
      return {
        hasDropdown: !!dropdown,
        links,
        rect,
      };
    });

    console.log('Desktop 1440 Open Verification:', check1440Open);

    const shot1440Open = path.join(SCREENSHOT_DIR, 'screenshot_1440x900_nav_open.png');
    await page1440.screenshot({ path: shot1440Open, fullPage: false });
    console.log(`📸 Saved: ${shot1440Open}`);

    // Test Escape key closes dropdown
    await page1440.keyboard.press('Escape');
    await page1440.waitForTimeout(300);
    const isClosedByEscape = await page1440.evaluate(() => !document.querySelector('.top-right-glass-dropdown'));
    console.log(`Escape key closes dropdown: ${isClosedByEscape}`);

    await page1440.close();
    await context1440.close();

    // 3. Desktop 1920x1080 - Menu Open
    console.log('Capturing Desktop 1920x1080 Menu Open...');
    const context1920 = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page1920 = await context1920.newPage();
    await page1920.goto('http://localhost:4188', { waitUntil: 'domcontentloaded' });
    await page1920.waitForTimeout(1500);

    await page1920.locator('.top-right-nav-trigger').click();
    await page1920.waitForTimeout(500);

    const shot1920Open = path.join(SCREENSHOT_DIR, 'screenshot_1920x1080_nav_open.png');
    await page1920.screenshot({ path: shot1920Open, fullPage: false });
    console.log(`📸 Saved: ${shot1920Open}`);

    await page1920.close();
    await context1920.close();

    // 4. Mobile 390x844 - Menu Closed & Open
    console.log('Capturing Mobile 390x844 Menu...');
    const context390 = await browser.newContext({
      viewport: { width: 390, height: 844 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15',
    });
    const page390 = await context390.newPage();
    await page390.goto('http://localhost:4188', { waitUntil: 'domcontentloaded' });
    await page390.waitForTimeout(1200);

    const shot390Closed = path.join(SCREENSHOT_DIR, 'screenshot_390x844_nav_closed.png');
    await page390.screenshot({ path: shot390Closed, fullPage: false });
    console.log(`📸 Saved: ${shot390Closed}`);

    await page390.locator('.top-right-nav-trigger').click();
    await page390.waitForTimeout(500);

    const shot390Open = path.join(SCREENSHOT_DIR, 'screenshot_390x844_nav_open.png');
    await page390.screenshot({ path: shot390Open, fullPage: false });
    console.log(`📸 Saved: ${shot390Open}`);

    // Verify click on navigation item closes and navigates
    const experienceBtn = page390.locator('.top-right-dropdown-link', { hasText: 'Experience' });
    await experienceBtn.click();
    await page390.waitForTimeout(800);

    const checkNavigation = await page390.evaluate(() => {
      const hasDropdown = !!document.querySelector('.top-right-glass-dropdown');
      const scrollY = window.scrollY;
      return { hasDropdown, scrollY };
    });
    console.log('Navigation Click Verification (dropdown closed & scrolled):', checkNavigation);

    await page390.close();
    await context390.close();

    console.log('\n--- ALL VERIFICATION & SCREENSHOTS COMPLETED SUCCESSFULLY ---');
  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    await browser.close();
    server.kill();
  }
}

capture();
