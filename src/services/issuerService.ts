import { CertificationRecord, IssuerLogoStorageMetadata, IssuerRecord } from '../types/cms';
import { storageClient } from './storage/storageClient';

export type LogoFormat = 'svg' | 'png' | 'webp' | 'jpeg';
export type CandidateSourceType =
  | 'existing_r2'
  | 'official_website'
  | 'verified_directory'
  | 'wikimedia_commons'
  | 'favicon_verified'
  | 'monogram';

export type CandidateValidationState = 'loading' | 'verified' | 'failed' | 'unsupported';

export interface IssuerCandidate {
  id: string;
  name: string;
  domain: string;
  website: string;
  sourcePageUrl: string;
  imageUrl: string;
  logoUrl: string;
  format: LogoFormat;
  logoFormat: LogoFormat;
  sourceType: CandidateSourceType;
  source: 'directory' | 'clearbit' | 'upload' | 'url' | 'monogram';
  altText: string;
  badge: string;
  verified: boolean;
  validationState: CandidateValidationState;
  validationMessage?: string;
  mimeType?: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
}

export interface CustomLogoValidationResult {
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
  extractedCandidates?: IssuerCandidate[];
}

export interface ResolvedLogoCandidate {
  url: string;
  source: 'upload' | 'directory' | 'url';
  verified: boolean;
  altText: string;
}

export interface IssuerMonogramMeta {
  initials: string;
  label: string;
  sublabel: string;
  hasExplicitIssuer: boolean;
}

export interface CertificationLogoResolution {
  candidates: ResolvedLogoCandidate[];
  primaryUrl: string | null;
  primarySource: 'upload' | 'directory' | 'url' | 'monogram';
  verified: boolean;
  hasDeprecatedUrl: boolean;
  monogram: IssuerMonogramMeta;
}

/**
 * Returns true when a URL appears to be an HTML webpage (e.g. https://logos-world.net/rutgers-university-logo/)
 * rather than a direct image file or storage delivery URL.
 */
