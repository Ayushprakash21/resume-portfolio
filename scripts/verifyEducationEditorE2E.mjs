import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';

const ARTIFACT_DIR = 'C:/Users/Ayush/.gemini/antigravity/brain/476c7590-1f5b-4226-97b0-0976fa6f2d4a';
const PORT = 4195;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const DIST_DIR = path.resolve('dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.ico': 'image/x-icon',
};

function startDistServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const reqPath = (req.url || '/').split('?')[0];
      const safePath = reqPath === '/' ? 'index.html' : reqPath.replace(/^\/+/, '');
      let filePath = path.join(DIST_DIR, safePath);
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(DIST_DIR, 'index.html');
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    });
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
}

async function main() {
  console.log('=== EDUCATION EDITOR & ACADEMIC DETAILS E2E VERIFICATION ===');
  const server = await startDistServer();
  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 860 } });
    const page = await context.newPage();

    await page.addInitScript(() => {
      window.sessionStorage.setItem('ap_boot_intro_played', 'true');
    });

    await page.route('**/api/admin/auth/login', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    );
    await page.route('**/api/admin/auth/session', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: { email: 'ayush@admin', role: 'admin', uid: 'admin-test' },
        }),
      })
    );
    await page.route('**/firestore.googleapis.com/**', (route) => route.abort('blockedbyclient'));

    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    const signInBtn = page.locator('button[type="submit"]');
    if (await signInBtn.isVisible()) {
      await signInBtn.click();
      await page.waitForTimeout(900);
    }

    await page.waitForSelector('text=Introduction', { timeout: 10000 });
    await page.locator('button:has-text("Education")').first().click();
    await page.waitForTimeout(500);

    // 1. Open existing MBA record
    await page.locator('button:has-text("Edit")').first().click();
    await page.waitForTimeout(400);

    // 2. Verify sticky footer buttons visible immediately WITHOUT scrolling body
    const dialog = page.locator('[role="dialog"]');
    const deleteBtn = dialog.locator('button:has-text("Delete")');
    const cancelBtn = dialog.locator('button:has-text("Cancel")');
    const updateBtn = dialog.locator('button:has-text("Update Education")');
    assert.equal(await deleteBtn.isVisible(), true, 'Delete button visible in footer');
    assert.equal(await cancelBtn.isVisible(), true, 'Cancel button visible in footer');
    assert.equal(await updateBtn.isVisible(), true, 'Update Education button visible in footer');

    const updateBox = await updateBtn.boundingBox();
    assert.ok(updateBox && updateBox.y + updateBox.height <= 860, 'Update Education visible in desktop viewport without scrolling');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'education_editor_desktop.png') });

    // 3. Edit all About This Qualification fields
    const overviewTextarea = dialog.locator('textarea[placeholder*="curriculum depth"]');
    await overviewTextarea.fill('Master of Business Administration focused on IT governance, supply chain execution, and digital marketing.');

    const specInput = dialog.locator('input[placeholder*="IT & Marketing"]');
    await specInput.fill('IT & Marketing');

    // Searchable multi-select for Subjects & Areas of Study
    const subjectsTrigger = dialog.getByText('Select or add subjects...').first();
    await subjectsTrigger.click();
    await page.waitForTimeout(200);
    await page.locator('div:has-text("Supply Chain Management")').last().click();
    await page.waitForTimeout(150);
    await page.keyboard.press('Escape');

    // Unsaved changes guard check
    let dialogSeen = false;
    page.once('dialog', async (d) => {
      dialogSeen = true;
      assert.ok(d.message().toLowerCase().includes('unsaved'), 'Unsaved changes prompt warns before discard');
      await d.dismiss();
    });
    await cancelBtn.click();
    await page.waitForTimeout(200);
    assert.equal(dialogSeen, true, 'Cancel triggers unsaved changes warning when dirty');
    assert.equal(await dialog.isVisible(), true, 'Dismissing confirmation keeps modal open');

    const focusTextarea = dialog.locator('textarea[placeholder*="enterprise systems architecture"]');
    await focusTextarea.fill('Operations analytics, ERP systems integration, and cross-functional service management.');

    const outcomeInput = dialog.locator('input[placeholder="Add a key learning outcome..."]');
    await outcomeInput.fill('Lead enterprise fulfillment workflows across cross-functional teams');
    await outcomeInput.press('Enter');

    await dialog.locator('text=About This Qualification').first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'education_editor_about_section.png') });

    // 4. Verify save failure handling & duplicate submit prevention (Firestore blocked -> Saving... -> timeout error -> stays open!)
    await updateBtn.click();
    await page.waitForTimeout(150);
    const savingBtn = dialog.locator('button:has-text("Saving...")');
    assert.equal(await savingBtn.isVisible(), true, 'Shows Saving... loading indicator during submission');
    assert.equal(await savingBtn.isDisabled(), true, 'Disables button while saving to prevent duplicate submission');

    await dialog.locator('[role="alert"]').waitFor({ state: 'visible', timeout: 14000 });
    const alertText = await dialog.locator('[role="alert"]').innerText();
    assert.ok(alertText.includes('Save failed:'), 'Displays clear error message when save fails');
    assert.equal(await dialog.isVisible(), true, 'Modal remains open on failed save');
    assert.equal(
      await overviewTextarea.inputValue(),
      'Master of Business Administration focused on IT governance, supply chain execution, and digital marketing.',
      'User edits remain intact after failed save for retry'
    );

    // 5. Verify Mobile 390px modal layout & sticky footer
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);
    const mobUpdateBtn = dialog.locator('button:has-text("Update Education")');
    assert.equal(await mobUpdateBtn.isVisible(), true, 'Mobile Update Education visible after error recovery');
    const mobBox = await mobUpdateBtn.boundingBox();
    assert.ok(mobBox && mobBox.y + mobBox.height <= 844, 'Mobile Update Education stays inside 844px sticky footer');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'education_editor_mobile.png') });

    // Confirm dirty close & open Add Education modal to verify button label & validation
    page.once('dialog', async (d) => d.accept());
    await cancelBtn.click();
    await page.waitForTimeout(300);

    await page.setViewportSize({ width: 1280, height: 860 });
    await page.waitForTimeout(250);
    await page.locator('button:has-text("Add Education")').first().click();
    await page.waitForTimeout(300);
    const addSubmitBtn = page.locator('[role="dialog"] button:has-text("Add Education")');
    assert.equal(await addSubmitBtn.isVisible(), true, 'New record modal displays Add Education button');

    await addSubmitBtn.click();
    await page.waitForTimeout(200);
    assert.equal(await page.locator('[role="dialog"] [role="alert"]').isVisible(), true, 'Empty submit displays validation error without closing');
    await page.locator('[role="dialog"] button:has-text("Cancel")').click();

    // 6. Verify Public Website #education displays saved/published academic fields when present and suppresses empty fields
    const publicPage = await context.newPage();
    await publicPage.addInitScript(() => {
      window.sessionStorage.setItem('ap_boot_intro_played', 'true');
      window.localStorage.setItem(
        'ayush_cms_education_v1',
        JSON.stringify([
          {
            id: 'edu-1',
            institution: 'Devi Ahilya University',
            associatedCollege: 'IPS Academy, Indore',
            degree: 'Master of Business Administration (MBA)',
            fieldOfStudy: 'IT & Marketing',
            specialization: 'Enterprise Systems & Digital Strategy',
            startYear: '',
            endYear: '2021',
            courseOverview: 'Graduate business administration program integrating IT governance, analytics, and market execution.',
            subjects: ['Supply Chain Management', 'Business Analytics'],
            relevantCoursework: ['Enterprise Resource Planning'],
            academicFocus: 'Cross-functional operations modeling and data-driven decision systems.',
            learningOutcomes: ['Design scalable operational workflows across distributed teams'],
            status: 'published',
            highlights: [],
            displayOrder: 1,
          },
          {
            id: 'edu-draft-hidden',
            institution: 'Hidden Draft University',
            degree: 'Draft Certificate',
            fieldOfStudy: 'Draft Field',
            startYear: '2024',
            endYear: '2025',
            status: 'draft',
            highlights: [],
            displayOrder: 2,
          },
        ])
      );
    });
    await publicPage.route('**/firestore.googleapis.com/**', (route) => route.abort('blockedbyclient'));
    await publicPage.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await publicPage.waitForSelector('#education h2', { timeout: 10000 });
    await publicPage.locator('#education').scrollIntoViewIfNeeded();
    await publicPage.waitForTimeout(350);

    const pubText = await publicPage.locator('#education').innerText();
    const pubLower = pubText.toLowerCase();
    assert.ok(pubLower.includes('about the qualification'), 'Public site renders About the Qualification');
    assert.ok(pubText.includes('IT governance, analytics, and market execution'), 'Public site renders courseOverview');
    assert.ok(pubText.includes('Specialization: Enterprise Systems & Digital Strategy'), 'Public site renders specialization');
    assert.ok(pubLower.includes('areas of study'), 'Public site renders Areas of Study');
    assert.ok(pubText.includes('Supply Chain Management'), 'Public site renders subjects');
    assert.ok(pubText.includes('Enterprise Resource Planning'), 'Public site renders relevant coursework');
    assert.ok(pubLower.includes('academic focus'), 'Public site renders Academic Focus');
    assert.ok(pubLower.includes('key learning outcomes'), 'Public site renders Key Learning Outcomes');
    assert.equal(pubText.includes('Hidden Draft University'), false, 'Public site hides draft records');
    assert.equal(pubLower.includes('academic achievements'), false, 'Public site omits empty optional sections');
    await publicPage.screenshot({ path: path.join(ARTIFACT_DIR, 'education_public_desktop.png') });

    console.log('ALL EDUCATION EDITOR & PUBLIC DISPLAY E2E CHECKS PASSED!');
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
