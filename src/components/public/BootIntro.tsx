import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import './BootIntro.css';

const SESSION_STORAGE_KEY = 'ap_boot_intro_played';
const TOTAL_DURATION_MS = 4000;
const FADE_OUT_START_MS = 3600;

export type IntroStage = 'entrance' | 'reveal' | 'identity' | 'initialization' | 'exit';

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

    // 2. Manual debug or replay flag in URL query parameter (?intro=1 or ?replay=1)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('intro') || urlParams.has('replay') || forcePlay) {
      return true;
    }

    // 3. Play once per fresh browser session
    try {
      const alreadyPlayed = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
      return alreadyPlayed !== 'true';
    } catch {
      return false;
    }
  }, [forcePlay]);

  const [isMounted, setIsMounted] = useState<boolean>(() => shouldPlay());
  const [stage, setStage] = useState<IntroStage>('entrance');

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

  // Immediate skip on user action (e.g. Skip button or Escape key)
  const handleSkip = useCallback(() => {
    completeIntro();
  }, [completeIntro]);

  useEffect(() => {
    if (!isMounted) return;

    // Immediately mark as played in sessionStorage so reloads/navigation don't replay
    try {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
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
        } catch {}
        window.location.reload();
      };
    }

    // Keyboard accessibility: Escape key skips intro
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Timeline Sequence:
    // 0.0s – 0.7s: 'entrance' (Logo emerges from darkness)
    // 0.7s – 1.8s: 'reveal' (Shimmer light sweep across logo)
    const t1 = window.setTimeout(() => setStage('reveal'), 700);

    // 1.8s – 2.8s: 'identity' (Founder identity & tagline reveal)
    const t2 = window.setTimeout(() => setStage('identity'), 1800);

    // 2.8s – 3.6s: 'initialization' (Digital initialization progress bar)
    const t3 = window.setTimeout(() => setStage('initialization'), 2800);

    // 3.6s – 4.0s: 'exit' (Smooth fade transition revealing hero)
    const t4 = window.setTimeout(() => setStage('exit'), FADE_OUT_START_MS);

    // 4.0s: Complete & unmount
    const t5 = window.setTimeout(() => completeIntro(), TOTAL_DURATION_MS);

    timersRef.current = [t1, t2, t3, t4, t5];

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
  const showIdentity = stage === 'identity' || stage === 'initialization' || stage === 'exit';
  const showProgress = stage === 'initialization' || stage === 'exit';
  const isShimmering = stage === 'reveal';

  const content = (
    <aside
      className={`boot-intro-overlay stage-${stage} ${isExiting ? 'is-exiting' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Brand introduction"
    >
      {/* Subtle deep crimson background ambient glow */}
      <div className="boot-intro-ambient-glow" aria-hidden="true" />

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
        {/* 0.0s – 1.8s: AP Original Logo Asset Reveal & Shimmer */}
        <div className={`boot-intro-logo-wrapper ${isShimmering ? 'is-shimmering' : ''}`}>
          <img
            src="/brand/ap-transparent.png"
            alt="AP — Ayush Prakash Official Brand Monogram"
            width={165}
            height={105}
            className="boot-intro-logo-img"
          />
          <div className="boot-intro-light-sweep" aria-hidden="true" />
        </div>

        {/* 1.8s – 2.8s: Founder Identity & Tagline */}
        <div
          className={`boot-intro-identity-wrapper ${showIdentity ? 'is-visible' : ''}`}
          aria-hidden={!showIdentity}
        >
          <h1 className="boot-intro-founder-name">
            <span className="boot-intro-name-ayush">AYUSH</span>
            <span className="boot-intro-name-prakash">PRAKASH</span>
          </h1>

          <div className="boot-intro-tagline">
            <span className="boot-intro-tagline-heading">BUSINESS. SYSTEMS.</span>
            <span className="boot-intro-tagline-sub">Intelligence &amp; Innovation.</span>
          </div>
        </div>

        {/* 2.8s – 3.6s: Digital Initialization & Progress Indicator */}
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