export function isProbableWebpageUrl(rawUrl?: string | null): boolean {
  if (!rawUrl) return false;
  const trimmed = rawUrl.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false;
  try {
    const parsed = new URL(trimmed);
    const pathLower = parsed.pathname.toLowerCase();
    if (/\.(html|htm|php|asp|aspx|jsp)$/i.test(pathLower)) return true;
    // Known third-party logo webpage aggregators or trailing slash HTML pages without image params
    if (
      parsed.hostname.includes('logos-world.net') &&
      !/\.(svg|png|webp|jpg|jpeg)(\?|$)/i.test(pathLower)
    ) {
      return true;
    }
    if (pathLower.endsWith('/') && !parsed.search.includes('sz=') && !parsed.search.includes('format=')) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Curated Directory of Verified Industry Accreditation Bodies & Tech Issuers
 */
export const VERIFIED_ISSUERS_DIRECTORY: Omit<IssuerRecord, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'iss-google',
    issuerName: 'Google',
    issuerDomain: 'google.com',
    issuerWebsite: 'https://grow.google',
    logoUrl: '/issuers/google.svg',
    logoFormat: 'svg',
    logoSource: 'directory',
    altText: 'Google Official Brand Logo',
    verifiedByAdmin: true,
  },
  {
    id: 'iss-anthropic',
    issuerName: 'Anthropic',
    issuerDomain: 'anthropic.com',
    issuerWebsite: 'https://anthropic.com',
    logoUrl: '/issuers/anthropic.svg',
    logoFormat: 'svg',
    logoSource: 'directory',
    altText: 'Anthropic Official Brand Logo',
    verifiedByAdmin: true,
  },
  {
    id: 'iss-google-cloud',
    issuerName: 'Google Cloud',
    issuerDomain: 'cloud.google.com',
    issuerWebsite: 'https://cloud.google.com',
    logoUrl: '/issuers/google-cloud.svg',
    logoFormat: 'svg',
    logoSource: 'directory',
    altText: 'Google Cloud Official Brand Logo',
    verifiedByAdmin: true,
  },
  {
    id: 'iss-deeplearning-ai',
    issuerName: 'DeepLearning.AI',
    issuerDomain: 'deeplearning.ai',
    issuerWebsite: 'https://www.deeplearning.ai',
    logoUrl: '/issuers/deeplearning-ai.svg',
    logoFormat: 'svg',
    logoSource: 'directory',
    altText: 'DeepLearning.AI Official Brand Logo',
    verifiedByAdmin: true,
  },
  {
    id: 'iss-poi',
    issuerName: 'Professional Operations Institute',
    issuerDomain: 'poi-operations.org',
    issuerWebsite: 'https://poi-operations.org',
    logoUrl: '/issuers/poi.svg',
    logoFormat: 'svg',
    logoSource: 'directory',
    altText: 'Professional Operations Institute Official Crest',
    verifiedByAdmin: true,
  },
  {
    id: 'iss-aws',
    issuerName: 'Amazon Web Services',
    issuerDomain: 'aws.amazon.com',
    issuerWebsite: 'https://aws.amazon.com',
    logoUrl: '/issuers/aws.svg',
    logoFormat: 'svg',
    logoSource: 'directory',
    altText: 'AWS Official Brand Logo',
    verifiedByAdmin: true,
  },
  {
    id: 'iss-microsoft',
    issuerName: 'Microsoft',
    issuerDomain: 'microsoft.com',
    issuerWebsite: 'https://www.microsoft.com',
    logoUrl: '/issuers/microsoft.svg',
    logoFormat: 'svg',
    logoSource: 'directory',
    altText: 'Microsoft Official Brand Logo',
    verifiedByAdmin: true,
  },
  {
    id: 'iss-coursera',
    issuerName: 'Coursera',
    issuerDomain: 'coursera.org',
    issuerWebsite: 'https://www.coursera.org',
    logoUrl: '/issuers/coursera.svg',
    logoFormat: 'svg',
    logoSource: 'directory',
    altText: 'Coursera Official Brand Logo',
    verifiedByAdmin: true,
  },
  {
    id: 'iss-ibm',
    issuerName: 'IBM',
    issuerDomain: 'ibm.com',
    issuerWebsite: 'https://www.ibm.com',
    logoUrl: '/issuers/ibm.svg',
    logoFormat: 'svg',
    logoSource: 'directory',
    altText: 'IBM Official Brand Logo',
    verifiedByAdmin: true,
  },
  {
    id: 'iss-cisco',
    issuerName: 'Cisco',
    issuerDomain: 'cisco.com',
    issuerWebsite: 'https://www.cisco.com',
    logoUrl: '/issuers/cisco.svg',
    logoFormat: 'svg',
    logoSource: 'directory',
    altText: 'Cisco Systems Official Brand Logo',
    verifiedByAdmin: true,
  },
];

const KNOWN_ISSUER_DOMAIN_MAP: Record<string, string> = {
  anthropic: 'anthropic.com',
  claude: 'anthropic.com',
  'google cloud': 'cloud.google.com',
  google: 'google.com',
  deeplearning: 'deeplearning.ai',
  'deeplearning.ai': 'deeplearning.ai',
  poi: 'poi-operations.org',
  'operations institute': 'poi-operations.org',
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
  nvidia: 'nvidia.com',
  meta: 'about.meta.com',
  oracle: 'oracle.com',
  databricks: 'databricks.com',
  snowflake: 'snowflake.com',
  linux: 'linuxfoundation.org',
  kubernetes: 'kubernetes.io',
  docker: 'docker.com',
};

/**
 * Returns true if the supplied logo URL is empty, malformed, ephemeral,
 * or points to the deprecated Clearbit Logo API (logo.clearbit.com).
 */
