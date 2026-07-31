import { NON_TABLE_IDS } from './seatMapConstants';

/**
 * Parses SVG text and extracts interactive table groups.
 * Filters out non-table elements.
 * @param {string} svgText - The raw SVG string
 * @returns {Array<{ svgElementId: string, tableCode: string, x: number, y: number }>}
 */
export const extractTablesFromSvg = (svgText) => {
  if (!svgText) return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');

  // Error handling if parsing fails
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    console.error('Error parsing SVG:', parseError.textContent);
    return [];
  }

  const tables = [];
  // Find all <g> elements with an id
  const groups = doc.querySelectorAll('g[id]');

  groups.forEach((group) => {
    const id = group.getAttribute('id');
    
    // Skip known non-table elements and structural groups
    if (NON_TABLE_IDS.includes(id) || !id.startsWith('t_')) {
      return;
    }

    // Try to find the text label inside the group to use as default tableCode
    let tableCode = id;
    const textElement = group.querySelector('text');
    if (textElement) {
      tableCode = textElement.textContent.trim();
    }

    // Try to find the first rect or circle to get an approximate x/y position for tooltips
    let x = 0;
    let y = 0;
    const rectElement = group.querySelector('rect');
    const circleElement = group.querySelector('circle');
    
    if (rectElement) {
      x = parseFloat(rectElement.getAttribute('x') || 0) + (parseFloat(rectElement.getAttribute('width') || 0) / 2);
      y = parseFloat(rectElement.getAttribute('y') || 0);
    } else if (circleElement) {
      x = parseFloat(circleElement.getAttribute('cx') || 0);
      y = parseFloat(circleElement.getAttribute('cy') || 0) - parseFloat(circleElement.getAttribute('r') || 0);
    }

    tables.push({
      svgElementId: id,
      tableCode,
      x,
      y,
    });
  });

  return tables;
};
