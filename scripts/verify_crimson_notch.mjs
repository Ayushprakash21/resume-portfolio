import { chromium } from 'playwright';
import path from 'path';

const outDir = 'C:/Users/Ayush/.gemini/antigravity/brain/476c7590-1f5b-4226-97b0-0976fa6f2d4a';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('Navigating to http://localhost:4173/ ...');
  await page.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // 1. Capture 4 Active States at 1440px Desktop
  console.log('Capturing 4 active states at 1440px...');

  // State 1: Home
  await page.screenshot({ path: path.join(outDir, 'crimson_notch_01_home_full.png') });
  await page.screenshot({
    path: path.join(outDir, 'crimson_notch_01_home_detail.png'),
    clip: { x: 0, y: 0, width: 1440, height: 80 },
  });

  // State 2: Work
  console.log('Activating Work tab...');
  await page.locator('button[aria-label="Navigate to Work"]').click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, 'crimson_notch_02_work_full.png') });
  await page.screenshot({
    path: path.join(outDir, 'crimson_notch_02_work_detail.png'),
    clip: { x: 0, y: 0, width: 1440, height: 80 },
  });

  // State 3: Experience
  console.log('Activating Experience tab...');
  await page.locator('button[aria-label="Navigate to Experience"]').click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, 'crimson_notch_03_experience_full.png') });
  await page.screenshot({
    path: path.join(outDir, 'crimson_notch_03_experience_detail.png'),
    clip: { x: 0, y: 0, width: 1440, height: 80 },
  });

  // State 4: Contact
  console.log('Activating Contact tab...');
  await page.locator('button[aria-label="Navigate to Contact"]').click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, 'crimson_notch_04_contact_full.png') });
  await page.screenshot({
    path: path.join(outDir, 'crimson_notch_04_contact_detail.png'),
    clip: { x: 0, y: 0, width: 1440, height: 80 },
  });

  // Reset to Home
  await page.locator('button[aria-label="Navigate to Home"]').click();
  await page.waitForTimeout(600);

  // 2. Viewports: 1440px, 1024px, 768px, 390px, 360px
  const viewports = [
    { name: '1440px_desktop', width: 1440, height: 900 },
    { name: '1024px_tablet', width: 1024, height: 768 },
    { name: '768px_tablet', width: 768, height: 1024 },
    { name: '390px_mobile', width: 390, height: 844 },
    { name: '360px_mobile_compact', width: 360, height: 780 },
  ];

  for (const vp of viewports) {
    console.log(`Testing viewport: ${vp.name} (${vp.width}x${vp.height})`);
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(400);

    // Full screen
    await page.screenshot({ path: path.join(outDir, `crimson_notch_viewport_${vp.name}_full.png`) });

    // Header close-up detail
    await page.screenshot({
      path: path.join(outDir, `crimson_notch_viewport_${vp.name}_detail.png`),
      clip: { x: 0, y: 0, width: vp.width, height: 75 },
    });

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    console.log(`Viewport ${vp.name} scrollWidth: ${scrollWidth} (client: ${vp.width})`);
  }

  // 3. Close-up of Center Notch
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(300);
  const centerNotch = page.locator('.center-nav-notch');
  const box = await centerNotch.boundingBox();
  if (box) {
    await page.screenshot({
      path: path.join(outDir, 'crimson_notch_center_macro.png'),
      clip: {
        x: Math.max(0, box.x - 20),
        y: 0,
        width: box.width + 40,
        height: box.height + 20,
      },
    });
  }

  console.log('Visual verification capture finished successfully.');
  await browser.close();
})();
