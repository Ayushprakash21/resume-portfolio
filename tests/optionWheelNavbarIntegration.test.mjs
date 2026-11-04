import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

describe('P0 React Bits Option Wheel Header Integration Suite', () => {
  const navbarFile = fs.readFileSync('src/components/public/NavbarRedesigned.tsx', 'utf-8');
  const wheelFile = fs.readFileSync('src/components/reactbits/OptionWheel.tsx', 'utf-8');
  const wheelCss = fs.readFileSync('src/components/reactbits/OptionWheel.css', 'utf-8');
  const heroLayoutFile = fs.readFileSync('src/components/cinematic/CinematicHeroLayout.tsx', 'utf-8');
  const orionFile = fs.readFileSync('src/components/editorial/EditorialOrion9.tsx', 'utf-8');

  it('1. NavbarRedesigned imports and renders the authentic OptionWheel component', () => {
    assert.ok(
      navbarFile.includes("import { OptionWheel") || navbarFile.includes("import OptionWheel"),
      'NavbarRedesigned must import OptionWheel'
    );
    assert.ok(
      navbarFile.includes('<OptionWheel') && navbarFile.includes('DEFAULT_NAV_WHEEL_ITEMS'),
      'NavbarRedesigned must render OptionWheel with DEFAULT_NAV_WHEEL_ITEMS'
    );
    assert.ok(
      navbarFile.includes('option-wheel--header'),
      'NavbarRedesigned must apply .option-wheel--header precision styling'
    );
  });

  it('2. Legacy Orion-9 standalone pill / dropdown is absent from the header', () => {
    assert.ok(
      !navbarFile.includes('pill-status'),
      'NavbarRedesigned must not render obsolete pill-status'
    );
    assert.ok(
      !navbarFile.includes('Orion-9 Overview') && !navbarFile.includes('ORION-9'),
      'NavbarRedesigned must not have a standalone Orion-9-only pill navigation'
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
      navbarFile.includes('handleWheelSelect'),
      'NavbarRedesigned must define handleWheelSelect callback'
    );
    assert.ok(
      navbarFile.includes('onNavigateSection') && navbarFile.includes('onSelectZone'),
      'NavbarRedesigned must support both onNavigateSection and onSelectZone callbacks'
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

  it('6. Mobile navigation is provided via responsive drawer without breaking layout', () => {
    assert.ok(navbarFile.includes('mobile-menu-toggle'), 'NavbarRedesigned provides mobile-menu-toggle');
    assert.ok(navbarFile.includes('mobile-nav-drawer'), 'NavbarRedesigned provides mobile-nav-drawer');
    assert.ok(wheelCss.includes('@media (max-width: 960px)'), 'OptionWheel hides desktop wheel on mobile screens');
    assert.ok(navbarFile.includes('document.body.style.overflow = \'hidden\''), 'Locks body scroll when mobile drawer is open');
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

  it('8. CinematicHeroLayout delegates to NavbarRedesigned with no duplicate desktop text links', () => {
    assert.ok(
      heroLayoutFile.includes('<NavbarRedesigned'),
      'CinematicHeroLayout must render NavbarRedesigned'
    );
    assert.ok(
      !heroLayoutFile.includes('<nav className="desktop-nav-links">'),
      'CinematicHeroLayout must not have duplicate desktop-nav-links text links'
    );
    assert.ok(
      !heroLayoutFile.includes('OptionWheel onSelect'),
      'CinematicHeroLayout has no obsolete pill dropdown'
    );
  });
});
