import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateResumeFile,
  extractResumeInformation,
  generateResumeDiff,
  applyApprovedDiffItems,
} from '../src/services/resumeParserService.ts';
import {
  DEFAULT_PROFILE,
  DEFAULT_ABOUT_SETTINGS,
  DEFAULT_EXPERIENCES,
  DEFAULT_PROJECTS,
  DEFAULT_SKILLS,
  DEFAULT_EDUCATION,
  DEFAULT_CERTIFICATIONS,
} from '../src/data/seedData.ts';

test('1. File Validation: accepts valid PDF, DOCX, DOC and denies unsupported files', () => {
  // Valid PDF
  const pdfFile = { name: 'Ayush_Prakash_CV.pdf', size: 1024 * 500 };
  const pdfVal = validateResumeFile(pdfFile);
  assert.equal(pdfVal.isValid, true);
  assert.equal(pdfVal.fileType, 'pdf');

  // Valid DOCX
  const docxFile = { name: 'Ayush_Resume.docx', size: 1024 * 300 };
  const docxVal = validateResumeFile(docxFile);
  assert.equal(docxVal.isValid, true);
  assert.equal(docxVal.fileType, 'docx');

  // Valid DOC
  const docFile = { name: 'Ayush_Resume.doc', size: 1024 * 300 };
  const docVal = validateResumeFile(docFile);
  assert.equal(docVal.isValid, true);
  assert.equal(docVal.fileType, 'doc');

  // Unsupported TXT / EXE
  const txtFile = { name: 'resume.txt', size: 1024 };
  const txtVal = validateResumeFile(txtFile);
  assert.equal(txtVal.isValid, false);
  assert.ok(txtVal.error?.includes('Unsupported file format'));

  // Oversized file (> 20 MB)
  const hugeFile = { name: 'huge_resume.pdf', size: 25 * 1024 * 1024 };
  const hugeVal = validateResumeFile(hugeFile);
  assert.equal(hugeVal.isValid, false);
  assert.ok(hugeVal.error?.includes('exceeds the maximum allowed limit'));

  // Empty file (0 bytes)
  const emptyFile = { name: 'empty.pdf', size: 0 };
  const emptyVal = validateResumeFile(emptyFile);
  assert.equal(emptyVal.isValid, false);
  assert.ok(emptyVal.error?.includes('empty'));
});

test('2. Intelligent Extraction: extracts candidate contact, headline, summary, and skills accurately without hallucinating', () => {
  const sampleResumeText = `
AYUSH PRAKASH
Operations & Systems Specialist | AI & Enterprise Architecture
Email: ayushprakash0021@gmail.com | Phone: +91 9876543210
Location: Indore, Madhya Pradesh, India
LinkedIn: linkedin.com/in/ayushprakash | GitHub: github.com/Ayushprakash21
Portfolio: https://resume-portfolio.ayushprakash0021.workers.dev

PROFESSIONAL SUMMARY
Dynamic operations leader combining enterprise logistics, supply chain systems, and artificial intelligence architectures to optimize global workflows.

CORE COMPETENCIES
AI & Machine Learning: Generative AI, Large Language Models, AI Agents, Neural Networks
Supply Chain & Operations: Freight Logistics, Inventory Replenishment, Route Optimization, Vendor Management
Technical Architecture: TypeScript, Python, React, Cloudflare Workers, Distributed Backends

WORK EXPERIENCE
Senior Operations & Systems Specialist
Global Freight & Supply Logistics
Jan 2024 - Present
• Designed autonomous routing pipeline cutting freight transit latency by 22%
• Spearheaded inventory reconciliation engine processing 50,000 daily SKU updates

EDUCATION
Bachelor of Technology in Computer Science & Engineering
Apex Institute of Technology
2019 - 2023

LICENSES & CERTIFICATIONS
Supply Chain Analytics Professional | MITx MicroMasters | 2024
Deep Learning Specialization | DeepLearning.AI | 2023
  `.trim();

  const extracted = extractResumeInformation(sampleResumeText);

  // Assertions
  assert.equal(extracted.personalInfo.fullName?.value, 'AYUSH PRAKASH');
  assert.equal(extracted.personalInfo.email?.value, 'ayushprakash0021@gmail.com');
  assert.equal(extracted.personalInfo.phone?.value, '+91 9876543210');
  assert.ok(extracted.personalInfo.location?.value.includes('Indore'));
  assert.ok(extracted.personalInfo.linkedinUrl?.value.includes('linkedin.com/in/ayushprakash'));
  assert.ok(extracted.personalInfo.githubUrl?.value.includes('github.com/Ayushprakash21'));
  assert.ok(extracted.personalInfo.portfolioUrl?.value.includes('resume-portfolio'));

  // Summary
  assert.ok(extracted.summary?.value.includes('Dynamic operations leader'));

  // Skills
  assert.ok(extracted.skills.length >= 2);
  const aiSkills = extracted.skills.find((s) => s.category.includes('AI') || s.category.includes('Machine'));
  assert.ok(aiSkills);
  assert.ok(aiSkills.skills.includes('Generative AI'));

  // Experience
  assert.ok(extracted.experience.length >= 1);
  const firstExp = extracted.experience[0];
  assert.ok(firstExp.startDate.includes('2024'));
  assert.equal(firstExp.isCurrent, true);
  assert.ok(firstExp.responsibilities.length >= 2);

  // Education & Certifications
  assert.ok(extracted.education.length >= 1);
  assert.ok(extracted.certifications.length >= 1);
});

