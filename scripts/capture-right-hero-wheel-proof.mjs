import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('responsive_screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function capture() {
  console.log('--- Starting Preview Server for Global Floating OptionWheel Proof ---');
  const server = spawn('npx', ['vite', 'preview', '--port', '4173'], {
    shell: true,
    stdio: 'pipe',
  });

  server.stdout.on('data', (d) => process.stdout.write(d.toString()));
  server.stderr.on('data', (d) => process.stderr.write(d.toString()));

  await new Promise((res) => setTimeout(res, 2500));

  const browser = await chromium.launch({ headless: true });

  try {
    // 1. Desktop 1440x900 - Homepage with Global Floating OptionWheel
    console.log('Capturing Desktop 1440x900 Global Floating OptionWheel...');
    const context1440 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page1440 = await context1440.newPage();
    await page1440.goto('http://localhost:4173', { waitUntil: 'domcontentloaded' });
    await page1440.waitForTimeout(2000);

    // Validate Desktop 1440 invariants
    const check1440 = await page1440.evaluate(() => {
      const headerText = document.querySelector('.portfolio-navbar')?.textContent || '';
      const hasHeaderWheel = !!document.querySelector('.portfolio-navbar .option-wheel');
      const hasFloatingWheel = !!document.querySelector('.floating-portfolio-nav .option-wheel');
      const hasOrionShowcase = !!document.querySelector('#orion-subsystems');
      const hasShowcaseHeading = document.body.textContent?.includes('Orion-9 Subsystem Navigator') || false;

      const wheelDock = document.querySelector('.floating-portfolio-nav');
      const rect = wheelDock ? wheelDock.getBoundingClientRect() : null;

      return {
        hasHeaderWheel,
        hasFloatingWheel,
        hasOrionShowcase,
        hasShowcaseHeading,
        rect,
      };
    });

    console.log('1440px Verification:');
    console.log(`- Global Floating Wheel present: ${check1440.hasFloatingWheel}`);
    console.log(`- Center Header Wheel present: ${check1440.hasHeaderWheel} (Must be false)`);
    console.log(`- Orion-9 Subsystems showcase present: ${check1440.hasOrionShowcase} (Must be false)`);
    console.log(`- "Orion-9 Subsystem Navigator" text present: ${check1440.hasShowcaseHeading} (Must be false)`);
    console.log(`- Floating Wheel position:`, check1440.rect);

    const shot1440 = path.join(SCREENSHOT_DIR, 'screenshot_1440x900_global_floating_wheel.png');
    await page1440.screenshot({ path: shot1440, fullPage: false });
    console.log(`📸 Saved: ${shot1440}`);

    // Scroll to #orion-9 and screenshot the clean Orion-9 section
    const orionSection = page1440.locator('#orion-9');
    await orionSection.scrollIntoViewIfNeeded();
    await page1440.waitForTimeout(800);
    const shotOrion = path.join(SCREENSHOT_DIR, 'screenshot_orion9_section_no_showcase.png');
    await page1440.screenshot({ path: shotOrion, fullPage: false });
    console.log(`📸 Saved clean Orion-9 section: ${shotOrion}`);

    await page1440.close();
    await context1440.close();

    // 2. Desktop 1920x1080 - Homepage with Global Floating OptionWheel
    console.log('Capturing Desktop 1920x1080 Global Floating OptionWheel...');
    const context1920 = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page1920 = await context1920.newPage();
    await page1920.goto('http://localhost:4173', { waitUntil: 'domcontentloaded' });
    await page1920.waitForTimeout(2000);

    const shot1920 = path.join(SCREENSHOT_DIR, 'screenshot_1920x1080_global_floating_wheel.png');
    await page1920.screenshot({ path: shot1920, fullPage: false });
    console.log(`📸 Saved: ${shot1920}`);
    await page1920.close();
    await context1920.close();

    // 3. Tablet 768x1024
    console.log('Capturing Tablet 768x1024...');
    const context768 = await browser.newContext({ viewport: { width: 768, height: 1024 } });
    const page768 = await context768.newPage();
    await page768.goto('http://localhost:4173', { waitUntil: 'domcontentloaded' });
    await page768.waitForTimeout(1500);

    const shot768 = path.join(SCREENSHOT_DIR, 'screenshot_768x1024_tablet_wheel.png');
    await page768.screenshot({ path: shot768, fullPage: false });
    console.log(`📸 Saved: ${shot768}`);
    await page768.close();
    await context768.close();

    // 4. Mobile 390x844
    console.log('Capturing Mobile 390x844...');
    const context390 = await browser.newContext({
      viewport: { width: 390, height: 844 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15',
    });
    const page390 = await context390.newPage();
    await page390.goto('http://localhost:4173', { waitUntil: 'domcontentloaded' });
    await page390.waitForTimeout(1200);

    const shot390 = path.join(SCREENSHOT_DIR, 'screenshot_390x844_mobile_clean_header.png');
    await page390.screenshot({ path: shot390, fullPage: false });
    console.log(`📸 Saved: ${shot390}`);

    // Open mobile menu
    const menuBtn = page390.locator('.mobile-menu-toggle').first();
    await menuBtn.click({ force: true });
    await page390.waitForTimeout(400);

    const shot390Drawer = path.join(SCREENSHOT_DIR, 'screenshot_390x844_mobile_drawer_clean.png');
    await page390.screenshot({ path: shot390Drawer, fullPage: false });
    console.log(`📸 Saved: ${shot390Drawer}`);
    await page390.close();
    await context390.close();

    console.log('\n--- ALL VISUAL SCREENSHOTS CAPTURED SUCCESSFULLY ---');
  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    await browser.close();
    server.kill();
  }
}

capture();
