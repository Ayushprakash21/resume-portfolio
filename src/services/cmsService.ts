import {
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
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
  OpenToWorkSettings,
  ResumeGeneratorSettings,
  ResumeVersionRecord,
  ResumeAuditEntry,
  IssuerRecord,
  ExtractionJob,
} from '../types/cms.ts';
import { VERIFIED_ISSUERS_DIRECTORY, isDeprecatedOrBrokenLogoUrl } from './issuerService';
import { LinkedInImportAudit, LinkedInParsedRecord } from '../types/linkedin';
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
  DEFAULT_RESUME_VERSIONS,
  DEFAULT_RESUME_GENERATOR_SETTINGS,
  DEFAULT_SECTIONS_CONFIG,
  DEFAULT_APPEARANCE_SETTINGS,
  DEFAULT_OPEN_TO_WORK_SETTINGS,
} from '../data/seedData';
import { storageClient } from './storage/storageClient';
import { sanitizeForFirestore } from '../utils/firestoreSerializer';

export { sanitizeForFirestore };

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
  openToWork: 'ayush_cms_opentowork_v1',
  resumeGenerator: 'ayush_cms_resume_generator_v1',
  resumeVersions: 'ayush_cms_resume_versions_v1',
  resumeAudit: 'ayush_cms_resume_audit_v1',
  linkedinAudit: 'ayush_cms_linkedin_audit_v1',
  issuers: 'ayush_cms_issuers_v1',
  extractionJob: 'ayush_cms_extraction_job_v1',
};

function safeStorageGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined' || !window.localStorage) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function safeStorageSet(key: string, value: any): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded or private mode
  }
}

function safeStorageRemove(key: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

// In-Memory Global Reactive Cache (Initialized from localStorage / defaults, then hydrated live by Firestore)
interface CmsStore {
  profile: ProfileData;
  profileDraft: ProfileData | null;
  homepage: HomepageSettings;
  homepageDraft: HomepageSettings | null;
  about: AboutSectionSettings;
  aboutDraft: AboutSectionSettings | null;
  openToWork: OpenToWorkSettings;
  openToWorkDraft: OpenToWorkSettings | null;
  resume: ResumeRecord;
  resumeDraft: ResumeRecord | null;
  resumeGenerator: ResumeGeneratorSettings;
  resumeVersions: ResumeVersionRecord[];
  resumeAudit: ResumeAuditEntry[];
  linkedinAudit: LinkedInImportAudit[];
  sections: SectionConfig[];
  appearance: AppearanceSettings;
  experiences: ExperienceRecord[];
  projects: ProjectRecord[];
  certifications: CertificationRecord[];
  issuers: IssuerRecord[];
  skills: SkillRecord[];
  education: EducationRecord[];
  media: MediaAsset[];
  siteSettings: SiteSettings;
  messages: ContactMessage[];
  extractionJob: ExtractionJob | null;
}

function initCertifications(): CertificationRecord[] {
  return safeStorageGet<CertificationRecord[]>(STORAGE_KEYS.certifications, DEFAULT_CERTIFICATIONS);
}

function initIssuers(): IssuerRecord[] {
  const rawStored = safeStorageGet<IssuerRecord[]>(STORAGE_KEYS.issuers, VERIFIED_ISSUERS_DIRECTORY as IssuerRecord[]);
  const stored = rawStored.filter((iss) => !isDeprecatedOrBrokenLogoUrl(iss.logoUrl));
  const existingIds = new Set(stored.map((iss) => iss.id));
  const missing = (VERIFIED_ISSUERS_DIRECTORY as IssuerRecord[]).filter((iss) => !existingIds.has(iss.id));
  if (missing.length > 0 || stored.length !== rawStored.length) {
    const merged = [...stored, ...missing];
    safeStorageSet(STORAGE_KEYS.issuers, merged);
    return merged;
  }
  return stored;
}

function initSkills(): SkillRecord[] {
  return safeStorageGet<SkillRecord[]>(STORAGE_KEYS.skills, DEFAULT_SKILLS);
}

const store: CmsStore = {
  profile: safeStorageGet(STORAGE_KEYS.profile, DEFAULT_PROFILE),
  profileDraft: null,
  homepage: safeStorageGet(STORAGE_KEYS.homepage, DEFAULT_HOMEPAGE_SETTINGS),
  homepageDraft: null,
  about: safeStorageGet(STORAGE_KEYS.about, DEFAULT_ABOUT_SETTINGS),
  aboutDraft: null,
  openToWork: safeStorageGet(STORAGE_KEYS.openToWork, DEFAULT_OPEN_TO_WORK_SETTINGS),
  openToWorkDraft: null,
  resume: safeStorageGet(STORAGE_KEYS.resume, DEFAULT_RESUME_RECORD),
  resumeDraft: null,
  resumeGenerator: safeStorageGet(STORAGE_KEYS.resumeGenerator, DEFAULT_RESUME_GENERATOR_SETTINGS),
  resumeVersions: safeStorageGet(STORAGE_KEYS.resumeVersions, DEFAULT_RESUME_VERSIONS),
  resumeAudit: safeStorageGet(STORAGE_KEYS.resumeAudit, []),
  linkedinAudit: safeStorageGet(STORAGE_KEYS.linkedinAudit, []),
  sections: safeStorageGet(STORAGE_KEYS.sections, DEFAULT_SECTIONS_CONFIG),
  appearance: safeStorageGet(STORAGE_KEYS.appearance, DEFAULT_APPEARANCE_SETTINGS),
  experiences: safeStorageGet(STORAGE_KEYS.experiences, DEFAULT_EXPERIENCES),
  projects: safeStorageGet(STORAGE_KEYS.projects, DEFAULT_PROJECTS),
  certifications: initCertifications(),
  issuers: initIssuers(),
  skills: initSkills(),
  education: safeStorageGet(STORAGE_KEYS.education, DEFAULT_EDUCATION),
  media: safeStorageGet(STORAGE_KEYS.media, DEFAULT_MEDIA_ASSETS),
  siteSettings: safeStorageGet(STORAGE_KEYS.settings, DEFAULT_SITE_SETTINGS),
  messages: safeStorageGet(STORAGE_KEYS.messages, DEFAULT_CONTACT_MESSAGES),
  extractionJob: safeStorageGet<ExtractionJob | null>(STORAGE_KEYS.extractionJob, null),
};

// Global reactive subscribers
type Listener = () => void;
const listeners = new Set<Listener>();

function notifyListeners() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.warn('[CMS Listener Error]:', e);
    }
  });
}

// Active Firestore unsubscribers
const activeUnsubscribers: Unsubscribe[] = [];
let isInitialized = false;

