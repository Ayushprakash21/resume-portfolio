export interface ProjectDetail {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  role: string;
  association: string;
  projectType: string;
  vision: string;
  description: string;
  accentColor: string;
  accentBg: string;
  tagline: string;
  features: {
    title: string;
    description: string;
    tag: string;
  }[];
  techStack: string[];
  metrics: {
    label: string;
    value: string;
  }[];
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  date: string;
  credentialId?: string;
  category: string;
}

export interface SkillCategory {
  title: string;
  skills: string[];
}
