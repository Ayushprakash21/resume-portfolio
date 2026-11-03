import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  HardDrive,
  Globe,
  Save,
  Check,
  X,
} from 'lucide-react';
import { ResumeRecord } from '../../../types/cms';
import { cmsService } from '../../../services/cmsService';

interface ResumeManagerProps {
  currentResume: ResumeRecord;
  onUpdate: (updated: ResumeRecord) => void;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ResumeManager: React.FC<ResumeManagerProps> = ({
  currentResume,
  onUpdate,
  showNotification,
}) => {
  const [form, setForm] = useState<ResumeRecord>(currentResume);
  const [isUploading, setIsUploading] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Resume versions list stored locally/synced
  const [versions, setVersions] = useState<ResumeRecord[]>([
    currentResume,
    {
      id: 'resume-v-prev',
      fileName: 'Ayush_Prakash_CV_Operations_2025.pdf',
      fileUrl: currentResume.fileUrl,
      fileSizeBytes: 138000,
      uploadedAt: '2025-10-15',
      isActive: false,
      isPublicEnabled: true,
      buttonText: 'Download Curriculum Vitae',
      versionName: 'Operations & SCM Focus v2.1',
    },
  ]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      showNotification('Please upload a valid PDF document.', 'error');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showNotification('PDF file size exceeds 15 MB limit.', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const updated = await cmsService.uploadResumeFile(file, form.buttonText);
      setForm(updated);
      setVersions((prev) => [updated, ...prev.filter((v) => v.id !== updated.id)]);
      onUpdate(updated);
      showNotification(`Resume "${file.name}" uploaded and set as active.`);
    } catch (err: any) {
      showNotification('Resume upload failed: ' + (err.message || 'Error'), 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await cmsService.updateResumeRecord(form);
      onUpdate(form);
      showNotification('Resume download settings updated and published globally.', 'success');
    } catch (err: any) {
      showNotification('Save failed: ' + (err.message || 'Error'), 'error');
    }
  };

  const handleSetActiveVersion = async (version: ResumeRecord) => {
    try {
      const updated = { ...version, isActive: true };
      setForm(updated);
      await cmsService.updateResumeRecord(updated);
      onUpdate(updated);
      setVersions((prev) =>
        prev.map((v) => ({ ...v, isActive: v.id === version.id }))
      );
      showNotification(`Version "${version.fileName}" set as active on live site.`, 'success');
    } catch (err: any) {
      showNotification('Update failed: ' + (err.message || 'Error'), 'error');
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
          marginBottom: '28px',
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
            Dedicated Resume &amp; Curriculum Vitae Manager
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: '#A7B0A9',
              margin: '4px 0 0',
            }}
          >
            Upload, version, replace, and govern public download access for your verified CV document without redeployment.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Active Resume Card */}
        <div
          style={{
            backgroundColor: 'rgba(18, 18, 22, 0.72)',
            border: '1px solid rgba(244, 243, 238, 0.12)',
            borderRadius: '8px',
            padding: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '18px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(214, 168, 84, 0.12)',
                  border: '1px solid rgba(214, 168, 84, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-gold)',
                }}
              >
                <FileText size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '17px',
                      fontWeight: 600,
                      color: '#F4F3EE',
                      margin: 0,
                    }}
                  >
                    {form.fileName}
                  </h3>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(74, 180, 120, 0.15)',
                      border: '1px solid rgba(74, 180, 120, 0.3)',
                      color: '#6CE098',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  >
                    ● Currently Active on Website
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: '#8E948D',
                    marginTop: '4px',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <HardDrive size={12} />
                    {(form.fileSizeBytes / 1024).toFixed(1)} KB
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} />
                    Uploaded: {form.uploadedAt}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
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
                <Eye size={14} />
                Preview PDF
              </button>
              <a
                href={form.fileUrl}
                download={form.fileName}
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
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                <Download size={14} />
                Download
              </a>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  color: '#F4F3EE',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Upload size={14} />
                {isUploading ? 'Uploading...' : 'Replace Active Resume'}
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Public Website Governance Form */}
        <form
          onSubmit={handleSaveSettings}
          style={{
            backgroundColor: 'rgba(18, 18, 22, 0.72)',
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
            Public Website Controls
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
              marginBottom: '20px',
            }}
          >
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
                Download Button CTA Label
              </label>
              <input
                type="text"
                value={form.buttonText}
                onChange={(e) => setForm((prev) => ({ ...prev, buttonText: e.target.value }))}
                placeholder="e.g. Download Curriculum Vitae"
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

            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  color: '#F4F3EE',
                  cursor: 'pointer',
                  marginTop: '12px',
                }}
              >
                <input
                  type="checkbox"
                  checked={form.isPublicEnabled}
                  onChange={(e) => setForm((prev) => ({ ...prev, isPublicEnabled: e.target.checked }))}
                  style={{ accentColor: '#4A5749', width: '18px', height: '18px' }}
                />
                <span>Enable Public Resume Download on Live Website</span>
              </label>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: '#8E948D',
                  marginLeft: '28px',
                  marginTop: '2px',
                }}
              >
                When unchecked, the public download button is concealed from recruiters and visitors.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 18px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#F4F3EE',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Save size={14} />
              Save Governance Settings
            </button>
          </div>
        </form>

        {/* Version History Table */}
        <div
          style={{
            backgroundColor: 'rgba(18, 18, 22, 0.72)',
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
            Resume Versions &amp; Archive
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {versions.map((ver) => {
              const isActive = ver.id === form.id;
              return (
                <div
                  key={ver.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    backgroundColor: '#0E1412',
                    borderRadius: '6px',
                    border: isActive
                      ? '1px solid rgba(74, 180, 120, 0.3)'
                      : '1px solid rgba(244, 243, 238, 0.06)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FileText size={18} color={isActive ? '#6CE098' : '#8E948D'} />
                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#F4F3EE',
                        }}
                      >
                        {ver.fileName}
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '11px',
                          color: '#8E948D',
                          marginTop: '2px',
                        }}
                      >
                        {ver.versionName || 'Standard Version'} &bull; Uploaded {ver.uploadedAt}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isActive ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          color: '#6CE098',
                          fontWeight: 600,
                        }}
                      >
                        <Check size={12} /> Active
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetActiveVersion(ver)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(244, 243, 238, 0.05)',
                          border: '1px solid rgba(244, 243, 238, 0.1)',
                          color: '#C1C4BE',
                          fontSize: '11px',
                          cursor: 'pointer',
                        }}
                      >
                        Make Active
                      </button>
                    )}
                    <a
                      href={ver.fileUrl}
                      download={ver.fileName}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'transparent',
                        color: '#8294A6',
                        fontSize: '11px',
                        textDecoration: 'none',
                      }}
                    >
                      Download
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {showPreviewModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(18, 18, 22, 0.72)',
              border: '1px solid rgba(244, 243, 238, 0.15)',
              borderRadius: '12px',
              maxWidth: '840px',
              width: '100%',
              height: '85vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '14px 20px',
                borderBottom: '1px solid rgba(244, 243, 238, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#F4F3EE',
                }}
              >
                Resume Preview &mdash; {form.fileName}
              </span>
              <button
                onClick={() => setShowPreviewModal(false)}
                style={{ background: 'none', border: 'none', color: '#A7B0A9', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <iframe
              src={form.fileUrl}
              title="Resume Preview"
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
