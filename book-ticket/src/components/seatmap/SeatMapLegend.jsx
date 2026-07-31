import { useTranslation } from 'react-i18next';
import { TABLE_CATEGORIES, TABLE_STATUSES } from '../../utils/seatMapConstants';

export const SeatMapLegend = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-card border border-border p-4 rounded-lg shadow-sm">
      <h3 className="font-bold font-sans text-sm mb-4">{t('seatMap.legend', 'Legend')}</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-xs text-muted-foreground font-semibold mb-2 uppercase tracking-wider">Categories</h4>
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

        <div>
          <h4 className="text-xs text-muted-foreground font-semibold mb-2 uppercase tracking-wider">Status</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(TABLE_STATUSES).map(([key, status]) => (
              <div key={key} className="flex items-center gap-2">
                <div 
                  className={`w-4 h-4 rounded-sm border border-black/20 ${key === 'disabled' || key === 'sold' ? 'opacity-50' : ''}`}
                  style={{ backgroundColor: `var(${status.colorVar})` }} 
                />
                <span className="text-xs text-foreground">{t(status.label)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
