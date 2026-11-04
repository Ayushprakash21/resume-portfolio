import { chromium } from 'playwright';
import path from 'path';

const outDir = 'C:/Users/Ayush/.gemini/antigravity/brain/476c7590-1f5b-4226-97b0-0976fa6f2d4a';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('Navigating to http://localhost:4173/ ...');
  await page.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // 1. Capture 4 Active States at 1440px Desktop
  console.log('Capturing 4 active states at 1440px...');

  // State 1: Home
  await page.screenshot({ path: path.join(outDir, '01_desktop_state_home.png') });
  const navHeader = page.locator('.adaptive-notch-header');
  const navBox = await navHeader.boundingBox();
  if (navBox) {
    await page.screenshot({
      path: path.join(outDir, '01_desktop_state_home_detail.png'),
      clip: { x: 0, y: 0, width: 1440, height: 75 },
    });
  }

  // State 2: Work
  console.log('Clicking Work tab...');
  await page.locator('button[aria-label="Navigate to Work"]').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, '02_desktop_state_work.png') });
  await page.screenshot({
    path: path.join(outDir, '02_desktop_state_work_detail.png'),
    clip: { x: 0, y: 0, width: 1440, height: 75 },
  });

  // State 3: Experience
  console.log('Clicking Experience tab...');
  await page.locator('button[aria-label="Navigate to Experience"]').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, '03_desktop_state_experience.png') });
  await page.screenshot({
    path: path.join(outDir, '03_desktop_state_experience_detail.png'),
    clip: { x: 0, y: 0, width: 1440, height: 75 },
  });

  // State 4: Contact
  console.log('Clicking Contact tab...');
  await page.locator('button[aria-label="Navigate to Contact"]').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, '04_desktop_state_contact.png') });
  await page.screenshot({
    path: path.join(outDir, '04_desktop_state_contact_detail.png'),
    clip: { x: 0, y: 0, width: 1440, height: 75 },
  });

  // Return to top/Home
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
    await page.screenshot({ path: path.join(outDir, `notch_viewport_${vp.name}_full.png`) });

    // Header close-up detail
    await page.screenshot({
      path: path.join(outDir, `notch_viewport_${vp.name}_detail.png`),
      clip: { x: 0, y: 0, width: vp.width, height: 75 },
    });
  }

  // 3. Scroll Synchronization Verification
  console.log('Testing scroll synchronization...');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(300);

  // Scroll to projects
  await page.evaluate(() => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(500);
  const workSelected = await page.locator('button[aria-label="Navigate to Work"]').getAttribute('aria-selected');
  console.log('Work selected on scroll to projects:', workSelected);

  // Scroll to contact
  await page.evaluate(() => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(500);
  const contactSelected = await page.locator('button[aria-label="Navigate to Contact"]').getAttribute('aria-selected');
  console.log('Contact selected on scroll to contact:', contactSelected);

  await browser.close();
  console.log('All adaptive notch verification screenshots successfully captured!');
})();