export function isDeprecatedOrBrokenLogoUrl(url?: string | null): boolean {
  if (!url) return true;
  const trimmed = url.trim();
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null') return true;
  if (trimmed.startsWith('blob:')) return true;
  const lower = trimmed.toLowerCase();
  if (lower.includes('logo.clearbit.com')) return true;
  // Relative paths, data URIs (when non-empty), or http(s) URLs are structurally acceptable
  if (trimmed.startsWith('/') || trimmed.startsWith('https://') || trimmed.startsWith('http://') || trimmed.startsWith('data:image/')) {
    return false;
  }
  return true;
}

function normalizeDomain(domain?: string): string {
  if (!domain) return '';
  return domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0];
}

/**
 * Derives a clean, deterministic typographic monogram for any issuer or credential.
 */
export function getIssuerMonogram(
  issuer?: string,
  title?: string,
  highlightTag?: string
): IssuerMonogramMeta {
  const rawIssuer = (issuer || '').trim();
  const hasExplicitIssuer = rawIssuer.length > 0;
  const sourceText = rawIssuer || (title || '').trim() || (highlightTag || '').trim() || 'Accreditation';

  const stopWords = new Set(
    hasExplicitIssuer
      ? ['of', 'the', 'and', 'for', 'in', 'on', 'with', '&', '-']
      : ['of', 'the', 'and', 'for', 'in', 'on', 'with', '&', '-', 'certified', 'certificate', 'specialization', 'professional', 'associate', 'foundations']
  );
  const tokens = sourceText
    .replace(/[^a-zA-Z0-9\s.&]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0 && !stopWords.has(w.toLowerCase()));

  const meaningful = tokens.length > 0 ? tokens : sourceText.split(/\s+/).filter(Boolean);

  let initials = 'CR';
  if (meaningful.length === 1) {
    const word = meaningful[0].replace(/[^a-zA-Z0-9]/g, '');
    initials = word.length <= 3 ? word.toUpperCase() : word.slice(0, 2).toUpperCase();
  } else if (meaningful.length >= 2) {
    initials = meaningful
      .slice(0, 3)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  }

  return {
    initials,
    label: sourceText.toUpperCase(),
    sublabel: hasExplicitIssuer ? 'ISSUING ORGANIZATION' : 'CREDENTIAL',
    hasExplicitIssuer,
  };
}

/**
 * Finds the best verified directory entry for a certification issuer or domain.
 */
export function resolveIssuerDirectoryEntry(
  issuerName?: string,
  issuerDomain?: string,
  cmsIssuers: IssuerRecord[] = []
): Omit<IssuerRecord, 'createdAt' | 'updatedAt'> | undefined {
  const nameLower = (issuerName || '').trim().toLowerCase();
  const domainLower = normalizeDomain(issuerDomain);

  const searchPools: Omit<IssuerRecord, 'createdAt' | 'updatedAt'>[][] = [
    cmsIssuers.filter((iss) => !isDeprecatedOrBrokenLogoUrl(iss.logoUrl)),
    VERIFIED_ISSUERS_DIRECTORY,
  ];

  for (const pool of searchPools) {
    if (pool.length === 0) continue;

    // 1. Exact case-insensitive issuer name match (prevents "Google" matching "Google Cloud")
    if (nameLower) {
      const exactName = pool.find((item) => item.issuerName.trim().toLowerCase() === nameLower);
      if (exactName) return exactName;
    }

    // 2. Exact domain match
    if (domainLower) {
      const exactDomain = pool.find((item) => normalizeDomain(item.issuerDomain) === domainLower);
      if (exactDomain) return exactDomain;
    }
  }

  // 3. Alias / known brand boundary matches in curated directory
  if (nameLower) {
    const sorted = [...VERIFIED_ISSUERS_DIRECTORY].sort(
      (a, b) => b.issuerName.length - a.issuerName.length
    );
    for (const item of sorted) {
      const target = item.issuerName.toLowerCase();
      if (nameLower === target || nameLower.includes(target)) {
        return item;
      }
    }
    if (nameLower === 'aws') {
      return VERIFIED_ISSUERS_DIRECTORY.find((i) => i.id === 'iss-aws');
    }
    if (nameLower === 'poi') {
      return VERIFIED_ISSUERS_DIRECTORY.find((i) => i.id === 'iss-poi');
    }
  }

  return undefined;
}

