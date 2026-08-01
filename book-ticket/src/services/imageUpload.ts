import imageCompression from 'browser-image-compression';
import { supabase } from '../lib/supabaseClient';

const BUCKET_NAME = 'event-images';
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
 * Compress and convert image to WebP using browser-image-compression
 */
export const compressImage = async (
  file: File,
  maxWidth = 1600,
  quality = 0.8,
  onProgress?: (progress: number) => void
): Promise<File> => {
  const options = {
    maxSizeMB: 10,
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
    // Return a File object with .webp extension
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    return new File([compressedBlob], `${baseName}.webp`, { type: 'image/webp' });
  } catch (error) {
    console.error('Image compression error:', error);
    throw new Error('Failed to compress and optimize image.');
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
    subfolder = Date.now().toString(),
    filenamePrefix = 'image',
    maxWidth = 1600,
    quality = 0.8,
    generateThumb = false,
    onProgress,
  } = options;

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
    thumbFile = await generateThumbnail(file);
  }

  // 4. Upload to Supabase Storage
  if (onProgress) onProgress({ stage: 'uploading', progress: 80 });

  const timestamp = Date.now();
  const mainPath = `${folder}/${subfolder}/${filenamePrefix}_${timestamp}.webp`;

  const { error: mainUploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(mainPath, compressedFile, {
      contentType: 'image/webp',
      cacheControl: '360000',
      upsert: true,
    });

  if (mainUploadError) {
    console.error('Storage upload error:', mainUploadError);
    throw mainUploadError;
  }

  const { data: mainUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(mainPath);

  let thumbnailUrl: string | undefined;

  if (thumbFile) {
    const thumbPath = `${folder}/${subfolder}/${filenamePrefix}-thumb_${timestamp}.webp`;
    const { error: thumbUploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(thumbPath, thumbFile, {
        contentType: 'image/webp',
        cacheControl: '360000',
        upsert: true,
      });

    if (!thumbUploadError) {
      const { data: thumbUrlData } = supabase.storage
        .from(BUCKET_NAME)
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
  eventId?: string,
  onProgress?: (info: UploadProgress) => void
): Promise<UploadResult> => {
  return uploadImage(file, {
    folder: 'events',
    subfolder: eventId || `temp_${Date.now()}`,
    filenamePrefix: 'cover',
    maxWidth: 1600,
    quality: 0.8,
    generateThumb: true,
    onProgress,
  });
};

/**
 * Specialized Seat Map uploader (2200px, 90% quality, webp)
 */
export const uploadSeatMap = async (
  file: File,
  eventId?: string,
  onProgress?: (info: UploadProgress) => void
): Promise<UploadResult> => {
  return uploadImage(file, {
    folder: 'seatmaps',
    subfolder: eventId || `temp_${Date.now()}`,
    filenamePrefix: 'map',
    maxWidth: 2200,
    quality: 0.9,
    generateThumb: false,
    onProgress,
  });
};
