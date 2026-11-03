import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
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
import {
  DEFAULT_PROFILE,
  DEFAULT_EXPERIENCES,
  DEFAULT_PROJECTS,
  DEFAULT_CERTIFICATIONS,
  DEFAULT_SKILLS,
  DEFAULT_EDUCATION,
  DEFAULT_CONTACT_MESSAGES,
  DEFAULT_SITE_SETTINGS,
  DEFAULT_MEDIA_ASSETS,
  DEFAULT_HOMEPAGE_SETTINGS,
  DEFAULT_ABOUT_SETTINGS,
  DEFAULT_RESUME_RECORD,
  DEFAULT_SECTIONS_CONFIG,
  DEFAULT_APPEARANCE_SETTINGS,
} from '../data/seedData';

const STORAGE_KEYS = {
  profile: 'ayush_cms_profile_v1',
  experiences: 'ayush_cms_experiences_v1',
  projects: 'ayush_cms_projects_v1',
  certifications: 'ayush_cms_certifications_v1',
  skills: 'ayush_cms_skills_v1',
  education: 'ayush_cms_education_v1',
  messages: 'ayush_cms_messages_v1',
  settings: 'ayush_cms_settings_v1',
  media: 'ayush_cms_media_v1',
  homepage: 'ayush_cms_homepage_v1',
  about: 'ayush_cms_about_v1',
  resume: 'ayush_cms_resume_v1',
  sections: 'ayush_cms_sections_v1',
  appearance: 'ayush_cms_appearance_v1',
};

// Global reactive subscribers
type Listener = () => void;
const listeners = new Set<Listener>();

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

