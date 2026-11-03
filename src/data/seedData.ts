import {
  ProfileData,
  ExperienceRecord,
  ProjectRecord,
  CertificationRecord,
  SkillRecord,
  EducationRecord,
  ContactMessage,
  SiteSettings,
  MediaAsset,
  HomepageSettings,
  AboutSectionSettings,
  ResumeRecord,
  SectionConfig,
  AppearanceSettings,
} from '../types/cms';

export const DEFAULT_PROFILE: ProfileData = {
  name: 'Ayush Prakash',
  headline: 'Business Operations. Supply Chain Intelligence. AI-Powered Product Innovation.',
  bio: 'An operations professional exploring the intersection of enterprise systems, supply chain management, artificial intelligence and digital product development. Dedicated to building robust operating architectures, transparent logistics workflows, and high-signal digital platforms.',
  profilePhoto: '/images/creator/creator_1793142386775_044ada53_wall.png',
  email: 'ayushprakash0021@gmail.com',
  phone: '+91 (Available on request)',
  linkedinUrl: 'https://www.linkedin.com/in/ayushprakash',
  githubUrl: 'https://github.com/Ayushprakash21',
  resumeUrl: '/Ayush_Prakash_Resume.pdf',
  availabilityStatus: 'Open to Strategic Roles & Collaborations',
  location: 'Bengaluru, India',
};

export const DEFAULT_EXPERIENCES: ExperienceRecord[] = [
  {
    id: 'exp-1',
    employer: 'Enterprise Operations & Supply Logistics',
    jobTitle: 'Operations & Systems Specialist',
    startDate: '2024',
    endDate: 'Present',
    location: 'Bengaluru, India',
    description:
      'Focusing on supply chain operations intelligence, multi-tier logistics coordination, and bridging legacy ERP workflows with modern distributed data architectures.',
    responsibilities: [
      'Documenting and standardizing end-to-end procurement workflows connecting suppliers, storage centers, and field transit.',
      'Analyzing logistics data feeds to identify process bottlenecks and improve shipping visibility.',
      'Facilitating cross-functional coordination between warehouse operations, inventory managers, and technical teams.',
      'Mapping edge telemetry specifications for resilient in-transit event logging.',
    ],
    skillsUsed: ['Supply Chain Operations', 'Logistics Workflow Mapping', 'ERP Systems', 'Data Analysis', 'Process Engineering'],
    displayOrder: 1,
    status: 'published',
  },
  {
    id: 'exp-2',
    employer: 'Independent Product Development & Research',
    jobTitle: 'Product Operations & Architecture Lead',
    startDate: '2023',
    endDate: '2024',
    location: 'Bengaluru, India',
    description:
      'Spearheading research, system specifications, and architectural design for proprietary software platforms including Orion-9 and ApplyVise AI.',
    responsibilities: [
      'Authored comprehensive system specifications and relational schema models for edge-deployed database systems.',
      'Researched applicant tracking systems (ATS) parsing behavior to design non-hallucinatory skill matching heuristics.',
      'Developed responsive user interfaces and operational control tower dashboards using React, TypeScript, and Three.js.',
      'Maintained deployment pipelines and edge isolation policies on Cloudflare Workers and D1.',
    ],
    skillsUsed: ['Product Strategy', 'System Architecture', 'React 19 & TypeScript', 'Edge Computing', 'Interface Design'],
    displayOrder: 2,
    status: 'published',
  },
];

