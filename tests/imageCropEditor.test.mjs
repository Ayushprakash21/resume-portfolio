import { test, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  getRadianAngle,
  calculateRotatedSize,
} from '../src/utils/imageCropper.ts';

describe('Image Drag, Position, Zoom and Crop Editor Suite', () => {
  it('1. imageCropper utility correctly computes rotation geometry and radian angles', () => {
    assert.equal(getRadianAngle(0), 0);
    assert.equal(getRadianAngle(180), Math.PI);
    assert.equal(getRadianAngle(90), Math.PI / 2);

    // 0 degree rotation maintains exact dimensions
    const unrotated = calculateRotatedSize(800, 600, 0);
    assert.equal(Math.round(unrotated.width), 800);
    assert.equal(Math.round(unrotated.height), 600);

    // 90 degree rotation swaps width and height
    const rotated90 = calculateRotatedSize(800, 600, 90);
    assert.equal(Math.round(rotated90.width), 600);
    assert.equal(Math.round(rotated90.height), 800);

    // 180 degree rotation maintains dimensions
    const rotated180 = calculateRotatedSize(800, 600, 180);
    assert.equal(Math.round(rotated180.width), 800);
    assert.equal(Math.round(rotated180.height), 600);
  });

  it('2. ImageCropModal source contains full drag, zoom, rotation, and aspect ratio controls', () => {
    const file = fs.readFileSync('src/components/admin/common/ImageCropModal.tsx', 'utf-8');

    // Interactive Cropper configuration
    assert.ok(file.includes('Cropper'), 'Must mount react-easy-crop Cropper');
    assert.ok(file.includes('restrictPosition={true}'), 'Must restrict image from escaping crop bounds');
    assert.ok(file.includes('zoomWithScroll={true}'), 'Must support mouse wheel zooming');
    assert.ok(file.includes('showGrid={true}'), 'Must show rule-of-thirds crop grid');
    assert.ok(file.includes('onCropChange={setCrop}'), 'Must support interactive drag-to-position');
    assert.ok(file.includes('onZoomChange={setZoom}'), 'Must support interactive zoom change');
    assert.ok(file.includes('onRotationChange={setRotation}'), 'Must support interactive rotation change');

    // Zoom controls
    assert.ok(file.includes('handleZoomIn'), 'Must provide zoom in button');
    assert.ok(file.includes('handleZoomOut'), 'Must provide zoom out button');
    assert.ok(file.includes('type="range"'), 'Must provide zoom slider range input');

    // Rotation and flip controls
    assert.ok(file.includes('handleRotateCw'), 'Must provide 90° clockwise rotation');
    assert.ok(file.includes('handleRotateCcw'), 'Must provide 90° counter-clockwise rotation');
    assert.ok(file.includes('handleFlipHorizontal'), 'Must provide horizontal flip');
    assert.ok(file.includes('handleFlipVertical'), 'Must provide vertical flip');
    assert.ok(file.includes('handleReset'), 'Must provide reset to default');

    // Preset Aspect Ratios
    assert.ok(file.includes('1:1 Square'), 'Must support 1:1 Square');
    assert.ok(file.includes('4:5 Portrait'), 'Must support 4:5 Portrait');
    assert.ok(file.includes('16:9 Landscape'), 'Must support 16:9 Landscape');
    assert.ok(file.includes('3:1 Banner'), 'Must support 3:1 Banner');

    // Live preview elements
    assert.ok(file.includes('Avatar (Circle)'), 'Must render circular avatar preview');
    assert.ok(file.includes('Portfolio Frame'), 'Must render rectangular/portfolio frame preview');

    // High resolution canvas export
    assert.ok(file.includes('getCroppedImgFile'), 'Must export cropped high-res File via canvas helper');
  });

  it('3. ImageUploadWithCrop component handles file selection, modal lifecycle, and R2 persistence', () => {
    const file = fs.readFileSync('src/components/admin/common/ImageUploadWithCrop.tsx', 'utf-8');

    assert.ok(file.includes('URL.createObjectURL'), 'Must create object URL for local interactive preview');
    assert.ok(file.includes('URL.revokeObjectURL'), 'Must revoke object URL on modal close to prevent memory leaks');
    assert.ok(file.includes('cmsService.uploadMediaFile'), 'Must persist cropped file to R2 / CMS storage');
    assert.ok(file.includes('Crop / Reposition'), 'Must provide edit/re-crop button when existing image is present');
    assert.ok(file.includes('ImageCropModal'), 'Must mount ImageCropModal');
  });

  it('4. IntroductionEditor integrates ImageUploadWithCrop for profile photo and cover image', () => {
    const file = fs.readFileSync('src/components/admin/editors/IntroductionEditor.tsx', 'utf-8');

    assert.ok(file.includes("import { ImageUploadWithCrop } from '../common/ImageUploadWithCrop'"));
    assert.ok(file.includes('Profile Photograph — Drag, Position & Crop'));
    assert.ok(file.includes('Background Cover — Drag, Position & Crop'));
    assert.ok(file.includes('initialAspect={1}'));
    assert.ok(file.includes('initialAspect={16 / 9}'));
  });

  it('5. ProjectEditorModal integrates ImageUploadWithCrop for logo, cover, and screenshots', () => {
    const file = fs.readFileSync('src/components/admin/editors/ProjectEditorModal.tsx', 'utf-8');

    assert.ok(file.includes("import { ImageUploadWithCrop } from '../common/ImageUploadWithCrop'"));
    assert.ok(file.includes("import { ImageCropModal } from '../common/ImageCropModal'"));
    assert.ok(file.includes('Project Logo — Drag, Position & Crop'));
    assert.ok(file.includes('Project Cover Image — Drag, Position & Crop'));
    assert.ok(file.includes('cropTargetScreenshotIdx !== null'));
  });

  it('6. ExperienceEditorModal integrates Company Logo and Deliverables cropping', () => {
    const file = fs.readFileSync('src/components/admin/editors/ExperienceEditorModal.tsx', 'utf-8');

    assert.ok(file.includes("import { ImageUploadWithCrop } from '../common/ImageUploadWithCrop'"));
    assert.ok(file.includes("import { ImageCropModal } from '../common/ImageCropModal'"));
    assert.ok(file.includes('Company Logo — Drag, Position & Crop'));
    assert.ok(file.includes('cropTargetMediaItem'));
  });

  it('7. CertificationEditorModal integrates Issuer Logo cropping', () => {
    const file = fs.readFileSync('src/components/admin/editors/CertificationEditorModal.tsx', 'utf-8');

    assert.ok(file.includes("import { ImageUploadWithCrop } from '../common/ImageUploadWithCrop'"));
    assert.ok(file.includes('Issuer Logo — Drag, Position & Crop'));
  });

  it('8. MediaLibraryManager integrates Upload & Crop and individual card re-cropping', () => {
    const file = fs.readFileSync('src/components/admin/editors/MediaLibraryManager.tsx', 'utf-8');

    assert.ok(file.includes("import { ImageUploadWithCrop } from '../common/ImageUploadWithCrop'"));
    assert.ok(file.includes("import { ImageCropModal } from '../common/ImageCropModal'"));
    assert.ok(file.includes('Upload & Crop Image'));
    assert.ok(file.includes('setCropTargetAsset(item)'));
  });
});
