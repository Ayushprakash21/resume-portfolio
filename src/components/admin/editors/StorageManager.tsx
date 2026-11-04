import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Play,
  HardDrive,
  FileText,
  Image as ImageIcon,
  Lock,
  Unlock,
  Trash2,
  ExternalLink,
  Shield,
  Layers,
  ArrowRight,
  Database,
} from 'lucide-react';
import { storageClient } from '../../../services/storage/storageClient';
import { storageMigrationEngine } from '../../../services/storage/storageMigration';
import {
  StorageStatus,
  MigrationInventoryItem,
  MigrationReport,
} from '../../../services/storage/storageTypes';

interface StorageManagerProps {
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const StorageManager: React.FC<StorageManagerProps> = ({ onNotify }) => {
  const [status, setStatus] = useState<StorageStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  // Migration states
  const [inventory, setInventory] = useState<MigrationInventoryItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState<{ current: number; total: number; currentItem?: string } | null>(null);
  const [isDryRun, setIsDryRun] = useState(false);
  const [latestReport, setLatestReport] = useState<MigrationReport | null>(null);

  // Live R2 Objects browser
  const [r2Objects, setR2Objects] = useState<any[]>([]);
  const [isLoadingObjects, setIsLoadingObjects] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'migration' | 'browser'>('overview');

  const loadStatus = async (force = true) => {
    setIsLoadingStatus(true);
    try {
      const data = await storageClient.getStorageStatus(force);
      setStatus(data);
    } catch {
      onNotify('Failed to fetch R2 storage status.', 'error');
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const loadR2Objects = async () => {
    setIsLoadingObjects(true);
    try {
      const res = await fetch('/api/storage/list', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setR2Objects(data.objects || []);
      }
    } catch (err) {
      console.warn('Unable to load R2 objects list:', err);
    } finally {
      setIsLoadingObjects(false);
    }
  };

  const scanInventory = async () => {
    setIsScanning(true);
    try {
      const items = await storageMigrationEngine.scanInventory();
      setInventory(items);
      onNotify(`Discovered ${items.length} file references across portfolio CMS.`, 'info');
    } catch {
      onNotify('Error scanning storage inventory.', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    loadStatus();
    scanInventory();
    loadR2Objects();
  }, []);

  const handleRunMigration = async () => {
    if (isMigrating) return;
    setIsMigrating(true);
    setMigrationProgress({ current: 0, total: inventory.length });

    try {
      const report = await storageMigrationEngine.runFullMigration(
        (prog) => {
          setMigrationProgress({
            current: prog.current,
            total: prog.total,
            currentItem: prog.item.originalName,
          });
        },
        isDryRun
      );

      setLatestReport(report);
      setInventory([...report.items]);
      await loadStatus(true);
      await loadR2Objects();

      if (isDryRun) {
        onNotify(`Dry-run simulation complete: ${report.successfullyVerified} files verified. Zero writes made.`, 'info');
      } else {
        onNotify(`Migration complete: ${report.successfullyMigrated} files stored in Cloudflare R2!`, 'success');
      }
    } catch (err: any) {
      onNotify(`Migration interrupted: ${err.message}`, 'error');
    } finally {
      setIsMigrating(false);
      setMigrationProgress(null);
    }
  };

  const handleDeleteObject = async (objectKey: string) => {
    if (!window.confirm(`Are you sure you want to delete object "${objectKey}" from Cloudflare R2?`)) {
      return;
    }
    const success = await storageClient.deleteFile(objectKey);
    if (success) {
      onNotify(`Deleted "${objectKey}" from Cloudflare R2.`, 'success');
      setR2Objects((prev) => prev.filter((o) => o.key !== objectKey));
      loadStatus(true);
    } else {
      onNotify(`Failed to delete "${objectKey}".`, 'error');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <Cloud size={24} color="#60A5FA" />
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#F3F4F6', margin: 0 }}>
              Cloudflare R2 Storage Architecture
            </h1>
            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '12px',
                background: status?.connected ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: status?.connected ? '#4ADE80' : '#F87171',
                border: `1px solid ${status?.connected ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                fontWeight: '600',
              }}
            >
              {status?.connected ? '● LIVE R2 BUCKET CONNECTED' : '● DISCONNECTED'}
            </span>
          </div>
          <p style={{ color: '#9CA3AF', fontSize: '13px', margin: 0 }}>
            Centralized zero-egress object storage for portfolio media, original resumes, project assets, and credentials.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => {
              loadStatus(true);
              scanInventory();
              loadR2Objects();
            }}
            disabled={isLoadingStatus}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '6px',
              background: '#1F2937',
              color: '#E5E7EB',
              border: '1px solid #374151',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={13} className={isLoadingStatus ? 'animate-spin' : ''} />
            Refresh Status
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #1F2937', paddingBottom: '12px', marginBottom: '24px' }}>
        {[
          { id: 'overview', label: 'Storage Overview', icon: HardDrive },
          { id: 'migration', label: `Migration Engine (${inventory.length})`, icon: Database },
          { id: 'browser', label: `R2 Bucket Browser (${r2Objects.length})`, icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '6px',
                background: isActive ? '#2563EB' : 'transparent',
                color: isActive ? '#FFFFFF' : '#9CA3AF',
                border: 'none',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div>
          {/* Key Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: '#111827', border: '1px solid #1F2937', borderRadius: '8px', padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '500' }}>Active Storage Bucket</span>
                <Cloud size={16} color="#60A5FA" />
              </div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#F9FAFB', fontFamily: 'monospace' }}>
                {status?.bucket || 'portfolio-assets'}
              </div>
              <div style={{ fontSize: '11px', color: '#4ADE80', marginTop: '6px' }}>
                Cloudflare Workers Binding: PORTFOLIO_ASSETS
              </div>
            </div>

            <div style={{ background: '#111827', border: '1px solid #1F2937', borderRadius: '8px', padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '500' }}>Total Objects Stored</span>
                <Layers size={16} color="#A78BFA" />
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#F9FAFB' }}>
                {status?.fileCount ?? r2Objects.length}
              </div>
              <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '6px' }}>
                Across public and private quadrants
              </div>
            </div>

            <div style={{ background: '#111827', border: '1px solid #1F2937', borderRadius: '8px', padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '500' }}>Total Storage Size</span>
                <HardDrive size={16} color="#34D399" />
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#F9FAFB' }}>
                {formatBytes(status?.totalSizeBytes || 0)}
              </div>
              <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '6px' }}>
                Zero egress fees on Cloudflare edge
              </div>
            </div>

            <div style={{ background: '#111827', border: '1px solid #1F2937', borderRadius: '8px', padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '500' }}>Migration Status</span>
                <Shield size={16} color="#FBBF24" />
              </div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#F9FAFB' }}>
                {inventory.filter((i) => i.status === 'verified' || i.status === 'reference-updated').length} / {inventory.length} Verified
              </div>
              <div style={{ fontSize: '11px', color: '#FBBF24', marginTop: '6px' }}>
                Firestore source of truth synchronized
              </div>
            </div>
          </div>

          {/* Architecture Details Panel */}
          <div style={{ background: '#111827', border: '1px solid #1F2937', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#F3F4F6', marginBottom: '14px' }}>
              Security & Access Policy
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#0B0F17', padding: '14px', borderRadius: '6px', border: '1px solid #1E293B' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Lock size={15} color="#F87171" />
                  <span style={{ fontWeight: '600', fontSize: '13px', color: '#F87171' }}>Private Quadrant</span>
                </div>
                <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '0 0 8px', lineHeight: '1.5' }}>
                  Enforces authenticated administrator session via <code>/api/storage/secure/*</code>. Direct public URL access is strictly denied (HTTP 403).
                </p>
                <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>
                  Paths: private/resumes/*, private/documents/*, private/certifications/*
                </div>
              </div>

              <div style={{ background: '#0B0F17', padding: '14px', borderRadius: '6px', border: '1px solid #1E293B' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Unlock size={15} color="#4ADE80" />
                  <span style={{ fontWeight: '600', fontSize: '13px', color: '#4ADE80' }}>Public Quadrant</span>
                </div>
                <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '0 0 8px', lineHeight: '1.5' }}>
                  Served via edge-cached routes <code>/api/storage/files/*</code> with optimal immutable caching (max-age 86400, s-maxage 604800).
                </p>
                <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>
                  Paths: public/profile/*, public/projects/*, public/experience/*, public/media/*
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MIGRATION ENGINE */}
      {activeTab === 'migration' && (
        <div style={{ background: '#111827', border: '1px solid #1F2937', borderRadius: '8px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#F3F4F6', margin: '0 0 4px' }}>
                Automated Storage Migration Utility
              </h3>
              <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
                Scans existing Firestore documents and safely transfers legacy files (Firebase Storage, base64 payloads) into Cloudflare R2.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#D1D5DB', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isDryRun}
                  onChange={(e) => setIsDryRun(e.target.checked)}
                  disabled={isMigrating}
                />
                Dry-Run Mode (Simulation Only)
              </label>

              <button
                onClick={handleRunMigration}
                disabled={isMigrating || inventory.length === 0}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 18px',
                  borderRadius: '6px',
                  background: isMigrating ? '#4B5563' : isDryRun ? '#D97706' : '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: isMigrating ? 'not-allowed' : 'pointer',
                }}
              >
                {isMigrating ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Migrating...
                  </>
                ) : (
                  <>
                    <Play size={14} />
                    {isDryRun ? 'Run Dry-Run Simulation' : 'Execute Full Migration to R2'}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          {migrationProgress && (
            <div style={{ background: '#0B0F17', padding: '14px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #1F2937' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#E5E7EB', marginBottom: '8px' }}>
                <span>Processing item: <strong>{migrationProgress.currentItem || 'Initializing...'}</strong></span>
                <span>{migrationProgress.current} / {migrationProgress.total} ({Math.round((migrationProgress.current / migrationProgress.total) * 100)}%)</span>
              </div>
              <div style={{ height: '6px', background: '#374151', borderRadius: '3px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.round((migrationProgress.current / migrationProgress.total) * 100)}%`,
                    background: '#3B82F6',
                    transition: 'width 0.2s ease',
                  }}
                />
              </div>
            </div>
          )}

          {/* Migration Report Alert */}
          {latestReport && (
            <div
              style={{
                background: latestReport.failed > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                border: `1px solid ${latestReport.failed > 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
                padding: '12px 16px',
                borderRadius: '6px',
                marginBottom: '20px',
                fontSize: '12px',
                color: latestReport.failed > 0 ? '#FCA5A5' : '#86EFAC',
              }}
            >
              <strong>Migration Report ({new Date(latestReport.timestamp).toLocaleTimeString()}):</strong>{' '}
              {latestReport.successfullyMigrated} migrated, {latestReport.successfullyVerified} verified,{' '}
              {latestReport.skipped} skipped, {latestReport.failed} failed.
            </div>
          )}

          {/* Inventory Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #374151', color: '#9CA3AF', textAlign: 'left' }}>
                  <th style={{ padding: '8px 12px' }}>Target Category</th>
                  <th style={{ padding: '8px 12px' }}>Document & Field</th>
                  <th style={{ padding: '8px 12px' }}>Source Type</th>
                  <th style={{ padding: '8px 12px' }}>Original Name</th>
                  <th style={{ padding: '8px 12px' }}>Status</th>
                  <th style={{ padding: '8px 12px' }}>R2 Destination</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => {
                  const isDone = item.status === 'verified' || item.status === 'reference-updated';
                  const isFailed = item.status === 'failed';
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #1F2937' }}>
                      <td style={{ padding: '10px 12px', color: '#E5E7EB', fontWeight: '500' }}>
                        <span
                          style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: '#1F2937',
                            fontSize: '11px',
                          }}
                        >
                          {item.targetCategory}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#9CA3AF', fontFamily: 'monospace', fontSize: '11px' }}>
                        {item.collection}/{item.docId} &bull; {item.fieldPath}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span
                          style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: item.sourceType === 'base64' ? '#4C1D95' : item.sourceType === 'firebase' ? '#831843' : '#1E293B',
                            color: '#E0E7FF',
                            fontSize: '10px',
                            fontWeight: '600',
                          }}
                        >
                          {item.sourceType.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#F3F4F6', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.originalName}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '11px',
                            fontWeight: '600',
                            background: isDone ? 'rgba(34, 197, 94, 0.15)' : isFailed ? 'rgba(239, 68, 68, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                            color: isDone ? '#4ADE80' : isFailed ? '#F87171' : '#FBBF24',
                          }}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#9CA3AF', fontFamily: 'monospace', fontSize: '11px' }}>
                        {item.r2Url ? (
                          <a
                            href={item.r2Url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#60A5FA', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <span>{item.r2ObjectKey || item.r2Url.slice(0, 30) + '...'}</span>
                            <ExternalLink size={10} />
                          </a>
                        ) : (
                          <span style={{ color: '#6B7280' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: R2 BUCKET BROWSER */}
      {activeTab === 'browser' && (
        <div style={{ background: '#111827', border: '1px solid #1F2937', borderRadius: '8px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#F3F4F6', margin: '0 0 4px' }}>
                Cloudflare R2 Bucket Explorer
              </h3>
              <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
                Live objects in <code>portfolio-assets</code> bucket.
              </p>
            </div>
            <button
              onClick={loadR2Objects}
              disabled={isLoadingObjects}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                background: '#1F2937',
                color: '#E5E7EB',
                border: '1px solid #374151',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={12} className={isLoadingObjects ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {r2Objects.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>
              <HardDrive size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              No objects in bucket yet. Run migration or upload a file via CMS to populate R2.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #374151', color: '#9CA3AF', textAlign: 'left' }}>
                    <th style={{ padding: '8px 12px' }}>Visibility</th>
                    <th style={{ padding: '8px 12px' }}>Object Key</th>
                    <th style={{ padding: '8px 12px' }}>Size</th>
                    <th style={{ padding: '8px 12px' }}>Uploaded</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {r2Objects.map((obj) => {
                    const isPrivate = obj.key.startsWith('private/');
                    return (
                      <tr key={obj.key} style={{ borderBottom: '1px solid #1F2937' }}>
                        <td style={{ padding: '10px 12px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontSize: '11px',
                              fontWeight: '600',
                              background: isPrivate ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                              color: isPrivate ? '#F87171' : '#4ADE80',
                            }}
                          >
                            {isPrivate ? <Lock size={10} /> : <Unlock size={10} />}
                            {isPrivate ? 'PRIVATE' : 'PUBLIC'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', color: '#F3F4F6', fontFamily: 'monospace', fontSize: '12px' }}>
                          {obj.key}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#9CA3AF' }}>
                          {formatBytes(obj.size)}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#9CA3AF' }}>
                          {obj.uploaded ? new Date(obj.uploaded).toLocaleString() : '—'}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <a
                              href={obj.url}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                background: '#1E293B',
                                color: '#93C5FD',
                                textDecoration: 'none',
                                fontSize: '11px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <ExternalLink size={11} />
                              Open
                            </a>
                            <button
                              onClick={() => handleDeleteObject(obj.key)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                background: 'rgba(239, 68, 68, 0.15)',
                                color: '#F87171',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                fontSize: '11px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Trash2 size={11} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
