import React, { useState, useEffect } from 'react';
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
  Sparkles,
  ShieldCheck,
  FileCheck,
  RotateCcw,
  AlertTriangle,
  History,
  Filter,
  CheckSquare,
  Square,
  Edit2,
  Layers,
  ArrowRight,
  RefreshCw,
  Info,
  Linkedin,
} from 'lucide-react';
import {
  ResumeRecord,
  ResumeGeneratorSettings,
  ResumeVersionRecord,
  ResumeDiffItem,
  ResumeAuditEntry,
  ExtractedResumeData,
} from '../../../types/cms';
import { LinkedInParsedRecord, LinkedInImportReport, LinkedInImportAudit } from '../../../types/linkedin';
import { cmsService } from '../../../services/cmsService';
import { storageClient } from '../../../services/storage/storageClient';
import { linkedinParserService } from '../../../services/linkedinParserService';
import {
  validateResumeFile,
  extractRawTextFromResume,
  extractResumeInformation,
  generateResumeDiff,
  applyApprovedDiffItems,
} from '../../../services/resumeParserService';
import {
  extractResumeData,
  downloadPdf,
  downloadDocx,
} from '../../../services/resumeGeneratorService';
import { ResumeGeneratorModal } from '../../resume/ResumeGeneratorModal';

