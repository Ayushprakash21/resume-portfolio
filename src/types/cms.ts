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
  employmentType?: string; // Full-time, Contract, Part-time, Self-employed, Founder
  location?: string;
  locationType?: 'On-site' | 'Hybrid' | 'Remote';
  startMonth?: string;
  startYear?: string;
  endMonth?: string;
  endYear?: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
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
  status: 'published' | 'draft';
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
  degree: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
  grade?: string;
  description?: string;
  skillsUsed?: string[];
  logoUrl?: string;
  highlights: string[];
  displayOrder: number;
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
  category: 'certificate' | 'screenshot' | 'resume' | 'photo' | 'general' | 'logo' | 'work-sample';
  caption?: string;
  altText?: string;
  dimensions?: string;
  usageCount?: number;
  usedIn?: string[];
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
