import React, { useRef, useState, useEffect } from 'react';

interface BorderGlowProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  borderRadius?: string;
  borderWidth?: number;
  glowColor?: string;
  glowRadius?: number;
  glowIntensity?: number;
  showHoverEffect?: boolean;
}

/**
 * React Bits - Border Glow Component
 * Reference: https://reactbits.dev/components/border-glow
 * 
 * Provides an elegant cursor-reactive metallic border glow for cards
 * using high-performance CSS custom properties (no re-renders).
 * Monochromatic silver/graphite palette with touch/reduced-motion fallback.
 */
export const BorderGlow: React.FC<BorderGlowProps> = ({
  children,
  className = '',
  style = {},
  borderRadius = '16px',
  borderWidth = 1,
  glowColor = '#D9DDE3',
  glowRadius = 320,
  glowIntensity = 0.38,
  showHoverEffect = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice(
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice || !showHoverEffect || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    containerRef.current.style.setProperty('--mouse-x', `${x}px`);
    containerRef.current.style.setProperty('--mouse-y', `${y}px`);
    containerRef.current.style.setProperty('--glow-opacity', '1');
  };

  const handleMouseLeave = () => {
    if (containerRef.current) {
      containerRef.current.style.setProperty('--glow-opacity', '0');
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`border-glow-wrapper ${className}`}
      style={{
        position: 'relative',
        borderRadius,
        padding: `${borderWidth}px`,
        overflow: 'hidden',
        background: 'rgba(255, 255, 255, 0.08)',
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
        ...style,
      }}
    >
      {/* Dynamic Cursor-Tracking Glow Layer (Desktop only) */}
      {!isTouchDevice && (
        <div
          className="border-glow-halo"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 0,
            borderRadius: 'inherit',
            opacity: 'var(--glow-opacity, 0)',
            transition: 'opacity 0.35s ease',
            background: `radial-gradient(circle ${glowRadius}px at var(--mouse-x, -999px) var(--mouse-y, -999px), rgba(217, 221, 227, ${glowIntensity}) 0%, rgba(119, 127, 138, ${glowIntensity * 0.5}) 35%, rgba(52, 58, 67, 0.15) 60%, transparent 80%)`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Subtle Static Edge Baseline */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          borderRadius: 'inherit',
          border: '1px solid rgba(217, 221, 227, 0.12)',
        }}
        aria-hidden="true"
      />

      {/* Card Content Container */}
      <div
        className="border-glow-content"
        style={{
          position: 'relative',
          zIndex: 1,
          borderRadius: `calc(${borderRadius} - ${borderWidth}px)`,
          height: '100%',
          width: '100%',
        }}
      >
        {children}
      </div>
    </div>
  );
};
