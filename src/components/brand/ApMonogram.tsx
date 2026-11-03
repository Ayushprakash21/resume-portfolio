import React from 'react';

interface ApMonogramProps {
  size?: number;
  className?: string;
  variant?: 'transparent' | 'primary' | 'monochrome';
  withGlow?: boolean;
  alt?: string;
  style?: React.CSSProperties;
}

export const ApMonogram: React.FC<ApMonogramProps> = ({
  size = 36,
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

  // Proportions: ~432 x 276 (aspect ratio ~ 1.565)
  const width = Math.round(size * 1.565);
  const height = size;

  return (
    <span
      className={`ap-monogram-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        lineHeight: 1,
        ...style,
      }}
    >
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          objectFit: 'contain',
          filter: withGlow
            ? 'drop-shadow(0 0 16px rgba(255, 255, 255, 0.32)) drop-shadow(0 2px 8px rgba(0,0,0,0.8))'
            : 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.6))',
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease',
          verticalAlign: 'middle',
          userSelect: 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.06)';
          e.currentTarget.style.filter =
            'drop-shadow(0 0 20px rgba(242, 242, 244, 0.55)) drop-shadow(0 4px 12px rgba(0,0,0,0.9))';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.filter = withGlow
            ? 'drop-shadow(0 0 16px rgba(255, 255, 255, 0.32)) drop-shadow(0 2px 8px rgba(0,0,0,0.8))'
            : 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.6))';
        }}
      />
    </span>
  );
};
