import React, { useState } from 'react';
import { Mail, Github, Linkedin, Copy, Check, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { cmsService } from '../../services/cmsService';
import { ProfileData } from '../../types/cms';
import { BorderGlow, SpecularButton } from '../reactbits';

interface EditorialContactProps {
  profile: ProfileData;
}

export const EditorialContact: React.FC<EditorialContactProps> = ({ profile }) => {
  const [copied, setCopied] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hpWebsite, setHpWebsite] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    subject: 'Operations & Strategy Inquiry',
    message: '',
  });

  const copyEmail = () => {
    navigator.clipboard.writeText(profile.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const name = formData.name.trim();
    const email = formData.email.trim();
    const message = formData.message.trim();

    if (!name || name.length < 2) {
      setSubmitError('Please enter your name (at least 2 characters).');
      return;
    }
    if (!email || !email.includes('@')) {
      setSubmitError('Please enter a valid email address.');
      return;
    }
    if (!message || message.length < 10) {
      setSubmitError('Please enter a message with at least 10 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await cmsService.submitContactMessage({
        name,
        email,
        organization: formData.organization.trim(),
        subject: formData.subject.trim(),
        message,
        hp_website: hpWebsite,
      });

      setFormSubmitted(true);
      setSubmitError(null);
      setFormData({
        name: '',
        email: '',
        organization: '',
        subject: 'Operations & Strategy Inquiry',
        message: '',
      });
      setHpWebsite('');
      setTimeout(() => setFormSubmitted(false), 8000);
    } catch (err: any) {
      console.error('Contact submit error:', err);
      setSubmitError(
        "We couldn't submit your enquiry right now. Please try again shortly."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      style={{
        padding: 'clamp(56px, 6vw, 84px) 0',
        backgroundColor: 'var(--bg-section)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div
        className="container"
        style={{
          maxWidth: 'min(94%, 1280px)',
          margin: '0 auto',
          padding: '0 clamp(16px, 3vw, 32px)',
        }}
      >
        {/* Editorial Eyebrow */}
        <div style={{ marginBottom: '18px' }}>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(12px, 0.95vw, 13.5px)',
              color: '#D4D7DC',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            CONTACT &bull; LET&apos;S CONNECT
          </span>
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 4.4vw, 56px)',
            fontWeight: 600,
            lineHeight: 1.12,
            letterSpacing: '-0.02em',
            color: '#FFFFFF',
            maxWidth: '920px',
            marginBottom: '36px',
            overflowWrap: 'break-word',
          }}
        >
          Let&apos;s start a conversation around supply chain transformation, systems execution, or strategic product roles.
        </h2>

        <div className="contact-grid-responsive">
          {/* Column 1: Direct Coordinates */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <BorderGlow borderRadius="16px" glowRadius={320} glowIntensity={0.32} glowColor="#D9DDE3">
              <div
                className="glass-card"
                style={{
                  padding: 'clamp(20px, 4vw, 36px)',
                  borderRadius: '16px',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--text-muted)',
                    marginBottom: '10px',
                  }}
                >
                  Direct Email
                </div>

                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '20px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '20px',
                    wordBreak: 'break-all',
                  }}
                >
                  {profile.email}
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <SpecularButton
                    href={`mailto:${profile.email}`}
                    size="sm"
                    variant="primary"
                    icon={<Mail size={13} />}
                    iconPosition="left"
                  >
                    Send Email
                  </SpecularButton>

                  <SpecularButton
                    onClick={copyEmail}
                    size="sm"
                    variant="secondary"
                    icon={copied ? <Check size={13} color="var(--accent-emerald)" /> : <Copy size={13} />}
                    iconPosition="left"
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </SpecularButton>
                </div>
              </div>
            </BorderGlow>

            {/* Social Network Links */}
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                padding: '32px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--text-muted)',
                  marginBottom: '16px',
                }}
              >
                Verified Professional Networks
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                      fontFamily: 'var(--font-body)',
                      fontSize: '14px',
                      transition: 'color 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  >
                    <Linkedin size={16} />
                    <span>LinkedIn Profile &bull; Ayush Prakash</span>
                  </a>
                )}

                {profile.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                      fontFamily: 'var(--font-body)',
                      fontSize: '14px',
                      transition: 'color 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  >
                    <Github size={16} />
                    <span>GitHub Repositories &bull; Ayushprakash21</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Column 2: Minimal Editorial Contact Form */}
          <BorderGlow borderRadius="16px" glowRadius={340} glowIntensity={0.32} glowColor="#D9DDE3">
            <div
              className="glass-card"
              style={{
                padding: 'clamp(20px, 4vw, 36px)',
                borderRadius: '16px',
                height: '100%',
              }}
            >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '20px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '8px',
              }}
            >
              Send an Inquiry
            </div>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: 'var(--text-muted)',
                marginBottom: '28px',
              }}
            >
              Messages route directly to my private administrative inbox.
            </p>

            {formSubmitted ? (
              <div
                style={{
                  padding: '24px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(76, 168, 130, 0.12)',
                  border: '1px solid rgba(76, 168, 130, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <CheckCircle2 size={22} color="var(--accent-emerald)" />
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Enquiry Submitted Successfully
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
                    Your enquiry has been submitted successfully. Thank you for reaching out.
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {submitError && (
                  <div
                    role="alert"
                    style={{
                      padding: '12px 16px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(229, 46, 66, 0.12)',
                      border: '1px solid rgba(229, 46, 66, 0.35)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                    }}
                  >
                    <AlertCircle size={18} color="#E52E42" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#FCA5A5', lineHeight: 1.5 }}>
                      {submitError}
                    </div>
                  </div>
                )}

                {/* Honeypot field for bot deterrence */}
                <div style={{ display: 'none', position: 'absolute', left: '-9999px' }} aria-hidden="true">
                  <label htmlFor="hp_website">Leave empty</label>
                  <input
                    type="text"
                    id="hp_website"
                    name="hp_website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={hpWebsite}
                    onChange={(e) => setHpWebsite(e.target.value)}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-body)',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      marginBottom: '8px',
                    }}
                  >
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => {
                      if (submitError) setSubmitError(null);
                      setFormData({ ...formData, name: e.target.value });
                    }}
                    placeholder="e.g. Sarah Jenkins"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-body)',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      marginBottom: '8px',
                    }}
                  >
                    Your Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => {
                      if (submitError) setSubmitError(null);
                      setFormData({ ...formData, email: e.target.value });
                    }}
                    placeholder="sarah@organization.com"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-body)',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      marginBottom: '8px',
                    }}
                  >
                    Organization / Company
                  </label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="Organization name (optional)"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-body)',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      marginBottom: '8px',
                    }}
                  >
                    Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => {
                      if (submitError) setSubmitError(null);
                      setFormData({ ...formData, message: e.target.value });
                    }}
                    placeholder="Describe your inquiry, proposal, or context..."
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '14px',
                      resize: 'vertical',
                      outline: 'none',
                    }}
                  />
                </div>

                <SpecularButton
                  type="submit"
                  disabled={submitting}
                  variant="primary"
                  size="md"
                  style={{ width: '100%', marginTop: '6px' }}
                  icon={<Send size={14} />}
                  iconPosition="right"
                >
                  {submitting ? 'Transmitting...' : 'Send Message'}
                </SpecularButton>
              </form>
            )}
          </div>
        </BorderGlow>
        </div>
      </div>
    </section>
  );
};
