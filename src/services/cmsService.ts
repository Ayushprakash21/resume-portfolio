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
};
