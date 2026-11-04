import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/Ayush/.gemini/antigravity/brain/476c7590-1f5b-4226-97b0-0976fa6f2d4a';
const BASE_URL = 'http://localhost:4173';

async function run() {
  console.log('Launching browser for Certifications Carousel Verification...');
  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    // -------------------------------------------------------------
    // 1. DESKTOP CAROUSEL VIEW (1440px)
    // -------------------------------------------------------------
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    
    // Wait for #certifications to mount
    const certSection = page.locator('#certifications');
    await certSection.waitFor({ state: 'attached', timeout: 15000 });
    await certSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);

    const desktopShotPath = path.join(ARTIFACT_DIR, 'certifications_desktop_carousel.png');
    await page.screenshot({ path: desktopShotPath });
    console.log(`[1/4] Desktop carousel screenshot saved: ${desktopShotPath}`);

    // -------------------------------------------------------------
    // 2. INSPECT CREDENTIAL MODAL
    // -------------------------------------------------------------
    await certSection.hover();
    await page.waitForTimeout(400);

    // Dispatch click directly to the inspect button
    const inspectBtn = page.locator('button:has-text("Inspect Credential")').first();
    await inspectBtn.waitFor({ state: 'attached', timeout: 5000 });
    await inspectBtn.evaluate((btn) => btn.click());
    
    // Wait for modal
    const modal = page.locator('#credential-detail-modal');
    await modal.waitFor({ state: 'visible', timeout: 5000 });
    await page.waitForTimeout(600);

    const detailModalShotPath = path.join(ARTIFACT_DIR, 'certifications_detail_modal.png');
    await page.screenshot({ path: detailModalShotPath });
    console.log(`[2/4] Credential detail modal screenshot saved: ${detailModalShotPath}`);

    // Close the modal
    const closeBtn = modal.locator('button[aria-label="Close modal"]');
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    }

    // -------------------------------------------------------------
    // 3. MOBILE VIEW (390px) & ZERO OVERFLOW VERIFICATION
    // -------------------------------------------------------------
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(600);
    const mobileCert = page.locator('#certifications');
    await mobileCert.scrollIntoViewIfNeeded();
    
    // Snap cleanly to the first certification card within #certifications
    const certDot = mobileCert.locator('button[role="tab"]').first();
    if (await certDot.isVisible()) {
      await certDot.click({ force: true });
      await page.waitForTimeout(800);
    }
    await mobileCert.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Verify zero horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    console.log(`Mobile Viewport: ${clientWidth}px, Scroll Width: ${scrollWidth}px`);
    if (scrollWidth > clientWidth) {
      console.warn(`WARNING: Horizontal overflow detected on mobile: ${scrollWidth} > ${clientWidth}`);
    } else {
      console.log(`PASS: Zero horizontal overflow verified on mobile (${scrollWidth} <= ${clientWidth}).`);
    }

    const mobileShotPath = path.join(ARTIFACT_DIR, 'certifications_mobile_carousel.png');
    await page.screenshot({ path: mobileShotPath });
    console.log(`[3/4] Mobile carousel screenshot saved: ${mobileShotPath}`);

    // -------------------------------------------------------------
    // 4. ADMIN ISSUER LOGO SEARCH & LIVE PREVIEW
    // -------------------------------------------------------------
    const adminPage = await context.newPage();
    await adminPage.setViewportSize({ width: 1440, height: 950 });

    // Mock authentication routes
    await adminPage.route('**/api/admin/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: { email: 'ayush@admin', role: 'admin' },
        }),
      });
    });

    await adminPage.route('**/api/admin/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: { email: 'ayush@admin', role: 'admin' },
        }),
      });
    });

    await adminPage.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded' });
    await adminPage.waitForTimeout(1000);

    // If login screen is shown, click sign in
    const loginButton = adminPage.locator('button:has-text("Sign in to Console"), button[type="submit"]');
    if (await loginButton.isVisible()) {
      await loginButton.click();
      await adminPage.waitForTimeout(1000);
    }

    // Navigate to Licenses & Certifications tab in Admin sidebar
    const certNavBtn = adminPage.locator('button:has-text("Licenses & Certifications")');
    if (await certNavBtn.isVisible()) {
      await certNavBtn.click();
      await adminPage.waitForTimeout(600);
    }

    // Open Add Certification Modal
    const addCredBtn = adminPage.locator('button:has-text("Add Certification")');
    await addCredBtn.waitFor({ state: 'visible', timeout: 5000 });
    await addCredBtn.click();
    await adminPage.waitForTimeout(800);

    // Click "Anthropic" quick search brand chip
    const anthropicChip = adminPage.locator('button:text-is("Anthropic")');
    if (await anthropicChip.isVisible()) {
      await anthropicChip.click();
      await adminPage.waitForTimeout(800);
    }

    const candidateCard = adminPage.locator('span:has-text("Official Vector SVG")');
    if (await candidateCard.isVisible()) {
      await candidateCard.click();
      await adminPage.waitForTimeout(600);
    }

    const adminShotPath = path.join(ARTIFACT_DIR, 'certifications_admin_logo_search.png');
    await adminPage.screenshot({ path: adminShotPath });
    console.log(`[4/4] Admin logo search screenshot saved: ${adminShotPath}`);

  } catch (err) {
    console.error('Error during verification:', err);
    throw err;
  } finally {
    await browser.close();
  }
}

run();
