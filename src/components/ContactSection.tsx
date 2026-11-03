import React, { useState } from 'react';
import { Mail, Github, Linkedin, Copy, Check, Send, Terminal, ArrowUpRight } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Project Inquiry / Architectural Collaboration',
    message: '',
  });

  const email = 'ayushprakash0021@gmail.com';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({
        name: '',
        email: '',
        subject: 'Project Inquiry / Architectural Collaboration',
        message: '',
      });
    }, 4000);
  };

  return (
    <section id="contact" className="section-wrapper" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ maxWidth: '840px', marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div className="pill-status">
              <span className="pill-dot pill-dot-cyan"></span>
              <span style={{ color: 'var(--text-secondary)' }}>COMMUNICATIONS CHANNEL // INBOX</span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--text-muted)',
              }}
            >
              DIRECT CONTACT
            </span>
          </div>

          <h2 className="type-section-heading" style={{ marginBottom: '16px' }}>
            Initiate Contact
          </h2>

          <p className="type-body" style={{ color: 'var(--text-secondary)', fontSize: '17px' }}>
            Available for executive consulting, advisory, founding engineering leadership,
            and discussions on autonomous AI architectures or enterprise platform engineering.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px',
          }}
        >
          {/* Direct channels & Quick Connect */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card-base" style={{ padding: '28px', backgroundColor: 'var(--bg-card)' }}>
              <div className="type-metadata" style={{ color: 'var(--accent-primary)', marginBottom: '8px' }}>
                PRIMARY ELECTRONIC MAIL
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '20px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '16px',
                  wordBreak: 'break-all',
                }}
              >
                {email}
              </div>

              <button
                onClick={copyToClipboard}
                className="btn-primary"
                style={{ width: '100%', padding: '10px 16px', fontSize: '13px' }}
              >
                {copied ? (
                  <>
                    <Check size={14} color="#42D6A4" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy Email Address</span>
                  </>
                )}
              </button>
            </div>

            {/* Social & Profiles */}
            <div className="card-base" style={{ padding: '28px', backgroundColor: 'var(--bg-card)' }}>
              <div className="type-metadata" style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
                VERIFIED CODE & PROFILES
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <a
                  href="https://github.com/Ayushprakash21"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    transition: 'border-color var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Github size={18} color="var(--accent-primary)" />
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>GitHub Profile</span>
                  </div>
                  <ArrowUpRight size={14} color="var(--text-muted)" />
                </a>

                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    transition: 'border-color var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Linkedin size={18} color="var(--accent-secondary)" />
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>LinkedIn Network</span>
                  </div>
                  <ArrowUpRight size={14} color="var(--text-muted)" />
                </a>
              </div>
            </div>
          </div>

          {/* Secure Message Transmission Box */}
          <div className="card-base" style={{ padding: '28px', backgroundColor: 'var(--bg-card)' }}>
            <div className="type-metadata" style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
              TRANSMIT DIRECT DISPATCH
            </div>

            {formSubmitted ? (
              <div
                style={{
                  padding: '32px 20px',
                  textAlign: 'center',
                  background: 'rgba(66, 214, 164, 0.08)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(66, 214, 164, 0.3)',
                }}
              >
                <Check size={32} color="var(--accent-success)" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Dispatch Delivered
                </h4>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Thank you. Your inquiry packet has been logged. Response SLA: &lt; 24h.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      marginBottom: '6px',
                    }}
                  >
                    YOUR NAME / IDENTIFIER
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Elena Rostova"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--accent-primary)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      marginBottom: '6px',
                    }}
                  >
                    WORK EMAIL / TRANSMISSION ENDPOINT
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--accent-primary)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      marginBottom: '6px',
                    }}
                  >
                    DISPATCH MESSAGE
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Details regarding your platform requirements or architectural opportunity..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--accent-primary)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', padding: '12px 18px', fontSize: '14px', marginTop: '6px' }}
                >
                  <Send size={15} />
                  <span>Send Transmit Signal</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
