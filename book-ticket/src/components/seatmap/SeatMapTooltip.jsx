/**
 * SeatMapTooltip Component
 *
 * Purpose: Display hover tooltip with table details including category,
 *          capacity, booked/available seats, price, and computed status.
 * Inputs: table object, x, y position, visible boolean
 * Output: Positioned tooltip overlay
 * Dependencies: react-i18next, seatMapConstants
 */
import { useTranslation } from 'react-i18next';
import { TABLE_CATEGORIES } from '../../utils/seatMapConstants';

/**
 * Get status badge color based on computed status.
 * Green = available, Amber = reserved, Gray = sold.
 */
const getStatusBadgeColor = (status) => {
  switch (status) {
    case 'available': return '#22c55e';
    case 'reserved': return '#f59e0b';
    case 'sold': return '#6b7280';
    default: return '#6b7280';
  }
};

export const SeatMapTooltip = ({ table, x, y, visible }) => {
  const { t } = useTranslation();

  if (!visible || !table) return null;

  const category = TABLE_CATEGORIES[table.category];
  const bookedSeats = table.bookedSeats || 0;
  const availableSeats = table.availableSeats ?? (table.capacity - bookedSeats);

  return (
    <div 
      className="absolute z-50 pointer-events-none bg-[#1A1610]/95 backdrop-blur-md text-[#F7F1E8] border border-primary/20 shadow-xl rounded-lg p-3 min-w-44 transition-opacity duration-200"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -120%)',
        opacity: visible ? 1 : 0
      }}
    >
      {/* Header: Table code + Status badge */}
      <div className="flex justify-between items-start mb-2 border-b border-primary/10 pb-2">
        <span className="font-bold text-base text-[#F7F1E8]">{table.table_code || table.id}</span>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: getStatusBadgeColor(table.status) }}
        >
          {t(`seatMap.${table.status}`, table.status)}
        </span>
      </div>
      
      {/* Category */}
      <div className="flex justify-between text-sm mb-1">
        <span className="text-[#BDAF9D]">{t('seatMap.categoryLabel', 'Category')}</span>
        <span className="font-medium" style={{ color: `var(${category?.colorVar})` }}>
          {t(category?.label)}
        </span>
      </div>
      
      {/* Capacity */}
      <div className="flex justify-between text-sm mb-1">
        <span className="text-[#BDAF9D]">{t('seatMap.capacityLabel', 'Capacity')}</span>
        <span className="font-medium text-[#F7F1E8]">{table.capacity}</span>
      </div>

      {/* Booked */}
      <div className="flex justify-between text-sm mb-1">
        <span className="text-[#BDAF9D]">{t('seatMap.bookedLabel', 'Booked')}</span>
        <span className={`font-medium ${bookedSeats > 0 ? 'text-[#f59e0b]' : 'text-[#F7F1E8]'}`}>
          {bookedSeats}
        </span>
      </div>

      {/* Available */}
      <div className="flex justify-between text-sm mb-1">
        <span className="text-[#BDAF9D]">{t('seatMap.availableLabel', 'Available')}</span>
        <span className={`font-medium ${availableSeats === 0 ? 'text-[#6b7280]' : 'text-[#22c55e]'}`}>
          {availableSeats}
        </span>
      </div>
      
      {/* Price */}
      <div className="flex justify-between text-sm mt-2 pt-2 border-t border-primary/10">
        <span className="text-[#BDAF9D]">{t('seatMap.priceLabel', 'Price')}</span>
        <span className="font-bold text-primary">${table.price}</span>
      </div>
    </div>
  );
};
