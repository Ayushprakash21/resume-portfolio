import { chromium } from 'playwright';
import { spawn } from 'child_process';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Ayush/.gemini/antigravity/brain/476c7590-1f5b-4226-97b0-0976fa6f2d4a';

const viewports = [
  { name: '320px', width: 320, height: 568 },
  { name: '390px', width: 390, height: 844 },
  { name: '768px', width: 768, height: 1024 },
  { name: '1024px', width: 1024, height: 768 },
  { name: '1440px', width: 1440, height: 900 },
  { name: '1920px', width: 1920, height: 1080 },
];

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('Starting preview server on port 4173...');
  const server = spawn('npx', ['vite', 'preview', '--port', '4173', '--strictPort'], {
    shell: true,
    stdio: 'pipe',
  });

  server.stdout.on('data', (d) => console.log(`[preview]: ${d}`));
  server.stderr.on('data', (d) => console.error(`[preview err]: ${d}`));

  // Wait until server is actually up
  let ready = false;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch('http://localhost:4173');
      if (res.ok || res.status === 200 || res.status === 304) {
        ready = true;
        break;
      }
    } catch {}
    await wait(500);
  }

  if (!ready) {
    throw new Error('Preview server failed to start on port 4173');
  }
  console.log('Preview server is ready!');

  const browser = await chromium.launch({ headless: true });

  try {
    for (const vp of viewports) {
      console.log(`\n--- Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
      const page = await browser.newPage({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 2,
      });

      await page.goto('http://localhost:4173/?intro=1&freeze_intro=1', { waitUntil: 'networkidle' });
      await wait(1200);

      // Verify computed styles
      const typographyReport = await page.evaluate(() => {
        const nameEl = document.querySelector('.boot-intro-founder-name');
        const ayushEl = document.querySelector('.boot-intro-name-ayush');
        const prakashEl = document.querySelector('.boot-intro-name-prakash');
        const tagHeadingEl = document.querySelector('.boot-intro-tagline-heading');
        const tagSubEl = document.querySelector('.boot-intro-tagline-sub');

        const getInfo = (el) => {
          if (!el) return null;
          const s = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return {
            fontFamily: s.fontFamily,
            fontWeight: s.fontWeight,
            fontSize: s.fontSize,
            lineHeight: s.lineHeight,
            letterSpacing: s.letterSpacing,
            color: s.color,
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left,
          };
        };

        return {
          founderName: getInfo(nameEl),
          ayush: getInfo(ayushEl),
          prakash: getInfo(prakashEl),
          taglineHeading: getInfo(tagHeadingEl),
          taglineSub: getInfo(tagSubEl),
        };
      });

      console.log('Founder Name:', JSON.stringify(typographyReport.founderName));
      console.log('Tagline Heading:', JSON.stringify(typographyReport.taglineHeading));
      console.log('Tagline Sub:', JSON.stringify(typographyReport.taglineSub));

      const screenshotFilename = `intro_typography_fixed_${vp.name}.png`;
      const screenshotPath = path.join(ARTIFACTS_DIR, screenshotFilename);
      await page.screenshot({ path: screenshotPath });
      console.log(`Saved screenshot: ${screenshotFilename}`);

      await page.close();
    }

    console.log('\nAll viewports captured successfully!');
  } finally {
    await browser.close();
    server.kill();
  }
}

main().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