export const DEFAULT_PROJECTS: ProjectRecord[] = [
  {
    id: 'orion-9',
    name: 'Orion-9',
    category: 'Supply Chain Operating System',
    subtitle: 'AI-Powered Supply Chain Operating System',
    description:
      'Conceived and engineered to answer the foundational question: "What if the supply chain had an operating system?" Orion-9 addresses the severe fragmentation between supplier procurement, inventory warehousing, and multi-tier freight transit through edge streaming telemetry and cryptographic event verification.',
    coverImage: '/images/orion9/admin-page.png',
    screenshots: [
      '/images/orion9/admin-page.png',
      '/images/orion9/admin-branding-tab.png',
      '/images/orion9/login-view.png',
      '/images/orion9/navbar-home.png',
    ],
    technologyStack: ['TypeScript', 'Edge Telemetry Protocol', 'Mutual TLS', 'Cloudflare Workers', 'Three.js', 'React'],
    features: [
      'Pipeline Visualization: Supplier → Procurement → Inventory → Warehouse → Shipment → Customer',
      'Zero-Trust Event Logging: Cryptographically verifies shipment integrity at transit handoffs',
      'Telemetry Streaming: Battery-optimized edge ingestion for mobile and warehouse sensor nodes',
      'Operational Control Tower: Centralized real-time status visibility and exception triaging',
    ],
    developmentStatus: 'Active Architectural Prototype & Research',
    projectUrl: 'https://orion-9.ayushprakash0021.workers.dev/',
    repositoryUrl: 'https://github.com/Ayushprakash21/orion-9',
    featured: true,
    displayOrder: 1,
    status: 'published',
  },
  {
    id: 'applywise-ai',
    name: 'ApplyVise AI',
    category: 'AI & Career Technology',
    subtitle: 'AI-Powered Career Intelligence Platform',
    description:
      'An independent product development initiative designed to transform career evaluation and job applications. Unlike tools that inflate compatibility claims, ApplyVise AI applies grounded semantic reasoning to diagnose genuine skill gaps, optimize ATS parsing fidelity, and simplify application workflows.',
    coverImage: '/images/applyvise/applyvise-logo.png',
    screenshots: [
      '/images/applyvise/applyvise-logo.png',
    ],
    technologyStack: ['React 19', 'TypeScript', 'Google Gemini API', 'Vector Embeddings', 'Cloudflare D1 SQL'],
    features: [
      'Interactive Workflow: Resume → Analysis → Job Requirements → Skills Gap → Application Preparation',
      'Honest Career Fit Engine: Evaluates suitability without hallucinating spurious match scores',
      'Resume ATS Parser: Analyzes structural AST representation of CVs to prevent scanner rejection',
      'Discovery Aggregation: Multi-channel tech role ingestion with deduplication heuristics',
    ],
    developmentStatus: 'Active Independent Product Development',
    projectUrl: 'https://applywise-ai.pages.dev',
    repositoryUrl: 'https://github.com/Ayushprakash21/applywise-ai',
    featured: true,
    displayOrder: 2,
    status: 'published',
  },
];

export const DEFAULT_CERTIFICATIONS: CertificationRecord[] = [
  {
    id: 'cert-1',
    title: 'Google Cloud Professional Cloud Architect',
    issuer: 'Google Cloud',
    completionDate: 'Verified Credential',
    category: 'Cloud Architecture & Infrastructure',
    highlightTag: 'CLOUD ARCHITECTURE',
    verificationUrl: 'https://cloud.google.com/certification',
    status: 'published',
  },
  {
    id: 'cert-2',
    title: 'Generative AI & LLM Systems Specialization',
    issuer: 'DeepLearning.AI',
    completionDate: 'Verified Credential',
    category: 'Applied Artificial Intelligence',
    highlightTag: 'APPLIED AI & RAG',
    verificationUrl: 'https://www.deeplearning.ai',
    status: 'published',
  },
  {
    id: 'cert-3',
    title: 'Supply Chain Operations & Logistics Strategy',
    issuer: 'Professional Operations Institute',
    completionDate: 'Verified Credential',
    category: 'Supply Chain Management',
    highlightTag: 'OPERATIONS EXCELLENCE',
    status: 'published',
  },
];

export const DEFAULT_SKILLS: SkillRecord[] = [
  // Supply Chain & Logistics
  { id: 'sk-1', name: 'Supply Chain Operations', category: 'Supply Chain & Logistics Systems', description: 'Logistics routing, order lifecycle orchestration, and warehouse inventory synchronization.', displayOrder: 1 },
  { id: 'sk-2', name: 'Procurement & Vendor Workflows', category: 'Supply Chain & Logistics Systems', description: 'Supplier tracking, purchase order matching, and inventory replenishment cycles.', displayOrder: 2 },
  { id: 'sk-3', name: 'Freight & Cold-Chain Tracking', category: 'Supply Chain & Logistics Systems', description: 'Condition monitoring, transit custody verification, and exception logging.', displayOrder: 3 },

  // Business Operations & Strategy
  { id: 'sk-4', name: 'Operations Analytics & KPIs', category: 'Business Operations & Strategy', description: 'Bottleneck diagnosis, lead-time reduction, and process workflow optimization.', displayOrder: 4 },
  { id: 'sk-5', name: 'Cross-Functional Stakeholder Alignment', category: 'Business Operations & Strategy', description: 'Unifying ground operations, inventory managers, and software teams.', displayOrder: 5 },

  // AI & Product Innovation
  { id: 'sk-6', name: 'Applied AI & LLM Integration', category: 'AI & Applied Product Innovation', description: 'Leveraging Gemini APIs, semantic vector similarity, and structured extraction.', displayOrder: 6 },
  { id: 'sk-7', name: 'ATS & Semantic Document Parsing', category: 'AI & Applied Product Innovation', description: 'Token extraction, resume AST evaluation, and structured gap diagnostics.', displayOrder: 7 },
  { id: 'sk-8', name: 'Product Roadmapping & UI/UX', category: 'AI & Applied Product Innovation', description: 'Designing clean, high-density interfaces with clear user mental models.', displayOrder: 8 },

  // Full-Stack & Cloud Architecture
  { id: 'sk-9', name: 'Cloudflare Workers & Edge Runtime', category: 'Full-Stack & Cloud Architecture', description: 'V8 isolates, sub-50ms worldwide API endpoints, and serverless compute.', displayOrder: 9 },
  { id: 'sk-10', name: 'D1 & Relational Data Modeling', category: 'Full-Stack & Cloud Architecture', description: 'Distributed SQLite, schema migrations, and transactional integrity.', displayOrder: 10 },
  { id: 'sk-11', name: 'React 19 & TypeScript', category: 'Full-Stack & Cloud Architecture', description: 'Strict typing, state machines, and performant component lifecycles.', displayOrder: 11 },
  { id: 'sk-12', name: 'Three.js & Spatial Interactive Web', category: 'Full-Stack & Cloud Architecture', description: 'Custom geometries, camera projection, lighting, and 3D storytelling.', displayOrder: 12 },
];

