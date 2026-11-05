import React, { useState, useRef } from 'react';
import { Upload, Crop, Image as ImageIcon, RotateCcw } from 'lucide-react';
import { ImageCropModal, AspectPreset } from './ImageCropModal';
import { cmsService } from '../../../services/cmsService';
import { MediaAsset } from '../../../types/cms';
import type { Area } from 'react-easy-crop';

export interface ImageUploadWithCropProps {
  currentImageUrl?: string;
  category: MediaAsset['category'];
  caption?: string;
  altText?: string;
  buttonLabel?: string;
  buttonIcon?: React.ReactNode;
  initialAspect?: number;
  initialShape?: 'rect' | 'round';
  aspectPresets?: AspectPreset[];
  modalTitle?: string;
  contextHint?: string;
  disabled?: boolean;
  onSuccess: (url: string, asset: MediaAsset, originalUrl?: string) => void;
  showNotification?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  style?: React.CSSProperties;
  buttonStyle?: React.CSSProperties;
  editButtonStyle?: React.CSSProperties;
  showEditButton?: boolean;
}

export const ImageUploadWithCrop: React.FC<ImageUploadWithCropProps> = ({
  currentImageUrl,
  category,
  caption,
  altText,
  buttonLabel = 'Upload & Position Image',
  buttonIcon,
  initialAspect = 1,
  initialShape = 'round',
  modalTitle = 'Interactive Image Reposition & Crop',
  contextHint = 'Click and drag to position your subject or face. Use mouse wheel or slider to zoom.',
  disabled = false,
  onSuccess,
  showNotification,
  style,
  buttonStyle,
  editButtonStyle,
  showEditButton = true,
}) => {
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [pendingImageSrc, setPendingImageSrc] = useState<string>('');
  const [pendingFileName, setPendingFileName] = useState<string>('image.jpg');
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset the input value so the same file can be selected again if needed
    e.target.value = '';

    if (!file.type.startsWith('image/')) {
      showNotification?.('Please select a valid image file (JPG, PNG, WebP).', 'error');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showNotification?.('Image size exceeds 15MB limit.', 'error');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPendingImageSrc(objectUrl);
    setPendingFileName(file.name);
    setOriginalFile(file);
    setIsCropModalOpen(true);
  };

  const handleEditExisting = () => {
    if (!currentImageUrl) return;
    setPendingImageSrc(currentImageUrl);
    setPendingFileName('current-image.jpg');
    setOriginalFile(null);
    setIsCropModalOpen(true);
  };

  const handleCloseCrop = () => {
    // If pendingImageSrc was a blob URL, revoke it to prevent memory leaks
    if (pendingImageSrc && pendingImageSrc.startsWith('blob:')) {
      URL.revokeObjectURL(pendingImageSrc);
    }
    setPendingImageSrc('');
    setOriginalFile(null);
    setIsCropModalOpen(false);
  };

  const handleApplyCrop = async (croppedFile: File, _cropArea: Area, _originalSrc: string) => {
    setIsUploading(true);
    try {
      // 1. Upload the cropped derivative to Cloudflare R2 / CMS Storage
      const asset = await cmsService.uploadMediaFile(
        croppedFile,
        category,
        caption || croppedFile.name,
        altText || croppedFile.name
      );

      // 2. Optionally store original file reference if uploaded for re-editing
      let originalUrl: string | undefined = undefined;
      if (originalFile) {
        try {
          const originalAsset = await cmsService.uploadMediaFile(
            originalFile,
            category,
            `Original - ${originalFile.name}`,
            altText
          );
          originalUrl = originalAsset.url;
        } catch {
          // Non-blocking: original storage is optional
        }
      }

      onSuccess(asset.url, asset, originalUrl);
      showNotification?.('Image cropped and saved successfully.', 'success');
      handleCloseCrop();
    } catch (err: any) {
      console.error('Upload cropped file failed:', err);
      showNotification?.('Failed to save cropped image: ' + (err.message || 'Storage error'), 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', ...style }}>
      {/* Upload & Crop Trigger */}
      <label
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          backgroundColor: 'rgba(244, 243, 238, 0.06)',
          border: '1px solid rgba(244, 243, 238, 0.12)',
          borderRadius: '4px',
          color: '#F4F3EE',
          fontSize: '12px',
          cursor: disabled || isUploading ? 'not-allowed' : 'pointer',
          opacity: disabled || isUploading ? 0.6 : 1,
          transition: 'all 0.15s ease',
          ...buttonStyle,
        }}
      >
        {buttonIcon || <Upload size={13} />}
        <span>{isUploading ? 'Saving...' : buttonLabel}</span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          disabled={disabled || isUploading}
        />
      </label>

      {/* Edit Existing Image Trigger (if image already exists) */}
      {showEditButton && currentImageUrl && (
        <button
          type="button"
          onClick={handleEditExisting}
          disabled={disabled || isUploading}
          title="Reposition / Re-crop Image"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '6px 10px',
            backgroundColor: 'rgba(139, 30, 45, 0.15)',
            border: '1px solid rgba(139, 30, 45, 0.35)',
            borderRadius: '4px',
            color: '#FF8888',
            fontSize: '12px',
            cursor: disabled || isUploading ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
            ...editButtonStyle,
          }}
        >
          <Crop size={12} />
          <span>Crop / Reposition</span>
        </button>
      )}

      {/* Interactive Modal */}
      {isCropModalOpen && (
        <ImageCropModal
          isOpen={isCropModalOpen}
          imageSrc={pendingImageSrc}
          fileName={pendingFileName}
          initialAspect={initialAspect}
          initialShape={initialShape}
          title={modalTitle}
          contextHint={contextHint}
          onClose={handleCloseCrop}
          onApplyCrop={handleApplyCrop}
        />
      )}
    </div>
  );
};
