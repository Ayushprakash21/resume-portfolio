import { chromium } from 'playwright';
import { spawn } from 'child_process';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Ayush/.gemini/antigravity/brain/476c7590-1f5b-4226-97b0-0976fa6f2d4a';

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('Starting preview server...');
  const server = spawn('npx', ['vite', 'preview', '--port', '4173', '--strictPort'], {
    shell: true,
    stdio: 'pipe',
  });

  server.stdout.on('data', (data) => {
    // console.log(`[preview]: ${data}`);
  });
  server.stderr.on('data', (data) => {
    console.error(`[preview err]: ${data}`);
  });

  await wait(3000);

  const browser = await chromium.launch({ headless: true });

  try {
    // 1. Desktop 1440x900
    const desktopPage = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });

    console.log('Navigating desktop page to http://localhost:4173...');
    await desktopPage.goto('http://localhost:4173', { waitUntil: 'networkidle' });
    await wait(3500); // Allow WebGL 3D scene & canvas particles to initialize and render

    console.log('Capturing Desktop Hero...');
    await desktopPage.screenshot({
      path: path.join(ARTIFACTS_DIR, 'hero_red_black_cape_fixed_1440.png'),
    });

    // Scroll to About
    console.log('Scrolling to About...');
    await desktopPage.evaluate(() => {
      const el = document.getElementById('about') || document.querySelector('section[id*="about"]');
      if (el) el.scrollIntoView({ behavior: 'instant' });
      else window.scrollTo(0, 900);
    });
    await wait(1500);
    await desktopPage.screenshot({
      path: path.join(ARTIFACTS_DIR, 'about_flame_1440.png'),
    });

    // Scroll to Experience
    console.log('Scrolling to Experience...');
    await desktopPage.evaluate(() => {
      const el = document.getElementById('experience') || document.querySelector('section[id*="experience"]');
      if (el) el.scrollIntoView({ behavior: 'instant' });
      else window.scrollTo(0, 1800);
    });
    await wait(1500);
    await desktopPage.screenshot({
      path: path.join(ARTIFACTS_DIR, 'experience_flame_1440.png'),
    });

    // Scroll to Projects
    console.log('Scrolling to Projects...');
    await desktopPage.evaluate(() => {
      const el = document.getElementById('projects') || document.querySelector('section[id*="project"]');
      if (el) el.scrollIntoView({ behavior: 'instant' });
      else window.scrollTo(0, 2800);
    });
    await wait(1500);
    await desktopPage.screenshot({
      path: path.join(ARTIFACTS_DIR, 'projects_flame_1440.png'),
    });

    // Scroll to Accreditations / Certifications & Academics
    console.log('Scrolling to Certifications / Academics...');
    await desktopPage.evaluate(() => {
      const el = document.getElementById('accreditations') || document.getElementById('academics') || document.querySelector('section[id*="cert"]');
      if (el) el.scrollIntoView({ behavior: 'instant' });
      else window.scrollTo(0, 3800);
    });
    await wait(1500);
    await desktopPage.screenshot({
      path: path.join(ARTIFACTS_DIR, 'certifications_academics_flame_1440.png'),
    });

    // Scroll to Contact
    console.log('Scrolling to Contact...');
    await desktopPage.evaluate(() => {
      const el = document.getElementById('contact') || document.querySelector('section[id*="contact"]');
      if (el) el.scrollIntoView({ behavior: 'instant' });
      else window.scrollTo(0, 4800);
    });
    await wait(1500);
    await desktopPage.screenshot({
      path: path.join(ARTIFACTS_DIR, 'contact_flame_1440.png'),
    });

    await desktopPage.close();

    // 2. Mobile 390x844
    console.log('Testing Mobile 390x844...');
    const mobilePage = await browser.newPage({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });

    await mobilePage.goto('http://localhost:4173', { waitUntil: 'networkidle' });
    await wait(3500);

    console.log('Capturing Mobile Hero...');
    await mobilePage.screenshot({
      path: path.join(ARTIFACTS_DIR, 'hero_red_black_cape_fixed_390.png'),
    });

    await mobilePage.close();

    console.log('All verification screenshots captured successfully!');
  } finally {
    await browser.close();
    server.kill();
  }
}

main().catch((err) => {
  console.error('Error running verification:', err);
  process.exit(1);
});
