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
} from '../types/cms';

export const DEFAULT_PROFILE: ProfileData = {
  name: 'Ayush Prakash',
  headline: 'Business Operations. Supply Chain Intelligence. AI-Powered Product Innovation.',
  bio: 'An operations professional exploring the intersection of enterprise systems, supply chain management, artificial intelligence and digital product development. Dedicated to building robust operating architectures, transparent logistics workflows, and high-signal digital platforms.',
  profilePhoto: 'https://orion9-r2-brand-uploader.ayushprakash0021.workers.dev/cdn/branding/creator/creator_1793142386775_044ada53_wall.png',
  email: 'ayushprakash0021@gmail.com',
  phone: '+91 (Direct upon request)',
  linkedinUrl: 'https://www.linkedin.com/in/ayushprakash',
  githubUrl: 'https://github.com/Ayushprakash21',
  resumeUrl: '/Ayush_Prakash_Resume.pdf',
  availabilityStatus: 'Open to Strategic Operations & Product Roles',
  location: 'Bengaluru, India',
};

export const DEFAULT_EXPERIENCES: ExperienceRecord[] = [
  {
    id: 'exp-1',
    employer: 'Enterprise Operations & Supply Logistics Practice',
    jobTitle: 'Operations & Systems Specialist',
    startDate: '2024',
    endDate: 'Present',
    location: 'Bengaluru, India',
    description:
      'Leading supply chain operations intelligence initiatives, streamlining multi-tier logistics pipelines, and bridging enterprise ERP processes with modern data architectures.',
    responsibilities: [
      'Engineered operational playbooks for freight route tracking, reducing shipment anomaly resolution time.',
      'Designed end-to-end procurement workflows connecting suppliers, storage centers, and field delivery units.',
      'Coordinated cross-functional stakeholders between ground logistics teams, supply managers, and software engineers.',
      'Evaluated operational data feeds to eliminate inventory discrepancies and improve delivery predictability.',
    ],
    skillsUsed: ['Supply Chain Optimization', 'Operations Strategy', 'ERP Workflows', 'Vendor Procurement', 'Data Analytics'],
    displayOrder: 1,
    status: 'published',
  },
  {
    id: 'exp-2',
    employer: 'Digital Product Development & Research',
    jobTitle: 'Product Operations & Architecture Lead',
    startDate: '2023',
    endDate: '2024',
    location: 'Bengaluru, India',
    description:
      'Managed end-to-end operational planning and technical specifications for proprietary SaaS and systems tools, ensuring data integrity and user-first execution.',
    responsibilities: [
      'Structured technical requirements and operational roadmaps for internal inventory and resource allocation tools.',
      'Collaborated on database schema design (SQLite / D1) for zero-latency distributed data capture.',
      'Audited applicant tracking flows and career evaluation criteria to design transparent matching heuristics.',
      'Standardized documentation and deployment pipelines across distributed cloud workers.',
    ],
    skillsUsed: ['Product Operations', 'System Roadmapping', 'Technical Specification', 'Database Design', 'Process Mapping'],
    displayOrder: 2,
    status: 'published',
  },
];

