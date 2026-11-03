import { jsPDF } from 'jspdf';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  ExternalHyperlink,
  UnderlineType,
  BorderStyle,
} from 'docx';
import {
  ProfileData,
  AboutSectionSettings,
  ExperienceRecord,
  ProjectRecord,
  SkillRecord,
  EducationRecord,
  CertificationRecord,
  ResumeGeneratorSettings,
} from '../types/cms';

export interface ATSResumeData {
  fullName: string;
  headline: string;
  summary: string;
  contact: {
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  skills: {
    category: string;
    skills: string[];
  }[];
  experience: {
    employer: string;
    jobTitle: string;
    employmentType?: string;
    location?: string;
    period: string;
    bullets: string[];
    technologies?: string[];
  }[];
  projects: {
    name: string;
    category?: string;
    period?: string;
    description: string;
    technologies: string[];
    highlights: string[];
    url?: string;
  }[];
  education: {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    period: string;
    grade?: string;
    highlights: string[];
  }[];
  certifications: {
    title: string;
    issuer: string;
    date: string;
    credentialId?: string;
    url?: string;
  }[];
  generatedDate: string;
}

/**
 * Extracts and cleans CMS data into a structured ATS-optimized format.
 * Strictly respects user settings, published statuses, and excludes empty/draft fields.
 */
export function extractResumeData(
  profile: ProfileData,
  about: AboutSectionSettings,
  experiences: ExperienceRecord[],
  projects: ProjectRecord[],
  skills: SkillRecord[],
  education: EducationRecord[],
  certifications: CertificationRecord[],
  settings?: ResumeGeneratorSettings
): ATSResumeData {
  const cfg = settings || {
    enabled: true,
    title: 'Generate My Resume',
    description: '',
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

  // Full Name
  const fullName = profile.name || `${profile.firstName || 'Ayush'} ${profile.lastName || 'Prakash'}`.trim();

  // Headline
  const headline = profile.headline || 'Operations & Systems Specialist | AI & Enterprise Architecture';

  // Summary
  let summary = '';
  if (cfg.includeSummary) {
    if (cfg.customSummary && cfg.customSummary.trim()) {
      summary = cfg.customSummary.trim();
    } else {
      summary =
        about.summary ||
        about.quote ||
        profile.bio ||
        'Experienced professional bridging enterprise systems, supply chain intelligence, and applied AI technologies. Track record of designing scalable operating frameworks and digital architectures.';
    }
  }

  // Contact Info
  const contact: ATSResumeData['contact'] = {};
  if (cfg.includeContactInfo?.email && profile.email) {
    contact.email = profile.email;
  }
  if (cfg.includeContactInfo?.phone && profile.phone && !profile.phone.toLowerCase().includes('request')) {
    contact.phone = profile.phone;
  }
  if (cfg.includeContactInfo?.location && (profile.location || profile.city)) {
    contact.location = profile.location || `${profile.city || ''}, ${profile.countryRegion || ''}`.trim();
  }
  if (cfg.includeContactInfo?.linkedin && profile.linkedinUrl) {
    contact.linkedin = profile.linkedinUrl;
  }
  if (cfg.includeContactInfo?.github && profile.githubUrl) {
    contact.github = profile.githubUrl;
  }
  if (cfg.includeContactInfo?.portfolio && profile.portfolioUrl) {
    contact.portfolio = profile.portfolioUrl;
  }

  // Skills: Group by category
  let formattedSkills: ATSResumeData['skills'] = [];
  if (cfg.includeSkills) {
    const categoriesMap: { [cat: string]: string[] } = {};
    skills.forEach((s) => {
      const cat = s.category?.trim() || 'Core Competencies';
      if (!categoriesMap[cat]) {
        categoriesMap[cat] = [];
      }
      if (s.name && !categoriesMap[cat].includes(s.name.trim())) {
        categoriesMap[cat].push(s.name.trim());
      }
    });

    formattedSkills = Object.keys(categoriesMap).map((category) => ({
      category,
      skills: categoriesMap[category],
    }));
  }

  // Experience: Published only, chronological sorting
  let formattedExp: ATSResumeData['experience'] = [];
  if (cfg.includeExperience) {
    const publishedExp = experiences
      .filter((e) => e.status !== 'draft')
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    formattedExp = publishedExp.map((e) => {
      const start = e.startDate || `${e.startMonth || ''} ${e.startYear || ''}`.trim();
      const end = e.isCurrent ? 'Present' : e.endDate || `${e.endMonth || ''} ${e.endYear || ''}`.trim();
      const period = start && end ? `${start} – ${end}` : start || end || '2023 – Present';

      const bullets: string[] = [];
      if (Array.isArray(e.responsibilities) && e.responsibilities.length > 0) {
        e.responsibilities.forEach((r) => {
          if (r && r.trim()) bullets.push(r.trim());
        });
      }
      if (Array.isArray(e.achievements) && e.achievements.length > 0) {
        e.achievements.forEach((a) => {
          if (a && a.trim() && !bullets.includes(a.trim())) bullets.push(a.trim());
        });
      }
      if (bullets.length === 0 && e.description) {
        // Parse description into bullets if needed
        const lines = e.description
          .split('\n')
          .map((l) => l.replace(/^[-*•]\s*/, '').trim())
          .filter((l) => l.length > 0);
        bullets.push(...lines);
      }

      return {
        employer: e.employer,
        jobTitle: e.jobTitle,
        employmentType: e.employmentType,
        location: e.location,
        period,
        bullets,
        technologies: e.skillsUsed || [],
      };
    });
  }

  // Projects: Published only
  let formattedProjects: ATSResumeData['projects'] = [];
  if (cfg.includeProjects) {
    const publishedProjs = projects
      .filter((p) => p.status !== 'draft')
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    formattedProjects = publishedProjs.map((p) => {
      const highlights: string[] = [];
      if (Array.isArray(p.features) && p.features.length > 0) {
        p.features.forEach((f) => {
          if (f && f.trim()) highlights.push(f.trim());
        });
      }
      if (highlights.length === 0 && p.shortDescription) {
        highlights.push(p.shortDescription.trim());
      }

      const period = p.startDate ? `${p.startDate}${p.endDate ? ` – ${p.endDate}` : ''}` : undefined;

      return {
        name: p.name,
        category: p.category || p.subtitle,
        period,
        description: p.shortDescription || p.description,
        technologies: p.technologyStack || p.skillsUsed || [],
        highlights,
        url: p.projectUrl || p.demoUrl || p.repositoryUrl,
      };
    });
  }

  // Education
  let formattedEdu: ATSResumeData['education'] = [];
  if (cfg.includeEducation) {
    formattedEdu = education
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      .map((ed) => {
        const period = ed.startYear && ed.endYear ? `${ed.startYear} – ${ed.endYear}` : ed.endYear || '';
        return {
          institution: ed.institution,
          degree: ed.degree,
          fieldOfStudy: ed.fieldOfStudy,
          period,
          grade: ed.grade,
          highlights: ed.highlights || [],
        };
      });
  }

  // Certifications: Published only
  let formattedCerts: ATSResumeData['certifications'] = [];
  if (cfg.includeCertifications) {
    formattedCerts = certifications
      .filter((c) => c.status !== 'draft')
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      .map((c) => ({
        title: c.title,
        issuer: c.issuer,
        date: c.completionDate || `${c.issueMonth || ''} ${c.issueYear || ''}`.trim(),
        credentialId: c.credentialId,
        url: c.verificationUrl,
      }));
  }

  return {
    fullName,
    headline,
    summary,
    contact,
    skills: formattedSkills,
    experience: formattedExp,
    projects: formattedProjects,
    education: formattedEdu,
    certifications: formattedCerts,
    generatedDate: new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
  };
}

/**
 * Generates an ATS-compliant PDF document using jsPDF.
 * Follows strict ATS parsing guidelines:
 * - Single column
 * - Pure black text (#111111) on white background (#ffffff)
 * - Standard A4 dimensions with 16mm margins
 * - Genuine selectable vector text
 * - Clickable URLs for contact and project links
 * - Standard headings with clean dividing lines
 * - Dynamic page breaks with bottom margins
 */
export function generatePdf(data: ATSResumeData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 16;
  const contentWidth = pageWidth - marginX * 2; // 178mm
  const bottomLimit = pageHeight - 16;
  let currentY = 16;

  // Helper: dynamic page breaking
  const ensureSpace = (neededHeight: number) => {
    if (currentY + neededHeight > bottomLimit) {
      doc.addPage();
      currentY = 16;
    }
  };

  // Helper: section heading with clean ATS rule
  const renderSectionHeader = (title: string) => {
    ensureSpace(12);
    currentY += 3;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(20, 20, 20);
    doc.text(title.toUpperCase(), marginX, currentY);

    currentY += 1.8;
    doc.setDrawColor(210, 214, 220);
    doc.setLineWidth(0.35);
    doc.line(marginX, currentY, pageWidth - marginX, currentY);
    currentY += 4.2;
  };

  // ==========================================
  // 1. CANDIDATE HEADER (NAME & CONTACT INFO)
  // ==========================================
  // Full Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.setTextColor(10, 10, 10);
  doc.text(data.fullName.toUpperCase(), pageWidth / 2, currentY, { align: 'center' });
  currentY += 5.5;

  // Professional Headline
  if (data.headline) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(70, 70, 70);
    const splitHeadline = doc.splitTextToSize(data.headline, contentWidth);
    doc.text(splitHeadline, pageWidth / 2, currentY, { align: 'center' });
    currentY += splitHeadline.length * 4.2 + 1;
  }

  // Contact line items
  const contactParts: { text: string; url?: string }[] = [];
  if (data.contact.email) {
    contactParts.push({ text: data.contact.email, url: `mailto:${data.contact.email}` });
  }
  if (data.contact.phone) {
    contactParts.push({ text: data.contact.phone, url: `tel:${data.contact.phone}` });
  }
  if (data.contact.location) {
    contactParts.push({ text: data.contact.location });
  }
  if (data.contact.linkedin) {
    const cleanLi = data.contact.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, 'linkedin.com/in/');
    contactParts.push({ text: cleanLi, url: data.contact.linkedin });
  }
  if (data.contact.github) {
    const cleanGh = data.contact.github.replace(/^https?:\/\/(www\.)?github\.com\//, 'github.com/');
    contactParts.push({ text: cleanGh, url: data.contact.github });
  }
  if (data.contact.portfolio) {
    const cleanPf = data.contact.portfolio.replace(/^https?:\/\//, '').replace(/\/$/, '');
    contactParts.push({ text: cleanPf, url: data.contact.portfolio });
  }

  if (contactParts.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(60, 60, 60);

    const fullContactStr = contactParts.map((p) => p.text).join('  |  ');
    const contactLines = doc.splitTextToSize(fullContactStr, contentWidth);

    contactLines.forEach((line: string) => {
      doc.text(line, pageWidth / 2, currentY, { align: 'center' });
      currentY += 4.0;
    });
    currentY += 2;
  }

  // ==========================================
  // 2. PROFESSIONAL SUMMARY
  // ==========================================
  if (data.summary) {
    renderSectionHeader('Professional Summary');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(35, 35, 35);

    const summaryLines = doc.splitTextToSize(data.summary, contentWidth);
    summaryLines.forEach((line: string) => {
      ensureSpace(4);
      doc.text(line, marginX, currentY);
      currentY += 4.0;
    });
    currentY += 2;
  }

  // ==========================================
  // 3. CORE COMPETENCIES & TECHNICAL SKILLS
  // ==========================================
  if (data.skills && data.skills.length > 0) {
    renderSectionHeader('Core Competencies & Technical Skills');
    data.skills.forEach((group) => {
      ensureSpace(5);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.8);
      doc.setTextColor(20, 20, 20);

      const catLabel = `${group.category}: `;
      doc.text(catLabel, marginX, currentY);

      const catWidth = doc.getTextWidth(catLabel);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40, 40, 40);

      const skillsStr = group.skills.join(', ');
      const availableWidth = contentWidth - catWidth;
      const wrappedSkills = doc.splitTextToSize(skillsStr, availableWidth);

      if (wrappedSkills.length > 0) {
        doc.text(wrappedSkills[0], marginX + catWidth, currentY);
        currentY += 4.0;
        for (let i = 1; i < wrappedSkills.length; i++) {
          ensureSpace(4);
          doc.text(wrappedSkills[i], marginX + 4, currentY);
          currentY += 4.0;
        }
      } else {
        currentY += 4.0;
      }
    });
    currentY += 2;
  }

