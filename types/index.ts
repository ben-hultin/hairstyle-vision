export interface TransformationResult {
  id: string;
  originalImage: string;
  generatedImage: string;
  prompt: string;
  colors: string[];
  hairStyle?: string;
  timestamp: string;
  isFavorite?: boolean;
  analysis?: string;
  highlightDrawing?: HighlightDrawing;
}

export interface ColorOption {
  name: string;
  hex: string;
  category: string;
}

// Drawing and Canvas Types
export interface Point {
  x: number;
  y: number;
}

export interface DrawingStroke {
  id: string;
  points: Point[];
  color: string;
  width: number;
  opacity: number;
  timestamp: number;
}

export interface CanvasDimensions {
  width: number;
  height: number;
}

export interface HighlightDrawing {
  id: string;
  strokes: DrawingStroke[];
  imageUri: string;
  canvasDimensions: CanvasDimensions;
  timestamp: string;
  version: number;
}

// Brush and Drawing Tool Types
export interface BrushSettings {
  color: string;
  width: number;
  opacity: number;
}

export interface DrawingTool {
  id: string;
  name: string;
  icon: string;
  type: 'brush' | 'eraser' | 'undo' | 'redo' | 'clear' | 'zoom';
}

// Drawing History Types
export interface DrawingHistoryState {
  strokes: DrawingStroke[];
  timestamp: number;
}

export interface DrawingHistory {
  states: DrawingHistoryState[];
  currentIndex: number;
  maxStates: number;
}

// Touch and Gesture Types
export interface TouchPoint extends Point {
  pressure?: number;
  timestamp: number;
}

export interface GestureState {
  isDrawing: boolean;
  currentStroke?: DrawingStroke;
  scale: number;
  translateX: number;
  translateY: number;
}

export interface GenerationRequest {
  imageUri: string;
  prompt: string;
  colors: string[];
  hairStyle?: string;
  highlightDrawing?: HighlightDrawing;
}

export interface GenerationResponse {
  imageUrl: string;
  success: boolean;
  error?: string;
  metadata?: {
    prompt: string;
    colors: string[];
    analysis: string;
    highlightDrawing?: HighlightDrawing;
  };
}
