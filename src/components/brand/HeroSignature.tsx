import React from 'react';

interface HeroSignatureProps {
  reducedMotion?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * HERO BRAND SIGNATURE — PERMANENT BOTTOM-RIGHT BRANDING
 * 
 * Features the authentic handwritten "Ayush Prakash" signature with star flourish.
 * Permanently visible from frame 0 with zero entrance or draw-on delays.
 * Layered with a subtle, permanent metallic silver illumination:
 * - Crisp signature strokes (#F5F6F8)
 * - Soft diffused backlight and radial glow (#C8D0DC)
 * - Restrained outer ambient illumination (#8793A5)
 * - Static star flourish glow at top-right
 */
export const HeroSignature: React.FC<HeroSignatureProps> = ({
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`hero-signature-wrapper ${className}`}
      style={{
        position: 'absolute',
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 6, // In front of 3D canvas (zIndex: 1), behind header / nav (zIndex >= 20)
        opacity: 1,
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
        }}
      >
        {/* 1. Diffused Outer Ambient Silver Light (#8793A5) */}
        <div
          className="signature-ambient-glow"
          style={{
            position: 'absolute',
            inset: '-14% -10%',
            background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(200, 208, 220, 0.20) 0%, rgba(135, 147, 165, 0.08) 50%, transparent 75%)',
            filter: 'blur(16px)',
            pointerEvents: 'none',
            borderRadius: '50%',
          }}
        />

        {/* 2. Soft Inner White/Silver Backlight behind Lettering (#C8D0DC & #F5F6F8) */}
        <div
          className="signature-inner-glow"
          style={{
            position: 'absolute',
            inset: '4% 6%',
            background: 'radial-gradient(ellipse 65% 50% at 48% 52%, rgba(245, 246, 248, 0.22) 0%, rgba(200, 208, 220, 0.12) 42%, transparent 70%)',
            filter: 'blur(8px)',
            pointerEvents: 'none',
          }}
        />

        {/* 3. Restrained Static Illumination around Star Flourish (~93.8% x, ~12.8% y) */}
        <div
          className="signature-star-glow"
          style={{
            position: 'absolute',
            right: '6.2%',
            top: '12.8%',
            width: '26px',
            height: '26px',
            transform: 'translate(50%, -50%)',
            background: 'radial-gradient(circle, rgba(245, 246, 248, 0.75) 0%, rgba(200, 208, 220, 0.35) 35%, transparent 70%)',
            filter: 'blur(3px)',
            pointerEvents: 'none',
            borderRadius: '50%',
          }}
        />

        {/* 4. Crisp Handwritten Signature Artwork (#F5F6F8 strokes with subtle silver depth) */}
        <img
          src="/brand/signature-silver.png"
          alt="Ayush Prakash Handwritten Brand Signature"
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
            filter: 'drop-shadow(0 0 6px rgba(245, 246, 248, 0.45)) drop-shadow(0 0 14px rgba(200, 208, 220, 0.28)) drop-shadow(0 0 24px rgba(135, 147, 165, 0.18)) brightness(106%) contrast(104%)',
          }}
        />
      </div>
    </div>
  );
};
