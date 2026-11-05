import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  DEFAULT_PROFILE,
  DEFAULT_EXPERIENCES,
  DEFAULT_EDUCATION,
  DEFAULT_SKILLS,
  DEFAULT_PROJECTS,
  DEFAULT_CERTIFICATIONS,
  DEFAULT_RESUME_RECORD,
  DEFAULT_RESUME_VERSIONS,
} from '../src/data/seedData.ts';

test('1. Master Resume File: exists on disk and is referenced by CMS master record', () => {
  const masterPath = path.resolve(process.cwd(), 'public/Ayush_Prakash_Full_Resume.pdf');
  assert.ok(fs.existsSync(masterPath), 'Ayush_Prakash_Full_Resume.pdf must exist in public directory');
  const stats = fs.statSync(masterPath);
  assert.ok(stats.size > 200000, `PDF must have authentic size (actual: ${stats.size} bytes)`);

  assert.equal(DEFAULT_RESUME_RECORD.fileUrl, '/Ayush_Prakash_Full_Resume.pdf');
  assert.equal(DEFAULT_RESUME_RECORD.fileName, 'Ayush_Prakash_Full_Resume.pdf');
  assert.equal(DEFAULT_RESUME_VERSIONS.length >= 2, true);
  assert.equal(DEFAULT_RESUME_VERSIONS[0].isActive, true);
});

test('2. Experience Module: contains exactly the 7 authentic resume positions with date fidelity', () => {
  assert.equal(DEFAULT_EXPERIENCES.length, 7);

  const tcs = DEFAULT_EXPERIENCES.find((e) => e.employer?.includes('Tata Consultancy Services'));
  assert.ok(tcs, 'TCS experience must exist');
  assert.equal(tcs.jobTitle, 'Senior Process Associate - Supply Chain Operations');
  assert.equal(tcs.startYear, '2024');
  assert.equal(tcs.isCurrent, true);
  assert.ok(tcs.location.includes('Indore'));

  const esp = DEFAULT_EXPERIENCES.find((e) => e.employer?.includes('ESP Softtech'));
  assert.ok(esp, 'ESP Softtech experience must exist');
  assert.equal(esp.jobTitle, 'Associate Project Manager');
  assert.equal(esp.startYear, '2023');
  assert.equal(esp.endYear, '2024');
  assert.ok(esp.location.includes('Indore'));

  const synergy = DEFAULT_EXPERIENCES.find((e) => e.employer?.includes('SynergyTop'));
  assert.ok(synergy, 'SynergyTop experience must exist');
  assert.equal(synergy.jobTitle, 'Associate Project Manager');
  assert.equal(synergy.startYear, '2023');
  assert.equal(synergy.endYear, '2023');
  assert.equal(synergy.requiresDateConfirmation, true);

  const accenture = DEFAULT_EXPERIENCES.find((e) => e.employer?.includes('Accenture'));
  assert.ok(accenture, 'Accenture experience must exist');
  assert.equal(accenture.jobTitle, 'Business & Technology Delivery Associate');
  assert.equal(accenture.startYear, '2021');
  assert.equal(accenture.endYear, '2023');

  const tp = DEFAULT_EXPERIENCES.find((e) => e.employer?.includes('Teleperformance'));
  assert.ok(tp, 'Teleperformance experience must exist');
  assert.equal(tp.jobTitle, 'Customer Service Associate');
  assert.equal(tp.startYear, '2021');
  assert.equal(tp.endYear, '2021');
  assert.equal(tp.requiresDateConfirmation, true);

  const toppr = DEFAULT_EXPERIENCES.find((e) => e.employer?.includes('Toppr'));
  assert.ok(toppr, 'Toppr experience must exist');
  assert.equal(toppr.jobTitle, 'Business Development Associate');
  assert.equal(toppr.startYear, '2021');
  assert.equal(toppr.endYear, '2021');
  assert.equal(toppr.requiresDateConfirmation, true);

  const icici = DEFAULT_EXPERIENCES.find((e) => e.employer?.includes('ICICI Bank'));
  assert.ok(icici, 'ICICI Bank experience must exist');
  assert.equal(icici.jobTitle, 'Deputy Manager - Relationship Manager');
  assert.equal(icici.startYear, '2021');
  assert.equal(icici.endYear, '2021');
  assert.ok(icici.location.includes('Anand'));
  assert.equal(icici.requiresDateConfirmation, true);
});