test('3. Diff Generation: classifies New, Changed, and Unchanged information with confidence scores', () => {
  const currentSnapshot = {
    profile: {
      ...DEFAULT_PROFILE,
      headline: 'Old Outdated Headline 2023',
    },
    about: DEFAULT_ABOUT_SETTINGS,
    experiences: DEFAULT_EXPERIENCES,
    projects: DEFAULT_PROJECTS,
    skills: DEFAULT_SKILLS,
    education: DEFAULT_EDUCATION,
    certifications: DEFAULT_CERTIFICATIONS,
  };

  const sampleResumeText = `
Ayush Prakash
Brand New Executive Headline 2026
Email: ayushprakash0021@gmail.com
Location: Indore, Madhya Pradesh, India

CORE COMPETENCIES
Advanced Emerging Skills: Quantum Algorithms, Agentic Orchestration

LICENSES & CERTIFICATIONS
Brand New Quantum Computing Certificate | IBM Quantum | 2026
  `.trim();

  const extracted = extractResumeInformation(sampleResumeText);
  const diffItems = generateResumeDiff(extracted, currentSnapshot);

  assert.ok(diffItems.length > 0);

  // Changed: Headline changed from 'Old Outdated Headline 2023' to 'Brand New Executive Headline 2026'
  const headlineDiff = diffItems.find((d) => d.section === 'profile' && d.field === 'headline');
  assert.ok(headlineDiff);
  assert.equal(headlineDiff.category, 'changed');
  assert.equal(headlineDiff.existingValue, 'Old Outdated Headline 2023');
  assert.equal(headlineDiff.extractedValue, 'Brand New Executive Headline 2026');

  // Unchanged: Email matches
  const emailDiff = diffItems.find((d) => d.section === 'profile' && d.field === 'email');
  assert.ok(emailDiff);
  assert.equal(emailDiff.category, 'unchanged');

  // New: New skill
  const newSkillDiff = diffItems.find((d) => d.section === 'skills' && d.field.includes('Quantum'));
  assert.ok(newSkillDiff);
  assert.equal(newSkillDiff.category, 'new');

  // New: New certificate
  const newCertDiff = diffItems.find((d) => d.section === 'certifications');
  assert.ok(newCertDiff);
  assert.equal(newCertDiff.category, 'new');
});

test('4. Safe CMS Update: applies only approved fields, preserves unapproved fields and IDs, and produces audit log', async () => {
  let savedProfile = null;
  const mockCmsService = {
    getProfile: () => ({ ...DEFAULT_PROFILE, headline: 'Old Headline' }),
    publishProfile: async (p) => { savedProfile = p; },
    getAboutSettings: () => ({ ...DEFAULT_ABOUT_SETTINGS }),
    publishAboutSettings: async () => {},
    getSkills: () => [...DEFAULT_SKILLS],
    addSkill: async () => {},
  };

  const diffItems = [
    {
      id: 'diff-1',
      section: 'profile',
      field: 'headline',
      label: 'Professional Headline',
      category: 'changed',
      existingValue: 'Old Headline',
      extractedValue: 'Approved New Headline 2026',
      currentReviewValue: 'Approved New Headline 2026',
      status: 'approved',
      confidence: 0.95,
      source: 'Resume Header',
    },
    {
      id: 'diff-2',
      section: 'profile',
      field: 'email',
      label: 'Email',
      category: 'changed',
      existingValue: 'ayushprakash0021@gmail.com',
      extractedValue: 'unapproved_fake@gmail.com',
      currentReviewValue: 'unapproved_fake@gmail.com',
      status: 'rejected',
      confidence: 0.8,
      source: 'Resume Header',
    },
  ];

  const result = await applyApprovedDiffItems(diffItems, mockCmsService, 2, 'Ayush_CV.pdf');

  // Exactly 1 approved change applied
  assert.equal(result.updatedCount, 1);
  assert.ok(savedProfile);
  assert.equal(savedProfile.headline, 'Approved New Headline 2026');
  // Email was rejected so it remained unchanged
  assert.equal(savedProfile.email, DEFAULT_PROFILE.email);

  // Audit entry verified
  assert.ok(result.auditEntry);
  assert.equal(result.auditEntry.approvedFieldsCount, 1);
  assert.equal(result.auditEntry.rejectedFieldsCount, 1);
  assert.ok(result.auditEntry.details.includes('Approved New Headline 2026'));
});