export const DEFAULT_EDUCATION: EducationRecord[] = [
  {
    id: 'edu-1',
    institution: 'University / Institute of Technology',
    degree: 'Bachelor of Technology (B.Tech)',
    fieldOfStudy: 'Operations, Systems & Technology Management',
    startYear: '2019',
    endYear: '2023',
    highlights: [
      'Comprehensive focus on Industrial Operations, Supply Chain Systems, and Applied Computation.',
      'Graduated with honors in operational modeling and database systems.',
    ],
    displayOrder: 1,
  },
];

// Clean inbox with no fabricated recruiter messages
export const DEFAULT_CONTACT_MESSAGES: ContactMessage[] = [];

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteTitle: 'Ayush Prakash — The Digital Universe | Operations, Supply Chain & Applied AI',
  siteDescription: 'Personal portfolio of Ayush Prakash exploring enterprise systems, supply chain operating architecture (Orion-9), and AI career intelligence (ApplyVise AI).',
  navLabels: {
    home: '3D Universe',
    about: 'About',
    experience: 'Experience',
    skills: 'Capabilities',
    orion9: 'Orion-9',
    applywise: 'ApplyVise AI',
    architecture: 'Architecture',
    certifications: 'Certifications',
    recruiter: 'Recruiter View',
    contact: 'Contact',
  },
  socialLinks: {
    github: 'https://github.com/Ayushprakash21',
    linkedin: 'https://www.linkedin.com/in/ayushprakash',
    email: 'ayushprakash0021@gmail.com',
  },
  footerNote: 'Ayush Prakash — The Digital Universe • Three.js Spatial Experience + Private CMS',
  availabilityNote: 'Open to Strategic Operations & Product Roles',
};

export const DEFAULT_MEDIA_ASSETS: MediaAsset[] = [
  {
    id: 'media-1',
    name: 'Ayush_Prakash_Photo.png',
    url: '/images/creator/creator_1793142386775_044ada53_wall.png',
    type: 'image/png',
    sizeBytes: 3040243,
    uploadedAt: '2026-10-27T23:06:27.130Z',
    category: 'photo',
  },
  {
    id: 'media-2',
    name: 'Orion9_Admin_Console.png',
    url: '/images/orion9/admin-page.png',
    type: 'image/png',
    sizeBytes: 28251,
    uploadedAt: '2026-10-27T00:24:00.000Z',
    category: 'screenshot',
  },
  {
    id: 'media-3',
    name: 'Orion9_Branding_Console.png',
    url: '/images/orion9/admin-branding-tab.png',
    type: 'image/png',
    sizeBytes: 87561,
    uploadedAt: '2026-10-27T00:24:00.000Z',
    category: 'screenshot',
  },
  {
    id: 'media-4',
    name: 'ApplyVise_Logo.png',
    url: '/images/applyvise/applyvise-logo.png',
    type: 'image/png',
    sizeBytes: 691289,
    uploadedAt: '2026-11-03T09:03:00.000Z',
    category: 'screenshot',
  },
];

