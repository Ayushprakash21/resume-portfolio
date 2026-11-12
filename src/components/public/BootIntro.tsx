import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import './BootIntro.css';

export const SESSION_STORAGE_KEY = 'ap_intro_seen_v1';
export const LEGACY_STORAGE_KEY = 'ap_boot_intro_played';
export const TOTAL_DURATION_MS = 7600;
export const FADE_OUT_START_MS = 7000;

export type IntroStage =
  | 'entrance'
  | 'video_play'
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
  const [videoError, setVideoError] = useState<boolean>(false);
  const [videoPlaying, setVideoPlaying] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
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

    // Pause video to free memory
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch {}
    }

    // Restore body scrolling
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }

    // Unmount after smooth fade transition
    setTimeout(() => {
      setIsMounted(false);
      if (onComplete) onComplete();
    }, 450);
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

    // Attempt video autoplay with playback speed of 1.3x for high-energy motion
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.3;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setVideoPlaying(true))
          .catch(() => {
            // If autoplay policy blocks video, fallback to poster/image seamlessly
            setVideoError(true);
          });
      }
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

    // Timeline Sequence (Coordinated with Video Playback at 1.3x):
    // 0.0s – 0.4s: 'entrance' (ambient dark emergence)
    // 0.4s – 3.0s: 'video_play' (video draws orbital contour ring and reveals chrome AP glyphs)
    const t1 = window.setTimeout(() => setStage('video_play'), 400);

    // 3.0s – 4.5s: 'name' (AYUSH PRAKASH reveal beneath the revealed AP logo)
    const t2 = window.setTimeout(() => setStage('name'), 3000);

    // 4.5s – 5.5s: 'tagline1' (BUSINESS. SYSTEMS. reveal)
    const t3 = window.setTimeout(() => setStage('tagline1'), 4500);

    // 5.5s – 6.4s: 'tagline2' (Intelligence & Innovation. reveal, synced with video star flare at ~7s video time)
    const t4 = window.setTimeout(() => setStage('tagline2'), 5500);

    // 6.4s – 7.0s: 'initialization' (sleek digital progress fill)
    const t5 = window.setTimeout(() => setStage('initialization'), 6400);

    // 7.0s – 7.6s: 'exit' (smooth fade transition revealing hero)
    const t6 = window.setTimeout(() => setStage('exit'), FADE_OUT_START_MS);

    // 7.6s: Complete & unmount
    const t7 = window.setTimeout(() => completeIntro(), TOTAL_DURATION_MS);

    timersRef.current = [t1, t2, t3, t4, t5, t6, t7];

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
        {/* Cinematic AP Logo Video Container (occupies exact original logo position) */}
        <div className="boot-intro-logo-wrapper">
          {/* Subtle backglow focused behind the logo video */}
          <div className="boot-intro-logo-backglow" aria-hidden="true" />

          {/* HTML5 Video Element with WebM + MP4 sources */}
          {!videoError ? (
            <video
              ref={videoRef}
              className={`boot-intro-logo-video ${videoPlaying ? 'is-playing' : ''}`}
              autoPlay
              muted
              playsInline
              preload="auto"
              poster="/brand/ap-logo-poster.jpg"
              onPlay={() => setVideoPlaying(true)}
              onError={() => setVideoError(true)}
              aria-label="AP — Ayush Prakash Official Brand Monogram Cinematic Reveal"
            >
              <source src="/brand/ap-logo-intro.webm" type="video/webm" />
              <source src="/brand/ap-logo-intro.mp4" type="video/mp4" />
              {/* Fallback image inside video element */}
              <img
                src="/brand/ap-transparent.png"
                alt="AP — Ayush Prakash Official Brand Monogram"
                className="boot-intro-logo-fallback"
                width={175}
                height={112}
              />
            </video>
          ) : (
            /* Fallback static AP logo if video playback is blocked or unavailable */
            <img
              src="/brand/ap-transparent.png"
              alt="AP — Ayush Prakash Official Brand Monogram"
              className="boot-intro-logo-fallback is-active"
              width={175}
              height={112}
            />
          )}
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
