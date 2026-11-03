import React from 'react';

export interface ApMonogramProps {
  width?: number;
  size?: number; // Backwards compatibility: treated as height if width is omitted
  className?: string;
  variant?: 'transparent' | 'primary' | 'monochrome';
  withGlow?: boolean;
  alt?: string;
  style?: React.CSSProperties;
}

export const ApMonogram: React.FC<ApMonogramProps> = ({
  width,
  size,
  className = '',
  variant = 'transparent',
  withGlow = false,
  alt = 'AP — Ayush Prakash Official Brand Monogram',
  style = {},
}) => {
  const src =
    variant === 'primary'
      ? '/brand/ap-primary.png'
      : variant === 'monochrome'
      ? '/brand/ap-monochrome.png'
      : '/brand/ap-transparent.png';

  // Original Monogram Aspect Ratio: 432px wide / 276px high (~1.5652)
  // If width is specified, compute proportional height
  const targetWidth = width ? Math.round(width) : size ? Math.round(size * 1.5652) : 72;
  const targetHeight = Math.round(targetWidth / 1.5652);

  return (
    <span
      className={`ap-monogram-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        flexShrink: 0,
        lineHeight: 1,
        ...style,
      }}
    >
      <img
        src={src}
        alt={alt}
        width={targetWidth}
        height={targetHeight}
        className="ap-monogram-img"
        style={{
          width: `${targetWidth}px`,
          height: 'auto',
          maxHeight: `${targetHeight}px`,
          objectFit: 'contain',
          flexShrink: 0,
          display: 'block',
          filter: withGlow
            ? 'drop-shadow(0 0 16px rgba(255, 255, 255, 0.38)) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.85))'
            : 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.65))',
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease',
          verticalAlign: 'middle',
          userSelect: 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.04)';
          e.currentTarget.style.filter =
            'drop-shadow(0 0 22px rgba(255, 255, 255, 0.58)) drop-shadow(0 6px 16px rgba(0, 0, 0, 0.95))';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.filter = withGlow
            ? 'drop-shadow(0 0 16px rgba(255, 255, 255, 0.38)) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.85))'
            : 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.65))';
        }}
      />
    </span>
  );
};