function initFirestoreSync() {
  if (isInitialized || !db) return;
  isInitialized = true;

  try {
    // 1. Profile Listener
    const unsubProfile = onSnapshot(
      doc(db, 'profile', 'main'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as ProfileData & { draft?: ProfileData };
          const { draft, ...published } = data;
          store.profile = {
            ...DEFAULT_PROFILE,
            ...published,
            status: 'published',
          };
          store.profileDraft = draft || null;
          safeStorageSet(STORAGE_KEYS.profile, store.profile);
          notifyListeners();
        }
      },
      (err) => console.warn('[CMS Firestore] Profile sync notice:', err)
    );
    activeUnsubscribers.push(unsubProfile);

    // 2. Settings: Homepage
    const unsubHomepage = onSnapshot(
      doc(db, 'settings', 'homepage'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as HomepageSettings & { draft?: HomepageSettings };
          const { draft, ...published } = data;
          store.homepage = { ...DEFAULT_HOMEPAGE_SETTINGS, ...published };
          store.homepageDraft = draft || null;
          safeStorageSet(STORAGE_KEYS.homepage, store.homepage);
          notifyListeners();
        }
      },
      (err) => console.warn('[CMS Firestore] Homepage sync notice:', err)
    );
    activeUnsubscribers.push(unsubHomepage);

    // 3. Settings: About
    const unsubAbout = onSnapshot(
      doc(db, 'settings', 'about'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as AboutSectionSettings & { draft?: AboutSectionSettings };
          const { draft, ...published } = data;
          store.about = { ...DEFAULT_ABOUT_SETTINGS, ...published };
          store.aboutDraft = draft || null;
          safeStorageSet(STORAGE_KEYS.about, store.about);
          notifyListeners();
        }
      },
      (err) => console.warn('[CMS Firestore] About sync notice:', err)
    );
    activeUnsubscribers.push(unsubAbout);

    // 4. Settings: Open To Work
    const unsubOpenToWork = onSnapshot(
      doc(db, 'settings', 'openToWork'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as OpenToWorkSettings & { draft?: OpenToWorkSettings };
          const { draft, ...published } = data;
          store.openToWork = { ...DEFAULT_OPEN_TO_WORK_SETTINGS, ...published };
          store.openToWorkDraft = draft || null;
          safeStorageSet(STORAGE_KEYS.openToWork, store.openToWork);
          notifyListeners();
        }
      },
      (err) => console.warn('[CMS Firestore] OpenToWork sync notice:', err)
    );
    activeUnsubscribers.push(unsubOpenToWork);

    // 5. Settings: Sections
    const unsubSections = onSnapshot(
      doc(db, 'settings', 'sections'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as { list?: SectionConfig[] };
          if (Array.isArray(data.list) && data.list.length > 0) {
            store.sections = data.list;
            safeStorageSet(STORAGE_KEYS.sections, store.sections);
            notifyListeners();
          }
        }
      },
      (err) => console.warn('[CMS Firestore] Sections sync notice:', err)
    );
    activeUnsubscribers.push(unsubSections);

    // 6. Settings: Appearance
    const unsubAppearance = onSnapshot(
      doc(db, 'settings', 'appearance'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as AppearanceSettings;
          store.appearance = { ...DEFAULT_APPEARANCE_SETTINGS, ...data };
          safeStorageSet(STORAGE_KEYS.appearance, store.appearance);
          notifyListeners();
        }
      },
      (err) => console.warn('[CMS Firestore] Appearance sync notice:', err)
    );
    activeUnsubscribers.push(unsubAppearance);

    // 7. Resume
    const unsubResume = onSnapshot(
      doc(db, 'resume', 'primary'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as ResumeRecord & { draft?: ResumeRecord };
          const { draft, ...published } = data;
          store.resume = { ...DEFAULT_RESUME_RECORD, ...published };
          store.resumeDraft = draft || null;
          safeStorageSet(STORAGE_KEYS.resume, store.resume);
          notifyListeners();
        }
      },
      (err) => console.warn('[CMS Firestore] Resume sync notice:', err)
    );
    activeUnsubscribers.push(unsubResume);

    // 7b. Resume Generator Settings
    const unsubResumeGenerator = onSnapshot(
      doc(db, 'settings', 'resumeGenerator'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as ResumeGeneratorSettings;
          store.resumeGenerator = { ...DEFAULT_RESUME_GENERATOR_SETTINGS, ...data };
          safeStorageSet(STORAGE_KEYS.resumeGenerator, store.resumeGenerator);
          notifyListeners();
        }
      },
      (err) => console.warn('[CMS Firestore] ResumeGenerator sync notice:', err)
    );
    activeUnsubscribers.push(unsubResumeGenerator);

    // 7c. Resume Versions
    const unsubResumeVersions = onSnapshot(
      doc(db, 'settings', 'resumeVersions'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as { list?: ResumeVersionRecord[] };
          if (Array.isArray(data.list) && data.list.length > 0) {
            store.resumeVersions = data.list;
            safeStorageSet(STORAGE_KEYS.resumeVersions, store.resumeVersions);
            notifyListeners();
          }
        }
      },
      (err) => console.warn('[CMS Firestore] ResumeVersions sync notice:', err)
    );
    activeUnsubscribers.push(unsubResumeVersions);

    // 7d. Resume Audit Log
    const unsubResumeAudit = onSnapshot(
      doc(db, 'settings', 'resumeAudit'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as { list?: ResumeAuditEntry[] };
          if (Array.isArray(data.list)) {
            store.resumeAudit = data.list;
            safeStorageSet(STORAGE_KEYS.resumeAudit, store.resumeAudit);
            notifyListeners();
          }
        }
      },
      (err) => console.warn('[CMS Firestore] ResumeAudit sync notice:', err)
    );
    activeUnsubscribers.push(unsubResumeAudit);

    // 8. Experiences Collection
    const unsubExperiences = onSnapshot(
      collection(db, 'experiences'),
      (snap) => {
        if (!snap.empty) {
          const list: ExperienceRecord[] = [];
          snap.forEach((d) => {
            list.push({ ...d.data(), id: d.id } as ExperienceRecord);
          });
          list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          store.experiences = list;
          safeStorageSet(STORAGE_KEYS.experiences, list);
          notifyListeners();
        }
      },
      (err) => console.warn('[CMS Firestore] Experiences sync notice:', err)
    );
    activeUnsubscribers.push(unsubExperiences);

    // 9. Projects Collection
    const unsubProjects = onSnapshot(
      collection(db, 'projects'),
      (snap) => {
        if (!snap.empty) {
          const list: ProjectRecord[] = [];
          snap.forEach((d) => {
            list.push({ ...d.data(), id: d.id } as ProjectRecord);
          });
          list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          store.projects = list;
          safeStorageSet(STORAGE_KEYS.projects, list);
          notifyListeners();
        }
      },
      (err) => console.warn('[CMS Firestore] Projects sync notice:', err)
    );
    activeUnsubscribers.push(unsubProjects);

    // 10. Certifications Collection
    const unsubCertifications = onSnapshot(
      collection(db, 'certifications'),
      (snap) => {
        if (!snap.empty) {
          const list: CertificationRecord[] = [];
          snap.forEach((d) => {
            const data = d.data();
            list.push({
              ...data,
              id: d.id,
            } as CertificationRecord);
          });
          list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          store.certifications = list;
          safeStorageSet(STORAGE_KEYS.certifications, list);
          notifyListeners();
        }
      },
      (err) => console.warn('[CMS Firestore] Certifications sync notice:', err)
    );
    activeUnsubscribers.push(unsubCertifications);

    // 10b. Issuers Brand Directory Collection
    const unsubIssuers = onSnapshot(
      collection(db, 'issuers'),
      (snap) => {
        if (!snap.empty) {
          const validFromDb: IssuerRecord[] = [];
          snap.forEach((d) => {
            const data = d.data() as IssuerRecord;
            if (!isDeprecatedOrBrokenLogoUrl(data.logoUrl)) {
              validFromDb.push({ ...data, id: d.id });
            }
          });
          const seen = new Set(validFromDb.map((i) => i.id));
          const merged = [
            ...validFromDb,
            ...(VERIFIED_ISSUERS_DIRECTORY as IssuerRecord[]).filter((v) => !seen.has(v.id)),
          ];
          store.issuers = merged;
          safeStorageSet(STORAGE_KEYS.issuers, merged);
          notifyListeners();
        }
      },
      () => {
        // Silent fallback to curated directory if unauthenticated read is restricted
      }
    );
    activeUnsubscribers.push(unsubIssuers);

    // 11. Skills Collection
    const unsubSkills = onSnapshot(
      collection(db, 'skills'),
      (snap) => {
        if (!snap.empty) {
          const list: SkillRecord[] = [];
          snap.forEach((d) => {
            list.push({ ...d.data(), id: d.id } as SkillRecord);
          });
          list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          store.skills = list;
          safeStorageSet(STORAGE_KEYS.skills, list);
          notifyListeners();
        }
      },
      (err) => console.warn('[CMS Firestore] Skills sync notice:', err)
    );
    activeUnsubscribers.push(unsubSkills);

    // 12. Education Collection
    const unsubEducation = onSnapshot(
      collection(db, 'education'),
      (snap) => {
        if (!snap.empty) {
          const list: EducationRecord[] = [];
          snap.forEach((d) => {
            list.push(normalizeEducationRecord(d.data(), d.id));
          });
          list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          store.education = list;
          safeStorageSet(STORAGE_KEYS.education, list);
          notifyListeners();
        }
      },
      (err) => console.warn('[CMS Firestore] Education sync notice:', err)
    );
    activeUnsubscribers.push(unsubEducation);

    // 13. Media Assets Collection
    const unsubMedia = onSnapshot(
      collection(db, 'mediaAssets'),
      (snap) => {
        if (!snap.empty) {
          const list: MediaAsset[] = [];
          snap.forEach((d) => {
            list.push({ ...d.data(), id: d.id } as MediaAsset);
          });
          store.media = list;
          safeStorageSet(STORAGE_KEYS.media, list);
          notifyListeners();
        }
      },
      (err) => console.warn('[CMS Firestore] MediaAssets sync notice:', err)
    );
    activeUnsubscribers.push(unsubMedia);

    // 14. Contact Messages (Authenticated Admin only)
    try {
      const unsubMessages = onSnapshot(
        collection(db, 'contactMessages'),
        (snap) => {
          if (!snap.empty) {
            const list: ContactMessage[] = [];
            snap.forEach((d) => {
              list.push({ ...d.data(), id: d.id } as ContactMessage);
            });
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            store.messages = list;
            safeStorageSet(STORAGE_KEYS.messages, list);
            notifyListeners();
          }
        },
        () => {
          // Unauthenticated visitors will fail silently on contactMessages read
        }
      );
      activeUnsubscribers.push(unsubMessages);
    } catch {
      // ignore
    }

    // 15. Active Extraction Job
    try {
      const unsubExtractionJob = onSnapshot(
        doc(db, 'settings', 'extractionJob'),
        (snap) => {
          if (snap.exists()) {
            const data = snap.data() as ExtractionJob;
            store.extractionJob = data;
            safeStorageSet(STORAGE_KEYS.extractionJob, data);
            notifyListeners();
          } else {
            if (store.extractionJob) {
              store.extractionJob = null;
              safeStorageRemove(STORAGE_KEYS.extractionJob);
              notifyListeners();
            }
          }
        },
        () => {
          // ignore
        }
      );
      activeUnsubscribers.push(unsubExtractionJob);
    } catch {
      // ignore
    }
  } catch (err) {
    console.warn('[CMS Firestore] Initialization notice:', err);
  }
}

