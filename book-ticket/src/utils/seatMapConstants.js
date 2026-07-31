// seatMapConstants.js

// Table categories with their theme-aware CSS variable colors
export const TABLE_CATEGORIES = {
  vip: { label: 'seatMap.vip', colorVar: '--seat-vip' },
  gold: { label: 'seatMap.gold', colorVar: '--seat-gold' },
  silver: { label: 'seatMap.silver', colorVar: '--seat-silver' },
  standard: { label: 'seatMap.standard', colorVar: '--seat-standard' },
};

export const TABLE_STATUSES = {
  available: { label: 'seatMap.available', colorVar: '--seat-available' },
  held: { label: 'seatMap.held', colorVar: '--seat-held' },
  reserved: { label: 'seatMap.reserved', colorVar: '--seat-reserved' },
  sold: { label: 'seatMap.sold', colorVar: '--seat-sold' },
  disabled: { label: 'seatMap.disabled', colorVar: '--seat-disabled' },
};

// Non-interactive SVG element IDs to skip during parsing
export const NON_TABLE_IDS = [
  'stage',
  'dance_floor',
  'track_frame',
  'host_area',
  'entrance',
  'waiting_area',
  'top_tables',
  'left_tables',
  'right_tables',
  'bottom_tables',
];