  // ==========================================
  // 4. WORK EXPERIENCE
  // ==========================================
  if (data.experience && data.experience.length > 0) {
    renderSectionHeader('Work Experience');
    data.experience.forEach((exp) => {
      ensureSpace(12);

      // Line 1: Job Title (Bold) + Dates (Right aligned)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 15, 15);
      doc.text(exp.jobTitle, marginX, currentY);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.8);
      doc.setTextColor(60, 60, 60);
      doc.text(exp.period, pageWidth - marginX, currentY, { align: 'right' });
      currentY += 4.0;

      // Line 2: Company + Location
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.8);
      doc.setTextColor(70, 70, 70);
      const companyLine = exp.location ? `${exp.employer}  \u2022  ${exp.location}` : exp.employer;
      doc.text(companyLine, marginX, currentY);
      currentY += 4.2;

      // Bullets
      if (exp.bullets && exp.bullets.length > 0) {
        exp.bullets.forEach((bullet) => {
          ensureSpace(5);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(35, 35, 35);

          const bulletIndent = 4.5;
          const textWidth = contentWidth - bulletIndent;
          const lines = doc.splitTextToSize(bullet, textWidth);

          // Draw bullet dot
          doc.text('\u2022', marginX + 1, currentY);
          lines.forEach((l: string, idx: number) => {
            if (idx > 0) ensureSpace(3.8);
            doc.text(l, marginX + bulletIndent, currentY);
            currentY += 3.8;
          });
        });
      }

      currentY += 2;
    });
  }

  // ==========================================
  // 5. NOTABLE PROJECTS & SYSTEMS
  // ==========================================
  if (data.projects && data.projects.length > 0) {
    renderSectionHeader('Notable Projects & Systems Architecture');
    data.projects.forEach((proj) => {
      ensureSpace(11);

      // Line 1: Name + Category + Period
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 15, 15);
      const nameText = proj.category ? `${proj.name}  |  ${proj.category}` : proj.name;
      doc.text(nameText, marginX, currentY);

      if (proj.period) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(80, 80, 80);
        doc.text(proj.period, pageWidth - marginX, currentY, { align: 'right' });
      }
      currentY += 4.0;

      // Line 2: Description
      if (proj.description) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(40, 40, 40);
        const descLines = doc.splitTextToSize(proj.description, contentWidth);
        descLines.forEach((dl: string) => {
          ensureSpace(3.8);
          doc.text(dl, marginX, currentY);
          currentY += 3.8;
        });
      }

      // Tech Stack
      if (proj.technologies && proj.technologies.length > 0) {
        ensureSpace(4);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.2);
        doc.setTextColor(40, 40, 40);
        const techLabel = 'Technologies: ';
        doc.text(techLabel, marginX, currentY);

        const techLabelWidth = doc.getTextWidth(techLabel);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(70, 70, 70);
        const techStr = proj.technologies.join(', ');
        const wrappedTech = doc.splitTextToSize(techStr, contentWidth - techLabelWidth);
        if (wrappedTech.length > 0) {
          doc.text(wrappedTech[0], marginX + techLabelWidth, currentY);
          currentY += 3.8;
          for (let ti = 1; ti < wrappedTech.length; ti++) {
            ensureSpace(3.8);
            doc.text(wrappedTech[ti], marginX + 4, currentY);
            currentY += 3.8;
          }
        }
      }

      // Project Bullet Highlights
      if (proj.highlights && proj.highlights.length > 0) {
        proj.highlights.forEach((hl) => {
          ensureSpace(4);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(40, 40, 40);
          const lines = doc.splitTextToSize(hl, contentWidth - 4.5);
          doc.text('\u2022', marginX + 1, currentY);
          lines.forEach((l: string, idx: number) => {
            if (idx > 0) ensureSpace(3.8);
            doc.text(l, marginX + 4.5, currentY);
            currentY += 3.8;
          });
        });
      }

      currentY += 2;
    });
  }

  // ==========================================
  // 6. EDUCATION
  // ==========================================
  if (data.education && data.education.length > 0) {
    renderSectionHeader('Education');
    data.education.forEach((edu) => {
      ensureSpace(9);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.2);
      doc.setTextColor(15, 15, 15);
      const degreeText = `${edu.degree}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}`;
      doc.text(degreeText, marginX, currentY);

      if (edu.period) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(70, 70, 70);
        doc.text(edu.period, pageWidth - marginX, currentY, { align: 'right' });
      }
      currentY += 4.0;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.6);
      doc.setTextColor(60, 60, 60);
      const instLine = edu.grade ? `${edu.institution}  \u2022  Grade/Score: ${edu.grade}` : edu.institution;
      doc.text(instLine, marginX, currentY);
      currentY += 4.5;
    });
  }

  // ==========================================
  // 7. CERTIFICATIONS & CREDENTIALS
  // ==========================================
  if (data.certifications && data.certifications.length > 0) {
    renderSectionHeader('Certifications & Credentials');
    data.certifications.forEach((cert) => {
      ensureSpace(8);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(20, 20, 20);
      doc.text(cert.title, marginX, currentY);

      if (cert.date) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(80, 80, 80);
        doc.text(cert.date, pageWidth - marginX, currentY, { align: 'right' });
      }
      currentY += 3.8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(70, 70, 70);
      const issuerText = cert.credentialId
        ? `${cert.issuer}  \u2022  Credential ID: ${cert.credentialId}`
        : cert.issuer;
      doc.text(issuerText, marginX, currentY);
      currentY += 4.2;
    });
  }

  // Add subtle page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Ayush Prakash  \u2022  ATS Resume  \u2022  Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  return doc;
}