interface ResumeManagerProps {
  currentResume: ResumeRecord;
  onUpdate: (updated: ResumeRecord) => void;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

type TabType = 'overview' | 'review' | 'versions' | 'audit' | 'ats_engine';

export const ResumeManager: React.FC<ResumeManagerProps> = ({
  currentResume,
  onUpdate,
  showNotification,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [form, setForm] = useState<ResumeRecord>(currentResume);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showAtsModal, setShowAtsModal] = useState(false);
  const [isSavingAts, setIsSavingAts] = useState(false);

  // Versions & Audit Log from CMS service
  const [versions, setVersions] = useState<ResumeVersionRecord[]>(() => cmsService.getResumeVersions());
  const [auditLog, setAuditLog] = useState<ResumeAuditEntry[]>(() => cmsService.getResumeAuditHistory());
  const [genSettings, setGenSettings] = useState<ResumeGeneratorSettings>(() =>
    cmsService.getResumeGeneratorSettings()
  );

  // Upload & Extraction processing states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [processingStatus, setProcessingStatus] = useState<
    'idle' | 'validating' | 'extracting' | 'awaiting_review' | 'approved' | 'published' | 'failed'
  >('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Active review state
  const [currentDiffItems, setCurrentDiffItems] = useState<ResumeDiffItem[]>([]);
  const [activeExtractedData, setActiveExtractedData] = useState<ExtractedResumeData | null>(null);
  const [currentReviewVersion, setCurrentReviewVersion] = useState<ResumeVersionRecord | null>(null);
  const [diffFilter, setDiffFilter] = useState<'all' | 'new' | 'changed' | 'unchanged'>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [isApplyingChanges, setIsApplyingChanges] = useState(false);

  // Recovery & display-name state
  const [pendingMetadata, setPendingMetadata] = useState<ResumeRecord | null>(null);
  const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);
  const [editingDisplayNameValue, setEditingDisplayNameValue] = useState(
    form.displayName || form.originalName || form.fileName
  );

  // LinkedIn Import state
  const [isProcessingLinkedIn, setIsProcessingLinkedIn] = useState(false);
  const [linkedInProgress, setLinkedInProgress] = useState<{ step: string; percent: number } | null>(null);
  const [linkedInReport, setLinkedInReport] = useState<LinkedInImportReport | null>(null);
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [linkedInActiveTab, setLinkedInActiveTab] = useState<
    'overview' | 'experience' | 'education' | 'certifications' | 'skills' | 'projects' | 'other' | 'warnings'
  >('overview');
  const [isPublishingLinkedIn, setIsPublishingLinkedIn] = useState(false);
  const [linkedInAuditLog, setLinkedInAuditLog] = useState<LinkedInImportAudit[]>(() =>
    cmsService.getLinkedInAuditHistory()
  );

  // Subscribe to reactive CMS updates
  useEffect(() => {
    const unsubscribe = cmsService.subscribe(() => {
      setVersions(cmsService.getResumeVersions());
      setAuditLog(cmsService.getResumeAuditHistory());
      setGenSettings(cmsService.getResumeGeneratorSettings());
      setForm(cmsService.getResumeRecord());
      setLinkedInAuditLog(cmsService.getLinkedInAuditHistory());
    });
    return () => unsubscribe();
  }, []);

  // ==========================================
  // 1. FILE UPLOAD & AUTOMATIC EXTRACTION
  // ==========================================
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPendingMetadata(null);

    // Step 1: Validate file with binary header signature
    setProcessingStatus('validating');
    setStatusMessage(`Validating ${file.name} format, size, and binary signature...`);
    const validation = await validateResumeFile(file);
    if (!validation.isValid) {
      setProcessingStatus('failed');
      setStatusMessage(validation.error || 'Validation failed');
      showNotification(validation.error || 'Invalid file', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    let uploadedRecord: ResumeRecord | null = null;

    try {
      // Step 2: Upload to Cloudflare R2 with genuine real-time progress
      setStatusMessage(`Uploading ${file.name} to Cloudflare R2 storage...`);
      uploadedRecord = await cmsService.uploadResumeFile(file, form.buttonText, (p) => {
        setUploadProgress(Math.min(65, Math.round(10 + p * 0.55)));
      });

      setUploadProgress(70);
      setStatusMessage('Verifying document in Cloudflare R2...');

      // Step 3: Extract textual information
      setProcessingStatus('extracting');
      setStatusMessage('Extracting structured profile, experience, skills, and certifications...');
      setUploadProgress(82);

      const rawText = await extractRawTextFromResume(file);
      const extracted = extractResumeInformation(rawText);
      setActiveExtractedData(extracted);

      // Step 4: Compare with existing CMS data
      setUploadProgress(90);
      const currentCmsSnapshot = {
        profile: cmsService.getProfile(),
        about: cmsService.getAboutSettings(),
        experiences: cmsService.getExperiences(false),
        projects: cmsService.getProjects(false),
        skills: cmsService.getSkills(),
        education: cmsService.getEducation(),
        certifications: cmsService.getCertifications(false),
      };

      const diff = generateResumeDiff(extracted, currentCmsSnapshot);
      setCurrentDiffItems(diff);

      // Step 5: Create a new Version Record
      const newVersionNumber = versions.length > 0 ? Math.max(...versions.map((v) => v.versionNumber)) + 1 : 1;
      const cleanBaseName = file.name.replace(/\.[^/.]+$/, '');
      const newVersionRecord: ResumeVersionRecord = {
        id: `res-v${Date.now()}`,
        versionNumber: newVersionNumber,
        fileName: file.name,
        originalName: file.name,
        displayName: cleanBaseName,
        generatedDownloadName: file.name,
        fileUrl: uploadedRecord.fileUrl,
        fileType: validation.fileType || 'pdf',
        fileSizeBytes: file.size,
        uploadedAt: new Date().toISOString().split('T')[0],
        uploadedBy: 'Ayush Prakash (Admin)',
        processingStatus: 'awaiting_review',
        extractionStatus: 'success',
        isActive: true,
        isPublicEnabled: form.isPublicEnabled,
        buttonText: form.buttonText,
        versionName: `Resume v${newVersionNumber} (${file.name})`,
        storageProvider: uploadedRecord.storageProvider || 'cloudflare-r2',
        objectKey: uploadedRecord.objectKey,
        extractedData: extracted,
        diffItems: diff,
      };

      try {
        await cmsService.addResumeVersion(newVersionRecord);
      } catch (verErr: any) {
        console.warn('Version persistence notice:', verErr);
      }

      setForm(uploadedRecord);
      onUpdate(uploadedRecord);
      setCurrentReviewVersion(newVersionRecord);

      setUploadProgress(100);
      setProcessingStatus('awaiting_review');
      setStatusMessage(`Successfully extracted ${diff.length} fields. Ready for review.`);
      showNotification(`Uploaded & extracted ${diff.length} fields from "${file.name}".`, 'success');

      // Switch to review tab automatically
      setActiveTab('review');
    } catch (err: any) {
      console.error('[ResumeManager] Upload or persistence error:', err);
      setProcessingStatus('failed');
      setStatusMessage('Operation failed: ' + (err.message || 'Error'));

      if (uploadedRecord && uploadedRecord.objectKey) {
        // Uploaded to R2 successfully but Firestore persistence failed -> offer retry
        setPendingMetadata(uploadedRecord);
        showNotification(
          `Resume stored in Cloudflare R2, but database synchronization failed. Click 'Retry Metadata Persistence' below.`,
          'error'
        );
      } else {
        showNotification('Upload error: ' + (err.message || 'Failed'), 'error');
      }
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1200);
    }
  };

  // Retry Firestore metadata persistence without re-uploading file
  const handleRetryMetadataPersistence = async () => {
    if (!pendingMetadata) return;
    setIsUploading(true);
    setStatusMessage('Retrying metadata persistence for uploaded resume...');
    try {
      const persisted = await cmsService.retryResumeMetadataPersistence(pendingMetadata);
      setForm(persisted);
      onUpdate(persisted);
      setPendingMetadata(null);
      setProcessingStatus('idle');
      showNotification('Resume metadata synchronized successfully!', 'success');
    } catch (err: any) {
      showNotification('Metadata persistence retry failed: ' + err.message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Update display title
  const handleSaveDisplayName = async () => {
    if (!editingDisplayNameValue.trim()) return;
    try {
      const updated = await cmsService.updateResumeDisplayName(editingDisplayNameValue.trim());
      setForm(updated);
      onUpdate(updated);
      setIsEditingDisplayName(false);
      showNotification(`Resume display title updated to "${updated.displayName}".`, 'success');
    } catch (err: any) {
      showNotification('Failed to update display title: ' + err.message, 'error');
    }
  };

  // ==========================================
  // LINKEDIN DATA EXPORT IMPORTER HANDLERS
  // ==========================================
  const handleLinkedInFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingLinkedIn(true);
    setLinkedInProgress({ step: 'Uploading archive to secure Cloudflare R2...', percent: 25 });

    let r2ObjectKey: string | undefined;

    try {
      // 1. Upload archive to Cloudflare R2 private documents
      try {
        const meta = await storageClient.uploadFile(file, {
          category: 'documents',
          visibility: 'private',
          onProgress: (p) => {
            setLinkedInProgress({
              step: `Uploading ${file.name} to Cloudflare R2 (${p}%)...`,
              percent: Math.min(65, Math.round(25 + p * 0.4)),
            });
          },
        });
        r2ObjectKey = meta.objectKey;
      } catch (uploadErr) {
        console.warn('[LinkedIn] R2 archive upload warning, proceeding with parser:', uploadErr);
      }

      // 2. Decompress and parse LinkedIn export
      setLinkedInProgress({ step: 'Validating archive & parsing CSV records...', percent: 80 });
      const report = await linkedinParserService.parseLinkedInExport(file);
      report.r2ObjectKey = r2ObjectKey;

      setLinkedInProgress({ step: 'Complete!', percent: 100 });
      setLinkedInReport(report);
      setShowLinkedInModal(true);
      showNotification(
        `Discovered ${report.recordsExtracted} records across ${report.filesRecognized.length} files from "${file.name}". Ready for review.`,
        'success'
      );
    } catch (err: any) {
      console.error('[LinkedIn] Importer error:', err);
      showNotification('LinkedIn export error: ' + (err.message || 'Failed to process export'), 'error');
    } finally {
      setIsProcessingLinkedIn(false);
      setTimeout(() => setLinkedInProgress(null), 1000);
      e.target.value = ''; // Reset file input
    }
  };

  const handleSetLinkedInItemStatus = (id: string, status: 'approved' | 'rejected') => {
    if (!linkedInReport) return;
    const updated = linkedInReport.records.map((r) => (r.id === id ? { ...r, status } : r));
    setLinkedInReport({ ...linkedInReport, records: updated });
  };

  const handleBulkApproveLinkedIn = () => {
    if (!linkedInReport) return;
    const updated = linkedInReport.records.map((r) =>
      r.suggestedAction !== 'skip' ? { ...r, status: 'approved' as const } : r
    );
    setLinkedInReport({ ...linkedInReport, records: updated });
    showNotification('Approved all non-duplicate records.', 'info');
  };

  const handlePublishApprovedLinkedIn = async () => {
    if (!linkedInReport) return;
    const approvedItems = linkedInReport.records.filter((r) => r.status === 'approved');
    if (approvedItems.length === 0) {
      showNotification('No records approved yet. Please approve at least one record to publish.', 'info');
      return;
    }

    setIsPublishingLinkedIn(true);
    try {
      const auditSummary = {
        fileName: linkedInReport.archiveName,
        fileSizeBytes: 0,
        sourceType: (linkedInReport.archiveName.endsWith('.zip') ? 'zip' : 'csv') as 'zip' | 'csv',
        uploadedBy: 'Ayush Prakash (Admin)',
        r2ObjectKey: linkedInReport.r2ObjectKey,
        recordsFound: linkedInReport.recordsExtracted,
        recordsRejected: linkedInReport.records.filter((r) => r.status === 'rejected').length,
        status: 'completed' as const,
        details: `Published ${approvedItems.length} records into portfolio CMS.`,
      };

      const result = await cmsService.publishApprovedLinkedInRecords(approvedItems, auditSummary);
      showNotification(`Successfully published ${result.publishedCount} records to portfolio CMS!`, 'success');
      setShowLinkedInModal(false);
      setLinkedInReport(null);
    } catch (err: any) {
      showNotification('Publishing failed: ' + err.message, 'error');
    } finally {
      setIsPublishingLinkedIn(false);
    }
  };

  // Re-run extraction on current active resume
  const handleExtractCurrentResume = async () => {
    setIsUploading(true);
    setProcessingStatus('extracting');
    setStatusMessage('Re-extracting information from active document...');
    try {
      const res = await fetch(form.fileUrl);
      const blob = await res.blob();
      const file = new File([blob], form.fileName, { type: blob.type || 'application/pdf' });

      const rawText = await extractRawTextFromResume(file);
      const extracted = extractResumeInformation(rawText);
      setActiveExtractedData(extracted);

      const currentCmsSnapshot = {
        profile: cmsService.getProfile(),
        about: cmsService.getAboutSettings(),
        experiences: cmsService.getExperiences(false),
        projects: cmsService.getProjects(false),
        skills: cmsService.getSkills(),
        education: cmsService.getEducation(),
        certifications: cmsService.getCertifications(false),
      };

      const diff = generateResumeDiff(extracted, currentCmsSnapshot);
      setCurrentDiffItems(diff);
      setProcessingStatus('awaiting_review');
      setStatusMessage(`Extracted ${diff.length} fields. Comparison ready.`);
      showNotification(`Extracted ${diff.length} fields from current document.`, 'success');
      setActiveTab('review');
    } catch (err: any) {
      setProcessingStatus('failed');
      setStatusMessage('Re-extraction failed: ' + (err.message || 'Error'));
      showNotification('Extraction failed: ' + (err.message || 'Error'), 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // ==========================================
  // 2. REVIEW & APPROVAL ACTIONS
  // ==========================================
  const handleItemStatusChange = (id: string, newStatus: ResumeDiffItem['status']) => {
    setCurrentDiffItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const handleStartEdit = (item: ResumeDiffItem) => {
    setEditingItemId(item.id);
    setEditingValue(item.currentReviewValue || item.extractedValue || '');
  };

  const handleSaveEdit = (id: string) => {
    setCurrentDiffItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, currentReviewValue: editingValue, status: 'edited' }
          : item
      )
    );
    setEditingItemId(null);
    setEditingValue('');
    showNotification('Field value updated in review draft.', 'info');
  };

  const handleApproveAll = (category?: 'new' | 'changed') => {
    setCurrentDiffItems((prev) =>
      prev.map((item) => {
        if (!category || item.category === category) {
          return { ...item, status: 'approved' };
        }
        return item;
      })
    );
    showNotification(
      category ? `All ${category} items approved.` : 'All items approved for publishing.',
      'success'
    );
  };

  const handleRejectAll = () => {
    setCurrentDiffItems((prev) =>
      prev.map((item) =>
        item.category !== 'unchanged' ? { ...item, status: 'rejected' } : item
      )
    );
    showNotification('All pending items rejected.', 'info');
  };

  const handleSaveReviewDraft = async () => {
    if (currentReviewVersion) {
      const updatedVersion: ResumeVersionRecord = {
        ...currentReviewVersion,
        diffItems: currentDiffItems,
        processingStatus: 'awaiting_review',
      };
      await cmsService.updateResumeVersion(updatedVersion);
      setCurrentReviewVersion(updatedVersion);
      showNotification('Review draft saved successfully. Unapproved items were not published.', 'success');
    } else {
      showNotification('Review draft saved in local session.', 'info');
    }
  };

  const handlePublishApproved = async () => {
    setIsApplyingChanges(true);
    try {
      const versionNumber = currentReviewVersion?.versionNumber || 1;
      const { updatedCount, auditEntry } = await applyApprovedDiffItems(
        currentDiffItems,
        cmsService,
        versionNumber,
        form.fileName
      );

      await cmsService.addResumeAuditEntry(auditEntry);

      if (currentReviewVersion) {
        const updatedVersion: ResumeVersionRecord = {
          ...currentReviewVersion,
          processingStatus: 'published',
          publishedAt: new Date().toISOString(),
          diffItems: currentDiffItems,
        };
        await cmsService.updateResumeVersion(updatedVersion);
        setCurrentReviewVersion(updatedVersion);
      }

      setProcessingStatus('published');
      showNotification(
        `Successfully published ${updatedCount} approved fields to CMS central database!`,
        'success'
      );
      setActiveTab('overview');
    } catch (err: any) {
      showNotification('Publish failed: ' + (err.message || 'Error'), 'error');
    } finally {
      setIsApplyingChanges(false);
    }
  };

  // ==========================================
  // 3. VERSION HISTORY RESTORE
  // ==========================================
  const handleRestoreVersion = async (version: ResumeVersionRecord) => {
    try {
      const restored = await cmsService.restoreResumeVersion(version.id);
      setForm({
        ...form,
        fileName: restored.fileName,
        fileUrl: restored.fileUrl,
        fileSizeBytes: restored.fileSizeBytes,
        uploadedAt: restored.uploadedAt,
        isActive: true,
      });
      onUpdate(form);
      showNotification(
        `Version ${version.versionNumber} ("${version.fileName}") restored as the active live resume!`,
        'success'
      );
    } catch (err: any) {
      showNotification('Restore failed: ' + (err.message || 'Error'), 'error');
    }
  };

  // ==========================================
  // 4. GOVERNANCE & ATS SETTINGS
  // ==========================================
  const handleSaveGovernance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await cmsService.updateResumeRecord(form);
      onUpdate(form);
      showNotification('Resume download governance updated globally.', 'success');
    } catch (err: any) {
      showNotification('Save failed: ' + (err.message || 'Error'), 'error');
    }
  };

  const handleSaveAtsSettings = async () => {
    setIsSavingAts(true);
    try {
      await cmsService.updateResumeGeneratorSettings(genSettings);
      showNotification('Dynamic ATS Resume Generator settings saved globally.', 'success');
    } catch (err: any) {
      showNotification('Failed to save ATS settings: ' + (err.message || 'Error'), 'error');
    } finally {
      setIsSavingAts(false);
    }
  };

  const handleAdminAtsDownloadPdf = () => {
    const data = extractResumeData(
      cmsService.getProfile(),
      cmsService.getAboutSettings(),
      cmsService.getExperiences(false),
      cmsService.getProjects(false),
      cmsService.getSkills(),
      cmsService.getEducation(),
      cmsService.getCertifications(false),
      genSettings
    );
    downloadPdf(data);
    showNotification('ATS Resume (PDF) downloaded successfully.', 'success');
  };

  const handleAdminAtsDownloadDocx = async () => {
    const data = extractResumeData(
      cmsService.getProfile(),
      cmsService.getAboutSettings(),
      cmsService.getExperiences(false),
      cmsService.getProjects(false),
      cmsService.getSkills(),
      cmsService.getEducation(),
      cmsService.getCertifications(false),
      genSettings
    );
    await downloadDocx(data);
    showNotification('ATS Resume (DOCX) downloaded successfully.', 'success');
  };

  const filteredDiffItems = currentDiffItems.filter((item) => {
    if (diffFilter !== 'all' && item.category !== diffFilter) return false;
    if (sectionFilter !== 'all' && item.section !== sectionFilter) return false;
    return true;
  });

  const countNew = currentDiffItems.filter((i) => i.category === 'new').length;
  const countChanged = currentDiffItems.filter((i) => i.category === 'changed').length;
  const countUnchanged = currentDiffItems.filter((i) => i.category === 'unchanged').length;
  const countApproved = currentDiffItems.filter((i) => i.status === 'approved' || i.status === 'edited').length;

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
      {/* Module Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          paddingBottom: '20px',
          borderBottom: '1px solid rgba(244, 243, 238, 0.08)',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#4ADE80',
                backgroundColor: 'rgba(34, 197, 94, 0.12)',
                padding: '2px 8px',
                borderRadius: '4px',
              }}
            >
              Enterprise Document Management &bull; Verified
            </span>
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '26px',
              fontWeight: 600,
              color: '#F4F3EE',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Resume Management &amp; Intelligent Extraction Engine
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: '#A7B0A9',
              margin: '4px 0 0',
            }}
          >
            Upload original resumes (PDF/DOCX/DOC), automatically extract career intelligence, review field diffs with conflict detection, and govern live public ATS downloads.
          </p>
        </div>

        {/* Global Quick Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setShowPreviewModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Eye size={13} /> View Current
          </button>
          <a
            href={form.fileUrl}
            download={form.fileName}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <Download size={13} /> Original
          </a>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '12px',
          overflowX: 'auto',
        }}
      >
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12.5px',
            fontWeight: 600,
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: activeTab === 'overview' ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
            color: activeTab === 'overview' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <FileText size={14} /> Active Resume &amp; Upload
        </button>

        <button
          onClick={() => setActiveTab('review')}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12.5px',
            fontWeight: 600,
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: activeTab === 'review' ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
            color: activeTab === 'review' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Sparkles size={14} color="#A78BFA" /> Review Extracted Data
          {currentDiffItems.length > 0 && (
            <span
              style={{
                fontSize: '11px',
                padding: '1px 6px',
                borderRadius: '10px',
                backgroundColor: 'rgba(167, 139, 250, 0.25)',
                color: '#C4B5FD',
              }}
            >
              {currentDiffItems.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('versions')}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12.5px',
            fontWeight: 600,
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: activeTab === 'versions' ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
            color: activeTab === 'versions' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Clock size={14} /> Version History ({versions.length})
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12.5px',
            fontWeight: 600,
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: activeTab === 'audit' ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
            color: activeTab === 'audit' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <History size={14} /> Audit Trail ({auditLog.length})
        </button>

        <button
          onClick={() => setActiveTab('ats_engine')}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12.5px',
            fontWeight: 600,
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: activeTab === 'ats_engine' ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
            color: activeTab === 'ats_engine' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <ShieldCheck size={14} color="#4ADE80" /> ATS Generator Engine
        </button>
      </div>

      {/* Upload Progress Alert */}
      {isUploading && (
        <div
          style={{
            backgroundColor: 'rgba(37, 99, 235, 0.12)',
            border: '1px solid rgba(37, 99, 235, 0.3)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#93C5FD' }}>{statusMessage}</span>
            <span style={{ fontSize: '12px', color: '#93C5FD' }}>{uploadProgress}%</span>
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${uploadProgress}%`,
                height: '100%',
                backgroundColor: '#3B82F6',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      )}

      {/* Recovery Banner for pending metadata */}
      {pendingMetadata && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '8px',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={24} color="#EF4444" />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#FCA5A5' }}>
                Database Metadata Synchronization Pending
              </div>
              <div style={{ fontSize: '12.5px', color: 'rgba(255, 255, 255, 0.75)', marginTop: '2px' }}>
                Your resume file was safely stored in Cloudflare R2 (<code style={{ color: '#93C5FD' }}>{pendingMetadata.objectKey}</code>), but saving metadata to Firestore was interrupted. You can retry database persistence without re-uploading the file.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRetryMetadataPersistence}
            disabled={isUploading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '6px',
              backgroundColor: '#EF4444',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={13} className={isUploading ? 'animate-spin' : ''} />
            Retry Metadata Persistence
          </button>
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(214, 168, 84, 0.12)',
                    border: '1px solid rgba(214, 168, 84, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-gold)',
                  }}
                >
                  <FileText size={24} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {isEditingDisplayName ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="text"
                          value={editingDisplayNameValue}
                          onChange={(e) => setEditingDisplayNameValue(e.target.value)}
                          placeholder="Enter display title"
                          style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            border: '1px solid rgba(255, 255, 255, 0.25)',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            color: '#FFFFFF',
                            fontSize: '14px',
                            fontWeight: 600,
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleSaveDisplayName}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '4px',
                            backgroundColor: '#4ADE80',
                            color: '#000000',
                            border: 'none',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <Save size={12} style={{ marginRight: '4px', display: 'inline' }} /> Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingDisplayNameValue(form.displayName || form.originalName || form.fileName);
                            setIsEditingDisplayName(false);
                          }}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: '#D9DDE3',
                            border: 'none',
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '18px',
                            fontWeight: 600,
                            color: '#F4F3EE',
                            margin: 0,
                          }}
                        >
                          {form.displayName || form.fileName}
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingDisplayNameValue(form.displayName || form.originalName || form.fileName);
                            setIsEditingDisplayName(true);
                          }}
                          title="Edit resume display title"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'rgba(255, 255, 255, 0.6)',
                            cursor: 'pointer',
                            padding: '2px 4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                          }}
                        >
                          <Edit2 size={13} />
                        </button>
                      </>
                    )}
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
                      &bull; Currently Active
                    </span>
                  </div>
                  {form.originalName && form.originalName !== form.displayName && (
                    <div style={{ fontSize: '11.5px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '2px' }}>
                      Source file: {form.originalName}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '12px', color: '#889196' }}>
                    <span>Size: {(form.fileSizeBytes / 1024).toFixed(1)} KB</span>
                    <span>&bull;</span>
                    <span>Uploaded: {form.uploadedAt}</span>
                    <span>&bull;</span>
                    <span>Public Button: &quot;{form.buttonText}&quot;</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleExtractCurrentResume}
                disabled={isUploading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  borderRadius: '6px',
                  backgroundColor: '#7C3AED',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
                }}
              >
                <Sparkles size={14} /> Extract Resume Information
              </button>
            </div>

            {/* Drag and Drop Upload Area */}
            <div
              style={{
                border: '2px dashed rgba(244, 243, 238, 0.18)',
                borderRadius: '8px',
                padding: '32px 24px',
                textAlign: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                marginTop: '12px',
              }}
            >
              <Upload size={32} color="#D9DDE3" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                Upload or Replace Verified Resume
              </div>
              <p style={{ fontSize: '12.5px', color: 'rgba(255, 255, 255, 0.6)', margin: '0 0 16px' }}>
                Supported Formats: PDF (.pdf), Microsoft Word (.docx), Legacy Word (.doc) &bull; Maximum file size: 20 MB
              </p>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 22px',
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                  color: '#000000',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Upload size={14} />
                Select File to Upload &amp; Extract
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>

          {/* LinkedIn Data Export Card */}
          <div
            style={{
              backgroundColor: 'rgba(18, 18, 22, 0.72)',
              border: '1px solid rgba(10, 102, 194, 0.25)',
              borderRadius: '8px',
              padding: '24px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(10, 102, 194, 0.15)',
                    border: '1px solid rgba(10, 102, 194, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0A66C2',
                  }}
                >
                  <Linkedin size={24} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 600, color: '#F4F3EE', margin: 0 }}>
                      LinkedIn Data Privacy Export Importer
                    </h3>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(10, 102, 194, 0.2)',
                        border: '1px solid rgba(10, 102, 194, 0.4)',
                        color: '#60A5FA',
                        fontSize: '11px',
                        fontWeight: 600,
                      }}
                    >
                      Production Importer
                    </span>
                  </div>
                  <p style={{ fontSize: '12.5px', color: '#A7B0A9', margin: '4px 0 0' }}>
                    Upload complete LinkedIn archive (.zip) or standalone CSVs (Positions, Education, Certifications, Skills, Projects).
                  </p>
                </div>
              </div>

              {linkedInReport && (
                <button
                  type="button"
                  onClick={() => setShowLinkedInModal(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(10, 102, 194, 0.25)',
                    border: '1px solid rgba(10, 102, 194, 0.5)',
                    color: '#93C5FD',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Eye size={13} /> View Pending Review ({linkedInReport.recordsExtracted})
                </button>
              )}
            </div>

            {/* LinkedIn Upload Progress */}
            {isProcessingLinkedIn && linkedInProgress && (
              <div
                style={{
                  backgroundColor: 'rgba(10, 102, 194, 0.1)',
                  border: '1px solid rgba(10, 102, 194, 0.3)',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#93C5FD', marginBottom: '6px' }}>
                  <span>{linkedInProgress.step}</span>
                  <span>{linkedInProgress.percent}%</span>
                </div>
                <div style={{ width: '100%', height: '5px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${linkedInProgress.percent}%`,
                      height: '100%',
                      backgroundColor: '#0A66C2',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            )}

            {/* LinkedIn Drop Area */}
            <div
              style={{
                border: '2px dashed rgba(10, 102, 194, 0.35)',
                borderRadius: '8px',
                padding: '28px 20px',
                textAlign: 'center',
                backgroundColor: 'rgba(10, 102, 194, 0.04)',
              }}
            >
              <Upload size={28} color="#60A5FA" style={{ margin: '0 auto 10px' }} />
              <div style={{ fontSize: '14.5px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                Drop LinkedIn Export Archive (.zip) or Individual CSV Files
              </div>
              <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', margin: '0 0 14px' }}>
                Supports official LinkedIn data dumps &bull; Decompression bomb &amp; traversal protected &bull; Max 50 MB
              </p>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 20px',
                  borderRadius: '6px',
                  backgroundColor: '#0A66C2',
                  color: '#FFFFFF',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: isProcessingLinkedIn ? 'not-allowed' : 'pointer',
                  opacity: isProcessingLinkedIn ? 0.6 : 1,
                }}
              >
                <Upload size={14} />
                Select LinkedIn Export Archive or CSV
                <input
                  type="file"
                  accept=".zip,.csv,application/zip,text/csv"
                  style={{ display: 'none' }}
                  onChange={handleLinkedInFileUpload}
                  disabled={isProcessingLinkedIn}
                />
              </label>
            </div>

            {/* Recent LinkedIn Import Audit Log */}
            {linkedInAuditLog.length > 0 && (
              <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)', marginBottom: '10px' }}>
                  Recent LinkedIn Import Runs ({linkedInAuditLog.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {linkedInAuditLog.slice(0, 3).map((audit) => (
                    <div
                      key={audit.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        backgroundColor: 'rgba(0, 0, 0, 0.25)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '6px',
                        fontSize: '12px',
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{audit.fileName}</span>
                        <span style={{ color: 'rgba(255, 255, 255, 0.5)', marginLeft: '8px' }}>({audit.sourceType.toUpperCase()})</span>
                        <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '11px', marginTop: '2px' }}>
                          {audit.details || `Imported ${audit.recordsApproved} approved records`}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ color: '#4ADE80', fontWeight: 600 }}>+{audit.recordsApproved} approved</span>
                        <div style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '11px', marginTop: '2px' }}>
                          {new Date(audit.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Governance Form */}
          <form
            onSubmit={handleSaveGovernance}
            style={{
              backgroundColor: 'rgba(18, 18, 22, 0.72)',
              border: '1px solid rgba(244, 243, 238, 0.12)',
              borderRadius: '8px',
              padding: '24px',
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#F4F3EE', marginBottom: '16px' }}>
              Public Website Download Governance
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#FFFFFF', marginBottom: '6px' }}>
                  Download CTA Button Text
                </label>
                <input
                  type="text"
                  value={form.buttonText}
                  onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '6px',
                    padding: '9px 12px',
                    color: '#FFFFFF',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#FFFFFF', marginBottom: '6px' }}>
                  Public Document Download Permission
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', fontSize: '13px', color: '#D9DDE3', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.isPublicEnabled}
                    onChange={(e) => setForm({ ...form, isPublicEnabled: e.target.checked })}
                  />
                  Enable Public Download for Visitors &amp; Recruiters
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 20px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Save size={14} /> Save Governance Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: REVIEW */}
      {activeTab === 'review' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              backgroundColor: 'rgba(18, 18, 22, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#A78BFA',
                    letterSpacing: '0.08em',
                  }}
                >
                  Extraction Review Mode
                </span>
                <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)' }}>&bull;</span>
                <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
                  {form.fileName}
                </span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
                Review Extracted Information vs Current CMS
              </h3>
              <p style={{ fontSize: '12.5px', color: 'rgba(255, 255, 255, 0.65)', margin: '4px 0 0' }}>
                Examine differences across New, Changed, and Unchanged fields. Unapproved changes will never overwrite your live website.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleApproveAll('new')}
                style={{
                  padding: '7px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  color: '#4ADE80',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Approve All New ({countNew})
              </button>
              <button
                type="button"
                onClick={() => handleApproveAll('changed')}
                style={{
                  padding: '7px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(234, 179, 8, 0.15)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  color: '#FACC15',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Approve All Changed ({countChanged})
              </button>
              <button
                type="button"
                onClick={handleRejectAll}
                style={{
                  padding: '7px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#F87171',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Reject All
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setDiffFilter('all')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: diffFilter === 'all' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.05)',
                  color: diffFilter === 'all' ? '#000000' : '#FFFFFF',
                }}
              >
                All Fields ({currentDiffItems.length})
              </button>
              <button
                onClick={() => setDiffFilter('new')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  backgroundColor: diffFilter === 'new' ? 'rgba(34, 197, 94, 0.25)' : 'rgba(34, 197, 94, 0.08)',
                  color: '#4ADE80',
                }}
              >
                New Information ({countNew})
              </button>
              <button
                onClick={() => setDiffFilter('changed')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  backgroundColor: diffFilter === 'changed' ? 'rgba(234, 179, 8, 0.25)' : 'rgba(234, 179, 8, 0.08)',
                  color: '#FACC15',
                }}
              >
                Changed Information ({countChanged})
              </button>
              <button
                onClick={() => setDiffFilter('unchanged')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: diffFilter === 'unchanged' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  color: '#9CA3AF',
                }}
              >
                Unchanged ({countUnchanged})
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>Section:</span>
              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                style={{
                  backgroundColor: '#0C0D12',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  borderRadius: '6px',
                  color: '#FFFFFF',
                  padding: '5px 10px',
                  fontSize: '12px',
                }}
              >
                <option value="all">All Sections</option>
                <option value="profile">Profile &amp; Contact</option>
                <option value="summary">Professional Summary</option>
                <option value="experience">Work Experience</option>
                <option value="skills">Skills</option>
                <option value="projects">Projects</option>
                <option value="education">Education</option>
                <option value="certifications">Certifications</option>
              </select>
            </div>
          </div>

          {filteredDiffItems.length === 0 ? (
            <div
              style={{
                backgroundColor: 'rgba(18, 18, 22, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '40px',
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.6)',
              }}
            >
              No extraction items match the selected filter.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredDiffItems.map((item) => {
                const isNew = item.category === 'new';
                const isChanged = item.category === 'changed';
                const isApproved = item.status === 'approved' || item.status === 'edited';
                const isRejected = item.status === 'rejected';
                const isLowConfidence = item.confidence < 0.75;

                return (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: 'rgba(18, 18, 22, 0.75)',
                      border: isApproved
                        ? '1px solid rgba(34, 197, 94, 0.4)'
                        : isRejected
                        ? '1px solid rgba(239, 68, 68, 0.3)'
                        : isNew
                        ? '1px solid rgba(34, 197, 94, 0.2)'
                        : isChanged
                        ? '1px solid rgba(234, 179, 8, 0.2)'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      padding: '16px 20px',
                      transition: 'border-color 0.2s ease',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '10px',
                        flexWrap: 'wrap',
                        gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: isNew
                              ? 'rgba(34, 197, 94, 0.2)'
                              : isChanged
                              ? 'rgba(234, 179, 8, 0.2)'
                              : 'rgba(255, 255, 255, 0.08)',
                            color: isNew ? '#4ADE80' : isChanged ? '#FACC15' : '#9CA3AF',
                          }}
                        >
                          {item.category}
                        </span>

                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
                          {item.label}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {isLowConfidence && (
                          <span
                            style={{
                              fontSize: '11px',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(239, 68, 68, 0.2)',
                              color: '#F87171',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <AlertTriangle size={11} /> Low Confidence
                          </span>
                        )}
                        <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>
                          Confidence: {(item.confidence * 100).toFixed(0)}%
                        </span>
                        <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)' }}>
                          &bull; {item.source}
                        </span>
                      </div>
                    </div>

                    {item.conflictWarning && (
                      <div
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          marginBottom: '10px',
                          fontSize: '12px',
                          color: '#FCA5A5',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <AlertTriangle size={14} color="#F87171" />
                        <span>{item.conflictWarning}</span>
                      </div>
                    )}

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '14px',
                        marginBottom: '14px',
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.35)',
                          padding: '10px 14px',
                          borderRadius: '6px',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                        }}
                      >
                        <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.45)', marginBottom: '4px' }}>
                          Current Live CMS Value:
                        </div>
                        <div
                          style={{
                            fontSize: '13px',
                            color: isChanged ? '#FCA5A5' : 'rgba(255, 255, 255, 0.85)',
                            textDecoration: isChanged && isApproved ? 'line-through' : 'none',
                            lineHeight: 1.4,
                          }}
                        >
                          {item.existingValue ? String(item.existingValue) : '(Empty / None)'}
                        </div>
                      </div>

                      <div
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.35)',
                          padding: '10px 14px',
                          borderRadius: '6px',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                        }}
                      >
                        <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.45)', marginBottom: '4px' }}>
                          Extracted from Resume:
                        </div>
                        {editingItemId === item.id ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <textarea
                              rows={2}
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              style={{
                                width: '100%',
                                backgroundColor: '#000000',
                                border: '1px solid #3B82F6',
                                borderRadius: '4px',
                                color: '#FFFFFF',
                                fontSize: '12.5px',
                                padding: '6px 8px',
                              }}
                            />
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                onClick={() => handleSaveEdit(item.id)}
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '4px',
                                  backgroundColor: '#22C55E',
                                  border: 'none',
                                  color: '#000000',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingItemId(null)}
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '4px',
                                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                  border: 'none',
                                  color: '#FFFFFF',
                                  fontSize: '11px',
                                  cursor: 'pointer',
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            style={{
                              fontSize: '13px',
                              color: isNew || isChanged ? '#86EFAC' : '#FFFFFF',
                              fontWeight: isNew || isChanged ? 500 : 400,
                              lineHeight: 1.4,
                            }}
                          >
                            {item.status === 'edited'
                              ? `${item.currentReviewValue} (Edited)`
                              : String(item.extractedValue)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '8px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                        flexWrap: 'wrap',
                        gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>Decision:</span>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: isApproved ? '#4ADE80' : isRejected ? '#F87171' : '#FACC15',
                          }}
                        >
                          {item.status.toUpperCase()}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleItemStatusChange(item.id, 'approved')}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            backgroundColor: isApproved ? '#22C55E' : 'rgba(255, 255, 255, 0.08)',
                            color: isApproved ? '#000000' : '#FFFFFF',
                            border: 'none',
                          }}
                        >
                          <Check size={12} /> Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleItemStatusChange(item.id, 'rejected')}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            backgroundColor: isRejected ? '#EF4444' : 'rgba(255, 255, 255, 0.08)',
                            color: '#FFFFFF',
                            border: 'none',
                          }}
                        >
                          <X size={12} /> Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(item)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            fontSize: '11.5px',
                            cursor: 'pointer',
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            color: '#FFFFFF',
                            border: 'none',
                          }}
                        >
                          <Edit2 size={11} /> Edit
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sticky Publishing Bar */}
          <div
            style={{
              position: 'sticky',
              bottom: '16px',
              backgroundColor: '#0C0D12',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              borderRadius: '10px',
              padding: '16px 20px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              zIndex: 30,
            }}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
                {countApproved} of {currentDiffItems.length} Fields Approved
              </div>
              <div style={{ fontSize: '11.5px', color: 'rgba(255, 255, 255, 0.6)' }}>
                Approved fields will be merged safely into existing Firestore models without replacing intact records.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={handleSaveReviewDraft}
                style={{
                  padding: '9px 16px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Save Review Draft
              </button>
              <button
                type="button"
                onClick={handlePublishApproved}
                disabled={isApplyingChanges || countApproved === 0}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 22px',
                  borderRadius: '6px',
                  backgroundColor: countApproved > 0 ? '#FFFFFF' : 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: '#000000',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: countApproved > 0 ? 'pointer' : 'not-allowed',
                }}
              >
                <CheckCircle2 size={15} />
                {isApplyingChanges ? 'Publishing Approved...' : 'Publish Approved Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VERSIONS */}
      {activeTab === 'versions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              backgroundColor: 'rgba(18, 18, 22, 0.72)',
              border: '1px solid rgba(244, 243, 238, 0.08)',
              borderRadius: '8px',
              padding: '24px',
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
                Resume Version History &amp; Rollback Archive
              </h3>
              <p style={{ fontSize: '12.5px', color: 'rgba(255, 255, 255, 0.6)', margin: '4px 0 0' }}>
                Every uploaded resume creates an immutable version record. You can restore any previous version as the live document at any time.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {versions.map((ver) => {
                const isActive = ver.id === form.id || ver.isActive;
                return (
                  <div
                    key={ver.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      backgroundColor: '#0E1412',
                      borderRadius: '8px',
                      border: isActive
                        ? '1px solid rgba(74, 180, 120, 0.4)'
                        : '1px solid rgba(244, 243, 238, 0.06)',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '6px',
                          backgroundColor: isActive ? 'rgba(74, 180, 120, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isActive ? '#6CE098' : '#D9DDE3',
                        }}
                      >
                        <FileText size={20} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
                            {ver.fileName}
                          </span>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 600,
                              padding: '1px 6px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              color: '#D9DDE3',
                            }}
                          >
                            v{ver.versionNumber}
                          </span>
                          {isActive && (
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 600,
                                padding: '1px 7px',
                                borderRadius: '10px',
                                backgroundColor: 'rgba(74, 180, 120, 0.2)',
                                color: '#6CE098',
                              }}
                            >
                              &bull; Active
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: '#889196', marginTop: '2px' }}>
                          Uploaded {ver.uploadedAt} by {ver.uploadedBy || 'Admin'} &bull;{' '}
                          {(ver.fileSizeBytes / 1024).toFixed(0)} KB &bull; Status:{' '}
                          {ver.processingStatus || 'published'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {!isActive && (
                        <button
                          type="button"
                          onClick={() => handleRestoreVersion(ver)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            color: '#FFFFFF',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <RotateCcw size={12} /> Restore This Version
                        </button>
                      )}
                      <a
                        href={ver.fileUrl}
                        download={ver.fileName}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '4px',
                          backgroundColor: 'transparent',
                          color: '#93C5FD',
                          fontSize: '11.5px',
                          textDecoration: 'none',
                        }}
                      >
                        Download Original
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOG */}
      {activeTab === 'audit' && (
        <div
          style={{
            backgroundColor: 'rgba(18, 18, 22, 0.72)',
            border: '1px solid rgba(244, 243, 238, 0.08)',
            borderRadius: '8px',
            padding: '24px',
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
              Resume Extraction &amp; Modification Audit Trail
            </h3>
            <p style={{ fontSize: '12.5px', color: 'rgba(255, 255, 255, 0.6)', margin: '4px 0 0' }}>
              Complete record of all resume uploads, approved field merges, rejected changes, and document restorations.
            </p>
          </div>

          {auditLog.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'rgba(255, 255, 255, 0.5)', fontSize: '13px' }}>
              No audit entries recorded yet. Upload a resume or approve extracted fields to populate the log.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {auditLog.map((log) => (
                <div
                  key={log.id}
                  style={{
                    padding: '14px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
                      {log.action}
                    </span>
                    <span style={{ fontSize: '11.5px', color: 'rgba(255, 255, 255, 0.45)' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#93C5FD', marginBottom: '4px' }}>
                    File: {log.fileName} (v{log.versionNumber}) &bull; Approved: {log.approvedFieldsCount} &bull; Rejected: {log.rejectedFieldsCount}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.4 }}>
                    {log.details}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: ATS ENGINE */}
      {activeTab === 'ats_engine' && (
        <div
          style={{
            backgroundColor: 'rgba(18, 18, 22, 0.72)',
            border: '1px solid rgba(217, 221, 227, 0.16)',
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
              paddingBottom: '16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(34, 197, 94, 0.12)',
                  border: '1px solid rgba(34, 197, 94, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4ADE80',
                }}
              >
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
                  Dynamic ATS Resume Generator Engine
                </h3>
                <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', margin: '2px 0 0' }}>
                  Powers the live &quot;Generate My Resume&quot; modal with on-the-fly A4 PDF and DOCX generation from authoritative CMS data.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setShowAtsModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Eye size={13} /> Preview Public Modal
              </button>
              <button
                type="button"
                onClick={handleAdminAtsDownloadPdf}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                  border: 'none',
                  color: '#000000',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Download size={13} /> Download PDF
              </button>
              <button
                type="button"
                onClick={handleAdminAtsDownloadDocx}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(37, 99, 235, 0.2)',
                  border: '1px solid rgba(37, 99, 235, 0.4)',
                  color: '#93C5FD',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <FileCheck size={13} /> Download DOCX
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF', marginBottom: '12px' }}>
                Included Sections in Generated ATS Resume
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#D9DDE3', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={genSettings.includeSummary}
                    onChange={(e) => setGenSettings({ ...genSettings, includeSummary: e.target.checked })}
                  />
                  Professional Summary
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#D9DDE3', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={genSettings.includeSkills}
                    onChange={(e) => setGenSettings({ ...genSettings, includeSkills: e.target.checked })}
                  />
                  Core Competencies &amp; Technical Skills
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#D9DDE3', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={genSettings.includeExperience}
                    onChange={(e) => setGenSettings({ ...genSettings, includeExperience: e.target.checked })}
                  />
                  Work Experience (Published items)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#D9DDE3', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={genSettings.includeProjects}
                    onChange={(e) => setGenSettings({ ...genSettings, includeProjects: e.target.checked })}
                  />
                  Notable Projects &amp; Systems (Published items)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#D9DDE3', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={genSettings.includeEducation}
                    onChange={(e) => setGenSettings({ ...genSettings, includeEducation: e.target.checked })}
                  />
                  Education
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#D9DDE3', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={genSettings.includeCertifications}
                    onChange={(e) => setGenSettings({ ...genSettings, includeCertifications: e.target.checked })}
                  />
                  Certifications &amp; Credentials
                </label>
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF', marginBottom: '12px' }}>
                Contact Information Privacy Controls
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#D9DDE3', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={genSettings.includeContactInfo.email}
                    onChange={(e) =>
                      setGenSettings({
                        ...genSettings,
                        includeContactInfo: { ...genSettings.includeContactInfo, email: e.target.checked },
                      })
                    }
                  />
                  Include Email Address
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#D9DDE3', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={genSettings.includeContactInfo.phone}
                    onChange={(e) =>
                      setGenSettings({
                        ...genSettings,
                        includeContactInfo: { ...genSettings.includeContactInfo, phone: e.target.checked },
                      })
                    }
                  />
                  Include Phone Number
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#D9DDE3', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={genSettings.includeContactInfo.location}
                    onChange={(e) =>
                      setGenSettings({
                        ...genSettings,
                        includeContactInfo: { ...genSettings.includeContactInfo, location: e.target.checked },
                      })
                    }
                  />
                  Include Location
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#D9DDE3', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={genSettings.includeContactInfo.linkedin}
                    onChange={(e) =>
                      setGenSettings({
                        ...genSettings,
                        includeContactInfo: { ...genSettings.includeContactInfo, linkedin: e.target.checked },
                      })
                    }
                  />
                  Include LinkedIn Profile Link
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#D9DDE3', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={genSettings.includeContactInfo.github}
                    onChange={(e) =>
                      setGenSettings({
                        ...genSettings,
                        includeContactInfo: { ...genSettings.includeContactInfo, github: e.target.checked },
                      })
                    }
                  />
                  Include GitHub Profile Link
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#D9DDE3', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={genSettings.includeContactInfo.portfolio}
                    onChange={(e) =>
                      setGenSettings({
                        ...genSettings,
                        includeContactInfo: { ...genSettings.includeContactInfo, portfolio: e.target.checked },
                      })
                    }
                  />
                  Include Portfolio Website URL
                </label>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#FFFFFF', marginBottom: '6px' }}>
              Custom ATS Summary Override (Optional &mdash; leave empty to use live About Bio)
            </label>
            <textarea
              rows={3}
              value={genSettings.customSummary || ''}
              onChange={(e) => setGenSettings({ ...genSettings, customSummary: e.target.value })}
              placeholder="Leave empty to automatically compile from About Bio & Profile Headline..."
              style={{
                width: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                padding: '10px 12px',
                color: '#FFFFFF',
                fontSize: '12.5px',
                fontFamily: 'var(--font-body)',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleSaveAtsSettings}
              disabled={isSavingAts}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 20px',
                borderRadius: '6px',
                backgroundColor: '#FFFFFF',
                border: 'none',
                color: '#000000',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Save size={14} />
              {isSavingAts ? 'Saving ATS Settings...' : 'Save & Publish ATS Settings'}
            </button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
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

      {/* ATS Generator Modal */}
      {/* LinkedIn Export Review Workspace Modal */}
      {showLinkedInModal && linkedInReport && (
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
              backgroundColor: '#121216',
              border: '1px solid rgba(10, 102, 194, 0.35)',
              borderRadius: '12px',
              maxWidth: '1000px',
              width: '100%',
              height: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'rgba(10, 102, 194, 0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(10, 102, 194, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0A66C2',
                  }}
                >
                  <Linkedin size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: '#FFFFFF' }}>
                    LinkedIn Data Export Review Workspace
                  </h3>
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginTop: '2px' }}>
                    Archive: <span style={{ color: '#93C5FD' }}>{linkedInReport.archiveName}</span> &bull; {linkedInReport.recordsExtracted} records discovered across {linkedInReport.filesRecognized.length} files
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleBulkApproveLinkedIn}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(34, 197, 94, 0.15)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    color: '#4ADE80',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Approve Non-Duplicates
                </button>
                <button
                  onClick={() => setShowLinkedInModal(false)}
                  style={{ background: 'none', border: 'none', color: '#A7B0A9', cursor: 'pointer', padding: '6px' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Sub-navigation tabs */}
            <div
              style={{
                display: 'flex',
                gap: '4px',
                padding: '10px 24px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                overflowX: 'auto',
              }}
            >
              {[
                { id: 'overview', label: 'Summary', count: linkedInReport.recordsExtracted },
                { id: 'experience', label: 'Experience', count: linkedInReport.records.filter((r) => r.category === 'experience').length },
                { id: 'education', label: 'Education', count: linkedInReport.records.filter((r) => r.category === 'education').length },
                { id: 'certifications', label: 'Certifications', count: linkedInReport.records.filter((r) => r.category === 'certifications').length },
                { id: 'skills', label: 'Skills', count: linkedInReport.records.filter((r) => r.category === 'skills').length },
                { id: 'projects', label: 'Projects', count: linkedInReport.records.filter((r) => r.category === 'projects').length },
                { id: 'warnings', label: 'Notes & Warnings', count: linkedInReport.warnings.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setLinkedInActiveTab(tab.id as any)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: linkedInActiveTab === tab.id ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                    color: linkedInActiveTab === tab.id ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>{tab.label}</span>
                  <span
                    style={{
                      fontSize: '10.5px',
                      padding: '1px 6px',
                      borderRadius: '10px',
                      backgroundColor: linkedInActiveTab === tab.id ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                      color: '#FFFFFF',
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              {linkedInActiveTab === 'overview' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                    <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '16px' }}>
                      <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Discovered</div>
                      <div style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF', marginTop: '4px' }}>{linkedInReport.recordsExtracted}</div>
                    </div>
                    <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '8px', padding: '16px' }}>
                      <div style={{ fontSize: '11px', color: '#4ADE80', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Approved for Publishing</div>
                      <div style={{ fontSize: '24px', fontWeight: 700, color: '#4ADE80', marginTop: '4px' }}>
                        {linkedInReport.records.filter((r) => r.status === 'approved').length}
                      </div>
                    </div>
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', padding: '16px' }}>
                      <div style={{ fontSize: '11px', color: '#F87171', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rejected / Excluded</div>
                      <div style={{ fontSize: '24px', fontWeight: 700, color: '#F87171', marginTop: '4px' }}>
                        {linkedInReport.records.filter((r) => r.status === 'rejected').length}
                      </div>
                    </div>
                    <div style={{ backgroundColor: 'rgba(234, 179, 8, 0.08)', border: '1px solid rgba(234, 179, 8, 0.2)', borderRadius: '8px', padding: '16px' }}>
                      <div style={{ fontSize: '11px', color: '#FBBF24', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Existing CMS Matches</div>
                      <div style={{ fontSize: '24px', fontWeight: 700, color: '#FBBF24', marginTop: '4px' }}>
                        {linkedInReport.records.filter((r) => r.existingMatch != null).length}
                      </div>
                    </div>
                  </div>

                  <h4 style={{ fontSize: '14px', color: '#FFFFFF', margin: '0 0 12px' }}>Recognized Files in Archive</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                    {linkedInReport.filesRecognized.map((f) => (
                      <span
                        key={f}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          fontSize: '12px',
                          color: '#D9DDE3',
                        }}
                      >
                        ✓ {f}
                      </span>
                    ))}
                  </div>

                  {linkedInReport.warnings.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '14px', color: '#FBBF24', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AlertTriangle size={15} /> Extraction Diagnostics &amp; Warnings
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {linkedInReport.warnings.map((w, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '10px 14px',
                              borderRadius: '6px',
                              backgroundColor: 'rgba(234, 179, 8, 0.08)',
                              border: '1px solid rgba(234, 179, 8, 0.2)',
                              fontSize: '12px',
                              color: '#FDE68A',
                            }}
                          >
                            {w}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {linkedInActiveTab === 'warnings' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {linkedInReport.warnings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.5)' }}>
                      No warnings or unmapped headers detected in this export.
                    </div>
                  ) : (
                    linkedInReport.warnings.map((w, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '12px 16px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(234, 179, 8, 0.08)',
                          border: '1px solid rgba(234, 179, 8, 0.2)',
                          fontSize: '12.5px',
                          color: '#FDE68A',
                        }}
                      >
                        {w}
                      </div>
                    ))
                  )}
                </div>
              )}

              {['experience', 'education', 'certifications', 'skills', 'projects'].includes(linkedInActiveTab) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {linkedInReport.records
                    .filter((r) => r.category === linkedInActiveTab)
                    .map((item) => (
                      <div
                        key={item.id}
                        style={{
                          backgroundColor: item.status === 'approved' ? 'rgba(34, 197, 94, 0.05)' : item.status === 'rejected' ? 'rgba(239, 68, 68, 0.04)' : 'rgba(255, 255, 255, 0.03)',
                          border: `1px solid ${
                            item.status === 'approved'
                              ? 'rgba(34, 197, 94, 0.3)'
                              : item.status === 'rejected'
                              ? 'rgba(239, 68, 68, 0.2)'
                              : 'rgba(255, 255, 255, 0.08)'
                          }`,
                          borderRadius: '8px',
                          padding: '16px 20px',
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: '16px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: '240px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: item.suggestedAction === 'create' ? 'rgba(34, 197, 94, 0.15)' : item.suggestedAction === 'update' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(156, 163, 175, 0.15)',
                                color: item.suggestedAction === 'create' ? '#4ADE80' : item.suggestedAction === 'update' ? '#60A5FA' : '#9CA3AF',
                              }}
                            >
                              Action: {item.suggestedAction.toUpperCase()}
                            </span>

                            {item.existingMatch && (
                              <span
                                style={{
                                  fontSize: '11px',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  backgroundColor: 'rgba(234, 179, 8, 0.15)',
                                  color: '#FBBF24',
                                }}
                              >
                                Match: {item.existingMatch.jobTitle || item.existingMatch.employer || item.existingMatch.school || item.existingMatch.name || item.existingMatch.id}
                              </span>
                            )}

                            <span
                              style={{
                                fontSize: '11px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: item.status === 'approved' ? 'rgba(34, 197, 94, 0.2)' : item.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                                color: item.status === 'approved' ? '#4ADE80' : item.status === 'rejected' ? '#F87171' : '#FFFFFF',
                              }}
                            >
                              Status: {item.status.toUpperCase()}
                            </span>
                          </div>

                          <div style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>
                            {item.data.jobTitle || item.data.title || item.data.name || item.data.degree || 'Untitled'}
                          </div>
                          {(item.data.employer || item.data.company || item.data.school || item.data.authority) && (
                            <div style={{ fontSize: '13px', color: '#93C5FD', marginTop: '2px' }}>
                              {item.data.employer || item.data.company || item.data.school || item.data.authority}
                            </div>
                          )}
                          {(item.data.startDate || item.data.startedOn || item.data.endDate || item.data.finishedOn) && (
                            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '2px' }}>
                              {item.data.startDate || item.data.startedOn || ''} &mdash; {item.data.isCurrent ? 'Present' : item.data.endDate || item.data.finishedOn || ''}
                            </div>
                          )}
                          {(item.data.description || item.data.notes || item.data.summary) && (
                            <div style={{ fontSize: '12.5px', color: 'rgba(255, 255, 255, 0.7)', marginTop: '8px', lineHeight: 1.5, maxHeight: '80px', overflowY: 'auto' }}>
                              {item.data.description || item.data.notes || item.data.summary}
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleSetLinkedInItemStatus(item.id, 'approved')}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '4px',
                              border: 'none',
                              backgroundColor: item.status === 'approved' ? '#22C55E' : 'rgba(255, 255, 255, 0.08)',
                              color: item.status === 'approved' ? '#000000' : 'rgba(255, 255, 255, 0.8)',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetLinkedInItemStatus(item.id, 'rejected')}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '4px',
                              border: 'none',
                              backgroundColor: item.status === 'rejected' ? '#EF4444' : 'rgba(255, 255, 255, 0.08)',
                              color: item.status === 'rejected' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
              }}
            >
              <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
                Approved: <strong style={{ color: '#4ADE80' }}>{linkedInReport.records.filter((r) => r.status === 'approved').length}</strong> of {linkedInReport.records.length} records
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowLinkedInModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    backgroundColor: 'transparent',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handlePublishApprovedLinkedIn}
                  disabled={isPublishingLinkedIn || linkedInReport.records.filter((r) => r.status === 'approved').length === 0}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#0A66C2',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: linkedInReport.records.filter((r) => r.status === 'approved').length === 0 ? 'not-allowed' : 'pointer',
                    opacity: linkedInReport.records.filter((r) => r.status === 'approved').length === 0 ? 0.5 : 1,
                  }}
                >
                  <Save size={14} />
                  {isPublishingLinkedIn
                    ? 'Publishing to CMS...'
                    : `Publish ${linkedInReport.records.filter((r) => r.status === 'approved').length} Approved to CMS`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ATS Generator Modal */}
      <ResumeGeneratorModal
        isOpen={showAtsModal}
        onClose={() => setShowAtsModal(false)}
        profile={cmsService.getProfile()}
        about={cmsService.getAboutSettings()}
        experiences={cmsService.getExperiences(false)}
        projects={cmsService.getProjects(false)}
        skills={cmsService.getSkills()}
        education={cmsService.getEducation()}
        certifications={cmsService.getCertifications(false)}
        settings={genSettings}
      />
    </div>
  );
};
