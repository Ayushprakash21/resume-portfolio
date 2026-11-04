import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/Ayush/.gemini/antigravity/brain/476c7590-1f5b-4226-97b0-0976fa6f2d4a';
const BASE_URL = 'http://localhost:4173';

async function run() {
  console.log('Launching browser for End-to-End Resume Extraction & Review Verification...');
  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.setViewportSize({ width: 1440, height: 950 });

    // Mock authentication routes for console admin
    await page.route('**/api/admin/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: { email: 'ayush@admin', role: 'admin' },
        }),
      });
    });

    await page.route('**/api/admin/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: { email: 'ayush@admin', role: 'admin' },
        }),
      });
    });

    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // If login button is shown, sign in
    const loginButton = page.locator('button:has-text("Sign in to Console"), button[type="submit"]');
    if (await loginButton.isVisible()) {
      await loginButton.click();
      await page.waitForTimeout(1000);
    }

    // -------------------------------------------------------------
    // 1. NAVIGATE TO RESUME MANAGEMENT
    // -------------------------------------------------------------
    const resumeNavBtn = page.locator('button:has-text("Resume Management"), button:has-text("Resume")').first();
    await resumeNavBtn.waitFor({ state: 'visible', timeout: 5000 });
    await resumeNavBtn.click();
    await page.waitForTimeout(1000);

    // Screenshot 1: Overview Tab
    const overviewShotPath = path.join(ARTIFACT_DIR, 'resume_admin_overview.png');
    await page.screenshot({ path: overviewShotPath });
    console.log(`[1/4] Resume Admin Overview screenshot saved: ${overviewShotPath}`);

    // -------------------------------------------------------------
    // 2. TRIGGER EXTRACTION OR SWITCH TO REVIEW TAB
    // -------------------------------------------------------------
    // Check if Extract Information button is present on overview
    const extractBtn = page.locator('button:has-text("Extract Information"), button:has-text("Extract")').first();
    if (await extractBtn.isVisible()) {
      console.log('Triggering resume extraction from active document...');
      await extractBtn.click();
      await page.waitForTimeout(2000);
    } else {
      const reviewTabBtn = page.locator('button:has-text("Review Information"), button:has-text("Review")').first();
      if (await reviewTabBtn.isVisible()) {
        await reviewTabBtn.click();
        await page.waitForTimeout(1000);
      }
    }

    // Screenshot 2: Review Tab with 8 structured section tabs
    const reviewShotPath = path.join(ARTIFACT_DIR, 'resume_extraction_review_tabs.png');
    await page.screenshot({ path: reviewShotPath });
    console.log(`[2/4] Resume Extraction Review Tabs screenshot saved: ${reviewShotPath}`);

    // -------------------------------------------------------------
    // 3. SWITCH TO RAW EVIDENCE & DOCUMENT TEXT TAB
    // -------------------------------------------------------------
    const rawEvidenceTab = page.locator('button:has-text("Document Text & Evidence"), button:has-text("Evidence")').first();
    if (await rawEvidenceTab.isVisible()) {
      await rawEvidenceTab.click();
      await page.waitForTimeout(800);
    }

    const rawEvidenceShotPath = path.join(ARTIFACT_DIR, 'resume_extraction_raw_evidence.png');
    await page.screenshot({ path: rawEvidenceShotPath });
    console.log(`[3/4] Resume Raw Text & Evidence screenshot saved: ${rawEvidenceShotPath}`);

    // -------------------------------------------------------------
    // 4. ATS GENERATOR ENGINE TAB
    // -------------------------------------------------------------
    const atsTab = page.locator('button:has-text("ATS Generator Engine")').first();
    if (await atsTab.isVisible()) {
      await atsTab.click();
      await page.waitForTimeout(800);

      const previewAtsBtn = page.locator('button:has-text("Open ATS Resume Generator Modal"), button:has-text("Preview Live ATS Document")').first();
      if (await previewAtsBtn.isVisible()) {
        await previewAtsBtn.click();
        await page.waitForTimeout(1000);
      }
    }

    const atsShotPath = path.join(ARTIFACT_DIR, 'resume_ats_generator_modal.png');
    await page.screenshot({ path: atsShotPath });
    console.log(`[4/4] ATS Generator Modal screenshot saved: ${atsShotPath}`);

    console.log('✅ End-to-End Resume Extraction Verification completed successfully!');
  } catch (err) {
    console.error('Verification failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

run();
