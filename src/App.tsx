import React, { useState, useEffect } from 'react';
import { UniverseCanvas } from './components/3d/UniverseCanvas';
import { HeroSpatial } from './components/public/HeroSpatial';
import { NavbarRedesigned } from './components/public/NavbarRedesigned';
import { AboutSection } from './components/public/AboutSection';
import { ExperienceSection } from './components/public/ExperienceSection';
import { SkillsSection } from './components/public/SkillsSection';
import { OrionSectionRedesigned } from './components/public/OrionSectionRedesigned';
import { ApplyViseSectionRedesigned } from './components/public/ApplyViseSectionRedesigned';
import { ArchitectureSection } from './components/public/ArchitectureSection';
import { CertificationsSectionRedesigned } from './components/public/CertificationsSectionRedesigned';
import { EducationSection } from './components/public/EducationSection';
import { RecruiterModeModal } from './components/public/RecruiterModeModal';
import { ContactSectionRedesigned } from './components/public/ContactSectionRedesigned';
import { Footer } from './components/Footer';

// Admin Console Components
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminConsole } from './components/admin/AdminConsole';

// CMS & Auth Services
import { cmsService } from './services/cmsService';
import { authService } from './services/authService';
import {
  ProfileData,
  ExperienceRecord,
  ProjectRecord,
  CertificationRecord,
  SkillRecord,
  EducationRecord,
  SiteSettings,
} from './types/cms';

export const App: React.FC = () => {
  // Navigation / Routing State
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    return window.location.pathname.startsWith('/admin') || window.location.hash.startsWith('#/admin');
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return authService.isCurrentSessionAdmin();
  });

  // Spatial 3D Active Zone
  const [activeZone, setActiveZone] = useState<string | null>(null);

  // Recruiter Brief Modal
  const [isRecruiterModalOpen, setIsRecruiterModalOpen] = useState(false);

  // Reactive Public State loaded directly from CMS
  const [profile, setProfile] = useState<ProfileData>(() => cmsService.getProfile());
  const [experiences, setExperiences] = useState<ExperienceRecord[]>(() => cmsService.getExperiences(true));
  const [projects, setProjects] = useState<ProjectRecord[]>(() => cmsService.getProjects(true));
  const [certifications, setCertifications] = useState<CertificationRecord[]>(() => cmsService.getCertifications(true));
  const [skills, setSkills] = useState<SkillRecord[]>(() => cmsService.getSkills());
  const [education, setEducation] = useState<EducationRecord[]>(() => cmsService.getEducation());
  const [settings, setSettings] = useState<SiteSettings>(() => cmsService.getSiteSettings());

  // Listen for Firebase Auth changes
  useEffect(() => {
    const unsubscribeAuth = authService.onAuthStateChange((user, isAdmin) => {
      setIsAdminAuthenticated(isAdmin);
    });

    // Listen for browser history / popstate
    const handlePopState = () => {
      const isAdm = window.location.pathname.startsWith('/admin') || window.location.hash.startsWith('#/admin');
      setIsAdminRoute(isAdm);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    // Subscribe to reactive CMS updates so public views re-render in real-time
    const unsubscribeCms = cmsService.subscribe(() => {
      setProfile(cmsService.getProfile());
      setExperiences(cmsService.getExperiences(true));
      setProjects(cmsService.getProjects(true));
      setCertifications(cmsService.getCertifications(true));
      setSkills(cmsService.getSkills());
      setEducation(cmsService.getEducation());
      setSettings(cmsService.getSiteSettings());
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

  const handleZoneSelection = (zoneId: string) => {
    setActiveZone(zoneId);
    // Smooth scroll to corresponding section if not overview
    if (zoneId !== 'overview') {
      const el = document.getElementById(zoneId);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 200);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // ROUTE: PUBLIC IMMERSIVE 3D PORTFOLIO
  const orionProject = projects.find((p) => p.id === 'orion-9');
  const applywiseProject = projects.find((p) => p.id === 'applywise-ai');

  return (
    <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Navigation */}
      <NavbarRedesigned
        profile={profile}
        onNavigateAdmin={navigateToAdmin}
        onToggleRecruiterMode={() => setIsRecruiterModalOpen(true)}
        onSelectZone={handleZoneSelection}
      />

      {/* SECTION 1: INTERACTIVE 3D HOME UNIVERSE */}
      <section
        id="3d-universe"
        style={{
          position: 'relative',
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <UniverseCanvas onSelectZone={handleZoneSelection} activeZone={activeZone} />
        <HeroSpatial
          profile={profile}
          projects={projects}
          onExploreZone={handleZoneSelection}
          onToggleRecruiterMode={() => setIsRecruiterModalOpen(true)}
          isRecruiterMode={isRecruiterModalOpen}
        />
      </section>

      {/* PUBLIC CONTENT SECTIONS (LOADED FROM CMS) */}
      <main style={{ position: 'relative', zIndex: 5 }}>
        {/* SECTION 2: ABOUT */}
        <AboutSection profile={profile} />

        {/* SECTION 3: PROFESSIONAL EXPERIENCE */}
        <ExperienceSection experiences={experiences} />

        {/* SECTION 4: SKILLS & CAPABILITIES */}
        <SkillsSection skills={skills} />

        {/* SECTION 5: ORION-9 SHOWCASE & INTERACTIVE SUPPLY CHAIN VISUALIZATION */}
        <OrionSectionRedesigned project={orionProject} />

        {/* SECTION 6: APPLYVISE AI SHOWCASE & INTERACTIVE CAREER INTELLIGENCE VISUALIZATION */}
        <ApplyViseSectionRedesigned project={applywiseProject} />

        {/* SECTION 7: ARCHITECTURE & TECHNICAL EXPLORATION */}
        <ArchitectureSection />

        {/* SECTION 8: CERTIFICATIONS & HONORS */}
        <CertificationsSectionRedesigned certifications={certifications} />

        {/* SECTION 9: EDUCATION */}
        <EducationSection education={education} />

        {/* SECTION 11: CONTACT */}
        <ContactSectionRedesigned profile={profile} />
      </main>

      {/* SECTION 10: RECRUITER MODE DOSSIER MODAL */}
      <RecruiterModeModal
        isOpen={isRecruiterModalOpen}
        onClose={() => setIsRecruiterModalOpen(false)}
        profile={profile}
        experiences={experiences}
        projects={projects}
        certifications={certifications}
        skills={skills}
      />

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default App;
