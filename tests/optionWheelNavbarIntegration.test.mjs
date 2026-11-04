import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

describe('P0 Video-Reference Top-Right Glass Navigation Panel Suite', () => {
  const navbarFile = fs.readFileSync('src/components/public/NavbarRedesigned.tsx', 'utf-8');
  const indexCss = fs.readFileSync('src/styles/index.css', 'utf-8');
  const orionFile = fs.readFileSync('src/components/editorial/EditorialOrion9.tsx', 'utf-8');
  const appFile = fs.readFileSync('src/App.tsx', 'utf-8');

  it('1. Public header keeps clean navigation with menu control on right, no recruiter brief or admin buttons', () => {
    // Menu container is anchored to top-right
    assert.ok(navbarFile.includes('menuContainerRef'), 'Header contains top-right menu container');

    // Horizontal wheel, recruiter button, admin button, and orion pill are removed from public header
    assert.ok(!navbarFile.includes('desktop-wheel-nav'), 'Header must not have horizontal OptionWheel in center');
    assert.ok(!navbarFile.includes('RECRUITER BRIEF'), 'Header must not have Recruiter Brief button');
    assert.ok(!navbarFile.includes('/ADMIN'), 'Header must not have /ADMIN button');
    assert.ok(!navbarFile.includes('Orion-9 Overview') && !navbarFile.includes('ORION-9'), 'Header has no obsolete Orion-9 pill');
  });

  it('2. Option Wheel is removed from public homepage navigation', () => {
    assert.ok(
      !appFile.includes('<FloatingPortfolioNavigation'),
      'App.tsx must NOT render FloatingPortfolioNavigation'
    );
    assert.ok(
      !navbarFile.includes('<OptionWheel'),
      'NavbarRedesigned must NOT render OptionWheel'
    );
  });

  it('3. Top-right menu trigger is present and accessible on desktop and mobile', () => {
    assert.ok(
      navbarFile.includes('top-right-nav-trigger') || navbarFile.includes('mobile-menu-toggle'),
      'NavbarRedesigned must provide top-right menu trigger'
    );
    assert.ok(
      navbarFile.includes('aria-expanded') && navbarFile.includes('aria-controls'),
      'Menu trigger must define accessibility attributes aria-expanded and aria-controls'
    );
    assert.ok(
      indexCss.includes('.top-right-nav-trigger') && indexCss.includes('display: flex !important'),
      'Trigger must be visible on all viewports'
    );
  });

  it('4. Floating dark glass dropdown panel is anchored to top-right with exact 5 navigation options', () => {
    assert.ok(
      navbarFile.includes('top-right-glass-dropdown'),
      'NavbarRedesigned must define top-right-glass-dropdown'
    );
    assert.ok(
      indexCss.includes('.top-right-glass-dropdown') &&
        indexCss.includes('backdrop-filter') &&
        indexCss.includes('position: absolute'),
      'Dropdown panel has glass backdrop blur and absolute top-right anchoring'
    );

    const expectedSections = [
      { label: 'Work', targetId: 'projects', file: 'src/components/editorial/EditorialProjects.tsx' },
      { label: 'Experience', targetId: 'experience', file: 'src/components/editorial/EditorialExperience.tsx' },
      { label: 'About', targetId: 'about', file: 'src/components/editorial/EditorialAbout.tsx' },
      { label: 'Open to Work', targetId: 'opentowork', file: 'src/components/editorial/EditorialOpenToWork.tsx' },
      { label: 'Contact', targetId: 'contact', file: 'src/components/editorial/EditorialContact.tsx' },
    ];

    // Ensure Orion-9 is removed from navigation items
    assert.ok(!navbarFile.includes("'Orion-9'"), 'NAV_ITEMS must NOT contain Orion-9');

    for (const sec of expectedSections) {
      assert.ok(
        navbarFile.includes(`'${sec.label}'`),
        `NAV_ITEMS must include '${sec.label}'`
      );
      const targetFileContent = fs.readFileSync(sec.file, 'utf-8');
      assert.ok(
        targetFileContent.includes(`id="${sec.targetId}"`),
        `Target file ${sec.file} must actually declare id="${sec.targetId}" in the DOM`
      );
    }
  });

  it('5. Dropdown handles outside click, Escape key, and navigation item click', () => {
    assert.ok(navbarFile.includes('handleClickOutside'), 'Implements click outside listener');
    assert.ok(navbarFile.includes("'Escape'"), 'Implements Escape key listener');
    assert.ok(navbarFile.includes('handleNavigate'), 'Implements navigation callback');
  });

  it('6. Orion-9 section content is preserved in EditorialOrion9 without showcase banner', () => {
    assert.ok(orionFile.includes('id="orion-9"'), 'EditorialOrion9 section remains published with id="orion-9"');
    assert.ok(orionFile.includes('OrionSupplyChainFlow'), 'Interactive supply chain pipeline flow remains active');
    assert.ok(
      !orionFile.includes('Orion-9 Subsystem Navigator'),
      'EditorialOrion9 must NOT contain Orion-9 Subsystem Navigator showcase title'
    );
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
