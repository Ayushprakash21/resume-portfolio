import React, { useRef, useState, useEffect } from 'react';

interface SpecularButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  href?: string;
  target?: string;
  rel?: string;
  download?: boolean | string;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'primary' | 'secondary' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
}

/**
 * React Bits - Specular Button Component
 * Reference: https://reactbits.dev/components/specular-button
 * 
 * Premium glassmorphic button with cursor-following specular light reflection.
 * Uses high-performance CSS custom properties (no re-renders on move).
 * Accessible, tactile, and responsive.
 */
export const SpecularButton: React.FC<SpecularButtonProps> = ({
  children,
  onClick,
  href,
  target,
  rel,
  download,
  className = '',
  style = {},
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  disabled = false,
  type = 'button',
  ariaLabel,
}) => {
  const buttonRef = useRef<HTMLElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice(
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isTouchDevice || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    buttonRef.current.style.setProperty('--shine-x', `${x}px`);
    buttonRef.current.style.setProperty('--shine-y', `${y}px`);
    buttonRef.current.style.setProperty('--shine-opacity', '1');
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (buttonRef.current) {
      buttonRef.current.style.setProperty('--shine-opacity', '1');
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (buttonRef.current) {
      buttonRef.current.style.setProperty('--shine-opacity', '0');
    }
  };

  // Dimensions & Typography sizing
  const sizeStyles = {
    sm: {
      padding: '8px 16px',
      fontSize: '12px',
      borderRadius: '9999px',
      gap: '6px',
      minHeight: '36px',
    },
    md: {
      padding: '12px 24px',
      fontSize: '13px',
      borderRadius: '9999px',
      gap: '8px',
      minHeight: '44px',
    },
    lg: {
      padding: '14px 28px',
      fontSize: '14px',
      borderRadius: '9999px',
      gap: '10px',
      minHeight: '48px',
    },
  }[size];

  // Base background & border variants
  const variantStyles = {
    primary: {
      background: 'linear-gradient(135deg, rgba(28, 28, 34, 0.85) 0%, rgba(14, 14, 18, 0.95) 100%)',
      border: '1px solid rgba(217, 221, 227, 0.22)',
      color: '#FFFFFF',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
    },
    secondary: {
      background: 'rgba(18, 18, 22, 0.65)',
      border: '1px solid rgba(217, 221, 227, 0.12)',
      color: 'var(--text-secondary)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
    },
    glass: {
      background: 'rgba(255, 255, 255, 0.04)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      color: 'var(--text-primary)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
    },
  }[variant];

  const commonStyles: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    overflow: 'hidden',
    userSelect: 'none',
    fontFamily: 'var(--font-body)',
    fontWeight: 500,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    textDecoration: 'none',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s ease, border-color 0.22s ease',
    transform: isHovered && !disabled ? 'translateY(-1.5px)' : 'translateY(0)',
    ...sizeStyles,
    ...variantStyles,
    ...style,
  };

  const innerContent = (
    <>
      {/* Specular Highlight Overlay (Tracks Pointer) */}
      <span
        className="specular-highlight-layer"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          borderRadius: 'inherit',
          opacity: 'var(--shine-opacity, 0)',
          transition: 'opacity 0.28s ease',
          background: isTouchDevice
            ? 'radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.18) 0%, transparent 70%)'
            : 'radial-gradient(circle 120px at var(--shine-x, 50%) var(--shine-y, 50%), rgba(255, 255, 255, 0.38) 0%, rgba(217, 221, 227, 0.14) 40%, transparent 70%)',
          mixBlendMode: 'screen',
        }}
        aria-hidden="true"
      />

      {/* Top Edge Metallic Rim Light */}
      <span
        style={{
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent)',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />

      {/* Button Content */}
      <span
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'inline-flex',
          alignItems: 'center',
          gap: sizeStyles.gap,
        }}
      >
        {icon && iconPosition === 'left' && <span style={{ display: 'inline-flex' }}>{icon}</span>}
        <span>{children}</span>
        {icon && iconPosition === 'right' && <span style={{ display: 'inline-flex' }}>{icon}</span>}
      </span>
    </>
  );

  if (href) {
    return (
      <a
        ref={buttonRef as React.RefObject<HTMLAnchorElement>}
        href={href}
        target={target}
        rel={rel || (target === '_blank' ? 'noopener noreferrer' : undefined)}
        download={download}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`specular-button ${className}`}
        style={commonStyles}
        aria-label={ariaLabel}
      >
        {innerContent}
      </a>
    );
  }

  return (
    <button
      ref={buttonRef as React.RefObject<HTMLButtonElement>}
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`specular-button ${className}`}
      style={commonStyles}
      aria-label={ariaLabel}
    >
      {innerContent}
    </button>
  );
};