export const DEFAULT_PROJECTS: ProjectRecord[] = [
  {
    id: 'orion-9',
    name: 'Orion-9',
    category: 'Enterprise Supply Chain OS',
    subtitle: 'AI-Powered Supply Chain Operating System',
    description:
      'Conceived and engineered to answer the foundational question: "What if the supply chain had an operating system?" Combines edge telemetry ingestion, zero-trust cryptographic event verification, and a centralized logistics control tower to unify fragmented procurement and shipping stages.',
    coverImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    screenshots: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
    ],
    technologyStack: ['TypeScript', 'Edge Telemetry Protocol', 'Mutual TLS', 'Cloudflare Workers', 'Distributed Queuing', 'React'],
    features: [
      'End-to-End Pipeline Visualization: Supplier → Procurement → Inventory → Warehouse → Shipment → Customer',
      'Zero-Trust Event Logging: Cryptographically verifies shipment integrity at transit handoffs',
      'Telemetry Streaming: Battery-optimized edge ingestion for mobile and warehouse sensor nodes',
      'Operational Control Tower: Sub-second anomaly triaging and route contingency alerts',
    ],
    developmentStatus: 'Active Exploration & Architecture Specification',
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
    coverImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
    screenshots: [
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80',
    ],
    technologyStack: ['React 19', 'TypeScript', 'Google Gemini API', 'Vector Embeddings', 'Cloudflare D1 SQL', 'Tailwind Tokens'],
    features: [
      'Interactive Workflow: Resume → Analysis → Job Requirements → Skills Gap → Application Preparation',
      'Honest Career Fit Engine: Evaluates suitability without hallucinating spurious 99% match scores',
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
  {
    id: 'edge-telemetry-bench',
    name: 'Distributed Telemetry Benchmark',
    category: 'Systems Exploration',
    subtitle: 'Low-Latency Event Pipeline Prototype',
    description:
      'A benchmark suite measuring throughput and memory overhead of edge message queues operating under intermittent connectivity conditions typical in logistics yards.',
    screenshots: [],
    technologyStack: ['Node.js', 'WebSockets', 'SQLite WAL', 'Docker'],
    features: [
      'Simulated packet loss rate handling up to 35%',
      'Automatic backpressure regulation for constrained field devices',
      'Zero-packet-drop persistent buffer flush on reconnection',
    ],
    developmentStatus: 'Completed Research Prototype',
    featured: false,
    displayOrder: 3,
    status: 'published',
  },
];

export const DEFAULT_CERTIFICATIONS: CertificationRecord[] = [
  {
    id: 'cert-gcp-architect',
    title: 'Google Cloud Professional Cloud Architect',
    issuer: 'Google Cloud',
    completionDate: '2024',
    expiryDate: '2027',
    credentialId: 'GCP-PCA-89410',
    verificationUrl: 'https://cloud.google.com/certification',
    category: 'Cloud Architecture & Infrastructure',
    highlightTag: 'CLOUD ARCHITECTURE',
    status: 'published',
  },
  {
    id: 'cert-genai-llm',
    title: 'Generative AI & LLM Systems Specialization',
    issuer: 'DeepLearning.AI / Industry Partner',
    completionDate: '2024',
    credentialId: 'DLAI-GENAI-5421',
    verificationUrl: 'https://deeplearning.ai',
    category: 'Applied Artificial Intelligence',
    highlightTag: 'APPLIED AI & RAG',
    status: 'published',
  },
  {
    id: 'cert-supply-chain',
    title: 'Supply Chain Operations & Logistics Strategy',
    issuer: 'Professional Operations Institute',
    completionDate: '2023',
    credentialId: 'SC-OPS-7729',
    verificationUrl: 'https://www.coursera.org',
    category: 'Supply Chain Management',
    highlightTag: 'OPERATIONS EXCELLENCE',
    status: 'published',
  },
];

export const DEFAULT_SKILLS: SkillRecord[] = [
  // Business Operations & Strategy
  { id: 'sk-1', name: 'Supply Chain Operations', category: 'Supply Chain & Logistics Systems', description: 'Logistics routing, order lifecycle orchestration, and warehouse synchronization.', displayOrder: 1 },
  { id: 'sk-2', name: 'Procurement & Vendor Workflows', category: 'Supply Chain & Logistics Systems', description: 'Supplier SLA tracking, contract management, and inventory replenishment cycles.', displayOrder: 2 },
  { id: 'sk-3', name: 'Operations Analytics & KPIs', category: 'Business Operations & Strategy', description: 'Bottleneck diagnosis, lead-time reduction, and process automation metrics.', displayOrder: 3 },
  { id: 'sk-4', name: 'Cross-Functional Program Execution', category: 'Business Operations & Strategy', description: 'Unifying operational teams, field stakeholders, and engineering squads.', displayOrder: 4 },
  
  // AI & Product Innovation
  { id: 'sk-5', name: 'Applied AI & LLM Integration', category: 'AI & Applied Product Innovation', description: 'Leveraging Gemini APIs, semantic embeddings, and vector similarity for workflows.', displayOrder: 5 },
  { id: 'sk-6', name: 'ATS & Semantic Document Parsing', category: 'AI & Applied Product Innovation', description: 'Token extraction, resume AST evaluation, and structured gap diagnostics.', displayOrder: 6 },
  { id: 'sk-7', name: 'Product Roadmapping & UI/UX', category: 'AI & Applied Product Innovation', description: 'Designing clean, high-density interfaces with clear user mental models.', displayOrder: 7 },

  // Full-Stack & Cloud Architecture
  { id: 'sk-8', name: 'Cloudflare Workers & Edge Runtime', category: 'Full-Stack & Cloud Architecture', description: 'V8 isolates, sub-50ms worldwide API endpoints, and serverless compute.', displayOrder: 8 },
  { id: 'sk-9', name: 'D1 & Relational Data Modeling', category: 'Full-Stack & Cloud Architecture', description: 'Distributed SQLite, schema migrations, and transactional integrity.', displayOrder: 9 },
  { id: 'sk-10', name: 'React 19 & TypeScript', category: 'Full-Stack & Cloud Architecture', description: 'Strict typing, state machines, and performant component lifecycles.', displayOrder: 10 },
  { id: 'sk-11', name: 'Three.js & Spatial Interactive Web', category: 'Full-Stack & Cloud Architecture', description: 'Custom geometries, camera projection, lighting, and 3D storytelling.', displayOrder: 11 },
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
      'Focus on Industrial Operations, Supply Chain Systems, and Applied Computation.',
      'Graduated with honors in operational modeling and database systems.',
    ],
    displayOrder: 1,
  },
];

