import React, { useRef, useState, useCallback } from 'react';

interface HoloCardProps {
  children?: React.ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
  maxTilt?: number;
  hoverScale?: number;
  foilIntensity?: number;
  glareIntensity?: number;
  edgeSparkle?: number;
  style?: React.CSSProperties;
}

export const HoloCard: React.FC<HoloCardProps> = ({
  children,
  imageSrc,
  imageAlt = 'Founder Portrait',
  className = '',
  maxTilt = 6,
  hoverScale = 1.015,
  foilIntensity = 0.28,
  glareIntensity = 0.25,
  edgeSparkle = 0.2,
  style = {},
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState({ x: 50, y: 50 });
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      // Calculate tilt angles (constrained to maxTilt)
      const rotateX = ((y - 50) / 50) * -maxTilt;
      const rotateY = ((x - 50) / 50) * maxTilt;

      setCoords({ x, y });
      setTilt({ rotateX, rotateY });
    },
    [maxTilt]
  );

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0 });
    setCoords({ x: 50, y: 50 });
  };

  return (
    <div
      style={{
        perspective: '1200px',
        display: 'inline-block',
        width: '100%',
        ...style,
      }}
      className={className}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          position: 'relative',
          width: '100%',
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: '#09090B',
          border: '1px solid rgba(217, 221, 227, 0.14)',
          transform: isHovered
            ? `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale3d(${hoverScale}, ${hoverScale}, ${hoverScale})`
            : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          transformStyle: 'preserve-3d',
          transition: isHovered
            ? 'transform 0.1s ease-out, box-shadow 0.2s ease-out'
            : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.5s ease',
          boxShadow: isHovered
            ? `${tilt.rotateY * -1.8}px ${tilt.rotateX * 1.8}px 32px rgba(0, 0, 0, 0.65), 0 0 24px rgba(217, 221, 227, 0.08)`
            : '0 12px 30px rgba(0, 0, 0, 0.5)',
          willChange: 'transform',
        }}
      >
        {/* Base Image if provided */}
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={imageAlt}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              aspectRatio: '4 / 5',
              objectFit: 'cover',
              filter: 'grayscale(25%) contrast(106%) brightness(96%)',
            }}
          />
        ) : null}

        {/* Children if custom content */}
        {children}

        {/* Silver Foil Layer (Smooth holographic sheen) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            mixBlendMode: 'overlay',
            opacity: isHovered ? foilIntensity : 0,
            background: `radial-gradient(circle 380px at ${coords.x}% ${coords.y}%, rgba(242, 242, 244, 0.6) 0%, rgba(217, 221, 227, 0.25) 35%, transparent 70%)`,
            transition: 'opacity 0.25s ease',
          }}
          aria-hidden="true"
        />

        {/* Edge Sparkle & Specular Glare Layer */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            mixBlendMode: 'color-dodge',
            opacity: isHovered ? glareIntensity : 0,
            background: `linear-gradient(${coords.x * 2.5}deg, transparent 20%, rgba(255, 255, 255, ${edgeSparkle}) 48%, rgba(217, 221, 227, 0.4) 52%, transparent 75%)`,
            transition: 'opacity 0.25s ease',
          }}
          aria-hidden="true"
        />

        {/* Subtle Diagonal Shimmer */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            opacity: isHovered ? 0.15 : 0,
            background: `radial-gradient(ellipse at ${coords.x}% ${coords.y}%, rgba(255, 255, 255, 0.3) 0%, transparent 60%)`,
            transition: 'opacity 0.25s ease',
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
};
