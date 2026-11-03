import React from 'react';
import { Cpu, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '48px 0 36px',
        position: 'relative',
        zIndex: 2,
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
            marginBottom: '32px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(69, 214, 255, 0.12)',
                border: '1px solid rgba(69, 214, 255, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)',
              }}
            >
              <Cpu size={15} />
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                }}
              >
                AYUSH PRAKASH
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.08em',
                  color: 'var(--text-muted)',
                }}
              >
                THE INTELLIGENCE UNIVERSE • ARCHITECTURAL LOG
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <a
              href="#overview"
              className="type-nav"
              style={{ color: 'var(--text-muted)', transition: 'color var(--transition-fast)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              Overview
            </a>
            <a
              href="#applywise"
              className="type-nav"
              style={{ color: 'var(--text-muted)', transition: 'color var(--transition-fast)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#C084FC')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              ApplyVise AI
            </a>
            <a
              href="#orion9"
              className="type-nav"
              style={{ color: 'var(--text-muted)', transition: 'color var(--transition-fast)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-success)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              Orion-9
            </a>
            <a
              href="#architecture"
              className="type-nav"
              style={{ color: 'var(--text-muted)', transition: 'color var(--transition-fast)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              Stack
            </a>
            <a
              href="#contact"
              className="type-nav"
              style={{ color: 'var(--text-muted)', transition: 'color var(--transition-fast)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              Contact
            </a>

            <button
              onClick={scrollToTop}
              className="btn-secondary"
              aria-label="Scroll to top"
              style={{ padding: '8px 12px' }}
            >
              <ArrowUp size={14} />
            </button>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '24px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            © {new Date().getFullYear()} Ayush Prakash. Built with Design System Lock: The Intelligence Universe.
          </div>
          <div>
            DESIGNED WITH PRECISION • ZERO UNNECESSARY GRADIENTS
          </div>
        </div>
      </div>
    </footer>
  );
};
