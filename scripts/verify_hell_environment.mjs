import { chromium } from 'playwright';
import { spawn } from 'child_process';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Ayush/.gemini/antigravity/brain/476c7590-1f5b-4226-97b0-0976fa6f2d4a';

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const PORT = '4175';
  console.log(`Starting preview server on port ${PORT}...`);
  const server = spawn('npx', ['vite', 'preview', '--port', PORT, '--strictPort'], {
    shell: true,
    stdio: 'pipe',
  });

  server.stdout.on('data', (d) => console.log(`[preview]: ${d}`));
  server.stderr.on('data', (d) => console.error(`[preview err]: ${d}`));

  let ready = false;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`http://localhost:${PORT}`);
      if (res.ok || res.status === 200 || res.status === 304) {
        ready = true;
        break;
      }
    } catch {}
    await wait(500);
  }

  if (!ready) {
    throw new Error(`Preview server failed to start on port ${PORT}`);
  }
  console.log('Preview server is ready!');

  const browser = await chromium.launch({ headless: true });

  try {
    // 1. Desktop 1440px
    console.log('Capturing Desktop 1440px...');
    const page1440 = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    await page1440.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle' });
    await wait(3500); // Allow WebGL 3D scene & shaders to initialize
    await page1440.screenshot({
      path: path.join(ARTIFACTS_DIR, 'hero_hell_desktop_1440.png'),
    });
    console.log('Saved hero_hell_desktop_1440.png');

    // 2. Full-width 1920px
    console.log('Capturing Full-width 1920px...');
    const page1920 = await browser.newPage({
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1.5,
    });
    await page1920.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle' });
    await wait(3500);
    await page1920.screenshot({
      path: path.join(ARTIFACTS_DIR, 'hero_hell_desktop_1920.png'),
    });
    console.log('Saved hero_hell_desktop_1920.png');
    await page1920.close();

    // 3. Mobile 390px
    console.log('Capturing Mobile 390px...');
    const page390 = await browser.newPage({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    await page390.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle' });
    await wait(3500);
    await page390.screenshot({
      path: path.join(ARTIFACTS_DIR, 'hero_hell_mobile_390.png'),
    });
    console.log('Saved hero_hell_mobile_390.png');
    await page390.close();

    // 4. Close-up on Knight and Revised Halo
    console.log('Capturing Close-up on Knight and Halo...');
    await page1440.screenshot({
      path: path.join(ARTIFACTS_DIR, 'halo_close_knight.png'),
      clip: {
        x: 650,
        y: 80,
        width: 700,
        height: 750,
      },
    });
    console.log('Saved halo_close_knight.png');
    await page1440.close();

    console.log('\nAll Hell Environment & Halo screenshots captured successfully!');
  } finally {
    await browser.close();
    server.kill();
  }
}

main().catch((err) => {
  console.error('Error in capture:', err);
  process.exit(1);
});
