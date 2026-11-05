import { chromium } from 'playwright';
import path from 'path';

const outDir = 'C:/Users/Ayush/.gemini/antigravity/brain/476c7590-1f5b-4226-97b0-0976fa6f2d4a';
const baseUrl = 'http://localhost:4174';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  // Intercept authentication endpoint so login succeeds immediately
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

  console.log('Navigating to Admin login...');
  await page.goto(`${baseUrl}/admin`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Test Password Reset Modal first
  const resetBtn = page.locator('button:has-text("Forgot Password")');
  if (await resetBtn.isVisible()) {
    console.log('Testing Admin Login Password Reset Modal...');
    await resetBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(outDir, 'admin_modal_10_login_password_reset.png'),
    });
    // Close reset modal with Cancel
    const closeReset = page.locator('button:has-text("Cancel")');
    if (await closeReset.isVisible()) await closeReset.click();
    await page.waitForTimeout(300);

    // Click Sign In
    console.log('Clicking Sign In to Console...');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1200);
  }

  await page.waitForSelector('text=Introduction', { timeout: 10000 });
  console.log('Admin Console successfully mounted!');

  // ==========================================
  // 1. Education Editor Modal (Desktop 1440px)
  // ==========================================
  console.log('\n--- 1. Testing Education Modal ---');
  await page.locator('button:has-text("Education")').first().click();
  await page.waitForTimeout(500);

  // Click edit on the first education entry
  const editEduBtn = page.locator('button:has-text("Edit")').first();
  if (await editEduBtn.isVisible()) {
    await editEduBtn.click();
  } else {
    await page.locator('button:has-text("Add Education")').first().click();
  }
  await page.waitForTimeout(700);

  console.log('Capturing Education Modal (untruncated values at 1440px)...');
  await page.screenshot({
    path: path.join(outDir, 'admin_modal_01_education_untruncated_desktop.png'),
  });

  // Open Degree dropdown to show portal & options
  console.log('Opening Degree Selector...');
  const degreeTrigger = page.locator('div[role="combobox"]').nth(1);
  await degreeTrigger.click();
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(outDir, 'admin_modal_02_education_dropdown_open.png'),
  });

  // Click the trigger again to close dropdown without closing modal
  await degreeTrigger.click();
  await page.waitForTimeout(300);

  // 3. Education Modal Tablet (768px)
  console.log('Capturing Education Modal Tablet (768px)...');
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(outDir, 'admin_modal_03_education_tablet_768px.png'),
  });

  // 4. Education Modal Mobile (390px)
  console.log('Capturing Education Modal Mobile (390px)...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(outDir, 'admin_modal_04_education_mobile_390px.png'),
  });

  // Reset to Desktop 1440px & close Education Modal
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(300);
  const closeEduBtn = page.locator('button[aria-label="Close dialog"]').first();
  if (await closeEduBtn.isVisible()) {
    await closeEduBtn.click();
  } else {
    await page.keyboard.press('Escape');
  }
  await page.waitForTimeout(500);

  // ==========================================
  // 5. Experience Editor Modal
  // ==========================================
  console.log('\n--- 5. Testing Experience Modal ---');
  await page.locator('button:has-text("Experience")').first().click();
  await page.waitForTimeout(500);
  const editExpBtn = page.locator('button:has-text("Edit")').first();
  if (await editExpBtn.isVisible()) {
    await editExpBtn.click();
  } else {
    await page.locator('button:has-text("Add Experience")').first().click();
  }
  await page.waitForTimeout(700);
  await page.screenshot({
    path: path.join(outDir, 'admin_modal_05_experience_editor.png'),
  });
  await page.locator('button[aria-label="Close dialog"]').first().click();
  await page.waitForTimeout(500);

  // ==========================================
  // 6. Certification Editor Modal
  // ==========================================
  console.log('\n--- 6. Testing Certification Modal ---');
  await page.locator('button:has-text("Certifications")').first().click();
  await page.waitForTimeout(500);
  const editCertBtn = page.locator('button:has-text("Edit")').first();
  if (await editCertBtn.isVisible()) {
    await editCertBtn.click();
  } else {
    await page.locator('button:has-text("Add Certification")').first().click();
  }
  await page.waitForTimeout(700);
  await page.screenshot({
    path: path.join(outDir, 'admin_modal_06_certification_editor.png'),
  });
  await page.locator('button[aria-label="Close dialog"]').first().click();
  await page.waitForTimeout(500);

  // ==========================================
  // 7. Project Editor Modal
  // ==========================================
  console.log('\n--- 7. Testing Project Modal ---');
  await page.locator('button:has-text("Projects")').first().click();
  await page.waitForTimeout(500);
  const editProjBtn = page.locator('button:has-text("Edit")').first();
  if (await editProjBtn.isVisible()) {
    await editProjBtn.click();
  } else {
    await page.locator('button:has-text("Add Project")').first().click();
  }
  await page.waitForTimeout(700);
  await page.screenshot({
    path: path.join(outDir, 'admin_modal_07_project_editor.png'),
  });
  await page.locator('button[aria-label="Close dialog"]').first().click();
  await page.waitForTimeout(500);

  // ==========================================
  // 8. Skills Manager Modal
  // ==========================================
  console.log('\n--- 8. Testing Skills Modal ---');
  await page.locator('button:has-text("Skills")').first().click();
  await page.waitForTimeout(500);
  const addSkillBtn = page.locator('button:has-text("Add Skill")').first();
  if (await addSkillBtn.isVisible()) {
    await addSkillBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({
      path: path.join(outDir, 'admin_modal_08_skills_editor.png'),
    });
    await page.locator('button[aria-label="Close dialog"]').first().click();
    await page.waitForTimeout(400);
  }

  // ==========================================
  // 9. Media Library & Crop Modal
  // ==========================================
  console.log('\n--- 9. Testing Media Library & Crop Modal ---');
  await page.locator('button:has-text("Media Library")').first().click();
  await page.waitForTimeout(500);
  const cropBtn = page.locator('button:has-text("Crop")').first();
  if (await cropBtn.isVisible()) {
    await cropBtn.click();
    await page.waitForTimeout(700);
    await page.screenshot({
      path: path.join(outDir, 'admin_modal_09_image_crop_modal.png'),
    });
    await page.locator('button:has-text("Cancel")').first().click();
  }

  console.log('ALL VERIFICATION SCREENSHOTS CAPTURED SUCCESSFULLY!');
  await browser.close();
})();
