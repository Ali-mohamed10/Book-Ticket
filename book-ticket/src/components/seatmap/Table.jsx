/**
 * Table Component
 *
 * Purpose: Render a single interactive table SVG group <g> with surrounding chairs.
 *          Category color is PERMANENT (green=VIP, gold=Gold, blue=Standard).
 *          Status (available/reserved/sold) adds visual overlays only, never changes category color.
 * Inputs: table object (id, x, y, category, capacity, price, status, shape, bookedSeats, availableSeats), isSelected, onClick
 * Output: SVG group <g> containing table shape, chairs, labels, and status overlays
 * Dependencies: react-i18next
 */
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Get the Tailwind fill/stroke class prefix for a category.
 * These colors NEVER change based on status.
 */
const getCategoryColorClass = (category) => {
  switch (category) {
    case 'vip': return 'seat-vip';
    case 'gold': return 'seat-gold';
    case 'silver': return 'seat-silver';
    default: return 'seat-standard';
  }
};

export const Table = memo(({ table, isSelected, onClick }) => {
  const { t } = useTranslation();
  const { id, x, y, category, capacity, price, status, shape, bookedSeats = 0, availableSeats } = table;

  const colorClass = getCategoryColorClass(category);
  const isSold = status === 'sold';
  const isReserved = status === 'reserved';
  const isClickable = !isSold;

  // Handles clicking or pressing space/enter
  const handleAction = (e) => {
    if (isSold) return;
    e.preventDefault();
    onClick(table);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleAction(e);
    }
  };

  /**
   * Build table shape classes.
   * Category fill/stroke is ALWAYS applied.
   * Status adds visual overlays on top.
   */
  const getTableClasses = () => {
    // Base: always the category color
    const base = `fill-${colorClass}/25 stroke-${colorClass}`;

    if (isSelected) {
      // Selected: gold outline + scale + glow, but keep category fill
      return `fill-${colorClass}/40 stroke-seat-selected stroke-[2.5]`;
    }
    if (isSold) {
      // Sold: keep category color but desaturate + reduce opacity
      return `${base} opacity-30 saturate-[0.3] cursor-not-allowed`;
    }
    if (isReserved) {
      // Reserved: keep category color + amber border glow
      return `${base} stroke-seat-reserved-border stroke-2`;
    }
    // Available: normal with hover effects
    return `${base} hover:fill-${colorClass}/40 hover:scale-105`;
  };

  /**
   * Chair colors always match the category, never the status.
   */
  const getChairClasses = () => {
    if (isSelected) return `fill-${colorClass}/70 stroke-seat-selected/50`;
    if (isSold) return `fill-${colorClass}/15 stroke-${colorClass}/10`;
    return `fill-${colorClass}/60 stroke-${colorClass}/30`;
  };

  // Render chairs based on table capacity and shape layout
  const renderChairs = () => {
    const chairList = [];
    const chairWidth = 14;
    const chairHeight = 6;
    const rx = 2;
    const styleClasses = getChairClasses();

    if (shape === 'square') {
      // 4 chairs (top, bottom, left, right)
      chairList.push(
        <rect key="top" x={-chairWidth / 2} y={-26} width={chairWidth} height={chairHeight} rx={rx} className={styleClasses} />,
        <rect key="bottom" x={-chairWidth / 2} y={20} width={chairWidth} height={chairHeight} rx={rx} className={styleClasses} />,
        <rect key="left" x={-26} y={-chairWidth / 2} width={chairHeight} height={chairWidth} rx={rx} className={styleClasses} />,
        <rect key="right" x={20} y={-chairWidth / 2} width={chairHeight} height={chairWidth} rx={rx} className={styleClasses} />
      );
    } else if (shape === 'round') {
      // Circle layout for 6 chairs
      const radius = 28;
      for (let i = 0; i < capacity; i++) {
        const angle = (i * 2 * Math.PI) / capacity;
        const cx = Math.cos(angle) * radius;
        const cy = Math.sin(angle) * radius;
        chairList.push(
          <circle key={`chair-${i}`} cx={cx} cy={cy} r={5} className={styleClasses} />
        );
      }
    } else if (shape === 'rect_long') {
      // 6 chairs (3 on top, 3 on bottom)
      const topX = [-18, 0, 18];
      topX.forEach((cx, idx) => {
        chairList.push(
          <rect key={`top-${idx}`} x={cx - chairWidth / 2} y={-23} width={chairWidth} height={chairHeight} rx={rx} className={styleClasses} />,
          <rect key={`bottom-${idx}`} x={cx - chairWidth / 2} y={17} width={chairWidth} height={chairHeight} rx={rx} className={styleClasses} />
        );
      });
    } else if (shape === 'high_chairs') {
      // 16 chairs (8 top, 8 bottom)
      const spacing = 13.5;
      for (let i = 0; i < 8; i++) {
        const cx = -47.25 + i * spacing;
        chairList.push(
          <rect key={`high-top-${i}`} x={cx - 5} y={-26} width={10} height={5} rx={1} className={styleClasses} />,
          <rect key={`high-bottom-${i}`} x={cx - 5} y={21} width={10} height={5} rx={1} className={styleClasses} />
        );
      }
    } else if (shape === 'rect_vertical') {
      // 7 chairs (3 left, 3 right, 1 bottom)
      const leftY = [-24, 0, 24];
      leftY.forEach((cy, idx) => {
        chairList.push(
          <rect key={`left-${idx}`} x={-24} y={cy - chairWidth / 2} width={chairHeight} height={chairWidth} rx={rx} className={styleClasses} />,
          <rect key={`right-${idx}`} x={18} y={cy - chairWidth / 2} width={chairHeight} height={chairWidth} rx={rx} className={styleClasses} />
        );
      });
      chairList.push(
        <rect key="bottom" x={-chairWidth / 2} y={44} width={chairWidth} height={chairHeight} rx={rx} className={styleClasses} />
      );
    } else {
      // Standard rect (e.g. 2P or 4P top rows)
      if (capacity === 2) {
        chairList.push(
          <rect key="top" x={-chairWidth / 2} y={-22} width={chairWidth} height={chairHeight} rx={rx} className={styleClasses} />,
          <rect key="bottom" x={-chairWidth / 2} y={16} width={chairWidth} height={chairHeight} rx={rx} className={styleClasses} />
        );
      } else {
        chairList.push(
          <rect key="top" x={-chairWidth / 2} y={-26} width={chairWidth} height={chairHeight} rx={rx} className={styleClasses} />,
          <rect key="bottom" x={-chairWidth / 2} y={20} width={chairWidth} height={chairHeight} rx={rx} className={styleClasses} />,
          <rect key="left" x={-26} y={-chairWidth / 2} width={chairHeight} height={chairWidth} rx={rx} className={styleClasses} />,
          <rect key="right" x={20} y={-chairWidth / 2} width={chairHeight} height={chairWidth} rx={rx} className={styleClasses} />
        );
      }
    }
    return chairList;
  };

  // Render table outline shape
  const renderTableShape = () => {
    const commonClasses = `transition-all duration-300 stroke-[1.5] ${getTableClasses()}`;

    if (shape === 'round') {
      return <circle cx={0} cy={0} r={20} className={commonClasses} />;
    } else if (shape === 'rect_long') {
      return <rect x={-28} y={-14} width={56} height={28} rx={6} className={commonClasses} />;
    } else if (shape === 'high_chairs') {
      return <rect x={-55} y={-18} width={110} height={36} rx={6} className={commonClasses} />;
    } else if (shape === 'rect_vertical') {
      return <rect x={-16} y={-40} width={32} height={80} rx={6} className={commonClasses} />;
    } else if (shape === 'rect' && capacity === 2) {
      return <rect x={-20} y={-14} width={40} height={28} rx={4} className={commonClasses} />;
    } else {
      return <rect x={-18} y={-18} width={36} height={36} rx={6} className={commonClasses} />;
    }
  };

  // Label text opacity depends on status
  const labelClasses = isSold
    ? 'fill-[#F7F1E8]/25'
    : isSelected
      ? 'fill-primary-foreground'
      : 'fill-[#F7F1E8]';

  const subLabelClasses = isSold
    ? 'fill-[#BDAF9D]/15'
    : isSelected
      ? 'fill-primary-foreground/80'
      : 'fill-[#BDAF9D]';

  return (
    <g
      id={`table-${id}`}
      data-table-id={id}
      transform={`translate(${x}, ${y})${isSelected ? ' scale(1.03)' : ''}`}
      className={`group select-none outline-none ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
      onClick={handleAction}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={isClickable ? 0 : -1}
      aria-label={`${t('seatMap.tableInfo', 'Table')} ${id}, ${t(`seatMap.${category}`, category)}, ${capacity} ${t('checkout.seats', 'seats')}, $${price}, ${t(`seatMap.${status}`, status)}`}
    >
      {/* Selected glow effect */}
      {isSelected && (
        <circle cx={0} cy={0} r={30} className="fill-none stroke-seat-selected/30 stroke-[3]" style={{ filter: 'blur(4px)' }} />
      )}

      {/* Reserved amber glow ring */}
      {isReserved && !isSelected && (
        <circle cx={0} cy={0} r={28} className="fill-none stroke-seat-reserved-border/25 stroke-[2]" style={{ filter: 'blur(3px)' }} />
      )}

      {/* Surrounding Chairs */}
      {renderChairs()}

      {/* Table Main Surface */}
      {renderTableShape()}

      {/* Table Label Text */}
      <text
        x={0}
        y={shape === 'rect_vertical' ? -6 : 1}
        textAnchor="middle"
        dominantBaseline="middle"
        className={`font-sans font-bold select-none pointer-events-none transition-colors duration-300 text-[10px] ${labelClasses}`}
      >
        {id}
      </text>

      {/* Capacity & Status Detail */}
      <text
        x={0}
        y={shape === 'rect_vertical' ? 12 : 9}
        textAnchor="middle"
        dominantBaseline="middle"
        className={`font-sans select-none pointer-events-none transition-colors duration-300 text-[6px] tracking-wider uppercase font-semibold ${subLabelClasses}`}
      >
        {isReserved ? `${availableSeats ?? capacity - bookedSeats}/${capacity}` : `${capacity}P`}
      </text>
    </g>
  );
});

Table.displayName = 'Table';
export default Table;
