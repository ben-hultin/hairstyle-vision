import {
  createDrawingHistory,
  addHistoryState,
  undoHistory,
  redoHistory,
  clearHistory,
  canUndo,
  canRedo,
  getCurrentStrokes,
  getDrawingStats,
  optimizeHistory,
  exportHistory,
  importHistory,
  createSnapshot,
  batchOperations,
} from './drawing-history.util';
import { DrawingStroke, DrawingHistory } from '@/types';

describe('Drawing History Utilities', () => {
  const mockStroke1: DrawingStroke = {
    id: 'stroke-1',
    points: [
      { x: 10, y: 10 },
      { x: 20, y: 20 },
    ],
    color: '#FF0000',
    width: 5,
    opacity: 1.0,
    timestamp: Date.now(),
  };

  const mockStroke2: DrawingStroke = {
    id: 'stroke-2',
    points: [
      { x: 30, y: 30 },
      { x: 40, y: 40 },
    ],
    color: '#00FF00',
    width: 8,
    opacity: 0.8,
    timestamp: Date.now(),
  };

  describe('createDrawingHistory', () => {
    it('creates a new history with default settings', () => {
      const history = createDrawingHistory();

      expect(history.states).toHaveLength(1);
      expect(history.currentIndex).toBe(0);
      expect(history.maxStates).toBe(50);
      expect(history.states[0].strokes).toHaveLength(0);
    });

    it('creates a history with custom max states', () => {
      const history = createDrawingHistory(100);

      expect(history.maxStates).toBe(100);
    });
  });

  describe('addHistoryState', () => {
    it('adds a new state to empty history', () => {
      const history = createDrawingHistory();
      const newHistory = addHistoryState(history, [mockStroke1]);

      expect(newHistory.states).toHaveLength(2);
      expect(newHistory.currentIndex).toBe(1);
      expect(newHistory.states[1].strokes).toHaveLength(1);
      expect(newHistory.states[1].strokes[0]).toEqual(mockStroke1);
    });

    it('removes future states when adding after undo', () => {
      let history = createDrawingHistory();
      history = addHistoryState(history, [mockStroke1]);
      history = addHistoryState(history, [mockStroke1, mockStroke2]);

      // Undo once
      const undoResult = undoHistory(history);
      history = undoResult.history;

      // Add new state - should remove the future state
      const newHistory = addHistoryState(history, [mockStroke1]);

      expect(newHistory.states).toHaveLength(3);
      expect(newHistory.currentIndex).toBe(2);
    });

    it('limits history to maxStates', () => {
      let history = createDrawingHistory(3);

      // Add more states than the limit
      for (let i = 0; i < 5; i++) {
        history = addHistoryState(history, [mockStroke1]);
      }

      expect(history.states.length).toBeLessThanOrEqual(3);
    });
  });

  describe('undoHistory', () => {
    it('undoes to previous state', () => {
      let history = createDrawingHistory();
      history = addHistoryState(history, [mockStroke1]);
      history = addHistoryState(history, [mockStroke1, mockStroke2]);

      const undoResult = undoHistory(history);

      expect(undoResult.history.currentIndex).toBe(1);
      expect(undoResult.strokes).toHaveLength(1);
    });

    it('does not undo beyond first state', () => {
      const history = createDrawingHistory();
      const undoResult = undoHistory(history);

      expect(undoResult.history.currentIndex).toBe(0);
      expect(undoResult.strokes).toHaveLength(0);
    });
  });

  describe('redoHistory', () => {
    it('redoes to next state', () => {
      let history = createDrawingHistory();
      history = addHistoryState(history, [mockStroke1]);
      history = addHistoryState(history, [mockStroke1, mockStroke2]);

      // Undo then redo
      const undoResult = undoHistory(history);
      const redoResult = redoHistory(undoResult.history);

      expect(redoResult.history.currentIndex).toBe(2);
      expect(redoResult.strokes).toHaveLength(2);
    });

    it('does not redo beyond last state', () => {
      let history = createDrawingHistory();
      history = addHistoryState(history, [mockStroke1]);

      const redoResult = redoHistory(history);

      expect(redoResult.history.currentIndex).toBe(1);
      expect(redoResult.strokes).toHaveLength(1);
    });
  });

  describe('clearHistory', () => {
    it('resets history to initial state', () => {
      let history = createDrawingHistory();
      history = addHistoryState(history, [mockStroke1]);
      history = addHistoryState(history, [mockStroke1, mockStroke2]);

      const clearedHistory = clearHistory(history);

      expect(clearedHistory.states).toHaveLength(1);
      expect(clearedHistory.currentIndex).toBe(0);
      expect(clearedHistory.states[0].strokes).toHaveLength(0);
    });
  });

  describe('canUndo', () => {
    it('returns true when undo is possible', () => {
      let history = createDrawingHistory();
      history = addHistoryState(history, [mockStroke1]);

      expect(canUndo(history)).toBe(true);
    });

    it('returns false when at first state', () => {
      const history = createDrawingHistory();

      expect(canUndo(history)).toBe(false);
    });
  });

  describe('canRedo', () => {
    it('returns true when redo is possible', () => {
      let history = createDrawingHistory();
      history = addHistoryState(history, [mockStroke1]);

      const undoResult = undoHistory(history);

      expect(canRedo(undoResult.history)).toBe(true);
    });

    it('returns false when at last state', () => {
      let history = createDrawingHistory();
      history = addHistoryState(history, [mockStroke1]);

      expect(canRedo(history)).toBe(false);
    });
  });

  describe('getCurrentStrokes', () => {
    it('returns current strokes', () => {
      let history = createDrawingHistory();
      history = addHistoryState(history, [mockStroke1, mockStroke2]);

      const strokes = getCurrentStrokes(history);

      expect(strokes).toHaveLength(2);
      expect(strokes[0]).toEqual(mockStroke1);
      expect(strokes[1]).toEqual(mockStroke2);
    });

    it('returns empty array for empty history', () => {
      const history = createDrawingHistory();
      const strokes = getCurrentStrokes(history);

      expect(strokes).toHaveLength(0);
    });
  });

  describe('getDrawingStats', () => {
    it('calculates correct statistics', () => {
      let history = createDrawingHistory();
      history = addHistoryState(history, [mockStroke1]);
      history = addHistoryState(history, [mockStroke1, mockStroke2]);

      const stats = getDrawingStats(history);

      expect(stats.totalStates).toBe(3); // Initial + 2 added
      expect(stats.currentState).toBe(3);
      expect(stats.totalStrokes).toBe(2);
      expect(stats.totalPoints).toBe(4); // 2 points per stroke
      expect(stats.memoryUsage).toBeGreaterThan(0);
    });
  });

  describe('optimizeHistory', () => {
    it('reduces history size by keeping every nth state', () => {
      let history = createDrawingHistory();

      // Add many states
      for (let i = 0; i < 20; i++) {
        history = addHistoryState(history, [mockStroke1]);
      }

      const optimized = optimizeHistory(history, 5);

      expect(optimized.states.length).toBeLessThan(history.states.length);
    });

    it('preserves first and last states', () => {
      let history = createDrawingHistory();

      for (let i = 0; i < 10; i++) {
        history = addHistoryState(history, [mockStroke1]);
      }

      const optimized = optimizeHistory(history, 3);

      expect(optimized.states[0]).toEqual(history.states[0]);
      expect(optimized.states[optimized.states.length - 1]).toEqual(
        history.states[history.states.length - 1]
      );
    });
  });

  describe('exportHistory', () => {
    it('exports history to JSON string', () => {
      let history = createDrawingHistory();
      history = addHistoryState(history, [mockStroke1]);

      const exported = exportHistory(history);
      const parsed = JSON.parse(exported);

      expect(parsed.states).toBeDefined();
      expect(parsed.currentIndex).toBe(history.currentIndex);
      expect(parsed.maxStates).toBe(history.maxStates);
      expect(parsed.exportedAt).toBeDefined();
    });
  });

  describe('importHistory', () => {
    it('imports history from valid JSON', () => {
      let history = createDrawingHistory();
      history = addHistoryState(history, [mockStroke1]);

      const exported = exportHistory(history);
      const imported = importHistory(exported);

      expect(imported).not.toBeNull();
      expect(imported?.states).toHaveLength(history.states.length);
      expect(imported?.currentIndex).toBe(history.currentIndex);
    });

    it('returns null for invalid JSON', () => {
      const imported = importHistory('invalid json');

      expect(imported).toBeNull();
    });

    it('handles malformed data gracefully', () => {
      const malformedData = JSON.stringify({ invalid: 'data' });
      const imported = importHistory(malformedData);

      expect(imported).toBeNull();
    });
  });

  describe('createSnapshot', () => {
    it('creates a snapshot with deep copied strokes', () => {
      const snapshot = createSnapshot(
        [mockStroke1, mockStroke2],
        'Test Snapshot'
      );

      expect(snapshot.strokes).toHaveLength(2);
      expect(snapshot.strokes[0]).toEqual(mockStroke1);
      expect(snapshot.strokes[0]).not.toBe(mockStroke1); // Deep copy
      expect(snapshot.timestamp).toBeDefined();
      expect(snapshot.label).toBe('Test Snapshot');
    });
  });

  describe('batchOperations', () => {
    it('executes multiple operations and adds single history state', () => {
      let history = createDrawingHistory();
      const initialLength = history.states.length;

      const operations = [
        () => [mockStroke1],
        () => [mockStroke1, mockStroke2],
      ];

      const result = batchOperations(history, operations);

      expect(result.history.states.length).toBe(initialLength + 1);
      expect(result.strokes).toHaveLength(2);
    });
  });

  describe('edge cases', () => {
    it('handles empty states array', () => {
      const emptyHistory: DrawingHistory = {
        states: [],
        currentIndex: 0,
        maxStates: 50,
      };

      const strokes = getCurrentStrokes(emptyHistory);
      expect(strokes).toHaveLength(0);
    });

    it('handles negative currentIndex', () => {
      const invalidHistory: DrawingHistory = {
        states: [{ strokes: [mockStroke1], timestamp: Date.now() }],
        currentIndex: -1,
        maxStates: 50,
      };

      const strokes = getCurrentStrokes(invalidHistory);
      expect(strokes).toHaveLength(0);
    });

    it('handles currentIndex beyond states length', () => {
      const invalidHistory: DrawingHistory = {
        states: [{ strokes: [mockStroke1], timestamp: Date.now() }],
        currentIndex: 10,
        maxStates: 50,
      };

      const strokes = getCurrentStrokes(invalidHistory);
      expect(strokes).toHaveLength(0);
    });
  });
});
