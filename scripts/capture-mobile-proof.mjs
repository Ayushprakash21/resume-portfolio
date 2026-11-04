import { chromium } from 'playwright';
import { spawn } from 'child_process';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('responsive_screenshots');

async function captureMobile() {
  const server = spawn('npx', ['vite', 'preview', '--port', '4173'], {
    shell: true,
    stdio: 'ignore',
  });

  await new Promise((res) => setTimeout(res, 2000));
  const browser = await chromium.launch({ headless: true });

  try {
    // 1. Mobile 390x844
    const page390 = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page390.goto('http://localhost:4173', { waitUntil: 'domcontentloaded' });
    await page390.waitForTimeout(1000);

    const shot390 = path.join(SCREENSHOT_DIR, 'screenshot_390x844_header_mobile.png');
    await page390.screenshot({ path: shot390, fullPage: false });
    console.log(`📸 Saved: ${shot390}`);

    // Click menu button to open drawer
    const menuBtn390 = page390.locator('.mobile-menu-toggle').first();
    await menuBtn390.click({ force: true });
    await page390.waitForTimeout(500);

    const shot390Drawer = path.join(SCREENSHOT_DIR, 'screenshot_390x844_mobile_drawer_open.png');
    await page390.screenshot({ path: shot390Drawer, fullPage: false });
    console.log(`📸 Saved: ${shot390Drawer}`);
    await page390.close();

    // 2. Mobile 430x932
    const page430 = await browser.newPage({ viewport: { width: 430, height: 932 } });
    await page430.goto('http://localhost:4173', { waitUntil: 'domcontentloaded' });
    await page430.waitForTimeout(1000);

    const shot430 = path.join(SCREENSHOT_DIR, 'screenshot_430x932_header_mobile.png');
    await page430.screenshot({ path: shot430, fullPage: false });
    console.log(`📸 Saved: ${shot430}`);

    const menuBtn430 = page430.locator('.mobile-menu-toggle').first();
    await menuBtn430.click({ force: true });
    await page430.waitForTimeout(500);

    const shot430Drawer = path.join(SCREENSHOT_DIR, 'screenshot_430x932_mobile_drawer_open.png');
    await page430.screenshot({ path: shot430Drawer, fullPage: false });
    console.log(`📸 Saved: ${shot430Drawer}`);
    await page430.close();

    console.log('Mobile screenshots captured successfully!');
  } finally {
    await browser.close();
    server.kill();
  }
}

captureMobile().catch(console.error);
