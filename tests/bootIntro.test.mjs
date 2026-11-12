import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

describe('Cinematic AP Logo Video Boot Intro Suite', () => {
  const bootIntroTsx = fs.readFileSync('src/components/public/BootIntro.tsx', 'utf-8');
  const bootIntroCss = fs.readFileSync('src/components/public/BootIntro.css', 'utf-8');
  const appTsx = fs.readFileSync('src/App.tsx', 'utf-8');
  const indexHtml = fs.readFileSync('index.html', 'utf-8');

  it('1. BootIntro component and CSS exist and are exported cleanly', () => {
    assert.ok(fs.existsSync('src/components/public/BootIntro.tsx'), 'BootIntro.tsx must exist');
    assert.ok(fs.existsSync('src/components/public/BootIntro.css'), 'BootIntro.css must exist');
    assert.ok(bootIntroTsx.includes('export const BootIntro'), 'BootIntro component must be exported');
  });

  it('2. App.tsx mounts BootIntro at root of public portfolio', () => {
    assert.ok(appTsx.includes("import { BootIntro } from './components/public/BootIntro'"), 'App.tsx must import BootIntro');
    assert.ok(appTsx.includes('<BootIntro />'), 'App.tsx must render BootIntro');
  });

  it('3. Real HTML5 video element with MP4, WebM sources, poster and fallback image', () => {
    assert.ok(bootIntroTsx.includes('<video'), 'Must contain HTML5 video tag');
    assert.ok(bootIntroTsx.includes('src="/brand/ap-logo-intro.webm"'), 'Must specify WebM source');
    assert.ok(bootIntroTsx.includes('src="/brand/ap-logo-intro.mp4"'), 'Must specify MP4 source');
    assert.ok(bootIntroTsx.includes('poster="/brand/ap-logo-poster.jpg"'), 'Must specify poster attribute');
    assert.ok(bootIntroTsx.includes('autoPlay'), 'Video must autoplay');
    assert.ok(bootIntroTsx.includes('muted'), 'Video must be muted');
    assert.ok(bootIntroTsx.includes('playsInline'), 'Video must play inline');
    assert.ok(!bootIntroTsx.includes('controls='), 'Must not display default browser controls');
    assert.ok(bootIntroTsx.includes('src="/brand/ap-transparent.png"'), 'Must include fallback static AP logo');

    // File existence on disk
    assert.ok(fs.existsSync('public/brand/ap-logo-intro.mp4'), 'ap-logo-intro.mp4 must exist');
    assert.ok(fs.existsSync('public/brand/ap-logo-intro.webm'), 'ap-logo-intro.webm must exist');
    assert.ok(fs.existsSync('public/brand/ap-logo-poster.jpg'), 'ap-logo-poster.jpg must exist');
    assert.ok(fs.existsSync('public/brand/ap-transparent.png'), 'ap-transparent.png fallback must exist');
    assert.ok(indexHtml.includes('href="/brand/ap-logo-poster.jpg"'), 'index.html preloads video poster');
  });

  it('4. Seamless visual integration: feathered edge mask prevents rectangular video borders', () => {
    assert.ok(bootIntroCss.includes('-webkit-mask-image: radial-gradient'), 'CSS defines feathered webkit radial mask');
    assert.ok(bootIntroCss.includes('mask-image: radial-gradient'), 'CSS defines feathered standard radial mask');
    assert.ok(bootIntroCss.includes('aspect-ratio: 896 / 576'), 'CSS maintains exact 896/576 video aspect ratio');
    assert.ok(bootIntroCss.includes('object-fit: contain'), 'Video maintains contain object-fit');
  });

  it('5. Displays required founder name, approved gradients, and two-stage tagline', () => {
    assert.ok(bootIntroTsx.includes('AYUSH'), 'Must render AYUSH');
    assert.ok(bootIntroTsx.includes('PRAKASH'), 'Must render PRAKASH');
    assert.ok(bootIntroTsx.includes('BUSINESS. SYSTEMS.'), 'Must render BUSINESS. SYSTEMS.');
    assert.ok(bootIntroTsx.includes('Intelligence &amp; Innovation.') || bootIntroTsx.includes('Intelligence & Innovation.'), 'Must render Intelligence & Innovation.');
    assert.ok(bootIntroTsx.includes('INITIALIZING DIGITAL EXPERIENCE'), 'Must render INITIALIZING DIGITAL EXPERIENCE');

    // Gradients
    assert.ok(bootIntroCss.includes('linear-gradient(165deg, #ffffff 0%, #e1e2e6 42%, #9296a1 100%)'), 'AYUSH metallic silver gradient');
    assert.ok(bootIntroCss.includes('linear-gradient(105deg, #f4f4f6 0%, #a8abb5 24%, #8c1524 52%, #bc3545 76%, #500a15 100%)'), 'PRAKASH silver-to-crimson gradient');
  });

  it('6. Accessibility & Session Governance: sessionStorage ap_intro_seen_v1, prefers-reduced-motion, Skip button, and Esc key', () => {
    assert.ok(bootIntroTsx.includes('ap_intro_seen_v1'), 'Uses versioned session key ap_intro_seen_v1');
    assert.ok(bootIntroTsx.includes('ap_boot_intro_played'), 'Maintains backward compatibility with legacy session key');
    assert.ok(bootIntroTsx.includes('sessionStorage.getItem'), 'Checks sessionStorage');
    assert.ok(bootIntroTsx.includes('sessionStorage.setItem'), 'Sets sessionStorage on load and exit');
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

  it('8. Intro typography consumes approved hero name and body/serif font stacks without Benzinova Thin', () => {
    assert.ok(
      bootIntroCss.includes("font-family: var(--font-hero-name, 'Orenza Bold', 'Orenza', 'Manrope'"),
      'boot-intro-founder-name must use approved hero name font stack'
    );
    assert.ok(
      bootIntroCss.includes('.boot-intro-tagline-heading') &&
      bootIntroCss.includes("font-family: var(--font-body, 'Manrope'"),
      'boot-intro-tagline-heading must use approved body font stack'
    );
    assert.ok(
      bootIntroCss.includes('.boot-intro-tagline-sub') &&
      bootIntroCss.includes("font-family: var(--font-serif, 'Cormorant Garamond'"),
      'boot-intro-tagline-sub must use approved serif font stack'
    );
    assert.ok(
      !bootIntroCss.includes('.boot-intro-founder-name {\n  font-family: var(--font-display)'),
      'boot-intro-founder-name must not use global Benzinova Thin heading font'
    );
  });

  it('9. Responsive breakpoints: 320px, 360px, 480px, 768px, desktop', () => {
    assert.ok(bootIntroCss.includes('@media (max-width: 768px)'), 'Mobile tablet media query');
    assert.ok(bootIntroCss.includes('@media (max-width: 480px)'), 'Mobile smartphone media query');
    assert.ok(bootIntroCss.includes('@media (max-width: 360px)'), 'Compact mobile media query');
  });
});
