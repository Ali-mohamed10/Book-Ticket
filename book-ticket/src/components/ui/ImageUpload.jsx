import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, CheckCircle2, FileImage } from 'lucide-react';
import AppImage from '../common/AppImage';
import { validateImage } from '../../services/imageUpload';

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(2)} MB`;
  const kb = bytes / 1024;
  return `${kb.toFixed(0)} KB`;
};

export const ImageUpload = ({ 
  label, 
  value, 
  onChange, 
  error, 
  onUpload, 
  isUploading = false,
  accept = "image/jpeg, image/png, image/webp",
  uploadStats = null,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [localError, setLocalError] = useState('');
  const [progressInfo, setProgressInfo] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const processFile = useCallback(async (file) => {
    setLocalError('');
    try {
      validateImage(file);
      if (onUpload) {
        await onUpload(file, (info) => setProgressInfo(info));
      }
    } catch (err) {
      setLocalError(err.message || 'Failed to process image');
    }
  }, [onUpload]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [processFile]);

  const handleChange = useCallback((e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  }, [processFile]);

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  const removeImage = () => {
    onChange('');
    setProgressInfo(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const displayError = error || localError;

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      
      {value ? (
        <div className="flex flex-col gap-2">
          <div className="relative rounded-lg overflow-hidden border border-border group aspect-video bg-background">
            <AppImage 
              src={value} 
              alt="Uploaded image preview" 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              containerClassName="w-full h-full"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
              <button
                type="button"
                onClick={removeImage}
                className="p-2 bg-destructive/90 text-destructive-foreground rounded-full hover:bg-destructive transition-colors shadow-md"
                aria-label="Remove image"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Optimized Compression Stats Display */}
          {uploadStats && (
            <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-md px-3 py-2 text-xs font-mono text-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Original: <strong className="text-muted-foreground">{formatFileSize(uploadStats.originalSize)}</strong></span>
                <span className="opacity-40">|</span>
                <span>Optimized: <strong className="text-primary">{formatFileSize(uploadStats.compressedSize)}</strong></span>
              </div>
              <span className="bg-primary/20 text-primary font-bold px-2 py-0.5 rounded-full">
                Saved {uploadStats.savedPercentage}%
              </span>
            </div>
          )}
        </div>
      ) : (
        <div 
          className={`
            relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg aspect-video transition-colors
            ${dragActive ? 'border-primary bg-primary/5' : 'border-border bg-secondary/10 hover:bg-secondary/20 hover:border-primary/50'}
            ${displayError ? 'border-destructive/50 hover:border-destructive' : ''}
            ${isUploading ? 'opacity-75 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
            disabled={isUploading}
          />
          
          {isUploading ? (
            <div className="flex flex-col items-center gap-3 text-primary w-full max-w-xs text-center">
              <Loader2 className="w-8 h-8 animate-spin" />
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden border border-border">
                <div 
                  className="bg-primary h-full transition-all duration-300" 
                  style={{ width: `${progressInfo?.progress || 40}%` }}
                />
              </div>
              <span className="text-xs font-semibold capitalize tracking-wide">
                {progressInfo?.stage === 'compressing'
                  ? 'Optimizing & Converting to WebP...'
                  : progressInfo?.stage === 'uploading'
                  ? 'Uploading to Storage...'
                  : 'Processing Image...'}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <div className="p-3 bg-secondary rounded-full">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium">
                <span className="text-primary hover:underline">Click to upload</span> or drag and drop
              </p>
              <div className="flex items-center gap-1 text-xs opacity-75">
                <FileImage className="w-3.5 h-3.5" />
                <span>WebP, PNG, JPG (Max. 15MB) — Auto-optimized</span>
              </div>
            </div>
          )}
        </div>
      )}
      
      {displayError && (
        <p className="text-xs text-destructive animate-fade-in">{displayError}</p>
      )}
    </div>
  );
};
