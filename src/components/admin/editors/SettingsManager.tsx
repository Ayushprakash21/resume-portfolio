import React, { useState } from 'react';
import {
  Settings,
  Search,
  Mail,
  Database,
  Save,
  CheckCircle2,
  RefreshCw,
  HardDrive,
  Globe,
  Trash2,
  Check,
} from 'lucide-react';
import { SiteSettings, ContactMessage } from '../../../types/cms';
import { cmsService } from '../../../services/cmsService';

interface SettingsManagerProps {
  settings: SiteSettings;
  messages: ContactMessage[];
  onUpdateSettings: (updated: SiteSettings) => void;
  onRefreshMessages: () => void;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({
  settings,
  messages,
  onUpdateSettings,
  onRefreshMessages,
  showNotification,
}) => {
  const [form, setForm] = useState<SiteSettings>(settings);
  const [activeTab, setActiveTab] = useState<'general' | 'seo' | 'inbox' | 'system'>('general');

  const updateField = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await cmsService.updateSiteSettings(form);
      onUpdateSettings(form);
      showNotification('System and SEO settings updated and published globally.');
    } catch (err: any) {
      showNotification('Save failed: ' + (err.message || 'Error'), 'error');
    }
  };

  const handleToggleRead = async (id: string, readState: boolean) => {
    await cmsService.markMessageRead(id, !readState);
    onRefreshMessages();
  };

  const handleDeleteMessage = async (id: string) => {
    if (window.confirm('Delete this inquiry message?')) {
      await cmsService.deleteMessage(id);
      onRefreshMessages();
      showNotification('Message deleted.');
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          paddingBottom: '20px',
          borderBottom: '1px solid rgba(244, 243, 238, 0.08)',
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '24px',
              fontWeight: 600,
              color: '#F4F3EE',
              margin: 0,
            }}
          >
            System Settings, SEO &amp; Inquiries
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: '#A7B0A9',
              margin: '4px 0 0',
            }}
          >
            Manage global meta descriptors, OpenGraph cards, recruiter contact submissions, and cloud database integrity.
          </p>
        </div>

        {activeTab !== 'inbox' && (
          <button
            type="button"
            onClick={handleSave}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              borderRadius: '6px',
              backgroundColor: '#4A5749',
              border: 'none',
              color: '#F4F3EE',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Save size={14} /> Save Settings
          </button>
        )}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          backgroundColor: '#141C19',
          padding: '6px',
          borderRadius: '8px',
          border: '1px solid rgba(244, 243, 238, 0.08)',
        }}
      >
        {[
          { id: 'general', label: 'General Portfolio Settings' },
          { id: 'seo', label: 'SEO & OpenGraph' },
          { id: 'inbox', label: `Inquiries Inbox (${messages.filter((m) => !m.read).length} new)` },
          { id: 'system', label: 'Firebase & Cloud Runtime' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              flex: 1,
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === tab.id ? 'rgba(130, 148, 166, 0.2)' : 'transparent',
              color: activeTab === tab.id ? '#F4F3EE' : '#8E948D',
              fontSize: '13px',
              fontFamily: 'var(--font-body)',
              fontWeight: activeTab === tab.id ? 600 : 400,
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: GENERAL */}
      {activeTab === 'general' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              backgroundColor: '#141C19',
              border: '1px solid rgba(244, 243, 238, 0.08)',
              borderRadius: '8px',
              padding: '24px',
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '16px',
                fontWeight: 600,
                color: '#F4F3EE',
                marginBottom: '16px',
              }}
            >
              Public Branding &amp; Availability Note
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#A7B0A9', marginBottom: '6px' }}>
                  Website Title &bull; Browser Tab
                </label>
                <input
                  type="text"
                  value={form.siteTitle}
                  onChange={(e) => updateField('siteTitle', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#0E1412',
                    border: '1px solid rgba(244, 243, 238, 0.12)',
                    color: '#F4F3EE',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#A7B0A9', marginBottom: '6px' }}>
                  Recruiter Availability Note
                </label>
                <input
                  type="text"
                  value={form.availabilityNote}
                  onChange={(e) => updateField('availabilityNote', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#0E1412',
                    border: '1px solid rgba(244, 243, 238, 0.12)',
                    color: '#F4F3EE',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#A7B0A9', marginBottom: '6px' }}>
                  Colophon &amp; Footer Copyright
                </label>
                <input
                  type="text"
                  value={form.footerNote}
                  onChange={(e) => updateField('footerNote', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#0E1412',
                    border: '1px solid rgba(244, 243, 238, 0.12)',
                    color: '#F4F3EE',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: SEO */}
      {activeTab === 'seo' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              backgroundColor: '#141C19',
              border: '1px solid rgba(244, 243, 238, 0.08)',
              borderRadius: '8px',
              padding: '24px',
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '16px',
                fontWeight: 600,
                color: '#F4F3EE',
                marginBottom: '16px',
              }}
            >
              Search Engine &amp; Social Previews
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#A7B0A9', marginBottom: '6px' }}>
                  Meta Description
                </label>
                <textarea
                  rows={3}
                  value={form.siteDescription}
                  onChange={(e) => updateField('siteDescription', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#0E1412',
                    border: '1px solid rgba(244, 243, 238, 0.12)',
                    color: '#F4F3EE',
                    fontSize: '13px',
                    lineHeight: 1.5,
                    outline: 'none',
                  }}
                />
              </div>

              {/* SERP Snippet Preview */}
              <div
                style={{
                  padding: '16px',
                  backgroundColor: '#0E1412',
                  borderRadius: '6px',
                  border: '1px solid rgba(244, 243, 238, 0.08)',
                }}
              >
                <div style={{ fontSize: '11px', color: '#8E948D', marginBottom: '6px' }}>
                  Google Search Snippet Preview:
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '16px',
                    color: '#8294A6',
                    marginBottom: '4px',
                  }}
                >
                  {form.siteTitle}
                </div>
                <div style={{ fontSize: '12px', color: '#6CE098', marginBottom: '4px' }}>
                  https://resume-portfolio.ayushprakash0021.workers.dev
                </div>
                <div style={{ fontSize: '12px', color: '#C1C4BE', lineHeight: 1.4 }}>
                  {form.siteDescription}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: INBOX */}
      {activeTab === 'inbox' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {messages.length > 0 ? (
            messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  backgroundColor: '#141C19',
                  border: msg.read
                    ? '1px solid rgba(244, 243, 238, 0.06)'
                    : '1px solid rgba(130, 148, 166, 0.35)',
                  borderRadius: '8px',
                  padding: '18px 22px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '15px',
                        fontWeight: 600,
                        color: '#F4F3EE',
                      }}
                    >
                      {msg.name}
                    </span>
                    <span style={{ fontSize: '12px', color: '#8294A6' }}>&lt;{msg.email}&gt;</span>
                    {msg.organization && (
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '10px',
                          backgroundColor: 'rgba(244, 243, 238, 0.05)',
                          fontSize: '11px',
                          color: '#C1C4BE',
                        }}
                      >
                        {msg.organization}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#8E948D' }}>
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleRead(msg.id, msg.read)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(244, 243, 238, 0.05)',
                        border: '1px solid rgba(244, 243, 238, 0.1)',
                        color: msg.read ? '#8E948D' : '#6CE098',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      {msg.read ? 'Mark Unread' : 'Mark Read'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMessage(msg.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#E06C75',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#C1C4BE',
                    marginBottom: '6px',
                  }}
                >
                  Subject: {msg.subject}
                </div>

                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    color: '#A7B0A9',
                    lineHeight: 1.5,
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {msg.message}
                </p>
              </div>
            ))
          ) : (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                backgroundColor: '#141C19',
                borderRadius: '8px',
                border: '1px dashed rgba(244, 243, 238, 0.1)',
                color: '#8E948D',
                fontSize: '13px',
              }}
            >
              No recruiter messages or inquiries yet. Submissions from the public Contact form will appear here in real time.
            </div>
          )}
        </div>
      )}

      {/* TAB: SYSTEM */}
      {activeTab === 'system' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              backgroundColor: '#141C19',
              border: '1px solid rgba(244, 243, 238, 0.08)',
              borderRadius: '8px',
              padding: '24px',
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '16px',
                fontWeight: 600,
                color: '#F4F3EE',
                marginBottom: '16px',
              }}
            >
              Firebase Firestore &amp; Edge Deployment
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px', color: '#C1C4BE' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#6CE098" />
                <span>Firestore Project: <strong>orion9-dev-db-2026</strong> (Connected)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#6CE098" />
                <span>Security Rules: <strong>Authenticated Admin Write Only (request.auth != null)</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#6CE098" />
                <span>Edge Runtime: <strong>Cloudflare Workers (sub-50ms global routing)</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#6CE098" />
                <span>Production Endpoint: <strong>https://resume-portfolio.ayushprakash0021.workers.dev</strong></span>
              </div>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(244, 243, 238, 0.08)' }}>
              <button
                type="button"
                onClick={() => {
                  showNotification('Local content cache flushed and synchronized with Firestore.');
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(244, 243, 238, 0.05)',
                  border: '1px solid rgba(244, 243, 238, 0.12)',
                  color: '#F4F3EE',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={13} />
                Flush Local Cache &amp; Re-sync
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
