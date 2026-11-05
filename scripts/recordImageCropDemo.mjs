import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const ARTIFACT_DIR = 'C:/Users/Ayush/.gemini/antigravity/brain/476c7590-1f5b-4226-97b0-0976fa6f2d4a';
const VIDEO_DIR = path.join(ARTIFACT_DIR, 'crop_recording');

if (!fs.existsSync(VIDEO_DIR)) {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
}

async function recordDemo() {
  console.log('Starting Playwright screen recording session...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: 1280, height: 800 },
    },
  });

  const page = await context.newPage();

  // Intercept authentication
  await page.route('**/api/admin/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });

  console.log('Navigating to Admin console...');
  await page.goto('http://localhost:4173/admin', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);

  const submit = page.locator('button[type="submit"]');
  if (await submit.isVisible()) {
    await submit.click();
    await page.waitForTimeout(1000);
  }

  // Open Introduction Editor
  await page.waitForSelector('text=Introduction', { timeout: 8000 });
  const introBtn = page.locator('button:has-text("Introduction")').first();
  if (await introBtn.isVisible()) {
    await introBtn.click();
    await page.waitForTimeout(500);
  }

  // Open Crop Modal on Profile Photo
  console.log('Opening Crop Modal...');
  const cropBtn = page.locator('button:has-text("Crop / Reposition")').first();
  await cropBtn.click();
  await page.waitForTimeout(1000);

  // Zoom in first to create panning range
  console.log('Zooming in via zoom buttons...');
  const zoomInBtn = page.locator('button[title="Zoom In"]').first();
  for (let i = 0; i < 4; i++) {
    await zoomInBtn.click();
    await page.waitForTimeout(250);
  }

  // Perform smooth mouse drag in circular / diagonal pattern
  console.log('Performing interactive drag to reposition face...');
  const cropperBox = await page.locator('.reactEasyCrop_Container').boundingBox();
  if (cropperBox) {
    const cx = cropperBox.x + cropperBox.width / 2;
    const cy = cropperBox.y + cropperBox.height / 2;

    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx - 70, cy - 50, { steps: 20 });
    await page.waitForTimeout(400);
    await page.mouse.move(cx + 60, cy + 40, { steps: 25 });
    await page.waitForTimeout(400);
    await page.mouse.move(cx, cy - 30, { steps: 15 });
    await page.mouse.up();
    await page.waitForTimeout(600);
  }

  // Rotate and Flip
  console.log('Testing rotation and flip...');
  const rotateCw = page.locator('button:has-text("+90°")').first();
  if (await rotateCw.isVisible()) {
    await rotateCw.click();
    await page.waitForTimeout(500);
    await rotateCw.click();
    await page.waitForTimeout(500);
    await rotateCw.click();
    await page.waitForTimeout(500);
    await rotateCw.click(); // Back to 0°
    await page.waitForTimeout(500);
  }

  // Switch to Aspect ratio tab
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

    const landscapeBtn = page.locator('button:has-text("16:9 Landscape")').first();
    if (await landscapeBtn.isVisible()) {
      await landscapeBtn.click();
      await page.waitForTimeout(600);
    }

    const squareBtn = page.locator('button:has-text("1:1 Square")').first();
    if (await squareBtn.isVisible()) {
      await squareBtn.click();
      await page.waitForTimeout(600);
    }
  }

  // View Preview Tab
  console.log('Viewing Live Preview tab...');
  const previewTab = page.locator('div[role="dialog"] button:has-text("Preview")').first();
  if (await previewTab.isVisible()) {
    await previewTab.click();
    await page.waitForTimeout(800);
  }

  // Click Apply Crop
  console.log('Applying crop...');
  const applyBtn = page.locator('button:has-text("Apply & Save Crop")').first();
  if (await applyBtn.isVisible()) {
    await applyBtn.click();
    await page.waitForTimeout(1200);
  }

  await page.waitForTimeout(1000);
  console.log('Closing page to finalize video recording...');
  await page.close();

  // Find the video file
  const videoFiles = fs.readdirSync(VIDEO_DIR).filter((f) => f.endsWith('.webm'));
  if (videoFiles.length > 0) {
    const latest = videoFiles[videoFiles.length - 1];
    const target = path.join(ARTIFACT_DIR, 'crop_editor_drag_zoom_demo.webm');
    fs.copyFileSync(path.join(VIDEO_DIR, latest), target);
    console.log('Saved video recording to:', target);
  }

  await browser.close();
  console.log('Screen recording finished!');
}

recordDemo().catch(console.error);
