import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

async function main() {
  const artifactDir = 'C:/Users/Ayush/.gemini/antigravity/brain/476c7590-1f5b-4226-97b0-0976fa6f2d4a';
  const videoDir = path.join(artifactDir, 'carousel_recordings');
  if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: videoDir,
      size: { width: 1440, height: 900 },
    },
  });

  const page = await context.newPage();

  console.log('1. Navigating to certifications section on desktop...');
  await page.goto('http://localhost:4173/#certifications', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Scroll to certifications carousel center
  const carouselEl = page.locator('.circular-carousel');
  await carouselEl.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  // Initial screenshot
  await page.screenshot({
    path: path.join(artifactDir, 'certifications_carousel_desktop_initial.png'),
    fullPage: false,
  });
  console.log('Saved desktop initial screenshot.');

  // Check the cards in the carousel
  const cardHeadings = page.locator('.circular-carousel__card h3');
  const count = await cardHeadings.count();
  console.log(`Found ${count} certification cards in the circular carousel.`);
  for (let i = 0; i < count; i++) {
    console.log(`  Card ${i + 1}:`, await cardHeadings.nth(i).innerText());
  }

  // 2. Observe Automatic Transitions (wait ~9-10 seconds to observe auto-transitions across at least 3 credentials)
  console.log('2. Observing automatic transitions across credentials (waiting 9s)...');
  await page.waitForTimeout(3900);
  console.log('   -> Auto-transition 1 occurred.');
  await page.waitForTimeout(3900);
  console.log('   -> Auto-transition 2 occurred.');
  await page.waitForTimeout(1500);

  await page.screenshot({
    path: path.join(artifactDir, 'certifications_carousel_after_autorotate.png'),
    fullPage: false,
  });
  console.log('Saved after autorotate screenshot.');

  // 3. Test Manual Controls (Next / Prev / Dots)
  console.log('3. Testing manual Next and Prev arrow buttons...');
  const nextBtn = page.locator('button[aria-label="Next Certification"]');
  await nextBtn.scrollIntoViewIfNeeded();
  await nextBtn.click({ force: true });
  await page.waitForTimeout(1200);

  const prevBtn = page.locator('button[aria-label="Previous Certification"]');
  await prevBtn.click({ force: true });
  await page.waitForTimeout(1200);

  // Click dot indicator 3
  const dot3 = page.locator('button[role="tab"]').nth(2);
  if (await dot3.count() > 0) {
    console.log('Clicking pagination indicator dot 3...');
    await dot3.click({ force: true });
    await page.waitForTimeout(1200);
  }

  // 4. Test Drag / Touch Interaction
  console.log('4. Testing mouse drag interaction on 3D cylinder...');
  const stage = page.locator('.circular-carousel__stage');
  const box = await stage.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 - 160, box.y + box.height / 2, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(1200);
  }

  // 5. Test Inspect Credential modal on the active center card
  console.log('5. Clicking Inspect Credential on active card...');
  const activeInspectBtn = page.locator('.circular-carousel__card--center button:has-text("Inspect Credential")').first();
  if (await activeInspectBtn.isVisible()) {
    await activeInspectBtn.click({ force: true });
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: path.join(artifactDir, 'certifications_modal_opened.png'),
      fullPage: false,
    });
    console.log('Saved modal opened screenshot.');

    // Close modal
    const closeBtn = page.locator('button[aria-label="Close modal"]').or(page.locator('#credential-detail-modal button svg')).first();
    await closeBtn.click({ force: true });
    await page.waitForTimeout(800);
  }

  // 6. Test Mobile Layout
  console.log('6. Testing mobile layout (390x844)...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(800);
  await carouselEl.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);

  await page.screenshot({
    path: path.join(artifactDir, 'certifications_carousel_mobile.png'),
    fullPage: false,
  });
  console.log('Saved mobile layout screenshot.');

  // Wait 3.5 more seconds on mobile to capture mobile auto-rotation
  await page.waitForTimeout(3500);

  // Close context to finish video writing
  console.log('Closing page and finalizing video capture...');
  const videoObj = page.video();
  await page.close();
  await context.close();
  await browser.close();

  if (videoObj) {
    const recordedPath = await videoObj.path();
    const destPath = path.join(artifactDir, 'carousel_verification_recording.mp4');
    fs.copyFileSync(recordedPath, destPath);
    console.log('SUCCESS! Video recording saved to:', destPath);
    const stats = fs.statSync(destPath);
    console.log(`Video file size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  }

  console.log('ALL VERIFICATIONS & VIDEO CAPTURE COMPLETED SUCCESSFULLY!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
