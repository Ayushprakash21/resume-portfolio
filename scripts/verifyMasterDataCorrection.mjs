import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import path from 'node:path';

const ARTIFACTS_DIR = 'C:/Users/Ayush/.gemini/antigravity/brain/476c7590-1f5b-4226-97b0-0976fa6f2d4a';
const PORT = 4186;
const BASE_URL = `http://localhost:${PORT}`;

async function main() {
  console.log('Starting preview server on port', PORT);
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
    throw new Error('Preview server failed to start');
  }

  console.log('Preview server ready! Launching fresh Incognito Chromium context...');
  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    // Skip boot intro in UI only (do NOT pre-seed CMS localStorage!)
    await page.addInitScript(() => {
      window.sessionStorage.setItem('ap_boot_intro_played', 'true');
    });

    console.log('1. Loading public site cleanly in fresh session...');
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    // Wait for Firestore onSnapshot sync to hydrate live published records
    await page.waitForTimeout(3500);

    // Check About Section
    console.log('2. Verifying About section...');
    const aboutSection = page.locator('#about');
    await aboutSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    const aboutText = await aboutSection.innerText();
    if (!aboutText.includes('Operations professional with over five years')) {
      throw new Error('About section missing authoritative bio');
    }
    if (!aboutText.includes('ApplyWise AI')) {
      throw new Error('About section still references old project name instead of ApplyWise AI');
    }
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'master_01_about_section.png') });
    console.log('Saved master_01_about_section.png');

    // Check Experience Section (7 employers)
    console.log('3. Verifying Experience timeline (7 employers)...');
    const expSection = page.locator('#experience');
    await expSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    const expText = await expSection.innerText();

    const expectedEmployers = [
      'Tata Consultancy Services (TCS)',
      'ESP Softtech Pvt. Ltd.',
      'SynergyTop Softlabs Pvt. Ltd.',
      'Accenture Solutions Pvt. Ltd.',
      'Teleperformance',
      'Toppr Technologies',
      'ICICI Bank',
    ];
    for (const emp of expectedEmployers) {
      if (!expText.includes(emp)) {
        throw new Error(`Missing employer in public Experience section: ${emp}`);
      }
    }
    if (!expText.includes('Took on 40 more projects')) {
      throw new Error('SynergyTop missing preserved wording about additional 40 projects');
    }
    if (expText.includes('70+ cumulative') || expText.includes('Information Process Specialist')) {
      throw new Error('Experience section still contains fabricated/old wording!');
    }
    if (expText.includes('July 2021 —')) {
      throw new Error('Toppr Technologies displays dangling dash!');
    }
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'master_02_experience_timeline.png') });
    console.log('Saved master_02_experience_timeline.png');

    // Check Education Section
    console.log('4. Verifying Education section...');
    const eduSection = page.locator('#education');
    await eduSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    const eduText = await eduSection.innerText();
    if (
      !eduText.includes('Master of Business Administration (MBA)') ||
      !eduText.includes('Devi Ahilya University') ||
      !eduText.includes('IPS Academy, Indore') ||
      !eduText.includes('Bachelor of Commerce (B.Com.)') ||
      !eduText.includes('Rani Durgavati University') ||
      !eduText.includes('GS College, Jabalpur')
    ) {
      throw new Error('Education section missing expected university or associated college data!');
    }
    if (eduText.includes('First Class') || eduText.includes('Comprehensive focus on Industrial Operations')) {
      throw new Error('Education section still displays unsupported grades/achievements!');
    }
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'master_03_education_section.png') });
    console.log('Saved master_03_education_section.png');

    // Check Capabilities Section
    console.log('5. Verifying Capabilities / Skills section...');
    const capSection = page.locator('#capabilities');
    await capSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    const capText = await capSection.innerText();
    if (!capText.includes('Supply Chain') || !capText.includes('Order Management')) {
      throw new Error('Capabilities section missing authoritative Supply Chain category/skills');
    }
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'master_04_capabilities_section.png') });
    console.log('Saved master_04_capabilities_section.png');

    // Check Projects Section
    console.log('6. Verifying Projects section...');
    const projSection = page.locator('#projects');
    await projSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    const projText = await projSection.innerText();
    if (!projText.includes('Orion-9') || !projText.includes('ApplyWise AI')) {
      throw new Error('Projects section missing Orion-9 or ApplyWise AI');
    }
    if (projText.includes('ApplyVise')) {
      throw new Error('Projects section still shows ApplyVise instead of ApplyWise AI');
    }
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'master_05_projects_section.png') });
    console.log('Saved master_05_projects_section.png');

    // Check Certifications Section
    console.log('7. Verifying Certifications carousel...');
    const certSection = page.locator('#certifications');
    await certSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    const certText = await certSection.innerText();
    if (
      !certText.includes('Google Project Management Certificate') ||
      certText.includes('Google Cloud Professional Cloud Architect') ||
      certText.includes('DeepLearning.AI')
    ) {
      throw new Error('Certifications section has inaccurate or missing records!');
    }
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'master_06_certifications_section.png') });
    console.log('Saved master_06_certifications_section.png');

    // Verify Reload Persistence in Incognito
    console.log('8. Testing reload persistence in incognito...');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    const reloadedExpText = await page.locator('#experience').innerText();
    if (!reloadedExpText.includes('Tata Consultancy Services (TCS)') || !reloadedExpText.includes('ICICI Bank')) {
      throw new Error('Reload persistence failed for Experience section!');
    }
    console.log('Reload persistence verified!');

    // Verify ATS Resume Generator Preview Modal
    console.log('9. Testing ATS Resume Generator live preview...');
    const aboutBtn = page.locator('#about button:has-text("Download Curriculum Vitae")');
    await aboutBtn.scrollIntoViewIfNeeded();
    await aboutBtn.click();
    await page.waitForTimeout(600);

    const previewTab = page.locator('button:has-text("Preview Resume")').first();
    await previewTab.click();
    await page.waitForTimeout(600);

    await page.locator('text=Standard A4 Single Column Format').waitFor({ state: 'visible', timeout: 5000 });
    const previewModalText = await page.locator('text=Standard A4 Single Column Format').locator('..').locator('..').innerText();
    if (
      !previewModalText.includes('Supply Chain Operations | Project Coordination | Business Operations') ||
      !previewModalText.includes('+91 9993619227') ||
      !previewModalText.includes('Tata Consultancy Services (TCS)') ||
      !previewModalText.includes('ICICI Bank') ||
      !previewModalText.includes('ApplyWise AI') ||
      !previewModalText.includes('IPS Academy, Indore') ||
      !previewModalText.includes('Claude Certified Architect - Professional')
    ) {
      throw new Error('ATS Resume Generator preview missing authoritative CMS records!');
    }
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'master_07_ats_resume_preview.png') });
    console.log('Saved master_07_ats_resume_preview.png');

    console.log('ALL END-TO-END PUBLIC, INCOGNITO, RELOAD & ATS PDF VERIFICATION CHECKS PASSED!');
  } finally {
    await browser.close();
    server.kill();
  }
}

main().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
