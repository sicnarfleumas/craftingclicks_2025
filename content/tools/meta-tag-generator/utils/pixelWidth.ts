// Import for client-side only canvas usage
import { isBrowser } from './browserDetection';

// Create canvas element for text measurements only on the client
let canvas: HTMLCanvasElement | null = null;
let context: CanvasRenderingContext2D | null = null;

// Initialize canvas when in browser environment
if (isBrowser()) {
  canvas = document.createElement('canvas');
  context = canvas.getContext('2d');
}

// Default font settings matching Google SERP
const GOOGLE_TITLE_FONT = '20px arial,sans-serif';
const GOOGLE_DESCRIPTION_FONT = '14px arial,sans-serif';

/**
 * Calculate the width of text in pixels
 */
export function calculatePixelWidth(
  text: string,
  font: string = GOOGLE_TITLE_FONT
): number {
  if (!context) {
    // Fallback approximation for server-side rendering
    // Roughly estimate 0.6 * character count for title, 0.5 for description
    return font === GOOGLE_TITLE_FONT ? text.length * 12 : text.length * 8;
  }
  
  context.font = font;
  const metrics = context.measureText(text);
  return Math.ceil(metrics.width);
}

/**
 * Check if text will be truncated in Google SERP
 */
export function willBeTruncated(
  text: string,
  type: 'title' | 'description' = 'title'
): boolean {
  // For server-side rendering, use character count as fallback
  if (!context) {
    return type === 'title' ? text.length > 60 : text.length > 160;
  }
  
  const maxWidth = type === 'title' ? 580 : 980;
  const font = type === 'title' ? GOOGLE_TITLE_FONT : GOOGLE_DESCRIPTION_FONT;
  
  return calculatePixelWidth(text, font) > maxWidth;
}

/**
 * Get the visible character count before truncation
 */
export function getVisibleCharacterCount(
  text: string,
  type: 'title' | 'description' = 'title'
): number {
  const maxWidth = type === 'title' ? 580 : 980;
  const font = type === 'title' ? GOOGLE_TITLE_FONT : GOOGLE_DESCRIPTION_FONT;
  
  if (!context) {
    // Fallback for server-side rendering
    return type === 'title' ? Math.min(text.length, 60) : Math.min(text.length, 160);
  }
  
  let left = 0;
  let right = text.length;
  
  while (left < right) {
    const mid = Math.floor((left + right + 1) / 2);
    const width = calculatePixelWidth(text.substring(0, mid), font);
    
    if (width <= maxWidth) {
      left = mid;
    } else {
      right = mid - 1;
    }
  }
  
  return left;
} 