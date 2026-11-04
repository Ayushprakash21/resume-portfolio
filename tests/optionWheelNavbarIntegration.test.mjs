import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

describe('P0 Right-Side Hero Option Wheel & Clean Header Integration Suite', () => {
  const navbarFile = fs.readFileSync('src/components/public/NavbarRedesigned.tsx', 'utf-8');
  const wheelNavFile = fs.readFileSync('src/components/cinematic/HeroOptionWheelNav.tsx', 'utf-8');
  const wheelFile = fs.readFileSync('src/components/reactbits/OptionWheel.tsx', 'utf-8');
  const wheelCss = fs.readFileSync('src/components/reactbits/OptionWheel.css', 'utf-8');
  const heroLayoutFile = fs.readFileSync('src/components/cinematic/CinematicHeroLayout.tsx', 'utf-8');
  const orionFile = fs.readFileSync('src/components/editorial/EditorialOrion9.tsx', 'utf-8');
  const appFile = fs.readFileSync('src/App.tsx', 'utf-8');

  it('1. Public header is minimal, spacious, and free of center wheels, recruiter brief, or admin buttons', () => {
    // Left brand identity is preserved
    assert.ok(navbarFile.includes('ApMonogram'), 'Header preserves AP brand monogram');
    assert.ok(navbarFile.includes('ap-header-name'), 'Header preserves AYUSH PRAKASH wordmark');

    // Horizontal wheel, recruiter button, admin button, and orion pill are removed from public header
    assert.ok(!navbarFile.includes('desktop-wheel-nav'), 'Header must not have horizontal OptionWheel in center');
    assert.ok(!navbarFile.includes('RECRUITER BRIEF'), 'Header must not have Recruiter Brief button');
    assert.ok(!navbarFile.includes('/ADMIN'), 'Header must not have /ADMIN button');
    assert.ok(!navbarFile.includes('Orion-9 Overview') && !navbarFile.includes('ORION-9'), 'Header has no obsolete Orion-9 pill');
  });

  it('2. Dedicated HeroOptionWheelNav mounts authentic React Bits Option Wheel on the far right', () => {
    assert.ok(
      wheelNavFile.includes("import { OptionWheel") || wheelNavFile.includes("import OptionWheel"),
      'HeroOptionWheelNav must import OptionWheel'
    );
    assert.ok(
      wheelNavFile.includes('<OptionWheel') && wheelNavFile.includes('DEFAULT_NAV_WHEEL_ITEMS'),
      'HeroOptionWheelNav must render OptionWheel with DEFAULT_NAV_WHEEL_ITEMS'
    );
    assert.ok(
      heroLayoutFile.includes('<HeroOptionWheelNav'),
      'CinematicHeroLayout must render HeroOptionWheelNav'
    );
    assert.ok(
      wheelCss.includes('.hero-right-wheel-dock'),
      'OptionWheel.css must define .hero-right-wheel-dock layout'
    );
    assert.ok(
      wheelCss.includes('top: 50%') && wheelCss.includes('transform: translateY(-50%)'),
      'Right dock must be vertically centered in the hero negative space'
    );
  });

  it('3. Every portfolio navigation item maps to a real section ID in the codebase', () => {
    const expectedSections = [
      { id: 'work', targetId: 'projects', file: 'src/components/editorial/EditorialProjects.tsx' },
      { id: 'orion9', targetId: 'orion-9', file: 'src/components/editorial/EditorialOrion9.tsx' },
      { id: 'experience', targetId: 'experience', file: 'src/components/editorial/EditorialExperience.tsx' },
      { id: 'about', targetId: 'about', file: 'src/components/editorial/EditorialAbout.tsx' },
      { id: 'opentowork', targetId: 'opentowork', file: 'src/components/editorial/EditorialOpenToWork.tsx' },
      { id: 'contact', targetId: 'contact', file: 'src/components/editorial/EditorialContact.tsx' },
    ];

    for (const sec of expectedSections) {
      assert.ok(
        wheelFile.includes(`targetId: '${sec.targetId}'`),
        `DEFAULT_NAV_WHEEL_ITEMS must define targetId: '${sec.targetId}'`
      );
      const targetFileContent = fs.readFileSync(sec.file, 'utf-8');
      assert.ok(
        targetFileContent.includes(`id="${sec.targetId}"`),
        `Target file ${sec.file} must actually declare id="${sec.targetId}" in the DOM`
      );
    }
  });

  it('4. Selecting a wheel item invokes section navigation handler', () => {
    assert.ok(
      wheelNavFile.includes('handleSelect') || wheelNavFile.includes('onSelect'),
      'HeroOptionWheelNav must define selection callback'
    );
    assert.ok(
      heroLayoutFile.includes('<HeroOptionWheelNav onNavigateSection={scrollTo} />') ||
        heroLayoutFile.includes('onNavigateSection='),
      'CinematicHeroLayout must connect section scroll navigation to HeroOptionWheelNav'
    );
  });

  it('5. OptionWheel supports keyboard navigation and accessibility standards', () => {
    assert.ok(wheelFile.includes('handleKeyDown'), 'OptionWheel implements handleKeyDown');
    assert.ok(wheelFile.includes('ArrowUp') && wheelFile.includes('ArrowDown'), 'Supports ArrowUp and ArrowDown');
    assert.ok(wheelFile.includes('ArrowLeft') && wheelFile.includes('ArrowRight'), 'Supports ArrowLeft and ArrowRight');
    assert.ok(wheelFile.includes('Home') && wheelFile.includes('End'), 'Supports Home and End keys');
    assert.ok(wheelFile.includes('Enter') && wheelFile.includes("' '"), 'Supports Enter and Space selection');
    assert.ok(wheelFile.includes('role="listbox"'), 'OptionWheel has role="listbox"');
    assert.ok(wheelFile.includes('aria-activedescendant'), 'OptionWheel has aria-activedescendant');
    assert.ok(wheelCss.includes(':focus-visible'), 'OptionWheel provides :focus-visible focus ring');
  });

  it('6. Mobile navigation provides accessible drawer without recruiter or admin pills', () => {
    assert.ok(navbarFile.includes('mobile-menu-toggle'), 'NavbarRedesigned provides mobile-menu-toggle');
    assert.ok(navbarFile.includes('mobile-nav-drawer'), 'NavbarRedesigned provides mobile-nav-drawer');
    assert.ok(!navbarFile.includes('Recruiter Brief'), 'Mobile drawer must NOT contain Recruiter Brief button');
    assert.ok(!navbarFile.includes('CMS Console'), 'Mobile drawer must NOT contain CMS Console button');
    assert.ok(wheelCss.includes('@media (max-width: 767px)'), 'OptionWheel.css provides responsive mobile behavior');
    assert.ok(navbarFile.includes("document.body.style.overflow = 'hidden'"), 'Locks body scroll when mobile drawer is open');
  });

  it('7. The existing Orion-9 section remains intact with authentic subsystem OptionWheel', () => {
    assert.ok(
      orionFile.includes('id="orion-9"'),
      'EditorialOrion9 section must remain published with id="orion-9"'
    );
    assert.ok(
      orionFile.includes('<OptionWheel') && orionFile.includes('DEFAULT_ORION9_ITEMS'),
      'EditorialOrion9 integrates authentic OptionWheel for Orion-9 subsystem navigation'
    );
  });

  it('8. Private /admin route remains fully accessible and authenticated', () => {
    assert.ok(
      appFile.includes("window.location.pathname.startsWith('/admin')"),
      'App.tsx handles direct /admin route navigation'
    );
    assert.ok(
      appFile.includes('<AdminLogin') && appFile.includes('<AdminConsole'),
      'App.tsx renders AdminLogin and AdminConsole on /admin'
    );
  });
});
