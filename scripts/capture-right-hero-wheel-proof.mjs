import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('responsive_screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function capture() {
  console.log('--- Starting Preview Server for Right Hero OptionWheel Proof ---');
  const server = spawn('npx', ['vite', 'preview', '--port', '4173'], {
    shell: true,
    stdio: 'pipe',
  });

  server.stdout.on('data', (d) => process.stdout.write(d.toString()));
  server.stderr.on('data', (d) => process.stderr.write(d.toString()));

  await new Promise((res) => setTimeout(res, 2500));

  const browser = await chromium.launch({ headless: true });

  try {
    // 1. Desktop 1440x900 - Hero with Right-Side OptionWheel
    console.log('Capturing Desktop 1440x900 Right-Side OptionWheel...');
    const context1440 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page1440 = await context1440.newPage();
    await page1440.goto('http://localhost:4173', { waitUntil: 'domcontentloaded' });
    await page1440.waitForTimeout(2000);

    const shot1440 = path.join(SCREENSHOT_DIR, 'screenshot_1440x900_right_hero_wheel.png');
    await page1440.screenshot({ path: shot1440, fullPage: false });
    console.log(`📸 Saved: ${shot1440}`);
    await page1440.close();
    await context1440.close();

    // 2. Desktop 1920x1080 - Hero with Right-Side OptionWheel
    console.log('Capturing Desktop 1920x1080 Right-Side OptionWheel...');
    const context1920 = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page1920 = await context1920.newPage();
    await page1920.goto('http://localhost:4173', { waitUntil: 'domcontentloaded' });
    await page1920.waitForTimeout(2000);

    const shot1920 = path.join(SCREENSHOT_DIR, 'screenshot_1920x1080_right_hero_wheel.png');
    await page1920.screenshot({ path: shot1920, fullPage: false });
    console.log(`📸 Saved: ${shot1920}`);
    await page1920.close();
    await context1920.close();

    // 3. Tablet 768x1024 - Hero View
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

    // 4. Mobile 390x844 - Header & Clean Mobile Drawer
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
