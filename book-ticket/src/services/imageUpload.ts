import imageCompression from 'browser-image-compression';
import { supabase } from '../lib/supabaseClient';

const DEFAULT_BUCKET = 'event-images';
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export interface UploadProgress {
  stage: 'validating' | 'compressing' | 'uploading' | 'completed';
  progress: number; // 0 to 100
}

export interface UploadResult {
  publicUrl: string;
  thumbnailUrl?: string;
  originalSize: number; // bytes
  compressedSize: number; // bytes
  savedPercentage: number; // e.g. 85.5
}

export interface UploadOptions {
  folder: 'events' | 'seatmaps' | 'users' | 'venues';
  subfolder?: string;
  filenamePrefix?: string;
  maxWidth?: number;
  quality?: number;
  generateThumb?: boolean;
  bucketName?: string;
  onProgress?: (info: UploadProgress) => void;
}

/**
 * Validates file size (<= 15MB) and mime type
 */
export const validateImage = (file: File): void => {
  if (!file) {
    throw new Error('No image file provided.');
  }

  if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
    throw new Error('Unsupported image format. Allowed formats: JPG, JPEG, PNG, WEBP.');
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('File size exceeds the 15 MB maximum limit.');
  }
};

/**
 * Compress and convert image to WebP using browser-image-compression with fallback
 */
export const compressImage = async (
  file: File,
  maxWidth = 1600,
  quality = 0.8,
  onProgress?: (progress: number) => void
): Promise<File> => {
  const options = {
    maxSizeMB: 5,
    maxWidthOrHeight: maxWidth,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: quality,
    onProgress: (p: number) => {
      if (onProgress) onProgress(p);
    },
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    return new File([compressedBlob], `${baseName}.webp`, { type: 'image/webp' });
  } catch (error) {
    console.warn('Image compression fallback triggered:', error);
    // If browser compression fails for any reason, safely return the original file
    return file;
  }
};

/**
 * Generate a 500px wide WebP thumbnail at 75% quality
 */
export const generateThumbnail = async (file: File): Promise<File> => {
  return compressImage(file, 500, 0.75);
};

/**
 * Upload an image to Supabase storage after processing
 */
export const uploadImage = async (
  file: File,
  options: UploadOptions
): Promise<UploadResult> => {
  const {
    folder,
    subfolder,
    filenamePrefix = 'image',
    maxWidth = 1600,
    quality = 0.8,
    generateThumb = false,
    bucketName,
    onProgress,
  } = options;

  // Sanitize subfolder to prevent [object Object] in key names
  const rawSubfolder = typeof subfolder === 'string' ? subfolder : '';
  const isCleanString = rawSubfolder.trim() !== '' && !rawSubfolder.includes('[object');
  const safeSubfolder = isCleanString ? rawSubfolder.replace(/[^a-zA-Z0-9_-]/g, '_') : `temp_${Date.now()}`;

  // Determine correct bucket name
  const targetBucket = bucketName || (folder === 'seatmaps' ? 'seat-maps' : DEFAULT_BUCKET);

  // 1. Validate
  if (onProgress) onProgress({ stage: 'validating', progress: 10 });
  validateImage(file);

  const originalSize = file.size;

  // 2. Compress & Convert to WebP
  if (onProgress) onProgress({ stage: 'compressing', progress: 30 });
  const compressedFile = await compressImage(file, maxWidth, quality, (p) => {
    if (onProgress) onProgress({ stage: 'compressing', progress: 30 + Math.round(p * 0.4) });
  });

  const compressedSize = compressedFile.size;
  const savedPercentage = originalSize > 0 
    ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
    : 0;

  // 3. Generate Thumbnail if requested
  let thumbFile: File | null = null;
  if (generateThumb) {
    try {
      thumbFile = await generateThumbnail(file);
    } catch (e) {
      console.warn('Thumbnail generation skipped:', e);
    }
  }

  // 4. Upload to Supabase Storage
  if (onProgress) onProgress({ stage: 'uploading', progress: 80 });

  const timestamp = Date.now();
  const fileExt = compressedFile.name.endsWith('.webp') ? 'webp' : file.name.split('.').pop() || 'jpg';
  const mainPath = `${folder}/${safeSubfolder}/${filenamePrefix}_${timestamp}.${fileExt}`;

  // Helper to attempt upload with fallback bucket if primary bucket fails
  const performUpload = async (bucket: string, path: string, uploadFile: File) => {
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, uploadFile, {
        contentType: uploadFile.type || 'image/jpeg',
      });
    return uploadError;
  };

  let uploadError = await performUpload(targetBucket, mainPath, compressedFile);

  // Fallback to DEFAULT_BUCKET if targetBucket returned error (e.g. bucket doesn't exist)
  let activeBucket = targetBucket;
  if (uploadError && targetBucket !== DEFAULT_BUCKET) {
    console.warn(`Upload to ${targetBucket} failed. Retrying on ${DEFAULT_BUCKET}:`, uploadError);
    uploadError = await performUpload(DEFAULT_BUCKET, mainPath, compressedFile);
    if (!uploadError) {
      activeBucket = DEFAULT_BUCKET;
    }
  }

  if (uploadError) {
    console.error('Final Supabase Storage upload error:', uploadError);
    throw new Error(uploadError.message || 'Storage upload failed');
  }

  const { data: mainUrlData } = supabase.storage
    .from(activeBucket)
    .getPublicUrl(mainPath);

  let thumbnailUrl: string | undefined;

  if (thumbFile) {
    const thumbExt = thumbFile.name.endsWith('.webp') ? 'webp' : 'jpg';
    const thumbPath = `${folder}/${safeSubfolder}/${filenamePrefix}-thumb_${timestamp}.${thumbExt}`;
    const thumbError = await performUpload(activeBucket, thumbPath, thumbFile);

    if (!thumbError) {
      const { data: thumbUrlData } = supabase.storage
        .from(activeBucket)
        .getPublicUrl(thumbPath);
      thumbnailUrl = thumbUrlData.publicUrl;
    }
  }

  if (onProgress) onProgress({ stage: 'completed', progress: 100 });

  return {
    publicUrl: mainUrlData.publicUrl,
    thumbnailUrl,
    originalSize,
    compressedSize,
    savedPercentage,
  };
};

/**
 * Specialized Event Cover uploader (1600px, 80% quality, webp, thumbnail)
 */
export const uploadEventCover = async (
  file: File,
  eventId?: any,
  onProgress?: any
): Promise<UploadResult> => {
  const cleanId = (typeof eventId === 'string' && eventId && !eventId.includes('[object')) ? eventId : `temp_${Date.now()}`;
  const cleanProgress = typeof onProgress === 'function' ? onProgress : undefined;
  return uploadImage(file, {
    folder: 'events',
    subfolder: cleanId,
    filenamePrefix: 'cover',
    maxWidth: 1600,
    quality: 0.8,
    generateThumb: true,
    onProgress: cleanProgress,
  });
};

/**
 * Specialized Seat Map uploader (2200px, 90% quality, webp)
 */
export const uploadSeatMap = async (
  file: File,
  eventId?: any,
  onProgress?: any
): Promise<UploadResult> => {
  const cleanId = (typeof eventId === 'string' && eventId && !eventId.includes('[object')) ? eventId : `temp_${Date.now()}`;
  const cleanProgress = typeof onProgress === 'function' ? onProgress : undefined;
  return uploadImage(file, {
    folder: 'seatmaps',
    subfolder: cleanId,
    filenamePrefix: 'map',
    maxWidth: 2200,
    quality: 0.9,
    generateThumb: false,
    onProgress: cleanProgress,
  });
};
