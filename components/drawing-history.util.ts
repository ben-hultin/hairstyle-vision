import { DrawingStroke, DrawingHistory, DrawingHistoryState } from '@/types';

/**
 * Create a new drawing history instance
 */
export const createDrawingHistory = (
  maxStates: number = 50
): DrawingHistory => {
  return {
    states: [{ strokes: [], timestamp: Date.now() }],
    currentIndex: 0,
    maxStates,
  };
};

/**
 * Add a new state to the drawing history
 */
export const addHistoryState = (
  history: DrawingHistory,
  strokes: DrawingStroke[]
): DrawingHistory => {
  // Remove any states after the current index (when undoing then making new changes)
  const newStates = history.states.slice(0, history.currentIndex + 1);

  // Add the new state
  const newState: DrawingHistoryState = {
    strokes: [...strokes],
    timestamp: Date.now(),
  };

  newStates.push(newState);

  // Limit the number of states to prevent memory issues
  while (newStates.length > history.maxStates) {
    newStates.shift();
  }

  return {
    ...history,
    states: newStates,
    currentIndex: newStates.length - 1,
  };
};

/**
 * Undo the last action
 */
export const undoHistory = (
  history: DrawingHistory
): {
  history: DrawingHistory;
  strokes: DrawingStroke[];
} => {
  if (history.currentIndex <= 0) {
    return { history, strokes: history.states[0]?.strokes || [] };
  }

  const newIndex = history.currentIndex - 1;
  const newHistory = {
    ...history,
    currentIndex: newIndex,
  };

  return {
    history: newHistory,
    strokes: history.states[newIndex]?.strokes || [],
  };
};

/**
 * Redo the last undone action
 */
export const redoHistory = (
  history: DrawingHistory
): {
  history: DrawingHistory;
  strokes: DrawingStroke[];
} => {
  if (history.currentIndex >= history.states.length - 1) {
    return {
      history,
      strokes: history.states[history.currentIndex]?.strokes || [],
    };
  }

  const newIndex = history.currentIndex + 1;
  const newHistory = {
    ...history,
    currentIndex: newIndex,
  };

  return {
    history: newHistory,
    strokes: history.states[newIndex]?.strokes || [],
  };
};

/**
 * Clear all drawing history and start fresh
 */
export const clearHistory = (history: DrawingHistory): DrawingHistory => {
  return {
    ...history,
    states: [{ strokes: [], timestamp: Date.now() }],
    currentIndex: 0,
  };
};

/**
 * Check if undo is possible
 */
export const canUndo = (history: DrawingHistory): boolean => {
  return history.currentIndex > 0;
};

/**
 * Check if redo is possible
 */
export const canRedo = (history: DrawingHistory): boolean => {
  return history.currentIndex < history.states.length - 1;
};

/**
 * Get the current strokes from history
 */
export const getCurrentStrokes = (history: DrawingHistory): DrawingStroke[] => {
  return history.states[history.currentIndex]?.strokes || [];
};

/**
 * Get drawing statistics from history
 */
export const getDrawingStats = (
  history: DrawingHistory
): {
  totalStates: number;
  currentState: number;
  totalStrokes: number;
  totalPoints: number;
  memoryUsage: number;
} => {
  const currentStrokes = getCurrentStrokes(history);
  const totalPoints = currentStrokes.reduce(
    (sum, stroke) => sum + stroke.points.length,
    0
  );

  // Rough memory estimation (in bytes)
  const memoryUsage = history.states.reduce((sum, state) => {
    const stateSize = state.strokes.reduce((strokeSum, stroke) => {
      return strokeSum + stroke.points.length * 16 + 100; // 16 bytes per point + overhead
    }, 0);
    return sum + stateSize;
  }, 0);

  return {
    totalStates: history.states.length,
    currentState: history.currentIndex + 1,
    totalStrokes: currentStrokes.length,
    totalPoints,
    memoryUsage,
  };
};

/**
 * Optimize history by removing intermediate states
 */
export const optimizeHistory = (
  history: DrawingHistory,
  keepEveryNth: number = 5
): DrawingHistory => {
  if (history.states.length <= keepEveryNth) {
    return history;
  }

  const optimizedStates: DrawingHistoryState[] = [];

  // Always keep the first state
  optimizedStates.push(history.states[0]);

  // Keep every Nth state
  for (let i = keepEveryNth; i < history.states.length - 1; i += keepEveryNth) {
    optimizedStates.push(history.states[i]);
  }

  // Always keep the last state
  if (history.states.length > 1) {
    optimizedStates.push(history.states[history.states.length - 1]);
  }

  // Adjust current index
  let newCurrentIndex = 0;
  for (let i = 0; i < optimizedStates.length; i++) {
    if (
      optimizedStates[i].timestamp <=
      history.states[history.currentIndex].timestamp
    ) {
      newCurrentIndex = i;
    }
  }

  return {
    ...history,
    states: optimizedStates,
    currentIndex: newCurrentIndex,
  };
};

/**
 * Export history to JSON string
 */
export const exportHistory = (history: DrawingHistory): string => {
  return JSON.stringify({
    states: history.states,
    currentIndex: history.currentIndex,
    maxStates: history.maxStates,
    exportedAt: new Date().toISOString(),
  });
};

/**
 * Import history from JSON string
 */
export const importHistory = (
  jsonString: string,
  maxStates: number = 50
): DrawingHistory | null => {
  try {
    const data = JSON.parse(jsonString);

    if (!data.states || !Array.isArray(data.states)) {
      return null;
    }

    return {
      states: data.states,
      currentIndex: Math.min(data.currentIndex || 0, data.states.length - 1),
      maxStates,
    };
  } catch (error) {
    console.error('Failed to import drawing history:', error);
    return null;
  }
};

/**
 * Create a snapshot of current drawing state
 */
export const createSnapshot = (
  strokes: DrawingStroke[],
  label?: string
): DrawingHistoryState => {
  return {
    strokes: strokes.map((stroke) => ({ ...stroke })), // Deep copy
    timestamp: Date.now(),
    ...(label && { label }),
  };
};

/**
 * Batch multiple stroke operations into a single history state
 */
export const batchOperations = (
  history: DrawingHistory,
  operations: Array<() => DrawingStroke[]>
): {
  history: DrawingHistory;
  strokes: DrawingStroke[];
} => {
  let currentStrokes = getCurrentStrokes(history);

  // Execute all operations
  for (const operation of operations) {
    currentStrokes = operation();
  }

  // Add single history state for all operations
  const newHistory = addHistoryState(history, currentStrokes);

  return {
    history: newHistory,
    strokes: currentStrokes,
  };
};