export const DEFAULT_CONTACT_MESSAGES: ContactMessage[] = [
  {
    id: 'msg-sample-1',
    name: 'Elena Rostova',
    email: 'elena.rostova@global-logistics.tech',
    organization: 'Logistics Innovation Advisory',
    subject: 'Discussion on Orion-9 Operating System Architecture',
    message: 'Hello Ayush, we reviewed your specifications for Orion-9 edge telemetry. We would love to schedule a brief discussion regarding potential synergies with our logistics supply chain research.',
    createdAt: '2026-10-31T09:15:00.000Z',
    read: false,
    archived: false,
  },
  {
    id: 'msg-sample-2',
    name: 'Marcus Vance',
    email: 'mvance@talentcapital.io',
    organization: 'Talent Capital Partners',
    subject: 'Consulting Opportunity: Career Intelligence Systems',
    message: 'Ayush, your transparent career fit engine in ApplyVise AI addresses a key problem in recruitment. Let us know when you might have 20 minutes to connect.',
    createdAt: '2026-10-28T14:40:00.000Z',
    read: true,
    archived: false,
  },
];

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteTitle: 'Ayush Prakash | Business Operations, Supply Chain Intelligence & Product Innovation',
  siteDescription: 'Personal portfolio of Ayush Prakash exploring enterprise systems, supply chain operating architecture (Orion-9), and AI career intelligence (ApplyVise AI).',
  navLabels: {
    home: '3D Spatial',
    about: 'About',
    experience: 'Experience',
    skills: 'Capabilities',
    orion9: 'Orion-9',
    applywise: 'ApplyVise AI',
    architecture: 'Architecture',
    certifications: 'Certifications',
    recruiter: 'Recruiter Brief',
    contact: 'Contact',
  },
  socialLinks: {
    github: 'https://github.com/Ayushprakash21',
    linkedin: 'https://www.linkedin.com/in/ayushprakash',
    email: 'ayushprakash0021@gmail.com',
  },
  footerNote: 'Engineered with Precision • Spatial 3D Experience + Dynamic CMS',
  availabilityNote: 'Available for Strategic Operations & Product Leadership Roles',
};

export const DEFAULT_MEDIA_ASSETS: MediaAsset[] = [
  {
    id: 'media-1',
    name: 'Ayush_Prakash_Profile_Photo.png',
    url: 'https://orion9-r2-brand-uploader.ayushprakash0021.workers.dev/cdn/branding/creator/creator_1793142386775_044ada53_wall.png',
    type: 'image/png',
    sizeBytes: 3040243,
    uploadedAt: '2026-10-27T23:06:27.130Z',
    category: 'photo',
  },
  {
    id: 'media-2',
    name: 'Orion9_Supply_Chain_Overview.png',
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    type: 'image/jpeg',
    sizeBytes: 845200,
    uploadedAt: '2026-10-28T10:14:00.000Z',
    category: 'screenshot',
  },
  {
    id: 'media-3',
    name: 'ApplyVise_AI_Architecture.png',
    url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
    type: 'image/jpeg',
    sizeBytes: 654100,
    uploadedAt: '2026-10-29T11:22:00.000Z',
    category: 'screenshot',
  },
  {
    id: 'media-4',
    name: 'Ayush_Prakash_Resume.pdf',
    url: '/Ayush_Prakash_Resume.pdf',
    type: 'application/pdf',
    sizeBytes: 245000,
    uploadedAt: '2026-11-01T08:00:00.000Z',
    category: 'resume',
  },
];
