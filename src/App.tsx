import React, { useState, useEffect } from 'react';
import { CinematicHero } from './components/cinematic/CinematicHero';
import { EditorialAbout } from './components/editorial/EditorialAbout';
import { EditorialExperience } from './components/editorial/EditorialExperience';
import { EditorialCapabilities } from './components/editorial/EditorialCapabilities';
import { EditorialOrion9 } from './components/editorial/EditorialOrion9';
import { EditorialApplyVise } from './components/editorial/EditorialApplyVise';
import { EditorialCertifications } from './components/editorial/EditorialCertifications';
import { EditorialEducation } from './components/editorial/EditorialEducation';
import { EditorialContact } from './components/editorial/EditorialContact';
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
  const [experiences, setExperiences] = useState<ExperienceRecord[]>(() => cmsService.getExperiences(true));
  const [projects, setProjects] = useState<ProjectRecord[]>(() => cmsService.getProjects(true));
  const [certifications, setCertifications] = useState<CertificationRecord[]>(() => cmsService.getCertifications(true));
  const [skills, setSkills] = useState<SkillRecord[]>(() => cmsService.getSkills());
  const [education, setEducation] = useState<EducationRecord[]>(() => cmsService.getEducation());

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
      setExperiences(cmsService.getExperiences(true));
      setProjects(cmsService.getProjects(true));
      setCertifications(cmsService.getCertifications(true));
      setSkills(cmsService.getSkills());
      setEducation(cmsService.getEducation());
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

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      {/* SECTION 3 & 4: CINEMATIC NATURAL HOMEPAGE ENVIRONMENT & LAYOUT */}
      <CinematicHero
        reducedMotion={reducedMotion}
        onNavigateSection={scrollToSection}
        onOpenAdmin={navigateToAdmin}
      />

      {/* SECTION 9: REFINED EDITORIAL INNER PAGES */}
      <main style={{ position: 'relative', zIndex: 10 }}>
        {/* ABOUT */}
        <EditorialAbout profile={profile} />

        {/* EXPERIENCE */}
        <EditorialExperience experiences={experiences} />

        {/* CAPABILITIES */}
        <EditorialCapabilities skills={skills} />

        {/* ORION-9 CASE STUDY */}
        <EditorialOrion9 project={orionProject} />

        {/* APPLYVISE AI CASE STUDY */}
        <EditorialApplyVise project={applywiseProject} />

        {/* ACCREDITATIONS & CERTIFICATIONS */}
        <EditorialCertifications certifications={certifications} />

        {/* EDUCATION */}
        <EditorialEducation education={education} />

        {/* CONTACT */}
        <EditorialContact profile={profile} />
      </main>

      {/* MINIMAL EDITORIAL FOOTER */}
      <Footer onOpenAdmin={navigateToAdmin} />
    </div>
  );
};

export default App;
