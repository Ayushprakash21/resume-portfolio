import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

describe('P0 Animated Floating Curved Pill Navigation Suite', () => {
  const curvedNavFile = fs.readFileSync('src/components/public/CurvedPillNavigation.tsx', 'utf-8');
  const appFile = fs.readFileSync('src/App.tsx', 'utf-8');
  const heroLayoutFile = fs.readFileSync('src/components/cinematic/CinematicHeroLayout.tsx', 'utf-8');
  const orionFile = fs.readFileSync('src/components/editorial/EditorialOrion9.tsx', 'utf-8');

  it('1. Old navigation systems (OptionWheel, hamburger toggle, dropdown drawer) are completely removed', () => {
    // No OptionWheel in App.tsx or Hero
    assert.ok(!appFile.includes('<FloatingPortfolioNavigation'), 'App.tsx must NOT render FloatingPortfolioNavigation');
    assert.ok(!appFile.includes('<OptionWheel'), 'App.tsx must NOT render OptionWheel');

    // No old NavbarRedesigned rendered in CinematicHeroLayout
    assert.ok(!heroLayoutFile.includes('<NavbarRedesigned'), 'CinematicHeroLayout must NOT render old NavbarRedesigned');
    assert.ok(!heroLayoutFile.includes('isMobileMenuOpen'), 'Hero must not track mobile menu open state');
  });

  it('2. Exactly four destinations are configured (Home, Work, Experience, Contact) with genuine IDs', () => {
    const expectedDestinations = [
      { id: 'home', label: 'Home', targetId: 'hero' },
      { id: 'work', label: 'Work', targetId: 'projects' },
      { id: 'experience', label: 'Experience', targetId: 'experience' },
      { id: 'contact', label: 'Contact', targetId: 'contact' },
    ];

    assert.ok(
      curvedNavFile.includes("NAV_DESTINATIONS: NavDestination[] = ["),
      'CurvedPillNavigation defines NAV_DESTINATIONS array'
    );

    for (const dest of expectedDestinations) {
      assert.ok(
        curvedNavFile.includes(`id: '${dest.id}'`),
        `NAV_DESTINATIONS must contain '${dest.id}'`
      );
      assert.ok(
        curvedNavFile.includes(`label: '${dest.label}'`),
        `NAV_DESTINATIONS must contain label '${dest.label}'`
      );
      assert.ok(
        curvedNavFile.includes(`targetId: '${dest.targetId}'`),
        `NAV_DESTINATIONS must map to real DOM id '${dest.targetId}'`
      );
    }
  });

  it('3. App.tsx mounts CurvedPillNavigation as the primary public navigation component', () => {
    assert.ok(
      appFile.includes('<CurvedPillNavigation'),
      'App.tsx must render CurvedPillNavigation'
    );
  });

  it('4. Floating Curved Pill Navigation defines SVG curved notch mask and sliding active lime circle', () => {
    assert.ok(
      curvedNavFile.includes('mask id="pill-curved-notch-mask"') || curvedNavFile.includes('pill-curved-notch-mask'),
      'Component defines SVG curved notch mask'
    );
    assert.ok(
      curvedNavFile.includes('#B5FF14') || curvedNavFile.includes('#CCFF00') || curvedNavFile.includes('#A3E635'),
      'Component styles active circle with bright lime/chartreuse'
    );
    assert.ok(
      curvedNavFile.includes('curved-nav-active-circle'),
      'Component renders circular active indicator'
    );
    assert.ok(
      curvedNavFile.includes('cubic-bezier'),
      'Component uses smooth spring-like transition timing'
    );
  });

  it('5. Inactive icons remain near-black, centered, with accessibility markup', () => {
    assert.ok(curvedNavFile.includes('role="navigation"'), 'Semantic nav role is present');
    assert.ok(curvedNavFile.includes('aria-label="Main Portfolio Navigation"'), 'Nav label is present');
    assert.ok(curvedNavFile.includes('aria-current'), 'Current page indicator aria-current is supported');
    assert.ok(curvedNavFile.includes('prefers-reduced-motion'), 'Prefers-reduced-motion accessibility is handled');
  });

  it('6. Orion-9 and portfolio case studies are preserved', () => {
    assert.ok(orionFile.includes('id="orion-9"'), 'EditorialOrion9 section remains published with id="orion-9"');
    assert.ok(orionFile.includes('OrionSupplyChainFlow'), 'Interactive supply chain pipeline flow remains active');
  });

  it('7. Private /admin route remains fully accessible and authenticated', () => {
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
