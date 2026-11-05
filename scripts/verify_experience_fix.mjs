import { chromium } from 'playwright';
import path from 'node:path';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Mock server auth endpoint so browser can authenticate seamlessly
  await page.route('**/api/admin/auth/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        user: { email: 'ayush@admin', role: 'admin', uid: 'admin-123' },
      }),
    });
  });

  console.log('1. Navigating to /admin...');
  await page.goto('http://localhost:4173/admin', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // If login form appears, click Sign In
  const signInBtn = page.locator('button:has-text("Sign In to Console")');
  if (await signInBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    console.log('Clicking "Sign In to Console"...');
    await signInBtn.click();
    await page.waitForTimeout(1500);
  }

  console.log('2. Clicking Experience tab...');
  const expNavBtn = page.locator('aside nav button:has-text("Experience")');
  await expNavBtn.waitFor({ state: 'visible', timeout: 5000 });
  await expNavBtn.click();
  await page.waitForTimeout(1500);

  const artifactDir = 'C:/Users/Ayush/.gemini/antigravity/brain/476c7590-1f5b-4226-97b0-0976fa6f2d4a';
  const adminListPath = path.join(artifactDir, 'admin_experience_list_fixed.png');
  await page.screenshot({ path: adminListPath, fullPage: false });
  console.log('Saved admin list screenshot to', adminListPath);

  // Verify text content of Associate Project Manager card
  const apmHeading = page.locator('text=Associate Project Manager');
  await apmHeading.waitFor({ state: 'visible', timeout: 5000 });
  const apmCard = apmHeading.locator('xpath=./ancestor::div[contains(@style, "border-radius")][1]');
  const cardText = await apmCard.innerText();
  console.log('--- Associate Project Manager Card Text ---');
  console.log(cardText);
  console.log('-------------------------------------------');

  if (cardText.includes('Founder / Self-employed')) {
    throw new Error('FAILED: Card still contains "Founder / Self-employed"!');
  }
  console.log('PASSED: "Founder / Self-employed" is NOT present on the card!');

  // Click Edit Role button on this card
  console.log('3. Opening Experience Editor modal...');
  const editBtn = apmCard.locator('button[title="Edit Role"]');
  await editBtn.click();
  await page.waitForTimeout(1000);

  // Verify modal is open and take screenshot
  const modal = page.locator('text=Edit Experience').or(page.locator('text=Role Classification / Employment Type'));
  await modal.first().waitFor({ state: 'visible', timeout: 5000 });
  const adminEditorPath = path.join(artifactDir, 'admin_experience_editor_fixed.png');
  await page.screenshot({ path: adminEditorPath, fullPage: false });
  console.log('Saved admin editor modal screenshot to', adminEditorPath);

  // Verify the classification controls exist:
  const typeSelect = page.locator('select').filter({ hasText: 'None / Not Specified (No Badge)' }).first();
  await typeSelect.waitFor({ state: 'visible', timeout: 3000 });
  console.log('PASSED: Role classification dropdown with "None / Not Specified (No Badge)" is present.');

  // Test updating employmentType to "Full-time" and saving
  console.log('4. Testing classification change in editor to "Full-time"...');
  await typeSelect.selectOption('Full-time');
  await page.waitForTimeout(300);

  console.log('5. Saving experience as Full-time...');
  await page.locator('button:has-text("Save & Publish"), button:has-text("Publish")').first().click();
  await page.waitForTimeout(1500);

  const updatedCardText = await apmCard.innerText();
  console.log('Updated card text:\n', updatedCardText);
  if (!updatedCardText.includes('Full-time')) {
    throw new Error('FAILED: Card does not display updated "Full-time" badge!');
  }
  console.log('PASSED: Card successfully updated to "Full-time"!');

  // Now edit again and click "Clear / Remove Badge" to test clearing functionality
  console.log('6. Testing Clear / Remove Badge functionality...');
  await editBtn.click();
  await page.waitForTimeout(800);
  const clearBtn = page.locator('button:has-text("Clear / Remove Badge")');
  await clearBtn.waitFor({ state: 'visible', timeout: 3000 });
  await clearBtn.click();
  await page.waitForTimeout(300);

  console.log('7. Saving experience with cleared classification...');
  await page.locator('button:has-text("Save & Publish"), button:has-text("Publish")').first().click();
  await page.waitForTimeout(1500);

  // Reload page to confirm persistence after refresh
  console.log('8. Reloading admin page to verify persistence after refresh...');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await expNavBtn.click();
  await page.waitForTimeout(1000);

  const reloadedCardText = await apmCard.innerText();
  console.log('Reloaded card text:\n', reloadedCardText);
  if (reloadedCardText.includes('Founder / Self-employed') || reloadedCardText.includes('Full-time')) {
    throw new Error('FAILED: Badge was not cleared or reverted after reload!');
  }
  console.log('PASSED: Cleared state persisted perfectly across page reload!');

  // Save final admin list screenshot
  await page.screenshot({ path: adminListPath, fullPage: false });

  // 9. Check public portfolio
  console.log('9. Checking public portfolio...');
  await page.goto('http://localhost:4173/#experience', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const publicExpPath = path.join(artifactDir, 'public_experience_fixed.png');
  await page.screenshot({ path: publicExpPath, fullPage: false });
  console.log('Saved public experience screenshot to', publicExpPath);

  await browser.close();
  console.log('ALL TESTS & VERIFICATIONS COMPLETED SUCCESSFULLY!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
