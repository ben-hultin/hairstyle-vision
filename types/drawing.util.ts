import { Point, DrawingStroke, CanvasDimensions, TouchPoint } from './index';

// Drawing utility functions as types
export type StrokePathCalculator = (points: Point[]) => string;
export type DistanceCalculator = (p1: Point, p2: Point) => number;
export type StrokeSimplifier = (points: Point[], tolerance: number) => Point[];
export type BoundsCalculator = (strokes: DrawingStroke[]) => {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

// Drawing validation types
export interface DrawingValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export type DrawingValidator = (drawing: {
  strokes: DrawingStroke[];
  canvasDimensions: CanvasDimensions;
}) => DrawingValidationResult;

// Drawing transformation types
export interface DrawingTransformation {
  scale: number;
  translateX: number;
  translateY: number;
  rotation: number;
}

export type DrawingTransformer = (
  strokes: DrawingStroke[],
  transformation: DrawingTransformation
) => DrawingStroke[];

// Canvas coordinate conversion types
export interface CanvasCoordinates {
  canvas: Point;
  screen: Point;
}

export type CoordinateConverter = {
  screenToCanvas: (
    screenPoint: Point,
    canvasDimensions: CanvasDimensions
  ) => Point;
  canvasToScreen: (
    canvasPoint: Point,
    canvasDimensions: CanvasDimensions
  ) => Point;
};

// Stroke optimization types
export interface StrokeOptimizationOptions {
  simplifyTolerance: number;
  minPointDistance: number;
  maxPoints: number;
}

export type StrokeOptimizer = (
  stroke: DrawingStroke,
  options: StrokeOptimizationOptions
) => DrawingStroke;

// Touch event processing types
export interface ProcessedTouchEvent {
  point: TouchPoint;
  isValidForDrawing: boolean;
  pressure: number;
  velocity: number;
}

export type TouchEventProcessor = (
  touchPoint: TouchPoint,
  previousPoint?: TouchPoint
) => ProcessedTouchEvent;

// Drawing export/import types
export interface DrawingExportOptions {
  format: 'json' | 'svg' | 'png';
  includeMetadata: boolean;
  compression: boolean;
}

export interface DrawingExportResult {
  data: string | Uint8Array;
  mimeType: string;
  size: number;
}

export type DrawingExporter = (
  strokes: DrawingStroke[],
  canvasDimensions: CanvasDimensions,
  options: DrawingExportOptions
) => Promise<DrawingExportResult>;

export type DrawingImporter = (
  data: string | Uint8Array,
  format: DrawingExportOptions['format']
) => Promise<{
  strokes: DrawingStroke[];
  canvasDimensions: CanvasDimensions;
}>;

// Performance monitoring types
export interface DrawingPerformanceMetrics {
  strokeCount: number;
  totalPoints: number;
  averageStrokeLength: number;
  renderTime: number;
  memoryUsage: number;
}

export type PerformanceMonitor = (
  strokes: DrawingStroke[]
) => DrawingPerformanceMetrics;