/**
 * Resolves ordered logo candidates for a certification following strict priority:
 * 1. Explicitly uploaded issuer logo associated with the certification
 * 2. Existing verified issuer logo from CMS issuer directory
 * 3. Previously stored and valid issuer logo URL
 * 4. Verified official brand asset from built-in directory
 * 5. Designed text-based issuer monogram as final fallback
 */
export function resolveCertificationLogoPipeline(
  cert: Pick<
    CertificationRecord,
    'issuer' | 'issuerDomain' | 'issuerLogo' | 'issuerLogoSource' | 'issuerLogoAlt' | 'title' | 'highlightTag'
  >,
  cmsIssuers: IssuerRecord[] = []
): CertificationLogoResolution {
  const candidates: ResolvedLogoCandidate[] = [];
  const seenUrls = new Set<string>();

  const pushCandidate = (cand: ResolvedLogoCandidate) => {
    if (!cand.url || isDeprecatedOrBrokenLogoUrl(cand.url) || seenUrls.has(cand.url)) return;
    seenUrls.add(cand.url);
    candidates.push(cand);
  };

  const hasDeprecatedUrl = !!cert.issuerLogo && isDeprecatedOrBrokenLogoUrl(cert.issuerLogo);
  const storedIsValid = !isDeprecatedOrBrokenLogoUrl(cert.issuerLogo);
  const altFallback = cert.issuerLogoAlt || `${cert.issuer || cert.title || 'Issuer'} Official Logo`;

  // Priority 1: Explicitly uploaded issuer logo associated with the certification (or R2 storage path)
  const isExplicitUpload =
    cert.issuerLogoSource === 'upload' ||
    (!!cert.issuerLogo && cert.issuerLogo.startsWith('/api/storage/files/'));
  if (storedIsValid && isExplicitUpload && cert.issuerLogo) {
    pushCandidate({
      url: cert.issuerLogo,
      source: 'upload',
      verified: true,
      altText: altFallback,
    });
  }

  // Priority 2: Existing verified issuer logo from CMS issuer directory
  const cmsMatch = resolveIssuerDirectoryEntry(
    cert.issuer,
    cert.issuerDomain,
    cmsIssuers.filter((i) => i.verifiedByAdmin && i.logoSource !== 'clearbit')
  );
  if (cmsMatch && !isDeprecatedOrBrokenLogoUrl(cmsMatch.logoUrl)) {
    pushCandidate({
      url: cmsMatch.logoUrl,
      source: cmsMatch.logoSource === 'upload' ? 'upload' : 'directory',
      verified: !!cmsMatch.verifiedByAdmin,
      altText: cmsMatch.altText || altFallback,
    });
  }

  // Priority 3: Previously stored and valid issuer logo URL
  if (storedIsValid && cert.issuerLogo) {
    const inferredSource: 'upload' | 'directory' | 'url' =
      cert.issuerLogoSource === 'directory' || cert.issuerLogo.startsWith('/issuers/')
        ? 'directory'
        : cert.issuerLogoSource === 'upload'
        ? 'upload'
        : 'url';
    pushCandidate({
      url: cert.issuerLogo,
      source: inferredSource,
      verified: inferredSource === 'directory' || inferredSource === 'upload',
      altText: altFallback,
    });
  }

  // Priority 4: Reliable official issuer brand asset from curated SVG directory
  const builtInMatch = resolveIssuerDirectoryEntry(cert.issuer, cert.issuerDomain, []);
  if (builtInMatch && !isDeprecatedOrBrokenLogoUrl(builtInMatch.logoUrl)) {
    pushCandidate({
      url: builtInMatch.logoUrl,
      source: 'directory',
      verified: true,
      altText: builtInMatch.altText || altFallback,
    });
  }

  // Priority 5: Deterministic designed issuer monogram metadata (always available)
  const monogram = getIssuerMonogram(cert.issuer, cert.title, cert.highlightTag);
  const first = candidates[0] || null;

  return {
    candidates,
    primaryUrl: first ? first.url : null,
    primarySource: first ? first.source : 'monogram',
    verified: first ? first.verified : false,
    hasDeprecatedUrl,
    monogram,
  };
}

