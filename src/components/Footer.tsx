import React from 'react';
import { ArrowUp, Linkedin, Github, Mail } from 'lucide-react';
import { ApMonogram } from './brand/ApMonogram';
import { ProfileData } from '../types/cms';
import { SpecularButton } from './reactbits';

interface FooterProps {
  profile?: ProfileData;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ profile }) => {
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(14px, 3vw, 24px)', flexWrap: 'wrap' }}>
            <ApMonogram width={88} className="ap-footer-monogram" withGlow={true} />
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(18px, 2.4vw, 24px)',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  color: '#FFFFFF',
                  lineHeight: 1.1,
                }}
              >
                AYUSH PRAKASH
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(12px, 1.4vw, 14px)',
                  fontStyle: 'italic',
                  color: 'var(--accent-silver)',
                  marginTop: '5px',
                  letterSpacing: '0.02em',
                }}
              >
                Business. Systems. Intelligence &amp; Innovation.
              </div>
            </div>
          </div>

          {/* Social Links & Back to Top */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <SpecularButton
              href="https://www.linkedin.com/in/ayushprakash"
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
              variant="secondary"
              icon={<Linkedin size={13} />}
              iconPosition="left"
            >
              LinkedIn
            </SpecularButton>

            <SpecularButton
              href="https://github.com/Ayushprakash21"
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
              variant="secondary"
              icon={<Github size={13} />}
              iconPosition="left"
            >
              GitHub
            </SpecularButton>

            <SpecularButton
              href="mailto:ayushprakash0021@gmail.com"
              size="sm"
              variant="secondary"
              icon={<Mail size={13} />}
              iconPosition="left"
            >
              Email
            </SpecularButton>

            <SpecularButton
              onClick={scrollToTop}
              size="sm"
              variant="primary"
              icon={<ArrowUp size={12} />}
              iconPosition="right"
            >
              Back to Top
            </SpecularButton>
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
            {profile?.location ? `${profile.location} \u2022 Global Operations` : 'Indore, Madhya Pradesh, India \u2022 Global Operations'}
          </div>
        </div>
      </div>
    </footer>
  );
};
