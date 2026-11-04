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
  OpenToWorkSettings,
  PreferredLocation,
  ResumeGeneratorSettings,
  ResumeVersionRecord,
} from '../types/cms';

export const DEFAULT_PROFILE: ProfileData = {
  firstName: 'Ayush',
  lastName: 'Prakash',
  additionalName: '',
  pronouns: 'He/Him',
  name: 'Ayush Prakash',
  headline:
    'AI & Automation Professional | Supply Chain & Operations | Generative AI | Claude AI | AI Agents | Building AI-Powered Products & Intelligent Business Solutions',
  bio: 'An operations professional exploring the intersection of enterprise systems, supply chain management, artificial intelligence and digital product development. Dedicated to building robust operating architectures, transparent logistics workflows, and high-signal digital platforms.',
  countryRegion: 'India',
  stateProvince: 'Madhya Pradesh',
  city: 'Indore',
  location: 'Indore, Madhya Pradesh, India',
  profilePhoto: '/images/creator/creator_1793142386775_044ada53_wall.png',
  coverImage: '/images/creator/creator_1793142386775_044ada53_wall.png',
  email: 'ayushprakash0021@gmail.com',
  phone: '+91 (Available on request)',
  linkedinUrl: 'https://www.linkedin.com/in/ayushprakash',
  githubUrl: 'https://github.com/Ayushprakash21',
  portfolioUrl: 'https://resume-portfolio.ayushprakash0021.workers.dev',
  resumeUrl: '/Ayush_Prakash_Resume.pdf',
  resumeButtonText: 'Download Curriculum Vitae',
  isResumeDownloadEnabled: true,
  availabilityStatus: 'Open to Strategic Roles & Collaborations',
  status: 'published',
};

export const DEFAULT_EXPERIENCES: ExperienceRecord[] = [
  {
    id: 'exp-1',
    employer: 'Enterprise Operations & Supply Logistics',
    jobTitle: 'Operations & Systems Specialist',
    employmentType: 'Full-time',
    location: 'Bengaluru, India',
    locationType: 'Hybrid',
    startMonth: 'January',
    startYear: '2024',
    startDate: 'Jan 2024',
    endDate: 'Present',
    isCurrent: true,
    description:
      'Focusing on supply chain operations intelligence, multi-tier logistics coordination, and bridging legacy ERP workflows with modern distributed data architectures.',
    responsibilities: [
      'Documenting and standardizing end-to-end procurement workflows connecting suppliers, storage centers, and field transit.',
      'Analyzing logistics data feeds to identify process bottlenecks and improve shipping visibility.',
      'Facilitating cross-functional coordination between warehouse operations, inventory managers, and technical teams.',
      'Mapping edge telemetry specifications for resilient in-transit event logging.',
    ],
    achievements: [
      'Reduced order exception resolution latency by implementing structured triage logs.',
      'Designed standardized handoff verification protocol for regional storage hubs.',
    ],
    impact: 'Established transparent visibility across multi-echelon transit paths, eliminating orphaned inventory tickets.',
    skillsUsed: ['Supply Chain Operations', 'Logistics Workflow Mapping', 'ERP Systems', 'Data Analysis', 'Process Engineering'],
    logoUrl: '/images/creator/creator_1793142386775_044ada53_wall.png',
    mediaItems: [
      {
        id: 'exp-med-1',
        url: '/images/orion9/admin-page.png',
        title: 'Operations Dashboard Handoff',
        caption: 'Central operations telemetry portal tracking transit state across regional fulfillment hubs.',
        altText: 'Operations Control Console interface screenshot',
        type: 'image',
      },
    ],
    displayOrder: 1,
    status: 'published',
  },
  {
    id: 'exp-2',
    employer: 'Independent Product Development & Research',
    jobTitle: 'Product Operations & Architecture Lead',
    employmentType: 'Founder / Self-employed',
    location: 'Bengaluru, India',
    locationType: 'Remote',
    startMonth: 'June',
    startYear: '2023',
    endMonth: 'December',
    endYear: '2024',
    startDate: 'Jun 2023',
    endDate: 'Dec 2024',
    isCurrent: false,
    description:
      'Spearheading research, system specifications, and architectural design for proprietary software platforms including Orion-9 and ApplyVise AI.',
    responsibilities: [
      'Authored comprehensive system specifications and relational schema models for edge-deployed database systems.',
      'Researched applicant tracking systems (ATS) parsing behavior to design non-hallucinatory skill matching heuristics.',
      'Developed responsive user interfaces and operational control tower dashboards using React, TypeScript, and Three.js.',
      'Maintained deployment pipelines and edge isolation policies on Cloudflare Workers and D1.',
    ],
    achievements: [
      'Architected Orion-9 end-to-end prototype with sub-50ms global routing on Cloudflare edge.',
      'Formulated non-hallucinatory semantic resume parsing heuristic for ApplyVise AI.',
    ],
    skillsUsed: ['Product Strategy', 'System Architecture', 'React 19 & TypeScript', 'Edge Computing', 'Interface Design'],
    logoUrl: '/images/applyvise/applyvise-logo.png',
    mediaItems: [
      {
        id: 'exp-med-2',
        url: '/images/applyvise/applyvise-logo.png',
        title: 'ApplyVise AI Architecture Blueprint',
        caption: 'Career intelligence pipeline with AST parser and semantic vector matching.',
        altText: 'ApplyVise AI logo and architecture schematic',
        type: 'image',
      },
    ],
    displayOrder: 2,
    status: 'published',
  },
];

