import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const outDir = 'C:/Users/Ayush/.gemini/antigravity/brain/476c7590-1f5b-4226-97b0-0976fa6f2d4a/visual_evidence';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('Navigating to http://localhost:4173/ ...');
  await page.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // 1. Desktop States (Home, Work, Experience, Contact)
  console.log('Capturing Desktop States 1-4...');
  await page.screenshot({ path: path.join(outDir, '01_desktop_home_selected.png') });

  // Work
  await page.locator('button[aria-label="Navigate to Work section"]').click();
  await page.waitForTimeout(160);
  await page.screenshot({ path: path.join(outDir, '02_desktop_transition_to_work.png') });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, '03_desktop_work_selected.png') });

  // Experience
  await page.locator('button[aria-label="Navigate to Experience section"]').click();
  await page.waitForTimeout(160);
  await page.screenshot({ path: path.join(outDir, '04_desktop_transition_to_experience.png') });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, '05_desktop_experience_selected.png') });

  // Contact
  await page.locator('button[aria-label="Navigate to Contact section"]').click();
  await page.waitForTimeout(160);
  await page.screenshot({ path: path.join(outDir, '06_desktop_transition_to_contact.png') });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, '07_desktop_contact_selected.png') });

  // Back to Home
  await page.locator('button[aria-label="Navigate to Home section"]').click();
  await page.waitForTimeout(500);

  // 2. Viewports (390px, 430px, 768px, 1024px, 1280px, 1440px, 1920px)
  const viewports = [
    { name: '390px_mobile', width: 390, height: 844 },
    { name: '430px_mobile_large', width: 430, height: 932 },
    { name: '768px_tablet', width: 768, height: 1024 },
    { name: '1024px_desktop_sm', width: 1024, height: 768 },
    { name: '1280px_desktop_md', width: 1280, height: 800 },
    { name: '1440px_desktop_lg', width: 1440, height: 900 },
    { name: '1920px_desktop_fhd', width: 1920, height: 1080 },
  ];

  for (const vp of viewports) {
    console.log(`Setting viewport: ${vp.name} (${vp.width}x${vp.height})`);
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(300);

    // Full screen view
    await page.screenshot({ path: path.join(outDir, `viewport_${vp.name}_full.png`) });

    // Navbar detail close-up
    const navEl = page.locator('.curved-pill-navigation');
    const box = await navEl.boundingBox();
    if (box) {
      const clip = {
        x: Math.max(0, box.x - 20),
        y: Math.max(0, box.y - 30),
        width: Math.min(vp.width, box.width + 40),
        height: box.height + 40,
      };
      await page.screenshot({
        path: path.join(outDir, `viewport_${vp.name}_navbar_detail.png`),
        clip,
      });
    }
  }

  // 3. Scroll Synchronization
  console.log('Testing scroll synchronization...');
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForTimeout(300);

  // Scroll to projects
  await page.evaluate(() => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, 'scroll_sync_projects.png') });

  // Scroll to experience
  await page.evaluate(() => {
    document.getElementById('experience')?.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, 'scroll_sync_experience.png') });

  // Scroll to contact
  await page.evaluate(() => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, 'scroll_sync_contact.png') });

  await browser.close();
  console.log('All visual verification complete! Output in:', outDir);
})();
