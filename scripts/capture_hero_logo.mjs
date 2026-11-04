import { chromium } from 'playwright';
import path from 'path';

const outDir = 'C:/Users/Ayush/.gemini/antigravity/brain/476c7590-1f5b-4226-97b0-0976fa6f2d4a';

(async () => {
  const browser = await chromium.launch({ headless: true });
  
  // 1. Desktop 1440x900
  console.log('Testing Desktop Viewport (1440x900)...');
  const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktopPage.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
  await desktopPage.waitForTimeout(2500);

  const desktopMetrics = await desktopPage.evaluate(() => {
    const logoImg = document.querySelector('.hero-standalone-monogram img');
    const intro = document.querySelector('.hero-intro-panel');
    const ayushSpan = document.querySelector('.hero-name__first');
    const logoContainer = document.querySelector('.hero-standalone-logo-container');

    const logoRect = logoImg?.getBoundingClientRect();
    const introRect = intro?.getBoundingClientRect();
    const ayushRect = ayushSpan?.getBoundingClientRect();
    const containerRect = logoContainer?.getBoundingClientRect();

    return {
      logoWidth: logoRect?.width,
      logoHeight: logoRect?.height,
      logoLeft: logoRect?.left,
      ayushLeft: ayushRect?.left,
      gapLogoAyush: (ayushRect && logoRect) ? (ayushRect.top - logoRect.bottom) : null,
      gapIntroLogo: (introRect && logoRect) ? (logoRect.top - introRect.bottom) : null,
      aspectRatio: (logoRect && logoRect.height) ? (logoRect.width / logoRect.height) : null,
    };
  });

  console.log('Desktop Metrics:', desktopMetrics);

  // Capture full desktop view
  await desktopPage.screenshot({
    path: path.join(outDir, 'hero_logo_desktop_1440.png'),
  });

  // Capture hero branding closeup
  const desktopHeroBox = await desktopPage.evaluate(() => {
    const intro = document.querySelector('.hero-intro-panel');
    const name = document.querySelector('.hero-founder-name');
    if (!intro || !name) return null;
    const r1 = intro.getBoundingClientRect();
    const r2 = name.getBoundingClientRect();
    return {
      x: Math.max(0, r1.left - 40),
      y: Math.max(0, r1.top - 20),
      width: Math.max(r1.width, r2.width) + 120,
      height: r2.bottom - r1.top + 100,
    };
  });

  if (desktopHeroBox) {
    await desktopPage.screenshot({
      path: path.join(outDir, 'hero_logo_desktop_closeup.png'),
      clip: desktopHeroBox,
    });
  }

  await desktopPage.close();

  // 2. Mobile 390x844
  console.log('\nTesting Mobile Viewport (390x844)...');
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
  await mobilePage.waitForTimeout(2500);

  const mobileMetrics = await mobilePage.evaluate(() => {
    const logoImg = document.querySelector('.hero-standalone-monogram img');
    const intro = document.querySelector('.hero-intro-panel');
    const ayushSpan = document.querySelector('.hero-name__first');

    const logoRect = logoImg?.getBoundingClientRect();
    const introRect = intro?.getBoundingClientRect();
    const ayushRect = ayushSpan?.getBoundingClientRect();
    const scrollWidth = document.documentElement.scrollWidth;

    return {
      logoWidth: logoRect?.width,
      logoHeight: logoRect?.height,
      logoLeft: logoRect?.left,
      ayushLeft: ayushRect?.left,
      gapLogoAyush: (ayushRect && logoRect) ? (ayushRect.top - logoRect.bottom) : null,
      gapIntroLogo: (introRect && logoRect) ? (logoRect.top - introRect.bottom) : null,
      aspectRatio: (logoRect && logoRect.height) ? (logoRect.width / logoRect.height) : null,
      scrollWidth,
    };
  });

  console.log('Mobile Metrics:', mobileMetrics);

  // Capture full mobile view
  await mobilePage.screenshot({
    path: path.join(outDir, 'hero_logo_mobile_390.png'),
  });

  // Capture mobile hero branding closeup
  const mobileHeroBox = await mobilePage.evaluate(() => {
    const intro = document.querySelector('.hero-intro-panel');
    const name = document.querySelector('.hero-founder-name');
    if (!intro || !name) return null;
    const r1 = intro.getBoundingClientRect();
    const r2 = name.getBoundingClientRect();
    return {
      x: 0,
      y: Math.max(0, r1.top - 20),
      width: 390,
      height: r2.bottom - r1.top + 80,
    };
  });

  if (mobileHeroBox) {
    await mobilePage.screenshot({
      path: path.join(outDir, 'hero_logo_mobile_closeup.png'),
      clip: mobileHeroBox,
    });
  }

  await mobilePage.close();
  await browser.close();

  console.log('\nScreenshots and measurements successfully captured!');
})();
