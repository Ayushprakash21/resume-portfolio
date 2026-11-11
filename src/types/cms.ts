export interface ProfileData {
  firstName?: string;
  lastName?: string;
  additionalName?: string;
  pronouns?: string;
  name: string;
  headline: string;
  shortIntro?: string;
  bio: string;
  countryRegion?: string;
  stateProvince?: string;
  city?: string;
  location: string;
  isLocationVisible?: boolean;
  profilePhoto: string;
  coverImage?: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl?: string;
  otherSocialLinks?: { label: string; url: string }[];
  resumeUrl: string;
  resumeButtonText?: string;
  isResumeDownloadEnabled?: boolean;
  availabilityStatus: string;
  status?: 'published' | 'draft';
  updatedAt?: string;
  publishedAt?: string;
  draft?: Partial<ProfileData>;
}

export interface HomepageSettings {
  mainHeading: string;
  secondaryHeading: string;
  introParagraph: string;
  ctaText: string;
  ctaDestination: string;
  scrollIndicatorText: string;
  heroVisibility: boolean;
  navLabels: {
    work: string;
    experience: string;
    about: string;
    projects: string;
    contact: string;
  };
}

export interface AboutSectionSettings {
  heading: string;
  quote: string;
  summary: string;
  detailedText: string;
  content?: string; // Rich multiline content for LinkedIn-style About editor
  physicalOpsHeading: string;
  physicalOpsText: string;
  digitalPlatformsHeading: string;
  digitalPlatformsText: string;
  status?: 'published' | 'draft';
  characterCount?: number;
  updatedAt?: string;
  publishedAt?: string;
  contentBlocks?: {
    id: string;
    title: string;
    content: string;
    displayOrder: number;
    isVisible: boolean;
  }[];
}

export interface ExperienceMediaItem {
  id: string;
  url: string;
  title?: string;
  caption?: string;
  altText?: string;
  type: 'image' | 'document' | 'link';
}

