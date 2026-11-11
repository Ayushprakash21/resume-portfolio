import { initializeApp } from 'firebase/app';
import { getAuth, EmailAuthProvider, signInWithCredential } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import fs from 'node:fs';

const firebaseConfig = {
  projectId: 'orion9-dev-db-2026',
  appId: '1:1031466156269:web:1d8b92bd6adea9b09b8ce4',
  apiKey: 'AIzaSyC5qgG4DkMfCEdhNYHIb8hsIQ00pIkYRGo',
  authDomain: 'orion9-dev-db-2026.firebaseapp.com',
  storageBucket: 'orion9-dev-db-2026.firebasestorage.app',
};

const NOW = new Date().toISOString();

async function main() {
  console.log('=== PHASE 1: AUTHENTICATING WITH FIRESTORE ===');
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const cred = EmailAuthProvider.credential(
    'ayush-admin@portfolio.internal',
    'AP-Admin-Secure-2026-Vault-7f89b'
  );
  const userCred = await signInWithCredential(auth, cred);
  console.log('Authenticated as:', userCred.user.email);

  const db = getFirestore(app);

  // Read current live state before modifying
  const profileRef = doc(db, 'profile', 'main');
  const existingProfileSnap = await getDoc(profileRef);
  const existingProfile = existingProfileSnap.exists() ? existingProfileSnap.data() : {};

  const aboutRef = doc(db, 'settings', 'about');
  const existingAboutSnap = await getDoc(aboutRef);
  const existingAbout = existingAboutSnap.exists() ? existingAboutSnap.data() : {};

  const orionRef = doc(db, 'projects', 'orion-9');
  const existingOrion = (await getDoc(orionRef)).data() || {};

  const applywiseRef = doc(db, 'projects', 'applywise-ai');
  const existingApplywise = (await getDoc(applywiseRef)).data() || {};

  const exp1Ref = doc(db, 'experiences', 'exp-1');
  const existingExp1 = (await getDoc(exp1Ref)).data() || {};

  const summaryText =
    'Operations professional with over five years in IT services, consulting and project work. Currently in supply chain operations at TCS, covering order management, fulfillment coordination and exception handling. Previously an Associate Project Manager on 30+ web development projects, and at Accenture implemented OpenText Vendor Invoice Management for client companies. Also designs AI platforms for supply chain and careers (Orion-9, ApplyWise AI). MBA in IT and Marketing. Looking for supply chain operations, project coordination or business operations roles.';

  const correctedProfile = {
    ...existingProfile,
    firstName: 'Ayush',
    lastName: 'Prakash',
    name: 'Ayush Prakash',
    headline: 'Supply Chain Operations | Project Coordination | Business Operations',
    location: 'Indore, Madhya Pradesh, India',
    city: 'Indore',
    stateProvince: 'Madhya Pradesh',
    countryRegion: 'India',
    isLocationVisible: true,
    phone: '+91 9993619227',
    email: 'ayushprakash0021@gmail.com',
    linkedinUrl: 'https://www.linkedin.com/in/ayushprakash21',
    portfolioUrl: 'https://resume-portfolio.ayushprakash0021.workers.dev',
    githubUrl: 'https://github.com/Ayushprakash21',
    bio: summaryText,
    availabilityStatus: 'Looking for Supply Chain Operations, Project Coordination or Business Operations Roles',
    // Preserve custom uploaded cropped portrait!
    profilePhoto:
      existingProfile.profilePhoto ||
      '/images/creator/creator_1793142386775_044ada53_wall.png',
    updatedAt: NOW,
  };

  const correctedAbout = {
    ...existingAbout,
    heading:
      'Supply chain operations, project coordination, and business operations across enterprise IT services and consulting.',
    quote:
      'Operations professional bridging end-to-end fulfillment coordination, structured project delivery, and AI-enabled workflow design.',
    summary: summaryText,
    detailedText: '',
    content: summaryText,
    physicalOpsHeading: 'Supply Chain & Project Delivery',
    physicalOpsText:
      'Order management, fulfillment coordination, exception handling, process audits, SOP updates, and multi-project coordination.',
    digitalPlatformsHeading: 'Enterprise Systems & AI',
    digitalPlatformsText:
      'OpenText Vendor Invoice Management (VIM), ERP/SAP (working exposure), analytical reporting, and personal AI projects (Orion-9, ApplyWise AI).',
    contentBlocks: [],
    characterCount: summaryText.length,
    updatedAt: NOW,
  };

  console.log('=== PHASE 2: STAGING REVIEWABLE DRAFTS & VALIDATING ===');
  // Write reviewable draft inside profile & about first
  const { draft: _oldProfileDraft, ...cleanProfileBase } = correctedProfile;
  await setDoc(profileRef, {
    ...existingProfile,
    draft: { ...cleanProfileBase, status: 'draft' },
    updatedAt: NOW,
  });

  const { draft: _oldAboutDraft, ...cleanAboutBase } = correctedAbout;
  await setDoc(aboutRef, {
    ...existingAbout,
    draft: { ...cleanAboutBase, status: 'draft' },
    updatedAt: NOW,
  });

  // Validate drafts exist in Firestore
  const stagedProfile = (await getDoc(profileRef)).data();
  const stagedAbout = (await getDoc(aboutRef)).data();
  if (!stagedProfile?.draft?.headline || !stagedAbout?.draft?.summary) {
    throw new Error('Draft staging validation failed!');
  }
  console.log('Drafts validated cleanly. Now publishing all collections...');

  console.log('=== PHASE 3: PUBLISHING CORRECTED COLLECTIONS ===');

  // 1. Publish profile & about (clearing draft)
  await setDoc(profileRef, {
    ...cleanProfileBase,
    status: 'published',
    publishedAt: NOW,
    draft: null,
  });
  console.log('Published profile/main');

  await setDoc(aboutRef, {
    ...cleanAboutBase,
    status: 'published',
    publishedAt: NOW,
    draft: null,
  });
  console.log('Published settings/about');

  // 2. Publish Homepage & OpenToWork & Sections & ResumeGenerator
  await setDoc(
    doc(db, 'settings', 'homepage'),
    {
      mainHeading: 'BUSINESS. SYSTEMS.',
      secondaryHeading: 'Intelligence & Innovation.',
      introParagraph:
        'Operations professional with over five years in IT services, consulting and project work spanning supply chain operations, project coordination and enterprise systems.',
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
      updatedAt: NOW,
    },
    { merge: true }
  );

  await setDoc(
    doc(db, 'settings', 'openToWork'),
    {
      enabled: true,
      badgeText: 'OPEN TO WORK',
      sectionHeading: 'OPEN TO OPPORTUNITIES',
      headline: "Building What's Next.",
      description:
        'Looking for supply chain operations, project coordination or business operations roles.',
      availabilityStatus: 'Actively looking',
      employmentPreferences: ['Full-time', 'Contract', 'Permanent', 'Consulting', 'Remote'],
      workArrangements: ['Remote', 'Hybrid', 'On-site', 'Open to discussion'],
      preferredLocations: [
        {
          id: 'loc-1',
          name: 'India',
          city: 'Indore / Hybrid / Remote',
          remoteAvailable: true,
          relocationWilling: true,
          isVisible: true,
          displayOrder: 1,
        },
        {
          id: 'loc-2',
          name: 'Other International',
          city: 'Remote / Open to Discussion',
          remoteAvailable: true,
          relocationWilling: true,
          isVisible: true,
          displayOrder: 2,
        },
      ],
      preferredJobCategories: [
        'Supply Chain Operations',
        'Project Coordination',
        'Business Operations',
        'Project Management',
      ],
      primaryCtaText: 'Discuss an Opportunity ↗',
      primaryCtaLink: '#contact',
      secondaryCtaText: 'Download Resume ↓',
      secondaryCtaLink: '/Ayush_Prakash_Full_Resume.pdf',
      status: 'published',
      draft: null,
      updatedAt: NOW,
    }
  );

  await setDoc(doc(db, 'settings', 'resumeGenerator'), {
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
      phone: true,
      location: true,
      linkedin: true,
      github: true,
      portfolio: true,
    },
    sectionOrder: ['summary', 'skills', 'experience', 'projects', 'education', 'certifications'],
    updatedAt: NOW,
  });

  // Update sections label ApplyVise -> ApplyWise
  const secRef = doc(db, 'settings', 'sections');
  const secSnap = await getDoc(secRef);
  if (secSnap.exists()) {
    const secData = secSnap.data();
    if (Array.isArray(secData.list)) {
      const updatedList = secData.list.map((s) =>
        s.sectionKey === 'applyvise' || s.id === 'sec-applyvise'
          ? { ...s, title: 'ApplyWise AI Case Study', subtitle: 'Intelligent Career & Recruitment Platform' }
          : s
      );
      await setDoc(secRef, { ...secData, list: updatedList, updatedAt: NOW });
    }
  }
  console.log('Updated settings/homepage, settings/openToWork, settings/resumeGenerator, settings/sections');

  // 3. Experiences (preserve exp-1 and exp-2 IDs, ensure exact 7 chronological records)
  const experiencesData = [
    {
      id: 'exp-1',
      employer: 'Tata Consultancy Services (TCS)',
      jobTitle: 'Senior Process Associate - Supply Chain Operations',
      employmentType: '',
      showEmploymentTypeBadge: false,
      location: 'Indore, India',
      locationType: existingExp1.locationType || 'Hybrid',
      startMonth: 'September',
      startYear: '2024',
      endMonth: '',
      endYear: '',
      startDate: 'September 2024',
      endDate: 'Present',
      isCurrent: true,
      requiresDateConfirmation: false,
      dateConfirmationNotes: '',
      description: '',
      responsibilities: [
        'Manage end-to-end supply chain operations: order management, fulfillment coordination, exception handling and service delivery.',
        'Track demand, inventory movement, dispatch schedules and turnaround times so customer orders go out on time.',
        'Work with stakeholders on process audits, escalations and performance reporting.',
        'Find gaps in the process and fix them, which has cut down delivery delays and errors.',
        'Support continuous improvement work and updates to SOPs.',
      ],
      achievements: [],
      impact: '',
      skillsUsed: [
        'Order Management',
        'Order-to-Delivery',
        'Fulfillment Coordination',
        'Dispatch and Inventory Tracking',
        'SLA and Turnaround Monitoring',
        'Exception Handling',
        'Escalation Handling',
        'Process Audits',
        'Continuous Improvement',
        'SOP Updates',
      ],
      logoUrl: existingExp1.logoUrl || '',
      mediaItems: existingExp1.mediaItems || [],
      displayOrder: 1,
      status: 'published',
      updatedAt: NOW,
    },
    {
      id: 'exp-2',
      employer: 'ESP Softtech Pvt. Ltd.',
      jobTitle: 'Associate Project Manager',
      employmentType: '',
      showEmploymentTypeBadge: false,
      location: 'Indore, India',
      locationType: 'On-site',
      startMonth: 'September',
      startYear: '2023',
      endMonth: 'August',
      endYear: '2024',
      startDate: 'September 2023',
      endDate: 'August 2024',
      isCurrent: false,
      requiresDateConfirmation: false,
      dateConfirmationNotes: '',
      description: '',
      responsibilities: [
        'Handled project coordination: task scheduling, resource allocation and milestone tracking.',
        'Main point of contact between clients and the internal team.',
        'Identified project risks and worked to resolve them, and checked that deliverables met quality standards.',
        'Prepared project status reports for stakeholders and senior management.',
      ],
      achievements: [],
      impact: '',
      skillsUsed: [
        'Project Scheduling',
        'Resource Allocation',
        'Milestone Tracking',
        'Risk Mitigation',
        'Quality Assurance',
        'Status Reporting',
        'Stakeholder Communication',
      ],
      logoUrl: '',
      mediaItems: [],
      displayOrder: 2,
      status: 'published',
      updatedAt: NOW,
    },
    {
      id: 'exp-3',
      employer: 'SynergyTop Softlabs Pvt. Ltd.',
      jobTitle: 'Associate Project Manager',
      employmentType: '',
      showEmploymentTypeBadge: false,
      location: 'Indore, India',
      locationType: 'On-site',
      startMonth: 'February',
      startYear: '2023',
      endMonth: 'July',
      endYear: '2023',
      startDate: 'February 2023',
      endDate: 'July 2023',
      isCurrent: false,
      requiresDateConfirmation: false,
      dateConfirmationNotes: '',
      description: '',
      responsibilities: [
        'Managed a portfolio of 30+ web development projects, keeping them on schedule, on budget and up to quality standards.',
        'Took on 40 more projects, handling risks, keeping documentation current and sorting out budget discrepancies in a fast-paced environment.',
        'Worked closely with teams and stakeholders and kept senior management informed.',
      ],
      achievements: [],
      impact: '',
      skillsUsed: [
        'Project Scheduling',
        'Budget Adherence',
        'Quality Assurance',
        'Risk Mitigation',
        'Project Documentation',
        'Stakeholder Communication',
      ],
      logoUrl: '',
      mediaItems: [],
      displayOrder: 3,
      status: 'published',
      updatedAt: NOW,
    },
    {
      id: 'exp-4',
      employer: 'Accenture Solutions Pvt. Ltd.',
      jobTitle: 'Business & Technology Delivery Associate',
      employmentType: '',
      showEmploymentTypeBadge: false,
      location: 'Indore, India',
      locationType: 'Hybrid',
      startMonth: 'December',
      startYear: '2021',
      endMonth: 'February',
      endYear: '2023',
      startDate: 'December 2021',
      endDate: 'February 2023',
      isCurrent: false,
      requiresDateConfirmation: false,
      dateConfirmationNotes: '',
      description: '',
      responsibilities: [
        'Implemented OpenText Vendor Invoice Management (VIM) for a global automobile parts company.',
        'Carried out the end-to-end VIM implementation for a European grocery chain.',
        'Provided analytical reporting and invoice-checking services for a Canadian energy technology company.',
        'Part of the capability team. Ran VIM training and acted as subject matter expert for VIM issues across client accounts.',
      ],
      achievements: [],
      impact: '',
      skillsUsed: [
        'OpenText Vendor Invoice Management (VIM)',
        'ERP / SAP (Working Exposure)',
        'Analytical Reporting',
        'Process Improvement',
        'Cross-Functional Coordination',
      ],
      logoUrl: '',
      mediaItems: [],
      displayOrder: 4,
      status: 'published',
      updatedAt: NOW,
    },
    {
      id: 'exp-5',
      employer: 'Teleperformance',
      jobTitle: 'Customer Service Associate',
      employmentType: '',
      showEmploymentTypeBadge: false,
      location: '',
      startMonth: 'September',
      startYear: '2021',
      endMonth: 'November',
      endYear: '2021',
      startDate: 'September 2021',
      endDate: 'November 2021',
      isCurrent: false,
      requiresDateConfirmation: false,
      dateConfirmationNotes: 'No further responsibilities specified in source resume.',
      description: '',
      responsibilities: [],
      achievements: [],
      impact: '',
      skillsUsed: [],
      logoUrl: '',
      mediaItems: [],
      displayOrder: 5,
      status: 'published',
      updatedAt: NOW,
    },
    {
      id: 'exp-6',
      employer: 'Toppr Technologies',
      jobTitle: 'Business Development Associate',
      employmentType: '',
      showEmploymentTypeBadge: false,
      location: '',
      startMonth: 'July',
      startYear: '2021',
      endMonth: '',
      endYear: '',
      startDate: 'July 2021',
      endDate: '',
      isCurrent: false,
      requiresDateConfirmation: true,
      dateConfirmationNotes: 'End date and responsibilities not provided in source resume.',
      description: '',
      responsibilities: [],
      achievements: [],
      impact: '',
      skillsUsed: [],
      logoUrl: '',
      mediaItems: [],
      displayOrder: 6,
      status: 'published',
      updatedAt: NOW,
    },
    {
      id: 'exp-7',
      employer: 'ICICI Bank',
      jobTitle: 'Deputy Manager - Relationship Manager',
      employmentType: '',
      showEmploymentTypeBadge: false,
      location: 'Anand, India',
      locationType: 'On-site',
      startMonth: 'February',
      startYear: '2021',
      endMonth: 'April',
      endYear: '2021',
      startDate: 'February 2021',
      endDate: 'April 2021',
      isCurrent: false,
      requiresDateConfirmation: false,
      dateConfirmationNotes: '',
      description: '',
      responsibilities: ['Managed day-to-day banking operations and customer relationship activities.'],
      achievements: [],
      impact: '',
      skillsUsed: [],
      logoUrl: '',
      mediaItems: [],
      displayOrder: 7,
      status: 'published',
      updatedAt: NOW,
    },
  ];

  // Clean up any stray non-resume experiences
  const existingExpSnap = await getDocs(collection(db, 'experiences'));
  const targetExpIds = new Set(experiencesData.map((e) => e.id));
  for (const d of existingExpSnap.docs) {
    if (!targetExpIds.has(d.id)) {
      await deleteDoc(doc(db, 'experiences', d.id));
      console.log('Deleted obsolete experience doc:', d.id);
    }
  }
  for (const exp of experiencesData) {
    await setDoc(doc(db, 'experiences', exp.id), exp);
  }
  console.log(`Published ${experiencesData.length} experiences.`);

  // 4. Education (preserve IDs edu-1 and edu-1793842723903)
  const educationData = [
    {
      id: 'edu-1',
      degree: 'Master of Business Administration (MBA)',
      fieldOfStudy: 'IT & Marketing',
      institution: 'Devi Ahilya University',
      associatedCollege: 'IPS Academy, Indore',
      startYear: '',
      endYear: '2021',
      grade: '',
      description: '',
      skillsUsed: [],
      logoUrl: '',
      highlights: [],
      displayOrder: 1,
      requiresDateConfirmation: true,
      dateConfirmationNotes: 'Completion year 2021 listed in source resume; start year not provided.',
      updatedAt: NOW,
    },
    {
      id: 'edu-1793842723903',
      degree: 'Bachelor of Commerce (B.Com.)',
      fieldOfStudy: 'Computer Applications',
      institution: 'Rani Durgavati University',
      associatedCollege: 'GS College, Jabalpur',
      startYear: '',
      endYear: '2018',
      grade: '',
      description: '',
      skillsUsed: [],
      logoUrl: '',
      highlights: [],
      displayOrder: 2,
      requiresDateConfirmation: true,
      dateConfirmationNotes: 'Completion year 2018 listed in source resume; start year not provided.',
      updatedAt: NOW,
    },
  ];

  const existingEduSnap = await getDocs(collection(db, 'education'));
  const targetEduIds = new Set(educationData.map((e) => e.id));
  for (const d of existingEduSnap.docs) {
    if (!targetEduIds.has(d.id)) {
      await deleteDoc(doc(db, 'education', d.id));
    }
  }
  for (const edu of educationData) {
    await setDoc(doc(db, 'education', edu.id), edu);
  }
  console.log(`Published ${educationData.length} education records.`);

  // 5. Projects (preserve IDs, valid logos, screenshots, projectUrls)
  const orionData = {
    ...existingOrion,
    id: 'orion-9',
    name: 'Orion-9',
    subtitle: 'Supply Chain Operating System',
    category: 'Personal Project',
    technologyStack: ['TypeScript'],
    repositoryUrl: 'https://github.com/Ayushprakash21/orion-9',
    shortDescription:
      'AI-powered supply chain operating system designed to bring enterprise supply chain operations into one platform.',
    description:
      'AI-powered supply chain operating system designed to bring enterprise supply chain operations into one platform.',
    features: [
      'Designed to connect ERP systems, monitor operations in real time, predict disruptions and identify risks.',
      'Uses specialized AI agents, digital twins and an intelligent control tower to support autonomous decision-making.',
    ],
    skillsUsed: ['TypeScript', 'Personal Project'],
    developmentStatus: 'Personal Project — Active Development',
    contentBlocks: {
      overview:
        'AI-powered supply chain operating system designed to bring enterprise supply chain operations into one platform.',
      problemStatement:
        'Enterprise supply chain operations rely on disconnected tools and fragmented operational visibility.',
      proposedSolution:
        'Designed to connect ERP systems, monitor operations in real time, predict disruptions and identify risks.',
      features: [
        'Designed to connect ERP systems, monitor operations in real time, predict disruptions and identify risks.',
        'Uses specialized AI agents, digital twins and an intelligent control tower to support autonomous decision-making.',
      ],
      architecture:
        'TypeScript application featuring administrative console views and organizational routing, with planned AI agent, digital twin, and ERP integration layers.',
      technologyStack: ['TypeScript'],
      contribution: 'Personal Project — Design and development by Ayush Prakash.',
      outcomes:
        'Implemented web dashboard views and project structure; autonomous agent workflows and live ERP integrations remain planned capabilities.',
      futureRoadmap:
        'ERP system connectors, specialized AI agents, digital twin modeling, and predictive risk alerts.',
    },
    logoUrl:
      existingOrion.logoUrl ||
      '/api/storage/files/public/projects/1793833879333_e250c79c_orion_9_final_logo.png',
    displayOrder: 1,
    status: 'published',
    updatedAt: NOW,
  };

  const applywiseData = {
    ...existingApplywise,
    id: 'applywise-ai',
    name: 'ApplyWise AI',
    subtitle: 'Intelligent Career & Recruitment Platform',
    category: 'Personal Project',
    technologyStack: ['TypeScript'],
    repositoryUrl: 'https://github.com/Ayushprakash21/Applywise-AI',
    shortDescription:
      'AI-powered career intelligence platform designed to help people discover, evaluate and pursue job opportunities.',
    description:
      'AI-powered career intelligence platform designed to help people discover, evaluate and pursue job opportunities.',
    features: [
      'Combines job matching, AI-driven resume optimization, application assistance, career insights and recruitment intelligence.',
    ],
    skillsUsed: ['TypeScript', 'Personal Project'],
    developmentStatus: 'Personal Project — Active Development',
    contentBlocks: {
      overview:
        'AI-powered career intelligence platform designed to help people discover, evaluate and pursue job opportunities.',
      problemStatement:
        'Job seekers need clear tooling for discovering relevant opportunities and aligning resumes accurately.',
      proposedSolution:
        'Combines job matching, AI-driven resume optimization, application assistance, career insights and recruitment intelligence.',
      features: [
        'Combines job matching, AI-driven resume optimization, application assistance, career insights and recruitment intelligence.',
      ],
      architecture:
        'TypeScript web application structured for career diagnostics, job matching, and resume optimization workflows.',
      technologyStack: ['TypeScript'],
      contribution: 'Personal Project — Design and development by Ayush Prakash.',
      outcomes: 'Personal career intelligence prototype.',
      futureRoadmap: 'Continued iteration on recruitment intelligence and application assistance capabilities.',
    },
    logoUrl:
      existingApplywise.logoUrl ||
      '/api/storage/files/public/projects/1793833915402_46ce5625_Modern_Blue_AV_Monogram_Logo.png',
    mediaItems: (existingApplywise.mediaItems || []).map((m) => ({
      ...m,
      title: m.title ? m.title.replace(/ApplyVise/g, 'ApplyWise') : m.title,
      caption: m.caption ? m.caption.replace(/ApplyVise/g, 'ApplyWise') : m.caption,
      altText: m.altText ? m.altText.replace(/ApplyVise/g, 'ApplyWise') : m.altText,
    })),
    displayOrder: 2,
    status: 'published',
    updatedAt: NOW,
  };

  await setDoc(orionRef, orionData);
  await setDoc(applywiseRef, applywiseData);
  console.log('Published projects/orion-9 and projects/applywise-ai.');

  // 6. Skills (rebuild exact 5 groups, 42 skills)
  const skillsList = [
    // Supply Chain (8)
    ['Order Management', 'Supply Chain'],
    ['Order-to-Delivery', 'Supply Chain'],
    ['Fulfillment Coordination', 'Supply Chain'],
    ['Dispatch and Inventory Tracking', 'Supply Chain'],
    ['SLA and Turnaround Monitoring', 'Supply Chain'],
    ['Exception Handling', 'Supply Chain'],
    ['Escalation Handling', 'Supply Chain'],
    ['Process Audits', 'Supply Chain'],
    // Project Coordination (9)
    ['Project Scheduling', 'Project Coordination'],
    ['Milestone Tracking', 'Project Coordination'],
    ['Resource Allocation', 'Project Coordination'],
    ['Risk Mitigation', 'Project Coordination'],
    ['Project Documentation', 'Project Coordination'],
    ['Status Reporting', 'Project Coordination'],
    ['Budget Adherence', 'Project Coordination'],
    ['Quality Assurance', 'Project Coordination'],
    ['PMO Support', 'Project Coordination'],
    // Business Operations (10)
    ['Process Improvement', 'Business Operations'],
    ['Continuous Improvement', 'Business Operations'],
    ['SOP Updates', 'Business Operations'],
    ['Operational Reporting', 'Business Operations'],
    ['Performance Reporting', 'Business Operations'],
    ['Analytical Reporting', 'Business Operations'],
    ['Data Analysis', 'Business Operations'],
    ['Stakeholder Communication', 'Business Operations'],
    ['Cross-Functional Coordination', 'Business Operations'],
    ['Service Delivery', 'Business Operations'],
    // Systems and Tools (8)
    ['ERP / SAP (Working Exposure)', 'Systems and Tools'],
    ['OpenText Vendor Invoice Management (VIM)', 'Systems and Tools'],
    ['Microsoft Excel', 'Systems and Tools'],
    ['Power BI', 'Systems and Tools'],
    ['Tableau', 'Systems and Tools'],
    ['Microsoft Project', 'Systems and Tools'],
    ['Jira', 'Systems and Tools'],
    ['Asana', 'Systems and Tools'],
    // AI and Development (7)
    ['Generative AI', 'AI and Development'],
    ['Claude', 'AI and Development'],
    ['Prompt Engineering', 'AI and Development'],
    ['AI-Assisted Workflow Design', 'AI and Development'],
    ['TypeScript', 'AI and Development'],
    ['React', 'AI and Development'],
    ['Python', 'AI and Development'],
  ].map(([name, category], idx) => ({
    id: `sk-res-${idx + 1}`,
    name,
    category,
    displayOrder: idx + 1,
    updatedAt: NOW,
  }));

  const existingSkillsSnap = await getDocs(collection(db, 'skills'));
  const targetSkillIds = new Set(skillsList.map((s) => s.id));
  for (const d of existingSkillsSnap.docs) {
    if (!targetSkillIds.has(d.id)) {
      await deleteDoc(doc(db, 'skills', d.id));
    }
  }
  for (const sk of skillsList) {
    await setDoc(doc(db, 'skills', sk.id), sk);
  }
  console.log(`Published ${skillsList.length} skills across 5 exact categories.`);

  // 7. Certifications (exact 8 records, no invented metadata or logos)
  const certificationsData = [
    {
      id: 'cert-google-pm',
      title: 'Google Project Management Certificate',
      issuer: 'Google',
      issuerLogo: '',
      issueMonth: '',
      issueYear: '',
      completionDate: '',
      doesNotExpire: true,
      requiresDateConfirmation: true,
      dateConfirmationNotes: 'Issue date and credential ID unavailable in resume.',
      category: 'Project Coordination',
      highlightTag: 'GOOGLE CERTIFICATE',
      description: '',
      skillsUsed: [],
      displayOrder: 1,
      status: 'published',
      updatedAt: NOW,
    },
    {
      id: 'cert-scm',
      title: 'Supply Chain Management',
      issuer: '',
      issuerLogo: '',
      issueMonth: '',
      issueYear: '',
      completionDate: '',
      doesNotExpire: true,
      requiresDateConfirmation: true,
      dateConfirmationNotes: 'Issuer, issue date, and credential ID unavailable in resume.',
      category: 'Supply Chain',
      highlightTag: 'SUPPLY CHAIN',
      description: '',
      skillsUsed: [],
      displayOrder: 2,
      status: 'published',
      updatedAt: NOW,
    },
    {
      id: 'cert-bda',
      title: 'Business & Data Analytics',
      issuer: '',
      issuerLogo: '',
      issueMonth: '',
      issueYear: '',
      completionDate: '',
      doesNotExpire: true,
      requiresDateConfirmation: true,
      dateConfirmationNotes: 'Issuer, issue date, and credential ID unavailable in resume.',
      category: 'Business Operations',
      highlightTag: 'ANALYTICS',
      description: '',
      skillsUsed: [],
      displayOrder: 3,
      status: 'published',
      updatedAt: NOW,
    },
    {
      id: 'cert-genai-pro',
      title: 'Generative AI Certified Professional',
      issuer: '',
      issuerLogo: '',
      issueMonth: '',
      issueYear: '',
      completionDate: '',
      doesNotExpire: true,
      requiresDateConfirmation: true,
      dateConfirmationNotes: 'Issuer, issue date, and credential ID unavailable in resume.',
      category: 'AI and Development',
      highlightTag: 'GENERATIVE AI',
      description: '',
      skillsUsed: [],
      displayOrder: 4,
      status: 'published',
      updatedAt: NOW,
    },
    {
      id: 'cert-claude-arch-pro',
      title: 'Claude Certified Architect - Professional',
      issuer: 'Anthropic',
      issuerLogo: '',
      issueMonth: 'October',
      issueYear: '2026',
      completionDate: 'October 2026',
      doesNotExpire: true,
      requiresDateConfirmation: false,
      category: 'AI and Development',
      highlightTag: 'ANTHROPIC',
      description: '',
      skillsUsed: [],
      displayOrder: 5,
      status: 'published',
      updatedAt: NOW,
    },
    {
      id: 'cert-claude-arch-found',
      title: 'Claude Certified Architect - Foundations',
      issuer: 'Anthropic',
      issuerLogo: '',
      issueMonth: 'November',
      issueYear: '2026',
      completionDate: 'November 2026',
      doesNotExpire: true,
      requiresDateConfirmation: false,
      category: 'AI and Development',
      highlightTag: 'ANTHROPIC',
      description: '',
      skillsUsed: [],
      displayOrder: 6,
      status: 'published',
      updatedAt: NOW,
    },
    {
      id: 'cert-claude-dev-found',
      title: 'Claude Certified Developer - Foundations',
      issuer: 'Anthropic',
      issuerLogo: '',
      issueMonth: '',
      issueYear: '',
      completionDate: '',
      doesNotExpire: true,
      requiresDateConfirmation: true,
      dateConfirmationNotes: 'Issue date and credential ID unavailable in resume.',
      category: 'AI and Development',
      highlightTag: 'ANTHROPIC',
      description: '',
      skillsUsed: [],
      displayOrder: 7,
      status: 'published',
      updatedAt: NOW,
    },
    {
      id: 'cert-claude-assoc-found',
      title: 'Claude Certified Associate - Foundations',
      issuer: 'Anthropic',
      issuerLogo: '',
      issueMonth: '',
      issueYear: '',
      completionDate: '',
      doesNotExpire: true,
      requiresDateConfirmation: true,
      dateConfirmationNotes: 'Issue date and credential ID unavailable in resume.',
      category: 'AI and Development',
      highlightTag: 'ANTHROPIC',
      description: '',
      skillsUsed: [],
      displayOrder: 8,
      status: 'published',
      updatedAt: NOW,
    },
  ];

  const existingCertSnap = await getDocs(collection(db, 'certifications'));
  const targetCertIds = new Set(certificationsData.map((c) => c.id));
  for (const d of existingCertSnap.docs) {
    if (!targetCertIds.has(d.id)) {
      await deleteDoc(doc(db, 'certifications', d.id));
      console.log('Deleted obsolete/inaccurate cert doc:', d.id);
    }
  }
  for (const cert of certificationsData) {
    await setDoc(doc(db, 'certifications', cert.id), cert);
  }
  console.log(`Published ${certificationsData.length} certifications.`);

  // Write post-audit snapshot
  const collections = [
    'profile',
    'settings',
    'experiences',
    'projects',
    'certifications',
    'skills',
    'education',
    'resume',
    'mediaAssets',
  ];
  const afterAudit = {};
  for (const col of collections) {
    const snap = await getDocs(collection(db, col));
    afterAudit[col] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
  fs.writeFileSync(
    'C:/Users/Ayush/.gemini/antigravity/brain/476c7590-1f5b-4226-97b0-0976fa6f2d4a/scratch/firestore_audit_after.json',
    JSON.stringify(afterAudit, null, 2)
  );
  console.log('Saved post-migration audit to scratch/firestore_audit_after.json');
  console.log('RECONCILIATION & PUBLISHING COMPLETE!');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration error:', err);
    process.exit(1);
  });
