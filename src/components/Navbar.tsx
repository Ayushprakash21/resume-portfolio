import React, { useState, useEffect } from 'react';
import { Terminal, Menu, X, ArrowUpRight, Cpu } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Overview', href: '#overview' },
    { label: 'ApplyVise AI', href: '#applywise' },
    { label: 'Orion-9', href: '#orion9' },
    { label: 'Architecture', href: '#architecture' },
    { label: 'Certifications', href: '#certifications' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: 'all var(--transition-normal)',
        backgroundColor: scrolled ? 'rgba(7, 9, 13, 0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border-subtle)' : '1px solid transparent',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '72px',
        }}
      >
        {/* Brand / Logo */}
        <a
          href="#overview"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, rgba(69, 214, 255, 0.2) 0%, rgba(119, 123, 255, 0.1) 100%)',
              border: '1px solid rgba(69, 214, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
            }}
          >
            <Cpu size={18} />
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '17px',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                lineHeight: 1.1,
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
                textTransform: 'uppercase',
              }}
            >
              THE INTELLIGENCE UNIVERSE
            </div>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '32px',
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="type-nav"
              style={{
                color: 'var(--text-secondary)',
                position: 'relative',
                padding: '6px 0',
                transition: 'color var(--transition-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right side Status Indicator & CTA */}
        <div
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '16px',
          }}
          className="desktop-actions"
        >
          <div className="pill-status">
            <span className="pill-dot pill-dot-cyan"></span>
            <span style={{ color: 'var(--text-secondary)' }}>ONLINE // ARCHITECT</span>
          </div>

          <a href="#contact" className="btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
            <span>Connect</span>
            <ArrowUpRight size={14} />
          </a>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px',
            color: 'var(--text-primary)',
            cursor: 'pointer',
          }}
          className="mobile-toggle"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '20px 24px 28px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="pill-status" style={{ alignSelf: 'flex-start', marginBottom: '8px' }}>
              <span className="pill-dot pill-dot-cyan"></span>
              <span style={{ color: 'var(--text-secondary)' }}>ONLINE // ARCHITECT</span>
            </div>
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="type-nav"
                style={{
                  color: 'var(--text-primary)',
                  padding: '8px 0',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                }}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-primary"
              style={{ marginTop: '12px' }}
            >
              <span>Connect with Ayush</span>
              <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 900px) {
          .desktop-nav {
            display: flex !important;
          }
          .desktop-actions {
            display: flex !important;
          }
          .mobile-toggle {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};
