/**
 * ZoomControls Component
 *
 * Purpose: Render UI controls (Zoom In, Zoom Out, Reset, Fullscreen) for the seating map.
 * Inputs: onZoomIn, onZoomOut, onReset, isFullscreen, onToggleFullscreen
 * Output: Glassmorphic button overlay
 * Dependencies: lucide-react, react-i18next
 */
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ZoomIn, ZoomOut, Maximize, Minimize, RotateCcw } from 'lucide-react';

export const ZoomControls = memo(({ onZoomIn, onZoomOut, onReset, isFullscreen, onToggleFullscreen }) => {
  const { t } = useTranslation();

  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-background/80 backdrop-blur border border-border p-2 rounded-lg shadow-sm">
      {/* Zoom In */}
      <button
        onClick={onZoomIn}
        className="w-9 h-9 flex items-center justify-center bg-secondary/20 hover:bg-secondary/40 text-foreground border border-border/50 rounded transition-colors"
        title={t('seatMap.zoomIn', 'Zoom In')}
        aria-label={t('seatMap.zoomIn', 'Zoom In')}
      >
        <ZoomIn className="w-5 h-5" />
      </button>

      {/* Zoom Out */}
      <button
        onClick={onZoomOut}
        className="w-9 h-9 flex items-center justify-center bg-secondary/20 hover:bg-secondary/40 text-foreground border border-border/50 rounded transition-colors"
        title={t('seatMap.zoomOut', 'Zoom Out')}
        aria-label={t('seatMap.zoomOut', 'Zoom Out')}
      >
        <ZoomOut className="w-5 h-5" />
      </button>

      {/* Reset */}
      <button
        onClick={onReset}
        className="w-9 h-9 flex items-center justify-center bg-secondary/20 hover:bg-secondary/40 text-foreground border border-border/50 rounded transition-colors"
        title={t('seatMap.resetView', 'Reset View')}
        aria-label={t('seatMap.resetView', 'Reset View')}
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      {/* Fullscreen */}
      <button
        onClick={onToggleFullscreen}
        className="w-9 h-9 flex items-center justify-center bg-secondary/20 hover:bg-secondary/40 text-foreground border border-border/50 rounded transition-colors animate-pulse-subtle"
        title={isFullscreen ? t('seatMap.exitFullscreen', 'Exit Fullscreen') : t('seatMap.enterFullscreen', 'Fullscreen')}
        aria-label={isFullscreen ? t('seatMap.exitFullscreen', 'Exit Fullscreen') : t('seatMap.enterFullscreen', 'Fullscreen')}
      >
        {isFullscreen ? (
          <Minimize className="w-4 h-4" />
        ) : (
          <Maximize className="w-4 h-4" />
        )}
      </button>
    </div>
  );
});

ZoomControls.displayName = 'ZoomControls';
