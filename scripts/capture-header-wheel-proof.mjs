import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('responsive_screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function capture() {
  console.log('--- Starting Preview Server for Header OptionWheel Proof ---');
  const server = spawn('npx', ['vite', 'preview', '--port', '4173'], {
    shell: true,
    stdio: 'pipe',
  });

  server.stdout.on('data', (d) => process.stdout.write(d.toString()));
  server.stderr.on('data', (d) => process.stderr.write(d.toString()));

  await new Promise((res) => setTimeout(res, 2500));

  const browser = await chromium.launch({ headless: true });

  try {
    // 1. Desktop 1440x900 - Header with OptionWheel
    console.log('Capturing Desktop 1440x900 Header OptionWheel...');
    const context1440 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page1440 = await context1440.newPage();
    await page1440.goto('http://localhost:4173', { waitUntil: 'load' });
    await page1440.waitForTimeout(1200);

    // Verify option wheel is rendered
    const wheel1440 = page1440.locator('.portfolio-navbar .option-wheel');
    const isWheelVisible = await wheel1440.isVisible();
    console.log(`OptionWheel visible in header (1440px): ${isWheelVisible}`);

    // Verify Orion-9 pill is absent
    const pill = await page1440.evaluate(() => {
      const allText = document.querySelector('.portfolio-navbar')?.textContent || '';
      return allText.includes('Orion-9 Overview');
    });
    console.log(`Orion-9 pill present in header: ${pill} (Must be false)`);

    const shot1440 = path.join(SCREENSHOT_DIR, 'screenshot_1440x900_header_option_wheel.png');
    await page1440.screenshot({ path: shot1440, fullPage: false });
    console.log(`📸 Saved: ${shot1440}`);

    // 2. Desktop 1920x1080 - Header with OptionWheel
    console.log('Capturing Desktop 1920x1080 Header OptionWheel...');
    const context1920 = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page1920 = await context1920.newPage();
    await page1920.goto('http://localhost:4173', { waitUntil: 'load' });
    await page1920.waitForTimeout(1200);

    const shot1920 = path.join(SCREENSHOT_DIR, 'screenshot_1920x1080_header_option_wheel.png');
    await page1920.screenshot({ path: shot1920, fullPage: false });
    console.log(`📸 Saved: ${shot1920}`);

    // 3. Mobile 390x844 - Header & Mobile Drawer
    console.log('Capturing Mobile 390x844...');
    const context390 = await browser.newContext({
      viewport: { width: 390, height: 844 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15',
    });
    const page390 = await context390.newPage();
    await page390.goto('http://localhost:4173', { waitUntil: 'load' });
    await page390.waitForTimeout(1000);

    const shot390 = path.join(SCREENSHOT_DIR, 'screenshot_390x844_header_mobile.png');
    await page390.screenshot({ path: shot390, fullPage: false });
    console.log(`📸 Saved: ${shot390}`);

    // Open mobile menu
    const menuBtn = page390.locator('.mobile-menu-toggle').first();
    await menuBtn.click();
    await page390.waitForTimeout(400);
    const shot390Drawer = path.join(SCREENSHOT_DIR, 'screenshot_390x844_mobile_drawer_open.png');
    await page390.screenshot({ path: shot390Drawer, fullPage: false });
    console.log(`📸 Saved: ${shot390Drawer}`);

    // 4. Mobile 430x932 - Header & Mobile Drawer
    console.log('Capturing Mobile 430x932...');
    const context430 = await browser.newContext({
      viewport: { width: 430, height: 932 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15',
    });
    const page430 = await context430.newPage();
    await page430.goto('http://localhost:4173', { waitUntil: 'load' });
    await page430.waitForTimeout(1000);

    const shot430 = path.join(SCREENSHOT_DIR, 'screenshot_430x932_header_mobile.png');
    await page430.screenshot({ path: shot430, fullPage: false });
    console.log(`📸 Saved: ${shot430}`);

    // Open mobile menu
    const menuBtn430 = page430.locator('.mobile-menu-toggle').first();
    await menuBtn430.click();
    await page430.waitForTimeout(400);
    const shot430Drawer = path.join(SCREENSHOT_DIR, 'screenshot_430x932_mobile_drawer_open.png');
    await page430.screenshot({ path: shot430Drawer, fullPage: false });
    console.log(`📸 Saved: ${shot430Drawer}`);

    console.log('\n✔ All requested visual proof screenshots captured successfully!');
  } finally {
    await browser.close();
    server.kill();
  }
}

capture().catch((e) => {
  console.error(e);
  process.exit(1);
});