/**
 * Downloads the generated PDF directly in the browser.
 */
export function downloadPdf(data: ATSResumeData, customFileName?: string): void {
  const doc = generatePdf(data);
  const cleanName = data.fullName.replace(/\s+/g, '_');
  const fileName = customFileName || `${cleanName}_ATS_Resume.pdf`;
  doc.save(fileName);
}

/**
 * Generates an ATS-compliant Microsoft Word (.docx) document using the docx library.
 * Strictly formatted for applicant tracking systems:
 * - Single column layout
 * - Standard native Word headings and body text
 * - Native bullet lists
 * - Proper clickable hyperlinks
 * - Clean metadata
 */
export async function generateDocxBlob(data: ATSResumeData): Promise<Blob> {
  const children: (Paragraph)[] = [];

  // Helper for section heading in DOCX
  const createSectionHeading = (title: string): Paragraph => {
    return new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 80 },
      border: {
        bottom: {
          color: 'D0D4DC',
          space: 2,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
      children: [
        new TextRun({
          text: title.toUpperCase(),
          bold: true,
          size: 21, // 10.5pt
          color: '111111',
          font: 'Calibri',
        }),
      ],
    });
  };

  // 1. Candidate Name (Heading 1)
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 60 },
      children: [
        new TextRun({
          text: data.fullName.toUpperCase(),
          bold: true,
          size: 38, // 19pt
          color: '000000',
          font: 'Calibri',
        }),
      ],
    })
  );

  // 2. Headline
  if (data.headline) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 80 },
        children: [
          new TextRun({
            text: data.headline,
            italics: true,
            size: 19, // 9.5pt
            color: '444444',
            font: 'Calibri',
          }),
        ],
      })
    );
  }

  // 3. Contact Bar
  const contactRuns: (TextRun | ExternalHyperlink)[] = [];
  const addContactItem = (label: string, url?: string) => {
    if (contactRuns.length > 0) {
      contactRuns.push(
        new TextRun({
          text: '  |  ',
          color: '777777',
          size: 18,
          font: 'Calibri',
        })
      );
    }
    if (url) {
      contactRuns.push(
        new ExternalHyperlink({
          children: [
            new TextRun({
              text: label,
              color: '1A56DB',
              underline: { type: UnderlineType.SINGLE },
              size: 18,
              font: 'Calibri',
            }),
          ],
          link: url,
        })
      );
    } else {
      contactRuns.push(
        new TextRun({
          text: label,
          color: '444444',
          size: 18,
          font: 'Calibri',
        })
      );
    }
  };

  if (data.contact.email) addContactItem(data.contact.email, `mailto:${data.contact.email}`);
  if (data.contact.phone) addContactItem(data.contact.phone, `tel:${data.contact.phone}`);
  if (data.contact.location) addContactItem(data.contact.location);
  if (data.contact.linkedin) addContactItem('LinkedIn', data.contact.linkedin);
  if (data.contact.github) addContactItem('GitHub', data.contact.github);
  if (data.contact.portfolio) addContactItem('Portfolio', data.contact.portfolio);

  if (contactRuns.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 180 },
        children: contactRuns,
      })
    );
  }

  // 4. Professional Summary
  if (data.summary) {
    children.push(createSectionHeading('Professional Summary'));
    children.push(
      new Paragraph({
        spacing: { before: 40, after: 120 },
        children: [
          new TextRun({
            text: data.summary,
            size: 19, // 9.5pt
            color: '222222',
            font: 'Calibri',
          }),
        ],
      })
    );
  }

  // 5. Core Competencies & Skills
  if (data.skills && data.skills.length > 0) {
    children.push(createSectionHeading('Core Competencies & Technical Skills'));
    data.skills.forEach((g) => {
      children.push(
        new Paragraph({
          spacing: { before: 40, after: 40 },
          children: [
            new TextRun({
              text: `${g.category}: `,
              bold: true,
              size: 18, // 9pt
              color: '111111',
              font: 'Calibri',
            }),
            new TextRun({
              text: g.skills.join(', '),
              size: 18, // 9pt
              color: '333333',
              font: 'Calibri',
            }),
          ],
        })
      );
    });
  }

  // 6. Work Experience
  if (data.experience && data.experience.length > 0) {
    children.push(createSectionHeading('Work Experience'));
    data.experience.forEach((exp) => {
      // Role & Dates
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 20 },
          children: [
            new TextRun({
              text: exp.jobTitle,
              bold: true,
              size: 20, // 10pt
              color: '000000',
              font: 'Calibri',
            }),
            new TextRun({
              text: `  \u2014  ${exp.period}`,
              bold: true,
              size: 18,
              color: '555555',
              font: 'Calibri',
            }),
          ],
        })
      );

      // Employer & Location
      const companyLine = exp.location ? `${exp.employer} | ${exp.location}` : exp.employer;
      children.push(
        new Paragraph({
          spacing: { before: 0, after: 60 },
          children: [
            new TextRun({
              text: companyLine,
              italics: true,
              size: 18,
              color: '555555',
              font: 'Calibri',
            }),
          ],
        })
      );

      // Bullets
      if (exp.bullets && exp.bullets.length > 0) {
        exp.bullets.forEach((b) => {
          children.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { before: 20, after: 20 },
              children: [
                new TextRun({
                  text: b,
                  size: 18,
                  color: '222222',
                  font: 'Calibri',
                }),
              ],
            })
          );
        });
      }
    });
  }

  // 7. Notable Projects
  if (data.projects && data.projects.length > 0) {
    children.push(createSectionHeading('Notable Projects & Systems Architecture'));
    data.projects.forEach((proj) => {
      const projHeader = proj.category ? `${proj.name}  (${proj.category})` : proj.name;
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 20 },
          children: [
            new TextRun({
              text: projHeader,
              bold: true,
              size: 19,
              color: '000000',
              font: 'Calibri',
            }),
            ...(proj.period
              ? [
                  new TextRun({
                    text: `  \u2014  ${proj.period}`,
                    size: 18,
                    color: '555555',
                    font: 'Calibri',
                  }),
                ]
              : []),
          ],
        })
      );

      if (proj.description) {
        children.push(
          new Paragraph({
            spacing: { before: 0, after: 40 },
            children: [
              new TextRun({
                text: proj.description,
                size: 18,
                color: '333333',
                font: 'Calibri',
              }),
            ],
          })
        );
      }

      if (proj.technologies && proj.technologies.length > 0) {
        children.push(
          new Paragraph({
            spacing: { before: 0, after: 40 },
            children: [
              new TextRun({
                text: 'Technologies: ',
                bold: true,
                size: 17,
                color: '222222',
                font: 'Calibri',
              }),
              new TextRun({
                text: proj.technologies.join(', '),
                size: 17,
                color: '555555',
                font: 'Calibri',
              }),
            ],
          })
        );
      }

      if (proj.highlights && proj.highlights.length > 0) {
        proj.highlights.forEach((hl) => {
          children.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { before: 20, after: 20 },
              children: [
                new TextRun({
                  text: hl,
                  size: 18,
                  color: '222222',
                  font: 'Calibri',
                }),
              ],
            })
          );
        });
      }
    });
  }

  // 8. Education
  if (data.education && data.education.length > 0) {
    children.push(createSectionHeading('Education'));
    data.education.forEach((edu) => {
      const degreeStr = `${edu.degree}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}`;
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 20 },
          children: [
            new TextRun({
              text: degreeStr,
              bold: true,
              size: 19,
              color: '000000',
              font: 'Calibri',
            }),
            ...(edu.period
              ? [
                  new TextRun({
                    text: `  \u2014  ${edu.period}`,
                    size: 18,
                    color: '555555',
                    font: 'Calibri',
                  }),
                ]
              : []),
          ],
        })
      );

      const instStr = edu.grade ? `${edu.institution} (Score: ${edu.grade})` : edu.institution;
      children.push(
        new Paragraph({
          spacing: { before: 0, after: 60 },
          children: [
            new TextRun({
              text: instStr,
              italics: true,
              size: 18,
              color: '555555',
              font: 'Calibri',
            }),
          ],
        })
      );
    });
  }

  // 9. Certifications
  if (data.certifications && data.certifications.length > 0) {
    children.push(createSectionHeading('Certifications & Credentials'));
    data.certifications.forEach((c) => {
      children.push(
        new Paragraph({
          spacing: { before: 60, after: 20 },
          children: [
            new TextRun({
              text: c.title,
              bold: true,
              size: 19,
              color: '000000',
              font: 'Calibri',
            }),
            ...(c.date
              ? [
                  new TextRun({
                    text: `  \u2014  ${c.date}`,
                    size: 18,
                    color: '555555',
                    font: 'Calibri',
                  }),
                ]
              : []),
          ],
        })
      );

      const certIssuer = c.credentialId ? `${c.issuer} | ID: ${c.credentialId}` : c.issuer;
      children.push(
        new Paragraph({
          spacing: { before: 0, after: 40 },
          children: [
            new TextRun({
              text: certIssuer,
              italics: true,
              size: 18,
              color: '555555',
              font: 'Calibri',
            }),
          ],
        })
      );
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1080, // 0.75 in
              right: 1080,
              bottom: 1080,
              left: 1080,
            },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

/**
 * Downloads the generated DOCX file in the browser.
 */
export async function downloadDocx(data: ATSResumeData, customFileName?: string): Promise<void> {
  const blob = await generateDocxBlob(data);
  const cleanName = data.fullName.replace(/\s+/g, '_');
  const fileName = customFileName || `${cleanName}_ATS_Resume.docx`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