export const DEFAULT_HOMEPAGE_SETTINGS: HomepageSettings = {
  mainHeading: 'BUSINESS. SYSTEMS.',
  secondaryHeading: 'Intelligence & Innovation.',
  introParagraph:
    'Business operations professional exploring the intersection of supply chain management, enterprise systems, artificial intelligence and digital product innovation.',
  ctaText: "Let's Connect",
  ctaDestination: 'contact',
  scrollIndicatorText: 'SCROLL TO EXPLORE',
  heroVisibility: true,
  navLabels: {
    work: 'Work',
    experience: 'Experience',
    about: 'About',
    projects: 'Projects',
    contact: 'Contact',
  },
};

export const DEFAULT_ABOUT_SETTINGS: AboutSectionSettings = {
  heading:
    'Operating at the intersection of enterprise logistics, physical workflows, and autonomous digital systems.',
  quote:
    'Modern supply chains fail not from a lack of data, but from fragmented operational visibility between physical warehouses and enterprise software.',
  summary:
    'An operations professional exploring the intersection of enterprise systems, supply chain management, artificial intelligence and digital product development. Dedicated to building robust operating architectures, transparent logistics workflows, and high-signal digital platforms.',
  detailedText:
    'My operational background centers on orchestrating freight schedules, streamlining procurement pipelines, and translating on-the-ground warehouse hurdles into reliable software architectures. Through building independent platforms like Orion-9 and ApplyVise AI, I connect the rigor of supply chain execution with human-centric software.',
  physicalOpsHeading: 'Physical Operations',
  physicalOpsText:
    'Freight logistics, inventory replenishment, vendor coordination, and warehouse workflows.',
  digitalPlatformsHeading: 'Digital Platforms',
  digitalPlatformsText:
    'Enterprise SaaS, applied language models, ATS parsing systems, and distributed cloud backends.',
  contentBlocks: [
    {
      id: 'block-1',
      title: 'Systems Philosophy',
      content:
        'Resilient operations require single-source data integrity, deterministic exception handling, and deep integration with physical warehouse staff.',
      displayOrder: 1,
      isVisible: true,
    },
    {
      id: 'block-2',
      title: 'Applied Intelligence',
      content:
        'AI must serve as an amplifier of human decision-making, providing high-signal telemetry and transparent forecasting rather than opaque recommendations.',
      displayOrder: 2,
      isVisible: true,
    },
  ],
};

export const DEFAULT_RESUME_RECORD: ResumeRecord = {
  id: 'resume-primary',
  fileName: 'Ayush_Prakash_Resume.pdf',
  fileUrl: '/Ayush_Prakash_Resume.pdf',
  fileSizeBytes: 142800,
  uploadedAt: '2026-11-01',
  isActive: true,
  isPublicEnabled: true,
  buttonText: 'Download Curriculum Vitae',
};

export const DEFAULT_SECTIONS_CONFIG: SectionConfig[] = [
  { id: 'sec-about', sectionKey: 'about', title: 'About Profile', subtitle: 'Background & Philosophy', displayOrder: 1, isVisible: true, status: 'published' },
  { id: 'sec-experience', sectionKey: 'experience', title: 'Experience', subtitle: 'Career Timeline', displayOrder: 2, isVisible: true, status: 'published' },
  { id: 'sec-capabilities', sectionKey: 'capabilities', title: 'Capabilities', subtitle: 'Disciplines & Tools', displayOrder: 3, isVisible: true, status: 'published' },
  { id: 'sec-orion9', sectionKey: 'orion9', title: 'Orion-9 Showcase', subtitle: 'Flagship Case Study', displayOrder: 4, isVisible: true, status: 'published' },
  { id: 'sec-applyvise', sectionKey: 'applyvise', title: 'ApplyVise AI', subtitle: 'Product Innovation', displayOrder: 5, isVisible: true, status: 'published' },
  { id: 'sec-certifications', sectionKey: 'certifications', title: 'Accreditations', subtitle: 'Verified Credentials', displayOrder: 6, isVisible: true, status: 'published' },
  { id: 'sec-education', sectionKey: 'education', title: 'Education', subtitle: 'Academic Foundation', displayOrder: 7, isVisible: true, status: 'published' },
  { id: 'sec-contact', sectionKey: 'contact', title: 'Contact', subtitle: 'Direct Transmission', displayOrder: 8, isVisible: true, status: 'published' },
];

export const DEFAULT_APPEARANCE_SETTINGS: AppearanceSettings = {
  primaryBg: '#111514',
  cardBg: '#18201D',
  textPrimary: '#F4F3EE',
  textSecondary: '#C1C4BE',
  accentColor: '#8294A6',
  headingFont: 'Manrope',
  bodyFont: 'Manrope',
  sectionSpacing: 'normal',
};
