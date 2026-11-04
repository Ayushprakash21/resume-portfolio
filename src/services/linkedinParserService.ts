/**
 * LinkedIn Data Export Parser Service
 * Ayush Prakash Personal Portfolio
 *
 * Implements:
 * - RFC 4180 CSV parser with quotes and multiline support
 * - Secure ZIP archive decompression with traversal and bomb protection
 * - Dynamic column header normalization across LinkedIn export variants
 * - Duplicate detection against existing Firestore CMS records
 * - Sanitized record extraction and structured review generation
 */

import JSZip from 'jszip';
import {
  LinkedInParsedRecord,
  LinkedInImportReport,
} from '../types/linkedin';
import { cmsService } from './cmsService';

// Security limits
const MAX_COMPRESSED_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
const MAX_TOTAL_UNCOMPRESSED_BYTES = 100 * 1024 * 1024; // 100 MB
const MAX_ARCHIVE_ENTRIES = 150;

/**
 * Normalizes string for duplicate matching (strips special characters, whitespace, lowercase)
 */
export function normalizeString(str?: string): string {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

/**
 * RFC 4180 Compliant CSV Parser
 * Accurately parses CSV strings containing commas, quotes, CRLF, and multiline cells.
 */
export function parseCSV(csvText: string): Record<string, string>[] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuote = false;

  const len = csvText.length;
  for (let i = 0; i < len; i++) {
    const char = csvText[i];
    const nextChar = i + 1 < len ? csvText[i + 1] : '';

    if (insideQuote) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote: ""
          currentCell += '"';
          i++; // skip next quote
        } else {
          // Closing quote
          insideQuote = false;
        }
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        insideQuote = true;
      } else if (char === ',') {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if (char === '\r') {
        if (nextChar === '\n') i++; // Handle CRLF
        currentRow.push(currentCell.trim());
        if (currentRow.some((c) => c.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else if (char === '\n') {
        currentRow.push(currentCell.trim());
        if (currentRow.some((c) => c.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
  }

  // Final cell
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c.length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.trim());
  const results: Record<string, string>[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = row[idx] !== undefined ? row[idx] : '';
    });
    // Ignore completely empty rows
    if (Object.values(obj).some((v) => v.length > 0)) {
      results.push(obj);
    }
  }

  return results;
}

/**
 * Flexible case-insensitive, symbol-agnostic column getter
 */
export function getColumnValue(row: Record<string, string>, possibleNames: string[]): string {
  const normalizedKeys: Record<string, string> = {};
  for (const k of Object.keys(row)) {
    normalizedKeys[k.toLowerCase().replace(/[^a-z0-9]/g, '')] = row[k];
  }

  for (const name of possibleNames) {
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalizedKeys[cleanName] !== undefined && normalizedKeys[cleanName].trim().length > 0) {
      return normalizedKeys[cleanName].trim();
    }
  }
  return '';
}

export class LinkedInParserService {
  /**
   * Main entry point to parse either a LinkedIn export ZIP archive or standalone CSV
   */
  public async parseLinkedInExport(file: File): Promise<LinkedInImportReport> {
    if (!file) throw new Error('No file provided.');

    if (file.name.toLowerCase().endsWith('.zip')) {
      return this.parseZipArchive(file);
    } else if (file.name.toLowerCase().endsWith('.csv')) {
      return this.parseStandaloneCsv(file);
    } else {
      throw new Error('Unsupported format. Please upload a LinkedIn data export (.zip) or CSV (.csv) file.');
    }
  }

  /**
   * Secure ZIP archive parser with path-traversal and zip-bomb protection
   */
  private async parseZipArchive(file: File): Promise<LinkedInImportReport> {
    if (file.size > MAX_COMPRESSED_SIZE_BYTES) {
      throw new Error(`Archive size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds limit of 50MB.`);
    }

    const zip = new JSZip();
    const arrayBuffer = await file.arrayBuffer();
    const loadedZip = await zip.loadAsync(arrayBuffer);

    const filesDiscovered: string[] = [];
    const filesRecognized: string[] = [];
    const warnings: string[] = [];
    let totalUncompressedBytes = 0;
    let entryCount = 0;

    const csvContents: { filename: string; text: string }[] = [];

    // Security pass: Validate entries before decompression
    for (const [relativePath, entry] of Object.entries(loadedZip.files)) {
      entryCount++;
      if (entryCount > MAX_ARCHIVE_ENTRIES) {
        throw new Error(`Security Exception: ZIP contains excessive entries (${entryCount} > ${MAX_ARCHIVE_ENTRIES}).`);
      }

      // 1. Path traversal check
      if (
        relativePath.includes('..') ||
        relativePath.startsWith('/') ||
        relativePath.startsWith('\\') ||
        /^[a-zA-Z]:/.test(relativePath)
      ) {
        throw new Error(`Security Exception: Invalid archive path detected: "${relativePath}". Path traversal rejected.`);
      }

      // Ignore directories or hidden mac resource forks
      if (entry.dir || relativePath.includes('__MACOSX')) {
        continue;
      }

      filesDiscovered.push(relativePath);

      // We only extract relevant data files (.csv)
      if (relativePath.toLowerCase().endsWith('.csv')) {
        // Approximate size check
        const uncompressedSize = (entry as any)._data?.uncompressedSize || 0;
        totalUncompressedBytes += uncompressedSize;
        if (totalUncompressedBytes > MAX_TOTAL_UNCOMPRESSED_BYTES) {
          throw new Error('Security Exception: Total uncompressed content exceeds 100MB limit (Decompression Bomb protection).');
        }

        const text = await entry.async('string');
        csvContents.push({ filename: relativePath.split('/').pop() || relativePath, text });
      }
    }

    const records: LinkedInParsedRecord[] = [];
    let recordsSkipped = 0;

    // Process recognized CSVs
    for (const { filename, text } of csvContents) {
      const parsedRecords = this.processCsvContent(filename, text);
      if (parsedRecords.length > 0) {
        filesRecognized.push(filename);
        records.push(...parsedRecords);
      } else {
        warnings.push(`File "${filename}" contained no readable records.`);
        recordsSkipped++;
      }
    }

    return {
      archiveName: file.name,
      filesDiscovered,
      filesRecognized,
      recordsExtracted: records.length,
      recordsSkipped,
      warnings,
      records,
    };
  }

  /**
   * Standalone CSV upload parser
   */
  private async parseStandaloneCsv(file: File): Promise<LinkedInImportReport> {
    const text = await file.text();
    const records = this.processCsvContent(file.name, text);

    return {
      archiveName: file.name,
      filesDiscovered: [file.name],
      filesRecognized: records.length > 0 ? [file.name] : [],
      recordsExtracted: records.length,
      recordsSkipped: 0,
      warnings: records.length === 0 ? ['No records found in CSV file.'] : [],
      records,
    };
  }

  /**
   * Dispatches CSV content to appropriate category parser
   */
  public processCsvContent(filename: string, text: string): LinkedInParsedRecord[] {
    const lowerName = filename.toLowerCase();
    const rows = parseCSV(text);
    if (rows.length === 0) return [];

    if (lowerName.includes('position') || lowerName.includes('experience')) {
      return this.parsePositions(rows, filename);
    } else if (lowerName.includes('education')) {
      return this.parseEducation(rows, filename);
    } else if (lowerName.includes('certification') || lowerName.includes('license')) {
      return this.parseCertifications(rows, filename);
    } else if (lowerName.includes('skill')) {
      return this.parseSkills(rows, filename);
    } else if (lowerName.includes('project')) {
      return this.parseProjects(rows, filename);
    } else if (lowerName.includes('profile')) {
      return this.parseProfile(rows, filename);
    } else if (lowerName.includes('course') || lowerName.includes('language') || lowerName.includes('honor')) {
      return this.parseOther(rows, filename);
    }

    // Attempt header heuristic if filename is non-standard
    const firstRow = rows[0];
    if (getColumnValue(firstRow, ['companyname', 'company', 'employer'])) {
      return this.parsePositions(rows, filename);
    }
    if (getColumnValue(firstRow, ['schoolname', 'school', 'university'])) {
      return this.parseEducation(rows, filename);
    }
    if (getColumnValue(firstRow, ['authority', 'issuer', 'certname'])) {
      return this.parseCertifications(rows, filename);
    }
    if (getColumnValue(firstRow, ['skillname', 'skill'])) {
      return this.parseSkills(rows, filename);
    }

    return [];
  }

  /**
   * Parse Positions / Experience CSV
   */
  private parsePositions(rows: Record<string, string>[], sourceFile: string): LinkedInParsedRecord[] {
    const existingExps = cmsService.getExperiences(false);
    const parsed: LinkedInParsedRecord[] = [];

    rows.forEach((row, idx) => {
      const company = getColumnValue(row, ['companyname', 'company', 'employer', 'organization']);
      const title = getColumnValue(row, ['title', 'jobtitle', 'role', 'position']);
      if (!company && !title) return;

      const description = getColumnValue(row, ['description', 'summary', 'details']);
      const location = getColumnValue(row, ['location', 'city', 'country']);
      const startedOn = getColumnValue(row, ['startedon', 'startdate', 'from', 'start']);
      const finishedOn = getColumnValue(row, ['finishedon', 'enddate', 'to', 'end']);
      const isCurrent = !finishedOn || finishedOn.toLowerCase().includes('present');

      // Duplicate detection against CMS
      const normCompany = normalizeString(company);
      const normTitle = normalizeString(title);

      const matchedExp = existingExps.find((exp) => {
        const cMatch = normalizeString(exp.employer) === normCompany;
        const tMatch = normalizeString(exp.jobTitle) === normTitle;
        return cMatch && tMatch;
      });

      const partialMatch = !matchedExp
        ? existingExps.find((exp) => normalizeString(exp.employer) === normCompany)
        : null;

      const existingMatch = matchedExp || partialMatch;
      const confidence = matchedExp ? 0.95 : partialMatch ? 0.6 : 0;
      const suggestedAction = matchedExp ? 'skip' : partialMatch ? 'update' : 'create';

      parsed.push({
        id: `li-exp-${Date.now()}-${idx}`,
        category: 'experience',
        sourceFile,
        sourceRow: idx + 2,
        data: {
          employer: company || 'Enterprise Company',
          jobTitle: title || 'Professional Role',
          description: description || '',
          location: location || '',
          startDate: startedOn || '',
          endDate: finishedOn || (isCurrent ? 'Present' : ''),
          isCurrent,
        },
        existingMatch: existingMatch
          ? {
              id: existingMatch.id,
              employer: existingMatch.employer,
              jobTitle: existingMatch.jobTitle,
              startDate: existingMatch.startDate,
              endDate: existingMatch.endDate,
            }
          : null,
        matchConfidence: confidence,
        suggestedAction,
        status: 'pending',
      });
    });

    return parsed;
  }

  /**
   * Parse Education CSV
   */
  private parseEducation(rows: Record<string, string>[], sourceFile: string): LinkedInParsedRecord[] {
    const existingEdu = cmsService.getEducation();
    const parsed: LinkedInParsedRecord[] = [];

    rows.forEach((row, idx) => {
      const institution = getColumnValue(row, ['schoolname', 'school', 'institution', 'university']);
      const degree = getColumnValue(row, ['degreename', 'degree', 'fieldofstudy']);
      if (!institution && !degree) return;

      const notes = getColumnValue(row, ['notes', 'description', 'activities']);
      const startDate = getColumnValue(row, ['startdate', 'startedon', 'startyear']);
      const endDate = getColumnValue(row, ['enddate', 'finishedon', 'endyear']);

      const normInst = normalizeString(institution);
      const match = existingEdu.find((edu) => normalizeString(edu.institution) === normInst);

      parsed.push({
        id: `li-edu-${Date.now()}-${idx}`,
        category: 'education',
        sourceFile,
        sourceRow: idx + 2,
        data: {
          institution: institution || 'Academic Institution',
          degree: degree || 'Degree',
          description: notes,
          startYear: startDate.slice(-4) || startDate,
          endYear: endDate.slice(-4) || endDate,
        },
        existingMatch: match ? { id: match.id, institution: match.institution, degree: match.degree } : null,
        matchConfidence: match ? 0.9 : 0,
        suggestedAction: match ? 'skip' : 'create',
        status: 'pending',
      });
    });

    return parsed;
  }

  /**
   * Parse Certifications CSV
   */
  private parseCertifications(rows: Record<string, string>[], sourceFile: string): LinkedInParsedRecord[] {
    const existingCerts = cmsService.getCertifications(false);
    const parsed: LinkedInParsedRecord[] = [];

    rows.forEach((row, idx) => {
      const name = getColumnValue(row, ['name', 'title', 'certificationname']);
      const authority = getColumnValue(row, ['authority', 'issuer', 'organization', 'issuingorganization']);
      if (!name) return;

      const startedOn = getColumnValue(row, ['startedon', 'startdate', 'issuedate']);
      const finishedOn = getColumnValue(row, ['finishedon', 'enddate', 'expirationdate']);
      const licenseNumber = getColumnValue(row, ['licensenumber', 'credentialid', 'id']);
      const url = getColumnValue(row, ['url', 'verificationurl', 'link']);

      const normName = normalizeString(name);
      const match = existingCerts.find((c) => normalizeString(c.title) === normName);

      parsed.push({
        id: `li-cert-${Date.now()}-${idx}`,
        category: 'certifications',
        sourceFile,
        sourceRow: idx + 2,
        data: {
          title: name,
          issuer: authority || 'Certifying Body',
          completionDate: startedOn || '',
          expiryDate: finishedOn || '',
          credentialId: licenseNumber || '',
          verificationUrl: url || '',
        },
        existingMatch: match ? { id: match.id, title: match.title, issuer: match.issuer } : null,
        matchConfidence: match ? 0.95 : 0,
        suggestedAction: match ? 'skip' : 'create',
        status: 'pending',
      });
    });

    return parsed;
  }

  /**
   * Parse Skills CSV
   */
  private parseSkills(rows: Record<string, string>[], sourceFile: string): LinkedInParsedRecord[] {
    const existingSkills = cmsService.getSkills();
    const existingSkillNames = new Set(existingSkills.map((s) => normalizeString(s.name)));
    const parsed: LinkedInParsedRecord[] = [];

    rows.forEach((row, idx) => {
      const skillName = getColumnValue(row, ['name', 'skill', 'skillname']);
      if (!skillName) return;

      const norm = normalizeString(skillName);
      const isDuplicate = existingSkillNames.has(norm);

      parsed.push({
        id: `li-sk-${Date.now()}-${idx}`,
        category: 'skills',
        sourceFile,
        sourceRow: idx + 2,
        data: {
          name: skillName,
          category: 'LinkedIn Imported Skills',
        },
        existingMatch: isDuplicate ? { name: skillName } : null,
        matchConfidence: isDuplicate ? 1.0 : 0,
        suggestedAction: isDuplicate ? 'skip' : 'create',
        status: 'pending',
      });
    });

    return parsed;
  }

  /**
   * Parse Projects CSV
   */
  private parseProjects(rows: Record<string, string>[], sourceFile: string): LinkedInParsedRecord[] {
    const existingProjs = cmsService.getProjects(false);
    const parsed: LinkedInParsedRecord[] = [];

    rows.forEach((row, idx) => {
      const title = getColumnValue(row, ['title', 'name', 'projectname']);
      if (!title) return;

      const description = getColumnValue(row, ['description', 'summary']);
      const url = getColumnValue(row, ['url', 'projecturl', 'link']);
      const startedOn = getColumnValue(row, ['startedon', 'startdate']);
      const finishedOn = getColumnValue(row, ['finishedon', 'enddate']);

      const norm = normalizeString(title);
      const match = existingProjs.find((p) => normalizeString(p.name) === norm);

      parsed.push({
        id: `li-proj-${Date.now()}-${idx}`,
        category: 'projects',
        sourceFile,
        sourceRow: idx + 2,
        data: {
          name: title,
          description: description || '',
          projectUrl: url || '',
          startDate: startedOn || '',
          endDate: finishedOn || '',
        },
        existingMatch: match ? { id: match.id, name: match.name } : null,
        matchConfidence: match ? 0.95 : 0,
        suggestedAction: match ? 'skip' : 'create',
        status: 'pending',
      });
    });

    return parsed;
  }

  /**
   * Parse Profile CSV
   */
  private parseProfile(rows: Record<string, string>[], sourceFile: string): LinkedInParsedRecord[] {
    const parsed: LinkedInParsedRecord[] = [];
    if (rows.length === 0) return parsed;

    const row = rows[0];
    const firstName = getColumnValue(row, ['firstname', 'first']);
    const lastName = getColumnValue(row, ['lastname', 'last']);
    const headline = getColumnValue(row, ['headline', 'title', 'tagline']);
    const summary = getColumnValue(row, ['summary', 'about', 'bio']);
    const geoLocation = getColumnValue(row, ['geolocation', 'location', 'country']);

    const currentProfile = cmsService.getProfile();

    parsed.push({
      id: `li-prof-${Date.now()}`,
      category: 'profile',
      sourceFile,
      sourceRow: 2,
      data: {
        name: [firstName, lastName].filter(Boolean).join(' ') || currentProfile.name,
        headline: headline || currentProfile.headline,
        bio: summary || currentProfile.bio,
        location: geoLocation || currentProfile.location,
      },
      existingMatch: {
        name: currentProfile.name,
        headline: currentProfile.headline,
        location: currentProfile.location,
      },
      matchConfidence: 0.8,
      suggestedAction: 'update',
      status: 'pending',
    });

    return parsed;
  }

  /**
   * Parse Other CSVs (Courses, Languages, Honors)
   */
  private parseOther(rows: Record<string, string>[], sourceFile: string): LinkedInParsedRecord[] {
    const parsed: LinkedInParsedRecord[] = [];
    const lower = sourceFile.toLowerCase();
    const cat = lower.includes('course')
      ? 'course'
      : lower.includes('language')
      ? 'language'
      : 'honor';

    rows.forEach((row, idx) => {
      const title = getColumnValue(row, ['name', 'title']);
      if (!title) return;
      const desc = getColumnValue(row, ['description', 'proficiency', 'issuer']);

      parsed.push({
        id: `li-oth-${Date.now()}-${idx}`,
        category: 'other',
        sourceFile,
        sourceRow: idx + 2,
        data: {
          category: cat,
          title,
          description: desc,
        },
        matchConfidence: 0,
        suggestedAction: 'create',
        status: 'pending',
      });
    });

    return parsed;
  }
}

export const linkedinParserService = new LinkedInParserService();
