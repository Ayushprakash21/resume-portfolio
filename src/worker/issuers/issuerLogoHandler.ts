/**
 * Server-Side Issuer Brand Discovery, Strict Image Validation, and SSRF Guard
 * Used by Cloudflare Worker routes for /api/issuers/* and /api/storage/persist-issuer-logo.
 */

export type LogoFormat = 'svg' | 'png' | 'webp' | 'jpeg';
export type CandidateSourceType =
  | 'existing_r2'
  | 'official_website'
  | 'verified_directory'
  | 'wikimedia_commons'
  | 'favicon_verified';

export type CandidateValidationState = 'loading' | 'verified' | 'failed' | 'unsupported';

export interface DiscoveredLogoCandidate {
  id: string;
  name: string;
  domain: string;
  website: string;
  sourcePageUrl: string;
  imageUrl: string;
  format: LogoFormat;
  sourceType: CandidateSourceType;
  verified: boolean;
  validationState: CandidateValidationState;
  validationMessage: string;
  mimeType: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  altText: string;
  badge: string;
}

export interface ValidatedImageResult {
  valid: boolean;
  isWebpage?: boolean;
  validationState: CandidateValidationState;
  reason: string;
  mimeType?: string;
  format?: LogoFormat;
  width?: number;
  height?: number;
  sizeBytes?: number;
}

const USER_AGENT =
  'AyushPortfolioLogoResolver/1.0 (+https://resume-portfolio.ayushprakash0021.workers.dev)';
const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB cap per issuer logo
const MAX_HTML_BYTES = 512 * 1024; // 512 KB cap for extracting page logo tags
const MAX_REDIRECTS = 3;
const DEFAULT_TIMEOUT_MS = 8000;

/**
 * Checks if an IPv4 dotted quad falls inside loopback, private, link-local,
 * CGNAT, documentation, or multicast ranges.
 */
function isPrivateOrReservedIpv4(ip: string): boolean {
  const parts = ip.split('.').map((n) => Number(n));
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
    return true;
  }
  const [a, b] = parts;
  if (a === 0) return true; // 0.0.0.0/8
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 CGNAT
  if (a === 127) return true; // 127.0.0.0/8 loopback
  if (a === 169 && b === 254) return true; // 169.254.0.0/16 link-local & cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 0 && parts[2] === 0) return true; // 192.0.0.0/24
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 198 && (b === 18 || b === 19)) return true; // 198.18.0.0/15
  if (a >= 224) return true; // multicast / reserved
  return false;
}

/**
 * Checks if an IPv6 literal targets loopback, link-local, unique-local, or mapped private IPv4.
 */
function isPrivateOrReservedIpv6(host: string): boolean {
  const clean = host.replace(/^\[|\]$/g, '').toLowerCase();
  if (!clean.includes(':')) return false;
  if (clean === '::' || clean === '::1') return true;
  if (clean.startsWith('fc') || clean.startsWith('fd')) return true; // fc00::/7 ULA
  if (clean.startsWith('fe8') || clean.startsWith('fe9') || clean.startsWith('fea') || clean.startsWith('feb')) {
    return true; // fe80::/10 link-local
  }
  const v4Mapped = clean.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (v4Mapped) {
    return isPrivateOrReservedIpv4(v4Mapped[1]);
  }
  return false;
}

/**
 * Enforces HTTPS-only external URLs and blocks SSRF, internal hostnames, private IPs, and credentials.
 */
export function validateExternalHttpsUrl(rawUrl: string): { valid: true; url: URL } | { valid: false; reason: string } {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) {
    return { valid: false, reason: 'URL is empty.' };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, reason: 'Invalid URL syntax.' };
  }

  if (parsed.protocol !== 'https:') {
    return { valid: false, reason: `Unsupported protocol "${parsed.protocol}". Only HTTPS URLs are allowed.` };
  }

  if (parsed.username || parsed.password) {
    return { valid: false, reason: 'Credentials embedded in URL are not permitted.' };
  }

  const host = parsed.hostname.toLowerCase().replace(/\.$/, '');
  if (!host || !host.includes('.')) {
    // Blocks single-label internal hostnames like "localhost", "redis", "metadata"
    if (host.startsWith('[') && host.endsWith(']')) {
      if (isPrivateOrReservedIpv6(host)) {
        return { valid: false, reason: 'Blocked private or loopback IPv6 address.' };
      }
    } else {
      return { valid: false, reason: `Blocked internal or single-label host "${host}".` };
    }
  }

  if (
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    host.endsWith('.arpa') ||
    host === 'metadata.google.internal'
  ) {
    return { valid: false, reason: `Blocked internal network hostname "${host}".` };
  }

  if (/^\d+\.\d+\.\d+\.\d+$/.test(host) && isPrivateOrReservedIpv4(host)) {
    return { valid: false, reason: `Blocked private or reserved IPv4 address "${host}".` };
  }

  if (isPrivateOrReservedIpv6(host)) {
    return { valid: false, reason: `Blocked private or loopback IPv6 address "${host}".` };
  }

  return { valid: true, url: parsed };
}

/**
 * Fetches an external HTTPS resource safely with manual redirect validation, timeout, and size limits.
 */
