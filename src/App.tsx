import React, { useState, useEffect } from 'react';
import { CinematicHero } from './components/cinematic/CinematicHero';
import { EditorialAbout } from './components/editorial/EditorialAbout';
import { EditorialOpenToWork } from './components/editorial/EditorialOpenToWork';
import { EditorialExperience } from './components/editorial/EditorialExperience';
import { EditorialCapabilities } from './components/editorial/EditorialCapabilities';
import { EditorialProjects } from './components/editorial/EditorialProjects';
import { EditorialOrion9 } from './components/editorial/EditorialOrion9';
import { EditorialApplyVise } from './components/editorial/EditorialApplyVise';
import { EditorialCertifications } from './components/editorial/EditorialCertifications';
import { EditorialEducation } from './components/editorial/EditorialEducation';
import { EditorialContact } from './components/editorial/EditorialContact';
import { Footer } from './components/Footer';
import { SwarmCursor } from './components/reactbits/SwarmCursor';
import { ResumeGeneratorModal } from './components/resume/ResumeGeneratorModal';
import { AdaptiveNotchNavigation } from './components/public/AdaptiveNotchNavigation';

// Admin Console Components
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminConsole } from './components/admin/AdminConsole';

// CMS & Auth Services
import { cmsService } from './services/cmsService';
import { authService } from './services/authService';
import {
  ProfileData,
  HomepageSettings,
  AboutSectionSettings,
  ExperienceRecord,
  ProjectRecord,
  CertificationRecord,
  SkillRecord,
  EducationRecord,
  SectionConfig,
  AppearanceSettings,
  OpenToWorkSettings,
  ResumeGeneratorSettings,
} from './types/cms';

