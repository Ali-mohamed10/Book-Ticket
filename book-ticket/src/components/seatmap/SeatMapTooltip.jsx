/**
 * SeatMapTooltip Component
 *
 * Purpose: Display hover tooltip with table details.
 *          Supports selecting table and modifying seat counts directly inside the tooltip.
 * Inputs: table object, x/y coords, visible boolean, callbacks (onSeatsCountChange, onTableSelect, onMouseEnter, onMouseLeave)
 * Output: Interactive positioned tooltip overlay
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

export const SeatMapTooltip = ({
  table,
  x,
  y,
  visible,
  onSeatsCountChange,
  onTableSelect,
  onMouseEnter,
  onMouseLeave
}) => {
  const { t } = useTranslation();

  if (!visible || !table) return null;

  const category = TABLE_CATEGORIES[table.category];
  const bookedSeats = table.bookedSeats || 0;
  const selectedSeatsCount = table.selectedSeatsCount || 0;
  const availableSeats = table.availableSeats ?? (table.capacity - bookedSeats);
  const isSelected = table.isSelected;
  const isSold = table.status === 'sold';

  const isNearTop = y < 220;

  return (
    <div 
      className="absolute z-50 pointer-events-auto bg-[#1A1610]/95 backdrop-blur-md text-[#F7F1E8] border border-primary/20 shadow-xl rounded-lg p-3 min-w-48 transition-all duration-200"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: `translate(-50%, ${isNearTop ? '15px' : '-105%'})`,
        opacity: visible ? 1 : 0
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
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

      {/* Selected (dynamic from current user session) */}
      {selectedSeatsCount > 0 && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-[#BDAF9D]">{t('seatMap.selected', 'Selected')}</span>
          <span className="font-medium text-primary">
            {selectedSeatsCount}
          </span>
        </div>
      )}

      {/* Available (dynamic remaining) */}
      <div className="flex justify-between text-sm mb-1">
        <span className="text-[#BDAF9D]">{t('seatMap.availableLabel', 'Available')}</span>
        <span className={`font-medium ${availableSeats - selectedSeatsCount === 0 ? 'text-[#6b7280]' : 'text-[#22c55e]'}`}>
          {Math.max(0, availableSeats - selectedSeatsCount)}
        </span>
      </div>
      
      {/* Price per seat */}
      <div className="flex justify-between text-sm mb-1">
        <span className="text-[#BDAF9D]">{t('seatMap.priceLabel', 'Price')}</span>
        <span className="font-bold text-primary">${table.price}</span>
      </div>

      {/* Select / Seats adjustment block */}
      {!isSold && (
        <div className="mt-3 pt-3 border-t border-primary/10">
          {isSelected ? (
            <div className="space-y-3">
              {/* Seats selector row */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#BDAF9D]">{t('seatMap.seatsToBook', 'Book Seats')}</span>
                <div className="flex items-center bg-background border border-border rounded-lg p-0.5 shadow-sm">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSeatsCountChange?.(table.db_id || table.id, Math.max(1, table.selectedSeatsCount - 1));
                    }}
                    disabled={table.selectedSeatsCount <= 1}
                    className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-secondary/40 text-foreground disabled:opacity-20 disabled:hover:bg-transparent transition-colors font-bold"
                  >
                    -
                  </button>
                  <span className="w-7 text-center text-xs font-bold text-foreground">
                    {table.selectedSeatsCount}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSeatsCountChange?.(table.db_id || table.id, Math.min(availableSeats, table.selectedSeatsCount + 1));
                    }}
                    disabled={table.selectedSeatsCount >= availableSeats}
                    className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-secondary/40 text-foreground disabled:opacity-20 disabled:hover:bg-transparent transition-colors font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total Price */}
              <div className="flex justify-between items-center text-xs font-bold text-primary">
                <span>{t('seatMap.total', 'Total')}</span>
                <span>${(Number(table.price) * table.selectedSeatsCount).toFixed(2)}</span>
              </div>

              {/* Deselect button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTableSelect?.(table);
                }}
                className="w-full bg-destructive/10 hover:bg-destructive/25 border border-destructive/20 text-destructive text-xs py-1.5 rounded font-bold transition-colors"
              >
                {t('seatMap.deselectTable', 'Deselect Table')}
              </button>
            </div>
          ) : (
            /* Select table button */
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTableSelect?.(table);
              }}
              className="w-full bg-primary text-primary-foreground hover:opacity-90 text-xs py-2 rounded font-bold transition-opacity"
            >
              {t('seatMap.selectTableBtn', 'Select Table')}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
