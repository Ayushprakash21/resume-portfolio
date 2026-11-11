import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import path from 'node:path';

const ARTIFACTS_DIR = 'C:/Users/Ayush/.gemini/antigravity/brain/476c7590-1f5b-4226-97b0-0976fa6f2d4a';
const PORT = 4188;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const MODE = process.argv[2] || 'before';

const VIEWPORTS = [320, 360, 375, 390, 430, 768, 1024, 1440, 1920];
const SECTIONS = [
  'about',
  'opentowork',
  'experience',
  'capabilities',
  'projects',
  'certifications',
  'education',
  'contact',
];

async function main() {
  console.log(`=== TYPOGRAPHY AUDIT MODE: ${MODE.toUpperCase()} ===`);
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
    await new Promise((r) => setTimeout(r, 500));
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
    await page.waitForTimeout(3000);

    // 1. Measure headings & overflow across all 9 responsive viewports
    const report = {};
    for (const width of VIEWPORTS) {
      await page.setViewportSize({ width, height: 900 });
      await page.waitForTimeout(200);

      const metrics = await page.evaluate((sectionIds) => {
        const docOverflow = document.documentElement.scrollWidth > window.innerWidth;
        const bodyOverflow = document.body.scrollWidth > window.innerWidth;
        const sections = {};

        for (const id of sectionIds) {
          const sec = document.getElementById(id);
          if (!sec) continue;
          const h2 = sec.querySelector('h2');
          if (!h2) continue;
          const cs = window.getComputedStyle(h2);
          const rect = h2.getBoundingClientRect();
          sections[id] = {
            text: h2.innerText.trim().slice(0, 48),
            fontSize: parseFloat(cs.fontSize),
            lineHeight: cs.lineHeight,
            marginBottom: cs.marginBottom,
            height: Math.round(rect.height),
            overflowRight: rect.right > window.innerWidth + 1,
          };
        }
        return {
          docOverflow,
          bodyOverflow,
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
          sections,
        };
      }, SECTIONS);

      report[width] = metrics;

      if (MODE === 'after' && metrics.docOverflow) {
        throw new Error(`Horizontal overflow detected at ${width}px! scrollWidth=${metrics.scrollWidth} innerWidth=${metrics.innerWidth}`);
      }
    }

    console.log('\n--- Heading Font Sizes & Line Heights by Viewport ---');
    console.table(
      Object.fromEntries(
        SECTIONS.map((id) => [
          id,
          Object.fromEntries(
            [320, 390, 768, 1024, 1440, 1920].map((w) => {
              const s = report[w]?.sections[id];
              if (!s?.fontSize) return [`${w}px`, '-'];
              const lhPx = parseFloat(s.lineHeight);
              const lhRatio = Number.isFinite(lhPx) ? (lhPx / s.fontSize).toFixed(2) : s.lineHeight;
              return [`${w}px`, `${s.fontSize.toFixed(1)}px (lh:${lhRatio})`];
            })
          ),
        ])
      )
    );

    // 2. Capture Screenshots at 1440px and 390px for ALL EIGHT sections
    const shotSections = ['about', 'opentowork', 'experience', 'capabilities', 'projects', 'certifications', 'education', 'contact'];
    for (const vw of [1440, 390]) {
      await page.setViewportSize({ width: vw, height: vw === 1440 ? 900 : 844 });
      await page.waitForTimeout(300);

      for (const secId of shotSections) {
        const scrolled = await page.evaluate((id) => {
          const el = document.getElementById(id);
          if (!el) return false;
          const top = el.getBoundingClientRect().top + window.scrollY - 68;
          window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
          return true;
        }, secId);
        if (scrolled) {
          await page.waitForTimeout(350);
          const fileName = `typo2_${MODE}_${vw}px_${secId}.png`;
          await page.screenshot({ path: path.join(ARTIFACTS_DIR, fileName) });
        }
      }
    }

    console.log(`\nSaved ${MODE} screenshots to artifacts directory.`);
  } finally {
    await browser.close();
    server.kill();
    process.exit(0);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
