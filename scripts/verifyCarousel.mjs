import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import path from 'node:path';

const ARTIFACTS_DIR = 'C:/Users/Ayush/.gemini/antigravity/brain/476c7590-1f5b-4226-97b0-0976fa6f2d4a';
const PORT = 4189;
const BASE_URL = `http://127.0.0.1:${PORT}`;

const VIEWPORTS = [320, 390, 768, 1024, 1440];

async function captureSection(page, filePath) {
  const sec = page.locator('#capabilities');
  await sec.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  const box = await sec.boundingBox();
  if (box) {
    await page.screenshot({
      path: filePath,
      clip: {
        x: Math.max(0, box.x),
        y: Math.max(0, box.y),
        width: Math.min(box.width, page.viewportSize().width),
        height: Math.min(box.height, page.viewportSize().height),
      },
    });
  } else {
    await page.screenshot({ path: filePath });
  }
}

async function measureCarouselState(page) {
  return page.evaluate(() => {
    const carousel = document.querySelector('#capabilities .concave-carousel');
    if (!carousel) return null;
    const stage = carousel.querySelector('.concave-carousel__stage');
    const panels = Array.from(carousel.querySelectorAll('.concave-carousel__panel'));
    const activePanel = carousel.querySelector('.concave-carousel__panel--active');
    const stageRect = stage.getBoundingClientRect();
    const activeRect = activePanel ? activePanel.getBoundingClientRect() : null;

    const docOverflow = document.documentElement.scrollWidth > window.innerWidth;
    const heights = panels.map((p) => p.offsetHeight);
    const widths = panels.map((p) => p.offsetWidth);

    // Check internal scrollbars inside panels or capability grids
    const scrollViolations = [];
    for (const p of panels) {
      const inner = p.querySelector('.concave-carousel__panel-measure');
      const grid = p.querySelector('.capabilities-card__grid');
      if (p.scrollHeight > p.clientHeight + 2) {
        scrollViolations.push(`panel overflow: ${p.scrollHeight} > ${p.clientHeight}`);
      }
      if (inner && inner.scrollHeight > p.clientHeight + 2) {
        scrollViolations.push(`inner clipped: ${inner.scrollHeight} > ${p.clientHeight}`);
      }
      if (grid) {
        const cs = window.getComputedStyle(grid);
        if (cs.overflowY === 'auto' || cs.overflowY === 'scroll') {
          scrollViolations.push(`grid overflowY is ${cs.overflowY}`);
        }
      }
    }

    // Check visible panels overlap
    const visibleRects = panels
      .map((p, idx) => {
        const cs = window.getComputedStyle(p);
        const r = p.getBoundingClientRect();
        return {
          idx,
          isActive: p.classList.contains('concave-carousel__panel--active'),
          opacity: parseFloat(cs.opacity),
          left: r.left,
          right: r.right,
          width: r.width,
        };
      })
      .filter((r) => r.opacity > 0.05)
      .sort((a, b) => a.left - b.left);

    const overlaps = [];
    for (let i = 0; i < visibleRects.length - 1; i++) {
      const a = visibleRects[i];
      const b = visibleRects[i + 1];
      if (a.right > b.left + 1) {
        overlaps.push(`Card ${a.idx} overlaps Card ${b.idx} by ${(a.right - b.left).toFixed(1)}px`);
      }
    }

    const activeTitle = activePanel?.querySelector('.capabilities-card__title')?.textContent?.trim() || '';
    const centerErrorPx = activeRect
      ? Math.abs((activeRect.left + activeRect.width / 2) - (stageRect.left + stageRect.width / 2))
      : 999;

    return {
      viewportWidth: window.innerWidth,
      docOverflow,
      activeTitle,
      centerErrorPx: Number(centerErrorPx.toFixed(2)),
      minHeight: Math.min(...heights),
      maxHeight: Math.max(...heights),
      minWidth: Math.min(...widths),
      maxWidth: Math.max(...widths),
      visibleCount: visibleRects.length,
      overlaps,
      scrollViolations,
    };
  });
}

