import { Point, DrawingStroke, CanvasDimensions, TouchPoint } from './index';

import {
  StrokePathCalculator,
  DistanceCalculator,
  StrokeSimplifier,
  BoundsCalculator,
  DrawingValidator,
  CoordinateConverter,
  TouchEventProcessor,
  PerformanceMonitor,
} from './drawing.util';

// Mock data for testing
const mockPoint: Point = { x: 100, y: 200 };
const mockPoint2: Point = { x: 150, y: 250 };
const mockPoints: Point[] = [
  { x: 0, y: 0 },
  { x: 50, y: 50 },
  { x: 100, y: 100 },
  { x: 150, y: 150 },
];

const mockStroke: DrawingStroke = {
  id: 'test-stroke-1',
  points: mockPoints,
  color: '#FF0000',
  width: 5,
  opacity: 1.0,
  timestamp: Date.now(),
};

const mockCanvasDimensions: CanvasDimensions = {
  width: 400,
  height: 600,
};

const mockTouchPoint: TouchPoint = {
  x: 100,
  y: 200,
  pressure: 0.8,
  timestamp: Date.now(),
};

describe('Drawing Utility Types', () => {
  describe('DistanceCalculator', () => {
    test('should calculate distance between two points', () => {
      const calculateDistance: DistanceCalculator = (p1, p2) => {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
      };

      const distance = calculateDistance(mockPoint, mockPoint2);
      expect(distance).toBeCloseTo(70.71, 2);
    });
  });

  describe('StrokePathCalculator', () => {
    test('should generate SVG path from points', () => {
      const calculatePath: StrokePathCalculator = (points) => {
        if (points.length === 0) return '';

        let path = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
          path += ` L ${points[i].x} ${points[i].y}`;
        }
        return path;
      };

      const path = calculatePath(mockPoints);
      expect(path).toBe('M 0 0 L 50 50 L 100 100 L 150 150');
    });
  });

  describe('StrokeSimplifier', () => {
    test('should simplify stroke with given tolerance', () => {
      const simplifyStroke: StrokeSimplifier = (points, tolerance) => {
        if (points.length <= 2) return points;

        // Simple implementation for testing
        const simplified = [points[0]];
        let lastPoint = points[0];

        for (let i = 1; i < points.length - 1; i++) {
          const distance = Math.sqrt(
            Math.pow(points[i].x - lastPoint.x, 2) +
              Math.pow(points[i].y - lastPoint.y, 2)
          );

          if (distance > tolerance) {
            simplified.push(points[i]);
            lastPoint = points[i];
          }
        }

        simplified.push(points[points.length - 1]);
        return simplified;
      };

      const simplified = simplifyStroke(mockPoints, 25);
      expect(simplified.length).toBeLessThan(mockPoints.length);
      expect(simplified[0]).toEqual(mockPoints[0]);
      expect(simplified[simplified.length - 1]).toEqual(
        mockPoints[mockPoints.length - 1]
      );
    });
  });

  describe('BoundsCalculator', () => {
    test('should calculate bounds of multiple strokes', () => {
      const calculateBounds: BoundsCalculator = (strokes) => {
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

      const bounds = calculateBounds([mockStroke]);
      expect(bounds).toEqual({
        minX: 0,
        minY: 0,
        maxX: 150,
        maxY: 150,
      });
    });
  });

  describe('DrawingValidator', () => {
    test('should validate drawing data', () => {
      const validateDrawing: DrawingValidator = (drawing) => {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (drawing.strokes.length === 0) {
          warnings.push('Drawing has no strokes');
        }

        if (
          drawing.canvasDimensions.width <= 0 ||
          drawing.canvasDimensions.height <= 0
        ) {
          errors.push('Invalid canvas dimensions');
        }

        drawing.strokes.forEach((stroke, index) => {
          if (stroke.points.length < 2) {
            warnings.push(`Stroke ${index} has insufficient points`);
          }

          if (stroke.width <= 0) {
            errors.push(`Stroke ${index} has invalid width`);
          }

          if (stroke.opacity < 0 || stroke.opacity > 1) {
            errors.push(`Stroke ${index} has invalid opacity`);
          }
        });

        return {
          isValid: errors.length === 0,
          errors,
          warnings,
        };
      };

      const result = validateDrawing({
        strokes: [mockStroke],
        canvasDimensions: mockCanvasDimensions,
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('CoordinateConverter', () => {
    test('should convert between screen and canvas coordinates', () => {
      const converter: CoordinateConverter = {
        screenToCanvas: (screenPoint, canvasDimensions) => {
          // Simple 1:1 conversion for testing
          return {
            x: screenPoint.x,
            y: screenPoint.y,
          };
        },
        canvasToScreen: (canvasPoint, canvasDimensions) => {
          // Simple 1:1 conversion for testing
          return {
            x: canvasPoint.x,
            y: canvasPoint.y,
          };
        },
      };

      const canvasPoint = converter.screenToCanvas(
        mockPoint,
        mockCanvasDimensions
      );
      expect(canvasPoint).toEqual(mockPoint);

      const screenPoint = converter.canvasToScreen(
        mockPoint,
        mockCanvasDimensions
      );
      expect(screenPoint).toEqual(mockPoint);
    });
  });

  describe('TouchEventProcessor', () => {
    test('should process touch events correctly', () => {
      const processTouch: TouchEventProcessor = (touchPoint, previousPoint) => {
        const velocity = previousPoint
          ? Math.sqrt(
              Math.pow(touchPoint.x - previousPoint.x, 2) +
                Math.pow(touchPoint.y - previousPoint.y, 2)
            ) / Math.max(touchPoint.timestamp - previousPoint.timestamp, 1)
          : 0;

        return {
          point: touchPoint,
          isValidForDrawing:
            touchPoint.pressure !== undefined && touchPoint.pressure > 0.1,
          pressure: touchPoint.pressure || 1.0,
          velocity,
        };
      };

      const processed = processTouch(mockTouchPoint);
      expect(processed.point).toEqual(mockTouchPoint);
      expect(processed.isValidForDrawing).toBe(true);
      expect(processed.pressure).toBe(0.8);
      expect(processed.velocity).toBe(0);
    });
  });

  describe('PerformanceMonitor', () => {
    test('should calculate performance metrics', () => {
      const monitor: PerformanceMonitor = (strokes) => {
        const strokeCount = strokes.length;
        const totalPoints = strokes.reduce(
          (sum, stroke) => sum + stroke.points.length,
          0
        );
        const averageStrokeLength =
          strokeCount > 0 ? totalPoints / strokeCount : 0;

        return {
          strokeCount,
          totalPoints,
          averageStrokeLength,
          renderTime: 16.67, // Mock 60fps
          memoryUsage: totalPoints * 32, // Mock memory calculation
        };
      };

      const metrics = monitor([mockStroke]);
      expect(metrics.strokeCount).toBe(1);
      expect(metrics.totalPoints).toBe(4);
      expect(metrics.averageStrokeLength).toBe(4);
      expect(metrics.renderTime).toBe(16.67);
    });
  });
});

// Helper function tests
describe('Drawing Helper Functions', () => {
  test('should create unique stroke ID', () => {
    const createStrokeId = (): string => {
      return `stroke-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 11)}`;
    };

    const id1 = createStrokeId();
    const id2 = createStrokeId();

    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^stroke-\d+-[a-z0-9]+$/);
  });

  test('should validate color format', () => {
    const isValidColor = (color: string): boolean => {
      return /^#[0-9A-Fa-f]{6}$/.test(color);
    };

    expect(isValidColor('#FF0000')).toBe(true);
    expect(isValidColor('#ff0000')).toBe(true);
    expect(isValidColor('FF0000')).toBe(false);
    expect(isValidColor('#FFF')).toBe(false);
  });

  test('should clamp values within range', () => {
    const clamp = (value: number, min: number, max: number): number => {
      return Math.min(Math.max(value, min), max);
    };

    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });
});
