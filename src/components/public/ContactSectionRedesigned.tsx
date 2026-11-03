import React, { useState } from 'react';
import { Mail, Github, Linkedin, Copy, Check, Send, CheckCircle2 } from 'lucide-react';
import { cmsService } from '../../services/cmsService';
import { ProfileData } from '../../types/cms';

interface ContactSectionProps {
  profile: ProfileData;
}

export const ContactSectionRedesigned: React.FC<ContactSectionProps> = ({ profile }) => {
  const [copied, setCopied] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    subject: 'Strategic Operations / Product Inquiry',
    message: '',
  });

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profile.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setSubmitting(true);
    try {
      await cmsService.submitContactMessage({
        name: formData.name,
        email: formData.email,
        organization: formData.organization,
        subject: formData.subject,
        message: formData.message,
      });

      setFormSubmitted(true);
      setFormData({
        name: '',
        email: '',
        organization: '',
        subject: 'Strategic Operations / Product Inquiry',
        message: '',
      });

      setTimeout(() => setFormSubmitted(false), 5000);
    } catch (err) {
      console.error('Contact submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="section-wrapper" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        <div style={{ maxWidth: '840px', marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div className="pill-status">
              <span className="pill-dot pill-dot-cyan"></span>
              <span style={{ color: 'var(--accent-primary)' }}>COMMUNICATIONS RELAY // DISPATCH</span>
            </div>
            <span className="type-metadata" style={{ color: 'var(--text-muted)' }}>
              DIRECT CMS INGESTION
            </span>
          </div>

          <h2 className="type-section-heading" style={{ marginBottom: '16px' }}>
            Initiate Contact
          </h2>

          <p className="type-body" style={{ color: 'var(--text-secondary)', fontSize: '17px' }}>
            Available for strategic operations leadership, supply chain consulting, and discussions on applied AI architecture.
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
                DIRECT ELECTRONIC MAIL
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
                {profile.email}
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
                NETWORKS & REPOSITORIES
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <a
                  href={profile.githubUrl}
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
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>GitHub Repositories</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                    @Ayushprakash21
                  </span>
                </a>

                <a
                  href={profile.linkedinUrl}
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
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                    /in/ayushprakash
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Dispatch Form */}
          <div className="card-base" style={{ padding: '28px', backgroundColor: 'var(--bg-card)' }}>
            <div className="type-metadata" style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
              TRANSMIT INQUIRY DIRECT TO CMS INBOX
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
                <CheckCircle2 size={32} color="var(--accent-success)" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Dispatch Delivered & Stored
                </h4>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Your message has been safely logged in the administrator inbox. Response SLA: &lt; 24h.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
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
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    EMAIL ADDRESS
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
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    ORGANIZATION / AFFILIATION
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Logistics Innovation Partners"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
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
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    MESSAGE
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Inquiry details regarding operations, systems architecture, or product advisory..."
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
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                  style={{ width: '100%', padding: '12px 18px', fontSize: '14px', marginTop: '4px' }}
                >
                  <Send size={15} />
                  <span>{submitting ? 'Transmitting...' : 'Send Message to CMS'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
