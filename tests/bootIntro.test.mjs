import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

describe('4-Second Cinematic AP Brand Boot Animation Suite', () => {
  const bootIntroTsx = fs.readFileSync('src/components/public/BootIntro.tsx', 'utf-8');
  const bootIntroCss = fs.readFileSync('src/components/public/BootIntro.css', 'utf-8');
  const appTsx = fs.readFileSync('src/App.tsx', 'utf-8');

  it('1. BootIntro component and CSS exist and are exported cleanly', () => {
    assert.ok(fs.existsSync('src/components/public/BootIntro.tsx'), 'BootIntro.tsx must exist');
    assert.ok(fs.existsSync('src/components/public/BootIntro.css'), 'BootIntro.css must exist');
    assert.ok(bootIntroTsx.includes('export const BootIntro'), 'BootIntro component must be exported');
  });

  it('2. App.tsx mounts BootIntro at root of public portfolio', () => {
    assert.ok(appTsx.includes("import { BootIntro } from './components/public/BootIntro'"), 'App.tsx must import BootIntro');
    assert.ok(appTsx.includes('<BootIntro />'), 'App.tsx must render BootIntro');
  });

  it('3. Uses the original authentic AP logo image asset', () => {
    assert.ok(
      bootIntroTsx.includes('src="/brand/ap-transparent.png"'),
      'BootIntro must reference the authentic original /brand/ap-transparent.png asset'
    );
    assert.ok(
      fs.existsSync('public/brand/ap-transparent.png'),
      'The original AP logo asset file must exist in public/brand/'
    );
  });

  it('4. Animation timing matches 4-second sequence specifications', () => {
    assert.ok(bootIntroTsx.includes('TOTAL_DURATION_MS = 4000'), 'Total duration must be 4000ms (4 seconds)');
    assert.ok(bootIntroTsx.includes('FADE_OUT_START_MS = 3600'), 'Fade out starts at 3600ms (3.6s)');
    assert.ok(bootIntroCss.includes('bootLightSweep 1.1s'), 'Light sweep triggers during 0.7s - 1.8s window');
    assert.ok(bootIntroCss.includes('boot-intro-identity-wrapper.is-visible') || bootIntroCss.includes('bootIdentityReveal'), 'Identity reveals during 1.8s - 2.8s window');
    assert.ok(bootIntroCss.includes('bootProgressFill 0.8s'), 'Progress bar fills during 2.8s - 3.6s window');
  });

  it('5. Displays required founder name, approved gradients, and dual-typography tagline', () => {
    assert.ok(bootIntroTsx.includes('AYUSH'), 'Must render AYUSH');
    assert.ok(bootIntroTsx.includes('PRAKASH'), 'Must render PRAKASH');
    assert.ok(bootIntroTsx.includes('BUSINESS. SYSTEMS.'), 'Must render BUSINESS. SYSTEMS.');
    assert.ok(bootIntroTsx.includes('Intelligence &amp; Innovation.') || bootIntroTsx.includes('Intelligence & Innovation.'), 'Must render Intelligence & Innovation.');
    assert.ok(bootIntroTsx.includes('INITIALIZING DIGITAL EXPERIENCE'), 'Must render INITIALIZING DIGITAL EXPERIENCE');

    // Gradients
    assert.ok(bootIntroCss.includes('linear-gradient(165deg, #ffffff 0%, #e1e2e6 42%, #9296a1 100%)'), 'AYUSH metallic silver gradient');
    assert.ok(bootIntroCss.includes('linear-gradient(105deg, #f4f4f6 0%, #a8abb5 24%, #8c1524 52%, #bc3545 76%, #500a15 100%)'), 'PRAKASH silver-to-crimson gradient');
  });

  it('6. Accessibility & Session Governance: sessionStorage, prefers-reduced-motion, Skip button, and Esc key', () => {
    assert.ok(bootIntroTsx.includes("sessionStorage.getItem('ap_boot_intro_played')") || bootIntroTsx.includes('sessionStorage.getItem(SESSION_STORAGE_KEY)'), 'Checks sessionStorage');
    assert.ok(bootIntroTsx.includes("sessionStorage.setItem(SESSION_STORAGE_KEY, 'true')"), 'Sets sessionStorage once played');
    assert.ok(bootIntroTsx.includes('prefers-reduced-motion'), 'Checks prefers-reduced-motion in JS');
    assert.ok(bootIntroCss.includes('@media (prefers-reduced-motion: reduce)'), 'Overrides styles in CSS for reduced motion');
    assert.ok(bootIntroTsx.includes('Skip Intro'), 'Renders accessible Skip button');
    assert.ok(bootIntroTsx.includes("e.key === 'Escape'"), 'Escape key skips intro immediately');
    assert.ok(bootIntroTsx.includes('__replayBootIntro'), 'Exposes development replay helper');
  });

  it('7. Color palette strictly conforms to Black Luxury / Crimson specification', () => {
    assert.ok(bootIntroCss.includes('#080809'), 'Palette background #080809');
    assert.ok(bootIntroCss.includes('#781E31') || bootIntroCss.includes('rgba(120, 30, 49'), 'Palette crimson #781E31 / rgba(120, 30, 49)');
    assert.ok(bootIntroCss.includes('#D5D2D6') || bootIntroCss.includes('#e1e2e6'), 'Palette metallic silver');
    assert.ok(bootIntroCss.includes('#F3F1F2') || bootIntroCss.includes('#ffffff'), 'Palette primary text');

    // Reject disallowed aesthetics
    assert.ok(!bootIntroCss.includes('#00ff00'), 'Rejects neon green');
    assert.ok(!bootIntroCss.includes('#00ffff'), 'Rejects bright cyan');
  });
});
