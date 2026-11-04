import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

describe('P0 Global Floating Portfolio Navigation & Orion-9 Showcase Removal Suite', () => {
  const navbarFile = fs.readFileSync('src/components/public/NavbarRedesigned.tsx', 'utf-8');
  const floatingNavFile = fs.readFileSync('src/components/public/FloatingPortfolioNavigation.tsx', 'utf-8');
  const wheelFile = fs.readFileSync('src/components/reactbits/OptionWheel.tsx', 'utf-8');
  const wheelCss = fs.readFileSync('src/components/reactbits/OptionWheel.css', 'utf-8');
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

  it('2. Global FloatingPortfolioNavigation is positioned top-right with zero brackets or frames', () => {
    assert.ok(
      floatingNavFile.includes("import { OptionWheel") || floatingNavFile.includes("import OptionWheel"),
      'FloatingPortfolioNavigation must import OptionWheel'
    );
    assert.ok(
      appFile.includes('<FloatingPortfolioNavigation'),
      'App.tsx must render FloatingPortfolioNavigation in the global homepage shell'
    );
    assert.ok(
      wheelCss.includes('.floating-portfolio-navigation'),
      'OptionWheel.css must define .floating-portfolio-navigation layout'
    );
    assert.ok(
      wheelCss.includes('position: fixed') &&
        wheelCss.includes('top: 105px') &&
        wheelCss.includes('right: 4vw'),
      'Floating nav must be fixed at top: 105px and right: 4vw'
    );
    assert.ok(
      wheelCss.includes('transform: none'),
      'Floating nav must have transform: none (no vertical centering)'
    );

    // Brackets and slot indicator must be completely removed
    assert.ok(
      !wheelFile.includes('option-wheel__slot-indicator'),
      'OptionWheel.tsx must NOT contain option-wheel__slot-indicator'
    );
    assert.ok(
      !wheelCss.includes('option-wheel__slot-indicator'),
      'OptionWheel.css must NOT contain option-wheel__slot-indicator'
    );
    assert.ok(
      !wheelCss.includes("content: '['") && !wheelCss.includes("content: ']'"),
      'OptionWheel.css must NOT define bracket pseudo-content'
    );
  });

  it('3. Orion-9 Subsystem Navigator showcase has been completely removed from EditorialOrion9', () => {
    assert.ok(
      !orionFile.includes('Orion-9 Subsystem Navigator'),
      'EditorialOrion9 must NOT contain Orion-9 Subsystem Navigator showcase title'
    );
    assert.ok(
      !orionFile.includes('React Bits Component • 3D Cylindrical Reel') &&
        !orionFile.includes('React Bits Component &bull; 3D Cylindrical Reel'),
      'EditorialOrion9 must NOT contain showcase subtitle banner'
    );
    assert.ok(
      !orionFile.includes('id="orion-subsystems"'),
      'EditorialOrion9 must NOT contain orion-subsystems container'
    );
    assert.ok(
      !orionFile.includes('<OptionWheel'),
      'EditorialOrion9 must NOT contain duplicate OptionWheel showcase instance'
    );
    // Real Orion-9 content is preserved
    assert.ok(orionFile.includes('id="orion-9"'), 'EditorialOrion9 section remains published with id="orion-9"');
    assert.ok(orionFile.includes('OrionSupplyChainFlow'), 'Interactive supply chain pipeline flow remains active');
  });

  it('4. Exactly 5 portfolio navigation options exist and map to real section IDs without Orion-9', () => {
    const expectedSections = [
      { label: 'Work', targetId: 'projects', file: 'src/components/editorial/EditorialProjects.tsx' },
      { label: 'Experience', targetId: 'experience', file: 'src/components/editorial/EditorialExperience.tsx' },
      { label: 'About', targetId: 'about', file: 'src/components/editorial/EditorialAbout.tsx' },
      { label: 'Open to Work', targetId: 'opentowork', file: 'src/components/editorial/EditorialOpenToWork.tsx' },
      { label: 'Contact', targetId: 'contact', file: 'src/components/editorial/EditorialContact.tsx' },
    ];

    // Ensure Orion-9 is removed from portfolioItems
    assert.ok(
      !floatingNavFile.includes("'Orion-9'"),
      'FloatingPortfolioNavigation portfolioItems must NOT contain Orion-9'
    );
    assert.ok(
      !wheelFile.includes("{ id: 'orion9'"),
      'DEFAULT_NAV_WHEEL_ITEMS must NOT contain Orion-9'
    );

    for (const sec of expectedSections) {
      assert.ok(
        floatingNavFile.includes(`'${sec.label}'`),
        `portfolioItems must include '${sec.label}'`
      );
      const targetFileContent = fs.readFileSync(sec.file, 'utf-8');
      assert.ok(
        targetFileContent.includes(`id="${sec.targetId}"`),
        `Target file ${sec.file} must actually declare id="${sec.targetId}" in the DOM`
      );
    }
  });

  it('5. Selecting a wheel item invokes section navigation handler with onChange(index, item) API', () => {
    assert.ok(
      floatingNavFile.includes('navigateToPortfolioSection') || floatingNavFile.includes('onChange'),
      'FloatingPortfolioNavigation must define navigation callback'
    );
    assert.ok(
      floatingNavFile.includes('onChange={') && floatingNavFile.includes('navigateToPortfolioSection'),
      'FloatingPortfolioNavigation must pass onChange handler conforming to official React Bits API'
    );
    assert.ok(
      appFile.includes('<FloatingPortfolioNavigation onNavigateSection={scrollToSection} />'),
      'App.tsx must pass scrollToSection to FloatingPortfolioNavigation'
    );
  });

  it('6. OptionWheel supports keyboard navigation and accessibility standards', () => {
    assert.ok(wheelFile.includes('handleKeyDown'), 'OptionWheel implements handleKeyDown');
    assert.ok(wheelFile.includes('ArrowUp') && wheelFile.includes('ArrowDown'), 'Supports ArrowUp and ArrowDown');
    assert.ok(wheelFile.includes('ArrowLeft') && wheelFile.includes('ArrowRight'), 'Supports ArrowLeft and ArrowRight');
    assert.ok(wheelFile.includes('Home') && wheelFile.includes('End'), 'Supports Home and End keys');
    assert.ok(wheelFile.includes('Enter') && wheelFile.includes("' '"), 'Supports Enter and Space selection');
    assert.ok(wheelFile.includes('role="listbox"'), 'OptionWheel has role="listbox"');
    assert.ok(wheelFile.includes('aria-activedescendant'), 'OptionWheel has aria-activedescendant');
    assert.ok(wheelCss.includes(':focus-visible'), 'OptionWheel provides :focus-visible focus ring');
  });

  it('7. Mobile navigation provides accessible drawer without recruiter or admin pills', () => {
    assert.ok(navbarFile.includes('mobile-menu-toggle'), 'NavbarRedesigned provides mobile-menu-toggle');
    assert.ok(navbarFile.includes('mobile-nav-drawer'), 'NavbarRedesigned provides mobile-nav-drawer');
    assert.ok(!navbarFile.includes('Recruiter Brief'), 'Mobile drawer must NOT contain Recruiter Brief button');
    assert.ok(!navbarFile.includes('CMS Console'), 'Mobile drawer must NOT contain CMS Console button');
    assert.ok(wheelCss.includes('@media (max-width: 768px)'), 'OptionWheel.css provides responsive mobile behavior');
    assert.ok(navbarFile.includes("document.body.style.overflow = 'hidden'"), 'Locks body scroll when mobile drawer is open');
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