class IssuerService {
  /**
   * Search internal verified issuer directory
   */
  public searchDirectory(query: string, cmsIssuers: IssuerRecord[] = []): IssuerRecord[] {
    const q = query.trim().toLowerCase();
    const combined: IssuerRecord[] = [];
    const seen = new Set<string>();

    for (const item of [...cmsIssuers, ...(VERIFIED_ISSUERS_DIRECTORY as IssuerRecord[])]) {
      if (isDeprecatedOrBrokenLogoUrl(item.logoUrl)) continue;
      const key = `${item.issuerName.toLowerCase()}::${item.logoUrl}`;
      if (seen.has(key)) continue;
      seen.add(key);
      combined.push(item);
    }

    if (!q) return combined;

    return combined.filter(
      (iss) =>
        iss.issuerName.toLowerCase().includes(q) ||
        (iss.issuerDomain && iss.issuerDomain.toLowerCase().includes(q))
    );
  }

  /**
   * Resolve logo candidates following strict priority:
   * 1. Existing uploaded & verified R2 logo in CMS
   * 2. Official issuer website & Wikimedia brand assets (via server-side SSRF-safe Worker discovery)
   * 3. Curated verified brand directory (/issuers/*.svg)
   * 4. Validated external domain icons (never emitting dead Clearbit URLs or unvalidated webpage URLs)
   */
  public async resolveLogoCandidates(
    issuerQuery: string,
    cmsIssuers: IssuerRecord[] = [],
    options?: { domain?: string; skipBackend?: boolean }
  ): Promise<IssuerCandidate[]> {
    const query = issuerQuery.trim();
    if (!query) return [];

    const candidates: IssuerCandidate[] = [];
    const seenImageUrls = new Set<string>();
    const lower = query.toLowerCase();

    // 1 & 3. Existing R2-uploaded CMS issuers & Verified Local SVG Directory
    const matchedDirectory = this.searchDirectory(query, cmsIssuers).sort((a, b) => {
      const aR2 = a.logoUrl.startsWith('/api/storage/files/') ? -2 : 0;
      const bR2 = b.logoUrl.startsWith('/api/storage/files/') ? -2 : 0;
      if (aR2 !== bR2) return aR2 - bR2;
      const aExact = a.issuerName.toLowerCase() === lower ? -1 : 0;
      const bExact = b.issuerName.toLowerCase() === lower ? -1 : 0;
      return aExact - bExact;
    });

    for (const item of matchedDirectory) {
      if (!item.logoUrl || isProbableWebpageUrl(item.logoUrl) || seenImageUrls.has(item.logoUrl)) continue;
      seenImageUrls.add(item.logoUrl);

      const isR2 = item.logoUrl.startsWith('/api/storage/files/') || item.logoSource === 'upload';
      const fmt: LogoFormat = (item.logoFormat as LogoFormat) || 'svg';
      const website = item.issuerWebsite || (item.issuerDomain ? `https://${item.issuerDomain}` : '');

      candidates.push({
        id: `dir-${item.id}`,
        name: item.issuerName,
        domain: item.issuerDomain || '',
        website,
        sourcePageUrl: website || item.logoUrl,
        imageUrl: item.logoUrl,
        logoUrl: item.logoUrl,
        format: fmt,
        logoFormat: fmt,
        sourceType: isR2 ? 'existing_r2' : 'verified_directory',
        source: isR2 ? 'upload' : 'directory',
        altText: item.altText || `${item.issuerName} Official Logo`,
        badge: isR2 ? 'Verified R2 Asset' : 'Official Vector SVG',
        verified: !!item.verifiedByAdmin,
        validationState: item.verifiedByAdmin ? 'verified' : 'failed',
        validationMessage: isR2
          ? 'Existing verified R2 asset'
          : 'Verified built-in SVG asset (persists to R2 on selection)',
        mimeType: fmt === 'svg' ? 'image/svg+xml' : `image/${fmt}`,
      });
    }

    // 2 & 4. Server-side discovery & byte validation for arbitrary universities, orgs & companies
    let guessedDomain = options?.domain || '';
    if (!guessedDomain && query.includes('.')) {
      guessedDomain = normalizeDomain(query);
    } else if (!guessedDomain) {
      for (const [key, dom] of Object.entries(KNOWN_ISSUER_DOMAIN_MAP)) {
        if (lower.includes(key)) {
          guessedDomain = dom;
          break;
        }
      }
    }

    if (!options?.skipBackend && typeof window !== 'undefined' && typeof fetch === 'function') {
      try {
        const res = await fetch('/api/issuers/discover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ query, domain: guessedDomain || undefined }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.success && Array.isArray(data.candidates)) {
            for (const c of data.candidates) {
              if (!c.imageUrl || isProbableWebpageUrl(c.imageUrl) || seenImageUrls.has(c.imageUrl)) {
                continue;
              }
              seenImageUrls.add(c.imageUrl);
              candidates.push({
                id: c.id,
                name: c.name || query,
                domain: c.domain || guessedDomain,
                website: c.website || '',
                sourcePageUrl: c.sourcePageUrl || c.website || '',
                imageUrl: c.imageUrl,
                logoUrl: c.imageUrl,
                format: (c.format as LogoFormat) || 'png',
                logoFormat: (c.format as LogoFormat) || 'png',
                sourceType: c.sourceType || 'official_website',
                source: 'url',
                altText: c.altText || `${query} Brand Logo`,
                badge: c.badge || 'Official Website Asset',
                verified: !!c.verified,
                validationState: c.validationState || (c.verified ? 'verified' : 'failed'),
                validationMessage: c.validationMessage,
                mimeType: c.mimeType,
                sizeBytes: c.sizeBytes,
                width: c.width,
                height: c.height,
              });
            }
          }
        }
      } catch (err) {
        console.warn('[IssuerService] Server discovery fallback notice:', err);
      }
    }

