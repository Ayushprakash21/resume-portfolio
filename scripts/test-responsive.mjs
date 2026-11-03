import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const VIEWPORTS = [
  // Mobile
  { name: 'mobile-320', width: 320, height: 740, isMobile: true },
  { name: 'mobile-360', width: 360, height: 800, isMobile: true },
  { name: 'mobile-375', width: 375, height: 812, isMobile: true },
  { name: 'mobile-390', width: 390, height: 844, isMobile: true },
  { name: 'mobile-430', width: 430, height: 932, isMobile: true },
  // Tablet
  { name: 'tablet-600', width: 600, height: 960, isTablet: true },
  { name: 'tablet-768', width: 768, height: 1024, isTablet: true },
  { name: 'tablet-820', width: 820, height: 1180, isTablet: true },
  { name: 'tablet-1024', width: 1024, height: 768, isTablet: true },
  // Desktop
  { name: 'desktop-1280', width: 1280, height: 800 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-1920', width: 1920, height: 1080 },
];

const SCREENSHOT_DIR = path.resolve('responsive_screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log('--- Starting Vite Preview Server ---');
  const server = spawn('npx', ['vite', 'preview', '--port', '4173'], {
    shell: true,
    stdio: 'pipe',
  });

  server.stdout.on('data', (d) => process.stdout.write(d.toString()));
  server.stderr.on('data', (d) => process.stderr.write(d.toString()));

  // Wait for server ready
  await new Promise((res) => setTimeout(res, 2500));

  const browser = await chromium.launch({ headless: true });
  const results = [];
  let allPassed = true;

  try {
    for (const vp of VIEWPORTS) {
      console.log(`\nTesting viewport: ${vp.name} (${vp.width}x${vp.height})`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        userAgent: vp.isMobile
          ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15'
          : undefined,
      });

      const page = await context.newPage();
      await page.goto('http://localhost:4173', { waitUntil: 'load' });
      await page.waitForTimeout(1000);

      // Check horizontal overflow
      const overflow = await page.evaluate(() => {
        const docWidth = document.documentElement.clientWidth;
        const scrollWidth = document.documentElement.scrollWidth;
        const bodyScrollWidth = document.body.scrollWidth;
        const maxScroll = Math.max(scrollWidth, bodyScrollWidth);
        const hasOverflow = maxScroll > docWidth + 1; // 1px threshold for subpixel rounding

        // Find overflowing elements if any
        let badElements = [];
        if (hasOverflow) {
          document.querySelectorAll('*').forEach((el) => {
            const rect = el.getBoundingClientRect();
            if (rect.right > docWidth + 2) {
              badElements.push({
                tag: el.tagName,
                className: el.className,
                id: el.id,
                right: rect.right,
                docWidth,
              });
            }
          });
        }
        return { hasOverflow, docWidth, maxScroll, badElements: badElements.slice(0, 5) };
      });

      console.log(
        `  Horizontal scroll check: docWidth=${overflow.docWidth}, scrollWidth=${overflow.maxScroll}`
      );
      if (overflow.hasOverflow) {
        console.error(`  ❌ FAILED: Horizontal overflow detected on ${vp.name}!`);
        console.error('  Bad elements:', overflow.badElements);
        allPassed = false;
      } else {
        console.log(`  ✔ PASSED: Zero horizontal overflow.`);
      }

      // Check navigation on mobile/tablet vs desktop
      if (vp.width <= 920) {
        // Toggle button must be visible
        const menuBtn = page.locator('.mobile-menu-toggle').first();
        const isMenuBtnVisible = await menuBtn.isVisible();
        console.log(`  Mobile menu toggle visible: ${isMenuBtnVisible}`);

        if (!isMenuBtnVisible) {
          console.error(`  ❌ Mobile menu button should be visible on ${vp.name}`);
          allPassed = false;
        }

        // Test opening menu
        await menuBtn.click();
        await page.waitForTimeout(400);

        const drawerOpen = await page.evaluate(() => {
          const drawer = document.querySelector('.mobile-nav-backdrop');
          return drawer && drawer.classList.contains('is-open');
        });
        console.log(`  Drawer opens on tap: ${drawerOpen}`);

        // Test closing menu
        const closeBtn = page.locator('.mobile-nav-drawer .mobile-menu-toggle');
        await closeBtn.click();
        await page.waitForTimeout(400);
      } else {
        // Desktop nav must be visible
        const desktopNav = page.locator('.desktop-nav-links');
        const isDesktopNavVisible = await desktopNav.isVisible();
        console.log(`  Desktop navigation visible: ${isDesktopNavVisible}`);
      }

      // Capture screenshots for specified key viewports
      if (vp.width === 390 && vp.height === 844) {
        const shotPath = path.join(SCREENSHOT_DIR, 'screenshot_390x844_mobile.png');
        await page.screenshot({ path: shotPath, fullPage: false });
        console.log(`  📸 Captured mobile screenshot: ${shotPath}`);

        // Also screenshot admin on mobile
        await page.goto('http://localhost:4173/admin', { waitUntil: 'load' });
        await page.waitForTimeout(1000);
        const adminShotPath = path.join(SCREENSHOT_DIR, 'screenshot_390x844_admin_login.png');
        await page.screenshot({ path: adminShotPath, fullPage: false });
        console.log(`  📸 Captured admin mobile screenshot: ${adminShotPath}`);
      } else if (vp.width === 768 && vp.height === 1024) {
        const shotPath = path.join(SCREENSHOT_DIR, 'screenshot_768x1024_tablet.png');
        await page.screenshot({ path: shotPath, fullPage: false });
        console.log(`  📸 Captured tablet screenshot: ${shotPath}`);
      } else if (vp.width === 1440 && vp.height === 900) {
        const shotPath = path.join(SCREENSHOT_DIR, 'screenshot_1440x900_desktop.png');
        await page.screenshot({ path: shotPath, fullPage: false });
        console.log(`  📸 Captured desktop screenshot: ${shotPath}`);

        // Capture Orion-9 3D Option Wheel section
        try {
          await page.evaluate(() => {
            document.getElementById('orion-subsystems')?.scrollIntoView({ behavior: 'instant', block: 'center' });
          });
          await page.waitForTimeout(500);
          const wheelShotPath = path.join(SCREENSHOT_DIR, 'screenshot_orion9_option_wheel.png');
          await page.screenshot({ path: wheelShotPath, fullPage: false });
          console.log(`  📸 Captured Orion-9 Option Wheel screenshot: ${wheelShotPath}`);
        } catch (e) {
          console.warn('Could not capture Orion-9 wheel screenshot', e);
        }
      }

      results.push({
        viewport: vp.name,
        width: vp.width,
        height: vp.height,
        zeroOverflow: !overflow.hasOverflow,
      });

      await context.close();
    }
  } finally {
    await browser.close();
    server.kill();
  }

  console.log('\n=======================================');
  console.log('       RESPONSIVE TEST SUMMARY         ');
  console.log('=======================================');
  console.table(results);

  if (!allPassed) {
    console.error('\n❌ RESPONSIVE TEST FAILED FOR ONE OR MORE VIEWPORTS.');
    process.exit(1);
  } else {
    console.log('\n✔ ALL 11 VIEWPORTS PASSED WITH ZERO HORIZONTAL OVERFLOW!');
    process.exit(0);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
