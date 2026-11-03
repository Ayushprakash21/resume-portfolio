export interface ProfileData {
  name: string;
  headline: string;
  shortIntro?: string;
  bio: string;
  profilePhoto: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  githubUrl: string;
  otherSocialLinks?: { label: string; url: string }[];
  resumeUrl: string;
  resumeButtonText?: string;
  isResumeDownloadEnabled?: boolean;
  availabilityStatus: string;
  location: string;
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
  physicalOpsHeading: string;
  physicalOpsText: string;
  digitalPlatformsHeading: string;
  digitalPlatformsText: string;
  contentBlocks?: {
    id: string;
    title: string;
    content: string;
    displayOrder: number;
    isVisible: boolean;
  }[];
}

export interface ExperienceRecord {
  id: string;
  employer: string;
  jobTitle: string;
  employmentType?: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
  location?: string;
  description: string;
  responsibilities: string[];
  achievements?: string[];
  skillsUsed: string[];
  logoUrl?: string;
  displayOrder: number;
  status: 'published' | 'draft';
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
  screenshots: string[];
  technologyStack: string[];
  features: string[];
  developmentStatus: string;
  projectUrl?: string;
  repositoryUrl?: string;
  featured: boolean;
  displayOrder: number;
  status: 'published' | 'draft';
}

export interface CertificationRecord {
  id: string;
  title: string;
  issuer: string;
  completionDate: string;
  expiryDate?: string;
  credentialId?: string;
  verificationUrl?: string;
  certificateImage?: string;
  category: string;
  highlightTag: string;
  status: 'published' | 'draft';
}

export interface SkillRecord {
  id: string;
  name: string;
  category: string;
  description?: string;
  displayOrder: number;
}

export interface EducationRecord {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
  highlights: string[];
  displayOrder: number;
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
  category: 'certificate' | 'screenshot' | 'resume' | 'photo' | 'general';
}