    return candidates.sort((a, b) => {
      if (a.verified !== b.verified) return a.verified ? -1 : 1;
      const priorityScore = (s: CandidateSourceType) =>
        s === 'existing_r2'
          ? 0
          : s === 'official_website'
          ? 1
          : s === 'verified_directory'
          ? 2
          : s === 'wikimedia_commons'
          ? 3
          : 4;
      return priorityScore(a.sourceType) - priorityScore(b.sourceType);
    });
  }

  /**
   * Validates an arbitrary admin-supplied URL via backend SSRF-safe pipeline.
   * Rejects webpage URLs (e.g. HTML pages) as direct images and extracts validated image candidates if present.
   */
  public async validateExternalLogoUrl(
    inputUrl: string,
    issuerQuery = '',
    fetchImpl: typeof fetch = fetch
  ): Promise<CustomLogoValidationResult> {
    const trimmed = (inputUrl || '').trim();
    if (!trimmed) {
      return {
        ok: false,
        isWebpage: false,
        validationState: 'failed',
        reason: 'Please enter a valid HTTPS image URL.',
      };
    }

    if (!trimmed.startsWith('https://')) {
      return {
        ok: false,
        isWebpage: false,
        validationState: 'unsupported',
        reason: 'Only HTTPS URLs are permitted for external issuer logos.',
      };
    }

    const res = await fetchImpl('/api/issuers/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ url: trimmed, query: issuerQuery }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data) {
      return {
        ok: false,
        isWebpage: isProbableWebpageUrl(trimmed),
        validationState: 'failed',
        reason: data?.error || `Validation endpoint failed (HTTP ${res.status}).`,
      };
    }

    const extractedCandidates: IssuerCandidate[] = Array.isArray(data.extractedCandidates)
      ? data.extractedCandidates.map((c: any) => ({
          id: c.id,
          name: c.name || issuerQuery || data.domain || 'Issuer',
          domain: c.domain || data.domain || '',
          website: c.website || '',
          sourcePageUrl: c.sourcePageUrl || trimmed,
          imageUrl: c.imageUrl,
          logoUrl: c.imageUrl,
          format: c.format || 'png',
          logoFormat: c.format || 'png',
          sourceType: c.sourceType || 'official_website',
          source: 'url',
          altText: c.altText || `${issuerQuery || 'Issuer'} Logo`,
          badge: c.badge || 'Extracted Image',
          verified: !!c.verified,
          validationState: c.validationState || 'verified',
          validationMessage: c.validationMessage,
          mimeType: c.mimeType,
          sizeBytes: c.sizeBytes,
          width: c.width,
          height: c.height,
        }))
      : [];

    return {
      ok: !!data.ok,
      isWebpage: !!data.isWebpage,
      validationState: data.validationState || (data.ok ? 'verified' : 'failed'),
      reason: data.reason || (data.ok ? 'Verified direct image' : 'Image validation failed'),
      imageUrl: data.imageUrl,
      sourcePageUrl: data.sourcePageUrl,
      domain: data.domain,
      format: data.format,
      mimeType: data.mimeType,
      width: data.width,
      height: data.height,
      sizeBytes: data.sizeBytes,
      extractedCandidates,
    };
  }

  /**
   * Validates & persists a selected verified candidate directly into Cloudflare R2
   * via central storageClient, returning permanent R2 URL and full metadata.
   */
  public async persistCandidateToR2(
    candidate: Pick<IssuerCandidate, 'imageUrl' | 'sourcePageUrl' | 'name' | 'domain' | 'verified' | 'validationState'>,
    persistFn: typeof storageClient.persistIssuerLogo = (p) => storageClient.persistIssuerLogo(p)
  ): Promise<{
    publicUrl: string;
    objectKey: string;
    format: LogoFormat;
    metadata: IssuerLogoStorageMetadata;
  }> {
    if (!candidate.verified || candidate.validationState === 'failed' || candidate.validationState === 'unsupported') {
      throw new Error('Cannot select or store an unverified or failed logo candidate.');
    }
    if (!candidate.imageUrl || isProbableWebpageUrl(candidate.imageUrl)) {
      throw new Error('Selected candidate does not point to a valid direct image file.');
    }

    const stored = await persistFn({
      imageUrl: candidate.imageUrl,
      sourcePageUrl: candidate.sourcePageUrl,
      issuerName: candidate.name,
      issuerDomain: candidate.domain,
    });

    return {
      publicUrl: stored.publicUrl,
      objectKey: stored.objectKey,
      format: stored.format,
      metadata: {
        storageProvider: stored.storageProvider,
        objectKey: stored.objectKey,
        mimeType: stored.mimeType,
        sizeBytes: stored.sizeBytes,
        width: stored.width,
        height: stored.height,
        originalSourceUrl: stored.originalSourceUrl,
        sourcePageUrl: stored.sourcePageUrl,
        issuerDomain: stored.issuerDomain,
        verifiedAt: stored.verifiedAt,
        uploadedAt: stored.uploadedAt,
      },
    };
  }
}

export const issuerService = new IssuerService();
