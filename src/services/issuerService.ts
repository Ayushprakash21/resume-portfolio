import { IssuerRecord } from '../types/cms';

export interface IssuerCandidate {
  id: string;
  name: string;
  domain: string;
  website: string;
  logoUrl: string;
  logoFormat: 'svg' | 'png' | 'webp';
  source: 'directory' | 'clearbit' | 'upload' | 'url';
  altText: string;
  badge: string;
  verified: boolean;
}

/**
 * Curated Directory of Verified Industry Accreditation Bodies & Tech Issuers
 */
export const VERIFIED_ISSUERS_DIRECTORY: Omit<IssuerRecord, 'createdAt' | 'updatedAt'>[] = [
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

class IssuerService {
  /**
   * Search internal verified issuer directory
   */
  public searchDirectory(query: string): IssuerRecord[] {
    const q = query.trim().toLowerCase();
    if (!q) return VERIFIED_ISSUERS_DIRECTORY as IssuerRecord[];

    return (VERIFIED_ISSUERS_DIRECTORY as IssuerRecord[]).filter(
      (iss) =>
        iss.issuerName.toLowerCase().includes(q) ||
        (iss.issuerDomain && iss.issuerDomain.toLowerCase().includes(q))
    );
  }

  /**
   * Resolve logo candidates across verified directory, domain matching, and official CDNs
   */
  public async resolveLogoCandidates(issuerQuery: string): Promise<IssuerCandidate[]> {
    const query = issuerQuery.trim();
    if (!query) return [];

    const candidates: IssuerCandidate[] = [];
    const lower = query.toLowerCase();

    // 1. Check verified local SVG directory
    const matchedDirectory = this.searchDirectory(query);
    for (const item of matchedDirectory) {
      candidates.push({
        id: `dir-${item.id}`,
        name: item.issuerName,
        domain: item.issuerDomain || '',
        website: item.issuerWebsite || `https://${item.issuerDomain}`,
        logoUrl: item.logoUrl,
        logoFormat: item.logoFormat || 'svg',
        source: 'directory',
        altText: item.altText,
        badge: 'Official Vector SVG',
        verified: true,
      });
    }

    // 2. Derive domain if user typed a domain or known brand
    let guessedDomain = '';
    if (query.includes('.')) {
      guessedDomain = query.replace(/^https?:\/\//, '').split('/')[0];
    } else {
      const domainMap: Record<string, string> = {
        anthropic: 'anthropic.com',
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

      for (const [key, dom] of Object.entries(domainMap)) {
        if (lower.includes(key)) {
          guessedDomain = dom;
          break;
        }
      }

      if (!guessedDomain && query.length >= 3) {
        // Fallback guess: sanitizedquery.com
        guessedDomain = `${query.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
      }
    }

    // 3. Add external Clearbit resolution if domain was resolved and not already first in candidates
    if (guessedDomain && !candidates.some((c) => c.domain === guessedDomain && c.source === 'clearbit')) {
      candidates.push({
        id: `clearbit-${guessedDomain}`,
        name: query,
        domain: guessedDomain,
        website: `https://${guessedDomain}`,
        logoUrl: `https://logo.clearbit.com/${guessedDomain}`,
        logoFormat: 'png',
        source: 'clearbit',
        altText: `${query} Brand Logo (via ${guessedDomain})`,
        badge: 'Clearbit Domain Match',
        verified: false,
      });
    }

    // 4. Add high-res Google Favicon as resilient backup
    if (guessedDomain && !candidates.some((c) => c.id === `favicon-${guessedDomain}`)) {
      candidates.push({
        id: `favicon-${guessedDomain}`,
        name: query,
        domain: guessedDomain,
        website: `https://${guessedDomain}`,
        logoUrl: `https://www.google.com/s2/favicons?domain=${guessedDomain}&sz=128`,
        logoFormat: 'png',
        source: 'clearbit',
        altText: `${query} Official Website Icon`,
        badge: 'High-Res Domain Icon',
        verified: false,
      });
    }

    return candidates;
  }
}

export const issuerService = new IssuerService();
