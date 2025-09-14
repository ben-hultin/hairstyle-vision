import { BrushSettings } from '@/types';

/**
 * Default brush configurations for different use cases
 */
export const DEFAULT_BRUSH_SETTINGS: Record<string, BrushSettings> = {
  fine: {
    color: '#000000',
    width: 2,
    opacity: 1.0,
  },
  medium: {
    color: '#000000',
    width: 8,
    opacity: 1.0,
  },
  thick: {
    color: '#000000',
    width: 16,
    opacity: 1.0,
  },
  highlighter: {
    color: '#FFFF00',
    width: 12,
    opacity: 0.6,
  },
  soft: {
    color: '#000000',
    width: 10,
    opacity: 0.4,
  },
};

/**
 * Common hair color presets for highlighting
 */
export const HAIR_COLOR_PRESETS: Array<{
  name: string;
  hex: string;
  category: 'blonde' | 'brown' | 'red' | 'fantasy';
}> = [
  // Blonde tones
  { name: 'Platinum Blonde', hex: '#F5DEB3', category: 'blonde' },
  { name: 'Ash Blonde', hex: '#E6D690', category: 'blonde' },
  { name: 'Golden Blonde', hex: '#D4C47A', category: 'blonde' },
  { name: 'Honey Blonde', hex: '#C4B454', category: 'blonde' },

  // Brown tones
  { name: 'Light Brown', hex: '#8B4513', category: 'brown' },
  { name: 'Medium Brown', hex: '#654321', category: 'brown' },
  { name: 'Dark Brown', hex: '#4A2C2A', category: 'brown' },
  { name: 'Espresso', hex: '#3D1A00', category: 'brown' },

  // Red tones
  { name: 'Auburn', hex: '#A0522D', category: 'red' },
  { name: 'Copper', hex: '#D2691E', category: 'red' },
  { name: 'Cherry Red', hex: '#B22222', category: 'red' },
  { name: 'Burgundy', hex: '#8B0000', category: 'red' },

  // Fantasy colors
  { name: 'Rose Gold', hex: '#E8B4B8', category: 'fantasy' },
  { name: 'Lavender', hex: '#C8A8E8', category: 'fantasy' },
  { name: 'Mint', hex: '#98E4D6', category: 'fantasy' },
  { name: 'Peach', hex: '#FFCBA4', category: 'fantasy' },
];

/**
 * Calculate optimal brush size based on canvas dimensions
 */
export const calculateOptimalBrushSize = (
  canvasWidth: number,
  canvasHeight: number,
  detail: 'fine' | 'medium' | 'coarse' = 'medium'
): number => {
  const canvasArea = canvasWidth * canvasHeight;
  const baseSize = Math.sqrt(canvasArea) * 0.01; // 1% of canvas diagonal

  const multipliers = {
    fine: 0.5,
    medium: 1.0,
    coarse: 2.0,
  };

  return Math.round(baseSize * multipliers[detail]);
};

/**
 * Get brush size recommendations based on hair style technique
 */
export const getBrushSizeForHairStyle = (
  hairStyleId: string
): { min: number; recommended: number; max: number } => {
  const sizeMap: Record<
    string,
    { min: number; recommended: number; max: number }
  > = {
    balayage: { min: 8, recommended: 16, max: 24 },
    foiled: { min: 4, recommended: 8, max: 16 },
    ombre: { min: 12, recommended: 20, max: 32 },
    alternating: { min: 6, recommended: 12, max: 20 },
    solid: { min: 16, recommended: 24, max: 40 },
    peekaboo: { min: 8, recommended: 14, max: 20 },
  };

  return sizeMap[hairStyleId] || { min: 4, recommended: 12, max: 24 };
};

/**
 * Convert RGB to HSL for better color manipulation
 */
export const rgbToHsl = (
  r: number,
  g: number,
  b: number
): [number, number, number] => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h: number, s: number, l: number;

  l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        h = 0;
    }
    h /= 6;
  }

  return [h, s, l];
};

/**
 * Convert HSL to RGB
 */
export const hslToRgb = (
  h: number,
  s: number,
  l: number
): [number, number, number] => {
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

/**
 * Convert hex color to RGB
 */
export const hexToRgb = (hex: string): [number, number, number] | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null;
};

/**
 * Convert RGB to hex
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
};

/**
 * Generate color variations for a base color
 */
export const generateColorVariations = (
  baseColor: string,
  count: number = 5
): string[] => {
  const rgb = hexToRgb(baseColor);
  if (!rgb) return [baseColor];

  const [r, g, b] = rgb;
  const [h, s, l] = rgbToHsl(r, g, b);

  const variations: string[] = [];

  for (let i = 0; i < count; i++) {
    const lightnessFactor = 0.7 + (i / (count - 1)) * 0.6; // 0.7 to 1.3
    const newL = Math.min(1, l * lightnessFactor);
    const newRgb = hslToRgb(h, s, newL);
    variations.push(rgbToHex(newRgb[0], newRgb[1], newRgb[2]));
  }

  return variations;
};

/**
 * Get complementary colors for a given color
 */
export const getComplementaryColors = (baseColor: string): string[] => {
  const rgb = hexToRgb(baseColor);
  if (!rgb) return [baseColor];

  const [r, g, b] = rgb;
  const [h, s, l] = rgbToHsl(r, g, b);

  // Complementary color (opposite on color wheel)
  const complementaryH = (h + 0.5) % 1;
  const complementary = hslToRgb(complementaryH, s, l);

  // Analogous colors (adjacent on color wheel)
  const analogous1H = (h + 0.083) % 1; // +30 degrees
  const analogous2H = (h - 0.083 + 1) % 1; // -30 degrees

  const analogous1 = hslToRgb(analogous1H, s, l);
  const analogous2 = hslToRgb(analogous2H, s, l);

  return [
    baseColor,
    rgbToHex(complementary[0], complementary[1], complementary[2]),
    rgbToHex(analogous1[0], analogous1[1], analogous1[2]),
    rgbToHex(analogous2[0], analogous2[1], analogous2[2]),
  ];
};

/**
 * Calculate color contrast ratio for accessibility
 */
export const calculateContrastRatio = (
  color1: string,
  color2: string
): number => {
  const getLuminance = (color: string): number => {
    const rgb = hexToRgb(color);
    if (!rgb) return 0;

    const [r, g, b] = rgb.map((c) => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
};

/**
 * Suggest optimal brush settings for a given hair style
 */
export const suggestBrushSettings = (
  hairStyleId: string,
  selectedColors: string[],
  canvasWidth: number,
  canvasHeight: number
): BrushSettings => {
  const sizeRecommendation = getBrushSizeForHairStyle(hairStyleId);
  const optimalSize = calculateOptimalBrushSize(canvasWidth, canvasHeight);

  // Adjust optimal size based on hair style
  const adjustedSize = Math.max(
    sizeRecommendation.min,
    Math.min(sizeRecommendation.max, optimalSize)
  );

  // Default to first selected color or black
  const defaultColor =
    selectedColors.length > 0 ? selectedColors[0] : '#000000';

  // Adjust opacity based on hair style
  const opacityMap: Record<string, number> = {
    balayage: 0.8,
    foiled: 1.0,
    ombre: 0.9,
    alternating: 1.0,
    solid: 1.0,
    peekaboo: 0.7,
  };

  return {
    color: defaultColor,
    width: Math.round(adjustedSize),
    opacity: opacityMap[hairStyleId] || 1.0,
  };
};
