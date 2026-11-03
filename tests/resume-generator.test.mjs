import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  extractResumeData,
  generatePdf,
  generateDocxBlob,
} from '../src/services/resumeGeneratorService.ts';
import {
  DEFAULT_PROFILE,
  DEFAULT_ABOUT_SETTINGS,
  DEFAULT_EXPERIENCES,
  DEFAULT_PROJECTS,
  DEFAULT_SKILLS,
  DEFAULT_EDUCATION,
  DEFAULT_CERTIFICATIONS,
  DEFAULT_RESUME_GENERATOR_SETTINGS,
} from '../src/data/seedData.ts';

test('Resume Generator: extractResumeData correctly compiles authoritative CMS data', () => {
  const data = extractResumeData(
    DEFAULT_PROFILE,
    DEFAULT_ABOUT_SETTINGS,
    DEFAULT_EXPERIENCES,
    DEFAULT_PROJECTS,
    DEFAULT_SKILLS,
    DEFAULT_EDUCATION,
    DEFAULT_CERTIFICATIONS,
    DEFAULT_RESUME_GENERATOR_SETTINGS
  );

  // Full name & headline
  assert.equal(data.fullName, 'Ayush Prakash');
  assert.ok(data.headline.includes('AI & Automation'));

  // Location is Indore, Madhya Pradesh, India
  assert.equal(data.contact.location, 'Indore, Madhya Pradesh, India');

  // Contact privacy settings
  assert.equal(data.contact.email, 'ayushprakash0021@gmail.com');
  assert.equal(data.contact.phone, undefined); // Phone excluded by default privacy setting
  assert.ok(data.contact.linkedin);
  assert.ok(data.contact.github);
  assert.ok(data.contact.portfolio);

  // Summary
  assert.ok(data.summary.length > 20);

  // Experience
  assert.ok(data.experience.length > 0);
  assert.ok(data.experience[0].employer);
  assert.ok(data.experience[0].jobTitle);
  assert.ok(data.experience[0].bullets.length > 0);

  // Projects
  assert.ok(data.projects.length > 0);
  assert.ok(data.projects[0].name);

  // Skills
  assert.ok(data.skills.length > 0);
  assert.ok(data.skills[0].category);
  assert.ok(data.skills[0].skills.length > 0);

  // Education & Certs
  assert.ok(data.education.length > 0);
  assert.ok(data.certifications.length > 0);
});

test('Resume Generator: PDF generation produces valid vector text PDF without throwing', () => {
  const data = extractResumeData(
    DEFAULT_PROFILE,
    DEFAULT_ABOUT_SETTINGS,
    DEFAULT_EXPERIENCES,
    DEFAULT_PROJECTS,
    DEFAULT_SKILLS,
    DEFAULT_EDUCATION,
    DEFAULT_CERTIFICATIONS,
    DEFAULT_RESUME_GENERATOR_SETTINGS
  );

  const doc = generatePdf(data);
  assert.ok(doc);
  const pageCount = doc.getNumberOfPages();
  assert.ok(pageCount >= 1 && pageCount <= 4);

  // Output arraybuffer check
  const arrayBuffer = doc.output('arraybuffer');
  assert.ok(arrayBuffer.byteLength > 1000);
});

test('Resume Generator: DOCX generation produces valid OpenXML Word document Blob', async () => {
  const data = extractResumeData(
    DEFAULT_PROFILE,
    DEFAULT_ABOUT_SETTINGS,
    DEFAULT_EXPERIENCES,
    DEFAULT_PROJECTS,
    DEFAULT_SKILLS,
    DEFAULT_EDUCATION,
    DEFAULT_CERTIFICATIONS,
    DEFAULT_RESUME_GENERATOR_SETTINGS
  );

  const blob = await generateDocxBlob(data);
  assert.ok(blob);
  assert.ok(blob.size > 1000);
  assert.equal(
    blob.type,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  );
});

test('Resume Generator: UI components exist and are hooked up to public site & admin', () => {
  const appSrc = fs.readFileSync(path.resolve('src/App.tsx'), 'utf-8');
  assert.ok(appSrc.includes('ResumeGeneratorModal'));
  assert.ok(appSrc.includes('isResumeModalOpen'));
  assert.ok(appSrc.includes('onOpenResumeGenerator'));

  const aboutSrc = fs.readFileSync(path.resolve('src/components/editorial/EditorialAbout.tsx'), 'utf-8');
  assert.ok(aboutSrc.includes('onOpenResumeGenerator'));

  const openToWorkSrc = fs.readFileSync(path.resolve('src/components/editorial/EditorialOpenToWork.tsx'), 'utf-8');
  assert.ok(openToWorkSrc.includes('onOpenResumeGenerator'));

  const adminResumeSrc = fs.readFileSync(path.resolve('src/components/admin/editors/ResumeManager.tsx'), 'utf-8');
  assert.ok(adminResumeSrc.includes('Dynamic ATS Resume Generator Engine'));
  assert.ok(adminResumeSrc.includes('handleSaveAtsSettings'));
  assert.ok(adminResumeSrc.includes('handleAdminAtsDownloadPdf'));
  assert.ok(adminResumeSrc.includes('handleAdminAtsDownloadDocx'));
});
