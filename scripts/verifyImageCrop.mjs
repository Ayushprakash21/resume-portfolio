import { chromium } from 'playwright';
import path from 'node:path';

const ARTIFACT_DIR = 'C:/Users/Ayush/.gemini/antigravity/brain/476c7590-1f5b-4226-97b0-0976fa6f2d4a';

async function main() {
  console.log('Launching browser for Image Crop verification...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 850 },
  });

  const page = await context.newPage();

  // Intercept authentication endpoint so login succeeds immediately
  await page.route('**/api/admin/auth/login', async (route) => {
    console.log('Intercepted login request -> fulfilling success');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });

  console.log('Navigating to http://localhost:4173/admin...');
  await page.goto('http://localhost:4173/admin', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // If login form is shown, click Sign In
  const submitBtn = page.locator('button[type="submit"]');
  if (await submitBtn.isVisible()) {
    console.log('Clicking Sign In...');
    await submitBtn.click();
    await page.waitForTimeout(1000);
  }

  // Confirm Admin Console loaded
  await page.waitForSelector('text=Introduction', { timeout: 10000 });
  console.log('Admin Console mounted!');

  // Navigate to Introduction tab if not already active
  const introBtn = page.locator('button:has-text("Introduction")').first();
  if (await introBtn.isVisible()) {
    await introBtn.click();
    await page.waitForTimeout(500);
  }

  // Find "Crop / Reposition" button under profile photo
  console.log('Looking for Crop / Reposition button on profile photo...');
  const cropBtn = page.locator('button:has-text("Crop / Reposition")').first();
  await cropBtn.waitFor({ state: 'visible', timeout: 5000 });
  await cropBtn.click();
  await page.waitForTimeout(800);

  // 1. Initial Crop Modal Screenshot
  console.log('Capturing initial crop modal...');
  const shot1 = path.join(ARTIFACT_DIR, 'crop_editor_01_initial_modal.png');
  await page.screenshot({ path: shot1 });
  console.log('Saved:', shot1);

  // 2. Perform interactive mouse drag across the crop viewport
  console.log('Simulating click and drag across crop viewport...');
  const cropperBox = await page.locator('.reactEasyCrop_Container').boundingBox();
  if (cropperBox) {
    const startX = cropperBox.x + cropperBox.width / 2;
    const startY = cropperBox.y + cropperBox.height / 2;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 80, startY + 60, { steps: 15 });
    await page.mouse.up();
    await page.waitForTimeout(600);
  }

  const shot2 = path.join(ARTIFACT_DIR, 'crop_editor_02_dragged_face.png');
  await page.screenshot({ path: shot2 });
  console.log('Saved:', shot2);

  // 3. Zoom in using zoom in button
  console.log('Zooming in...');
  const zoomInBtn = page.locator('button[title="Zoom In"]').first();
  if (await zoomInBtn.isVisible()) {
    await zoomInBtn.click();
    await page.waitForTimeout(200);
    await zoomInBtn.click();
    await page.waitForTimeout(200);
    await zoomInBtn.click();
    await page.waitForTimeout(600);
  }

  const shot3 = path.join(ARTIFACT_DIR, 'crop_editor_03_zoomed_framing.png');
  await page.screenshot({ path: shot3 });
  console.log('Saved:', shot3);

  // 4. Switch to Aspect ratio tab and select 4:5 Portrait
  console.log('Switching aspect ratio...');
  const aspectTab = page.locator('button:has-text("Aspect")').first();
  if (await aspectTab.isVisible()) {
    await aspectTab.click();
    await page.waitForTimeout(400);

    const portraitBtn = page.locator('button:has-text("4:5 Portrait")').first();
    if (await portraitBtn.isVisible()) {
      await portraitBtn.click();
      await page.waitForTimeout(600);
    }
  }

  const shot4 = path.join(ARTIFACT_DIR, 'crop_editor_04_aspect_portrait.png');
  await page.screenshot({ path: shot4 });
  console.log('Saved:', shot4);

  // 5. Test Mobile viewport
  console.log('Testing mobile viewport crop view...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(600);

  const shotMobile = path.join(ARTIFACT_DIR, 'crop_editor_05_mobile_viewport.png');
  await page.screenshot({ path: shotMobile });
  console.log('Saved:', shotMobile);

  await browser.close();
  console.log('All verification screenshots captured successfully!');
}

main().catch((err) => {
  console.error('Error in Playwright crop verification:', err);
  process.exit(1);
});