export const DEFAULT_PROJECTS: ProjectRecord[] = [
  {
    id: 'orion-9',
    name: 'Orion-9',
    category: 'Supply Chain Operating System',
    subtitle: 'AI-Powered Autonomous Supply Chain Operating System',
    shortDescription: 'Bridges real-time warehouse execution, freight route intelligence, and dynamic supplier procurement for integrated supply chain operations.',
    description:
      'Conceived and engineered to answer the foundational question: "What if the supply chain had an operating system?" Orion-9 addresses the severe fragmentation between supplier procurement, inventory warehousing, and multi-tier freight transit through edge streaming telemetry and cryptographic event verification.',
    coverImage: '/images/orion9/admin-page.png',
    logoUrl: '/images/orion9/orion9-logo.svg',
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
    contentBlocks: {
      overview: 'Conceived and engineered to answer the foundational question: "What if the supply chain had an operating system?" Orion-9 unites disparate ERP records with live physical transit handoffs.',
      problemStatement: 'Modern enterprise supply chains lose millions to fragmented custody handoffs, delayed EDI feeds, and orphaned inventory batches between warehouse management systems.',
      proposedSolution: 'A unified edge operating system providing zero-trust cryptographic event verification and real-time streaming telemetry across suppliers, warehouses, and freight carriers.',
      features: [
        'End-to-End Pipeline Visualization',
        'Cryptographic Transit Handoff Verification',
        'Edge Sensor Ingestion via Cloudflare Workers',
        'Operational Control Tower Dashboard',
      ],
      architecture: 'Distributed edge architecture leveraging Cloudflare Workers V8 isolates, mutual TLS telemetry streams, and immutable hash-linked custody ledgers.',
      technologyStack: ['TypeScript', 'Cloudflare Workers', 'Three.js', 'React 19', 'Edge Telemetry Protocol', 'Mutual TLS'],
      contribution: 'Sole founder and systems architect: designed protocol specifications, UI/UX control tower, and relational edge schemas.',
      outcomes: 'Validated end-to-end simulation across 6 procurement-to-delivery lifecycle phases with zero data loss under simulated network dropouts.',
      futureRoadmap: 'Integration with hardware BLE beacons and automated multi-carrier bill-of-lading smart contract arbitration.',
    },
    skillsUsed: ['Supply Chain', 'AI & Automation', 'Operations'],
    mediaItems: [
      {
        id: 'orion-m-1',
        url: '/images/orion9/admin-page.png',
        title: 'Control Tower Console',
        caption: 'Operational Control Tower monitoring global shipment handoffs and custody state.',
        altText: 'Orion-9 Admin Page Screenshot',
        type: 'image',
        isThumbnail: true,
      },
      {
        id: 'orion-m-2',
        url: '/images/orion9/admin-branding-tab.png',
        title: 'Branding & Enterprise Identity',
        caption: 'Multi-tenant enterprise branding and configuration interface.',
        altText: 'Orion-9 Branding Configuration Screenshot',
        type: 'image',
        isLogo: true,
      },
      {
        id: 'orion-m-3',
        url: '/images/orion9/login-view.png',
        title: 'Zero-Trust Portal Gate',
        caption: 'Role-based zero-trust access gateway for logistics controllers and station staff.',
        altText: 'Orion-9 Login View',
        type: 'image',
      },
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
    subtitle: 'AI-Powered Career Intelligence & Job Application Platform',
    shortDescription: 'An intelligent career platform that replaces opaque ATS rejections with transparent resume diagnostics, high-accuracy job alignment, and structured application intelligence.',
    description:
      'An independent product development initiative designed to transform career evaluation and job applications. Unlike tools that inflate compatibility claims, ApplyVise AI applies grounded semantic reasoning to diagnose genuine skill gaps, optimize ATS parsing fidelity, and simplify application workflows.',
    coverImage: '/images/applyvise/applyvise-logo.svg',
    logoUrl: '/images/applyvise/applyvise-logo.svg',
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
    contentBlocks: {
      overview: 'ApplyVise AI transforms job discovery, career evaluation, and application workflows using grounded semantic AI reasoning and deterministic AST resume parsing.',
      problemStatement: 'Most AI career tools produce deceptive 95%+ match ratings that fail ATS parsers and mislead candidates into wasted application cycles.',
      proposedSolution: 'An objective career intelligence engine that breaks job descriptions and resumes into semantic skill nodes, highlighting exact gaps without false assurances.',
      features: [
        'AST Resume Parser preventing formatting rejection',
        'Transparent Skill Gap Diagnostics',
        'Semantic Role Aggregator and Deduplicator',
        'Application Asset Customizer with Grounded Heuristics',
      ],
      architecture: 'Client-side vector similarity combined with Gemini 1.5 structured schema extraction and Cloudflare D1 distributed SQLite caching.',
      technologyStack: ['React 19', 'TypeScript', 'Google Gemini API', 'Vector Embeddings', 'Cloudflare D1 SQL'],
      contribution: 'Founder & Full-Stack Architect: engineered AST parser, designed user experience, and integrated LLM evaluation pipelines.',
      outcomes: 'Built functioning prototype validating honest skill diagnostics across 100+ standard engineering and operations job specifications.',
      futureRoadmap: 'Autonomous interview scenario generation and automated portfolio matching for verified candidates.',
    },
    skillsUsed: ['Career Tech', 'AI', 'Job Search'],
    mediaItems: [
      {
        id: 'applyvise-m-1',
        url: '/images/applyvise/applyvise-logo.png',
        title: 'ApplyVise AI Brand Emblem',
        caption: 'Official emblem and mark of ApplyVise AI career intelligence platform.',
        altText: 'ApplyVise AI Logo',
        type: 'image',
        isThumbnail: true,
        isLogo: true,
      },
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
    id: 'cert-claude',
    title: 'Claude AI Architecture & Agent Systems',
    issuer: 'Anthropic / Claude Academy',
    issueMonth: 'October',
    issueYear: '2025',
    completionDate: 'October 2025',
    doesNotExpire: true,
    category: 'Applied Artificial Intelligence',
    highlightTag: 'CLAUDE AGENTS',
    description: 'Comprehensive study and practical verification of Claude models, prompt caching, tool use, and multi-agent coordination frameworks.',
    skillsUsed: ['Claude AI', 'AI Agents', 'Prompt Architecture', 'Tool Use', 'Structured Output'],
    verificationUrl: 'https://anthropic.com',
    displayOrder: 1,
    status: 'published',
  },
  {
    id: 'cert-1',
    title: 'Google Cloud Professional Cloud Architect',
    issuer: 'Google Cloud',
    issueMonth: 'August',
    issueYear: '2024',
    completionDate: 'August 2024',
    doesNotExpire: false,
    expiryDate: 'August 2027',
    category: 'Cloud Architecture & Infrastructure',
    highlightTag: 'CLOUD ARCHITECTURE',
    description: 'Enterprise cloud solution design, security boundaries, multi-region high availability, and network topologies on GCP.',
    skillsUsed: ['Cloud Architecture', 'GCP', 'Distributed Systems', 'Security'],
    verificationUrl: 'https://cloud.google.com/certification',
    displayOrder: 2,
    status: 'published',
  },
  {
    id: 'cert-2',
    title: 'Generative AI & LLM Systems Specialization',
    issuer: 'DeepLearning.AI',
    issueMonth: 'May',
    issueYear: '2024',
    completionDate: 'May 2024',
    doesNotExpire: true,
    category: 'Applied Artificial Intelligence',
    highlightTag: 'APPLIED AI & RAG',
    description: 'Transformer architectures, retrieval-augmented generation (RAG), vector embeddings, and fine-tuning evaluation loops.',
    skillsUsed: ['Generative AI', 'Vector Embeddings', 'RAG', 'LLM Architecture'],
    verificationUrl: 'https://www.deeplearning.ai',
    displayOrder: 3,
    status: 'published',
  },
  {
    id: 'cert-3',
    title: 'Supply Chain Operations & Logistics Strategy',
    issuer: 'Professional Operations Institute',
    issueMonth: 'March',
    issueYear: '2024',
    completionDate: 'March 2024',
    doesNotExpire: true,
    category: 'Supply Chain Management',
    highlightTag: 'OPERATIONS EXCELLENCE',
    description: 'Multi-echelon inventory modeling, procurement contract standards, warehouse layout optimization, and freight logistics.',
    skillsUsed: ['Supply Chain Operations', 'Logistics Workflow Mapping', 'Process Engineering'],
    displayOrder: 4,
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
  content:
    'Operating at the intersection of enterprise logistics, physical workflows, and autonomous digital systems.\n\nAn operations professional exploring the intersection of enterprise systems, supply chain management, artificial intelligence and digital product development. Dedicated to building robust operating architectures, transparent logistics workflows, and high-signal digital platforms.\n\nKey Focus Areas:\n• Physical Operations: Freight logistics, inventory replenishment, vendor coordination, and warehouse workflows.\n• Digital Platforms: Enterprise SaaS, applied language models, ATS parsing systems, and distributed cloud backends.\n• Applied Intelligence: Building AI-powered platforms like Orion-9 and ApplyVise AI to empower human decision-making with transparent, grounded telemetry.',
  physicalOpsHeading: 'Physical Operations',
  physicalOpsText:
    'Freight logistics, inventory replenishment, vendor coordination, and warehouse workflows.',
  digitalPlatformsHeading: 'Digital Platforms',
  digitalPlatformsText:
    'Enterprise SaaS, applied language models, ATS parsing systems, and distributed cloud backends.',
  status: 'published',
  characterCount: 842,
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

export const DEFAULT_RESUME_VERSIONS: ResumeVersionRecord[] = [
  {
    id: 'res-v1',
    versionNumber: 1,
    fileName: 'Ayush_Prakash_Resume.pdf',
    fileUrl: '/Ayush_Prakash_Resume.pdf',
    fileType: 'pdf',
    fileSizeBytes: 142800,
    uploadedAt: '2026-11-01',
    uploadedBy: 'Ayush Prakash (Admin)',
    processingStatus: 'published',
    extractionStatus: 'success',
    isActive: true,
    isPublicEnabled: true,
    buttonText: 'Download Curriculum Vitae',
    versionName: 'Authoritative Production Resume v1.0',
    notes: 'Initial production baseline CV with verified credentials and contact info.',
  },
];

export const DEFAULT_RESUME_GENERATOR_SETTINGS: ResumeGeneratorSettings = {
  enabled: true,
  title: 'Generate My Resume',
  description: 'Generate a professional, ATS-friendly resume using the information published on this website.',
  includeSummary: true,
  customSummary: '',
  includeExperience: true,
  includeProjects: true,
  includeSkills: true,
  includeEducation: true,
  includeCertifications: true,
  includeContactInfo: {
    email: true,
    phone: false,
    location: true,
    linkedin: true,
    github: true,
    portfolio: true,
  },
  sectionOrder: ['summary', 'skills', 'experience', 'projects', 'education', 'certifications'],
};

export const DEFAULT_OPEN_TO_WORK_SETTINGS: OpenToWorkSettings = {
  enabled: true,
  badgeText: 'OPEN TO WORK',
  sectionHeading: 'OPEN TO OPPORTUNITIES',
  headline: "Building What's Next.",
  description:
    'Actively exploring strategic leadership and operations opportunities combining business operations, global supply chain strategy, enterprise systems architecture, and generative AI innovation. Ready to deliver immediate value to ambitious teams worldwide.',
  availabilityStatus: 'Open to opportunities',
  employmentPreferences: [
    'Full-time',
    'Contract',
    'Permanent',
    'Consulting',
    'Freelance',
    'Remote',
  ],
  workArrangements: [
    'Remote',
    'Hybrid',
    'On-site',
    'International relocation',
    'Open to discussion',
  ],
  preferredLocations: [
    { id: 'loc-1', name: 'India', city: 'Bengaluru / Hybrid / Remote', remoteAvailable: true, relocationWilling: false, isVisible: true, displayOrder: 1 },
    { id: 'loc-2', name: 'Germany', city: 'Berlin / Munich / Frankfurt', remoteAvailable: true, relocationWilling: true, isVisible: true, displayOrder: 2 },
    { id: 'loc-3', name: 'Netherlands', city: 'Amsterdam / Rotterdam', remoteAvailable: true, relocationWilling: true, isVisible: true, displayOrder: 3 },
    { id: 'loc-4', name: 'Japan', city: 'Tokyo', remoteAvailable: true, relocationWilling: true, isVisible: true, displayOrder: 4 },
    { id: 'loc-5', name: 'United Kingdom', city: 'London', remoteAvailable: true, relocationWilling: true, isVisible: true, displayOrder: 5 },
    { id: 'loc-6', name: 'United Arab Emirates', city: 'Dubai / Abu Dhabi', remoteAvailable: true, relocationWilling: true, isVisible: true, displayOrder: 6 },
    { id: 'loc-7', name: 'Singapore', city: 'Singapore', remoteAvailable: true, relocationWilling: true, isVisible: true, displayOrder: 7 },
    { id: 'loc-8', name: 'Other International', city: 'Global Remote / Discussion', remoteAvailable: true, relocationWilling: true, isVisible: true, displayOrder: 8 },
  ],
  preferredJobCategories: [
    'Project Management',
    'Supply Chain Management',
    'Supply Chain Operations',
    'Business Operations',
    'AI & Automation',
    'Product Operations',
    'Enterprise Systems',
    'Digital Transformation',
    'AI Product Development',
  ],
  primaryCtaText: 'Discuss an Opportunity ↗',
  primaryCtaLink: '#contact',
  secondaryCtaText: 'Download Resume ↓',
  secondaryCtaLink: '/Ayush_Prakash_Resume.pdf',
  status: 'published',
  updatedAt: '2026-11-03',
};

export const DEFAULT_SECTIONS_CONFIG: SectionConfig[] = [
  { id: 'sec-about', sectionKey: 'about', title: 'About Profile', subtitle: 'Background & Philosophy', displayOrder: 1, isVisible: true, status: 'published' },
  { id: 'sec-opentowork', sectionKey: 'openToWork', title: 'Open to Work', subtitle: 'Career Availability & Preferences', displayOrder: 2, isVisible: true, status: 'published' },
  { id: 'sec-experience', sectionKey: 'experience', title: 'Experience', subtitle: 'Career Timeline', displayOrder: 3, isVisible: true, status: 'published' },
  { id: 'sec-capabilities', sectionKey: 'capabilities', title: 'Capabilities', subtitle: 'Concave Carousel & Specialized Expertise', displayOrder: 4, isVisible: true, status: 'published' },
  { id: 'sec-projects', sectionKey: 'projects', title: 'Selected Projects', subtitle: 'Compact Presentation & Case Studies', displayOrder: 5, isVisible: true, status: 'published' },
  { id: 'sec-orion9', sectionKey: 'orion9', title: 'Orion-9 Case Study', subtitle: 'Integrated in Concave Carousel', displayOrder: 6, isVisible: false, status: 'draft' },
  { id: 'sec-applyvise', sectionKey: 'applyvise', title: 'ApplyVise AI Case Study', subtitle: 'Integrated in Concave Carousel', displayOrder: 7, isVisible: false, status: 'draft' },
  { id: 'sec-certifications', sectionKey: 'certifications', title: 'Accreditations', subtitle: 'Verified Credentials', displayOrder: 8, isVisible: true, status: 'published' },
  { id: 'sec-education', sectionKey: 'education', title: 'Education', subtitle: 'Academic Foundation', displayOrder: 9, isVisible: true, status: 'published' },
  { id: 'sec-contact', sectionKey: 'contact', title: 'Contact', subtitle: 'Direct Transmission', displayOrder: 10, isVisible: true, status: 'published' },
];

export const DEFAULT_APPEARANCE_SETTINGS: AppearanceSettings = {
  primaryBg: '#050505',
  cardBg: 'rgba(255, 255, 255, 0.045)',
  textPrimary: '#F5F5F5',
  textSecondary: '#A5A5A9',
  accentColor: '#C8C8CE',
  headingFont: 'Manrope',
  bodyFont: 'Manrope',
  sectionSpacing: 'normal',
};
