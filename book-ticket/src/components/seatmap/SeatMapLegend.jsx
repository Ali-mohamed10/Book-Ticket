/**
 * SeatMapLegend Component
 *
 * Purpose: Display legend showing table categories (permanent colors)
 *          and status visual treatments (overlays, not color replacements).
 * Output: Legend card with category colors and status indicators
 * Dependencies: react-i18next, seatMapConstants
 */
import { useTranslation } from 'react-i18next';
import { TABLE_CATEGORIES, TABLE_STATUSES } from '../../utils/seatMapConstants';

export const SeatMapLegend = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-card border border-border p-4 rounded-lg shadow-sm">
      <h3 className="font-bold font-sans text-sm mb-4">{t('seatMap.legend', 'Legend')}</h3>
      
      <div className="space-y-4">
        {/* Category colors — permanent, represent table type */}
        <div>
          <h4 className="text-xs text-muted-foreground font-semibold mb-2 uppercase tracking-wider">
            {t('seatMap.categoriesLabel', 'Categories')}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(TABLE_CATEGORIES).map(([key, category]) => (
              <div key={key} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-sm border border-black/20" 
                  style={{ backgroundColor: `var(${category.colorVar})` }} 
                />
                <span className="text-xs text-foreground">{t(category.label)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status visual treatments — overlays, NOT color replacements */}
        <div>
          <h4 className="text-xs text-muted-foreground font-semibold mb-2 uppercase tracking-wider">
            {t('seatMap.statusLabel', 'Status')}
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {/* Available: normal swatch */}
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm border border-black/20 bg-seat-vip/40" />
              <span className="text-xs text-foreground">{t(TABLE_STATUSES.available.label)}</span>
            </div>

            {/* Reserved: swatch with amber border */}
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm border-2 border-seat-reserved-border bg-seat-vip/40" />
              <span className="text-xs text-foreground">{t(TABLE_STATUSES.reserved.label)}</span>
            </div>

            {/* Sold: desaturated + reduced opacity */}
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm border border-black/20 bg-seat-vip/40 opacity-30 saturate-[0.3]" />
              <span className="text-xs text-foreground">{t(TABLE_STATUSES.sold.label)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
