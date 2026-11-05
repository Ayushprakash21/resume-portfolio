import { chromium } from 'playwright';
import path from 'node:path';

const ARTIFACT_DIR = 'C:/Users/Ayush/.gemini/antigravity/brain/476c7590-1f5b-4226-97b0-0976fa6f2d4a';

async function main() {
  console.log('Launching browser for Admin Selectors audit verification...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 850 },
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

  await page.waitForSelector('text=Introduction', { timeout: 10000 });
  console.log('Admin Console mounted successfully!');

  // ==========================================
  // 1. Education — Institution dropdown OPEN
  // ==========================================
  console.log('\n--- 1. Testing Education: InstitutionSelector ---');
  const eduNavBtn = page.locator('button:has-text("Education")').first();
  await eduNavBtn.click();
  await page.waitForTimeout(500);

  const addEduBtn = page.locator('button:has-text("Add Education")').first();
  await addEduBtn.click();
  await page.waitForTimeout(600);

  // Click Institution selector
  const instTrigger = page.locator('div[role="combobox"]').first();
  await instTrigger.click();
  await page.waitForTimeout(500);

  const shot1 = path.join(ARTIFACT_DIR, 'admin_dropdown_01_education_institution.png');
  await page.screenshot({ path: shot1 });
  console.log('Saved 1:', shot1);

  // Close institution dropdown
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // ==========================================
  // 2. Education — Degree dropdown OPEN
  // ==========================================
  console.log('\n--- 2. Testing Education: DegreeSelector ---');
  // Degree is the 2nd combobox
  const degTrigger = page.locator('div[role="combobox"]').nth(1);
  await degTrigger.click();
  await page.waitForTimeout(500);

  const shot2 = path.join(ARTIFACT_DIR, 'admin_dropdown_02_education_degree.png');
  await page.screenshot({ path: shot2 });
  console.log('Saved 2:', shot2);

  // Close degree dropdown and Education modal
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const cancelEduBtn = page.locator('button:has-text("Cancel")').first();
  await cancelEduBtn.click();
  await page.waitForTimeout(500);

  // ==========================================
  // 3. Experience — Company dropdown OPEN
  // ==========================================
  console.log('\n--- 3. Testing Experience: CompanySelector ---');
  const expNavBtn = page.locator('button:has-text("Experience")').first();
  await expNavBtn.click();
  await page.waitForTimeout(500);

  const addExpBtn = page.locator('button:has-text("Add Experience")').first();
  await addExpBtn.click();
  await page.waitForTimeout(600);

  // In Experience modal, JobTitle is combobox 0, Company is combobox 1
  const companyTrigger = page.locator('div[role="combobox"]').nth(1);
  await companyTrigger.click();
  await page.waitForTimeout(500);

  const shot3 = path.join(ARTIFACT_DIR, 'admin_dropdown_03_experience_company.png');
  await page.screenshot({ path: shot3 });
  console.log('Saved 3:', shot3);

  // Close company dropdown
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // ==========================================
  // 4. Experience — Location dropdown OPEN
  // ==========================================
  console.log('\n--- 4. Testing Experience: LocationSelector ---');
  const locInput = page.locator('input[placeholder*="Indore, Madhya Pradesh"]').first();
  await locInput.click();
  await page.waitForTimeout(500);

  const shot4 = path.join(ARTIFACT_DIR, 'admin_dropdown_04_experience_location.png');
  await page.screenshot({ path: shot4 });
  console.log('Saved 4:', shot4);

  // Close location dropdown
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // ==========================================
  // 5. Experience — Employment Type dropdown OPEN
  // ==========================================
  console.log('\n--- 5. Testing Experience: EmploymentTypeSelector ---');
  // In Experience modal, comboboxes: 0=JobTitle, 1=Company, 2=EmploymentType, 3=WorkplaceType, 4=Skills
  const empTypeTrigger = page.locator('div[role="combobox"]').nth(2);
  await empTypeTrigger.click();
  await page.waitForTimeout(500);

  const shot5 = path.join(ARTIFACT_DIR, 'admin_dropdown_05_experience_employment_type.png');
  await page.screenshot({ path: shot5 });
  console.log('Saved 5:', shot5);

  // Close experience modal
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const cancelExpBtn = page.locator('button:has-text("Cancel")').first();
  await cancelExpBtn.click();
  await page.waitForTimeout(500);

  // ==========================================
  // 6. Certification — Issuer dropdown OPEN
  // ==========================================
  console.log('\n--- 6. Testing Certification: IssuerSelector ---');
  const certNavBtn = page.locator('button:has-text("Accreditations")').or(page.locator('button:has-text("Certifications")')).first();
  await certNavBtn.click();
  await page.waitForTimeout(500);

  const addCertBtn = page.locator('button:has-text("Add Accreditation")').or(page.locator('button:has-text("Add Certification")')).first();
  await addCertBtn.click();
  await page.waitForTimeout(600);

  const issuerSearchInput = page.locator('input[placeholder*="Type brand name"]').first();
  await issuerSearchInput.click();
  await issuerSearchInput.fill('Google Cloud');
  await page.waitForTimeout(500);

  const shot6 = path.join(ARTIFACT_DIR, 'admin_dropdown_06_certification_issuer.png');
  await page.screenshot({ path: shot6 });
  console.log('Saved 6:', shot6);

  // Close cert modal
  const cancelCertBtn = page.locator('button:has-text("Cancel")').first();
  await cancelCertBtn.click();
  await page.waitForTimeout(500);

  // ==========================================
  // 7. Project — Category & Status dropdown OPEN
  // ==========================================
  console.log('\n--- 7. Testing Project: Category & Status ---');
  const projNavBtn = page.locator('button:has-text("Projects")').first();
  await projNavBtn.click();
  await page.waitForTimeout(500);

  const addProjBtn = page.locator('button:has-text("Add Project")').or(page.locator('button:has-text("Add New Project")')).first();
  await addProjBtn.click();
  await page.waitForTimeout(600);

  // In Project modal Tab 1: Basic Info
  // comboboxes: 0=Category, 1=DevelopmentStatus, 2=AssociatedOrganization
  const projCatTrigger = page.locator('div[role="combobox"]').first();
  await projCatTrigger.click();
  await page.waitForTimeout(500);

  const shot7 = path.join(ARTIFACT_DIR, 'admin_dropdown_07_project_category_status.png');
  await page.screenshot({ path: shot7 });
  console.log('Saved 7:', shot7);

  // Close category dropdown
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // ==========================================
  // 8. Skills — Multi-Select OPEN with chips
  // ==========================================
  console.log('\n--- 8. Testing Skills: Multi-Select with chips ---');
  // Switch to Skills tab in Project modal
  const skillsTabBtn = page.locator('button:has-text("4. Associated Skills")').first();
  await skillsTabBtn.click();
  await page.waitForTimeout(500);

  const skillsMultiTrigger = page.locator('div[role="combobox"]').first();
  await skillsMultiTrigger.click();
  await page.waitForTimeout(500);

  const shot8 = path.join(ARTIFACT_DIR, 'admin_dropdown_08_skills_multiselect.png');
  await page.screenshot({ path: shot8 });
  console.log('Saved 8:', shot8);

  // Close project modal
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const cancelProjBtn = page.locator('button:has-text("Cancel")').first();
  await cancelProjBtn.click();
  await page.waitForTimeout(500);

  // ==========================================
  // 9. Flipped Dropdown near bottom of viewport
  // ==========================================
  console.log('\n--- 9. Testing Intelligent Flip Positioning ---');
  await eduNavBtn.click();
  await page.waitForTimeout(500);
  await addEduBtn.click();
  await page.waitForTimeout(600);

  // Scroll modal form down so bottom elements are near bottom of viewport
  const formBox = page.locator('form').first();
  await formBox.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  await page.waitForTimeout(500);

  // Click the bottom combobox (SkillsMultiSelector or GradeTypeSelector) which is near bottom of viewport
  const bottomTrigger = page.locator('div[role="combobox"]').last();
  await bottomTrigger.click();
  await page.waitForTimeout(500);

  const shot9 = path.join(ARTIFACT_DIR, 'admin_dropdown_09_flipped_dropdown.png');
  await page.screenshot({ path: shot9 });
  console.log('Saved 9:', shot9);

  // Close modal
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  await cancelEduBtn.click();
  await page.waitForTimeout(500);

  // ==========================================
  // 10. Mobile 390px Viewport Dropdown
  // ==========================================
  console.log('\n--- 10. Testing Mobile 390px Viewport ---');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);

  // Click Add Education button (visible on Education page)
  const mobileAddEduBtn = page.locator('button:has-text("Add Education")').first();
  await mobileAddEduBtn.click();
  await page.waitForTimeout(600);

  const mobileTrigger = page.locator('div[role="combobox"]').first();
  await mobileTrigger.click();
  await page.waitForTimeout(500);

  const shot10 = path.join(ARTIFACT_DIR, 'admin_dropdown_10_mobile_390px.png');
  await page.screenshot({ path: shot10 });
  console.log('Saved 10:', shot10);

  await browser.close();
  console.log('\n=== ALL 10 SCREENSHOTS CAPTURED SUCCESSFULLY ===');
}

main().catch((err) => {
  console.error('Audit verification error:', err);
  process.exit(1);
});
