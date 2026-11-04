import { chromium } from 'playwright';
import path from 'path';

const outDir = 'C:/Users/Ayush/.gemini/antigravity/brain/476c7590-1f5b-4226-97b0-0976fa6f2d4a';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('Navigating to http://localhost:4173/ ...');
  await page.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // 1. Desktop 1440px Hero Name
  console.log('Capturing Desktop Hero Name...');
  const heroNameEl = page.locator('.hero-name');
  await heroNameEl.waitFor({ state: 'visible' });

  const box = await heroNameEl.boundingBox();
  if (box) {
    await page.screenshot({
      path: path.join(outDir, 'hero_name_desktop_closeup.png'),
      clip: {
        x: Math.max(0, box.x - 20),
        y: Math.max(0, box.y - 15),
        width: box.width + 40,
        height: box.height + 30,
      },
    });
  }

  // Full Desktop Hero
  await page.screenshot({ path: path.join(outDir, 'hero_name_desktop_full.png') });

  // 2. Mobile 390px Hero Name
  console.log('Capturing Mobile Hero Name at 390px...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1000);

  const mobileHeroNameEl = page.locator('.hero-name');
  const mobileBox = await mobileHeroNameEl.boundingBox();
  if (mobileBox) {
    await page.screenshot({
      path: path.join(outDir, 'hero_name_mobile_closeup.png'),
      clip: {
        x: Math.max(0, mobileBox.x - 10),
        y: Math.max(0, mobileBox.y - 10),
        width: Math.min(390, mobileBox.width + 20),
        height: mobileBox.height + 20,
      },
    });
  }

  // Full Mobile Hero
  await page.screenshot({ path: path.join(outDir, 'hero_name_mobile_full.png') });

  console.log('Captures completed successfully.');
  await browser.close();
})();
