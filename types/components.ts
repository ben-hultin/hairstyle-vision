import {
  DrawingStroke,
  BrushSettings,
  DrawingTool,
  HighlightDrawing,
  CanvasDimensions,
  Point,
  GestureState,
} from './index';

// Drawing Canvas Component Props
export interface DrawingCanvasProps {
  imageUri: string;
  canvasDimensions: CanvasDimensions;
  brushSettings: BrushSettings;
  strokes: DrawingStroke[];
  isDrawingEnabled: boolean;
  onStrokeStart: (stroke: DrawingStroke) => void;
  onStrokeUpdate: (stroke: DrawingStroke) => void;
  onStrokeEnd: (stroke: DrawingStroke) => void;
  onCanvasReady: (dimensions: CanvasDimensions) => void;
  gestureState?: GestureState;
  onGestureStateChange?: (gestureState: GestureState) => void;
}

// Color Brush Component Props
export interface ColorBrushProps {
  selectedColors: string[];
  currentBrushSettings: BrushSettings;
  onBrushSettingsChange: (settings: BrushSettings) => void;
  onColorSelect: (color: string) => void;
  availableColors?: string[];
  showOpacityControl?: boolean;
  showSizePreview?: boolean;
}

// Drawing Tools Component Props
export interface DrawingToolsProps {
  tools: DrawingTool[];
  selectedTool: DrawingTool;
  onToolSelect: (tool: DrawingTool) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  strokeCount: number;
  isDrawingEnabled: boolean;
}

// Highlight Studio Screen Props
export interface HighlightStudioProps {
  imageUri: string;
  selectedColors: string[];
  onSave: (drawing: HighlightDrawing) => void;
  onCancel: () => void;
  existingDrawing?: HighlightDrawing;
  autoSave?: boolean;
  maxUndoStates?: number;
}

// Drawing Layer Component Props
export interface DrawingLayerProps {
  strokes: DrawingStroke[];
  canvasDimensions: CanvasDimensions;
  opacity?: number;
  isVisible: boolean;
  blendMode?: 'normal' | 'multiply' | 'overlay' | 'screen';
}

// Image Background Component Props
export interface ImageBackgroundProps {
  imageUri: string;
  canvasDimensions: CanvasDimensions;
  onImageLoad: (dimensions: CanvasDimensions) => void;
  onImageError: (error: string) => void;
  fit: 'contain' | 'cover' | 'fill';
  opacity?: number;
}

// Brush Size Selector Props
export interface BrushSizeSelectorProps {
  currentSize: number;
  onSizeChange: (size: number) => void;
  minSize?: number;
  maxSize?: number;
  presetSizes?: number[];
  showPreview?: boolean;
  color?: string;
}

// Color Palette Extended Props (for drawing)
export interface DrawingColorPaletteProps {
  selectedColors: string[];
  onColorSelect: (colors: string[]) => void;
  currentBrushColor: string;
  onBrushColorChange: (color: string) => void;
  maxColors?: number;
  showCustomColorPicker?: boolean;
  allowMultipleSelection?: boolean;
}

// Drawing Progress Props
export interface DrawingProgressProps {
  strokeCount: number;
  totalPoints: number;
  canvasUtilization: number;
  renderPerformance: {
    fps: number;
    renderTime: number;
  };
  isVisible: boolean;
}

// Drawing Export Modal Props
export interface DrawingExportModalProps {
  isVisible: boolean;
  drawing: HighlightDrawing;
  onClose: () => void;
  onExport: (format: 'json' | 'png' | 'svg') => Promise<void>;
  exportFormats: Array<{
    id: string;
    name: string;
    description: string;
    extension: string;
  }>;
}

// Drawing Import Modal Props
export interface DrawingImportModalProps {
  isVisible: boolean;
  onClose: () => void;
  onImport: (drawing: HighlightDrawing) => void;
  supportedFormats: string[];
  maxFileSize: number;
}

// Zoom Controls Props
export interface ZoomControlsProps {
  currentZoom: number;
  minZoom: number;
  maxZoom: number;
  onZoomChange: (zoom: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  showZoomIndicator?: boolean;
}

// Touch Feedback Props
export interface TouchFeedbackProps {
  isVisible: boolean;
  position: Point;
  brushSettings: BrushSettings;
  opacity?: number;
  showPressure?: boolean;
}

// Drawing Statistics Props
export interface DrawingStatisticsProps {
  strokes: DrawingStroke[];
  timeSpent: number;
  isVisible: boolean;
  showDetailed?: boolean;
}
