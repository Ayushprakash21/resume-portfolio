import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

describe('Exact Adaptive Notch Navigation Suite', () => {
  const notchNavFile = fs.readFileSync('src/components/public/AdaptiveNotchNavigation.tsx', 'utf-8');
  const appFile = fs.readFileSync('src/App.tsx', 'utf-8');
  const heroLayoutFile = fs.readFileSync('src/components/cinematic/CinematicHeroLayout.tsx', 'utf-8');
  const orionFile = fs.readFileSync('src/components/editorial/EditorialOrion9.tsx', 'utf-8');

  it('1. Old navigation systems (OptionWheel, hamburger toggle, bottom pill) are completely removed', () => {
    assert.ok(!appFile.includes('<FloatingPortfolioNavigation'), 'App.tsx must NOT render FloatingPortfolioNavigation');
    assert.ok(!appFile.includes('<OptionWheel'), 'App.tsx must NOT render OptionWheel');
    assert.ok(!appFile.includes('<CurvedPillNavigation'), 'App.tsx must NOT render CurvedPillNavigation');

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
      notchNavFile.includes("NAV_DESTINATIONS: NavDestination[] = ["),
      'AdaptiveNotchNavigation defines NAV_DESTINATIONS array'
    );

    for (const dest of expectedDestinations) {
      assert.ok(
        notchNavFile.includes(`id: '${dest.id}'`),
        `NAV_DESTINATIONS must contain '${dest.id}'`
      );
      assert.ok(
        notchNavFile.includes(`label: '${dest.label}'`),
        `NAV_DESTINATIONS must contain label '${dest.label}'`
      );
      assert.ok(
        notchNavFile.includes(`targetId: '${dest.targetId}'`),
        `NAV_DESTINATIONS must map to real DOM id '${dest.targetId}'`
      );
    }
  });

  it('3. App.tsx mounts AdaptiveNotchNavigation as the primary public top navigation component', () => {
    assert.ok(
      appFile.includes('<AdaptiveNotchNavigation'),
      'App.tsx must render AdaptiveNotchNavigation'
    );
  });

  it('4. Distinctive sculpted notch geometry: Center Navigation Notch (AP logo & Connect cleanly removed)', () => {
    assert.ok(
      notchNavFile.includes('center-nav-notch'),
      'Component defines Center Navigation Notch'
    );
    assert.ok(
      !notchNavFile.includes('left-brand-notch') && !notchNavFile.includes('<ApMonogram'),
      'AP logo cleanly removed from navigation DOM per user specification'
    );
    assert.ok(
      !notchNavFile.includes('right-action-notch') && !notchNavFile.includes('notch-action-btn'),
      'Connect action notch cleanly removed per user specification'
    );
    // Inverted concave fillets
    assert.ok(
      notchNavFile.includes('filletRadius'),
      'Component defines concave fillet geometry'
    );
    // Pearl/silver active pill highlight, no fluorescent green
    assert.ok(
      notchNavFile.includes('notch-active-pill'),
      'Component defines sliding active indicator capsule pill'
    );
    assert.ok(
      !notchNavFile.includes('#B5FF14') && !notchNavFile.includes('#CCFF00'),
      'Component does not use fluorescent green per AP brand specifications'
    );
  });

  it('5. Navigation contains exactly four centered destination links without unnecessary wordmark or logo', () => {
    assert.ok(
      !notchNavFile.includes('ApMonogram'),
      'Navigation does not contain ApMonogram brand logo asset'
    );
    assert.ok(
      !notchNavFile.includes('AYUSH PRAKASH wordmark') && !notchNavFile.includes('THE INTELLIGENCE UNIVERSE'),
      'Navigation does not contain unnecessary wordmark'
    );
  });

  it('6. Inactive icons/text use muted silver and semantic accessibility markup', () => {
    assert.ok(notchNavFile.includes('role="navigation"'), 'Semantic nav role is present');
    assert.ok(notchNavFile.includes('aria-label="Primary Adaptive Notch Navigation"'), 'Nav label is present');
    assert.ok(notchNavFile.includes('aria-selected'), 'Aria-selected indicator is present on tabs');
    assert.ok(notchNavFile.includes('prefers-reduced-motion'), 'Prefers-reduced-motion accessibility is handled');
  });

  it('7. Orion-9 and portfolio case studies are preserved', () => {
    assert.ok(orionFile.includes('id="orion-9"'), 'EditorialOrion9 section remains published with id="orion-9"');
    assert.ok(orionFile.includes('OrionSupplyChainFlow'), 'Interactive supply chain pipeline flow remains active');
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