async function main() {
  console.log('=== VERIFYING REDESIGNED PORTFOLIO CAROUSEL ===');
  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--host', '127.0.0.1', '--strictPort'], {
    shell: true,
    stdio: 'pipe',
  });
  server.stderr.on('data', (d) => process.stderr.write(d));

  let ready = false;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(BASE_URL);
      if (res.ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 400));
  }
  if (!ready) {
    server.kill();
    throw new Error('Preview server failed to start');
  }

  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.sessionStorage.setItem('ap_boot_intro_played', 'true');
    });

    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);

    // Scroll smoothly to capabilities & hover to pause autoplay during static responsive geometry checks
    await page.locator('#capabilities .concave-carousel').scrollIntoViewIfNeeded();
    await page.locator('#capabilities button[aria-label="Jump to category 1 of 5"]').click();
    await page.locator('#capabilities .concave-carousel').hover();
    await page.waitForTimeout(700);

    // 1. Check geometry & invariants across Desktop, Tablet, Mobile
    for (const width of VIEWPORTS) {
      await page.setViewportSize({ width, height: 900 });
      await page.waitForTimeout(450);

      const state = await measureCarouselState(page);
      console.log(`Viewport ${width}px:`, JSON.stringify(state));

      assert.ok(state, `Carousel should exist at ${width}px`);
      assert.equal(state.docOverflow, false, `No document horizontal overflow at ${width}px`);
      assert.ok(state.centerErrorPx <= 1.5, `Active card centered at ${width}px (error=${state.centerErrorPx}px)`);
      assert.equal(state.overlaps.length, 0, `Zero card overlaps at ${width}px: ${state.overlaps.join(', ')}`);
      assert.equal(state.scrollViolations.length, 0, `Zero internal scrollbars at ${width}px: ${state.scrollViolations.join(', ')}`);
      assert.ok(state.maxHeight - state.minHeight <= 1, `Uniform card height at ${width}px (${state.minHeight}..${state.maxHeight})`);
      assert.ok(state.maxWidth - state.minWidth <= 1, `Uniform card width at ${width}px`);

      if (width >= 768) {
        assert.ok(state.visibleCount >= 2, `Adjacent peek cards visible at ${width}px`);
      }

      if (width === 1440 || width === 768 || width === 390) {
        await captureSection(page, path.join(ARTIFACTS_DIR, `carousel_after_${width}px_supply_chain.png`));
      }
    }

    // 2. Test desktop interactions: Next Arrow -> Pagination Dot -> Mouse Drag -> Keyboard Arrow
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(400);

    // Next Arrow -> should move to Project Coordination
    await page.locator('#capabilities button[aria-label="Next Category"]').click();
    await page.waitForTimeout(800);
    let afterNext = await measureCarouselState(page);
    console.log('After Next Arrow:', afterNext.activeTitle, 'centerErr:', afterNext.centerErrorPx, 'overlaps:', afterNext.overlaps);
    assert.notEqual(afterNext.activeTitle, 'Supply Chain');
    assert.ok(afterNext.centerErrorPx <= 2, `Expected settled center after arrow click (got ${afterNext.centerErrorPx})`);
    assert.equal(afterNext.overlaps.length, 0);

    // Keyboard ArrowRight -> Business Operations
    await page.locator('#capabilities .concave-carousel').focus();
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(800);
    let afterKeyRight = await measureCarouselState(page);
    console.log('After Keyboard ArrowRight:', afterKeyRight.activeTitle, 'centerErr:', afterKeyRight.centerErrorPx);
    assert.equal(afterKeyRight.activeTitle, 'Business Operations');
    assert.ok(afterKeyRight.centerErrorPx <= 2);

    // Jump directly to dot 4 (Systems and Tools — previously had vertical scrollbar!)
    await page.locator('#capabilities button[aria-label="Jump to category 4 of 5"]').click();
    await page.waitForTimeout(800);
    let systemsState = await measureCarouselState(page);
    console.log('After Dot 4 (Systems and Tools):', systemsState.activeTitle, 'scrollViolations:', systemsState.scrollViolations);
    assert.equal(systemsState.activeTitle, 'Systems and Tools');
    assert.equal(systemsState.scrollViolations.length, 0);
    assert.equal(systemsState.overlaps.length, 0);
    await captureSection(page, path.join(ARTIFACTS_DIR, 'carousel_after_1440px_systems_tools.png'));

    // Jump directly to dot 3 (Business Operations — max 10 capabilities!)
    await page.locator('#capabilities button[aria-label="Jump to category 3 of 5"]').click();
    await page.waitForTimeout(800);
    let bizState = await measureCarouselState(page);
    console.log('After Dot 3 (Business Operations):', bizState.activeTitle, 'scrollViolations:', bizState.scrollViolations);
    assert.equal(bizState.activeTitle, 'Business Operations');
    assert.equal(bizState.scrollViolations.length, 0);

    // Mouse Drag test on stage
    const stageBox = await page.locator('#capabilities .concave-carousel__stage').boundingBox();
    await page.mouse.move(stageBox.x + stageBox.width / 2 + 120, stageBox.y + stageBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(stageBox.x + stageBox.width / 2 - 140, stageBox.y + stageBox.height / 2, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(800);
    let afterDrag = await measureCarouselState(page);
    console.log('After Mouse Drag Left:', afterDrag.activeTitle, 'centerErr:', afterDrag.centerErrorPx);
    assert.notEqual(afterDrag.activeTitle, 'Business Operations');
    assert.ok(afterDrag.centerErrorPx <= 2);

    // Mobile 390px Business Operations screenshot (10 items all visible without scrollbar)
    await page.setViewportSize({ width: 390, height: 900 });
    await page.waitForTimeout(450);
    await page.locator('#capabilities button[aria-label="Jump to category 3 of 5"]').click();
    await page.waitForTimeout(800);
    let mobileBiz = await measureCarouselState(page);
    console.log('Mobile 390px Business Operations:', JSON.stringify(mobileBiz));
    assert.equal(mobileBiz.scrollViolations.length, 0);
    assert.equal(mobileBiz.overlaps.length, 0);
    await captureSection(page, path.join(ARTIFACTS_DIR, 'carousel_after_390px_business_ops.png'));

    console.log('ALL CAROUSEL VERIFICATION CHECKS PASSED!');
  } finally {
    await browser.close();
    server.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
