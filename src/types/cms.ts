export interface ProfileData {
  name: string;
  headline: string;
  bio: string;
  profilePhoto: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  githubUrl: string;
  resumeUrl: string;
  availabilityStatus: string;
  location: string;
}

export interface ExperienceRecord {
  id: string;
  employer: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  location?: string;
  description: string;
  responsibilities: string[];
  skillsUsed: string[];
  displayOrder: number;
  status: 'published' | 'draft';
}

export interface ProjectRecord {
  id: string;
  name: string;
  category: string;
  subtitle: string;
  description: string;
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
  category: 'Business Operations & Strategy' | 'Supply Chain & Logistics Systems' | 'AI & Applied Product Innovation' | 'Full-Stack & Cloud Architecture';
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
