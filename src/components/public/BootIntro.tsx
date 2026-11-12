import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import './BootIntro.css';

export const SESSION_STORAGE_KEY = 'ap_intro_seen_v1';
export const LEGACY_STORAGE_KEY = 'ap_boot_intro_played';
export const TOTAL_DURATION_MS = 3400;
export const FADE_OUT_START_MS = 3000;

export type IntroStage =
  | 'entrance'
  | 'logo_trace'
  | 'star_flare'
  | 'name'
  | 'tagline1'
  | 'tagline2'
  | 'initialization'
  | 'exit';

export interface BootIntroProps {
  onComplete?: () => void;
  forcePlay?: boolean;
}

export const BootIntro: React.FC<BootIntroProps> = ({ onComplete, forcePlay = false }) => {
  // Determine if intro should run
  const shouldPlay = useCallback(() => {
    if (typeof window === 'undefined') return false;

    // 1. Accessibility: respects prefers-reduced-motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return false;
    }

    // 2. Manual debug or replay flag in URL query parameter (?intro=1, ?replay=1, ?intro_replay=1)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('intro') || urlParams.has('replay') || urlParams.has('intro_replay') || forcePlay) {
      return true;
    }

    // 3. Play once per fresh browser session
    try {
      const seenV1 = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
      const seenLegacy = window.sessionStorage.getItem(LEGACY_STORAGE_KEY);
      if (seenV1 === 'true' || seenLegacy === 'true') {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }, [forcePlay]);

  const [isMounted, setIsMounted] = useState<boolean>(() => shouldPlay());
  const [stage, setStage] = useState<IntroStage>('entrance');
  const [logoLoaded, setLogoLoaded] = useState<boolean>(false);

  const timersRef = useRef<number[]>([]);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  }, []);

  // Complete and unmount the intro
  const completeIntro = useCallback(() => {
    clearAllTimers();
    setStage('exit');

    try {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
      window.sessionStorage.setItem(LEGACY_STORAGE_KEY, 'true');
    } catch {
      // Ignore private browsing sessionStorage errors
    }

    // Restore body scrolling
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }

    // Unmount after smooth fade transition
    setTimeout(() => {
      setIsMounted(false);
      if (onComplete) onComplete();
    }, 400);
  }, [clearAllTimers, onComplete]);

  // Immediate skip on user action (Skip button or Escape key)
  const handleSkip = useCallback(() => {
    completeIntro();
  }, [completeIntro]);

  useEffect(() => {
    if (!isMounted) return;

    // Immediately mark as seen in sessionStorage so reloads/navigation don't replay
    try {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
      window.sessionStorage.setItem(LEGACY_STORAGE_KEY, 'true');
    } catch {}

    // Lock background scrolling while intro is visible
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }

    // Expose developer replay helper on window
    if (typeof window !== 'undefined') {
      (window as any).__replayBootIntro = () => {
        try {
          window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
          window.sessionStorage.removeItem(LEGACY_STORAGE_KEY);
        } catch {}
        window.location.reload();
      };
    }

    // Keyboard accessibility: Escape key skips intro immediately
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Support frozen identity state for deterministic visual audits (?freeze_intro=1)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('freeze_intro') || urlParams.has('intro_freeze')) {
      setStage('tagline2');
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        if (typeof document !== 'undefined') {
          document.body.style.overflow = '';
        }
      };
    }

    // Timeline Sequence:
    // 0.0s – 0.4s: 'entrance' (ambient dark emergence & crimson backlight)
    // 0.4s – 1.2s: 'logo_trace' (contour tracing and metallic emergence)
    const t1 = window.setTimeout(() => setStage('logo_trace'), 400);

    // 1.2s – 1.7s: 'star_flare' (AP orbital starburst flare & specular shimmer)
    const t2 = window.setTimeout(() => setStage('star_flare'), 1200);

    // 1.7s – 2.1s: 'name' (AYUSH PRAKASH reveal)
    const t3 = window.setTimeout(() => setStage('name'), 1700);

    // 2.1s – 2.4s: 'tagline1' (BUSINESS. SYSTEMS. reveal)
    const t4 = window.setTimeout(() => setStage('tagline1'), 2100);

    // 2.4s – 2.8s: 'tagline2' (Intelligence & Innovation. reveal)
    const t5 = window.setTimeout(() => setStage('tagline2'), 2400);

    // 2.8s – 3.0s: 'initialization' (sleek digital progress fill)
    const t6 = window.setTimeout(() => setStage('initialization'), 2800);

    // 3.0s – 3.4s: 'exit' (smooth fade transition revealing hero)
    const t7 = window.setTimeout(() => setStage('exit'), FADE_OUT_START_MS);

    // 3.4s: Complete & unmount
    const t8 = window.setTimeout(() => completeIntro(), TOTAL_DURATION_MS);

    timersRef.current = [t1, t2, t3, t4, t5, t6, t7, t8];

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearAllTimers();
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [isMounted, completeIntro, handleSkip, clearAllTimers]);

  if (!isMounted || typeof document === 'undefined') {
    return null;
  }

  const isExiting = stage === 'exit';
  const hasLogoTrace = stage !== 'entrance';
  const hasStarFlare = stage === 'star_flare' || stage === 'name' || stage === 'tagline1' || stage === 'tagline2' || stage === 'initialization' || stage === 'exit';
  const showName = stage === 'name' || stage === 'tagline1' || stage === 'tagline2' || stage === 'initialization' || stage === 'exit';
  const showTagline1 = stage === 'tagline1' || stage === 'tagline2' || stage === 'initialization' || stage === 'exit';
  const showTagline2 = stage === 'tagline2' || stage === 'initialization' || stage === 'exit';
  const showProgress = stage === 'initialization' || stage === 'exit';

  // 14 floating micro-embers for restrained cinematic depth
  const embers = Array.from({ length: 14 }).map((_, i) => ({
    id: i,
    left: `${(i * 7.1 + 3) % 94}%`,
    animationDelay: `${(i * 0.28).toFixed(2)}s`,
    animationDuration: `${(3.2 + (i % 3) * 0.6).toFixed(2)}s`,
    size: `${(i % 3) * 1 + 2}px`,
  }));

  const content = (
    <aside
      className={`boot-intro-overlay stage-${stage} ${isExiting ? 'is-exiting' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Brand introduction"
    >
      {/* Subtle deep crimson background ambient glow */}
      <div className="boot-intro-ambient-glow" aria-hidden="true" />

      {/* Floating cinematic micro-embers */}
      <div className="boot-intro-embers-container" aria-hidden="true">
        {embers.map((ember) => (
          <span
            key={ember.id}
            className="boot-intro-ember"
            style={{
              left: ember.left,
              width: ember.size,
              height: ember.size,
              animationDelay: ember.animationDelay,
              animationDuration: ember.animationDuration,
            }}
          />
        ))}
      </div>

      {/* Accessible Skip Button */}
      <button
        type="button"
        onClick={handleSkip}
        className="boot-intro-skip-btn"
        aria-label="Skip brand introduction"
      >
        Skip Intro &times;
      </button>

      {/* Central Composition */}
      <div className="boot-intro-content">
        {/* AP Monogram Cinematic Reveal */}
        <div className={`boot-intro-logo-wrapper ${hasLogoTrace ? 'is-tracing' : ''} ${hasStarFlare ? 'is-starred' : ''}`}>
          {/* Subtle backglow focused behind the logo */}
          <div className="boot-intro-logo-backglow" aria-hidden="true" />

          {/* Authentic Base AP Logo Image */}
          <img
            src="/brand/ap-transparent.png"
            alt="AP — Ayush Prakash Official Brand Monogram"
            width={175}
            height={112}
            className={`boot-intro-logo-img ${logoLoaded ? 'is-loaded' : ''}`}
            onLoad={() => setLogoLoaded(true)}
            onError={() => {
              // Gracefully handle missing asset without blocking website
              setLogoLoaded(true);
            }}
          />

          {/* CSS Masked Silver Contour Light Tracer */}
          <div className="boot-intro-contour-tracer" aria-hidden="true" />

          {/* Specular Light Sweep Overlay */}
          <div className="boot-intro-light-sweep" aria-hidden="true" />

          {/* Radiant 4-Pointed Starburst Flare over AP star apex (top: 11.5%, right: 17.5%) */}
          <div className={`boot-intro-star-flare ${hasStarFlare ? 'is-flaring' : ''}`} aria-hidden="true">
            <div className="boot-intro-star-core" />
            <div className="boot-intro-star-streak" />
            <svg
              viewBox="0 0 36 36"
              className="boot-intro-star-svg"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 0C18 10 26 18 36 18C26 18 18 26 18 36C18 26 10 18 0 18C10 18 18 10 18 0Z"
                fill="url(#star-gradient)"
              />
              <defs>
                <radialGradient
                  id="star-gradient"
                  cx="50%"
                  cy="50%"
                  r="50%"
                  fx="50%"
                  fy="50%"
                >
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="45%" stopColor="#E2E6EF" />
                  <stop offset="75%" stopColor="#C8CCD8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#781E31" stopOpacity="0" />
                </radialGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Founder Identity Reveal: AYUSH PRAKASH */}
        <div
          className={`boot-intro-identity-wrapper ${showName ? 'is-visible' : ''}`}
          aria-hidden={!showName}
        >
          <h1 className="boot-intro-founder-name">
            <span className="boot-intro-name-ayush">AYUSH</span>
            <span className="boot-intro-name-prakash">PRAKASH</span>
          </h1>

          {/* Two-Stage Tagline Reveal */}
          <div className="boot-intro-tagline">
            <span className={`boot-intro-tagline-heading ${showTagline1 ? 'is-revealed' : ''}`}>
              BUSINESS. SYSTEMS.
            </span>
            <span className={`boot-intro-tagline-sub ${showTagline2 ? 'is-revealed' : ''}`}>
              Intelligence &amp; Innovation.
            </span>
          </div>
        </div>

        {/* Digital Initialization Progress Indicator */}
        <div
          className={`boot-intro-progress-wrapper ${showProgress ? 'is-visible' : ''}`}
          aria-hidden={!showProgress}
        >
          <div className="boot-intro-status-text">INITIALIZING DIGITAL EXPERIENCE</div>
          <div className="boot-intro-progress-track">
            <div className={`boot-intro-progress-bar ${showProgress ? 'is-animating' : ''}`} />
          </div>
        </div>
      </div>
    </aside>
  );

  return createPortal(content, document.body);
};
