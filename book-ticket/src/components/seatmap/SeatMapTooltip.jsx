import { useTranslation } from 'react-i18next';
import { TABLE_CATEGORIES, TABLE_STATUSES } from '../../utils/seatMapConstants';

export const SeatMapTooltip = ({ table, x, y, visible }) => {
  const { t } = useTranslation();

  if (!visible || !table) return null;

  const category = TABLE_CATEGORIES[table.category];
  const status = TABLE_STATUSES[table.status];

  return (
    <div 
      className="absolute z-50 pointer-events-none bg-popover text-popover-foreground border border-border shadow-xl rounded-lg p-3 min-w-[150px] transition-opacity duration-200"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -120%)',
        opacity: visible ? 1 : 0
      }}
    >
      <div className="flex justify-between items-start mb-2 border-b border-border/50 pb-2">
        <span className="font-bold text-base">{table.table_code}</span>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `var(${status?.colorVar})`, color: '#fff' }}>
          {t(status?.label)}
        </span>
      </div>
      
      <div className="flex justify-between text-sm mb-1">
        <span className="text-muted-foreground">Category</span>
        <span className="font-medium" style={{ color: `var(${category?.colorVar})` }}>{t(category?.label)}</span>
      </div>
      
      <div className="flex justify-between text-sm mb-1">
        <span className="text-muted-foreground">Capacity</span>
        <span className="font-medium">{t('seatMap.persons', '{{count}} persons', { count: table.capacity })}</span>
      </div>
      
      <div className="flex justify-between text-sm mt-2 pt-2 border-t border-border/50">
        <span className="text-muted-foreground">Price</span>
        <span className="font-bold text-primary">${table.price}</span>
      </div>
    </div>
  );
};