function withFirestoreTimeout<T>(promise: Promise<T>, label: string, timeoutMs = 10000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${Math.round(timeoutMs / 1000)}s. Check network/authentication and retry.`));
    }, timeoutMs);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

function normalizeTimestampValue(val: unknown): string | undefined {
  if (!val) return undefined;
  if (typeof val === 'string') return val;
  if (val instanceof Date) return val.toISOString();
  if (typeof (val as any).toDate === 'function') {
    try {
      return (val as any).toDate().toISOString();
    } catch {
      return undefined;
    }
  }
  if (typeof (val as any).seconds === 'number') {
    return new Date((val as any).seconds * 1000).toISOString();
  }
  return undefined;
}

export function normalizeEducationRecord(raw: any, docId?: string): EducationRecord {
  const stringArray = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((item): item is string => typeof item === 'string') : [];

  return {
    ...raw,
    id: docId || raw?.id || `edu-${Date.now()}`,
    institution: typeof raw?.institution === 'string' ? raw.institution : '',
    associatedCollege: typeof raw?.associatedCollege === 'string' ? raw.associatedCollege : undefined,
    degree: typeof raw?.degree === 'string' ? raw.degree : '',
    fieldOfStudy: typeof raw?.fieldOfStudy === 'string' ? raw.fieldOfStudy : '',
    startYear: typeof raw?.startYear === 'string' ? raw.startYear : '',
    endYear: typeof raw?.endYear === 'string' ? raw.endYear : '',
    grade: typeof raw?.grade === 'string' ? raw.grade : undefined,
    description: typeof raw?.description === 'string' ? raw.description : undefined,
    courseOverview: typeof raw?.courseOverview === 'string' ? raw.courseOverview : undefined,
    specialization: typeof raw?.specialization === 'string' ? raw.specialization : undefined,
    subjects: Array.isArray(raw?.subjects) ? stringArray(raw.subjects) : undefined,
    relevantCoursework: Array.isArray(raw?.relevantCoursework) ? stringArray(raw.relevantCoursework) : undefined,
    academicFocus: typeof raw?.academicFocus === 'string' ? raw.academicFocus : undefined,
    learningOutcomes: Array.isArray(raw?.learningOutcomes) ? stringArray(raw.learningOutcomes) : undefined,
    projectsResearch: typeof raw?.projectsResearch === 'string' ? raw.projectsResearch : undefined,
    academicAchievements: Array.isArray(raw?.academicAchievements) ? stringArray(raw.academicAchievements) : undefined,
    additionalNotes: typeof raw?.additionalNotes === 'string' ? raw.additionalNotes : undefined,
    status: raw?.status === 'draft' ? 'draft' : 'published',
    skillsUsed: Array.isArray(raw?.skillsUsed) ? stringArray(raw.skillsUsed) : undefined,
    highlights: stringArray(raw?.highlights),
    displayOrder: typeof raw?.displayOrder === 'number' ? raw.displayOrder : 1,
    createdAt: normalizeTimestampValue(raw?.createdAt),
    updatedAt: normalizeTimestampValue(raw?.updatedAt),
  };
}

// Automatically start Firestore sync on client load
if (typeof window !== 'undefined') {
  initFirestoreSync();
}

export const cmsService = {
  /**
   * Register a subscriber to be notified whenever any CMS data changes
   */
  subscribe(fn: Listener) {
    listeners.add(fn);
    if (!isInitialized) {
      initFirestoreSync();
    }
    return () => {
      listeners.delete(fn);
    };
  },

  /**
   * Manually trigger Firestore sync initialization
   */
  init() {
    initFirestoreSync();
  },

  // ================= PROFILE =================
  getProfile(preferDraft = false): ProfileData {
    if (preferDraft && store.profileDraft) {
      return store.profileDraft;
    }
    return store.profile;
  },

  getProfileDraft(): ProfileData | null {
    return store.profileDraft;
  },

  /**
   * Publish Profile globally to Firestore
   * Root fields are updated; draft is cleared; public website updates immediately.
   */
  async publishProfile(profile: ProfileData): Promise<void> {
    const payload: ProfileData = {
      ...profile,
      status: 'published',
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      draft: null as any,
    };

    if (db) {
      await setDoc(doc(db, 'profile', 'main'), sanitizeForFirestore(payload));
    }

    store.profile = payload;
    store.profileDraft = null;
    safeStorageSet(STORAGE_KEYS.profile, payload);
    notifyListeners();
  },

  /**
   * Save Profile Draft
   * Stored in draft sub-field; published content is preserved; public site is untouched.
   */
  async saveProfileDraft(draft: ProfileData): Promise<void> {
    const draftPayload = {
      ...draft,
      status: 'draft' as const,
      updatedAt: new Date().toISOString(),
    };

    if (db) {
      await setDoc(
        doc(db, 'profile', 'main'),
        sanitizeForFirestore({
          draft: draftPayload,
          updatedAt: new Date().toISOString(),
        }),
        { merge: true }
      );
    }

    store.profileDraft = draftPayload;
    notifyListeners();
  },

  /**
   * Discard draft and revert to published version
   */
  async discardProfileDraft(): Promise<void> {
    if (db) {
      await setDoc(
        doc(db, 'profile', 'main'),
        sanitizeForFirestore({ draft: null, updatedAt: new Date().toISOString() }),
        { merge: true }
      );
    }
    store.profileDraft = null;
    notifyListeners();
  },

  /**
   * Update Profile (Backward compatible)
   * If status is draft, saves as draft; if published, publishes globally.
   */
  async updateProfile(profile: ProfileData): Promise<void> {
    if (profile.status === 'draft') {
      await this.saveProfileDraft(profile);
    } else {
      await this.publishProfile(profile);
    }
  },

  // ================= ABOUT SETTINGS =================
  getAboutSettings(preferDraft = false): AboutSectionSettings {
    if (preferDraft && store.aboutDraft) {
      return store.aboutDraft;
    }
    return store.about;
  },

  getAboutDraft(): AboutSectionSettings | null {
    return store.aboutDraft;
  },

  async publishAboutSettings(about: AboutSectionSettings): Promise<void> {
    const payload: AboutSectionSettings = {
      ...about,
      status: 'published',
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (db) {
      await setDoc(doc(db, 'settings', 'about'), { ...payload, draft: null });
    }

    store.about = payload;
    store.aboutDraft = null;
    safeStorageSet(STORAGE_KEYS.about, payload);
    notifyListeners();
  },

  async saveAboutDraft(draft: AboutSectionSettings): Promise<void> {
    const draftPayload = {
      ...draft,
      status: 'draft' as const,
      updatedAt: new Date().toISOString(),
    };

    if (db) {
      await setDoc(
        doc(db, 'settings', 'about'),
        sanitizeForFirestore({ draft: draftPayload, updatedAt: new Date().toISOString() }),
        { merge: true }
      );
    }

    store.aboutDraft = draftPayload;
    notifyListeners();
  },

  async discardAboutDraft(): Promise<void> {
    if (db) {
      await setDoc(
        doc(db, 'settings', 'about'),
        sanitizeForFirestore({ draft: null, updatedAt: new Date().toISOString() }),
        { merge: true }
      );
    }
    store.aboutDraft = null;
    notifyListeners();
  },

  async updateAboutSettings(about: AboutSectionSettings): Promise<void> {
    if (about.status === 'draft') {
      await this.saveAboutDraft(about);
    } else {
      await this.publishAboutSettings(about);
    }
  },

  // ================= EXPERIENCES =================
  getExperiences(onlyPublished = false): ExperienceRecord[] {
    let list = [...store.experiences];
    if (onlyPublished) {
      list = list.filter((e) => e.status === 'published');
    }
    return list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  },

  async addExperience(exp: Omit<ExperienceRecord, 'id'>): Promise<ExperienceRecord> {
    const newRecord: ExperienceRecord = {
      ...exp,
      id: 'exp-' + Date.now(),
      updatedAt: new Date().toISOString(),
    };

    if (db) {
      await setDoc(doc(db, 'experiences', newRecord.id), sanitizeForFirestore(newRecord));
    }

    store.experiences.unshift(newRecord);
    store.experiences.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    safeStorageSet(STORAGE_KEYS.experiences, store.experiences);
    notifyListeners();
    return newRecord;
  },

  async updateExperience(id: string, updates: Partial<ExperienceRecord>): Promise<void> {
    const payload = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (db) {
      await updateDoc(doc(db, 'experiences', id), sanitizeForFirestore(payload) as any);
    }

    const idx = store.experiences.findIndex((e) => e.id === id);
    if (idx !== -1) {
      store.experiences[idx] = { ...store.experiences[idx], ...payload };
      store.experiences.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      safeStorageSet(STORAGE_KEYS.experiences, store.experiences);
      notifyListeners();
    }
  },

  async deleteExperience(id: string): Promise<void> {
    if (db) {
      await deleteDoc(doc(db, 'experiences', id));
    }

    store.experiences = store.experiences.filter((e) => e.id !== id);
    safeStorageSet(STORAGE_KEYS.experiences, store.experiences);
    notifyListeners();
  },

  async duplicateExperience(id: string): Promise<ExperienceRecord | null> {
    const exp = store.experiences.find((e) => e.id === id);
    if (!exp) return null;
    const duplicated: Omit<ExperienceRecord, 'id'> = {
      ...exp,
      jobTitle: `${exp.jobTitle} (Copy)`,
      status: 'draft',
      displayOrder: (exp.displayOrder || 0) + 1,
    };
    return await this.addExperience(duplicated);
  },

  async reorderExperiences(ids: string[]): Promise<void> {
    const reordered = ids
      .map((id, index) => {
        const item = store.experiences.find((e) => e.id === id);
        return item ? { ...item, displayOrder: index + 1 } : null;
      })
      .filter(Boolean) as ExperienceRecord[];

    if (db) {
      for (const item of reordered) {
        await updateDoc(doc(db, 'experiences', item.id), {
          displayOrder: item.displayOrder,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    store.experiences = reordered;
    safeStorageSet(STORAGE_KEYS.experiences, reordered);
    notifyListeners();
  },

  // ================= PROJECTS =================
  getProjects(onlyPublished = false): ProjectRecord[] {
    let list = [...store.projects];
    if (onlyPublished) {
      list = list.filter((p) => p.status === 'published');
    }
    return list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  },

  async addProject(proj: Omit<ProjectRecord, 'id'>): Promise<ProjectRecord> {
    const newRecord: ProjectRecord = {
      ...proj,
      id: 'proj-' + Date.now(),
      updatedAt: new Date().toISOString(),
    };

    if (db) {
      await setDoc(doc(db, 'projects', newRecord.id), sanitizeForFirestore(newRecord));
    }

    store.projects.push(newRecord);
    store.projects.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    safeStorageSet(STORAGE_KEYS.projects, store.projects);
    notifyListeners();
    return newRecord;
  },

  async updateProject(id: string, updates: Partial<ProjectRecord>): Promise<void> {
    const payload = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (db) {
      await updateDoc(doc(db, 'projects', id), sanitizeForFirestore(payload) as any);
    }

    const idx = store.projects.findIndex((p) => p.id === id);
    if (idx !== -1) {
      store.projects[idx] = { ...store.projects[idx], ...payload };
      store.projects.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      safeStorageSet(STORAGE_KEYS.projects, store.projects);
      notifyListeners();
    }
  },

  async deleteProject(id: string): Promise<void> {
    if (db) {
      await deleteDoc(doc(db, 'projects', id));
    }

    store.projects = store.projects.filter((p) => p.id !== id);
    safeStorageSet(STORAGE_KEYS.projects, store.projects);
    notifyListeners();
  },

  async duplicateProject(id: string): Promise<ProjectRecord | null> {
    const proj = store.projects.find((p) => p.id === id);
    if (!proj) return null;
    const duplicated: Omit<ProjectRecord, 'id'> = {
      ...proj,
      name: `${proj.name} (Copy)`,
      status: 'draft',
      displayOrder: (proj.displayOrder || 0) + 1,
    };
    return await this.addProject(duplicated);
  },

  async reorderProjects(ids: string[]): Promise<void> {
    const reordered = ids
      .map((id, index) => {
        const item = store.projects.find((p) => p.id === id);
        return item ? { ...item, displayOrder: index + 1 } : null;
      })
      .filter(Boolean) as ProjectRecord[];

    if (db) {
      for (const item of reordered) {
        await updateDoc(doc(db, 'projects', item.id), {
          displayOrder: item.displayOrder,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    store.projects = reordered;
    safeStorageSet(STORAGE_KEYS.projects, reordered);
    notifyListeners();
  },

  // ================= CERTIFICATIONS =================
  getCertifications(onlyPublished = false): CertificationRecord[] {
    let list = [...store.certifications];
    if (onlyPublished) {
      list = list.filter((c) => c.status === 'published');
    }
    return list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  },

  async addCertification(cert: Omit<CertificationRecord, 'id'>): Promise<CertificationRecord> {
    const newRecord: CertificationRecord = {
      ...cert,
      id: 'cert-' + Date.now(),
      updatedAt: new Date().toISOString(),
    };

    if (db) {
      await setDoc(doc(db, 'certifications', newRecord.id), sanitizeForFirestore(newRecord));
    }

    if (newRecord.issuer && newRecord.issuerLogo && !isDeprecatedOrBrokenLogoUrl(newRecord.issuerLogo)) {
      this.saveIssuer({
        issuerName: newRecord.issuer,
        issuerDomain: newRecord.issuerDomain || '',
        issuerWebsite: newRecord.issuerWebsite || '',
        logoUrl: newRecord.issuerLogo,
        logoObjectKey: newRecord.issuerLogoKey || '',
        logoFormat: newRecord.issuerLogoFormat || 'svg',
        logoSource: newRecord.issuerLogoSource || 'directory',
        altText: newRecord.issuerLogoAlt || `${newRecord.issuer} Official Brand Logo`,
        verifiedByAdmin: newRecord.issuerLogoSource === 'directory' || newRecord.issuerLogoSource === 'upload',
        logoMetadata: newRecord.issuerLogoMetadata,
      }).catch((e) => console.warn('[saveIssuer notice]:', e));
    }

    store.certifications.unshift(newRecord);
    safeStorageSet(STORAGE_KEYS.certifications, store.certifications);
    notifyListeners();
    return newRecord;
  },

  async updateCertification(id: string, updates: Partial<CertificationRecord>): Promise<void> {
    const existing = store.certifications.find((c) => c.id === id);
    const sanitizedUpdates: Partial<CertificationRecord> = { ...updates };

    // Protect an existing valid uploaded/directory logo against accidental undefined clobbering
    if (sanitizedUpdates.issuerLogo === undefined && existing?.issuerLogo) {
      delete sanitizedUpdates.issuerLogo;
    }

    const payload = {
      ...sanitizedUpdates,
      updatedAt: new Date().toISOString(),
    };

    if (db) {
      await updateDoc(doc(db, 'certifications', id), sanitizeForFirestore(payload) as any);
    }

    const idx = store.certifications.findIndex((c) => c.id === id);
    if (idx !== -1) {
      const merged = { ...store.certifications[idx], ...payload };
      store.certifications[idx] = merged;

      if (merged.issuer && merged.issuerLogo && !isDeprecatedOrBrokenLogoUrl(merged.issuerLogo)) {
        this.saveIssuer({
          issuerName: merged.issuer,
          issuerDomain: merged.issuerDomain || '',
          issuerWebsite: merged.issuerWebsite || '',
          logoUrl: merged.issuerLogo,
          logoObjectKey: merged.issuerLogoKey || '',
          logoFormat: merged.issuerLogoFormat || 'svg',
          logoSource: merged.issuerLogoSource || 'directory',
          altText: merged.issuerLogoAlt || `${merged.issuer} Official Brand Logo`,
          verifiedByAdmin: merged.issuerLogoSource === 'directory' || merged.issuerLogoSource === 'upload',
          logoMetadata: merged.issuerLogoMetadata,
        }).catch((e) => console.warn('[saveIssuer notice]:', e));
      }

      safeStorageSet(STORAGE_KEYS.certifications, store.certifications);
      notifyListeners();
    }
  },

  async deleteCertification(id: string): Promise<void> {
    if (db) {
      await deleteDoc(doc(db, 'certifications', id));
    }

    store.certifications = store.certifications.filter((c) => c.id !== id);
    safeStorageSet(STORAGE_KEYS.certifications, store.certifications);
    notifyListeners();
  },

  async duplicateCertification(id: string): Promise<CertificationRecord | null> {
    const cert = store.certifications.find((c) => c.id === id);
    if (!cert) return null;
    const duplicated: Omit<CertificationRecord, 'id'> = {
      ...cert,
      title: `${cert.title} (Copy)`,
      status: 'draft',
      displayOrder: (cert.displayOrder || 1) + 1,
    };
    return await this.addCertification(duplicated);
  },

  // ================= ISSUERS & BRAND LOGOS =================
  getIssuers(): IssuerRecord[] {
    return [...store.issuers].sort((a, b) => a.issuerName.localeCompare(b.issuerName));
  },

  findIssuer(nameOrDomain: string): IssuerRecord | undefined {
    const q = nameOrDomain.trim().toLowerCase();
    if (!q) return undefined;
    return store.issuers.find(
      (iss) =>
        iss.issuerName.toLowerCase() === q ||
        (iss.issuerDomain && iss.issuerDomain.toLowerCase() === q)
    );
  },

  async saveIssuer(data: Omit<IssuerRecord, 'id'> & { id?: string }): Promise<IssuerRecord> {
    const id = data.id || `iss-${data.issuerDomain ? data.issuerDomain.replace(/[^a-z0-9]/gi, '-') : Date.now()}`;
    const record: IssuerRecord = {
      ...data,
      id,
      verifiedByAdmin: data.verifiedByAdmin ?? true,
      updatedAt: new Date().toISOString(),
      createdAt: data.createdAt || new Date().toISOString(),
    };

    if (db) {
      await setDoc(doc(db, 'issuers', record.id), sanitizeForFirestore(record));
    }

    const existingIdx = store.issuers.findIndex((iss) => iss.id === record.id || iss.issuerName.toLowerCase() === record.issuerName.toLowerCase());
    if (existingIdx !== -1) {
      store.issuers[existingIdx] = { ...store.issuers[existingIdx], ...record };
    } else {
      store.issuers.push(record);
    }

    safeStorageSet(STORAGE_KEYS.issuers, store.issuers);
    notifyListeners();
    return record;
  },

  // ================= SKILLS =================
  getSkills(): SkillRecord[] {
    return [...store.skills].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  },

  async addSkill(skill: Omit<SkillRecord, 'id'>): Promise<SkillRecord> {
    const newRecord: SkillRecord = {
      ...skill,
      id: 'sk-' + Date.now(),
      updatedAt: new Date().toISOString(),
    };

    if (db) {
      await setDoc(doc(db, 'skills', newRecord.id), sanitizeForFirestore(newRecord));
    }

    store.skills.push(newRecord);
    safeStorageSet(STORAGE_KEYS.skills, store.skills);
    notifyListeners();
    return newRecord;
  },

  async updateSkill(id: string, updates: Partial<SkillRecord>): Promise<void> {
    const payload = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (db) {
      await updateDoc(doc(db, 'skills', id), sanitizeForFirestore(payload) as any);
    }

    const idx = store.skills.findIndex((s) => s.id === id);
    if (idx !== -1) {
      store.skills[idx] = { ...store.skills[idx], ...payload };
      safeStorageSet(STORAGE_KEYS.skills, store.skills);
      notifyListeners();
    }
  },

  async deleteSkill(id: string): Promise<void> {
    if (db) {
      await deleteDoc(doc(db, 'skills', id));
    }

    store.skills = store.skills.filter((s) => s.id !== id);
    safeStorageSet(STORAGE_KEYS.skills, store.skills);
    notifyListeners();
  },

  async ensureSkill(name: string, category: string = 'General Capabilities'): Promise<SkillRecord> {
    const trimmed = name.trim();
    const existing = store.skills.find((s) => s.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) return existing;

    const newSkill: Omit<SkillRecord, 'id'> = {
      name: trimmed,
      category,
      displayOrder: store.skills.length + 1,
    };
    return await this.addSkill(newSkill);
  },

  // ================= EDUCATION =================
  getEducation(publishedOnly = false): EducationRecord[] {
    const list = [...store.education].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    if (publishedOnly) {
      return list.filter((e) => e.status !== 'draft');
    }
    return list;
  },

  async addEducation(edu: Omit<EducationRecord, 'id'>): Promise<EducationRecord> {
    const nowIso = new Date().toISOString();
    const newRecord: EducationRecord = normalizeEducationRecord(
      {
        ...edu,
        status: edu.status || 'published',
        displayOrder: edu.displayOrder ?? store.education.length + 1,
        createdAt: nowIso,
        updatedAt: nowIso,
      },
      `edu-${Date.now()}`
    );

    if (db) {
      await withFirestoreTimeout(
        setDoc(
          doc(db, 'education', newRecord.id),
          sanitizeForFirestore({
            ...newRecord,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        ),
        'Saving education record'
      );
    }

    store.education.push(newRecord);
    safeStorageSet(STORAGE_KEYS.education, store.education);
    notifyListeners();
    return newRecord;
  },

  async updateEducation(id: string, updates: Partial<EducationRecord>): Promise<EducationRecord> {
    const nowIso = new Date().toISOString();
    const existing = store.education.find((e) => e.id === id);
    const merged: EducationRecord = normalizeEducationRecord(
      {
        ...(existing || {}),
        ...updates,
        id,
        createdAt: existing?.createdAt || nowIso,
        updatedAt: nowIso,
      },
      id
    );

    if (db) {
      await withFirestoreTimeout(
        setDoc(
          doc(db, 'education', id),
          sanitizeForFirestore({
            ...merged,
            updatedAt: serverTimestamp(),
          }),
          { merge: true }
        ),
        'Updating education record'
      );
    }

    const idx = store.education.findIndex((e) => e.id === id);
    if (idx !== -1) {
      store.education[idx] = merged;
    } else {
      store.education.push(merged);
    }
    safeStorageSet(STORAGE_KEYS.education, store.education);
    notifyListeners();
    return merged;
  },

  async deleteEducation(id: string): Promise<void> {
    if (db) {
      await withFirestoreTimeout(deleteDoc(doc(db, 'education', id)), 'Deleting education record');
    }

    store.education = store.education.filter((e) => e.id !== id);
    safeStorageSet(STORAGE_KEYS.education, store.education);
    notifyListeners();
  },

  // ================= HOMEPAGE SETTINGS =================
  getHomepageSettings(preferDraft = false): HomepageSettings {
    if (preferDraft && store.homepageDraft) {
      return store.homepageDraft;
    }
    return store.homepage;
  },

  async publishHomepageSettings(settings: HomepageSettings): Promise<void> {
    if (db) {
      await setDoc(doc(db, 'settings', 'homepage'), sanitizeForFirestore({
        ...settings,
        draft: null,
        updatedAt: new Date().toISOString(),
      }));
    }

    store.homepage = settings;
    store.homepageDraft = null;
    safeStorageSet(STORAGE_KEYS.homepage, settings);
    notifyListeners();
  },

  async saveHomepageDraft(draft: HomepageSettings): Promise<void> {
    if (db) {
      await setDoc(
        doc(db, 'settings', 'homepage'),
        sanitizeForFirestore({ draft, updatedAt: new Date().toISOString() }),
        { merge: true }
      );
    }

    store.homepageDraft = draft;
    notifyListeners();
  },

  async updateHomepageSettings(settings: HomepageSettings): Promise<void> {
    await this.publishHomepageSettings(settings);
  },

  // ================= OPEN TO WORK SETTINGS =================
  getOpenToWorkSettings(preferDraft = false): OpenToWorkSettings {
    if (preferDraft && store.openToWorkDraft) {
      return store.openToWorkDraft;
    }
    return store.openToWork;
  },

  async publishOpenToWorkSettings(settings: OpenToWorkSettings): Promise<void> {
    if (db) {
      await setDoc(doc(db, 'settings', 'openToWork'), sanitizeForFirestore({
        ...settings,
        draft: null,
        updatedAt: new Date().toISOString(),
      }));
    }

    store.openToWork = settings;
    store.openToWorkDraft = null;
    safeStorageSet(STORAGE_KEYS.openToWork, settings);
    notifyListeners();
  },

  async saveOpenToWorkDraft(draft: OpenToWorkSettings): Promise<void> {
    if (db) {
      await setDoc(
        doc(db, 'settings', 'openToWork'),
        sanitizeForFirestore({ draft, updatedAt: new Date().toISOString() }),
        { merge: true }
      );
    }

    store.openToWorkDraft = draft;
    notifyListeners();
  },

  async updateOpenToWorkSettings(settings: OpenToWorkSettings): Promise<void> {
    await this.publishOpenToWorkSettings(settings);
  },

  // ================= RESUME RECORD =================
  getResumeRecord(preferDraft = false): ResumeRecord {
    if (preferDraft && store.resumeDraft) {
      return store.resumeDraft;
    }
    return store.resume;
  },

  async publishResumeRecord(resume: ResumeRecord): Promise<void> {
    if (db) {
      await setDoc(doc(db, 'resume', 'primary'), sanitizeForFirestore({
        ...resume,
        draft: null,
        updatedAt: new Date().toISOString(),
      }));
    }

    store.resume = resume;
    store.resumeDraft = null;
    safeStorageSet(STORAGE_KEYS.resume, resume);

    // Also update profile resume fields
    const updatedProfile: ProfileData = {
      ...store.profile,
      resumeUrl: resume.fileUrl,
      resumeButtonText: resume.buttonText,
      isResumeDownloadEnabled: resume.isPublicEnabled,
      updatedAt: new Date().toISOString(),
    };
    await this.publishProfile(updatedProfile);
  },

  async saveResumeDraft(draft: ResumeRecord): Promise<void> {
    if (db) {
      await setDoc(
        doc(db, 'resume', 'primary'),
        sanitizeForFirestore({ draft, updatedAt: new Date().toISOString() }),
        { merge: true }
      );
    }

    store.resumeDraft = draft;
    notifyListeners();
  },

  async updateResumeRecord(resume: ResumeRecord): Promise<void> {
    await this.publishResumeRecord(resume);
  },

  // ================= RESUME GENERATOR SETTINGS =================
  getResumeGeneratorSettings(): ResumeGeneratorSettings {
    return store.resumeGenerator || DEFAULT_RESUME_GENERATOR_SETTINGS;
  },

  async updateResumeGeneratorSettings(settings: ResumeGeneratorSettings): Promise<void> {
    const updated: ResumeGeneratorSettings = {
      ...settings,
      updatedAt: new Date().toISOString(),
    };

    if (db) {
      try {
        await setDoc(doc(db, 'settings', 'resumeGenerator'), updated);
      } catch (err) {
        console.warn('[CMS Firestore] ResumeGenerator settings write warning:', err);
      }
    }

    store.resumeGenerator = updated;
    safeStorageSet(STORAGE_KEYS.resumeGenerator, updated);
    notifyListeners();
  },

  // ================= RESUME VERSIONS & AUDIT LOG =================
  getResumeVersions(): ResumeVersionRecord[] {
    return store.resumeVersions || DEFAULT_RESUME_VERSIONS;
  },

  async addResumeVersion(version: ResumeVersionRecord): Promise<void> {
    const list = [version, ...(store.resumeVersions || []).filter((v) => v.id !== version.id)];
    if (version.isActive) {
      list.forEach((v) => {
        v.isActive = v.id === version.id;
      });
    }
    store.resumeVersions = list;
    safeStorageSet(STORAGE_KEYS.resumeVersions, list);

    if (db) {
      try {
        await setDoc(doc(db, 'settings', 'resumeVersions'), sanitizeForFirestore({ list }));
      } catch (err) {
        console.warn('[CMS Firestore] ResumeVersions write warning:', err);
      }
    }
    notifyListeners();
  },

  async updateResumeVersion(version: ResumeVersionRecord): Promise<void> {
    const list = (store.resumeVersions || []).map((v) => (v.id === version.id ? version : v));
    store.resumeVersions = list;
    safeStorageSet(STORAGE_KEYS.resumeVersions, list);

    if (db) {
      try {
        await setDoc(doc(db, 'settings', 'resumeVersions'), sanitizeForFirestore({ list }));
      } catch (err) {
        console.warn('[CMS Firestore] ResumeVersions write warning:', err);
      }
    }
    notifyListeners();
  },

  async restoreResumeVersion(versionId: string): Promise<ResumeVersionRecord> {
    const list = [...(store.resumeVersions || [])];
    const target = list.find((v) => v.id === versionId);
    if (!target) throw new Error('Resume version not found.');

    list.forEach((v) => {
      v.isActive = v.id === versionId;
    });
    target.isActive = true;

    store.resumeVersions = list;
    safeStorageSet(STORAGE_KEYS.resumeVersions, list);

    if (db) {
      try {
        await setDoc(doc(db, 'settings', 'resumeVersions'), sanitizeForFirestore({ list }));
      } catch (err) {
        console.warn('[CMS Firestore] ResumeVersions write warning:', err);
      }
    }

    // Also update active resume record
    const updatedRecord: ResumeRecord = {
      ...store.resume,
      id: target.id,
      fileName: target.fileName,
      displayName: target.displayName || target.fileName,
      fileUrl: target.fileUrl,
      fileSizeBytes: target.fileSizeBytes,
      uploadedAt: target.uploadedAt,
      isActive: true,
      buttonText: target.buttonText || store.resume.buttonText,
      versionName: target.versionName,
      objectKey: target.objectKey,
      storageProvider: target.storageProvider || 'cloudflare-r2',
    };
    await this.publishResumeRecord(updatedRecord);

    // Record audit entry
    await this.addResumeAuditEntry({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'Restored Resume Version',
      fileName: target.fileName,
      versionNumber: target.versionNumber,
      details: `Restored Version ${target.versionNumber} (${target.fileName}) as active live document.`,
      approvedFieldsCount: 0,
      rejectedFieldsCount: 0,
    });

    notifyListeners();
    return target;
  },

  getResumeAuditHistory(): ResumeAuditEntry[] {
    return store.resumeAudit || [];
  },

  async addResumeAuditEntry(entry: ResumeAuditEntry): Promise<void> {
    const list = [entry, ...(store.resumeAudit || [])].slice(0, 50);
    store.resumeAudit = list;
    safeStorageSet(STORAGE_KEYS.resumeAudit, list);

    if (db) {
      try {
        await setDoc(doc(db, 'settings', 'resumeAudit'), sanitizeForFirestore({ list }));
      } catch (err) {
        console.warn('[CMS Firestore] ResumeAudit write warning:', err);
      }
    }
    notifyListeners();
  },

  getLinkedInAuditHistory(): LinkedInImportAudit[] {
    return store.linkedinAudit || [];
  },

  async addLinkedInAuditEntry(entry: LinkedInImportAudit): Promise<void> {
    const list = [entry, ...(store.linkedinAudit || [])].slice(0, 50);
    store.linkedinAudit = list;
    safeStorageSet(STORAGE_KEYS.linkedinAudit, list);

    if (db) {
      try {
        await setDoc(doc(db, 'settings', 'linkedinAudit'), sanitizeForFirestore({ list }));
      } catch (err) {
        console.warn('[CMS Firestore] LinkedInAudit write warning:', err);
      }
    }
    notifyListeners();
  },

  async publishApprovedLinkedInRecords(
    approvedItems: LinkedInParsedRecord[],
    auditSummary: Omit<LinkedInImportAudit, 'id' | 'timestamp' | 'recordsApproved'>
  ): Promise<{ publishedCount: number }> {
    let publishedCount = 0;

    for (let i = 0; i < approvedItems.length; i++) {
      const item = approvedItems[i];
      const data = item.editedData || item.data;

      if (item.category === 'experience') {
        const newExp: ExperienceRecord = {
          id: `exp-li-${Date.now()}-${i}`,
          employer: data.employer || 'Enterprise Company',
          jobTitle: data.jobTitle || 'Professional Role',
          employmentType: data.employmentType || '',
          location: data.location || '',
          locationType: 'Hybrid',
          startDate: data.startDate || '',
          endDate: data.endDate || 'Present',
          isCurrent: data.isCurrent ?? true,
          description: data.description || '',
          responsibilities: data.description ? [data.description] : [],
          skillsUsed: [],
          displayOrder: store.experiences.length + 1,
          status: 'published',
        };
        await this.addExperience(newExp);
        publishedCount++;
      } else if (item.category === 'education') {
        const newEdu: EducationRecord = {
          id: `edu-li-${Date.now()}-${i}`,
          institution: data.institution || 'Academic Institution',
          degree: data.degree || 'Degree',
          fieldOfStudy: data.fieldOfStudy || data.degree || 'General',
          startYear: data.startYear || '2020',
          endYear: data.endYear || '2024',
          description: data.description || '',
          highlights: data.description ? [data.description] : [],
          displayOrder: store.education.length + 1,
        };
        await this.addEducation(newEdu);
        publishedCount++;
      } else if (item.category === 'certifications') {
        const newCert: CertificationRecord = {
          id: `cert-li-${Date.now()}-${i}`,
          title: data.title || 'Professional Certification',
          issuer: data.issuer || 'Certifying Body',
          completionDate: data.completionDate || '2024',
          expiryDate: data.expiryDate || '',
          credentialId: data.credentialId || '',
          verificationUrl: data.verificationUrl || '',
          category: 'Professional Credentials',
          highlightTag: 'VERIFIED CREDENTIAL',
          status: 'published',
          displayOrder: store.certifications.length + 1,
        };
        await this.addCertification(newCert);
        publishedCount++;
      } else if (item.category === 'skills') {
        const newSkill: SkillRecord = {
          id: `sk-li-${Date.now()}-${i}`,
          name: data.name,
          category: data.category || 'Professional Skills',
          displayOrder: store.skills.length + 1,
        };
        await this.addSkill(newSkill);
        publishedCount++;
      } else if (item.category === 'projects') {
        const newProj: ProjectRecord = {
          id: `proj-li-${Date.now()}-${i}`,
          name: data.name || 'Project',
          category: 'Software & Systems',
          subtitle: data.description ? data.description.slice(0, 60) : '',
          description: data.description || '',
          projectUrl: data.projectUrl || '',
          screenshots: [],
          technologyStack: [],
          features: [],
          developmentStatus: 'Completed',
          featured: false,
          displayOrder: store.projects.length + 1,
          status: 'published',
        };
        await this.addProject(newProj);
        publishedCount++;
      } else if (item.category === 'profile') {
        const prof = this.getProfile();
        await this.publishProfile({
          ...prof,
          headline: data.headline || prof.headline,
          bio: data.bio || prof.bio,
          location: data.location || prof.location,
        });
        publishedCount++;
      }
    }

    // Record audit entry
    await this.addLinkedInAuditEntry({
      ...auditSummary,
      id: `li-audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      recordsApproved: publishedCount,
      status: 'completed',
    });

    notifyListeners();
    return { publishedCount };
  },

  async uploadResumeFile(
    file: File,
    buttonText?: string,
    onProgress?: (percent: number) => void
  ): Promise<ResumeRecord> {
    const meta = await storageClient.uploadFile(file, {
      category: 'resumes',
      visibility: 'private',
      onProgress,
    });

    const fileUrl = meta?.secureUrl || meta?.publicUrl;
    if (!fileUrl) {
      throw new Error('Upload succeeded but storage provider did not return a valid file URL.');
    }

    const current = this.getResumeRecord();
    const cleanBaseName = file.name.replace(/\.[^/.]+$/, '');
    const updated: ResumeRecord = {
      ...current,
      id: 'resume-' + Date.now(),
      fileName: file.name,
      originalName: file.name,
      displayName: current.displayName || cleanBaseName,
      generatedDownloadName: file.name,
      fileUrl,
      fileSizeBytes: meta?.sizeBytes || file.size,
      uploadedAt: new Date().toISOString().split('T')[0],
      isActive: true,
      buttonText: buttonText || current.buttonText,
      storageProvider: meta?.storageProvider || 'cloudflare-r2',
      objectKey: meta?.objectKey,
      fileId: meta?.fileId || `file_${Date.now()}`,
    };

    await this.publishResumeRecord(updated);

    await this.addMediaAsset({
      name: file.name,
      url: fileUrl,
      type: file.type || 'application/pdf',
      sizeBytes: file.size,
      category: 'resume',
      storageProvider: meta?.storageProvider || 'cloudflare-r2',
      objectKey: meta?.objectKey,
      visibility: 'private',
    });

    return updated;
  },

  /**
   * Updates resume display name and download filename without mutating stored object key
   */
  async updateResumeDisplayName(displayName: string): Promise<ResumeRecord> {
    const current = this.getResumeRecord();
    const clean = displayName.trim() || current.originalName || current.fileName;
    const downloadName = clean.toLowerCase().endsWith('.pdf') ? clean : `${clean}.pdf`;
    const updated: ResumeRecord = {
      ...current,
      displayName: clean,
      generatedDownloadName: downloadName,
    };
    await this.publishResumeRecord(updated);
    return updated;
  },

  /**
   * Idempotent retry of metadata persistence when file is already in Cloudflare R2
   */
  async retryResumeMetadataPersistence(record: ResumeRecord): Promise<ResumeRecord> {
    await this.publishResumeRecord(record);
    await this.addMediaAsset({
      name: record.originalName || record.fileName,
      url: record.fileUrl,
      type: 'application/pdf',
      sizeBytes: record.fileSizeBytes,
      category: 'resume',
      storageProvider: record.storageProvider || 'cloudflare-r2',
      objectKey: record.objectKey,
      visibility: 'private',
    });
    return record;
  },

  // ================= SECTIONS CONFIG (SECTION MANAGER) =================
  getSectionsConfig(): SectionConfig[] {
    let list = [...store.sections];
    if (!list.some((s) => s.sectionKey === 'projects')) {
      const defaultProjSec = DEFAULT_SECTIONS_CONFIG.find((s) => s.sectionKey === 'projects');
      if (defaultProjSec) {
        list.splice(4, 0, defaultProjSec);
      }
    }
    return list;
  },

  async updateSectionsConfig(sections: SectionConfig[]): Promise<void> {
    if (db) {
      await setDoc(doc(db, 'settings', 'sections'), {
        list: sections,
        updatedAt: new Date().toISOString(),
      });
    }

    store.sections = sections;
    safeStorageSet(STORAGE_KEYS.sections, sections);
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
    return store.appearance;
  },

  async updateAppearanceSettings(appearance: AppearanceSettings): Promise<void> {
    if (db) {
      await setDoc(doc(db, 'settings', 'appearance'), {
        ...appearance,
        updatedAt: new Date().toISOString(),
      });
    }

    store.appearance = appearance;
    safeStorageSet(STORAGE_KEYS.appearance, appearance);
    notifyListeners();
  },

  // ================= SITE SETTINGS =================
  getSiteSettings(): SiteSettings {
    return store.siteSettings;
  },

  async updateSiteSettings(settings: SiteSettings): Promise<void> {
    if (db) {
      await setDoc(doc(db, 'siteSettings', 'global'), {
        ...settings,
        updatedAt: new Date().toISOString(),
      });
    }

    store.siteSettings = settings;
    safeStorageSet(STORAGE_KEYS.settings, settings);
    notifyListeners();
  },

  // ================= CONTACT MESSAGES =================
  getContactMessages(): ContactMessage[] {
    return store.messages;
  },

  async submitContactMessage(msg: {
    name: string;
    email: string;
    organization?: string;
    subject: string;
    message: string;
    hp_website?: string;
  }): Promise<{ success: boolean; id: string; emailDelivered?: boolean; messageId?: string }> {
    let emailDelivered = false;
    let emailMessageId: string | undefined;

    // 1. Dispatch enquiry to server-side Cloudflare Worker endpoint
    const res = await fetch('/api/contact/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: msg.name,
        email: msg.email,
        organization: msg.organization || '',
        subject: msg.subject || 'Operations & Strategy Inquiry',
        message: msg.message,
        hp_website: msg.hp_website || '',
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.success) {
      const errorMsg = data.error || 'Failed to submit contact enquiry.';
      const err = new Error(errorMsg);
      (err as any).code = data.code;
      (err as any).status = res.status;
      throw err;
    }

    emailDelivered = true;
    emailMessageId = data.messageId;

    // 2. Preserve administrative message record in Firestore and local store
    const newRecord: ContactMessage = {
      name: msg.name,
      email: msg.email,
      organization: msg.organization,
      subject: msg.subject,
      message: msg.message,
      id: 'msg-' + Date.now(),
      createdAt: data.timestamp || new Date().toISOString(),
      read: false,
      archived: false,
      emailDelivered,
      emailMessageId,
      emailRecipient: data.deliveredTo || 'ayushprakash0021@gmail.com',
    };

    if (db) {
      try {
        await addDoc(collection(db, 'contactMessages'), newRecord);
      } catch (firestoreErr) {
        console.warn('[CMS] Notice: Firestore contact write deferred:', firestoreErr);
      }
    }

    store.messages.unshift(newRecord);
    safeStorageSet(STORAGE_KEYS.messages, store.messages);
    notifyListeners();
    return { success: true, id: newRecord.id, emailDelivered, messageId: emailMessageId };
  },

  async markMessageRead(id: string, read: boolean): Promise<void> {
    const idx = store.messages.findIndex((m) => m.id === id);
    if (idx !== -1) {
      store.messages[idx].read = read;
      safeStorageSet(STORAGE_KEYS.messages, store.messages);
      notifyListeners();
    }
  },

  async archiveMessage(id: string, archived: boolean): Promise<void> {
    const idx = store.messages.findIndex((m) => m.id === id);
    if (idx !== -1) {
      store.messages[idx].archived = archived;
      safeStorageSet(STORAGE_KEYS.messages, store.messages);
      notifyListeners();
    }
  },

  async deleteMessage(id: string): Promise<void> {
    store.messages = store.messages.filter((m) => m.id !== id);
    safeStorageSet(STORAGE_KEYS.messages, store.messages);
    notifyListeners();
  },

  // ================= MEDIA ASSETS & RESUME =================
  getMediaAssets(): MediaAsset[] {
    return store.media;
  },

  async addMediaAsset(asset: Omit<MediaAsset, 'id' | 'uploadedAt'>): Promise<MediaAsset> {
    const newAsset: MediaAsset = {
      ...asset,
      id: 'media-' + Date.now(),
      uploadedAt: new Date().toISOString(),
    };

    if (db) {
      try {
        await setDoc(doc(db, 'mediaAssets', newAsset.id), sanitizeForFirestore(newAsset));
      } catch (err) {
        console.warn('[CMS Firestore] MediaAsset metadata write warning:', err);
      }
    }

    store.media.unshift(newAsset);
    safeStorageSet(STORAGE_KEYS.media, store.media);
    notifyListeners();
    return newAsset;
  },

  async deleteMediaAsset(id: string): Promise<void> {
    const asset = store.media.find((a) => a.id === id);
    if (asset?.objectKey) {
      await storageClient.deleteFile(asset.objectKey).catch((err) => {
        console.warn('[CMS Storage] R2 delete warning:', err);
      });
    }

    if (db) {
      try {
        await deleteDoc(doc(db, 'mediaAssets', id));
      } catch (err) {
        console.warn('[CMS Firestore] MediaAsset delete warning:', err);
      }
    }

    store.media = store.media.filter((a) => a.id !== id);
    safeStorageSet(STORAGE_KEYS.media, store.media);
    notifyListeners();
  },

  async uploadMediaFile(
    file: File,
    category: MediaAsset['category'],
    caption?: string,
    altText?: string
  ): Promise<MediaAsset> {
    const targetCat =
      category === 'resume'
        ? 'resumes'
        : category === 'photo'
        ? 'profile'
        : category === 'certification-logo' || category === 'certificate'
        ? 'certifications'
        : category === 'logo' || category === 'screenshot'
        ? 'projects'
        : 'media';
    const visibility = category === 'resume' ? 'private' : 'public';

    let meta: any = null;
    try {
      meta = await storageClient.uploadFile(file, {
        category: targetCat,
        visibility,
      });
    } catch (err) {
      console.warn('[CMS Storage] R2 media upload error, falling back:', err);
    }

    const fileUrl =
      meta?.publicUrl ||
      meta?.secureUrl ||
      (await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      }));

    const asset = await this.addMediaAsset({
      name: file.name,
      url: fileUrl,
      type: file.type || 'application/octet-stream',
      sizeBytes: meta?.sizeBytes || file.size,
      category,
      caption: caption || file.name,
      altText: altText || file.name,
      storageProvider: meta?.storageProvider || 'cloudflare-r2',
      objectKey: meta?.objectKey,
      visibility,
    });

    return asset;
  },

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

  // ================= EXTRACTION JOB =================
  getActiveExtractionJob(): ExtractionJob | null {
    return store.extractionJob || null;
  },

  async saveExtractionJob(job: ExtractionJob): Promise<void> {
    store.extractionJob = job;
    safeStorageSet(STORAGE_KEYS.extractionJob, job);
    if (db) {
      try {
        await setDoc(doc(db, 'settings', 'extractionJob'), sanitizeForFirestore(job));
      } catch (err) {
        console.warn('[CMS Firestore] extractionJob write warning:', err);
      }
    }
    notifyListeners();
  },

  async clearExtractionJob(): Promise<void> {
    store.extractionJob = null;
    safeStorageRemove(STORAGE_KEYS.extractionJob);
    if (db) {
      try {
        await deleteDoc(doc(db, 'settings', 'extractionJob'));
      } catch (err) {
        console.warn('[CMS Firestore] extractionJob clear warning:', err);
      }
    }
    notifyListeners();
  },
};
