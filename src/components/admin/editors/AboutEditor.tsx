import React, { useState } from 'react';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Eye,
  Save,
  CheckCircle2,
  X,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { AboutSectionSettings } from '../../../types/cms';
import { cmsService } from '../../../services/cmsService';

interface AboutEditorProps {
  initialAbout: AboutSectionSettings;
  onSave: (saved: AboutSectionSettings) => void;
  onCancel: () => void;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AboutEditor: React.FC<AboutEditorProps> = ({
  initialAbout,
  onSave,
  onCancel,
  showNotification,
}) => {
  const [form, setForm] = useState<AboutSectionSettings>(() => ({
    ...initialAbout,
    heading:
      initialAbout.heading ||
      'Operating at the intersection of enterprise logistics, physical workflows, and autonomous digital systems.',
    quote:
      initialAbout.quote ||
      'Modern supply chains fail not from a lack of data, but from fragmented operational visibility between physical warehouses and enterprise software.',
    content:
      initialAbout.content ||
      `Operating at the intersection of enterprise logistics, physical workflows, and autonomous digital systems.

An operations professional exploring the intersection of enterprise systems, supply chain management, artificial intelligence and digital product development. Dedicated to building robust operating architectures, transparent logistics workflows, and high-signal digital platforms.

Key Focus Areas:
• Physical Operations: Freight logistics, inventory replenishment, vendor coordination, and warehouse workflows.
• Digital Platforms: Enterprise SaaS, applied language models, ATS parsing systems, and distributed cloud backends.
• Applied Intelligence: Building AI-powered platforms like Orion-9 and ApplyVise AI to empower human decision-making with transparent, grounded telemetry.`,
    physicalOpsHeading: initialAbout.physicalOpsHeading || 'Physical Operations',
    physicalOpsText:
      initialAbout.physicalOpsText ||
      'Freight logistics, inventory replenishment, vendor coordination, and warehouse workflows.',
    digitalPlatformsHeading: initialAbout.digitalPlatformsHeading || 'Digital Platforms',
    digitalPlatformsText:
      initialAbout.digitalPlatformsText ||
      'Enterprise SaaS, applied language models, ATS parsing systems, and distributed cloud backends.',
    status: initialAbout.status || 'published',
  }));

  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const characterCount = (form.content || '').length;
  const maxCharacters = 2600;

  const updateField = <K extends keyof AboutSectionSettings>(
    key: K,
    value: AboutSectionSettings[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('about-textarea') as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = form.content || '';
    const selected = current.substring(start, end) || 'text';
    const replacement = `${prefix}${selected}${suffix}`;

    const updated = current.substring(0, start) + replacement + current.substring(end);
    updateField('content', updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 50);
  };

  const insertBullet = () => {
    insertFormatting('\n• ', '');
  };

  const insertNumbered = () => {
    insertFormatting('\n1. ', '');
  };

  const insertLink = () => {
    const url = prompt('Enter destination URL:');
    if (url) {
      insertFormatting('[', `](${url})`);
    }
  };

  const handleSubmit = async (targetStatus: 'published' | 'draft') => {
    if (!form.content?.trim()) {
      showNotification('About description cannot be empty.', 'error');
      return;
    }

    const payload: AboutSectionSettings = {
      ...form,
      characterCount: form.content.length,
      status: targetStatus,
      updatedAt: new Date().toISOString(),
    };

    await cmsService.updateAboutSettings(payload);
    setHasUnsavedChanges(false);
    onSave(payload);
    showNotification(
      targetStatus === 'published'
        ? 'About section published to live website.'
        : 'About section draft saved.'
    );
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
          paddingBottom: '20px',
          borderBottom: '1px solid rgba(244, 243, 238, 0.08)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '24px',
                fontWeight: 600,
                color: '#F4F3EE',
                margin: 0,
              }}
            >
              Edit About Section
            </h2>
            <span
              style={{
                padding: '3px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                backgroundColor:
                  form.status === 'published'
                    ? 'rgba(74, 180, 120, 0.15)'
                    : 'rgba(214, 168, 84, 0.15)',
                color: form.status === 'published' ? '#6CE098' : '#E8CE7D',
                border: `1px solid ${
                  form.status === 'published'
                    ? 'rgba(74, 180, 120, 0.3)'
                    : 'rgba(214, 168, 84, 0.3)'
                }`,
              }}
            >
              {form.status === 'published' ? '● Published' : '○ Draft'}
            </span>
          </div>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: '#A7B0A9',
              margin: '4px 0 0',
            }}
          >
            LinkedIn-style rich editor for your professional summary, background, operational philosophy, and core pillars.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '6px',
              backgroundColor: 'rgba(130, 148, 166, 0.12)',
              border: '1px solid rgba(130, 148, 166, 0.25)',
              color: '#8294A6',
              fontSize: '13px',
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
            }}
          >
            <Save size={14} />
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('published')}
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
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <CheckCircle2 size={14} />
            Publish
          </button>
        </div>
      </div>

      {hasUnsavedChanges && (
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: 'rgba(214, 168, 84, 0.1)',
            border: '1px solid rgba(214, 168, 84, 0.25)',
            borderRadius: '6px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: '#E8CE7D',
            fontFamily: 'var(--font-body)',
          }}
        >
          <AlertCircle size={14} />
          You have unsaved edits in your About narrative. Click Save Draft or Publish to save.
        </div>
      )}

      {/* Main Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Editorial Section Headline & Guiding Quote */}
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
            Editorial Headings
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: '#A7B0A9',
                  marginBottom: '6px',
                }}
              >
                Primary Section Headline
              </label>
              <input
                type="text"
                value={form.heading}
                onChange={(e) => updateField('heading', e.target.value)}
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
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: '#A7B0A9',
                  marginBottom: '6px',
                }}
              >
                Guiding Systems Quote
              </label>
              <input
                type="text"
                value={form.quote}
                onChange={(e) => updateField('quote', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#0E1412',
                  border: '1px solid rgba(244, 243, 238, 0.12)',
                  color: '#F4F3EE',
                  fontSize: '14px',
                  outline: 'none',
                  fontStyle: 'italic',
                }}
              />
            </div>
          </div>
        </div>

        {/* Rich-Text Professional Description Box (LinkedIn Style) */}
        <div
          style={{
            backgroundColor: '#141C19',
            border: '1px solid rgba(244, 243, 238, 0.08)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          {/* Editor Header: Tabs & Formatting Toolbar */}
          <div
            style={{
              padding: '12px 18px',
              backgroundColor: '#18211D',
              borderBottom: '1px solid rgba(244, 243, 238, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            {/* View Mode Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('write')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: activeTab === 'write' ? 'rgba(130, 148, 166, 0.2)' : 'transparent',
                  color: activeTab === 'write' ? '#F4F3EE' : '#8E948D',
                  fontSize: '13px',
                  fontFamily: 'var(--font-body)',
                  fontWeight: activeTab === 'write' ? 600 : 400,
                  cursor: 'pointer',
                }}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: activeTab === 'preview' ? 'rgba(130, 148, 166, 0.2)' : 'transparent',
                  color: activeTab === 'preview' ? '#F4F3EE' : '#8E948D',
                  fontSize: '13px',
                  fontFamily: 'var(--font-body)',
                  fontWeight: activeTab === 'preview' ? 600 : 400,
                  cursor: 'pointer',
                }}
              >
                Preview
              </button>
            </div>

            {/* Rich Formatting Toolbar (Active in Write Mode) */}
            {activeTab === 'write' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  title="Bold"
                  onClick={() => insertFormatting('**', '**')}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(244, 243, 238, 0.05)',
                    border: '1px solid rgba(244, 243, 238, 0.1)',
                    color: '#F4F3EE',
                    cursor: 'pointer',
                  }}
                >
                  <Bold size={13} />
                </button>
                <button
                  type="button"
                  title="Italic"
                  onClick={() => insertFormatting('*', '*')}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(244, 243, 238, 0.05)',
                    border: '1px solid rgba(244, 243, 238, 0.1)',
                    color: '#F4F3EE',
                    cursor: 'pointer',
                  }}
                >
                  <Italic size={13} />
                </button>
                <button
                  type="button"
                  title="Bullet List"
                  onClick={insertBullet}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(244, 243, 238, 0.05)',
                    border: '1px solid rgba(244, 243, 238, 0.1)',
                    color: '#F4F3EE',
                    cursor: 'pointer',
                  }}
                >
                  <List size={13} />
                </button>
                <button
                  type="button"
                  title="Numbered List"
                  onClick={insertNumbered}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(244, 243, 238, 0.05)',
                    border: '1px solid rgba(244, 243, 238, 0.1)',
                    color: '#F4F3EE',
                    cursor: 'pointer',
                  }}
                >
                  <ListOrdered size={13} />
                </button>
                <button
                  type="button"
                  title="Insert Link"
                  onClick={insertLink}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(244, 243, 238, 0.05)',
                    border: '1px solid rgba(244, 243, 238, 0.1)',
                    color: '#F4F3EE',
                    cursor: 'pointer',
                  }}
                >
                  <LinkIcon size={13} />
                </button>
              </div>
            )}

            {/* Character Counter */}
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                color: characterCount > maxCharacters ? '#D9534F' : '#8E948D',
              }}
            >
              {characterCount.toLocaleString()} / {maxCharacters.toLocaleString()} characters
            </div>
          </div>

          {/* Editor Body */}
          <div style={{ padding: '20px' }}>
            {activeTab === 'write' ? (
              <textarea
                id="about-textarea"
                rows={16}
                value={form.content || ''}
                onChange={(e) => updateField('content', e.target.value)}
                placeholder="Write or paste your comprehensive professional description here..."
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '6px',
                  backgroundColor: '#0E1412',
                  border: '1px solid rgba(244, 243, 238, 0.12)',
                  color: '#F4F3EE',
                  fontSize: '14px',
                  fontFamily: 'var(--font-body)',
                  lineHeight: 1.7,
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            ) : (
              <div
                style={{
                  padding: '16px',
                  minHeight: '280px',
                  backgroundColor: '#0E1412',
                  borderRadius: '6px',
                  border: '1px solid rgba(244, 243, 238, 0.12)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '15px',
                  color: '#C1C4BE',
                  lineHeight: 1.8,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {form.content || 'No content written yet.'}
              </div>
            )}
          </div>
        </div>

        {/* Dual Domain Focus Areas */}
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
            Core Competency Columns
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            {/* Column 1: Physical Operations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: '#A7B0A9',
                }}
              >
                Physical Domain Heading
              </label>
              <input
                type="text"
                value={form.physicalOpsHeading}
                onChange={(e) => updateField('physicalOpsHeading', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#0E1412',
                  border: '1px solid rgba(244, 243, 238, 0.12)',
                  color: '#F4F3EE',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
              <textarea
                rows={3}
                value={form.physicalOpsText}
                onChange={(e) => updateField('physicalOpsText', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#0E1412',
                  border: '1px solid rgba(244, 243, 238, 0.12)',
                  color: '#F4F3EE',
                  fontSize: '13px',
                  outline: 'none',
                  resize: 'none',
                }}
              />
            </div>

            {/* Column 2: Digital Platforms */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: '#A7B0A9',
                }}
              >
                Digital Systems Heading
              </label>
              <input
                type="text"
                value={form.digitalPlatformsHeading}
                onChange={(e) => updateField('digitalPlatformsHeading', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#0E1412',
                  border: '1px solid rgba(244, 243, 238, 0.12)',
                  color: '#F4F3EE',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
              <textarea
                rows={3}
                value={form.digitalPlatformsText}
                onChange={(e) => updateField('digitalPlatformsText', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#0E1412',
                  border: '1px solid rgba(244, 243, 238, 0.12)',
                  color: '#F4F3EE',
                  fontSize: '13px',
                  outline: 'none',
                  resize: 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div
          style={{
            position: 'sticky',
            bottom: '16px',
            backgroundColor: 'rgba(20, 28, 25, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(244, 243, 238, 0.12)',
            borderRadius: '8px',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
            zIndex: 10,
          }}
        >
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#A7B0A9' }}>
            {hasUnsavedChanges ? (
              <span style={{ color: '#E8CE7D' }}>● Unsaved changes</span>
            ) : (
              <span>All changes synchronized</span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                background: 'transparent',
                border: '1px solid rgba(244, 243, 238, 0.15)',
                color: '#C1C4BE',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('draft')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                backgroundColor: 'rgba(130, 148, 166, 0.12)',
                border: '1px solid rgba(130, 148, 166, 0.25)',
                color: '#8294A6',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('published')}
              style={{
                padding: '8px 20px',
                borderRadius: '6px',
                backgroundColor: '#4A5749',
                border: 'none',
                color: '#F4F3EE',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Publish About
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
