export interface CropArea {
  width: number;
  height: number;
  x: number;
  y: number;
}

/**
 * Creates an HTMLImageElement from a URL (object URL, data URL, or remote URL).
 * Sets crossOrigin to anonymous to allow Canvas export for remote R2 assets.
 */
export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

export function getRadianAngle(degreeValue: number): number {
  return (degreeValue * Math.PI) / 180;
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
export function calculateRotatedSize(width: number, height: number, rotation: number): {
  width: number;
  height: number;
} {
  const rotRad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

export interface CropTransformOptions {
  rotation?: number;
  flip?: {
    horizontal: boolean;
    vertical: boolean;
  };
  outputFormat?: 'image/jpeg' | 'image/png' | 'image/webp';
  quality?: number;
}

/**
 * Crops and rotates an image using an offscreen HTML5 Canvas.
 * Produces a full-resolution cropped Blob based on pixelCrop from react-easy-crop.
 */
export async function getCroppedImgBlob(
  imageSrc: string,
  pixelCrop: CropArea,
  options: CropTransformOptions = {}
): Promise<Blob> {
  const {
    rotation = 0,
    flip = { horizontal: false, vertical: false },
    outputFormat = 'image/jpeg',
    quality = 0.92,
  } = options;

  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context is not available');
  }

  const rotRad = getRadianAngle(rotation);

  // Calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = calculateRotatedSize(
    image.naturalWidth,
    image.naturalHeight,
    rotation
  );

  // Set intermediate canvas size to match the rotated image
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // Configure high-quality rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Translate canvas-context to center point to rotate and flip around center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.naturalWidth / 2, -image.naturalHeight / 2);

  // Draw the original image onto the rotated canvas
  ctx.drawImage(image, 0, 0);

  // Create final crop canvas matching the exact pixel crop dimensions
  const cropCanvas = document.createElement('canvas');
  const cropCtx = cropCanvas.getContext('2d');

  if (!cropCtx) {
    throw new Error('Crop Canvas 2D context is not available');
  }

  // Safety checks on pixelCrop dimensions
  const cropWidth = Math.max(1, Math.round(pixelCrop.width));
  const cropHeight = Math.max(1, Math.round(pixelCrop.height));

  cropCanvas.width = cropWidth;
  cropCanvas.height = cropHeight;

  cropCtx.imageSmoothingEnabled = true;
  cropCtx.imageSmoothingQuality = 'high';

  // Draw cropped slice from rotated canvas onto the output canvas
  cropCtx.drawImage(
    canvas,
    Math.round(pixelCrop.x),
    Math.round(pixelCrop.y),
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight
  );

  // Asynchronously export canvas to Blob
  return new Promise((resolve, reject) => {
    cropCanvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas export failed: generated blob is empty'));
          return;
        }
        resolve(blob);
      },
      outputFormat,
      quality
    );
  });
}

/**
 * Crops and exports an image as a standard File object, ready for upload to R2 / CMS storage.
 */
export async function getCroppedImgFile(
  imageSrc: string,
  pixelCrop: CropArea,
  fileName: string,
  options: CropTransformOptions = {}
): Promise<File> {
  const blob = await getCroppedImgBlob(imageSrc, pixelCrop, options);
  const ext = options.outputFormat === 'image/png' ? 'png' : options.outputFormat === 'image/webp' ? 'webp' : 'jpg';
  const cleanName = fileName.replace(/\.[^/.]+$/, '') + `_cropped.${ext}`;
  const mimeType = options.outputFormat || 'image/jpeg';
  return new File([blob], cleanName, { type: mimeType, lastModified: Date.now() });
}
