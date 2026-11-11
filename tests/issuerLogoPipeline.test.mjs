import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  validateExternalHttpsUrl,
  safeFetchExternal,
  validateImagePayload,
  validateCandidateOrWebpageUrl,
  extractImageCandidatesFromHtml,
  discoverIssuerLogoCandidates,
} from '../src/worker/issuers/issuerLogoHandler.ts';
import {
  issuerService,
  isProbableWebpageUrl,
  resolveCertificationLogoPipeline,
} from '../src/services/issuerService.ts';
import { sanitizeForFirestore } from '../src/utils/firestoreSerializer.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Minimal valid 64x64 PNG binary header (Signature + IHDR chunk)
function makePngBytes(width = 64, height = 64) {
  const bytes = new Uint8Array(32);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0); // PNG signature
  bytes.set([0x00, 0x00, 0x00, 0x0d], 8); // IHDR len
  bytes.set([0x49, 0x48, 0x44, 0x52], 12); // "IHDR"
  bytes[16] = (width >>> 24) & 0xff;
  bytes[17] = (width >>> 16) & 0xff;
  bytes[18] = (width >>> 8) & 0xff;
  bytes[19] = width & 0xff;
  bytes[20] = (height >>> 24) & 0xff;
  bytes[21] = (height >>> 16) & 0xff;
  bytes[22] = (height >>> 8) & 0xff;
  bytes[23] = height & 0xff;
  return bytes;
}