export const cmsService = {
  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },

  // ================= PROFILE =================
  getProfile(): ProfileData {
    const raw = localStorage.getItem(STORAGE_KEYS.profile);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    return DEFAULT_PROFILE;
  },

  async updateProfile(profile: ProfileData): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
    if (db) {
      try {
        await setDoc(doc(db, 'profile', 'main'), profile);
      } catch (err) {
        console.warn('[CMS Firestore] Profile sync notice:', err);
      }
    }
    notifyListeners();
  },

  // ================= EXPERIENCES =================
  getExperiences(onlyPublished = false): ExperienceRecord[] {
    let list: ExperienceRecord[] = DEFAULT_EXPERIENCES;
    const raw = localStorage.getItem(STORAGE_KEYS.experiences);
    if (raw) {
      try {
        list = JSON.parse(raw);
      } catch {
        list = DEFAULT_EXPERIENCES;
      }
    }
    if (onlyPublished) {
      list = list.filter((e) => e.status === 'published');
    }
    return list.sort((a, b) => a.displayOrder - b.displayOrder);
  },

  async addExperience(exp: Omit<ExperienceRecord, 'id'>): Promise<ExperienceRecord> {
    const experiences = this.getExperiences(false);
    const newRecord: ExperienceRecord = {
      ...exp,
      id: 'exp-' + Date.now(),
    };
    experiences.unshift(newRecord);
    localStorage.setItem(STORAGE_KEYS.experiences, JSON.stringify(experiences));
    if (db) {
      try {
        await setDoc(doc(db, 'experiences', newRecord.id), newRecord);
      } catch (err) {
        console.warn('[CMS Firestore] Experience add notice:', err);
      }
    }
    notifyListeners();
    return newRecord;
  },

  async updateExperience(id: string, updates: Partial<ExperienceRecord>): Promise<void> {
    const experiences = this.getExperiences(false);
    const idx = experiences.findIndex((e) => e.id === id);
    if (idx !== -1) {
      experiences[idx] = { ...experiences[idx], ...updates };
      localStorage.setItem(STORAGE_KEYS.experiences, JSON.stringify(experiences));
      if (db) {
        try {
          await updateDoc(doc(db, 'experiences', id), updates as any);
        } catch (err) {
          console.warn('[CMS Firestore] Experience update notice:', err);
        }
      }
      notifyListeners();
    }
  },

  async deleteExperience(id: string): Promise<void> {
    let experiences = this.getExperiences(false);
    experiences = experiences.filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.experiences, JSON.stringify(experiences));
    if (db) {
      try {
        await deleteDoc(doc(db, 'experiences', id));
      } catch (err) {
        console.warn('[CMS Firestore] Experience delete notice:', err);
      }
    }
    notifyListeners();
  },

  // ================= PROJECTS =================
  getProjects(onlyPublished = false): ProjectRecord[] {
    let list: ProjectRecord[] = DEFAULT_PROJECTS;
    const raw = localStorage.getItem(STORAGE_KEYS.projects);
    if (raw) {
      try {
        list = JSON.parse(raw);
      } catch {
        list = DEFAULT_PROJECTS;
      }
    }
    if (onlyPublished) {
      list = list.filter((p) => p.status === 'published');
    }
    return list.sort((a, b) => a.displayOrder - b.displayOrder);
  },

  async addProject(proj: Omit<ProjectRecord, 'id'>): Promise<ProjectRecord> {
    const projects = this.getProjects(false);
    const newRecord: ProjectRecord = {
      ...proj,
      id: 'proj-' + Date.now(),
    };
    projects.push(newRecord);
    localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
    if (db) {
      try {
        await setDoc(doc(db, 'projects', newRecord.id), newRecord);
      } catch (err) {
        console.warn('[CMS Firestore] Project add notice:', err);
      }
    }
    notifyListeners();
    return newRecord;
  },

  async updateProject(id: string, updates: Partial<ProjectRecord>): Promise<void> {
    const projects = this.getProjects(false);
    const idx = projects.findIndex((p) => p.id === id);
    if (idx !== -1) {
      projects[idx] = { ...projects[idx], ...updates };
      localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
      if (db) {
        try {
          await updateDoc(doc(db, 'projects', id), updates as any);
        } catch (err) {
          console.warn('[CMS Firestore] Project update notice:', err);
        }
      }
      notifyListeners();
    }
  },

  async deleteProject(id: string): Promise<void> {
    let projects = this.getProjects(false);
    projects = projects.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
    if (db) {
      try {
        await deleteDoc(doc(db, 'projects', id));
      } catch (err) {
        console.warn('[CMS Firestore] Project delete notice:', err);
      }
    }
    notifyListeners();
  },

  // ================= CERTIFICATIONS =================
  getCertifications(onlyPublished = false): CertificationRecord[] {
    let list: CertificationRecord[] = DEFAULT_CERTIFICATIONS;
    const raw = localStorage.getItem(STORAGE_KEYS.certifications);
    if (raw) {
      try {
        list = JSON.parse(raw);
      } catch {
        list = DEFAULT_CERTIFICATIONS;
      }
    }
    if (onlyPublished) {
      list = list.filter((c) => c.status === 'published');
    }
    return list;
  },

  async addCertification(cert: Omit<CertificationRecord, 'id'>): Promise<CertificationRecord> {
    const certs = this.getCertifications(false);
    const newRecord: CertificationRecord = {
      ...cert,
      id: 'cert-' + Date.now(),
    };
    certs.unshift(newRecord);
    localStorage.setItem(STORAGE_KEYS.certifications, JSON.stringify(certs));
    if (db) {
      try {
        await setDoc(doc(db, 'certifications', newRecord.id), newRecord);
      } catch (err) {
        console.warn('[CMS Firestore] Cert add notice:', err);
      }
    }
    notifyListeners();
    return newRecord;
  },

  async updateCertification(id: string, updates: Partial<CertificationRecord>): Promise<void> {
    const certs = this.getCertifications(false);
    const idx = certs.findIndex((c) => c.id === id);
    if (idx !== -1) {
      certs[idx] = { ...certs[idx], ...updates };
      localStorage.setItem(STORAGE_KEYS.certifications, JSON.stringify(certs));
      if (db) {
        try {
          await updateDoc(doc(db, 'certifications', id), updates as any);
        } catch (err) {
          console.warn('[CMS Firestore] Cert update notice:', err);
        }
      }
      notifyListeners();
    }
  },

  async deleteCertification(id: string): Promise<void> {
    let certs = this.getCertifications(false);
    certs = certs.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.certifications, JSON.stringify(certs));
    if (db) {
      try {
        await deleteDoc(doc(db, 'certifications', id));
      } catch (err) {
        console.warn('[CMS Firestore] Cert delete notice:', err);
      }
    }
    notifyListeners();
  },

  // ================= SKILLS =================
  getSkills(): SkillRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.skills);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    return DEFAULT_SKILLS;
  },

  async addSkill(skill: Omit<SkillRecord, 'id'>): Promise<SkillRecord> {
    const skills = this.getSkills();
    const newRecord: SkillRecord = {
      ...skill,
      id: 'sk-' + Date.now(),
    };
    skills.push(newRecord);
    localStorage.setItem(STORAGE_KEYS.skills, JSON.stringify(skills));
    if (db) {
      try {
        await setDoc(doc(db, 'skills', newRecord.id), newRecord);
      } catch (err) {
        console.warn('[CMS Firestore] Skill add notice:', err);
      }
    }
    notifyListeners();
    return newRecord;
  },

  async updateSkill(id: string, updates: Partial<SkillRecord>): Promise<void> {
    const skills = this.getSkills();
    const idx = skills.findIndex((s) => s.id === id);
    if (idx !== -1) {
      skills[idx] = { ...skills[idx], ...updates };
      localStorage.setItem(STORAGE_KEYS.skills, JSON.stringify(skills));
      if (db) {
        try {
          await updateDoc(doc(db, 'skills', id), updates as any);
        } catch (err) {
          console.warn('[CMS Firestore] Skill update notice:', err);
        }
      }
      notifyListeners();
    }
  },

  async deleteSkill(id: string): Promise<void> {
    let skills = this.getSkills();
    skills = skills.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.skills, JSON.stringify(skills));
    if (db) {
      try {
        await deleteDoc(doc(db, 'skills', id));
      } catch (err) {
        console.warn('[CMS Firestore] Skill delete notice:', err);
      }
    }
    notifyListeners();
  },

  // ================= EDUCATION =================
  getEducation(): EducationRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.education);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    return DEFAULT_EDUCATION;
  },

  async addEducation(edu: Omit<EducationRecord, 'id'>): Promise<EducationRecord> {
    const education = this.getEducation();
    const newRecord: EducationRecord = {
      ...edu,
      id: 'edu-' + Date.now(),
    };
    education.push(newRecord);
    localStorage.setItem(STORAGE_KEYS.education, JSON.stringify(education));
    if (db) {
      try {
        await setDoc(doc(db, 'education', newRecord.id), newRecord);
      } catch (err) {
        console.warn('[CMS Firestore] Education add notice:', err);
      }
    }
    notifyListeners();
    return newRecord;
  },

  async updateEducation(id: string, updates: Partial<EducationRecord>): Promise<void> {
    const education = this.getEducation();
    const idx = education.findIndex((e) => e.id === id);
    if (idx !== -1) {
      education[idx] = { ...education[idx], ...updates };
      localStorage.setItem(STORAGE_KEYS.education, JSON.stringify(education));
      if (db) {
        try {
          await updateDoc(doc(db, 'education', id), updates as any);
        } catch (err) {
          console.warn('[CMS Firestore] Education update notice:', err);
        }
      }
      notifyListeners();
    }
  },

  async deleteEducation(id: string): Promise<void> {
    let education = this.getEducation();
    education = education.filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.education, JSON.stringify(education));
    if (db) {
      try {
        await deleteDoc(doc(db, 'education', id));
      } catch (err) {
        console.warn('[CMS Firestore] Education delete notice:', err);
      }
    }
    notifyListeners();
  },

  // ================= SITE SETTINGS =================
  getSiteSettings(): SiteSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.settings);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    return DEFAULT_SITE_SETTINGS;
  },

  async updateSiteSettings(settings: SiteSettings): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
    if (db) {
      try {
        await setDoc(doc(db, 'siteSettings', 'global'), settings);
      } catch (err) {
        console.warn('[CMS Firestore] SiteSettings update notice:', err);
      }
    }
    notifyListeners();
  },

  // ================= CONTACT MESSAGES =================
  getContactMessages(): ContactMessage[] {
    const raw = localStorage.getItem(STORAGE_KEYS.messages);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    return DEFAULT_CONTACT_MESSAGES;
  },

  async submitContactMessage(msg: {
    name: string;
    email: string;
    organization?: string;
    subject: string;
    message: string;
  }): Promise<{ success: boolean; id: string }> {
    const messages = this.getContactMessages();
    const newRecord: ContactMessage = {
      ...msg,
      id: 'msg-' + Date.now(),
      createdAt: new Date().toISOString(),
      read: false,
      archived: false,
    };
    messages.unshift(newRecord);
    localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages));
    if (db) {
      try {
        await addDoc(collection(db, 'contactMessages'), newRecord);
      } catch (err) {
        console.warn('[CMS Firestore] ContactMessage store notice:', err);
      }
    }
    notifyListeners();
    return { success: true, id: newRecord.id };
  },

  async markMessageRead(id: string, read: boolean): Promise<void> {
    const messages = this.getContactMessages();
    const idx = messages.findIndex((m) => m.id === id);
    if (idx !== -1) {
      messages[idx].read = read;
      localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages));
      notifyListeners();
    }
  },

  async archiveMessage(id: string, archived: boolean): Promise<void> {
    const messages = this.getContactMessages();
    const idx = messages.findIndex((m) => m.id === id);
    if (idx !== -1) {
      messages[idx].archived = archived;
      localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages));
      notifyListeners();
    }
  },

  async deleteMessage(id: string): Promise<void> {
    let messages = this.getContactMessages();
    messages = messages.filter((m) => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages));
    notifyListeners();
  },

  // ================= MEDIA ASSETS & RESUME =================
  getMediaAssets(): MediaAsset[] {
    const raw = localStorage.getItem(STORAGE_KEYS.media);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    return DEFAULT_MEDIA_ASSETS;
  },

  async addMediaAsset(asset: Omit<MediaAsset, 'id' | 'uploadedAt'>): Promise<MediaAsset> {
    const assets = this.getMediaAssets();
    const newAsset: MediaAsset = {
      ...asset,
      id: 'media-' + Date.now(),
      uploadedAt: new Date().toISOString(),
    };
    assets.unshift(newAsset);
    localStorage.setItem(STORAGE_KEYS.media, JSON.stringify(assets));
    notifyListeners();
    return newAsset;
  },

  async deleteMediaAsset(id: string): Promise<void> {
    let assets = this.getMediaAssets();
    assets = assets.filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.media, JSON.stringify(assets));
    notifyListeners();
  },

  async uploadResume(filename: string, fileUrl: string, sizeBytes: number): Promise<void> {
    const profile = this.getProfile();
    profile.resumeUrl = fileUrl;
    await this.updateProfile(profile);

    await this.addMediaAsset({
      name: filename,
      url: fileUrl,
      type: 'application/pdf',
      sizeBytes,
      category: 'resume',
    });
  },

  // ================= HOMEPAGE SETTINGS =================
  getHomepageSettings(): HomepageSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.homepage);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    return DEFAULT_HOMEPAGE_SETTINGS;
  },

  async updateHomepageSettings(settings: HomepageSettings): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.homepage, JSON.stringify(settings));
    if (db) {
      try {
        await setDoc(doc(db, 'settings', 'homepage'), settings);
      } catch (err) {
        console.warn('[CMS Firestore] Homepage settings sync notice:', err);
      }
    }
    notifyListeners();
  },

  // ================= ABOUT SETTINGS =================
  getAboutSettings(): AboutSectionSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.about);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    return DEFAULT_ABOUT_SETTINGS;
  },

  async updateAboutSettings(about: AboutSectionSettings): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.about, JSON.stringify(about));
    if (db) {
      try {
        await setDoc(doc(db, 'settings', 'about'), about);
      } catch (err) {
        console.warn('[CMS Firestore] About settings sync notice:', err);
      }
    }
    notifyListeners();
  },

  // ================= RESUME RECORD =================
  getResumeRecord(): ResumeRecord {
    const raw = localStorage.getItem(STORAGE_KEYS.resume);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    return DEFAULT_RESUME_RECORD;
  },

  async updateResumeRecord(resume: ResumeRecord): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.resume, JSON.stringify(resume));
    // Also sync profile resumeUrl
    const profile = this.getProfile();
    profile.resumeUrl = resume.fileUrl;
    profile.resumeButtonText = resume.buttonText;
    profile.isResumeDownloadEnabled = resume.isPublicEnabled;
    await this.updateProfile(profile);

    if (db) {
      try {
        await setDoc(doc(db, 'resume', 'primary'), resume);
      } catch (err) {
        console.warn('[CMS Firestore] Resume record sync notice:', err);
      }
    }
    notifyListeners();
  },

  async uploadResumeFile(file: File, buttonText?: string): Promise<ResumeRecord> {
    let fileUrl = '';
    // Try Firebase Storage first
    try {
      const { storage } = await import('./firebase');
      if (storage) {
        const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
        const storageRef = ref(storage, `resumes/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        fileUrl = await getDownloadURL(snapshot.ref);
      }
    } catch (err) {
      console.warn('[CMS Storage] Upload to Firebase Storage fallback:', err);
    }

    // Fallback to local Data URL if Storage unavailable or unauthorized
    if (!fileUrl) {
      fileUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }

    const current = this.getResumeRecord();
    const updated: ResumeRecord = {
      ...current,
      id: 'resume-' + Date.now(),
      fileName: file.name,
      fileUrl,
      fileSizeBytes: file.size,
      uploadedAt: new Date().toISOString().split('T')[0],
      isActive: true,
      buttonText: buttonText || current.buttonText,
    };

    await this.updateResumeRecord(updated);

    // Also add to media library
    await this.addMediaAsset({
      name: file.name,
      url: fileUrl,
      type: 'application/pdf',
      sizeBytes: file.size,
      category: 'resume',
    });

    return updated;
  },

  // ================= SECTIONS CONFIG (SECTION MANAGER) =================
  getSectionsConfig(): SectionConfig[] {
    const raw = localStorage.getItem(STORAGE_KEYS.sections);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    return DEFAULT_SECTIONS_CONFIG;
  },

  async updateSectionsConfig(sections: SectionConfig[]): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.sections, JSON.stringify(sections));
    if (db) {
      try {
        await setDoc(doc(db, 'settings', 'sections'), { list: sections });
      } catch (err) {
        console.warn('[CMS Firestore] Sections config sync notice:', err);
      }
    }
    notifyListeners();
  },

  async toggleSectionVisibility(id: string): Promise<void> {
    const sections = this.getSectionsConfig();
    const idx = sections.findIndex((s) => s.id === id);
    if (idx !== -1) {
      sections[idx].isVisible = !sections[idx].isVisible;
      await this.updateSectionsConfig(sections);
    }
  },

  async deleteSection(id: string): Promise<void> {
    const sections = this.getSectionsConfig().filter((s) => s.id !== id);
    await this.updateSectionsConfig(sections);
  },

  // ================= APPEARANCE SETTINGS =================
  getAppearanceSettings(): AppearanceSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.appearance);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    return DEFAULT_APPEARANCE_SETTINGS;
  },

  async updateAppearanceSettings(appearance: AppearanceSettings): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.appearance, JSON.stringify(appearance));
    if (db) {
      try {
        await setDoc(doc(db, 'settings', 'appearance'), appearance);
      } catch (err) {
        console.warn('[CMS Firestore] Appearance settings sync notice:', err);
      }
    }
    notifyListeners();
  },

  // ================= DUPLICATE EXPERIENCE HELPER =================
  async duplicateExperience(id: string): Promise<ExperienceRecord | null> {
    const exp = this.getExperiences(false).find((e) => e.id === id);
    if (!exp) return null;
    const duplicated: Omit<ExperienceRecord, 'id'> = {
      ...exp,
      jobTitle: `${exp.jobTitle} (Copy)`,
      status: 'draft',
      displayOrder: exp.displayOrder + 1,
    };
    return await this.addExperience(duplicated);
  },

  // ================= DUPLICATE PROJECT HELPER =================
  async duplicateProject(id: string): Promise<ProjectRecord | null> {
    const proj = this.getProjects(false).find((p) => p.id === id);
    if (!proj) return null;
    const duplicated: Omit<ProjectRecord, 'id'> = {
      ...proj,
      name: `${proj.name} (Copy)`,
      status: 'draft',
      displayOrder: proj.displayOrder + 1,
    };
    return await this.addProject(duplicated);
  },

  // ================= DUPLICATE CERTIFICATION HELPER =================
  async duplicateCertification(id: string): Promise<CertificationRecord | null> {
    const cert = this.getCertifications(false).find((c) => c.id === id);
    if (!cert) return null;
    const duplicated: Omit<CertificationRecord, 'id'> = {
      ...cert,
      title: `${cert.title} (Copy)`,
      status: 'draft',
      displayOrder: (cert.displayOrder || 1) + 1,
    };
    return await this.addCertification(duplicated);
  },

  // ================= REORDERING HELPERS =================
  async reorderExperiences(ids: string[]): Promise<void> {
    const experiences = this.getExperiences(false);
    const reordered = ids
      .map((id, index) => {
        const item = experiences.find((e) => e.id === id);
        return item ? { ...item, displayOrder: index + 1 } : null;
      })
      .filter(Boolean) as ExperienceRecord[];
    localStorage.setItem(STORAGE_KEYS.experiences, JSON.stringify(reordered));
    if (db) {
      try {
        for (const item of reordered) {
          await updateDoc(doc(db, 'experiences', item.id), { displayOrder: item.displayOrder });
        }
      } catch (err) {
        console.warn('[CMS Firestore] Reorder experiences sync notice:', err);
      }
    }
    notifyListeners();
  },

  async reorderProjects(ids: string[]): Promise<void> {
    const projects = this.getProjects(false);
    const reordered = ids
      .map((id, index) => {
        const item = projects.find((p) => p.id === id);
        return item ? { ...item, displayOrder: index + 1 } : null;
      })
      .filter(Boolean) as ProjectRecord[];
    localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(reordered));
    if (db) {
      try {
        for (const item of reordered) {
          await updateDoc(doc(db, 'projects', item.id), { displayOrder: item.displayOrder });
        }
      } catch (err) {
        console.warn('[CMS Firestore] Reorder projects sync notice:', err);
      }
    }
    notifyListeners();
  },

  // ================= CENTRAL SKILL LIBRARY INTEGRATION =================
  async ensureSkill(name: string, category: string = 'General Capabilities'): Promise<SkillRecord> {
    const trimmed = name.trim();
    const skills = this.getSkills();
    const existing = skills.find((s) => s.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) return existing;

    const newSkill: Omit<SkillRecord, 'id'> = {
      name: trimmed,
      category,
      displayOrder: skills.length + 1,
    };
    return await this.addSkill(newSkill);
  },

  // ================= MEDIA USAGE DETECTOR =================
  checkMediaUsage(url: string): { isUsed: boolean; usedIn: string[] } {
    const usedIn: string[] = [];
    const profile = this.getProfile();
    if (profile.profilePhoto === url) usedIn.push('Profile Photo');
    if (profile.coverImage === url) usedIn.push('Profile Cover Image');
    if (profile.resumeUrl === url) usedIn.push('Active Resume Link');

    const exps = this.getExperiences(false);
    exps.forEach((e) => {
      if (e.logoUrl === url) usedIn.push(`Experience: ${e.employer} (Logo)`);
      e.mediaItems?.forEach((m) => {
        if (m.url === url) usedIn.push(`Experience: ${e.employer} (${m.title || 'Media'})`);
      });
    });

    const projs = this.getProjects(false);
    projs.forEach((p) => {
      if (p.coverImage === url) usedIn.push(`Project: ${p.name} (Cover)`);
      if (p.logoUrl === url) usedIn.push(`Project: ${p.name} (Logo)`);
      if (p.screenshots?.includes(url)) usedIn.push(`Project: ${p.name} (Screenshot)`);
      p.mediaItems?.forEach((m) => {
        if (m.url === url) usedIn.push(`Project: ${p.name} (${m.title || 'Media'})`);
      });
    });

    const certs = this.getCertifications(false);
    certs.forEach((c) => {
      if (c.certificateImage === url || c.certificatePdfUrl === url) {
        usedIn.push(`Certification: ${c.title}`);
      }
    });

    return {
      isUsed: usedIn.length > 0,
      usedIn,
    };
  },

  // ================= MEDIA UPLOAD HELPER =================
  async uploadMediaFile(
    file: File,
    category: MediaAsset['category'],
    caption?: string,
    altText?: string
  ): Promise<MediaAsset> {
    let fileUrl = '';
    try {
      const { storage } = await import('./firebase');
      if (storage) {
        const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
        const storageRef = ref(storage, `media/${category}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        fileUrl = await getDownloadURL(snapshot.ref);
      }
    } catch (err) {
      console.warn('[CMS Storage] Media file upload notice:', err);
    }

    if (!fileUrl) {
      fileUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }

    const asset = await this.addMediaAsset({
      name: file.name,
      url: fileUrl,
      type: file.type || 'application/octet-stream',
      sizeBytes: file.size,
      category,
      caption: caption || file.name,
      altText: altText || file.name,
    });

    return asset;
  },
};
