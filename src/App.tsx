import React, { useState, useEffect } from 'react';
import { Universe3DScene } from './components/3d/Universe3DScene';
import { NavbarRedesigned } from './components/public/NavbarRedesigned';
import { EditorialAbout } from './components/editorial/EditorialAbout';
import { EditorialExperience } from './components/editorial/EditorialExperience';
import { EditorialCapabilities } from './components/editorial/EditorialCapabilities';
import { EditorialOrion9 } from './components/editorial/EditorialOrion9';
import { EditorialApplyVise } from './components/editorial/EditorialApplyVise';
import { EditorialCertifications } from './components/editorial/EditorialCertifications';
import { EditorialEducation } from './components/editorial/EditorialEducation';
import { EditorialContact } from './components/editorial/EditorialContact';
import { RecruiterModeModal } from './components/public/RecruiterModeModal';
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

  // Spatial 3D Active Landmark
  const [activeLandmarkId, setActiveLandmarkId] = useState<string | null>(null);

  // Recruiter Dossier Modal
  const [isRecruiterModalOpen, setIsRecruiterModalOpen] = useState(false);

  // Reduced motion preference
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  // Reactive Public State loaded directly from CMS
  const [profile, setProfile] = useState<ProfileData>(() => cmsService.getProfile());
  const [experiences, setExperiences] = useState<ExperienceRecord[]>(() => cmsService.getExperiences(true));
  const [projects, setProjects] = useState<ProjectRecord[]>(() => cmsService.getProjects(true));
  const [certifications, setCertifications] = useState<CertificationRecord[]>(() => cmsService.getCertifications(true));
  const [skills, setSkills] = useState<SkillRecord[]>(() => cmsService.getSkills());
  const [education, setEducation] = useState<EducationRecord[]>(() => cmsService.getEducation());
  const [settings, setSettings] = useState<SiteSettings>(() => cmsService.getSiteSettings());

  // Listen for Firebase Auth changes & URL hash / history
  useEffect(() => {
    const unsubscribeAuth = authService.onAuthStateChange((user, isAdmin) => {
      setIsAdminAuthenticated(isAdmin);
    });

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

  const handleSelectLandmark = (landmarkId: string) => {
    setActiveLandmarkId(landmarkId);
    if (landmarkId !== 'overview') {
      const el = document.getElementById(landmarkId);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 300);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSkipToEditorial = () => {
    const el = document.getElementById('about');
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
    <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#07090D', color: '#F5F7FA' }}>
      {/* Conventional Sticky Top Navigation */}
      <NavbarRedesigned
        profile={profile}
        onNavigateAdmin={navigateToAdmin}
        onToggleRecruiterMode={() => setIsRecruiterModalOpen(true)}
        onSelectZone={handleSelectLandmark}
      />

      {/* PART 2: HOMEPAGE INTERACTIVE 3D WORLD */}
      <section id="3d-universe" style={{ position: 'relative', width: '100%', height: '100vh' }}>
        <Universe3DScene
          onSelectLandmark={handleSelectLandmark}
          activeLandmarkId={activeLandmarkId}
          onSkipToEditorial={handleSkipToEditorial}
          reducedMotion={reducedMotion}
        />
      </section>

      {/* PART 3: PREMIUM EDITORIAL PAGES */}
      <main style={{ position: 'relative', zIndex: 10 }}>
        {/* ABOUT */}
        <EditorialAbout profile={profile} />

        {/* EXPERIENCE */}
        <EditorialExperience experiences={experiences} />

        {/* CAPABILITIES */}
        <EditorialCapabilities skills={skills} />

        {/* ORION-9 PROJECT SHOWCASE */}
        <EditorialOrion9 project={orionProject} />

        {/* APPLYVISE AI PROJECT SHOWCASE */}
        <EditorialApplyVise project={applywiseProject} />

        {/* CERTIFICATIONS */}
        <EditorialCertifications certifications={certifications} />

        {/* EDUCATION */}
        <EditorialEducation education={education} />

        {/* CONTACT */}
        <EditorialContact profile={profile} />
      </main>

      {/* RECRUITER MODE DOSSIER MODAL */}
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