describe('Issuer Logo Discovery, Validation & R2 Persistence Pipeline', () => {
  it('1. Rejects webpage URL (e.g. logos-world.net) as a direct image and extracts candidates separately', async () => {
    assert.equal(isProbableWebpageUrl('https://logos-world.net/rutgers-university-logo/'), true);
    assert.equal(isProbableWebpageUrl('https://www.rutgers.edu/sites/default/files/logo.png'), false);

    const pngBytes = makePngBytes(120, 120);
    const htmlPage = `
      <!doctype html>
      <html>
        <head>
          <meta property="og:image" content="https://cdn.example.org/rutgers-official-logo.png" />
        </head>
        <body><h1>Rutgers University Logo</h1></body>
      </html>
    `;

    const mockFetch = async (url) => {
      const target = String(url);
      if (target === 'https://logos-world.net/rutgers-university-logo/') {
        return new Response(htmlPage, {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }
      if (target === 'https://cdn.example.org/rutgers-official-logo.png') {
        return new Response(pngBytes, {
          status: 200,
          headers: { 'Content-Type': 'image/png' },
        });
      }
      return new Response('Not found', { status: 404 });
    };

    const res = await validateCandidateOrWebpageUrl(
      'https://logos-world.net/rutgers-university-logo/',
      'Rutgers University',
      mockFetch
    );

    assert.equal(res.ok, false);
    assert.equal(res.isWebpage, true);
    assert.equal(res.validationState, 'unsupported');
    assert.match(res.reason, /webpage/i);
    assert.equal(res.sourcePageUrl, 'https://logos-world.net/rutgers-university-logo/');
    assert.ok(Array.isArray(res.extractedCandidates) && res.extractedCandidates.length === 1);
    assert.equal(res.extractedCandidates[0].imageUrl, 'https://cdn.example.org/rutgers-official-logo.png');
    assert.equal(res.extractedCandidates[0].verified, true);
    assert.notEqual(res.extractedCandidates[0].imageUrl, 'https://logos-world.net/rutgers-university-logo/');
  });

  it('2. Validates genuine PNG and SVG image payloads and decodes dimensions accurately', () => {
    const pngRes = validateImagePayload(makePngBytes(256, 128), 'image/png', 'https://rutgers.edu/logo.png');
    assert.equal(pngRes.valid, true);
    assert.equal(pngRes.format, 'png');
    assert.equal(pngRes.mimeType, 'image/png');
    assert.equal(pngRes.width, 256);
    assert.equal(pngRes.height, 128);

    const svgBytes = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 60"><rect width="180" height="60"/></svg>');
    const svgRes = validateImagePayload(svgBytes, 'image/svg+xml', 'https://rutgers.edu/seal.svg');
    assert.equal(svgRes.valid, true);
    assert.equal(svgRes.format, 'svg');
    assert.equal(svgRes.width, 180);
    assert.equal(svgRes.height, 60);
  });

  it('3. Rejects HTML error responses (even when mislabeled as image/png) and broken/tiny images', async () => {
    const htmlBytes = new TextEncoder().encode('<!DOCTYPE html><html><head><title>404 Not Found</title></head></html>');
    const fakePng = validateImagePayload(htmlBytes, 'image/png', 'https://example.org/broken.png');
    assert.equal(fakePng.valid, false);
    assert.equal(fakePng.isWebpage, true);
    assert.equal(fakePng.validationState, 'unsupported');

    const trackingPixel = validateImagePayload(makePngBytes(1, 1), 'image/png', 'https://example.org/pixel.png');
    assert.equal(trackingPixel.valid, false);
    assert.equal(trackingPixel.validationState, 'failed');
    assert.match(trackingPixel.reason, /too small/i);

    const res404 = await validateCandidateOrWebpageUrl(
      'https://example.org/missing-logo.png',
      'Rutgers',
      async () => new Response('Not Found', { status: 404 })
    );
    assert.equal(res404.ok, false);
    assert.equal(res404.validationState, 'failed');
    assert.match(res404.reason, /404/);
  });

  it('4. Rejects unsupported MIME types (ICO, PDF, JSON) and unsafe SVG scripts', () => {
    const ico = validateImagePayload(new Uint8Array([0, 0, 1, 0, 1, 0]), 'image/x-icon', 'https://rutgers.edu/favicon.ico');
    assert.equal(ico.valid, false);
    assert.equal(ico.validationState, 'unsupported');

    const pdf = validateImagePayload(new TextEncoder().encode('%PDF-1.7'), 'application/pdf', 'https://rutgers.edu/doc.pdf');
    assert.equal(pdf.valid, false);
    assert.equal(pdf.validationState, 'unsupported');

    const unsafeSvg = validateImagePayload(
      new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'),
      'image/svg+xml',
      'https://example.org/evil.svg'
    );
    assert.equal(unsafeSvg.valid, false);
    assert.match(unsafeSvg.reason, /script/i);
  });

  it('5. Enforces SSRF protection across HTTPS check, internal IPs, and HTTP redirects', async () => {
    assert.equal(validateExternalHttpsUrl('http://rutgers.edu/logo.png').valid, false);
    assert.equal(validateExternalHttpsUrl('https://localhost/logo.png').valid, false);
    assert.equal(validateExternalHttpsUrl('https://127.0.0.1/logo.png').valid, false);
    assert.equal(validateExternalHttpsUrl('https://169.254.169.254/latest/meta-data').valid, false);
    assert.equal(validateExternalHttpsUrl('https://10.0.0.5/logo.png').valid, false);
    assert.equal(validateExternalHttpsUrl('https://192.168.1.10/logo.png').valid, false);
    assert.equal(validateExternalHttpsUrl('https://[::1]/logo.png').valid, false);
    assert.equal(validateExternalHttpsUrl('https://www.rutgers.edu/logo.png').valid, true);

    // Redirect pointing to internal cloud metadata IP must be blocked
    const maliciousRedirectFetch = async () =>
      new Response(null, {
        status: 302,
        headers: { Location: 'http://169.254.169.254/latest/meta-data' },
      });

    const redirected = await safeFetchExternal('https://trusted-redirect.example/logo', {
      fetchImpl: maliciousRedirectFetch,
    });
    assert.equal(redirected.ok, false);
    assert.match(redirected.reason, /redirect blocked|HTTPS/i);
  });

  it('6. Candidate selection persists to R2 with metadata on success and blocks failed uploads without losing previous logo', async () => {
    const validCandidate = {
      imageUrl: 'https://www.rutgers.edu/sites/default/files/1200x630_RSUNJ-RED.png',
      sourcePageUrl: 'https://www.rutgers.edu/',
      name: 'Rutgers University',
      domain: 'rutgers.edu',
      verified: true,
      validationState: 'verified',
    };

    const persisted = await issuerService.persistCandidateToR2(validCandidate, async (p) => ({
      storageProvider: 'cloudflare-r2',
      objectKey: 'public/certifications/issuer_rutgers_university_1234.png',
      publicUrl: '/api/storage/files/public/certifications/issuer_rutgers_university_1234.png',
      mimeType: 'image/png',
      format: 'png',
      sizeBytes: 42489,
      width: 1200,
      height: 630,
      originalSourceUrl: p.imageUrl,
      sourcePageUrl: p.sourcePageUrl || '',
      issuerDomain: p.issuerDomain || '',
      verifiedAt: '2026-11-12T00:00:00.000Z',
      uploadedAt: '2026-11-12T00:00:00.000Z',
    }));

    assert.equal(persisted.publicUrl, '/api/storage/files/public/certifications/issuer_rutgers_university_1234.png');
    assert.equal(persisted.metadata.storageProvider, 'cloudflare-r2');
    assert.equal(persisted.metadata.objectKey, 'public/certifications/issuer_rutgers_university_1234.png');
    assert.equal(persisted.metadata.issuerDomain, 'rutgers.edu');

    // Failed / unverified candidate cannot be persisted
    await assert.rejects(
      () =>
        issuerService.persistCandidateToR2({
          ...validCandidate,
          verified: false,
          validationState: 'failed',
        }),
      /unverified|failed/i
    );

    // R2 backend failure throws cleanly so UI preserves previous valid logo
    await assert.rejects(
      () =>
        issuerService.persistCandidateToR2(validCandidate, async () => {
          throw new Error('R2 head verification failed');
        }),
      /R2 head verification failed/
    );

    // Firestore serialization preserves all R2 logo metadata cleanly
    const firestorePayload = sanitizeForFirestore({
      issuer: 'Rutgers University',
      issuerLogo: persisted.publicUrl,
      issuerLogoKey: persisted.objectKey,
      issuerLogoMetadata: persisted.metadata,
      optionalUnset: undefined,
    });
    assert.equal('optionalUnset' in firestorePayload, false);
    assert.equal(firestorePayload.issuerLogoKey, persisted.objectKey);
    assert.equal(firestorePayload.issuerLogoMetadata.originalSourceUrl, validCandidate.imageUrl);
  });

  it('7. Editor preserves previous valid logo on failure & resolves R2 asset on public carousel after refresh', () => {
    const editorSrc = fs.readFileSync(path.join(rootDir, 'src/components/admin/editors/CertificationEditorModal.tsx'), 'utf8');
    assert.match(editorSrc, /Previous logo preserved/);
    assert.match(editorSrc, /Validate & Save to R2/);
    assert.match(editorSrc, /validateExternalLogoUrl/);
    assert.match(editorSrc, /persistCandidateToR2/);

    // Public carousel resolution prioritizes persisted R2 logo cleanly
    const resolved = resolveCertificationLogoPipeline({
      issuer: 'Rutgers University',
      issuerDomain: 'rutgers.edu',
      issuerLogo: '/api/storage/files/public/certifications/issuer_rutgers_university_1234.png',
      issuerLogoSource: 'upload',
      issuerLogoAlt: 'Rutgers University Official Logo',
      title: 'Supply Chain Management Specialization',
      highlightTag: 'SUPPLY CHAIN',
    });
    assert.equal(resolved.primaryUrl, '/api/storage/files/public/certifications/issuer_rutgers_university_1234.png');
    assert.equal(resolved.primarySource, 'upload');
    assert.equal(resolved.verified, true);
  });

  it('8. Discovery extracts clean direct image candidates for arbitrary institutions without returning webpage URLs', async () => {
    const mockRutgersHtml = `
      <!doctype html>
      <html>
        <head>
          <meta property="og:image" content="/sites/default/files/1200x630_RSUNJ-RED.png" />
        </head>
      </html>
    `;
    const extracted = extractImageCandidatesFromHtml(mockRutgersHtml, 'https://www.rutgers.edu/', 'Rutgers University');
    assert.deepEqual(extracted, ['https://www.rutgers.edu/sites/default/files/1200x630_RSUNJ-RED.png']);

    const mockFetch = async (url) => {
      const target = String(url);
      if (target === 'https://www.rutgers.edu' || target === 'https://www.rutgers.edu/') {
        return new Response(mockRutgersHtml, { status: 200, headers: { 'Content-Type': 'text/html' } });
      }
      if (target === 'https://www.rutgers.edu/sites/default/files/1200x630_RSUNJ-RED.png') {
        return new Response(makePngBytes(1200, 630), { status: 200, headers: { 'Content-Type': 'image/png' } });
      }
      if (target.startsWith('https://en.wikipedia.org/w/api.php')) {
        return new Response(JSON.stringify({ query: { search: [{ title: 'Rutgers University' }] } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      if (target.startsWith('https://en.wikipedia.org/api/rest_v1/page/summary/')) {
        return new Response(
          JSON.stringify({
            title: 'Rutgers University',
            thumbnail: {
              source: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f0/Rutgers_University_seal.svg/330px-Rutgers_University_seal.svg.png',
            },
            content_urls: { desktop: { page: 'https://en.wikipedia.org/wiki/Rutgers_University' } },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      if (target === 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Rutgers_University_seal.svg') {
        return new Response(
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle cx="100" cy="100" r="90"/></svg>',
          { status: 200, headers: { 'Content-Type': 'image/svg+xml' } }
        );
      }
      return new Response('Not found', { status: 404 });
    };

    const candidates = await discoverIssuerLogoCandidates('Rutgers University', { fetchImpl: mockFetch });
    const verified = candidates.filter((c) => c.verified);
    assert.ok(verified.length >= 2, 'Should verify both Wikimedia SVG and Rutgers official website PNG');
    for (const cand of verified) {
      assert.ok(cand.imageUrl.startsWith('https://'));
      assert.equal(isProbableWebpageUrl(cand.imageUrl), false);
      assert.ok(cand.sourcePageUrl.length > 0);
    }
  });
});
