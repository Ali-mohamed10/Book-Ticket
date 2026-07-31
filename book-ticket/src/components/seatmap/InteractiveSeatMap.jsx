/**
 * InteractiveSeatMap Component
 *
 * Purpose: Render the custom venue seating map (Nai Restaurant) matching the layout
 *          with Stage, Dance Floor, Wait Areas, Entrance, and all 65 tables.
 *          Supports zoom, pan, tooltip, and table selection.
 * Inputs: seatMap object, onTableSelect, selectedTables array
 * Output: Interactive SVG Map with custom rooms and room coordinates
 * Dependencies: react, lucide-react, react-i18next
 */
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Table } from './Table';
import { ZoomControls } from './ZoomControls';
import { SeatMapTooltip } from './SeatMapTooltip';

// Define static layouts of the 65 tables inside the venue
const TABLE_LAYOUTS = [
  // 1. Top Row (Blue, capacity/price from image)
  { id: 'T6', x: 250, y: 140, category: 'standard', capacity: 2, price: 90, shape: 'rect' },
  { id: 'T7', x: 340, y: 140, category: 'standard', capacity: 4, price: 90, shape: 'rect' },
  { id: 'T39', x: 860, y: 140, category: 'standard', capacity: 4, price: 90, shape: 'rect' },
  { id: 'T38', x: 950, y: 140, category: 'standard', capacity: 2, price: 90, shape: 'rect' },

  // 2. Left Row (Gold, 6P, $100)
  { id: 'T5', x: 80, y: 300, category: 'gold', capacity: 6, price: 100, shape: 'rect_long' },
  { id: 'T4', x: 80, y: 400, category: 'gold', capacity: 6, price: 100, shape: 'rect_long' },
  { id: 'T3', x: 80, y: 500, category: 'gold', capacity: 6, price: 100, shape: 'rect_long' },
  { id: 'T2', x: 80, y: 600, category: 'gold', capacity: 6, price: 100, shape: 'rect_long' },
  { id: 'T1', x: 80, y: 700, category: 'gold', capacity: 6, price: 100, shape: 'rect_long' },

  // 3. Top Left Grid (Green, 4P, $110)
  { id: 'T8C', x: 230, y: 240, category: 'vip', capacity: 4, price: 110, shape: 'square' },
  { id: 'T8B', x: 310, y: 240, category: 'vip', capacity: 4, price: 110, shape: 'square' },
  { id: 'T8A', x: 390, y: 240, category: 'vip', capacity: 4, price: 110, shape: 'square' },
  { id: 'T9C', x: 230, y: 320, category: 'vip', capacity: 4, price: 110, shape: 'square' },
  { id: 'T9B', x: 310, y: 320, category: 'vip', capacity: 4, price: 110, shape: 'square' },
  { id: 'T9A', x: 390, y: 320, category: 'vip', capacity: 4, price: 110, shape: 'square' },
  { id: 'T10C', x: 230, y: 400, category: 'vip', capacity: 4, price: 110, shape: 'square' },
  { id: 'T10B', x: 310, y: 400, category: 'vip', capacity: 4, price: 110, shape: 'square' },
  { id: 'T10A', x: 390, y: 400, category: 'vip', capacity: 4, price: 110, shape: 'square' },

  // 4. Top Right Grid (Green, 4P, $110)
  { id: 'T37A', x: 810, y: 240, category: 'vip', capacity: 4, price: 110, shape: 'square' },
  { id: 'T37B', x: 890, y: 240, category: 'vip', capacity: 4, price: 110, shape: 'square' },
  { id: 'T37C', x: 970, y: 240, category: 'vip', capacity: 4, price: 110, shape: 'square' },
  { id: 'T36A', x: 810, y: 320, category: 'vip', capacity: 4, price: 110, shape: 'square' },
  { id: 'T36B', x: 890, y: 320, category: 'vip', capacity: 4, price: 110, shape: 'square' },
  { id: 'T36C', x: 970, y: 320, category: 'vip', capacity: 4, price: 110, shape: 'square' },
  { id: 'T35A', x: 810, y: 400, category: 'vip', capacity: 4, price: 110, shape: 'square' },
  { id: 'T35B', x: 890, y: 400, category: 'vip', capacity: 4, price: 110, shape: 'square' },
  { id: 'T35C', x: 970, y: 400, category: 'vip', capacity: 4, price: 110, shape: 'square' },

  // 5. Center-Left Grid
  // Column 11/12 (Gold, 4P, $100)
  { id: 'T11A', x: 270, y: 500, category: 'gold', capacity: 4, price: 100, shape: 'square' },
  { id: 'T11B', x: 270, y: 580, category: 'gold', capacity: 4, price: 100, shape: 'square' },
  { id: 'T12A', x: 270, y: 660, category: 'gold', capacity: 4, price: 100, shape: 'square' },
  { id: 'T12B', x: 270, y: 740, category: 'gold', capacity: 4, price: 100, shape: 'square' },
  // Column 18/17 (Green, 4P, $110)
  { id: 'T18A', x: 350, y: 500, category: 'vip', capacity: 4, price: 110, shape: 'square' },
  { id: 'T18B', x: 350, y: 580, category: 'vip', capacity: 4, price: 110, shape: 'square' },
  { id: 'T17A', x: 350, y: 660, category: 'vip', capacity: 4, price: 110, shape: 'square' },
  { id: 'T17B', x: 350, y: 740, category: 'vip', capacity: 4, price: 110, shape: 'square' },
  // Column 19/20 (Green, 4P, $110)
  { id: 'T19A', x: 430, y: 500, category: 'vip', capacity: 4, price: 110, shape: 'square' },
  { id: 'T19B', x: 430, y: 580, category: 'vip', capacity: 4, price: 110, shape: 'square' },
  { id: 'T20A', x: 430, y: 660, category: 'vip', capacity: 4, price: 110, shape: 'square' },
  { id: 'T20B', x: 430, y: 740, category: 'vip', capacity: 4, price: 110, shape: 'square' },

  // 6. Center-Right Grid
  // Column 24/23 (Green, 4P, $110)
  { id: 'T24A', x: 770, y: 500, category: 'vip', capacity: 4, price: 110, shape: 'square' },
  { id: 'T24B', x: 770, y: 580, category: 'vip', capacity: 4, price: 110, shape: 'square' },
  { id: 'T23A', x: 770, y: 660, category: 'vip', capacity: 4, price: 110, shape: 'square' },
  { id: 'T23B', x: 770, y: 740, category: 'vip', capacity: 4, price: 110, shape: 'square' },
  // Column 25/26 (Green, 4P, $110)
  { id: 'T25A', x: 850, y: 500, category: 'vip', capacity: 4, price: 110, shape: 'square' },
  { id: 'T25B', x: 850, y: 580, category: 'vip', capacity: 4, price: 110, shape: 'square' },
  { id: 'T26A', x: 850, y: 660, category: 'vip', capacity: 4, price: 110, shape: 'square' },
  { id: 'T26B', x: 850, y: 740, category: 'vip', capacity: 4, price: 110, shape: 'square' },
  // Column 33/32 (Gold, 4P, $100)
  { id: 'T33A', x: 930, y: 500, category: 'gold', capacity: 4, price: 100, shape: 'square' },
  { id: 'T33B', x: 930, y: 580, category: 'gold', capacity: 4, price: 100, shape: 'square' },
  { id: 'T32A', x: 930, y: 660, category: 'gold', capacity: 4, price: 100, shape: 'square' },
  { id: 'T32B', x: 930, y: 740, category: 'gold', capacity: 4, price: 100, shape: 'square' },

  // 7. Bottom Round Tables (Gold, 6P, $100)
  { id: 'T13', x: 370, y: 830, category: 'gold', capacity: 6, price: 100, shape: 'round' },
  { id: 'T14', x: 370, y: 920, category: 'gold', capacity: 6, price: 100, shape: 'round' },
  { id: 'T16', x: 490, y: 830, category: 'gold', capacity: 6, price: 100, shape: 'round' },
  { id: 'T15', x: 490, y: 920, category: 'gold', capacity: 6, price: 100, shape: 'round' },

  // 8. Right Round Tables (Gold, 6P, $100)
  { id: 'T34A', x: 1050, y: 500, category: 'gold', capacity: 6, price: 100, shape: 'round' },
  { id: 'T34B', x: 1050, y: 600, category: 'gold', capacity: 6, price: 100, shape: 'round' },

  // 9. High Chairs Table (Gold, 16P, $100)
  { id: 'High Chairs Table', x: 1080, y: 220, category: 'gold', capacity: 16, price: 100, shape: 'high_chairs' },

  // 10. Bottom Blue Tables (Blue, $90)
  { id: 'T22', x: 610, y: 830, category: 'standard', capacity: 6, price: 90, shape: 'rect_vertical' },
  { id: 'T21', x: 610, y: 920, category: 'standard', capacity: 3, price: 90, shape: 'rect_vertical' },
  { id: 'T27', x: 720, y: 830, category: 'standard', capacity: 2, price: 90, shape: 'rect' },
  { id: 'T28', x: 800, y: 830, category: 'standard', capacity: 2, price: 90, shape: 'rect' },
  { id: 'T29', x: 880, y: 830, category: 'standard', capacity: 4, price: 90, shape: 'rect' },
  { id: 'T30', x: 960, y: 830, category: 'standard', capacity: 4, price: 90, shape: 'rect' },
  { id: 'T31', x: 1055, y: 730, category: 'standard', capacity: 7, price: 90, shape: 'rect_vertical' },
];

