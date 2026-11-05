import React, { useState } from 'react';
import {
  Upload,
  Search,
  Grid,
  List,
  Trash2,
  Edit,
  ExternalLink,
  Eye,
  FileText,
  Image as ImageIcon,
  AlertTriangle,
  X,
  Check,
  Crop,
} from 'lucide-react';
import { MediaAsset } from '../../../types/cms';
import { cmsService } from '../../../services/cmsService';
import { ImageCropModal } from '../common/ImageCropModal';
import { ImageUploadWithCrop } from '../common/ImageUploadWithCrop';
import {
  AdminModal,
  AdminModalHeader,
  AdminModalBody,
  AdminModalFooter,
  AdminFormField,
  AdminInput,
} from '../common/AdminModal';

interface MediaLibraryManagerProps {
  media: MediaAsset[];
  onRefresh: () => void;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const MediaLibraryManager: React.FC<MediaLibraryManagerProps> = ({
  media,
  onRefresh,
  showNotification,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);

  // Selected asset for detail / edit modal
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [editAltText, setEditAltText] = useState('');
  const [cropTargetAsset, setCropTargetAsset] = useState<MediaAsset | null>(null);

  const handleApplyCroppedAsset = async (croppedFile: File) => {
    if (!cropTargetAsset) return;
    try {
      await cmsService.uploadMediaFile(
        croppedFile,
        cropTargetAsset.category,
        `${cropTargetAsset.caption || cropTargetAsset.name} (Cropped)`,
        cropTargetAsset.altText || cropTargetAsset.name
      );
      showNotification('Cropped image created and added to Media Library.', 'success');
      onRefresh();
    } catch (err: any) {
      showNotification('Failed to save cropped image: ' + (err.message || 'Error'), 'error');
    } finally {
      setCropTargetAsset(null);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isPdf = file.type === 'application/pdf';
        await cmsService.uploadMediaFile(
          file,
          isPdf ? 'work-sample' : 'screenshot',
          file.name
        );
      }
      onRefresh();
      showNotification(`${files.length} asset(s) added to Media Library.`);
    } catch (err: any) {
      showNotification('Upload failed: ' + (err.message || 'Error'), 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenDetail = (asset: MediaAsset) => {
    setSelectedAsset(asset);
    setEditCaption(asset.caption || asset.name);
    setEditAltText(asset.altText || asset.name);
  };

  const handleSaveMetadata = async () => {
    if (!selectedAsset) return;
    const assets = cmsService.getMediaAssets();
    const idx = assets.findIndex((a) => a.id === selectedAsset.id);
    if (idx !== -1) {
      assets[idx] = {
        ...assets[idx],
        caption: editCaption,
        altText: editAltText,
      };
      localStorage.setItem('ayush_cms_media_v1', JSON.stringify(assets));
      onRefresh();
      showNotification('Asset metadata updated.');
      setSelectedAsset(null);
    }
  };

  const handleDelete = async (asset: MediaAsset) => {
    // Check usage across portfolio
    const usage = cmsService.checkMediaUsage(asset.url);
    if (usage.isUsed) {
      const confirmed = window.confirm(
        `WARNING: This asset is currently active and referenced in published content:\n\n• ${usage.usedIn.join(
          '\n• '
        )}\n\nDeleting this asset may break images on your live portfolio. Are you sure you wish to delete it?`
      );
      if (!confirmed) return;
    } else {
      if (!window.confirm(`Delete asset "${asset.name}" from library?`)) return;
    }

    await cmsService.deleteMediaAsset(asset.id);
    onRefresh();
    if (selectedAsset?.id === asset.id) setSelectedAsset(null);
    showNotification(`Asset "${asset.name}" deleted.`);
  };

  const filtered = media.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.caption || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto' }}>
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
            Central Media Library
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: '#A7B0A9',
              margin: '4px 0 0',
            }}
          >
            Governance for all portfolio assets: profile photographs, company marks, project screenshots, diagrams, and work samples.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ImageUploadWithCrop
            category="photo"
            buttonLabel="Upload & Crop Image"
            buttonIcon={<Crop size={14} />}
            modalTitle="Media Asset — Interactive Reposition & Crop"
            contextHint="Drag, scale, and crop any image before adding to the Media Library."
            onSuccess={() => {
              showNotification('Asset uploaded and added to Media Library.', 'success');
              onRefresh();
            }}
            showNotification={showNotification}
            showEditButton={false}
            buttonStyle={{
              padding: '8px 14px',
              backgroundColor: 'rgba(139, 30, 45, 0.25)',
              border: '1px solid rgba(212, 56, 75, 0.4)',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 600,
            }}
          />

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
            {isUploading ? 'Uploading...' : 'Direct Upload'}
            <input
              type="file"
              multiple
              accept="image/*,application/pdf"
              onChange={handleUpload}
              style={{ display: 'none' }}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      {/* Controls Bar: Search, Category Filter, View Mode */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets by filename or caption..."
              style={{
                width: '100%',
                padding: '9px 12px 9px 34px',
                borderRadius: '6px',
                backgroundColor: 'rgba(18, 18, 22, 0.72)',
                border: '1px solid rgba(244, 243, 238, 0.1)',
                color: '#F4F3EE',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <Search
              size={13}
              color="#8E948D"
              style={{ position: 'absolute', left: '12px', top: '11px' }}
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '9px 12px',
              borderRadius: '6px',
              backgroundColor: 'rgba(18, 18, 22, 0.72)',
              border: '1px solid rgba(244, 243, 238, 0.1)',
              color: '#F4F3EE',
              fontSize: '13px',
              outline: 'none',
            }}
          >
            <option value="all">All File Categories ({media.length})</option>
            <option value="photo">Profile &amp; Photos</option>
            <option value="screenshot">Project Screenshots</option>
            <option value="certificate">Certificates</option>
            <option value="resume">Resume Documents</option>
            <option value="work-sample">Work Samples</option>
            <option value="general">General Media</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(18, 18, 22, 0.72)',
            borderRadius: '6px',
            border: '1px solid rgba(244, 243, 238, 0.1)',
            padding: '2px',
          }}
        >
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            style={{
              padding: '6px 10px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: viewMode === 'grid' ? 'rgba(130, 148, 166, 0.2)' : 'transparent',
              color: viewMode === 'grid' ? '#F4F3EE' : '#8E948D',
              cursor: 'pointer',
            }}
          >
            <Grid size={14} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            style={{
              padding: '6px 10px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: viewMode === 'list' ? 'rgba(130, 148, 166, 0.2)' : 'transparent',
              color: viewMode === 'list' ? '#F4F3EE' : '#8E948D',
              cursor: 'pointer',
            }}
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {/* Assets Content */}
      {viewMode === 'grid' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '16px',
          }}
        >
          {filtered.map((item) => {
            const usage = cmsService.checkMediaUsage(item.url);
            const isImage = item.type.startsWith('image/');
            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: 'rgba(18, 18, 22, 0.72)',
                  border: '1px solid rgba(244, 243, 238, 0.08)',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div
                    onClick={() => handleOpenDetail(item)}
                    style={{
                      height: '140px',
                      backgroundColor: '#1E2822',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    {isImage ? (
                      <img
                        src={item.url}
                        alt={item.altText || item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#8294A6',
                        }}
                      >
                        <FileText size={40} />
                      </div>
                    )}

                    {usage.isUsed && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '6px',
                          left: '6px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(74, 180, 120, 0.9)',
                          color: '#111514',
                          fontSize: '10px',
                          fontWeight: 700,
                        }}
                      >
                        Active ({usage.usedIn.length})
                      </span>
                    )}
                  </div>

                  <div style={{ padding: '10px 12px' }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#F4F3EE',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.name}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '11px',
                        color: '#8E948D',
                        marginTop: '2px',
                      }}
                    >
                      {(item.sizeBytes / 1024).toFixed(0)} KB &bull; {item.category}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    padding: '8px 12px',
                    borderTop: '1px solid rgba(244, 243, 238, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(item)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'none',
                        border: 'none',
                        color: '#8294A6',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      <Edit size={12} /> Inspect
                    </button>
                    {item.type?.startsWith('image/') && (
                      <button
                        type="button"
                        onClick={() => setCropTargetAsset(item)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: 'none',
                          border: 'none',
                          color: '#FF8888',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                        title="Crop / Reposition Image"
                      >
                        <Crop size={12} /> Crop
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#E06C75',
                      cursor: 'pointer',
                      padding: '2px',
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div
          style={{
            backgroundColor: 'rgba(18, 18, 22, 0.72)',
            border: '1px solid rgba(244, 243, 238, 0.08)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          {filtered.map((item, idx) => {
            const usage = cmsService.checkMediaUsage(item.url);
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 18px',
                  borderBottom:
                    idx !== filtered.length - 1 ? '1px solid rgba(244, 243, 238, 0.06)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      backgroundColor: '#1E2822',
                      flexShrink: 0,
                    }}
                  >
                    {item.type.startsWith('image/') ? (
                      <img src={item.url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <FileText size={18} color="#8294A6" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 600, color: '#F4F3EE' }}>
                      {item.name}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#8E948D', marginTop: '2px' }}>
                      Category: {item.category} &bull; {(item.sizeBytes / 1024).toFixed(0)} KB &bull; Uploaded:{' '}
                      {item.uploadedAt?.slice(0, 10)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {usage.isUsed ? (
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(74, 180, 120, 0.15)',
                        color: '#6CE098',
                        fontSize: '11px',
                        fontWeight: 600,
                      }}
                    >
                      Used in {usage.usedIn.length} location(s)
                    </span>
                  ) : (
                    <span style={{ fontSize: '11px', color: '#8E948D' }}>Unreferenced</span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleOpenDetail(item)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(244, 243, 238, 0.05)',
                      border: '1px solid rgba(244, 243, 238, 0.1)',
                      color: '#C1C4BE',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Inspect
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#E06C75',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Asset Detail & Usage Inspector Modal */}
      {selectedAsset && (
        <AdminModal
          isOpen={!!selectedAsset}
          onClose={() => setSelectedAsset(null)}
          size="md"
          maxWidth="700px"
          ariaLabel="Asset Details & Usage Inspector"
        >
          <AdminModalHeader
            title="Asset Details & Usage Inspector"
            subtitle="Verify storage references, metadata, alt text, and active portfolio usage."
            icon={<ImageIcon size={18} />}
            onClose={() => setSelectedAsset(null)}
          />

          <AdminModalBody padding="24px">
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(160px, 200px) 1fr', gap: '20px', marginBottom: '20px' }}>
              <div
                style={{
                  height: '180px',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  backgroundColor: '#0E1412',
                  border: '1px solid rgba(244, 243, 238, 0.1)',
                }}
              >
                {selectedAsset.type.startsWith('image/') ? (
                  <img
                    src={selectedAsset.url}
                    alt={selectedAsset.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <FileText size={48} color="#8294A6" />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#8E948D', marginBottom: '4px' }}>
                    Asset Caption
                  </label>
                  <input
                    type="text"
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '4px',
                      backgroundColor: '#0E1412',
                      border: '1px solid rgba(244, 243, 238, 0.12)',
                      color: '#F4F3EE',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#8E948D', marginBottom: '4px' }}>
                    Accessibility Alt Text
                  </label>
                  <input
                    type="text"
                    value={editAltText}
                    onChange={(e) => setEditAltText(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '4px',
                      backgroundColor: '#0E1412',
                      border: '1px solid rgba(244, 243, 238, 0.12)',
                      color: '#F4F3EE',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ fontSize: '11px', color: '#8E948D', fontFamily: 'var(--font-body)' }}>
                  <div>Storage URL: <a href={selectedAsset.url} target="_blank" rel="noreferrer" style={{ color: '#8294A6' }}>{selectedAsset.url}</a></div>
                  <div>Size: {(selectedAsset.sizeBytes / 1024).toFixed(1)} KB</div>
                </div>
              </div>
            </div>

            {/* Usage Inspector Box */}
            {(() => {
              const usage = cmsService.checkMediaUsage(selectedAsset.url);
              return (
                <div
                  style={{
                    padding: '14px',
                    borderRadius: '6px',
                    backgroundColor: usage.isUsed ? 'rgba(74, 180, 120, 0.08)' : 'rgba(244, 243, 238, 0.03)',
                    border: usage.isUsed
                      ? '1px solid rgba(74, 180, 120, 0.25)'
                      : '1px solid rgba(244, 243, 238, 0.08)',
                    marginBottom: '20px',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: usage.isUsed ? '#6CE098' : '#A7B0A9',
                      marginBottom: '6px',
                    }}
                  >
                    {usage.isUsed ? `Active Usage References (${usage.usedIn.length})` : 'No Active Usage References'}
                  </div>
                  {usage.isUsed ? (
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#C1C4BE' }}>
                      {usage.usedIn.map((place, pIdx) => (
                        <li key={pIdx}>{place}</li>
                      ))}
                    </ul>
                  ) : (
                    <div style={{ fontSize: '12px', color: '#8E948D' }}>
                      This asset is not directly referenced by any published project, experience, or profile card. It can be safely deleted or replaced.
                    </div>
                  )}
                </div>
              );
            })()}

          </AdminModalBody>

          <AdminModalFooter
            onCancel={() => setSelectedAsset(null)}
            onDelete={() => handleDelete(selectedAsset)}
            deleteText="Delete Asset"
            onSave={handleSaveMetadata}
            saveText="Save Metadata"
            saveType="button"
          />
        </AdminModal>
      )}
      {/* Interactive Crop Modal for Selected Asset */}
      {cropTargetAsset && (
        <ImageCropModal
          isOpen={!!cropTargetAsset}
          imageSrc={cropTargetAsset.url}
          fileName={cropTargetAsset.name}
          title={`Crop & Reposition: ${cropTargetAsset.name}`}
          contextHint="Click and drag to position the subject. Adjust aspect ratio or zoom level, then apply crop."
          onClose={() => setCropTargetAsset(null)}
          onApplyCrop={handleApplyCroppedAsset}
        />
      )}
    </div>
  );
};