export async function safeFetchExternal(
  rawUrl: string,
  options?: {
    maxBytes?: number;
    timeoutMs?: number;
    maxRedirects?: number;
    accept?: string;
    fetchImpl?: typeof fetch;
  }
): Promise<
  | { ok: true; finalUrl: string; status: number; contentType: string; bytes: Uint8Array }
  | { ok: false; status?: number; reason: string; finalUrl?: string }
> {
  const maxBytes = options?.maxBytes ?? MAX_IMAGE_BYTES;
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxRedirects = options?.maxRedirects ?? MAX_REDIRECTS;
  const fetchFn = options?.fetchImpl ?? fetch;

  let currentUrl = rawUrl;
  let hops = 0;

  while (true) {
    const check = validateExternalHttpsUrl(currentUrl);
    if (!check.valid) {
      return { ok: false, reason: check.reason, finalUrl: currentUrl };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let res: Response;
    try {
      res = await fetchFn(check.url.toString(), {
        method: 'GET',
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'User-Agent': USER_AGENT,
          Accept: options?.accept || 'image/avif,image/webp,image/png,image/svg+xml,image/jpeg,*/*;q=0.8',
        },
      });
    } catch (err: any) {
      clearTimeout(timer);
      const isAbort = err?.name === 'AbortError';
      return {
        ok: false,
        reason: isAbort ? `Request timed out after ${timeoutMs}ms.` : `Network fetch error: ${err?.message || 'Failed'}`,
        finalUrl: currentUrl,
      };
    }
    clearTimeout(timer);

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location');
      if (!location) {
        return { ok: false, status: res.status, reason: `Redirect (${res.status}) missing Location header.`, finalUrl: currentUrl };
      }
      if (hops >= maxRedirects) {
        return { ok: false, status: res.status, reason: `Too many redirects (exceeded ${maxRedirects}).`, finalUrl: currentUrl };
      }
      let nextUrl: string;
      try {
        nextUrl = new URL(location, check.url).toString();
      } catch {
        return { ok: false, status: res.status, reason: 'Invalid redirect Location URL.', finalUrl: currentUrl };
      }
      const redirectCheck = validateExternalHttpsUrl(nextUrl);
      if (!redirectCheck.valid) {
        return {
          ok: false,
          status: res.status,
          reason: `Unsafe redirect target blocked: ${redirectCheck.reason}`,
          finalUrl: nextUrl,
        };
      }
      currentUrl = redirectCheck.url.toString();
      hops += 1;
      continue;
    }

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        reason: `Upstream server returned HTTP ${res.status} (${res.statusText || 'Error'}).`,
        finalUrl: currentUrl,
      };
    }

    const declaredLength = Number(res.headers.get('content-length') || '0');
    if (declaredLength > maxBytes) {
      return {
        ok: false,
        status: 413,
        reason: `Response size (${declaredLength} bytes) exceeds ${Math.round(maxBytes / 1024)} KB limit.`,
        finalUrl: currentUrl,
      };
    }

    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.byteLength === 0) {
      return { ok: false, status: res.status, reason: 'Upstream response body was empty (0 bytes).', finalUrl: currentUrl };
    }
    if (buf.byteLength > maxBytes) {
      return {
        ok: false,
        status: 413,
        reason: `Downloaded asset (${buf.byteLength} bytes) exceeds ${Math.round(maxBytes / 1024)} KB limit.`,
        finalUrl: currentUrl,
      };
    }

    return {
      ok: true,
      finalUrl: currentUrl,
      status: res.status,
      contentType: (res.headers.get('content-type') || '').split(';')[0].trim().toLowerCase(),
      bytes: buf,
    };
  }
}

function readUint32BE(bytes: Uint8Array, offset: number): number {
  return ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0;
}

function readUint16BE(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] << 8) | bytes[offset + 1];
}

function parsePngDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes.length < 24) return null;
  if (
    bytes[0] !== 0x89 ||
    bytes[1] !== 0x50 ||
    bytes[2] !== 0x4e ||
    bytes[3] !== 0x47 ||
    bytes[4] !== 0x0d ||
    bytes[5] !== 0x0a ||
    bytes[6] !== 0x1a ||
    bytes[7] !== 0x0a
  ) {
    return null;
  }
  // Chunk 0 must be IHDR
  const chunkType = String.fromCharCode(bytes[12], bytes[13], bytes[14], bytes[15]);
  if (chunkType !== 'IHDR') return null;
  return {
    width: readUint32BE(bytes, 16),
    height: readUint32BE(bytes, 20),
  };
}

function parseJpegDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) {
    return null;
  }
  let offset = 2;
  while (offset + 4 < bytes.length) {
    if (bytes[offset] !== 0xff) break;
    const marker = bytes[offset + 1];
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }
    if (marker === 0xd9 || marker === 0xda) break;
    const len = readUint16BE(bytes, offset + 2);
    if (len < 2 || offset + 2 + len > bytes.length) break;
    // SOF0..SOF3, SOF5..SOF7, SOF9..SOF11, SOF13..SOF15
    if (
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf)
    ) {
      if (offset + 9 <= bytes.length) {
        return {
          height: readUint16BE(bytes, offset + 5),
          width: readUint16BE(bytes, offset + 7),
        };
      }
      break;
    }
    offset += 2 + len;
  }
  return null;
}

function parseWebpDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes.length < 30) return null;
  const riff = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
  const webp = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
  if (riff !== 'RIFF' || webp !== 'WEBP') return null;

  const chunk = String.fromCharCode(bytes[12], bytes[13], bytes[14], bytes[15]);
  if (chunk === 'VP8X' && bytes.length >= 30) {
    const width = 1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16));
    const height = 1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16));
    return { width, height };
  }
  if (chunk === 'VP8 ' && bytes.length >= 30 && bytes[23] === 0x9d && bytes[24] === 0x01 && bytes[25] === 0x2a) {
    const width = (bytes[26] | (bytes[27] << 8)) & 0x3fff;
    const height = (bytes[28] | (bytes[29] << 8)) & 0x3fff;
    return { width, height };
  }
  if (chunk === 'VP8L' && bytes.length >= 25 && bytes[20] === 0x2f) {
    const b1 = bytes[21];
    const b2 = bytes[22];
    const b3 = bytes[23];
    const b4 = bytes[24];
    const width = 1 + (b1 | ((b2 & 0x3f) << 8));
    const height = 1 + (((b2 & 0xc0) >> 6) | (b3 << 2) | ((b4 & 0x0f) << 10));
    return { width, height };
  }
  return { width: 128, height: 128 }; // Valid WEBP header confirmed even with extended chunks
}

