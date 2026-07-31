/**
 * Table Component
 *
 * Purpose: Render a single interactive table SVG group <g> with surrounding chairs,
 *          supporting hover, selection, database states, and keyboard accessibility.
 * Inputs: table object, isSelected, onClick
 * Output: SVG group <g> containing table, chairs, table name, and capacity text
 * Dependencies: react-i18next
 */
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

export const Table = memo(({ table, isSelected, onClick }) => {
  const { t } = useTranslation();
  const { id, x, y, category, capacity, price, status, shape } = table;

  // Handles clicking or pressing space/enter
  const handleAction = (e) => {
    if (status === 'disabled' || status === 'sold') return;
    e.preventDefault();
    onClick(table);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleAction(e);
    }
  };

  // Determine SVG fill/stroke classes based on category and status
  const getTableClasses = () => {
    if (isSelected) return 'fill-seat-selected stroke-primary/70 ring-2 ring-primary';
    switch (status) {
      case 'sold':
        return 'fill-seat-sold stroke-seat-sold/30 opacity-40 cursor-not-allowed';
      case 'held':
        return 'fill-seat-held stroke-seat-held/30';
      case 'reserved':
        return 'fill-seat-reserved stroke-seat-reserved/30 cursor-not-allowed';
      case 'disabled':
        return 'fill-seat-disabled stroke-seat-disabled/30 opacity-30 cursor-not-allowed';
      default:
        // Available — color based on category
        switch (category) {
          case 'vip':
            return 'fill-seat-vip/25 stroke-seat-vip hover:fill-seat-vip/40 hover:scale-105';
          case 'gold':
            return 'fill-seat-gold/25 stroke-seat-gold hover:fill-seat-gold/40 hover:scale-105';
          default:
            return 'fill-seat-standard/25 stroke-seat-standard hover:fill-seat-standard/40 hover:scale-105';
        }
    }
  };

  // Render chairs based on table capacity and shape layout
  const renderChairs = () => {
    const chairList = [];
    const chairWidth = 14;
    const chairHeight = 6;
    const rx = 2;
    const styleClasses = isSelected 
      ? 'fill-seat-selected/80 stroke-primary/50' 
      : status === 'sold'
        ? 'fill-seat-sold/50 stroke-seat-sold/20'
        : status === 'held'
          ? 'fill-seat-held/80 stroke-seat-held/20'
          : status === 'reserved'
            ? 'fill-seat-reserved/80 stroke-seat-reserved/20'
            : status === 'disabled'
              ? 'fill-seat-disabled/40 stroke-seat-disabled/20'
              : category === 'vip'
                ? 'fill-seat-vip/60 stroke-seat-vip/30'
                : category === 'gold'
                  ? 'fill-seat-gold/60 stroke-seat-gold/30'
                  : 'fill-seat-standard/60 stroke-seat-standard/30';

    if (shape === 'square') {
      // 4 chairs (top, bottom, left, right)
      chairList.push(
        // Top
        <rect key="top" x={-chairWidth / 2} y={-26} width={chairWidth} height={chairHeight} rx={rx} className={styleClasses} />,
        // Bottom
        <rect key="bottom" x={-chairWidth / 2} y={20} width={chairWidth} height={chairHeight} rx={rx} className={styleClasses} />,
        // Left
        <rect key="left" x={-26} y={-chairWidth / 2} width={chairHeight} height={chairWidth} rx={rx} className={styleClasses} />,
        // Right
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
      // Bottom
      chairList.push(
        <rect key="bottom" x={-chairWidth / 2} y={44} width={chairWidth} height={chairHeight} rx={rx} className={styleClasses} />
      );
    } else {
      // Standard rect (e.g. 2P or 4P top rows)
      if (capacity === 2) {
        // 2 chairs (top & bottom)
        chairList.push(
          <rect key="top" x={-chairWidth / 2} y={-22} width={chairWidth} height={chairHeight} rx={rx} className={styleClasses} />,
          <rect key="bottom" x={-chairWidth / 2} y={16} width={chairWidth} height={chairHeight} rx={rx} className={styleClasses} />
        );
      } else {
        // 4 chairs (top, bottom, left, right)
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
      // Default: square or 4P rect
      return <rect x={-18} y={-18} width={36} height={36} rx={6} className={commonClasses} />;
    }
  };

  // Translate tooltip status labels
  const getStatusLabel = () => {
    switch (status) {
      case 'sold': return t('seatMap.sold', 'Sold');
      case 'held': return t('seatMap.held', 'Held');
      case 'reserved': return t('seatMap.reserved', 'Reserved');
      case 'disabled': return t('seatMap.disabled', 'Disabled');
      default: return t('seatMap.available', 'Available');
    }
  };

  const isClickable = status === 'available' || status === 'held';

  return (
    <g
      id={`table-${id}`}
      data-table-id={id}
      transform={`translate(${x}, ${y})`}
      className={`group select-none outline-none ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
      onClick={handleAction}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={isClickable ? 0 : -1}
      aria-label={`${t('seatMap.tableInfo', 'Table')} ${id}, ${t(`seatMap.${category}`, category)}, ${capacity} ${t('checkout.seats', 'seats')}, $${price}, ${getStatusLabel()}`}
    >
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
        className={`font-sans font-bold select-none pointer-events-none transition-colors duration-300 text-[10px] ${
          isSelected 
            ? 'fill-primary-foreground' 
            : status === 'sold'
              ? 'fill-[#F7F1E8]/30'
              : 'fill-[#F7F1E8]'
        }`}
      >
        {id}
      </text>

      {/* Capacity & Price Details */}
      <text
        x={0}
        y={shape === 'rect_vertical' ? 12 : 9}
        textAnchor="middle"
        dominantBaseline="middle"
        className={`font-sans select-none pointer-events-none transition-colors duration-300 text-[6px] tracking-wider uppercase font-semibold ${
          isSelected 
            ? 'fill-primary-foreground/80' 
            : status === 'sold'
              ? 'fill-[#BDAF9D]/20'
              : 'fill-[#BDAF9D]'
        }`}
      >
        {capacity}P
      </text>
    </g>
  );
});

Table.displayName = 'Table';
export default Table;
