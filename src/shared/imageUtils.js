/**
 * SiamClones — Client-side image optimization utilities
 * Resizes, compresses, and converts images before upload to Supabase Storage.
 * Dramatically reduces upload size and page load times on mobile.
 */

/**
 * Resize and compress an image file client-side before upload.
 * Returns a new File object (or Blob) that's optimized.
 *
 * @param {File} file - Original image file from input
 * @param {Object} options
 * @param {number} options.maxWidth - Max width in px (default 1200)
 * @param {number} options.maxHeight - Max height in px (default 1200)
 * @param {number} options.quality - JPEG/WebP quality 0-1 (default 0.82)
 * @param {string} options.format - Output format: 'image/webp' or 'image/jpeg' (default auto-detect)
 * @returns {Promise<{file: File, width: number, height: number}>}
 */
export async function optimizeImage(file, options = {}) {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.82,
    format = null,
  } = options;

  // Skip non-image files
  if (!file.type.startsWith('image/')) {
    return { file, width: 0, height: 0 };
  }

  // Skip SVGs — they don't need rasterization
  if (file.type === 'image/svg+xml') {
    return { file, width: 0, height: 0 };
  }

  // Skip tiny files (< 50KB) — not worth processing
  if (file.size < 50 * 1024) {
    return { file, width: 0, height: 0 };
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Calculate new dimensions maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      // If image is already small enough and file is under 500KB, skip
      if (width === img.width && height === img.height && file.size < 500 * 1024) {
        resolve({ file, width, height });
        return;
      }

      // Use OffscreenCanvas if available (better performance, works in workers)
      const canvas = typeof OffscreenCanvas !== 'undefined'
        ? new OffscreenCanvas(width, height)
        : document.createElement('canvas');

      if (!(canvas instanceof OffscreenCanvas)) {
        canvas.width = width;
        canvas.height = height;
      }

      const ctx = canvas.getContext('2d');

      // Enable high-quality downscaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Determine output format
      const supportsWebP = typeof canvas.toBlob !== 'undefined';
      const outputFormat = format || (supportsWebP ? 'image/webp' : 'image/jpeg');
      const outputQuality = quality;

      // Convert to blob
      if (canvas instanceof OffscreenCanvas) {
        canvas.convertToBlob({ type: outputFormat, quality: outputQuality })
          .then(blob => {
            const ext = outputFormat === 'image/webp' ? 'webp' : 'jpg';
            const newName = file.name.replace(/\.[^.]+$/, `.${ext}`);
            const optimized = new File([blob], newName, { type: outputFormat });

            // Only use optimized if it's actually smaller
            if (optimized.size < file.size) {
              resolve({ file: optimized, width, height });
            } else {
              resolve({ file, width: img.width, height: img.height });
            }
          })
          .catch(() => resolve({ file, width: img.width, height: img.height }));
      } else {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({ file, width: img.width, height: img.height });
              return;
            }
            const ext = outputFormat === 'image/webp' ? 'webp' : 'jpg';
            const newName = file.name.replace(/\.[^.]+$/, `.${ext}`);
            const optimized = new File([blob], newName, { type: outputFormat });

            // Only use optimized if it's actually smaller
            if (optimized.size < file.size) {
              resolve({ file: optimized, width, height });
            } else {
              resolve({ file, width: img.width, height: img.height });
            }
          },
          outputFormat,
          outputQuality
        );
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      // Fall back to original file on decode error
      resolve({ file, width: 0, height: 0 });
    };

    img.src = url;
  });
}

/**
 * Generate a tiny blur placeholder (data URI) from an image file.
 * Creates a ~20px wide thumbnail encoded as base64 for instant display.
 *
 * @param {File|string} source - File object or image URL
 * @returns {Promise<string>} - base64 data URI for the blur placeholder
 */
export async function generateBlurPlaceholder(source) {
  const THUMB_WIDTH = 20;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const ratio = img.height / img.width;
      const thumbHeight = Math.round(THUMB_WIDTH * ratio);

      const canvas = document.createElement('canvas');
      canvas.width = THUMB_WIDTH;
      canvas.height = thumbHeight;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, THUMB_WIDTH, thumbHeight);

      try {
        resolve(canvas.toDataURL('image/jpeg', 0.4));
      } catch {
        resolve('');
      }

      if (typeof source !== 'string') {
        URL.revokeObjectURL(img.src);
      }
    };

    img.onerror = () => {
      resolve('');
      if (typeof source !== 'string') {
        URL.revokeObjectURL(img.src);
      }
    };

    img.src = typeof source === 'string' ? source : URL.createObjectURL(source);
  });
}

/**
 * Supabase Storage image URL with transform params.
 * Uses Supabase's built-in image transformation (if enabled) for on-the-fly resizing.
 * Falls back to original URL if transforms aren't supported.
 *
 * @param {string} url - Original Supabase Storage public URL
 * @param {Object} options
 * @param {number} options.width - Desired width
 * @param {number} options.height - Desired height
 * @param {string} options.resize - 'cover' | 'contain' | 'fill' (default 'cover')
 * @param {number} options.quality - 1-100 (default 75)
 * @returns {string} - Transformed URL
 */
export function getTransformedUrl(url, options = {}) {
  if (!url || typeof url !== 'string') return url;

  // Only transform Supabase storage URLs
  if (!url.includes('supabase.co/storage/v1/object/public/')) return url;

  const { width, height, resize = 'cover', quality = 75 } = options;

  // Convert public URL to render URL for transforms
  // e.g., .../storage/v1/object/public/images/... → .../storage/v1/render/image/public/images/...
  const transformedUrl = url.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/'
  );

  const params = new URLSearchParams();
  if (width) params.set('width', String(width));
  if (height) params.set('height', String(height));
  params.set('resize', resize);
  params.set('quality', String(quality));

  // Strip any existing query params (like cache-busting ?t=)
  const baseUrl = transformedUrl.split('?')[0];
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Build srcSet string for responsive images.
 * Generates multiple sizes for the browser to pick from based on viewport.
 *
 * @param {string} url - Original image URL
 * @param {number[]} widths - Array of widths to generate (default [320, 640, 960, 1200])
 * @returns {string} - srcSet attribute value
 */
export function buildSrcSet(url, widths = [320, 640, 960, 1200]) {
  if (!url || !url.includes('supabase.co/storage/v1/object/public/')) {
    return ''; // Can't transform non-Supabase URLs
  }

  return widths
    .map(w => `${getTransformedUrl(url, { width: w, quality: 75 })} ${w}w`)
    .join(', ');
}
