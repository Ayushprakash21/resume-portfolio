import { CertificationRecord, IssuerRecord } from '../types/cms';

export interface IssuerCandidate {
  id: string;
  name: string;
  domain: string;
  website: string;
  logoUrl: string;
  logoFormat: 'svg' | 'png' | 'webp';
  source: 'directory' | 'clearbit' | 'upload' | 'url' | 'monogram';
  altText: string;
  badge: string;
  verified: boolean;
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
   * Resolve logo candidates across CMS directory, verified local vector SVG assets,
   * and optional website icon fallback (never emitting dead Clearbit URLs).
   */
  public async resolveLogoCandidates(
    issuerQuery: string,
    cmsIssuers: IssuerRecord[] = []
  ): Promise<IssuerCandidate[]> {
    const query = issuerQuery.trim();
    if (!query) return [];

    const candidates: IssuerCandidate[] = [];
    const lower = query.toLowerCase();

    // 1. Check CMS + verified local SVG directory (sorted with exact match first)
    const matchedDirectory = this.searchDirectory(query, cmsIssuers).sort((a, b) => {
      const aExact = a.issuerName.toLowerCase() === lower ? -1 : 0;
      const bExact = b.issuerName.toLowerCase() === lower ? -1 : 0;
      return aExact - bExact;
    });

    for (const item of matchedDirectory) {
      candidates.push({
        id: `dir-${item.id}`,
        name: item.issuerName,
        domain: item.issuerDomain || '',
        website: item.issuerWebsite || `https://${item.issuerDomain}`,
        logoUrl: item.logoUrl,
        logoFormat: item.logoFormat || 'svg',
        source: item.logoSource === 'upload' ? 'upload' : 'directory',
        altText: item.altText,
        badge: item.logoSource === 'upload' ? 'Verified R2 Upload' : 'Official Vector SVG',
        verified: !!item.verifiedByAdmin,
      });
    }

    // 2. Derive canonical domain if user typed a domain or known institution/company
    let guessedDomain = '';
    if (query.includes('.')) {
      guessedDomain = normalizeDomain(query);
    } else {
      for (const [key, dom] of Object.entries(KNOWN_ISSUER_DOMAIN_MAP)) {
        if (lower.includes(key)) {
          guessedDomain = dom;
          break;
        }
      }
    }

    // 3. Offer domain icon candidate ONLY as an explicitly unverified external fallback when no verified SVG exists
    if (guessedDomain && candidates.length === 0) {
      candidates.push({
        id: `favicon-${guessedDomain}`,
        name: query,
        domain: guessedDomain,
        website: `https://${guessedDomain}`,
        logoUrl: `https://www.google.com/s2/favicons?domain=${guessedDomain}&sz=128`,
        logoFormat: 'png',
        source: 'url',
        altText: `${query} Website Icon (Unverified)`,
        badge: 'Website Favicon (Unverified — Verify Visually)',
        verified: false,
      });
    }

    return candidates;
  }
}

export const issuerService = new IssuerService();