test('3. Education Module: contains MBA and B.Com with authentic non-fabricated dates', () => {
  assert.equal(DEFAULT_EDUCATION.length, 2);

  const mba = DEFAULT_EDUCATION.find((e) => e.degree?.includes('MBA'));
  assert.ok(mba, 'MBA record must exist');
  assert.ok(mba.institution.includes('Devi Ahilya'));
  assert.equal(mba.fieldOfStudy, 'IT & Marketing');
  assert.equal(mba.endYear, '2021');
  assert.equal(mba.requiresDateConfirmation, true);

  const bcom = DEFAULT_EDUCATION.find((e) => e.degree?.includes('B.Com'));
  assert.ok(bcom, 'B.Com record must exist');
  assert.ok(bcom.institution.includes('Rani Durgavati'));
  assert.equal(bcom.fieldOfStudy, 'Computer Applications');
  assert.equal(bcom.endYear, '2018');
  assert.equal(bcom.requiresDateConfirmation, true);
});

test('4. Skills Module: structured into 5 authoritative resume categories', () => {
  const categories = Array.from(new Set(DEFAULT_SKILLS.map((s) => s.category)));
  const expectedCategories = [
    'Supply Chain Operations',
    'Project Management and Coordination',
    'Business Operations',
    'Enterprise Systems and Reporting',
    'AI and Product Development',
  ];

  for (const cat of expectedCategories) {
    assert.ok(categories.includes(cat), `Category "${cat}" must exist in skills`);
  }

  assert.equal(DEFAULT_SKILLS.length, 42);

  const skillNames = DEFAULT_SKILLS.map((s) => s.name);
  assert.ok(skillNames.includes('Order Management'));
  assert.ok(skillNames.includes('Fulfilment Coordination'));
  assert.ok(skillNames.includes('SLA and Turnaround Monitoring'));
  assert.ok(skillNames.includes('Project Scheduling'));
  assert.ok(skillNames.includes('Milestone Tracking'));
  assert.ok(skillNames.includes('ERP/SAP (working exposure)'));
  assert.ok(skillNames.includes('OpenText Vendor Invoice Management (VIM)'));
  assert.ok(skillNames.includes('Claude'));
  assert.ok(skillNames.includes('Prompt Engineering'));
});

test('5. Certifications Module: includes all 7 authentic resume certifications', () => {
  assert.equal(DEFAULT_CERTIFICATIONS.length, 7);

  const certTitles = DEFAULT_CERTIFICATIONS.map((c) => c.title);
  assert.ok(certTitles.includes('Google Project Management Certificate'));
  assert.ok(certTitles.includes('Supply Chain Management'));
  assert.ok(certTitles.includes('Generative AI Certified Professional'));
  assert.ok(certTitles.includes('Claude Certified Architect - Professional'));
  assert.ok(certTitles.includes('Claude Certified Architect - Foundations'));
  assert.ok(certTitles.includes('Claude Certified Developer - Foundations'));
  assert.ok(certTitles.includes('Claude Certified Associate - Foundations'));

  const claudeCert = DEFAULT_CERTIFICATIONS.find((c) => c.title === 'Claude Certified Architect - Professional');
  assert.equal(claudeCert?.issuer, 'Anthropic');
  assert.equal(claudeCert?.issueYear, '2026');
  assert.equal(claudeCert?.issueMonth, 'October');

  const poiCert = DEFAULT_CERTIFICATIONS.find((c) => c.title === 'Supply Chain Management');
  assert.equal(poiCert?.issuer, 'Professional Operations Institute');
  assert.ok(!poiCert?.verificationUrl, 'Verification URL should be omitted or empty when not present in resume');
  assert.equal(poiCert?.requiresDateConfirmation, true);
});

