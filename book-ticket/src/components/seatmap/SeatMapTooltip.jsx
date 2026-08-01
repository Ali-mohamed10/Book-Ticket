/**
 * SeatMapTooltip Component
 *
 * Purpose: Display table details.
 *          On desktop: absolute floating tooltip near table.
 *          On mobile: docked bottom sheet at the bottom of the container.
 */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TABLE_CATEGORIES } from '../../utils/seatMapConstants';

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
  containerWidth = 600,
  visible,
  onSeatsCountChange,
  onTableSelect,
  onMouseEnter,
  onMouseLeave,
  onClose
}) => {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!visible || !table) return null;

  const category = TABLE_CATEGORIES[table.category];
  const bookedSeats = table.bookedSeats || 0;
  const selectedSeatsCount = table.selectedSeatsCount || 0;
  const availableSeats = table.availableSeats ?? (table.capacity - bookedSeats);
  const isSelected = table.isSelected;
  const isSold = table.status === 'sold';

  // Desktop vertical calculations
  const isUpperHalf = y < 350;
  const clampedTop = isUpperHalf ? Math.min(y, 220) : Math.max(y, 370);
  const translateY = isUpperHalf ? '15px' : '-105%';

  // Desktop horizontal calculations
  const tooltipWidth = 240;
  const halfWidth = tooltipWidth / 2;
  let translateX = '-50%';
  let clampedLeft = x;

  if (x < halfWidth + 15) {
    translateX = '0%';
    clampedLeft = Math.max(10, x - 10);
  } else if (containerWidth && x > containerWidth - (halfWidth + 15)) {
    translateX = '-100%';
    clampedLeft = Math.min(containerWidth - 10, x + 10);
  }

  return (
    <div 
      className={`absolute z-50 pointer-events-auto bg-[#1A1610]/98 backdrop-blur-md text-[#F7F1E8] border-primary/20 shadow-2xl transition-all duration-300 ${
        isMobile 
          ? 'bottom-0 inset-x-0 w-full rounded-t-2xl border-t border-primary/30 p-4' 
          : 'rounded-lg border border-primary/20 p-3 min-w-48'
      }`}
      style={isMobile ? {
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(100%)'
      } : {
        left: `${clampedLeft}px`,
        top: `${clampedTop}px`,
        transform: `translate(${translateX}, ${translateY})`,
        opacity: visible ? 1 : 0
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Header: Table code + Status badge */}
      <div className="flex justify-between items-center mb-2 border-b border-primary/10 pb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-base text-[#F7F1E8]">{table.table_code || table.id}</span>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: getStatusBadgeColor(table.status) }}
          >
            {t(`seatMap.${table.status}`, table.status)}
          </span>
        </div>
        
        {isMobile && (
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose?.(); // visually close tooltip without deselecting
            }}
            className="text-muted-foreground hover:text-[#F7F1E8] p-1 text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full hover:bg-secondary/20 transition-colors"
          >
            ✕
          </button>
        )}
      </div>
      
      {/* Metadata layout: 2-column grid on mobile to save vertical space */}
      <div className="grid grid-cols-2 md:block gap-x-6 gap-y-1 mb-2">
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

        {/* Available */}
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
      </div>
      
      {/* Select / Seats adjustment block */}
      {!isSold && (
        <div className="mt-2 pt-2 border-t border-primary/10">
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

              {/* Total Price & Deselect button in a flex row on mobile */}
              <div className="flex flex-row md:flex-col gap-3 justify-between items-center md:items-stretch">
                <div className="flex justify-between items-center text-xs font-bold text-primary gap-2">
                  <span>{t('seatMap.total', 'Total')}</span>
                  <span>${(Number(table.price) * table.selectedSeatsCount).toFixed(2)}</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTableSelect?.(table);
                  }}
                  className="bg-destructive/10 hover:bg-destructive/25 border border-destructive/20 text-destructive text-xs py-1.5 px-3 md:px-0 rounded font-bold transition-colors"
                >
                  {t('seatMap.deselectTable', 'Deselect Table')}
                </button>
              </div>
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