export interface ExperienceRecord {
  id: string;
  employer: string;
  jobTitle: string;
  employmentType?: string; // Full-time, Contract, Part-time, Self-employed, Founder, etc. (empty string hides badge)
  showEmploymentTypeBadge?: boolean; // Controls public & admin badge display
  location?: string;
  locationType?: 'On-site' | 'Hybrid' | 'Remote';
  startMonth?: string;
  startYear?: string;
  endMonth?: string;
  endYear?: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
  requiresDateConfirmation?: boolean; // True when month was not specified in source resume
  dateConfirmationNotes?: string;
  description: string;
  responsibilities: string[];
  achievements?: string[];
  impact?: string;
  skillsUsed: string[];
  logoUrl?: string;
  mediaItems?: ExperienceMediaItem[];
  displayOrder: number;
  status: 'published' | 'draft';
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectContentBlocks {
  overview?: string;
  problemStatement?: string;
  proposedSolution?: string;
  features?: string[];
  architecture?: string;
  technologyStack?: string[];
  contribution?: string;
  outcomes?: string;
  futureRoadmap?: string;
}

export interface ProjectMediaItem {
  id: string;
  url: string;
  title?: string;
  caption?: string;
  altText?: string;
  type: 'image' | 'document' | 'video' | 'link';
  isThumbnail?: boolean;
  isLogo?: boolean;
}

export interface ProjectRecord {
  id: string;
  name: string;
  category: string;
  subtitle: string;
  shortDescription?: string;
  description: string;
  problemStatement?: string;
  solution?: string;
  coverImage?: string;
  logoUrl?: string;
  screenshots: string[];
  technologyStack: string[];
  features: string[];
  developmentStatus: string;
  projectUrl?: string;
  repositoryUrl?: string;
  demoUrl?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  contributors?: string;
  associatedOrganization?: string;
  featured: boolean;
  displayOrder: number;
  status: 'published' | 'draft';
  skillsUsed?: string[];
  contentBlocks?: ProjectContentBlocks;
  mediaItems?: ProjectMediaItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CertificationRecord {
  id: string;
  title: string;
  issuer: string;
  issuerWebsite?: string;
  issuerDomain?: string;
  issuerLogo?: string;
  issuerLogoKey?: string;
  issuerLogoSource?: 'directory' | 'clearbit' | 'upload' | 'url' | 'monogram';
  issuerLogoFormat?: 'svg' | 'png' | 'webp';
  issuerLogoAlt?: string;
  issueMonth?: string;
  issueYear?: string;
  completionDate: string;
  expirationMonth?: string;
  expirationYear?: string;
  expiryDate?: string;
  doesNotExpire?: boolean;
  credentialId?: string;
  verificationUrl?: string;
  description?: string;
  skillsUsed?: string[];
  certificateImage?: string;
  certificatePdfUrl?: string;
  category: string;
  highlightTag: string;
  displayOrder?: number;
  requiresDateConfirmation?: boolean;
  dateConfirmationNotes?: string;
  status: 'published' | 'draft';
  createdAt?: string;
  updatedAt?: string;
}

export interface IssuerRecord {
  id: string;
  issuerName: string;
  issuerDomain?: string;
  issuerWebsite?: string;
  logoObjectKey?: string;
  logoUrl: string;
  logoFormat?: 'svg' | 'png' | 'webp';
  logoSource: 'directory' | 'clearbit' | 'upload' | 'url' | 'monogram';
  altText: string;
  verifiedByAdmin: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SkillRecord {
  id: string;
  name: string;
  category: string;
  description?: string;
  displayOrder: number;
  associatedWith?: ('profile' | 'experience' | 'projects' | 'certifications' | 'education')[];
  updatedAt?: string;
}

export interface EducationRecord {
  id: string;
  institution: string;
  associatedCollege?: string;
  degree: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
  grade?: string;
  description?: string;
  // About This Qualification (optional academic details)
  courseOverview?: string;
  specialization?: string;
  subjects?: string[];
  relevantCoursework?: string[];
  academicFocus?: string;
  learningOutcomes?: string[];
  projectsResearch?: string;
  academicAchievements?: string[];
  additionalNotes?: string;
  status?: 'published' | 'draft';
  skillsUsed?: string[];
  logoUrl?: string;
  highlights: string[];
  displayOrder: number;
  requiresDateConfirmation?: boolean;
  dateConfirmationNotes?: string;
  mediaItems?: {
    id: string;
    url: string;
    title?: string;
    type: 'image' | 'document';
  }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ResumeRecord {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSizeBytes: number;
  uploadedAt: string;
  isActive: boolean;
  isPublicEnabled: boolean;
  buttonText: string;
  versionName?: string;
  notes?: string;
  storageProvider?: 'cloudflare-r2' | 'firebase-storage' | 'local-fallback';
  objectKey?: string;
  originalName?: string;
  displayName?: string;
  fileId?: string;
  versionId?: string;
  generatedDownloadName?: string;
}

export interface SectionConfig {
  id: string;
  sectionKey: string;
  title: string;
  subtitle: string;
  displayOrder: number;
  isVisible: boolean;
  status: 'published' | 'draft';
}

export interface AppearanceSettings {
  primaryBg: string;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
  accentColor: string;
  headingFont: string;
  bodyFont: string;
  sectionSpacing: 'compact' | 'normal' | 'spacious';
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  organization?: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
  archived: boolean;
  emailDelivered?: boolean;
  emailMessageId?: string;
  emailRecipient?: string;
}

export interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  navLabels: {
    home: string;
    about: string;
    experience: string;
    skills: string;
    orion9: string;
    applywise: string;
    architecture: string;
    certifications: string;
    recruiter: string;
    contact: string;
  };
  socialLinks: {
    github: string;
    linkedin: string;
    email: string;
  };
  footerNote: string;
  availabilityNote: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  type: string;
  sizeBytes: number;
  uploadedAt: string;
  category: 'certificate' | 'certification-logo' | 'screenshot' | 'resume' | 'photo' | 'general' | 'logo' | 'work-sample';
  caption?: string;
  altText?: string;
  dimensions?: string;
  usageCount?: number;
  usedIn?: string[];
  storageProvider?: 'cloudflare-r2' | 'firebase-storage' | 'local-fallback';
  objectKey?: string;
  visibility?: 'public' | 'private';
}

export interface PreferredLocation {
  id: string;
  name: string;
  city?: string;
  remoteAvailable: boolean;
  relocationWilling: boolean;
  isVisible: boolean;
  displayOrder: number;
}

export interface OpenToWorkSettings {
  enabled: boolean;
  badgeText: string;
  sectionHeading: string;
  headline: string;
  description: string;
  availabilityStatus: 'Actively looking' | 'Open to opportunities' | 'Available for discussion' | 'Not currently looking';
  employmentPreferences: string[];
  workArrangements: string[];
  preferredLocations: PreferredLocation[];
  preferredJobCategories: string[];
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  status: 'published' | 'draft';
  updatedAt?: string;
}

export interface ResumeGeneratorSettings {
  enabled: boolean;
  title: string;
  description: string;
  includeSummary: boolean;
  customSummary?: string;
  includeExperience: boolean;
  includeProjects: boolean;
  includeSkills: boolean;
  includeEducation: boolean;
  includeCertifications: boolean;
  includeContactInfo: {
    email: boolean;
    phone: boolean;
    location: boolean;
    linkedin: boolean;
    github: boolean;
    portfolio: boolean;
  };
  sectionOrder?: ('summary' | 'skills' | 'experience' | 'projects' | 'education' | 'certifications')[];
  updatedAt?: string;
}

export type ExtractionJobStatus =
  | 'selected'
  | 'validating'
  | 'uploading'
  | 'uploaded'
  | 'queued'
  | 'extracting_text'
  | 'extracting_fields'
  | 'validating_fields'
  | 'review_required'
  | 'approved'
  | 'published'
  | 'failed'
  | 'cancelled';

export interface ExtractionJob {
  jobId: string;
  fileId: string;
  originalFileName: string;
  objectKey: string;
  status: ExtractionJobStatus;
  progressStage: string;
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
  retryCount: number;
  errorCode?: string;
  errorMessage?: string;
  parserVersion: string;
  extractionEngineVersion: string;
  rawTextLength?: number;
  isScanned?: boolean;
  requiresOcr?: boolean;
  extractedData?: ExtractedResumeData;
  diffItems?: ResumeDiffItem[];
}

export interface ExtractedResumeField<T = string> {
  value: T;
  confidence: number;
  source: string;
  evidence?: string;
}

export interface ExtractedResumeData {
  personalInfo: {
    fullName?: ExtractedResumeField;
    headline?: ExtractedResumeField;
    email?: ExtractedResumeField;
    phone?: ExtractedResumeField;
    location?: ExtractedResumeField;
    linkedinUrl?: ExtractedResumeField;
    githubUrl?: ExtractedResumeField;
    portfolioUrl?: ExtractedResumeField;
    otherUrls?: ExtractedResumeField<string[]>;
  };
  summary?: ExtractedResumeField;
  objective?: ExtractedResumeField;
  skills: {
    category: string;
    skills: string[];
    confidence: number;
    source: string;
    evidence?: string;
  }[];
  experience: {
    id?: string;
    jobTitle: string;
    employer: string;
    employmentType?: string;
    location?: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    description?: string;
    responsibilities: string[];
    achievements: string[];
    skillsUsed: string[];
    technologies?: string[];
    confidence: number;
    source: string;
    evidence?: string;
    conflictWarning?: string;
  }[];
  projects: {
    id?: string;
    name: string;
    subtitle?: string;
    description: string;
    role?: string;
    technologies: string[];
    features: string[];
    achievements?: string[];
    projectUrl?: string;
    organization?: string;
    startDate?: string;
    endDate?: string;
    confidence: number;
    source: string;
    evidence?: string;
  }[];
  education: {
    id?: string;
    institution: string;
    degree: string;
    fieldOfStudy: string;
    location?: string;
    startYear?: string;
    endYear?: string;
    grade?: string;
    confidence: number;
    source: string;
    evidence?: string;
  }[];
  certifications: {
    id?: string;
    title: string;
    issuer: string;
    issueDate?: string;
    completionDate: string;
    expiryDate?: string;
    credentialId?: string;
    verificationUrl?: string;
    confidence: number;
    source: string;
    evidence?: string;
  }[];
  rawText?: string;
  metadata?: {
    pageCount?: number;
    wordCount?: number;
    isScanned?: boolean;
    requiresOcr?: boolean;
    detectedEngine?: 'ai-worker' | 'deterministic-client' | 'fallback';
  };
}

export interface ResumeDiffItem {
  id: string;
  section: 'profile' | 'summary' | 'experience' | 'projects' | 'education' | 'certifications' | 'skills';
  field: string;
  label: string;
  category: 'new' | 'changed' | 'unchanged';
  existingValue: any;
  extractedValue: any;
  currentReviewValue: any;
  status: 'pending' | 'approved' | 'rejected' | 'edited';
  confidence: number;
  source: string;
  evidence?: string;
  recordId?: string;
  conflictWarning?: string;
  structuredRecord?: any;
}

export interface ResumeAuditEntry {
  id: string;
  timestamp: string;
  action: string;
  fileName: string;
  versionNumber: number;
  details: string;
  approvedFieldsCount: number;
  rejectedFieldsCount: number;
}

export interface ResumeVersionRecord {
  id: string;
  versionNumber: number;
  fileName: string;
  fileUrl: string;
  fileType: 'pdf' | 'docx' | 'doc';
  fileSizeBytes: number;
  uploadedAt: string;
  uploadedBy: string;
  processingStatus:
    | 'uploaded'
    | 'validating'
    | 'extracting'
    | 'awaiting_review'
    | 'approved'
    | 'published'
    | 'failed';
  extractionStatus: 'pending' | 'success' | 'partial' | 'failed';
  isActive: boolean;
  isPublicEnabled: boolean;
  buttonText: string;
  versionName?: string;
  notes?: string;
  extractedData?: ExtractedResumeData;
  diffItems?: ResumeDiffItem[];
  auditLog?: ResumeAuditEntry[];
  publishedAt?: string;
  storageProvider?: 'cloudflare-r2' | 'firebase-storage' | 'local-fallback';
  objectKey?: string;
  originalName?: string;
  displayName?: string;
  generatedDownloadName?: string;
}