function parseSvgAndValidate(bytes: Uint8Array): { valid: boolean; width: number; height: number; reason?: string } {
  const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes.slice(0, 65536)).trim();
  const lower = text.toLowerCase();
  if (!lower.includes('<svg')) {
    return { valid: false, width: 0, height: 0, reason: 'SVG payload does not contain an <svg> root element.' };
  }
  if (lower.includes('<html') || lower.includes('<!doctype html')) {
    return { valid: false, width: 0, height: 0, reason: 'Payload is an HTML document rather than an SVG asset.' };
  }
  if (/<script\b/i.test(text) || /\son[a-z]+\s*=/i.test(text) || /javascript:/i.test(text) || /<foreignobject\b/i.test(text)) {
    return { valid: false, width: 0, height: 0, reason: 'SVG rejected due to unsafe embedded script or event handler.' };
  }

  const fullText = bytes.length <= 65536 ? text : new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  const svgTag = fullText.match(/<svg\b[^>]*>/i)?.[0] || '';
  const viewBoxMatch = svgTag.match(/viewBox\s*=\s*["']\s*[\d.-]+\s+[\d.-]+\s+([\d.]+)\s+([\d.]+)\s*["']/i);
  const widthAttr = svgTag.match(/\bwidth\s*=\s*["']\s*([\d.]+)/i);
  const heightAttr = svgTag.match(/\bheight\s*=\s*["']\s*([\d.]+)/i);

  const width = Math.round(Number(widthAttr?.[1] || viewBoxMatch?.[1] || '128'));
  const height = Math.round(Number(heightAttr?.[1] || viewBoxMatch?.[2] || '128'));
  return { valid: true, width, height };
}

/**
 * Validates downloaded bytes against MIME headers, magic signatures, HTML error signatures,
 * and decoded dimensions. Supports strictly SVG, PNG, WebP, and JPEG.
 */
export function validateImagePayload(
  bytes: Uint8Array,
  contentTypeHeader: string | null,
  sourceUrl: string
): ValidatedImageResult {
  const mime = (contentTypeHeader || '').split(';')[0].trim().toLowerCase();

  // Quick check for HTML / JSON error responses even if mislabeled by upstream servers
  const prefixText = new TextDecoder('utf-8', { fatal: false })
    .decode(bytes.slice(0, 512))
    .trim()
    .toLowerCase();

  if (
    mime === 'text/html' ||
    mime === 'application/xhtml+xml' ||
    prefixText.startsWith('<!doctype html') ||
    prefixText.startsWith('<html') ||
    prefixText.includes('<head>') ||
    prefixText.includes('<body')
  ) {
    return {
      valid: false,
      isWebpage: true,
      validationState: 'unsupported',
      mimeType: mime || 'text/html',
      reason: 'Response is an HTML webpage, not a direct image file.',
    };
  }

  if (mime === 'application/json' || prefixText.startsWith('{')) {
    return {
      valid: false,
      validationState: 'failed',
      mimeType: mime || 'application/json',
      reason: 'Upstream server returned JSON instead of an image.',
    };
  }

  // Explicitly check supported binary signatures first
  const pngDims = parsePngDimensions(bytes);
  if (pngDims) {
    if (pngDims.width < 16 || pngDims.height < 16) {
      return {
        valid: false,
        validationState: 'failed',
        reason: `PNG dimensions (${pngDims.width}x${pngDims.height}) are too small for a usable logo.`,
      };
    }
    if (pngDims.width > 8000 || pngDims.height > 8000) {
      return {
        valid: false,
        validationState: 'unsupported',
        reason: `PNG dimensions (${pngDims.width}x${pngDims.height}) exceed safe maximum bounds.`,
      };
    }
    return {
      valid: true,
      validationState: 'verified',
      reason: 'Verified PNG image',
      mimeType: 'image/png',
      format: 'png',
      width: pngDims.width,
      height: pngDims.height,
      sizeBytes: bytes.byteLength,
    };
  }

  const jpegDims = parseJpegDimensions(bytes);
  if (jpegDims) {
    if (jpegDims.width < 16 || jpegDims.height < 16 || jpegDims.width > 8000 || jpegDims.height > 8000) {
      return {
        valid: false,
        validationState: 'failed',
        reason: `JPEG dimensions (${jpegDims.width}x${jpegDims.height}) are out of valid bounds.`,
      };
    }
    return {
      valid: true,
      validationState: 'verified',
      reason: 'Verified JPEG image',
      mimeType: 'image/jpeg',
      format: 'jpeg',
      width: jpegDims.width,
      height: jpegDims.height,
      sizeBytes: bytes.byteLength,
    };
  }

  const webpDims = parseWebpDimensions(bytes);
  if (webpDims) {
    if (webpDims.width < 16 || webpDims.height < 16 || webpDims.width > 8000 || webpDims.height > 8000) {
      return {
        valid: false,
        validationState: 'failed',
        reason: `WebP dimensions (${webpDims.width}x${webpDims.height}) are out of valid bounds.`,
      };
    }
    return {
      valid: true,
      validationState: 'verified',
      reason: 'Verified WebP image',
      mimeType: 'image/webp',
      format: 'webp',
      width: webpDims.width,
      height: webpDims.height,
      sizeBytes: bytes.byteLength,
    };
  }

  const looksLikeSvg =
    mime === 'image/svg+xml' ||
    prefixText.startsWith('<svg') ||
    (prefixText.startsWith('<?xml') && prefixText.includes('<svg'));

  if (looksLikeSvg) {
    const svgCheck = parseSvgAndValidate(bytes);
    if (!svgCheck.valid) {
      return {
        valid: false,
        validationState: 'unsupported',
        mimeType: 'image/svg+xml',
        reason: svgCheck.reason || 'Invalid SVG image.',
      };
    }
    return {
      valid: true,
      validationState: 'verified',
      reason: 'Verified SVG vector image',
      mimeType: 'image/svg+xml',
      format: 'svg',
      width: svgCheck.width,
      height: svgCheck.height,
      sizeBytes: bytes.byteLength,
    };
  }

  const pathLower = sourceUrl.toLowerCase();
  if (mime === 'image/x-icon' || mime === 'image/vnd.microsoft.icon' || pathLower.endsWith('.ico')) {
    return {
      valid: false,
      validationState: 'unsupported',
      mimeType: mime || 'image/x-icon',
      reason: 'ICO favicon format is unsupported; only SVG, PNG, WebP, or JPEG logos are accepted.',
    };
  }

  return {
    valid: false,
    validationState: 'unsupported',
    mimeType: mime || 'application/octet-stream',
    reason: `Unsupported or undecodable image format (${mime || 'unknown MIME'}). Expected SVG, PNG, WebP, or JPEG.`,
  };
}

/**
 * Safely extracts candidate direct image URLs referenced in an HTML page
 * (og:image, apple-touch-icon, header/brand logo <img> tags). Never returns the webpage URL itself.
 */
export function extractImageCandidatesFromHtml(html: string, pageUrl: string, issuerQuery: string): string[] {
  const candidates: { url: string; score: number }[] = [];
  const seen = new Set<string>();

  const queryTokens = issuerQuery
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2 && !['university', 'institute', 'inc', 'org', 'the'].includes(t));

  const addCandidate = (rawSrc: string | undefined, baseScore: number) => {
    if (!rawSrc) return;
    const cleaned = rawSrc.replace(/&amp;/g, '&').trim();
    if (!cleaned || cleaned.startsWith('data:') || cleaned.startsWith('javascript:')) return;
    let abs: string;
    try {
      abs = new URL(cleaned, pageUrl).toString();
    } catch {
      return;
    }
    const check = validateExternalHttpsUrl(abs);
    if (!check.valid) return;
    if (seen.has(abs)) return;
    seen.add(abs);

    const lower = abs.toLowerCase();
    let score = baseScore;
    if (lower.endsWith('.svg') || lower.includes('.svg?')) score += 25;
    if (lower.endsWith('.png') || lower.includes('.png?')) score += 15;
    if (lower.includes('logo') || lower.includes('seal') || lower.includes('brand') || lower.includes('wordmark')) {
      score += 20;
    }
    for (const tok of queryTokens) {
      if (lower.includes(tok)) score += 15;
    }
    if (lower.endsWith('.ico') || lower.includes('.ico?')) return;
    candidates.push({ url: abs, score });
  };

  // 1. Meta og:image / twitter:image
  for (const m of html.matchAll(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["']/gi)) {
    addCandidate(m[1], 40);
  }
  for (const m of html.matchAll(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|twitter:image)["']/gi)) {
    addCandidate(m[1], 40);
  }

  // 2. Apple touch icons / high-res PNG icons
  for (const m of html.matchAll(/<link[^>]+rel=["'][^"']*apple-touch-icon[^"']*["'][^>]+href=["']([^"']+)["']/gi)) {
    addCandidate(m[1], 35);
  }
  for (const m of html.matchAll(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]+href=["']([^"']+)["']/gi)) {
    addCandidate(m[1], 15);
  }

  // 3. Explicit brand/logo <img> tags inside the document
  for (const m of html.matchAll(/<img[^>]+(?:src|data-src)=["']([^"']+)["'][^>]*>/gi)) {
    const tag = m[0].toLowerCase();
    const src = m[1];
    if (tag.includes('logo') || tag.includes('brand') || tag.includes('seal') || src.toLowerCase().includes('logo')) {
      addCandidate(src, 45);
    }
  }

  return candidates
    .sort((a, b) => b.score - a.score)
    .map((c) => c.url)
    .slice(0, 6);
}

/**
 * Resolves a real image URL from an admin-supplied or discovered candidate URL.
 * Rejects HTML webpages as direct images and extracts direct image URLs when applicable.
 */
export async function validateCandidateOrWebpageUrl(
  inputUrl: string,
  issuerQuery: string,
  fetchImpl: typeof fetch = fetch
): Promise<{
  ok: boolean;
  isWebpage: boolean;
  validationState: CandidateValidationState;
  reason: string;
  imageUrl?: string;
  sourcePageUrl?: string;
  domain?: string;
  format?: LogoFormat;
  mimeType?: string;
  width?: number;
  height?: number;
  sizeBytes?: number;
  extractedCandidates?: DiscoveredLogoCandidate[];
}> {
  const urlCheck = validateExternalHttpsUrl(inputUrl);
  if (!urlCheck.valid) {
    return {
      ok: false,
      isWebpage: false,
      validationState: 'unsupported',
      reason: urlCheck.reason,
    };
  }

  const fetched = await safeFetchExternal(urlCheck.url.toString(), {
    maxBytes: MAX_IMAGE_BYTES,
    fetchImpl,
  });

  if (!fetched.ok) {
    return {
      ok: false,
      isWebpage: false,
      validationState: 'failed',
      reason: fetched.reason,
    };
  }

  const validated = validateImagePayload(fetched.bytes, fetched.contentType, fetched.finalUrl);
  const parsedFinal = new URL(fetched.finalUrl);
  const domain = parsedFinal.hostname.replace(/^www\./, '');

  if (validated.valid && validated.format && validated.mimeType) {
    return {
      ok: true,
      isWebpage: false,
      validationState: 'verified',
      reason: validated.reason,
      imageUrl: fetched.finalUrl,
      sourcePageUrl: fetched.finalUrl,
      domain,
      format: validated.format,
      mimeType: validated.mimeType,
      width: validated.width,
      height: validated.height,
      sizeBytes: validated.sizeBytes,
    };
  }

  if (validated.isWebpage) {
    const html = new TextDecoder('utf-8', { fatal: false }).decode(fetched.bytes.slice(0, MAX_HTML_BYTES));
    const imageUrls = extractImageCandidatesFromHtml(html, fetched.finalUrl, issuerQuery || domain);
    const extracted: DiscoveredLogoCandidate[] = [];

    for (const imgUrl of imageUrls.slice(0, 3)) {
      const subFetch = await safeFetchExternal(imgUrl, { maxBytes: MAX_IMAGE_BYTES, fetchImpl });
      if (!subFetch.ok) continue;
      const subValid = validateImagePayload(subFetch.bytes, subFetch.contentType, subFetch.finalUrl);
      if (subValid.valid && subValid.format && subValid.mimeType) {
        const subHost = new URL(subFetch.finalUrl).hostname.replace(/^www\./, '');
        extracted.push({
          id: `extracted-${extracted.length + 1}-${subHost}`,
          name: issuerQuery || domain,
          domain: subHost,
          website: `${parsedFinal.protocol}//${parsedFinal.hostname}`,
          sourcePageUrl: fetched.finalUrl,
          imageUrl: subFetch.finalUrl,
          format: subValid.format,
          sourceType: 'official_website',
          verified: true,
          validationState: 'verified',
          validationMessage: `Extracted & verified ${subValid.format.toUpperCase()} (${subValid.width}x${subValid.height})`,
          mimeType: subValid.mimeType,
          sizeBytes: subValid.sizeBytes,
          width: subValid.width,
          height: subValid.height,
          altText: `${issuerQuery || domain} Logo`,
          badge: `Verified ${subValid.format.toUpperCase()} from Page`,
        });
      }
    }

    return {
      ok: false,
      isWebpage: true,
      validationState: 'unsupported',
      reason:
        extracted.length > 0
          ? `Provided URL (${domain}) is a webpage (${validated.mimeType}), not a direct image file. Extracted ${extracted.length} verified image candidate(s) below.`
          : `Provided URL (${domain}) is a webpage (${validated.mimeType}), not a direct image file, and no verified brand image could be extracted.`,
      sourcePageUrl: fetched.finalUrl,
      domain,
      extractedCandidates: extracted,
    };
  }

  return {
    ok: false,
    isWebpage: false,
    validationState: validated.validationState,
    reason: validated.reason,
    domain,
    mimeType: validated.mimeType,
  };
}

/**
 * Resolves official Wikipedia page summary & Wikimedia image / official domain for any organization or university.
 */
async function queryWikipediaSummary(
  query: string,
  fetchImpl: typeof fetch
): Promise<{
  title?: string;
  pageUrl?: string;
  originalImageUrl?: string;
  thumbnailUrl?: string;
} | null> {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      query
    )}&format=json&srlimit=1`;
    const searchRes = await safeFetchExternal(searchUrl, {
      maxBytes: 256 * 1024,
      timeoutMs: 5000,
      accept: 'application/json',
      fetchImpl,
    });
    if (!searchRes.ok) return null;
    const searchJson = JSON.parse(new TextDecoder().decode(searchRes.bytes));
    const title: string | undefined = searchJson?.query?.search?.[0]?.title;
    if (!title) return null;

    const sumUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      title.replace(/\s+/g, '_')
    )}`;
    const sumRes = await safeFetchExternal(sumUrl, {
      maxBytes: 256 * 1024,
      timeoutMs: 5000,
      accept: 'application/json',
      fetchImpl,
    });
    if (!sumRes.ok) return null;
    const sumJson = JSON.parse(new TextDecoder().decode(sumRes.bytes));

    const thumbUrl: string | undefined = sumJson?.thumbnail?.source;
    let origUrl: string | undefined = sumJson?.originalimage?.source;
    const wikibaseItem: string | undefined = sumJson?.wikibase_item;

    // Prefer vector SVG if thumbnail points to a Wikimedia /thumb/.../Name.svg/330px-Name.svg.png
    if (thumbUrl && thumbUrl.includes('/commons/thumb/') && thumbUrl.includes('.svg/')) {
      const m = thumbUrl.match(/^https:\/\/thumb\.wikimedia\.org\/wikipedia\/commons\/thumb\/([0-9a-f]+\/[0-9a-f]+\/[^/]+\.svg)\//i);
      if (m) {
        origUrl = `https://upload.wikimedia.org/wikipedia/commons/${m[1]}`;
      }
    }

    // If Wikibase ID exists, query official P154 logo and P856 website if available
    if (wikibaseItem && !origUrl?.endsWith('.svg')) {
      const wdUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${encodeURIComponent(
        wikibaseItem
      )}&props=claims&format=json`;
      const wdRes = await safeFetchExternal(wdUrl, {
        maxBytes: 512 * 1024,
        timeoutMs: 4500,
        accept: 'application/json',
        fetchImpl,
      });
      if (wdRes.ok) {
        const wdJson = JSON.parse(new TextDecoder().decode(wdRes.bytes));
        const claims = wdJson?.entities?.[wikibaseItem]?.claims || {};
        const p154 = claims.P154?.[0]?.mainsnak?.datavalue?.value;
        const fileTitle = typeof p154 === 'string' ? p154 : null;
        if (fileTitle) {
          const commonsApi = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(
            'File:' + fileTitle
          )}&prop=imageinfo&iiprop=url&format=json`;
          const cRes = await safeFetchExternal(commonsApi, {
            maxBytes: 128 * 1024,
            timeoutMs: 4500,
            accept: 'application/json',
            fetchImpl,
          });
          if (cRes.ok) {
            const cJson = JSON.parse(new TextDecoder().decode(cRes.bytes));
            const pages = Object.values(cJson?.query?.pages || {}) as any[];
            const p154Url = pages?.[0]?.imageinfo?.[0]?.url;
            if (p154Url) origUrl = p154Url;
          }
        }
      }
    }

    return {
      title,
      pageUrl: sumJson?.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/\s+/g, '_'))}`,
      originalImageUrl: origUrl,
      thumbnailUrl: thumbUrl,
    };
  } catch {
    return null;
  }
}

/**
 * Resolves official institutional domain using safe public signals
 * (explicit domain, university-domains-list / wikidata website, or well-known TLD resolution).
 */
async function resolveOfficialDomain(
  query: string,
  explicitDomain?: string,
  fetchImpl: typeof fetch = fetch
): Promise<{ domain: string; website: string } | null> {
  if (explicitDomain) {
    const clean = explicitDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    if (clean.includes('.')) {
      return { domain: clean, website: `https://www.${clean}` };
    }
  }

  if (query.includes('.')) {
    const clean = query.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    if (clean.includes('.')) {
      return { domain: clean, website: `https://${clean}` };
    }
  }

  const lower = query.toLowerCase().trim();
  const knownMap: Record<string, string> = {
    anthropic: 'anthropic.com',
    'google cloud': 'cloud.google.com',
    google: 'google.com',
    'deeplearning.ai': 'deeplearning.ai',
    deeplearning: 'deeplearning.ai',
    aws: 'aws.amazon.com',
    amazon: 'aws.amazon.com',
    microsoft: 'microsoft.com',
    coursera: 'coursera.org',
    ibm: 'ibm.com',
    cisco: 'cisco.com',
    rutgers: 'rutgers.edu',
    stanford: 'stanford.edu',
    harvard: 'harvard.edu',
    mit: 'mit.edu',
    'arizona state': 'asu.edu',
    asu: 'asu.edu',
    'university of pennsylvania': 'upenn.edu',
    penn: 'upenn.edu',
    databricks: 'databricks.com',
    snowflake: 'snowflake.com',
    nvidia: 'nvidia.com',
    oracle: 'oracle.com',
    salesforce: 'salesforce.com',
    pmi: 'pmi.org',
    'project management institute': 'pmi.org',
  };

  for (const [k, dom] of Object.entries(knownMap)) {
    if (lower.includes(k)) {
      return { domain: dom, website: `https://www.${dom}` };
    }
  }

  // Dynamic fallback via GitHub raw University Domains dataset or Wikipedia external website
  try {
    const cleanWiki = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      query
    )}&format=json&srlimit=1`;
    const sRes = await safeFetchExternal(cleanWiki, { maxBytes: 128 * 1024, timeoutMs: 4000, accept: 'application/json', fetchImpl });
    if (sRes.ok) {
      const sJson = JSON.parse(new TextDecoder().decode(sRes.bytes));
      const title: string | undefined = sJson?.query?.search?.[0]?.title;
      if (title) {
        const sumRes = await safeFetchExternal(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/\s+/g, '_'))}`,
          { maxBytes: 128 * 1024, timeoutMs: 4000, accept: 'application/json', fetchImpl }
        );
        if (sumRes.ok) {
          const sumJson = JSON.parse(new TextDecoder().decode(sumRes.bytes));
          const wikibaseItem: string | undefined = sumJson?.wikibase_item;
          if (wikibaseItem) {
            const wdRes = await safeFetchExternal(
              `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${encodeURIComponent(wikibaseItem)}&props=claims&format=json`,
              { maxBytes: 256 * 1024, timeoutMs: 4000, accept: 'application/json', fetchImpl }
            );
            if (wdRes.ok) {
              const wdJson = JSON.parse(new TextDecoder().decode(wdRes.bytes));
              const rawSite = wdJson?.entities?.[wikibaseItem]?.claims?.P856?.[0]?.mainsnak?.datavalue?.value;
              if (typeof rawSite === 'string' && rawSite.startsWith('https://')) {
                const parsedSite = new URL(rawSite);
                return {
                  domain: parsedSite.hostname.replace(/^www\./, ''),
                  website: rawSite,
                };
              }
            }
          }
        }
      }
    }
  } catch {
    // Ignore non-fatal dynamic lookup errors
  }

  // Reasonable domain guess for unknown institutions / organizations
  const slug = lower.replace(/[^a-z0-9]/g, '');
  if (slug.length >= 3) {
    const tld = lower.includes('university') || lower.includes('college') ? 'edu' : 'com';
    const dom = `${slug.replace(/university$/, '')}.${tld}`;
    return { domain: dom, website: `https://www.${dom}` };
  }

  return null;
}