export const App: React.FC = () => {
  // Navigation / Routing State
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    return window.location.pathname.startsWith('/admin') || window.location.hash.startsWith('#/admin');
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return authService.isCurrentSessionAdmin();
  });

  // Reduced motion preference
  const [reducedMotion] = useState<boolean>(() => {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  // Reactive Public State loaded directly from CMS
  const [profile, setProfile] = useState<ProfileData>(() => cmsService.getProfile());
  const [homepageSettings, setHomepageSettings] = useState<HomepageSettings>(() => cmsService.getHomepageSettings());
  const [openToWorkSettings, setOpenToWorkSettings] = useState<OpenToWorkSettings>(() =>
    cmsService.getOpenToWorkSettings()
  );
  const [aboutSettings, setAboutSettings] = useState<AboutSectionSettings>(() => cmsService.getAboutSettings());
  const [experiences, setExperiences] = useState<ExperienceRecord[]>(() => cmsService.getExperiences(true));
  const [projects, setProjects] = useState<ProjectRecord[]>(() => cmsService.getProjects(true));
  const [certifications, setCertifications] = useState<CertificationRecord[]>(() => cmsService.getCertifications(true));
  const [skills, setSkills] = useState<SkillRecord[]>(() => cmsService.getSkills());
  const [education, setEducation] = useState<EducationRecord[]>(() => cmsService.getEducation());
  const [sectionsConfig, setSectionsConfig] = useState<SectionConfig[]>(() => cmsService.getSectionsConfig());
  const [appearance, setAppearance] = useState<AppearanceSettings>(() => cmsService.getAppearanceSettings());
  const [resumeSettings, setResumeSettings] = useState<ResumeGeneratorSettings>(() =>
    cmsService.getResumeGeneratorSettings()
  );
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

  // Listen for Firebase Auth changes & URL hash / history
  useEffect(() => {
    const unsubscribeAuth = authService.onAuthStateChange((_user, isAdmin) => {
      setIsAdminAuthenticated(isAdmin);
    });

    const handlePopState = () => {
      const isAdm = window.location.pathname.startsWith('/admin') || window.location.hash.startsWith('#/admin');
      setIsAdminRoute(isAdm);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    // Subscribe to reactive CMS updates
    const unsubscribeCms = cmsService.subscribe(() => {
      setProfile(cmsService.getProfile());
      setHomepageSettings(cmsService.getHomepageSettings());
      setOpenToWorkSettings(cmsService.getOpenToWorkSettings());
      setAboutSettings(cmsService.getAboutSettings());
      setExperiences(cmsService.getExperiences(true));
      setProjects(cmsService.getProjects(true));
      setCertifications(cmsService.getCertifications(true));
      setSkills(cmsService.getSkills());
      setEducation(cmsService.getEducation());
      setSectionsConfig(cmsService.getSectionsConfig());
      setAppearance(cmsService.getAppearanceSettings());
      setResumeSettings(cmsService.getResumeGeneratorSettings());
    });

    return () => {
      unsubscribeAuth();
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
      unsubscribeCms();
    };
  }, []);

  const navigateToAdmin = () => {
    window.history.pushState({}, '', '/admin');
    setIsAdminRoute(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPublic = () => {
    window.history.pushState({}, '', '/');
    setIsAdminRoute(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // ROUTE: /ADMIN
  if (isAdminRoute) {
    if (isAdminAuthenticated) {
      return (
        <AdminConsole
          onLogout={() => setIsAdminAuthenticated(false)}
          onReturnToSite={navigateToPublic}
        />
      );
    } else {
      return (
        <AdminLogin
          onLoginSuccess={() => setIsAdminAuthenticated(true)}
          onReturnToSite={navigateToPublic}
        />
      );
    }
  }

  // Projects
  const orionProject = projects.find((p) => p.id === 'orion-9');
  const applywiseProject = projects.find((p) => p.id === 'applywise-ai');

  // Sorted active sections based on Section Manager config
  const sortedSections = [...sectionsConfig]
    .filter((s) => s.isVisible && s.status === 'published')
    .sort((a, b) => a.displayOrder - b.displayOrder);

  // Render Section Component by key
  const renderSectionByKey = (key: string) => {
    switch (key) {
      case 'about':
        return (
          <EditorialAbout
            key="about"
            profile={profile}
            aboutSettings={aboutSettings}
            onOpenResumeGenerator={() => setIsResumeModalOpen(true)}
          />
        );
      case 'openToWork':
      case 'opentowork':
        return (
          <EditorialOpenToWork
            key="opentowork"
            settings={openToWorkSettings}
            profile={profile}
            onOpenResumeGenerator={() => setIsResumeModalOpen(true)}
          />
        );
      case 'experience':
        return <EditorialExperience key="experience" experiences={experiences} />;
      case 'capabilities':
        return <EditorialCapabilities key="capabilities" skills={skills} />;
      case 'projects':
        return <EditorialProjects key="projects" projects={projects} onSelectProject={scrollToSection} />;
      case 'orion9':
      case 'orion-9':
        // Standalone Orion-9 section removed per user specification; showcased inside Projects Concave Carousel
        return null;
      case 'applyvise':
      case 'applywise-ai':
        // Standalone ApplyVise section removed; showcased inside Projects Concave Carousel
        return null;
      case 'certifications':
        return <EditorialCertifications key="certifications" certifications={certifications} />;
      case 'education':
        return <EditorialEducation key="education" education={education} />;
      case 'contact':
        return <EditorialContact key="contact" profile={profile} />;
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        backgroundColor: appearance.primaryBg || 'var(--bg-primary)',
        color: appearance.textPrimary || 'var(--text-primary)',
      }}
    >
      {/* REACT BITS: SWARM CURSOR (Monochromatic Silver Liquid-Metal Particle Trail) */}
      <SwarmCursor color="217, 221, 227" particleCount={28} />

      {/* SECTION 3 & 4: CINEMATIC NATURAL HOMEPAGE ENVIRONMENT & LAYOUT */}
      {homepageSettings.heroVisibility !== false && (
        <CinematicHero
          reducedMotion={reducedMotion}
          profile={profile}
          homepageSettings={homepageSettings}
          onNavigateSection={scrollToSection}
          onOpenAdmin={navigateToAdmin}
        />
      )}

      {/* SECTION 9 & 5: DYNAMICALLY MANAGED EDITORIAL SECTIONS */}
      <main style={{ position: 'relative', zIndex: 10 }}>
        {sortedSections.length > 0
          ? sortedSections.map((sec) => renderSectionByKey(sec.sectionKey))
          : (
            <>
              <EditorialAbout
                profile={profile}
                aboutSettings={aboutSettings}
                onOpenResumeGenerator={() => setIsResumeModalOpen(true)}
              />
              <EditorialOpenToWork
                settings={openToWorkSettings}
                profile={profile}
                onOpenResumeGenerator={() => setIsResumeModalOpen(true)}
              />
              <EditorialExperience experiences={experiences} />
              <EditorialCapabilities skills={skills} />
              <EditorialProjects projects={projects} onSelectProject={scrollToSection} />
              <EditorialCertifications certifications={certifications} />
              <EditorialEducation education={education} />
              <EditorialContact profile={profile} />
            </>
          )}
      </main>

      {/* MINIMAL EDITORIAL FOOTER */}
      <Footer profile={profile} onOpenAdmin={navigateToAdmin} />

      {/* EXACT ADAPTIVE NOTCH NAVIGATION (TOP GEOMETRY REFERENCE) */}
      <AdaptiveNotchNavigation onNavigateSection={scrollToSection} />

      {/* DYNAMIC ATS RESUME GENERATOR MODAL */}
      <ResumeGeneratorModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        profile={profile}
        about={aboutSettings}
        experiences={experiences}
        projects={projects}
        skills={skills}
        education={education}
        certifications={certifications}
        settings={resumeSettings}
      />
    </div>
  );
};

export default App;
