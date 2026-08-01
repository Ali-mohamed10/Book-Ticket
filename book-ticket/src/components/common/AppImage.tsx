import React, { useState, memo } from 'react';
import { ImageOff } from 'lucide-react';

export interface AppImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  priority?: boolean;
  fallbackSrc?: string;
  containerClassName?: string;
}

export const AppImage = memo(({
  src,
  alt,
  priority = false,
  fallbackSrc,
  className = '',
  containerClassName = '',
  style,
  ...props
}: AppImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setIsLoaded(true);
    setIsError(true);
  };

  // Determine fetch priority attribute
  const fetchPriority = priority ? 'high' : 'low';
  const loadingMode = priority ? 'eager' : 'lazy';

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {/* Loading Skeleton */}
      {!isLoaded && !isError && (
        <div className="absolute inset-0 bg-muted/60 animate-pulse flex items-center justify-center z-10" />
      )}

      {/* Fallback View */}
      {(isError || !src) ? (
        <div className={`w-full h-full flex flex-col items-center justify-center bg-muted text-muted-foreground p-4 text-center ${className}`}>
          {fallbackSrc ? (
            <img
              src={fallbackSrc}
              alt={alt}
              className={`w-full h-full object-cover ${className}`}
              loading={loadingMode}
              decoding="async"
            />
          ) : (
            <div className="flex flex-col items-center gap-1">
              <ImageOff className="w-6 h-6 opacity-40" />
              <span className="text-xs opacity-60">Image unavailable</span>
            </div>
          )}
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={loadingMode}
          decoding="async"
          fetchPriority={fetchPriority}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          style={style}
          {...props}
        />
      )}
    </div>
  );
});

AppImage.displayName = 'AppImage';
export default AppImage;
