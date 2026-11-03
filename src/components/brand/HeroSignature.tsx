import React, { useEffect, useState, useRef } from 'react';

interface HeroSignatureProps {
  reducedMotion?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * HERO ANIMATION ILLUMINATED SIGNATURE
 * 
 * Features the authentic handwritten "A. Prakash" signature with star flourish.
 * Renders with a progressive cinematic silver draw-on reveal sequence,
 * layered metallic silver illumination (#F5F6F8, #D5D9E0, #AEB8C8),
 * a subtle starburst sparkle on completion, ambient breathing glow,
 * and mouse-reactive parallax depth integrated into the 3D hero environment.
 */
export const HeroSignature: React.FC<HeroSignatureProps> = ({
  reducedMotion = false,
  className = '',
  style = {},
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [animationPhase, setAnimationPhase] = useState<'hidden' | 'drawing' | 'sparkle' | 'settled'>(
    reducedMotion ? 'settled' : 'hidden'
  );
  const [drawProgress, setDrawProgress] = useState(reducedMotion ? 100 : 0);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  // 1. Cinematic Draw-On Sequence
  useEffect(() => {
    if (reducedMotion) {
      setDrawProgress(100);
      setAnimationPhase('settled');
      return;
    }

    // Phase 1: Brief ambient pause before draw-on begins (0.6s)
    const startTimer = setTimeout(() => {
      setAnimationPhase('drawing');
      const startTime = performance.now();
      const duration = 2400; // 2.4s draw-on animation

      let frameId: number;
      const animateDraw = (now: number) => {
        const elapsed = now - startTime;
        const rawProgress = Math.min(1, elapsed / duration);
        // Custom easing: steady handwriting cadence
        const eased = rawProgress < 0.5
          ? 2 * rawProgress * rawProgress
          : -1 + (4 - 2 * rawProgress) * rawProgress;

        const progressPercent = Math.min(100, Math.max(0, eased * 100));
        setDrawProgress(progressPercent);

        if (rawProgress < 1) {
          frameId = requestAnimationFrame(animateDraw);
        } else {
          setDrawProgress(100);
          setAnimationPhase('sparkle');
          // Star sparkle flashes, then settles into ambient glow
          setTimeout(() => {
            setAnimationPhase('settled');
          }, 800);
        }
      };

      frameId = requestAnimationFrame(animateDraw);

      return () => cancelAnimationFrame(frameId);
    }, 600);

    return () => clearTimeout(startTimer);
  }, [reducedMotion]);

  // 2. Subtle 3D Parallax Movement (Desktop Only)
  useEffect(() => {
    if (reducedMotion) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let frameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      targetX = ((e.clientX - centerX) / centerX) * -12; // Inverted subtle float
      targetY = ((e.clientY - centerY) / centerY) * -8;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const lerpParallax = () => {
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;
      setParallax({ x: currentX, y: currentY });
      frameId = requestAnimationFrame(lerpParallax);
    };

    frameId = requestAnimationFrame(lerpParallax);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, [reducedMotion]);

  const isDrawn = drawProgress >= 100;

  return (
    <div
      ref={containerRef}
      className={`hero-signature-wrapper ${className}`}
      style={{
        position: 'absolute',
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 6, // In front of 3D canvas (zIndex: 1), behind header / nav (zIndex >= 20)
        transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)`,
        transition: 'transform 0.15s ease-out, opacity 0.5s ease',
        ...style,
      }}
      aria-hidden="true"
    >
      <div
        className="hero-signature-container"
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1024 / 419',
          filter: isDrawn
            ? 'drop-shadow(0 0 10px rgba(245, 246, 248, 0.40)) drop-shadow(0 0 22px rgba(174, 184, 200, 0.28))'
            : 'drop-shadow(0 0 6px rgba(245, 246, 248, 0.35))',
          transition: 'filter 0.6s ease',
        }}
      >
        {/* Base Handwritten Signature Artwork (Metallic Silver / Crisp White) */}
        <img
          src="/brand/signature-silver.png"
          alt="Ayush Prakash Handwritten Brand Signature"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
            // Progressive wipe reveal from left to right
            clipPath: `polygon(0% 0%, ${drawProgress}% 0%, ${drawProgress}% 100%, 0% 100%)`,
            WebkitClipPath: `polygon(0% 0%, ${drawProgress}% 0%, ${drawProgress}% 100%, 0% 100%)`,
            filter: 'brightness(108%) contrast(104%)',
            transition: reducedMotion ? 'none' : 'clip-path 0.05s linear',
          }}
        />

        {/* Dynamic Light Tracer Tip during Handwriting Draw-on */}
        {animationPhase === 'drawing' && drawProgress > 2 && drawProgress < 98 && (
          <div
            className="signature-tracer-light"
            style={{
              position: 'absolute',
              left: `${drawProgress}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '16px',
              height: '80%',
              background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.95) 0%, rgba(213, 217, 224, 0.6) 35%, transparent 75%)',
              filter: 'blur(3px)',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Starburst Sparkle at the Top-Right Star Flourish (coordinates: ~93% x, ~15% y) */}
        {(animationPhase === 'sparkle' || animationPhase === 'settled') && (
          <div
            className={`signature-star-sparkle ${animationPhase === 'sparkle' ? 'sparkle-burst' : 'sparkle-idle'}`}
            style={{
              position: 'absolute',
              right: '6.2%',
              top: '12.8%',
              width: '28px',
              height: '28px',
              transform: 'translate(50%, -50%)',
              pointerEvents: 'none',
            }}
          >
            {/* Multi-point silver star glow */}
            <div
              style={{
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(213, 217, 224, 0.7) 25%, transparent 70%)',
                filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.9))',
                borderRadius: '50%',
              }}
            />
          </div>
        )}

        {/* Ambient Silver Shimmer Wave (Occasional gentle metallic light sweep) */}
        {animationPhase === 'settled' && !reducedMotion && (
          <div
            className="signature-ambient-sheen"
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: 'linear-gradient(115deg, transparent 35%, rgba(255, 255, 255, 0.22) 50%, transparent 65%)',
              backgroundSize: '250% 100%',
              mixBlendMode: 'overlay',
              animation: 'signatureShimmer 14s ease-in-out infinite',
            }}
          />
        )}
      </div>
    </div>
  );
};
