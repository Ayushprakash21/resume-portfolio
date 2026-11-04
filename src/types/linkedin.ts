/**
 * LinkedIn Data Export Types
 * Ayush Prakash Personal Portfolio
 */

export interface LinkedInProfileRecord {
  firstName?: string;
  lastName?: string;
  maidenName?: string;
  headline?: string;
  summary?: string;
  industry?: string;
  geoLocation?: string;
  address?: string;
  zipCode?: string;
}

export interface LinkedInPositionRecord {
  companyName: string;
  title: string;
  description?: string;
  location?: string;
  startedOn?: string;
  finishedOn?: string;
  isCurrent?: boolean;
}

export interface LinkedInEducationRecord {
  schoolName: string;
  degreeName?: string;
  notes?: string;
  activities?: string;
  startDate?: string;
  endDate?: string;
}

export interface LinkedInCertificationRecord {
  name: string;
  authority: string;
  startedOn?: string;
  finishedOn?: string;
  licenseNumber?: string;
  url?: string;
}

export interface LinkedInSkillRecord {
  name: string;
}

export interface LinkedInProjectRecord {
  title: string;
  description?: string;
  url?: string;
  startedOn?: string;
  finishedOn?: string;
}

export interface LinkedInOtherRecord {
  category: 'course' | 'language' | 'honor' | 'publication' | 'volunteer';
  title: string;
  description?: string;
  details?: Record<string, string>;
}

export interface LinkedInParsedRecord {
  id: string;
  category: 'profile' | 'experience' | 'education' | 'certifications' | 'skills' | 'projects' | 'other';
  sourceFile: string;
  sourceRow: number;
  data: any;
  existingMatch?: any | null;
  matchConfidence: number; // 0.0 to 1.0
  suggestedAction: 'create' | 'update' | 'skip';
  status: 'pending' | 'approved' | 'rejected' | 'edited';
  warnings?: string[];
  editedData?: any;
}

export interface LinkedInImportAudit {
  id: string;
  timestamp: string;
  fileName: string;
  fileSizeBytes: number;
  sourceType: 'zip' | 'csv';
  uploadedBy: string;
  r2ObjectKey?: string;
  recordsFound: number;
  recordsApproved: number;
  recordsRejected: number;
  status: 'completed' | 'partial' | 'rejected';
  details: string;
}

export interface LinkedInImportReport {
  archiveName: string;
  filesDiscovered: string[];
  filesRecognized: string[];
  recordsExtracted: number;
  recordsSkipped: number;
  warnings: string[];
  records: LinkedInParsedRecord[];
  r2ObjectKey?: string;
}
