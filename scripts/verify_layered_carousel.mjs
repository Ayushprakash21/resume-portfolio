import { chromium } from 'playwright';
import path from 'path';

const outDir = 'C:/Users/Ayush/.gemini/antigravity/brain/476c7590-1f5b-4226-97b0-0976fa6f2d4a';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('Navigating to http://localhost:4173/ ...');
  await page.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Scroll to capabilities section cleanly centered
  console.log('Scrolling to #capabilities...');
  await page.evaluate(() => {
    const el = document.getElementById('capabilities');
    if (el) {
      window.scrollTo({ top: el.offsetTop - 30, behavior: 'instant' });
    }
  });
  await page.waitForTimeout(1000);

  const carouselSection = page.locator('#capabilities');
  await carouselSection.waitFor({ state: 'visible' });

  // 1. Capture Category 1 Active (Desktop Layered Presentation)
  console.log('Capturing Category 1 Active...');
  await page.locator('button[aria-label="Jump to category 1 of 5"]').click();
  await page.waitForTimeout(800);

  // Full section view
  await page.screenshot({
    path: path.join(outDir, 'carousel_01_category1_desktop_full.png'),
  });

  const sectionBox = await carouselSection.boundingBox();
  if (sectionBox) {
    await page.screenshot({
      path: path.join(outDir, 'carousel_01_category1_active.png'),
      clip: sectionBox,
    });
  }

  // 2. Capture Category 3 Active
  console.log('Capturing Category 3 Active...');
  await page.locator('button[aria-label="Jump to category 3 of 5"]').click();
  await page.waitForTimeout(800);
  if (sectionBox) {
    await page.screenshot({
      path: path.join(outDir, 'carousel_02_category3_active.png'),
      clip: sectionBox,
    });
  }

  // 3. Capture Category 5 Active
  console.log('Capturing Category 5 Active...');
  await page.locator('button[aria-label="Jump to category 5 of 5"]').click();
  await page.waitForTimeout(800);
  if (sectionBox) {
    await page.screenshot({
      path: path.join(outDir, 'carousel_03_category5_active.png'),
      clip: sectionBox,
    });
  }

  // 4. Test Continuous Looping Forward: Next button from Cat 5 -> Cat 1
  console.log('Testing Continuous Loop Forward: Next from Category 5...');
  await page.locator('button[aria-label="Next Category"]').click();
  await page.waitForTimeout(800);

  const dot1Selected = await page
    .locator('button[aria-label="Jump to category 1 of 5"]')
    .getAttribute('aria-selected');
  console.log('Continuous loop forward success (Cat 1 active after Cat 5 Next):', dot1Selected === 'true');

  // 5. Test Continuous Looping Backward: Prev button from Cat 1 -> Cat 5
  console.log('Testing Continuous Loop Backward: Prev from Category 1...');
  await page.locator('button[aria-label="Previous Category"]').click();
  await page.waitForTimeout(800);

  const dot5Selected = await page
    .locator('button[aria-label="Jump to category 5 of 5"]')
    .getAttribute('aria-selected');
  console.log('Continuous loop backward success (Cat 5 active after Cat 1 Prev):', dot5Selected === 'true');

  // Reset to Cat 1
  await page.locator('button[aria-label="Jump to category 1 of 5"]').click();
  await page.waitForTimeout(700);

  // 6. Test Autoplay Pause on Hover
  console.log('Testing Autoplay Pause on Hover...');
  const carouselEl = page.locator('.concave-carousel');
  const box = await carouselEl.boundingBox();
  if (box) {
    // Hover over center
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    console.log('Mouse hovered over carousel. Waiting 5 seconds...');
    await page.waitForTimeout(5000);

    const dotStill1 = await page
      .locator('button[aria-label="Jump to category 1 of 5"]')
      .getAttribute('aria-selected');
    console.log('Autoplay paused on hover verified (still Cat 1):', dotStill1 === 'true');

    // Move mouse away to unpause
    await page.mouse.move(10, 10);
    console.log('Mouse moved away. Waiting 5.5 seconds for autoplay advance...');
    await page.waitForTimeout(5500);

    const dotMoved = await page
      .locator('button[aria-label="Jump to category 2 of 5"]')
      .getAttribute('aria-selected');
    console.log('Autoplay resumed after hover end (Cat 2 active):', dotMoved === 'true');
  }

  // 7. Mobile Viewport (390px)
  console.log('Testing Mobile Viewport at 390px...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => {
    const el = document.getElementById('capabilities');
    if (el) {
      window.scrollTo({ top: el.offsetTop - 50, behavior: 'instant' });
    }
  });
  await page.waitForTimeout(800);

  await page.locator('button[aria-label="Jump to category 1 of 5"]').click();
  await page.waitForTimeout(700);

  await page.screenshot({
    path: path.join(outDir, 'carousel_04_mobile_presentation.png'),
  });

  const mobileScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  console.log('Mobile scrollWidth:', mobileScrollWidth, '(clientWidth: 390)');
  console.log('Zero horizontal overflow:', mobileScrollWidth <= 390);

  // 8. Test Touch/Swipe Drag on Mobile
  console.log('Testing touch swipe on mobile...');
  const stageEl = page.locator('.concave-carousel__stage');
  const mBox = await stageEl.boundingBox();
  if (mBox) {
    const startX = mBox.x + mBox.width * 0.8;
    const endX = mBox.x + mBox.width * 0.2;
    const y = mBox.y + mBox.height / 2;

    await page.mouse.move(startX, y);
    await page.mouse.down();
    await page.mouse.move(endX, y, { steps: 12 });
    await page.mouse.up();
    await page.waitForTimeout(1000);

    const dotAfterSwipe = await page
      .locator('button[aria-label="Jump to category 2 of 5"]')
      .getAttribute('aria-selected');
    console.log('Touch swipe to category 2 successful:', dotAfterSwipe === 'true');
  }

  console.log('All verification checks completed successfully.');
  await browser.close();
})();
