/**
 * Image Optimizer Utility for Ayush Prakash Portfolio
 * Handles client-side optimization, scaling, format conversion, and transparent PNG/SVG preservation.
 */

export async function optimizeImageFile(file: File, maxDimension = 1024): Promise<File> {
  // SVGs are vector graphics; preserve original vector fidelity without rasterization
  if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
    return file;
  }

  // If running in non-browser environment (tests), return file directly
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      let { width, height } = img;

      // If already within bounds, return original
      if (width <= maxDimension && height <= maxDimension && file.size < 500 * 1024) {
        return resolve(file);
      }

      // Compute constrained dimensions preserving aspect ratio
      if (width > height) {
        if (width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return resolve(file);
      }

      // Clear rect for alpha transparency
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Preserve PNG transparency or output WebP
      const outputType = file.type === 'image/png' ? 'image/png' : 'image/webp';
      const outputExt = outputType === 'image/png' ? '.png' : '.webp';

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const optimizedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, outputExt),
              { type: outputType }
            );
            resolve(optimizedFile);
          } else {
            resolve(file);
          }
        },
        outputType,
        0.92
      );
    };

    img.onerror = () => {
      resolve(file);
    };

    reader.readAsDataURL(file);
  });
}
