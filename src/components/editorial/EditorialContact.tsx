import React, { useState } from 'react';
import { Mail, Github, Linkedin, Copy, Check, Send, CheckCircle2 } from 'lucide-react';
import { cmsService } from '../../services/cmsService';
import { ProfileData } from '../../types/cms';

interface EditorialContactProps {
  profile: ProfileData;
}

export const EditorialContact: React.FC<EditorialContactProps> = ({ profile }) => {
  const [copied, setCopied] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    subject: 'Strategic Operations / Systems Inquiry',
    message: '',
  });

  const copyEmail = () => {
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
        subject: 'Strategic Operations / Systems Inquiry',
        message: '',
      });
      setTimeout(() => setFormSubmitted(false), 6000);
    } catch (err) {
      console.error('Contact submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      style={{
        padding: '120px 0',
        backgroundColor: '#07090D',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div className="container" style={{ maxWidth: '1160px' }}>
        {/* Eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#45D6FF', letterSpacing: '0.1em' }}>
            08 // DIRECT TRANSMISSION
          </span>
          <span style={{ height: '1px', width: '40px', backgroundColor: '#45D6FF', opacity: 0.4 }} />
        </div>

        <h2
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 'clamp(2.4rem, 5vw, 4.2rem)',
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            color: '#F5F7FA',
            maxWidth: '920px',
            marginBottom: '64px',
          }}
        >
          Initiate direct contact for operational leadership, supply chain advisory, or systems architecture.
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '48px',
          }}
        >
          {/* Coordinates & Direct Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div
              style={{
                backgroundColor: '#111923',
                padding: '36px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#45D6FF', marginBottom: '8px' }}>
                DIRECT ELECTRONIC MAIL
              </div>
              <div
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: '22px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  marginBottom: '20px',
                  wordBreak: 'break-all',
                }}
              >
                {profile.email}
              </div>

              <button
                onClick={copyEmail}
                className="btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '14px' }}
              >
                {copied ? (
                  <>
                    <Check size={16} color="#42D6A4" />
                    <span>Copied Email to Clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    <span>Copy Email Address</span>
                  </>
                )}
              </button>
            </div>

            {/* Social Links */}
            <div
              style={{
                backgroundColor: '#111923',
                padding: '36px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#738195', marginBottom: '16px' }}>
                VERIFIED NETWORK PROFILES
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
                    padding: '14px 18px',
                    borderRadius: '6px',
                    backgroundColor: '#151E29',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    transition: 'border-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#45D6FF')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Github size={18} color="#45D6FF" />
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>GitHub Repositories</span>
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#738195' }}>
                    Ayushprakash21
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
                    padding: '14px 18px',
                    borderRadius: '6px',
                    backgroundColor: '#151E29',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    transition: 'border-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#8AB4FF')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Linkedin size={18} color="#8AB4FF" />
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>LinkedIn Profile</span>
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#738195' }}>
                    /in/ayushprakash
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Functional Contact Form */}
          <div
            style={{
              backgroundColor: '#111923',
              padding: '40px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#738195', marginBottom: '16px' }}>
              TRANSMIT DIRECT DISPATCH TO CMS
            </div>

            {formSubmitted ? (
              <div
                style={{
                  padding: '48px 24px',
                  textAlign: 'center',
                  backgroundColor: 'rgba(66, 214, 164, 0.08)',
                  borderRadius: '8px',
                  border: '1px solid rgba(66, 214, 164, 0.3)',
                }}
              >
                <CheckCircle2 size={36} color="#42D6A4" style={{ margin: '0 auto 16px' }} />
                <h4 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px', color: '#FFFFFF', marginBottom: '8px' }}>
                  Dispatch Delivered & Logged
                </h4>
                <p style={{ fontSize: '14px', color: '#A7B2C0', lineHeight: 1.6 }}>
                  Thank you. Your message has been saved in the private administrator inbox.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#738195', marginBottom: '6px' }}>
                    FULL NAME
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '6px',
                      backgroundColor: '#151E29',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#738195', marginBottom: '6px' }}>
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@organization.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '6px',
                      backgroundColor: '#151E29',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#738195', marginBottom: '6px' }}>
                    ORGANIZATION / AFFILIATION
                  </label>
                  <input
                    type="text"
                    placeholder="Company or Entity"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '6px',
                      backgroundColor: '#151E29',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#738195', marginBottom: '6px' }}>
                    DISPATCH MESSAGE
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Inquiry or advisory details..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '6px',
                      backgroundColor: '#151E29',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: '#FFFFFF',
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
                  style={{ width: '100%', padding: '14px', fontSize: '14px', marginTop: '6px' }}
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
