import React from 'react';
import { ArrowUp, Linkedin, Github, Mail } from 'lucide-react';
import { ApMonogram } from './brand/ApMonogram';

interface FooterProps {
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '70px 0 45px',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div className="container" style={{ maxWidth: '1160px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '32px',
            paddingBottom: '40px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          {/* Brand Presentation: AP Monogram + Identity + Positioning */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <ApMonogram size={42} withGlow />
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '18px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: 'var(--text-primary)',
                }}
              >
                AYUSH PRAKASH
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  marginTop: '4px',
                  letterSpacing: '0.02em',
                }}
              >
                Business. Systems. Intelligence &amp; Innovation.
              </div>
            </div>
          </div>

          {/* Social Links & Back to Top */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <a
              href="https://www.linkedin.com/in/ayushprakash"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-editorial-pill"
              style={{ padding: '8px 16px', fontSize: '12px' }}
            >
              <Linkedin size={13} />
              <span>LinkedIn</span>
            </a>

            <a
              href="https://github.com/Ayushprakash21"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-editorial-pill"
              style={{ padding: '8px 16px', fontSize: '12px' }}
            >
              <Github size={13} />
              <span>GitHub</span>
            </a>

            <a
              href="mailto:ayushprakash0021@gmail.com"
              className="btn-editorial-pill"
              style={{ padding: '8px 16px', fontSize: '12px' }}
            >
              <Mail size={13} />
              <span>Email</span>
            </a>

            <button
              onClick={scrollToTop}
              className="btn-editorial-pill"
              style={{ padding: '8px 18px', fontSize: '12px' }}
            >
              <span>Back to Top</span>
              <ArrowUp size={12} />
            </button>
          </div>
        </div>

        <div
          style={{
            paddingTop: '28px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--text-muted)',
            }}
          >
            &copy; {new Date().getFullYear()} Ayush Prakash. Official Brand Identity &bull; Black Luxury Glassmorphism.
          </div>

          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: 'var(--text-muted)',
              letterSpacing: '0.05em',
            }}
          >
            Bengaluru, India &bull; Global Operations
          </div>
        </div>
      </div>
    </footer>
  );
};