export const InteractiveSeatMap = ({ seatMap, onTableSelect, selectedTables = [] }) => {
  const { t } = useTranslation();
  const containerRef = useRef(null);

  // Tooltip state
  const [hoveredTable, setHoveredTable] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Zoom Scroll Overlay prompt state
  const [showScrollOverlay, setShowScrollOverlay] = useState(false);
  const overlayTimeoutRef = useRef(null);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error('Error attempting to enable fullscreen:', err.message);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Pan & Zoom state
  const [transform, setTransform] = useState({ scale: 0.9, x: 50, y: 20 });
  const isDragging = useRef(false);
  const startDragPos = useRef({ x: 0, y: 0 });

  // Merge Supabase table statuses with our layout configuration
  const mergedTables = useMemo(() => {
    const dbTables = seatMap?.tables || [];
    return TABLE_LAYOUTS.map((layout) => {
      // Find matching table in database by table_code
      const dbTable = dbTables.find(
        (t) => t.table_code.toUpperCase() === layout.id.toUpperCase()
      );
      return {
        ...layout,
        // Override status/price/id if database record is found
        db_id: dbTable?.id,
        status: dbTable?.status || 'available',
        // In case capacity or price is configured differently in database
        price: dbTable?.price ? parseFloat(dbTable.price) : layout.price,
        capacity: dbTable?.capacity || layout.capacity,
      };
    });
  }, [seatMap?.tables]);

  // Handlers for zooming
  const handleZoomIn = useCallback(() => {
    setTransform((prev) => ({ ...prev, scale: Math.min(prev.scale + 0.15, 3) }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setTransform((prev) => ({ ...prev, scale: Math.max(prev.scale - 0.15, 0.4) }));
  }, []);

  const handleResetView = useCallback(() => {
    setTransform({ scale: 0.9, x: 50, y: 20 });
  }, []);

  // Handlers for mouse-wheel zoom (passive: false attached manually via useEffect)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      // If we are in fullscreen, we do not require Ctrl/Cmd modifier to zoom
      const isFullscreenActive = !!document.fullscreenElement;
      const isMac = navigator.platform.indexOf('Mac') > -1;
      const modifierPressed = isFullscreenActive || (isMac ? e.metaKey : e.ctrlKey);

      if (modifierPressed) {
        e.preventDefault();
        const scaleAmount = -e.deltaY * 0.001;
        setTransform((prev) => {
          let newScale = prev.scale * (1 + scaleAmount);
          newScale = Math.min(Math.max(0.4, newScale), 3);
          return { ...prev, scale: newScale };
        });
        setShowScrollOverlay(false);
      } else {
        // Show prompt overlay since they scrolled without modifier key (only in non-fullscreen)
        setShowScrollOverlay(true);
        if (overlayTimeoutRef.current) {
          clearTimeout(overlayTimeoutRef.current);
        }
        overlayTimeoutRef.current = setTimeout(() => {
          setShowScrollOverlay(false);
        }, 1500);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
      if (overlayTimeoutRef.current) {
        clearTimeout(overlayTimeoutRef.current);
      }
    };
  }, []);

  // Handlers for panning
  const handleMouseDown = (e) => {
    isDragging.current = true;
    startDragPos.current = {
      x: e.clientX - transform.x,
      y: e.clientY - transform.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    setTransform((prev) => ({
      ...prev,
      x: e.clientX - startDragPos.current.x,
      y: e.clientY - startDragPos.current.y,
    }));
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Hover states for tooltips
  const handleTableMouseEnter = useCallback((table, e) => {
    setHoveredTable(table);
  }, []);

  const handleTableMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const handleTableMouseLeave = useCallback(() => {
    setHoveredTable(null);
  }, []);

  // Selection callback to page
  const handleTableClick = useCallback((table) => {
    // If table doesn't have a database ID, construct a temporary model so page functions don't crash
    const finalTable = {
      id: table.db_id || table.id,
      table_code: table.id,
      capacity: table.capacity,
      price: table.price,
      category: table.category,
      status: table.status,
    };
    onTableSelect(finalTable);
  }, [onTableSelect]);

  return (
    <div
      className={`relative w-full bg-[#12100B] border border-border rounded-lg overflow-hidden select-none transition-all duration-300 ${isFullscreen ? 'h-full border-none rounded-none' : 'h-[600px]'}`}
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Zoom, Reset and Fullscreen Controls */}
      <ZoomControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleResetView}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* SVG Canvas */}
      <div
        className="w-full h-full origin-center cursor-grab active:cursor-grabbing"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transition: isDragging.current ? 'none' : 'transform 0.15s ease-out',
        }}
      >
        <svg
          viewBox="0 0 1200 1020"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full"
        >
          {/* Room Borders / Walls */}
          <rect
            x={10}
            y={10}
            width={1180}
            height={1000}
            rx={12}
            className="fill-transparent stroke-border/30 stroke-2 stroke-dasharray-[10,5]"
          />

          {/* Decorative Room Labels / Rooms */}
          {/* 1. Stage */}
          <g id="stage-bg" transform="translate(600, 70)">
            <rect x={-150} y={-40} width={300} height={70} rx={6} className="fill-[#1A1610] stroke-primary/30 stroke-2" />
            <rect x={-30} y={30} width={60} height={20} className="fill-[#1A1610] stroke-primary/30 stroke-2" />
            <text x={0} y={-5} textAnchor="middle" dominantBaseline="middle" className="font-sans font-bold fill-primary text-xl uppercase tracking-widest">
              {t('seatMap.stage', 'Stage')}
            </text>
          </g>

          {/* 2. Dance Floor */}
          <g id="dance-floor-bg" transform="translate(600, 360)">
            <ellipse cx={0} cy={0} rx={180} ry={80} className="fill-transparent stroke-primary/10 stroke-2 stroke-dasharray-[5,10]" />
            <text x={0} y={0} textAnchor="middle" dominantBaseline="middle" className="font-sans font-bold fill-primary/30 text-2xl uppercase tracking-[0.2em]">
              {t('seatMap.danceFloor', 'Dance Floor')}
            </text>
          </g>

          {/* 3. Entrance */}
          <g id="entrance-bg" transform="translate(100, 940)">
            <path d="M -80,-30 L 80,-30 A 80 80 0 0 1 -80,50 Z" className="fill-[#1A1610]/40 stroke-primary/20 stroke-1.5" />
            <text x={-20} y={10} textAnchor="middle" className="font-sans font-bold fill-primary/40 text-sm uppercase tracking-wider">
              {t('seatMap.entrance', 'Entrance')}
            </text>
          </g>

          {/* 4. Control Room */}
          <g id="control-room" transform="translate(90, 80)">
            <rect x={-70} y={-40} width={140} height={80} rx={4} className="fill-[#1A1610] stroke-border/40 stroke-1.5" />
            <text x={0} y={-10} textAnchor="middle" className="font-sans font-bold fill-[#BDAF9D] text-xs uppercase tracking-wider">
              {t('seatMap.controlRoom', 'Control Room')}
            </text>
            <rect x={-40} y={15} width={80} height={10} rx={2} className="fill-[#12100B] stroke-border/20" />
          </g>

          {/* 5. Wash Room */}
          <g id="wash-room" transform="translate(1110, 380)">
            <rect x={-60} y={-30} width={120} height={60} rx={4} className="fill-[#1A1610] stroke-border/40 stroke-1.5" />
            <text x={0} y={0} textAnchor="middle" dominantBaseline="middle" className="font-sans font-bold fill-[#BDAF9D] text-xs uppercase tracking-wider">
              {t('seatMap.washRoom', 'Wash Room')}
            </text>
          </g>

          {/* 6. Hospitality Corner */}
          <g id="hospitality-corner" transform="translate(1135, 570)">
            <rect x={-40} y={-120} width={80} height={240} rx={40} className="fill-[#1A1610] stroke-primary/15 stroke-1.5" />
            <text x={0} y={0} transform="rotate(-90)" textAnchor="middle" dominantBaseline="middle" className="font-sans font-bold fill-primary/25 text-sm uppercase tracking-[0.15em]">
              {t('seatMap.hospitalityCorner', 'Hospitality Corner')}
            </text>
          </g>

          {/* 7. Reception / Host */}
          <g id="reception" transform="translate(100, 850)">
            <rect x={-80} y={-30} width={160} height={60} rx={2} className="fill-[#1A1610] stroke-border/40 stroke-1.5" />
            <text x={-20} y={5} textAnchor="middle" className="font-sans font-bold fill-[#BDAF9D] text-xs uppercase tracking-wider">
              {t('seatMap.reception', 'Reception')}
            </text>
            {/* Host stool */}
            <circle cx={50} cy={10} r={10} className="fill-[#12100B] stroke-border/20" />
            <text x={50} y={11} textAnchor="middle" className="font-sans font-semibold fill-[#BDAF9D]/60 text-[6px]">HOST</text>
          </g>

          {/* 8. Waiting Area */}
          <g id="waiting-area" transform="translate(370, 965)">
            <rect x={-120} y={-25} width={240} height={50} rx={4} className="fill-[#1A1610] stroke-border/30 stroke-1.5" />
            <text x={0} y={5} textAnchor="middle" className="font-sans font-bold fill-[#BDAF9D]/75 text-xs uppercase tracking-widest">
              {t('seatMap.waitingArea', 'Waiting Area')}
            </text>
          </g>

          {/* 9. L-shaped border */}
          <path d="M 550,800 L 550,960 L 670,960" fill="none" className="stroke-primary/20 stroke-1.5 stroke-dasharray-[4,4]" />

          {/* 10. References Legend Box */}
          <g id="references-box" transform="translate(710, 875)">
            <rect x={0} y={0} width={280} height={90} rx={4} className="fill-[#1A1610] stroke-primary/25 stroke-1.5" />
            <text x={15} y={22} className="font-sans font-bold fill-primary/80 text-[10px] uppercase tracking-wider">
              {t('seatMap.referencesTitle', 'References:')}
            </text>
            
            {/* vip - Green */}
            <rect x={15} y={35} width={12} height={12} rx={2} className="fill-seat-vip/35 stroke-seat-vip" />
            <text x={35} y={44} className="font-sans fill-[#BDAF9D] text-[8px]">
              {t('seatMap.vipLegendText', 'Table for 4 guests - $110')}
            </text>

            {/* gold - Gold */}
            <rect x={15} y={52} width={12} height={12} rx={2} className="fill-seat-gold/35 stroke-seat-gold" />
            <text x={35} y={61} className="font-sans fill-[#BDAF9D] text-[8px]">
              {t('seatMap.goldLegendText', 'Table for 6 guests - $100')}
            </text>

            {/* standard - Blue */}
            <rect x={15} y={69} width={12} height={12} rx={2} className="fill-seat-standard/35 stroke-seat-standard" />
            <text x={35} y={78} className="font-sans fill-[#BDAF9D] text-[8px]">
              {t('seatMap.standardLegendText', 'Table for 2 guests - $90')}
            </text>
          </g>

          {/* Tables Rendering */}
          {mergedTables.map((table) => {
            const isSelected = selectedTables.some(
              (t) => (t.id === table.db_id) || (t.table_code === table.id)
            );
            return (
              <g
                key={table.id}
                onMouseEnter={(e) => handleTableMouseEnter(table, e)}
                onMouseMove={handleTableMouseMove}
                onMouseLeave={handleTableMouseLeave}
              >
                <Table
                  table={table}
                  isSelected={isSelected}
                  onClick={handleTableClick}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Zoom Scroll modifier overlay prompt */}
      {showScrollOverlay && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/65 backdrop-blur-xs transition-opacity duration-300 pointer-events-none">
          <div className="bg-[#1A1610]/95 border border-primary/25 px-5 py-3 rounded-lg text-sm text-[#F7F1E8] font-bold shadow-lg animate-fade-in-up">
            {navigator.platform.indexOf('Mac') > -1 
              ? t('seatMap.zoomMacPrompt', 'Use ⌘ + scroll to zoom')
              : t('seatMap.zoomWinPrompt', 'Use Ctrl + scroll to zoom')}
          </div>
        </div>
      )}

      {/* Hover Tooltip Overlay */}
      <SeatMapTooltip
        table={hoveredTable}
        x={tooltipPos.x}
        y={tooltipPos.y}
        visible={!!hoveredTable}
      />
    </div>
  );
};
