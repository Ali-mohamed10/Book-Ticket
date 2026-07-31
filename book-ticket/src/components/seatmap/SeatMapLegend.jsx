/**
 * SeatMapLegend Component
 *
 * Purpose: Display legend showing table status visual treatments (overlays).
 *          Categories section has been removed as requested.
 * Output: Legend card with status indicators
 * Dependencies: react-i18next, seatMapConstants
 */
import { useTranslation } from 'react-i18next';
import { TABLE_STATUSES } from '../../utils/seatMapConstants';

export const SeatMapLegend = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-card border border-border p-4 rounded-lg shadow-sm">
      <h3 className="font-bold font-sans text-sm mb-3">{t('seatMap.legend', 'Legend')}</h3>
      
      <div className="space-y-4">
        {/* Status visual treatments — overlays, NOT color replacements */}
        <div>
          <div className="grid grid-cols-3 gap-2">
            {/* Available: normal swatch */}
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm border border-black/20 bg-seat-standard/25 stroke-seat-standard" />
              <span className="text-xs text-foreground">{t(TABLE_STATUSES.available.label)}</span>
            </div>

            {/* Reserved: swatch with amber border */}
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm border-2 border-seat-reserved-border bg-seat-standard/25" />
              <span className="text-xs text-foreground">{t(TABLE_STATUSES.reserved.label)}</span>
            </div>

            {/* Sold: desaturated + reduced opacity */}
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm border border-black/20 bg-seat-standard/25 opacity-30 saturate-[0.3]" />
              <span className="text-xs text-foreground">{t(TABLE_STATUSES.sold.label)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
