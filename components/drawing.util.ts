import { Point, DrawingStroke, CanvasDimensions } from '@/types';

/**
 * Calculate distance between two points
 */
export const calculateDistance = (p1: Point, p2: Point): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

/**
 * Generate SVG path string from points array
 */
export const generateSVGPath = (points: Point[]): string => {
  if (points.length === 0) return '';

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`;
  }
  return path;
};

/**
 * Simplify stroke points using Douglas-Peucker algorithm
 */
export const simplifyStroke = (
  points: Point[],
  tolerance: number = 2
): Point[] => {
  if (points.length <= 2) return points;

  // Find the point with the maximum distance from the line segment
  let maxDistance = 0;
  let maxIndex = 0;
  const end = points.length - 1;

  for (let i = 1; i < end; i++) {
    const distance = perpendicularDistance(points[i], points[0], points[end]);
    if (distance > maxDistance) {
      maxIndex = i;
      maxDistance = distance;
    }
  }

  // If max distance is greater than tolerance, recursively simplify
  if (maxDistance > tolerance) {
    const left = simplifyStroke(points.slice(0, maxIndex + 1), tolerance);
    const right = simplifyStroke(points.slice(maxIndex), tolerance);

    // Combine results, removing duplicate point at connection
    return [...left.slice(0, -1), ...right];
  }

  // If max distance is within tolerance, return just the endpoints
  return [points[0], points[end]];
};

/**
 * Calculate perpendicular distance from point to line segment
 */
const perpendicularDistance = (
  point: Point,
  lineStart: Point,
  lineEnd: Point
): number => {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;

  if (dx === 0 && dy === 0) {
    return calculateDistance(point, lineStart);
  }

  const t =
    ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) /
    (dx * dx + dy * dy);
  const clampedT = Math.max(0, Math.min(1, t));

  const projection = {
    x: lineStart.x + clampedT * dx,
    y: lineStart.y + clampedT * dy,
  };

  return calculateDistance(point, projection);
};

/**
 * Calculate bounds of multiple strokes
 */
export const calculateStrokeBounds = (
  strokes: DrawingStroke[]
): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} => {
  if (strokes.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }

  let minX = Infinity,
    minY = Infinity;
  let maxX = -Infinity,
    maxY = -Infinity;

  strokes.forEach((stroke) => {
    stroke.points.forEach((point) => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });
  });

  return { minX, minY, maxX, maxY };
};

/**
 * Convert screen coordinates to canvas coordinates
 */
export const screenToCanvas = (
  screenPoint: Point,
  canvasDimensions: CanvasDimensions,
  scale: number = 1,
  translateX: number = 0,
  translateY: number = 0
): Point => {
  return {
    x: (screenPoint.x - translateX) / scale,
    y: (screenPoint.y - translateY) / scale,
  };
};

/**
 * Convert canvas coordinates to screen coordinates
 */
export const canvasToScreen = (
  canvasPoint: Point,
  canvasDimensions: CanvasDimensions,
  scale: number = 1,
  translateX: number = 0,
  translateY: number = 0
): Point => {
  return {
    x: canvasPoint.x * scale + translateX,
    y: canvasPoint.y * scale + translateY,
  };
};

/**
 * Generate unique stroke ID
 */
export const generateStrokeId = (): string => {
  return `stroke-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

/**
 * Validate color format (hex)
 */
export const isValidHexColor = (color: string): boolean => {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
};

/**
 * Clamp value within range
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Smooth stroke points using moving average
 */
export const smoothStroke = (
  points: Point[],
  windowSize: number = 3
): Point[] => {
  if (points.length <= windowSize) return points;

  const smoothed: Point[] = [];
  const halfWindow = Math.floor(windowSize / 2);

  for (let i = 0; i < points.length; i++) {
    const start = Math.max(0, i - halfWindow);
    const end = Math.min(points.length - 1, i + halfWindow);

    let sumX = 0;
    let sumY = 0;
    let count = 0;

    for (let j = start; j <= end; j++) {
      sumX += points[j].x;
      sumY += points[j].y;
      count++;
    }

    smoothed.push({
      x: sumX / count,
      y: sumY / count,
    });
  }

  return smoothed;
};

/**
 * Check if point is within canvas bounds
 */
export const isPointInCanvas = (
  point: Point,
  canvasDimensions: CanvasDimensions
): boolean => {
  return (
    point.x >= 0 &&
    point.x <= canvasDimensions.width &&
    point.y >= 0 &&
    point.y <= canvasDimensions.height
  );
};
