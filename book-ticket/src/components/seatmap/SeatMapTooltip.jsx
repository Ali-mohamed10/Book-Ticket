import { useTranslation } from 'react-i18next';
import { TABLE_CATEGORIES, TABLE_STATUSES } from '../../utils/seatMapConstants';

export const SeatMapTooltip = ({ table, x, y, visible }) => {
  const { t } = useTranslation();

  if (!visible || !table) return null;

  const category = TABLE_CATEGORIES[table.category];
  const status = TABLE_STATUSES[table.status];

  return (
    <div 
      className="absolute z-50 pointer-events-none bg-[#1A1610]/95 backdrop-blur-md text-[#F7F1E8] border border-primary/20 shadow-xl rounded-lg p-3 min-w-40 transition-opacity duration-200"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -120%)',
        opacity: visible ? 1 : 0
      }}
    >
      <div className="flex justify-between items-start mb-2 border-b border-primary/10 pb-2">
        <span className="font-bold text-base text-[#F7F1E8]">{table.table_code}</span>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `var(${status?.colorVar})`, color: '#fff' }}>
          {t(status?.label)}
        </span>
      </div>
      
      <div className="flex justify-between text-sm mb-1">
        <span className="text-[#BDAF9D]">Category</span>
        <span className="font-medium" style={{ color: `var(${category?.colorVar})` }}>{t(category?.label)}</span>
      </div>
      
      <div className="flex justify-between text-sm mb-1">
        <span className="text-[#BDAF9D]">Capacity</span>
        <span className="font-medium text-[#F7F1E8]">{t('seatMap.persons', '{{count}} persons', { count: table.capacity })}</span>
      </div>
      
      <div className="flex justify-between text-sm mt-2 pt-2 border-t border-primary/10">
        <span className="text-[#BDAF9D]">Price</span>
        <span className="font-bold text-primary">${table.price}</span>
      </div>
    </div>
  );
};
