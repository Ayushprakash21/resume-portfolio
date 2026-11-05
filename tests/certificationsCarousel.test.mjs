import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Certifications Issuer Branding & Circular Carousel Suite', () => {
  it('1. CircularCarousel component and CSS are present and exported', () => {
    const componentPath = path.join(rootDir, 'src/components/reactbits/CircularCarousel.tsx');
    const cssPath = path.join(rootDir, 'src/components/reactbits/CircularCarousel.css');
    const indexPath = path.join(rootDir, 'src/components/reactbits/index.ts');

    assert.ok(fs.existsSync(componentPath), 'CircularCarousel.tsx must exist');
    assert.ok(fs.existsSync(cssPath), 'CircularCarousel.css must exist');

    const componentContent = fs.readFileSync(componentPath, 'utf8');
    assert.match(componentContent, /export (function|default) CircularCarousel/);
    assert.match(componentContent, /preset/);
    assert.match(componentContent, /cylinder/);
    assert.match(componentContent, /speed/);
    assert.match(componentContent, /gap/);
    assert.match(componentContent, /parallax/);

    const indexContent = fs.readFileSync(indexPath, 'utf8');
    assert.match(indexContent, /CircularCarousel/);
  });

  it('2. Issuer logo SVG assets are present in public/issuers/', () => {
    const requiredLogos = [
      'anthropic.svg',
      'google-cloud.svg',
      'deeplearning-ai.svg',
      'poi.svg',
      'aws.svg',
      'microsoft.svg',
      'coursera.svg',
      'ibm.svg',
      'cisco.svg'
    ];

    for (const logo of requiredLogos) {
      const logoPath = path.join(rootDir, 'public/issuers', logo);
      assert.ok(fs.existsSync(logoPath), `Issuer logo ${logo} must exist`);
      const content = fs.readFileSync(logoPath, 'utf8');
      assert.ok(content.length > 50, `Issuer logo ${logo} must not be empty`);
      assert.match(content, /<svg/i, `Issuer logo ${logo} must contain SVG markup`);
    }
  });

  it('3. issuerService contains verified directory and candidate resolution', () => {
    const servicePath = path.join(rootDir, 'src/services/issuerService.ts');
    assert.ok(fs.existsSync(servicePath), 'issuerService.ts must exist');

    const content = fs.readFileSync(servicePath, 'utf8');
    assert.match(content, /VERIFIED_ISSUERS_DIRECTORY/);
    assert.match(content, /resolveLogoCandidates/);
    assert.match(content, /Anthropic/i);
    assert.match(content, /Google Cloud/i);
    assert.match(content, /DeepLearning\.AI/i);
    assert.match(content, /Professional Operations Institute/i);
  });

  it('4. CertificationEditorModal includes dedicated Issuer Logo Search and discovery', () => {
    const editorPath = path.join(rootDir, 'src/components/admin/editors/CertificationEditorModal.tsx');
    assert.ok(fs.existsSync(editorPath), 'CertificationEditorModal.tsx must exist');

    const content = fs.readFileSync(editorPath, 'utf8');
    assert.match(content, /Issuer & Brand Identity Search|Issuer Logo/i);
    assert.match(content, /resolveLogoCandidates/);
    assert.match(content, /issuerWebsite/);
    assert.match(content, /issuerLogo/);
    assert.match(content, /issuerLogoSource/);
    assert.match(content, /storageClient\.uploadFile/);
    assert.match(content, /Live Circular Carousel Card Preview/i);
  });

  it('5. EditorialCertifications integrates CircularCarousel and BorderGlow', () => {
    const editorialPath = path.join(rootDir, 'src/components/editorial/EditorialCertifications.tsx');
    assert.ok(fs.existsSync(editorialPath), 'EditorialCertifications.tsx must exist');

    const content = fs.readFileSync(editorialPath, 'utf8');
    assert.match(content, /CircularCarousel/);
    assert.match(content, /BorderGlow/);
    assert.match(content, /cardWidth=\{300\}/);
    assert.match(content, /cardHeight=\{410\}/);
    assert.match(content, /speed=\{3\.8\}/);
    assert.match(content, /gap=\{48\}/);
    assert.match(content, /Inspect Credential/);
    assert.match(content, /activeCert/);
  });

  it('6. CMS types and services persist issuer fields and IssuerRecord', () => {
    const typesPath = path.join(rootDir, 'src/types/cms.ts');
    const typesContent = fs.readFileSync(typesPath, 'utf8');
    assert.match(typesContent, /export interface IssuerRecord/);
    assert.match(typesContent, /issuerWebsite\?:/);
    assert.match(typesContent, /issuerLogo\?:/);

    const cmsPath = path.join(rootDir, 'src/services/cmsService.ts');
    const cmsContent = fs.readFileSync(cmsPath, 'utf8');
    assert.match(cmsContent, /getIssuers/);
    assert.match(cmsContent, /saveIssuer/);
    assert.match(cmsContent, /findIssuer/);
  });
});