/**
 * Discovers AND validates real direct image logo candidates for any issuer query.
 * Every returned candidate has separated `sourcePageUrl` vs validated `imageUrl`.
 */
export async function discoverIssuerLogoCandidates(
  query: string,
  options?: {
    domain?: string;
    fetchImpl?: typeof fetch;
  }
): Promise<DiscoveredLogoCandidate[]> {
  const trimmed = (query || '').trim();
  if (!trimmed) return [];

  const fetchImpl = options?.fetchImpl ?? fetch;
  const results: DiscoveredLogoCandidate[] = [];
  const seenImageUrls = new Set<string>();

  const validateAndPush = async (opts: {
    id: string;
    name: string;
    domain: string;
    website: string;
    sourcePageUrl: string;
    imageUrl: string;
    sourceType: CandidateSourceType;
    badge: string;
    minDimension?: number;
  }) => {
    if (!opts.imageUrl || seenImageUrls.has(opts.imageUrl)) return;
    seenImageUrls.add(opts.imageUrl);

    const fetched = await safeFetchExternal(opts.imageUrl, { maxBytes: MAX_IMAGE_BYTES, timeoutMs: 7000, fetchImpl });
    if (!fetched.ok) {
      results.push({
        id: opts.id,
        name: opts.name,
        domain: opts.domain,
        website: opts.website,
        sourcePageUrl: opts.sourcePageUrl,
        imageUrl: opts.imageUrl,
        format: 'png',
        sourceType: opts.sourceType,
        verified: false,
        validationState: 'failed',
        validationMessage: fetched.reason,
        mimeType: 'unknown',
        altText: `${opts.name} Logo`,
        badge: opts.badge,
      });
      return;
    }

    const validated = validateImagePayload(fetched.bytes, fetched.contentType, fetched.finalUrl);
    if (!validated.valid || !validated.format || !validated.mimeType) {
      results.push({
        id: opts.id,
        name: opts.name,
        domain: opts.domain,
        website: opts.website,
        sourcePageUrl: opts.sourcePageUrl,
        imageUrl: fetched.finalUrl,
        format: 'png',
        sourceType: opts.sourceType,
        verified: false,
        validationState: validated.validationState,
        validationMessage: validated.reason,
        mimeType: validated.mimeType || 'unknown',
        altText: `${opts.name} Logo`,
        badge: opts.badge,
      });
      return;
    }

    const minDim = opts.minDimension ?? 16;
    if ((validated.width || 0) < minDim || (validated.height || 0) < minDim) {
      results.push({
        id: opts.id,
        name: opts.name,
        domain: opts.domain,
        website: opts.website,
        sourcePageUrl: opts.sourcePageUrl,
        imageUrl: fetched.finalUrl,
        format: validated.format,
        sourceType: opts.sourceType,
        verified: false,
        validationState: 'failed',
        validationMessage: `Image dimensions (${validated.width}x${validated.height}) are too small (minimum ${minDim}x${minDim}).`,
        mimeType: validated.mimeType,
        sizeBytes: validated.sizeBytes,
        width: validated.width,
        height: validated.height,
        altText: `${opts.name} Logo`,
        badge: opts.badge,
      });
      return;
    }

    results.push({
      id: opts.id,
      name: opts.name,
      domain: opts.domain,
      website: opts.website,
      sourcePageUrl: opts.sourcePageUrl,
      imageUrl: fetched.finalUrl,
      format: validated.format,
      sourceType: opts.sourceType,
      verified: true,
      validationState: 'verified',
      validationMessage: `Verified ${validated.format.toUpperCase()} • ${validated.width}×${validated.height}`,
      mimeType: validated.mimeType,
      sizeBytes: validated.sizeBytes,
      width: validated.width,
      height: validated.height,
      altText: `${opts.name} Official Brand Logo`,
      badge: opts.badge,
    });
  };

  // Resolve official institutional/organization domain + Wikipedia/Wikimedia assets in parallel
  const [resolvedDom, wiki] = await Promise.all([
    resolveOfficialDomain(trimmed, options?.domain, fetchImpl),
    queryWikipediaSummary(trimmed, fetchImpl),
  ]);

  const domain = resolvedDom?.domain || (wiki?.pageUrl ? new URL(wiki.pageUrl).hostname : '');
  const website = resolvedDom?.website || (domain ? `https://${domain}` : '');

  // 1. Official website metadata extraction (og:image, header logo, apple-touch-icon)
  if (website) {
    const siteRes = await safeFetchExternal(website, {
      maxBytes: MAX_HTML_BYTES,
      timeoutMs: 6500,
      accept: 'text/html,application/xhtml+xml',
      fetchImpl,
    });
    if (siteRes.ok && siteRes.contentType.includes('html')) {
      const html = new TextDecoder('utf-8', { fatal: false }).decode(siteRes.bytes);
      const siteImgs = extractImageCandidatesFromHtml(html, siteRes.finalUrl, trimmed);
      // Validate up to 2 top candidates from official website
      for (let i = 0; i < Math.min(2, siteImgs.length); i++) {
        await validateAndPush({
          id: `official-${domain}-${i}`,
          name: trimmed,
          domain,
          website: siteRes.finalUrl,
          sourcePageUrl: siteRes.finalUrl,
          imageUrl: siteImgs[i],
          sourceType: 'official_website',
          badge: `Official Site (${domain})`,
          minDimension: 24,
        });
      }
    }
  }

  // 2. Wikimedia / Wikipedia official institutional seal or brand SVG/PNG
  if (wiki?.originalImageUrl) {
    await validateAndPush({
      id: `wikimedia-${domain || 'entity'}`,
      name: wiki.title || trimmed,
      domain: domain || 'wikimedia.org',
      website: website || wiki.pageUrl || 'https://commons.wikimedia.org',
      sourcePageUrl: wiki.pageUrl || 'https://commons.wikimedia.org',
      imageUrl: wiki.originalImageUrl,
      sourceType: 'wikimedia_commons',
      badge: 'Official Institutional Emblem',
      minDimension: 24,
    });
  } else if (wiki?.thumbnailUrl) {
    await validateAndPush({
      id: `wikimedia-thumb-${domain || 'entity'}`,
      name: wiki.title || trimmed,
      domain: domain || 'wikimedia.org',
      website: website || wiki.pageUrl || 'https://commons.wikimedia.org',
      sourcePageUrl: wiki.pageUrl || 'https://commons.wikimedia.org',
      imageUrl: wiki.thumbnailUrl,
      sourceType: 'wikimedia_commons',
      badge: 'Official Institutional Emblem',
      minDimension: 24,
    });
  }

  // 3. Verified High-Res Domain Icon (>= 32px so generic 16x16 globe fallback is rejected)
  if (domain && !results.some((r) => r.verified && r.format === 'svg')) {
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
    await validateAndPush({
      id: `favicon-${domain}`,
      name: trimmed,
      domain,
      website: website || `https://${domain}`,
      sourcePageUrl: website || `https://${domain}`,
      imageUrl: faviconUrl,
      sourceType: 'favicon_verified',
      badge: `Domain Icon (${domain})`,
      minDimension: 32,
    });
  }

  // Sort verified SVG/PNG candidates first, then failed diagnostics at the bottom
  return results.sort((a, b) => {
    if (a.verified !== b.verified) return a.verified ? -1 : 1;
    if (a.format === 'svg' && b.format !== 'svg') return -1;
    if (a.format !== 'svg' && b.format === 'svg') return 1;
    return 0;
  });
}
