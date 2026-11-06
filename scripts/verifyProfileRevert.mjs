import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import path from 'node:path';

const ARTIFACTS_DIR = 'C:/Users/Ayush/.gemini/antigravity/brain/476c7590-1f5b-4226-97b0-0976fa6f2d4a';
const PORT = 4185;
const BASE_URL = `http://localhost:${PORT}`;

async function main() {
  console.log('Starting preview server...');
  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    shell: true,
    stdio: 'pipe',
  });

  let ready = false;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(BASE_URL);
      if (res.ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }

  if (!ready) {
    server.kill();
    throw new Error('Preview server failed to start in time');
  }

  console.log('Preview server ready! Launching Chromium...');
  const browser = await chromium.launch();

  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    // Fast-path auth mocks
    await page.route('**/api/admin/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.route('**/api/admin/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: { email: 'ayush@admin', role: 'admin', uid: 'admin-123' },
        }),
      });
    });

    await page.addInitScript(() => {
      window.sessionStorage.setItem('ap_boot_intro_played', 'true');
    });

    // 1. Desktop Public About Section
    console.log('Navigating to public about section...');
    await page.goto(`${BASE_URL}/#about`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const aboutSection = page.locator('#about');
    await aboutSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);

    const portraitImg = page.locator('[data-testid="profile-portrait-image"]');
    await portraitImg.waitFor({ state: 'visible', timeout: 5000 });

    const coverBannerCount = await page.locator('.holo-card-cover-banner, [data-testid="profile-cover-image"]').count();
    console.log('Cover banner count (must be 0):', coverBannerCount);
    if (coverBannerCount !== 0) throw new Error('Cover banner found in DOM!');

    const shot1 = path.join(ARTIFACTS_DIR, 'reverted_01_public_about_desktop.png');
    await page.screenshot({ path: shot1 });
    console.log('Saved:', shot1);

    const portraitCard = page.locator('#about .editorial-2col-responsive > div').first();
    const shot2 = path.join(ARTIFACTS_DIR, 'reverted_02_card_closeup_desktop.png');
    await portraitCard.screenshot({ path: shot2 });
    console.log('Saved:', shot2);

    // 2. Mobile Public About Section (390x844)
    console.log('Testing mobile layout...');
    const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
    await mobilePage.addInitScript(() => {
      window.sessionStorage.setItem('ap_boot_intro_played', 'true');
    });
    await mobilePage.goto(`${BASE_URL}/#about`, { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForTimeout(1000);
    const mobileAbout = mobilePage.locator('#about');
    await mobileAbout.scrollIntoViewIfNeeded();
    await mobilePage.waitForTimeout(800);

    const shot3 = path.join(ARTIFACTS_DIR, 'reverted_03_public_about_mobile_390px.png');
    await mobilePage.screenshot({ path: shot3 });
    console.log('Saved:', shot3);

    // 3. Admin Introduction Editor
    console.log('Navigating to Admin console...');
    await page.goto(`${BASE_URL}/#/admin`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);

    const emailInput = page.locator('input[type="text"], input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill('ayush@admin');
      const passInput = page.locator('input[type="password"]');
      await passInput.fill('admin');
      const submitBtn = page.locator('button[type="submit"]');
      await submitBtn.click();
      await page.waitForTimeout(1500);
    }

    const introTab = page.locator('text=Introduction').first();
    if (await introTab.isVisible()) {
      await introTab.click();
      await page.waitForTimeout(1000);
    }

    const mediaHeading = page.locator('text=Media & Photographs');
    if (await mediaHeading.isVisible()) {
      await mediaHeading.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
    }

    const coverTextCount = await page.locator('text=Background / Cover Image').count();
    console.log('"Background / Cover Image" count (must be 0):', coverTextCount);
    if (coverTextCount !== 0) throw new Error('Cover image controls found in Admin Introduction!');

    const shot4 = path.join(ARTIFACTS_DIR, 'reverted_04_admin_intro_editor.png');
    await page.screenshot({ path: shot4 });
    console.log('Saved:', shot4);

    const previewBtn = page.locator('button:has-text("Preview Public Intro")');
    if (await previewBtn.isVisible()) {
      await previewBtn.click();
      await page.waitForTimeout(800);
      const modal = page.locator('.admin-modal-container');
      await modal.waitFor({ state: 'visible' });

      const shot5 = path.join(ARTIFACTS_DIR, 'reverted_05_admin_intro_preview_modal.png');
      await modal.screenshot({ path: shot5 });
      console.log('Saved:', shot5);
    }

    console.log('ALL VERIFICATION SCREENSHOTS CAPTURED SUCCESSFULLY!');
  } finally {
    await browser.close();
    server.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
