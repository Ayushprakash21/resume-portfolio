import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Check,
  Maximize2,
  FlipHorizontal,
  FlipVertical,
  Circle,
  Square,
  Sparkles,
  Sliders,
  Image as ImageIcon,
} from 'lucide-react';
import { getCroppedImgFile, CropTransformOptions } from '../../../utils/imageCropper';

export interface AspectPreset {
  label: string;
  value: number; // width / height
  description?: string;
  shape?: 'rect' | 'round';
}

export const DEFAULT_ASPECT_PRESETS: AspectPreset[] = [
  { label: '1:1 Square', value: 1, description: 'Profile, Avatar, Logos', shape: 'round' },
  { label: '4:5 Portrait', value: 4 / 5, description: 'Editorial Portrait', shape: 'rect' },
  { label: '16:9 Landscape', value: 16 / 9, description: 'Cover, Screenshots', shape: 'rect' },
  { label: '3:1 Banner', value: 3 / 1, description: 'Header Banner', shape: 'rect' },
  { label: 'Original', value: 0, description: 'Unconstrained / Original', shape: 'rect' },
];

export interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  fileName?: string;
  initialAspect?: number;
  initialShape?: 'rect' | 'round';
  title?: string;
  contextHint?: string;
  onClose: () => void;
  onApplyCrop: (croppedFile: File, cropAreaPixels: Area, originalSrc: string) => Promise<void> | void;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  imageSrc,
  fileName = 'image.jpg',
  initialAspect = 1,
  initialShape = 'round',
  title = 'Interactive Image Reposition & Crop',
  contextHint = 'Click and drag to position your face or subject inside the crop zone. Use mouse wheel or slider to zoom.',
  onClose,
  onApplyCrop,
}) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [flip, setFlip] = useState<{ horizontal: boolean; vertical: boolean }>({
    horizontal: false,
    vertical: false,
  });
  const [aspect, setAspect] = useState<number>(initialAspect);
  const [cropShape, setCropShape] = useState<'rect' | 'round'>(initialShape);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'transform' | 'aspect' | 'preview'>('transform');

  // Reset state when a new image or modal opens
  useEffect(() => {
    if (isOpen) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setFlip({ horizontal: false, vertical: false });
      setAspect(initialAspect);
      setCropShape(initialShape);
      setIsProcessing(false);
    }
  }, [isOpen, imageSrc, initialAspect, initialShape]);

  // Handle ESC key to dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isProcessing) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isProcessing, onClose]);

  const onCropComplete = useCallback((_croppedArea: Area, currentCroppedAreaPixels: Area) => {
    setCroppedAreaPixels(currentCroppedAreaPixels);
  }, []);

  const onMediaLoaded = useCallback((mediaSize: { naturalWidth: number; naturalHeight: number }) => {
    setNaturalSize({ width: mediaSize.naturalWidth, height: mediaSize.naturalHeight });
  }, []);

  const handleZoomIn = () => setZoom((prev) => Math.min(5, Number((prev + 0.2).toFixed(2))));
  const handleZoomOut = () => setZoom((prev) => Math.max(1, Number((prev - 0.2).toFixed(2))));

  const handleRotateCw = () => setRotation((prev) => (prev + 90) % 360);
  const handleRotateCcw = () => setRotation((prev) => (prev - 90 + 360) % 360);

  const handleFlipHorizontal = () =>
    setFlip((prev) => ({ ...prev, horizontal: !prev.horizontal }));
  const handleFlipVertical = () =>
    setFlip((prev) => ({ ...prev, vertical: !prev.vertical }));

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setFlip({ horizontal: false, vertical: false });
    setAspect(initialAspect);
    setCropShape(initialShape);
  };

  const handleSelectAspectPreset = (preset: AspectPreset) => {
    if (preset.value === 0) {
      // Natural / free aspect
      if (naturalSize.width && naturalSize.height) {
        setAspect(naturalSize.width / naturalSize.height);
      } else {
        setAspect(1);
      }
    } else {
      setAspect(preset.value);
    }
    if (preset.shape) {
      setCropShape(preset.shape);
    }
  };

  const handleApply = async () => {
    if (!croppedAreaPixels || isProcessing) return;

    setIsProcessing(true);
    try {
      const options: CropTransformOptions = {
        rotation,
        flip,
        outputFormat: fileName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg',
        quality: 0.94,
      };

      const croppedFile = await getCroppedImgFile(
        imageSrc,
        croppedAreaPixels,
        fileName,
        options
      );

      await onApplyCrop(croppedFile, croppedAreaPixels, imageSrc);
      onClose();
    } catch (err) {
      console.error('Failed to crop and export image:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate live preview dimensions & scale for the preview cards
  const previewRatio = aspect > 0 ? aspect : 1;

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(5, 5, 8, 0.88)',
        backdropFilter: 'blur(12px)',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1080px',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0A0B0E',
          borderRadius: '16px',
          border: '1px solid rgba(244, 243, 238, 0.12)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.04)',
          overflow: 'hidden',
          color: '#F4F3EE',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: '1px solid rgba(244, 243, 238, 0.08)',
            backgroundColor: 'rgba(18, 19, 24, 0.6)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(139, 30, 45, 0.2)',
                border: '1px solid rgba(139, 30, 45, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={16} color="#E65050" />
            </div>
            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '16px',
                  fontWeight: 600,
                  margin: 0,
                  color: '#FFFFFF',
                  letterSpacing: '0.02em',
                }}
              >
                {title}
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: '#8E948D',
                  margin: '2px 0 0',
                }}
              >
                {contextHint}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8E948D',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
            aria-label="Close Crop Modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body: Split into Interactive Cropper + Control / Live Preview Side Panel */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 340px',
            flex: 1,
            minHeight: '440px',
            maxHeight: 'calc(94vh - 140px)',
            overflow: 'hidden',
          }}
        >
          {/* Main Interactive Crop Viewport */}
          <div
            style={{
              position: 'relative',
              backgroundColor: '#060709',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              minHeight: '380px',
            }}
          >
            {/* Cropper Container */}
            <div
              style={{
                position: 'relative',
                flex: 1,
                width: '100%',
                height: '100%',
                backgroundColor: '#050608',
              }}
            >
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={aspect}
                cropShape={cropShape}
                showGrid={true}
                zoomSpeed={0.15}
                zoomWithScroll={true}
                restrictPosition={true}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
                onMediaLoaded={onMediaLoaded}
                transform={
                  flip.horizontal || flip.vertical
                    ? `scale(${flip.horizontal ? -1 : 1}, ${flip.vertical ? -1 : 1})`
                    : undefined
                }
                style={{
                  containerStyle: {
                    backgroundColor: '#050608',
                  },
                  cropAreaStyle: {
                    border: '2px solid rgba(255, 255, 255, 0.85)',
                    boxShadow: '0 0 0 9999em rgba(0, 0, 0, 0.72)',
                  },
                }}
              />
            </div>

            {/* Floating Quick Action Overlay on Viewport */}
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '30px',
                backgroundColor: 'rgba(12, 14, 18, 0.85)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
              }}
            >
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoom <= 1}
                title="Zoom Out"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: zoom <= 1 ? 'not-allowed' : 'pointer',
                  opacity: zoom <= 1 ? 0.4 : 1,
                }}
              >
                <ZoomOut size={14} />
              </button>

              {/* Zoom Slider */}
              <input
                type="range"
                value={zoom}
                min={1}
                max={5}
                step={0.05}
                onChange={(e) => setZoom(Number(e.target.value))}
                aria-label="Zoom Level"
                style={{
                  width: '120px',
                  cursor: 'pointer',
                  accentColor: '#D4384B',
                }}
              />

              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoom >= 5}
                title="Zoom In"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: zoom >= 5 ? 'not-allowed' : 'pointer',
                  opacity: zoom >= 5 ? 0.4 : 1,
                }}
              >
                <ZoomIn size={14} />
              </button>

              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  color: '#D4384B',
                  fontWeight: 600,
                  marginLeft: '4px',
                  minWidth: '38px',
                  textAlign: 'center',
                }}
              >
                {Math.round(zoom * 100)}%
              </span>
            </div>
          </div>

          {/* Right Sidebar: Tabs, Controls & Live Previews */}
          <div
            style={{
              backgroundColor: '#0D0E12',
              borderLeft: '1px solid rgba(244, 243, 238, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            {/* Sidebar Tabs */}
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid rgba(244, 243, 238, 0.08)',
                padding: '4px',
                gap: '4px',
                backgroundColor: 'rgba(18, 19, 24, 0.5)',
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('transform')}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: '6px',
                  backgroundColor: activeTab === 'transform' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  border: 'none',
                  color: activeTab === 'transform' ? '#FFFFFF' : '#8E948D',
                  fontSize: '12px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <Sliders size={13} />
                Controls
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('aspect')}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: '6px',
                  backgroundColor: activeTab === 'aspect' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  border: 'none',
                  color: activeTab === 'aspect' ? '#FFFFFF' : '#8E948D',
                  fontSize: '12px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <Square size={13} />
                Aspect
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: '6px',
                  backgroundColor: activeTab === 'preview' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  border: 'none',
                  color: activeTab === 'preview' ? '#FFFFFF' : '#8E948D',
                  fontSize: '12px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <ImageIcon size={13} />
                Preview
              </button>
            </div>

            {/* Tab Contents */}
            <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activeTab === 'transform' && (
                <>
                  {/* Rotation & Orientation */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontFamily: 'var(--font-body)',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: '#8E948D',
                        marginBottom: '8px',
                      }}
                    >
                      Orientation & Rotation ({rotation}°)
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={handleRotateCcw}
                        title="Rotate 90° Counter-Clockwise"
                        style={{
                          padding: '8px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#F4F3EE',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '10px',
                          cursor: 'pointer',
                        }}
                      >
                        <RotateCcw size={14} />
                        -90°
                      </button>
                      <button
                        type="button"
                        onClick={handleRotateCw}
                        title="Rotate 90° Clockwise"
                        style={{
                          padding: '8px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#F4F3EE',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '10px',
                          cursor: 'pointer',
                        }}
                      >
                        <RotateCw size={14} />
                        +90°
                      </button>
                      <button
                        type="button"
                        onClick={handleFlipHorizontal}
                        title="Flip Horizontal"
                        style={{
                          padding: '8px',
                          borderRadius: '6px',
                          backgroundColor: flip.horizontal ? 'rgba(212, 56, 75, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                          border: `1px solid ${flip.horizontal ? '#D4384B' : 'rgba(255, 255, 255, 0.1)'}`,
                          color: flip.horizontal ? '#FF8888' : '#F4F3EE',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '10px',
                          cursor: 'pointer',
                        }}
                      >
                        <FlipHorizontal size={14} />
                        Flip H
                      </button>
                      <button
                        type="button"
                        onClick={handleFlipVertical}
                        title="Flip Vertical"
                        style={{
                          padding: '8px',
                          borderRadius: '6px',
                          backgroundColor: flip.vertical ? 'rgba(212, 56, 75, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                          border: `1px solid ${flip.vertical ? '#D4384B' : 'rgba(255, 255, 255, 0.1)'}`,
                          color: flip.vertical ? '#FF8888' : '#F4F3EE',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '10px',
                          cursor: 'pointer',
                        }}
                      >
                        <FlipVertical size={14} />
                        Flip V
                      </button>
                    </div>
                  </div>

                  {/* Crop Mask Shape */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontFamily: 'var(--font-body)',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: '#8E948D',
                        marginBottom: '8px',
                      }}
                    >
                      Crop Mask Shape
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setCropShape('round')}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '6px',
                          backgroundColor: cropShape === 'round' ? 'rgba(139, 30, 45, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                          border: `1px solid ${cropShape === 'round' ? '#D4384B' : 'rgba(255, 255, 255, 0.08)'}`,
                          color: cropShape === 'round' ? '#FFFFFF' : '#8E948D',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                        }}
                      >
                        <Circle size={14} />
                        Circular (Avatar)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCropShape('rect')}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '6px',
                          backgroundColor: cropShape === 'rect' ? 'rgba(139, 30, 45, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                          border: `1px solid ${cropShape === 'rect' ? '#D4384B' : 'rgba(255, 255, 255, 0.08)'}`,
                          color: cropShape === 'rect' ? '#FFFFFF' : '#8E948D',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                        }}
                      >
                        <Square size={14} />
                        Rectangle
                      </button>
                    </div>
                  </div>

                  {/* Reset Controls */}
                  <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
                    <button
                      type="button"
                      onClick={handleReset}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#A7B0A9',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      <RotateCcw size={13} />
                      Reset to Default Crop & Zoom
                    </button>
                  </div>
                </>
              )}

              {activeTab === 'aspect' && (
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-body)',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: '#8E948D',
                      marginBottom: '10px',
                    }}
                  >
                    Select Aspect Ratio
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {DEFAULT_ASPECT_PRESETS.map((p) => {
                      const isSelected =
                        p.value === 0
                          ? aspect === (naturalSize.width / (naturalSize.height || 1))
                          : Math.abs(aspect - p.value) < 0.01;

                      return (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => handleSelectAspectPreset(p)}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '8px',
                            backgroundColor: isSelected ? 'rgba(139, 30, 45, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                            border: `1px solid ${isSelected ? '#D4384B' : 'rgba(255, 255, 255, 0.08)'}`,
                            color: isSelected ? '#FFFFFF' : '#C7CDC5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 600 }}>{p.label}</div>
                            <div style={{ fontSize: '11px', color: '#8E948D', marginTop: '2px' }}>
                              {p.description}
                            </div>
                          </div>
                          {isSelected && <Check size={16} color="#6CE098" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Live Preview Display (visible in Preview tab or compact preview under Controls) */}
              {(activeTab === 'preview' || activeTab === 'transform') && (
                <div
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    padding: '14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
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
                    <span
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: '#8E948D',
                      }}
                    >
                      Live Crop Preview
                    </span>
                    {croppedAreaPixels && (
                      <span style={{ fontSize: '10px', color: '#6CE098', fontFamily: 'monospace' }}>
                        {Math.round(croppedAreaPixels.width)} × {Math.round(croppedAreaPixels.height)}px
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-around',
                      padding: '12px 0',
                    }}
                  >
                    {/* 1. Circular Avatar Preview */}
                    <div style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          border: '2px solid rgba(255, 255, 255, 0.3)',
                          boxShadow: '0 0 16px rgba(212, 56, 75, 0.3)',
                          margin: '0 auto 6px',
                          backgroundColor: '#050608',
                          position: 'relative',
                        }}
                      >
                        {croppedAreaPixels && naturalSize.width > 0 && (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              overflow: 'hidden',
                              position: 'relative',
                            }}
                          >
                            <img
                              src={imageSrc}
                              alt="Avatar Preview"
                              style={{
                                position: 'absolute',
                                width: `${(naturalSize.width / croppedAreaPixels.width) * 100}%`,
                                height: `${(naturalSize.height / croppedAreaPixels.height) * 100}%`,
                                left: `-${(croppedAreaPixels.x / croppedAreaPixels.width) * 100}%`,
                                top: `-${(croppedAreaPixels.y / croppedAreaPixels.height) * 100}%`,
                                transform: `rotate(${rotation}deg) scale(${flip.horizontal ? -1 : 1}, ${
                                  flip.vertical ? -1 : 1
                                })`,
                                transformOrigin: 'center center',
                                maxWidth: 'none',
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: '10px', color: '#8E948D' }}>Avatar (Circle)</span>
                    </div>

                    {/* 2. Squircle / Hero Preview */}
                    <div style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          width: '64px',
                          height: `${64 / previewRatio}px`,
                          maxHeight: '80px',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          margin: '0 auto 6px',
                          backgroundColor: '#050608',
                          position: 'relative',
                        }}
                      >
                        {croppedAreaPixels && naturalSize.width > 0 && (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              overflow: 'hidden',
                              position: 'relative',
                            }}
                          >
                            <img
                              src={imageSrc}
                              alt="Square Preview"
                              style={{
                                position: 'absolute',
                                width: `${(naturalSize.width / croppedAreaPixels.width) * 100}%`,
                                height: `${(naturalSize.height / croppedAreaPixels.height) * 100}%`,
                                left: `-${(croppedAreaPixels.x / croppedAreaPixels.width) * 100}%`,
                                top: `-${(croppedAreaPixels.y / croppedAreaPixels.height) * 100}%`,
                                transform: `rotate(${rotation}deg) scale(${flip.horizontal ? -1 : 1}, ${
                                  flip.vertical ? -1 : 1
                                })`,
                                transformOrigin: 'center center',
                                maxWidth: 'none',
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: '10px', color: '#8E948D' }}>Portfolio Frame</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 24px',
            borderTop: '1px solid rgba(244, 243, 238, 0.08)',
            backgroundColor: 'rgba(18, 19, 24, 0.8)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '11px',
                color: '#8E948D',
              }}
            >
              Source: {naturalSize.width} × {naturalSize.height}px
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                color: '#C7CDC5',
                fontSize: '13px',
                fontFamily: 'var(--font-body)',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={isProcessing || !croppedAreaPixels}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 20px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #8B1E2D 0%, #D4384B 100%)',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                cursor: isProcessing || !croppedAreaPixels ? 'not-allowed' : 'pointer',
                opacity: isProcessing || !croppedAreaPixels ? 0.6 : 1,
                boxShadow: '0 4px 14px rgba(212, 56, 75, 0.4)',
                transition: 'all 0.15s ease',
              }}
            >
              {isProcessing ? (
                <>
                  <div
                    style={{
                      width: '14px',
                      height: '14px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#FFF',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  Processing High-Res Crop...
                </>
              ) : (
                <>
                  <Check size={15} />
                  Apply &amp; Save Crop
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
