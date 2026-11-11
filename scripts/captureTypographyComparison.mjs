import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';

const ARTIFACTS_DIR = 'C:/Users/Ayush/.gemini/antigravity/brain/476c7590-1f5b-4226-97b0-0976fa6f2d4a';
const PORT = 4192;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const MODE = process.argv[2] || 'before';
const DIST_DIR = path.resolve('dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.ico': 'image/x-icon',
};

function startDistServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const reqPath = (req.url || '/').split('?')[0];
      const safePath = reqPath === '/' ? 'index.html' : reqPath.replace(/^\/+/, '');
      let filePath = path.join(DIST_DIR, safePath);
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(DIST_DIR, 'index.html');
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    });
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
}

const VIEWPORTS = [320, 360, 375, 390, 430, 600, 768, 820, 1024, 1280, 1440, 1920];
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
  console.log(`=== MASTER TYPOGRAPHY AUDIT MODE: ${MODE.toUpperCase()} ===`);
  const server = await startDistServer();

  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    await page.addInitScript(() => {
      window.sessionStorage.setItem('ap_boot_intro_played', 'true');
    });

    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2800);

    // Inspect loaded font faces reported by document.fonts
    const fontFaces = await page.evaluate(async () => {
      await document.fonts.ready;
      return Array.from(document.fonts).map((f) => ({
        family: f.family,
        weight: f.weight,
        style: f.style,
        status: f.status,
      }));
    });
    const loadedFamilies = [...new Set(fontFaces.filter((f) => f.status === 'loaded').map((f) => f.family))];
    const failedFamilies = [...new Set(fontFaces.filter((f) => f.status !== 'loaded').map((f) => f.family))];
    console.log('Loaded webfont families:', loadedFamilies);
    console.log('Unloaded/missing webfont families:', failedFamilies);

    const report = {};
    for (const width of VIEWPORTS) {
      await page.setViewportSize({ width, height: 900 });
      await page.waitForTimeout(220);

      const metrics = await page.evaluate((sectionIds) => {
        const docOverflow = document.documentElement.scrollWidth > window.innerWidth;
        const heroName = document.querySelector('.hero-founder-name');
        const heroTaglineContainer = heroName?.nextElementSibling;
        const heroTagline = heroTaglineContainer?.children?.[0];
        const heroSubTagline = heroTaglineContainer?.children?.[1];
        const navItem = document.querySelector('.notch-nav-item:not(.is-accreditations)');
        const projectTitle = document.querySelector('#projects h3');
        const expCardTitle = document.querySelector('#experience .editorial-timeline-grid > div:first-child > div:nth-child(2)');
        const aboutBody = document.querySelector('#about .editorial-2col-responsive p:nth-of-type(2)');
        const eyebrow = document.querySelector('.public-eyebrow');

        const sizeOf = (el) => (el ? Number(parseFloat(window.getComputedStyle(el).fontSize).toFixed(1)) : null);
        const lhRatioOf = (el) => {
          if (!el) return null;
          const cs = window.getComputedStyle(el);
          const fs = parseFloat(cs.fontSize);
          const lh = parseFloat(cs.lineHeight);
          return Number.isFinite(lh) && fs > 0 ? Number((lh / fs).toFixed(2)) : cs.lineHeight;
        };

        const sections = {};
        for (const id of sectionIds) {
          const sec = document.getElementById(id);
          if (!sec) continue;
          const h2 = sec.querySelector('h2');
          if (!h2) continue;
          const cs = window.getComputedStyle(h2);
          const rect = h2.getBoundingClientRect();
          const fs = parseFloat(cs.fontSize);
          const lh = parseFloat(cs.lineHeight);
          const lineCount = Number.isFinite(lh) && lh > 0 ? Math.round(rect.height / lh) : null;
          sections[id] = {
            fontSize: Number(fs.toFixed(1)),
            lineHeightRatio: Number.isFinite(lh) && fs > 0 ? Number((lh / fs).toFixed(2)) : null,
            lines: lineCount,
            clipped: rect.right > window.innerWidth + 1,
          };
        }

        return {
          docOverflow,
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
          elements: {
            heroName: sizeOf(heroName),
            heroTagline: sizeOf(heroTagline),
            heroSubTagline: sizeOf(heroSubTagline),
            navItem: sizeOf(navItem),
            projectTitle: sizeOf(projectTitle),
            expCardTitle: sizeOf(expCardTitle),
            aboutBody: sizeOf(aboutBody),
            aboutBodyLh: lhRatioOf(aboutBody),
            eyebrow: sizeOf(eyebrow),
          },
          sections,
        };
      }, SECTIONS);

      report[width] = metrics;

      if (MODE === 'after') {
        assert.equal(
          metrics.docOverflow,
          false,
          `Horizontal overflow at ${width}px: scrollWidth=${metrics.scrollWidth} > innerWidth=${metrics.innerWidth}`
        );
        for (const [secId, data] of Object.entries(metrics.sections)) {
          assert.equal(data.clipped, false, `Heading clipped horizontally in #${secId} at ${width}px`);
        }
      }
    }

    if (MODE === 'after') {
      const d1440 = report[1440];
      const d1280 = report[1280];
      const d1920 = report[1920];
      // Verify Phase 2 target desktop bounds
      assert.ok(d1440.elements.heroName >= 76 && d1440.elements.heroName <= 104, `Hero name @1440=${d1440.elements.heroName}`);
      assert.ok(d1280.elements.heroName >= 76 && d1280.elements.heroName <= 104, `Hero name @1280=${d1280.elements.heroName}`);
      assert.ok(d1920.elements.heroName >= 76 && d1920.elements.heroName <= 104, `Hero name @1920=${d1920.elements.heroName}`);
      assert.ok(d1440.elements.heroTagline >= 20 && d1440.elements.heroTagline <= 25, `Hero tagline @1440=${d1440.elements.heroTagline}`);
      assert.ok(d1440.elements.projectTitle >= 25 && d1440.elements.projectTitle <= 30, `Project heading @1440=${d1440.elements.projectTitle}`);
      assert.ok(d1440.elements.expCardTitle >= 19 && d1440.elements.expCardTitle <= 22, `Card title @1440=${d1440.elements.expCardTitle}`);
      assert.ok(d1440.elements.aboutBody >= 15 && d1440.elements.aboutBody <= 16, `Body @1440=${d1440.elements.aboutBody}`);
      assert.ok(d1440.elements.navItem >= 12 && d1440.elements.navItem <= 14, `Nav @1440=${d1440.elements.navItem}`);
      assert.ok(d1440.elements.eyebrow >= 11 && d1440.elements.eyebrow <= 12, `Eyebrow @1440=${d1440.elements.eyebrow}`);

      for (const id of ['about', 'opentowork', 'experience', 'contact']) {
        assert.ok(d1440.sections[id].fontSize >= 34 && d1440.sections[id].fontSize <= 40, `Large heading #${id} @1440=${d1440.sections[id].fontSize}`);
        assert.ok(d1280.sections[id].fontSize >= 34 && d1280.sections[id].fontSize <= 40, `Large heading #${id} @1280=${d1280.sections[id].fontSize}`);
        assert.ok(d1920.sections[id].fontSize >= 34 && d1920.sections[id].fontSize <= 40, `Large heading #${id} @1920=${d1920.sections[id].fontSize}`);
      }
      for (const id of ['capabilities', 'projects', 'certifications', 'education']) {
        assert.ok(d1440.sections[id].fontSize >= 32 && d1440.sections[id].fontSize <= 38, `Section heading #${id} @1440=${d1440.sections[id].fontSize}`);
        assert.ok(d1280.sections[id].fontSize >= 32 && d1280.sections[id].fontSize <= 38, `Section heading #${id} @1280=${d1280.sections[id].fontSize}`);
        assert.ok(d1920.sections[id].fontSize >= 32 && d1920.sections[id].fontSize <= 38, `Section heading #${id} @1920=${d1920.sections[id].fontSize}`);
      }
    }

    console.log('\n--- Section h2 Font Sizes (Mobile / Tablet / Desktop) ---');
    console.table(
      Object.fromEntries(
        SECTIONS.map((id) => [
          id,
          Object.fromEntries(
            [320, 390, 600, 768, 1024, 1280, 1440, 1920].map((w) => {
              const s = report[w]?.sections[id];
              return [`${w}px`, s ? `${s.fontSize}px (${s.lines}L, lh:${s.lineHeightRatio})` : '-'];
            })
          ),
        ])
      )
    );

    console.log('\n--- Key UI Typography Elements ---');
    console.table(
      Object.fromEntries(
        ['heroName', 'heroTagline', 'heroSubTagline', 'projectTitle', 'expCardTitle', 'aboutBody', 'navItem', 'eyebrow'].map(
          (k) => [
            k,
            Object.fromEntries([390, 768, 1280, 1440, 1920].map((w) => [`${w}px`, `${report[w]?.elements?.[k]}px`])),
          ]
        )
      )
    );

    // Capture screenshots at 1440px, 1280px, 768px, 390px
    const shotTargets = [
      { w: 1440, h: 900, sections: ['hero', ...SECTIONS] },
      { w: 1280, h: 800, sections: ['hero', 'about', 'experience', 'projects'] },
      { w: 768, h: 1024, sections: ['hero', 'about', 'experience', 'capabilities'] },
      { w: 390, h: 844, sections: ['hero', ...SECTIONS] },
    ];

    for (const target of shotTargets) {
      await page.setViewportSize({ width: target.w, height: target.h });
      await page.waitForTimeout(300);
      for (const secId of target.sections) {
        if (secId === 'hero') {
          await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
        } else {
          await page.evaluate((id) => {
            const el = document.getElementById(id);
            if (el) {
              const top = el.getBoundingClientRect().top + window.scrollY - 68;
              window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
            }
          }, secId);
        }
        await page.waitForTimeout(300);
        await page.screenshot({ path: path.join(ARTIFACTS_DIR, `master_typo_${MODE}_${target.w}px_${secId}.png`) });
      }
    }

    console.log(`\nMaster typography audit (${MODE}) complete!`);
  } finally {
    await browser.close();
    server.close();
    process.exit(0);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