test('6. Projects Module: Orion-9 and ApplyWise / ApplyVise AI preserved with live links & media', () => {
  const orion = DEFAULT_PROJECTS.find((p) => p.name.includes('Orion-9'));
  assert.ok(orion, 'Orion-9 project must be preserved');
  assert.equal(orion.projectUrl, 'https://orion-9.ayushprakash0021.workers.dev/');
  assert.equal(orion.repositoryUrl, 'https://github.com/Ayushprakash21/orion-9');
  assert.ok(orion.screenshots?.length > 0, 'Orion-9 screenshots must be preserved');

  const applywise = DEFAULT_PROJECTS.find((p) => p.name.includes('ApplyVise') || p.name.includes('ApplyWise'));
  assert.ok(applywise, 'ApplyWise AI project must be preserved');
  assert.equal(applywise.projectUrl, 'https://applywise-ai.pages.dev');
  assert.ok(applywise.repositoryUrl?.toLowerCase().includes('github.com/ayushprakash21/applywise-ai'));
});

test('7. Admin Dropdown Directories: comprehensive, robust and type-safe', () => {
  const companyFile = fs.readFileSync('src/components/admin/common/CompanySelector.tsx', 'utf-8');
  assert.ok(companyFile.includes('Tata Consultancy Services'));
  assert.ok(companyFile.includes('ESP Softtech'));
  assert.ok(companyFile.includes('SynergyTop Softlabs'));
  assert.ok(companyFile.includes('Accenture Solutions'));
  assert.ok(companyFile.includes('Teleperformance'));
  assert.ok(companyFile.includes('Toppr'));
  assert.ok(companyFile.includes('ICICI Bank'));

  const locationFile = fs.readFileSync('src/components/admin/common/LocationSelector.tsx', 'utf-8');
  assert.ok(locationFile.includes("'Indore'"));
  assert.ok(locationFile.includes("'Anand'"));
  assert.ok(locationFile.includes("'Jabalpur'"));
  assert.ok(locationFile.includes("'Bengaluru'"));

  const degreeFile = fs.readFileSync('src/components/admin/common/DegreeSelector.tsx', 'utf-8');
  assert.ok(degreeFile.includes('Master of Business Administration (MBA)'));
  assert.ok(degreeFile.includes('Bachelor of Commerce (B.Com.)'));

  const institutionFile = fs.readFileSync('src/components/admin/common/InstitutionSelector.tsx', 'utf-8');
  assert.ok(institutionFile.includes('Devi Ahilya University'));
  assert.ok(institutionFile.includes('Rani Durgavati University'));

  const issuerServiceFile = fs.readFileSync('src/services/issuerService.ts', 'utf-8');
  assert.ok(issuerServiceFile.includes("'Anthropic'"));
  assert.ok(issuerServiceFile.includes("'Google Cloud'"));
  assert.ok(issuerServiceFile.includes("'DeepLearning.AI'"));

  const issuerFile = fs.readFileSync('src/components/admin/common/IssuerSelector.tsx', 'utf-8');
  assert.ok(issuerFile.includes('VERIFIED_ISSUERS_DIRECTORY'));
  assert.ok(issuerFile.includes('SearchableSelect'));

  const datePickerFile = fs.readFileSync('src/components/admin/common/DateMonthYearPicker.tsx', 'utf-8');
  assert.ok(datePickerFile.includes("'January'"));
  assert.ok(datePickerFile.includes("'December'"));
  assert.ok(datePickerFile.includes('requiresDateConfirmation'));
});

test('8. Profile Summary: matches authentic resume narrative', () => {
  assert.ok(DEFAULT_PROFILE.bio.includes('Operations professional'));
  assert.ok(DEFAULT_PROFILE.bio.includes('supply chain'));
  assert.ok(DEFAULT_PROFILE.location.includes('Indore'));
  assert.equal(DEFAULT_PROFILE.phone, '+91 9993619227');
});
