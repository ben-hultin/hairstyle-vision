import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Dimensions,
  Modal,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Save, Share, Eye, EyeOff } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { DrawingCanvas } from '@/components/DrawingCanvas';
import { ColorBrush } from '@/components/ColorBrush';
import { DrawingTools } from '@/components/DrawingTools';
import {
  DrawingStroke,
  BrushSettings,
  HighlightDrawing,
  CanvasDimensions,
  GestureState,
  DrawingTool,
} from '@/types';
import {
  createDrawingHistory,
  addHistoryState,
  undoHistory,
  redoHistory,
  clearHistory,
  canUndo,
  canRedo,
  getDrawingStats,
} from '@/components/drawing-history.util';
import { suggestBrushSettings } from '@/components/brush.util';
import { generateStrokeId } from '@/components/drawing.util';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface HighlightStudioState {
  strokes: DrawingStroke[];
  history: any;
  brushSettings: BrushSettings;
  canvasDimensions: CanvasDimensions;
  gestureState: GestureState;
  isDrawingEnabled: boolean;
  selectedTool: DrawingTool;
  showColorPicker: boolean;
  showSettings: boolean;
  showPreview: boolean;
}

export default function HighlightStudio() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Extract parameters from navigation
  const imageUri = params.imageUri as string;
  const selectedColors = JSON.parse((params.selectedColors as string) || '[]');
  const hairStyleId = params.hairStyle as string;

  // Main component state
  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
  const [history, setHistory] = useState(() => createDrawingHistory(100));
  const [brushSettings, setBrushSettings] = useState<BrushSettings>(() =>
    suggestBrushSettings(
      hairStyleId,
      selectedColors,
      screenWidth,
      screenHeight * 0.6
    )
  );
  const [canvasDimensions, setCanvasDimensions] = useState<CanvasDimensions>({
    width: screenWidth - 40,
    height: screenHeight * 0.6,
  });
  const [gestureState, setGestureState] = useState<GestureState>({
    isDrawing: false,
    scale: 1,
    translateX: 0,
    translateY: 0,
  });
  const [isDrawingEnabled, setIsDrawingEnabled] = useState(true);
  const [selectedTool, setSelectedTool] = useState<DrawingTool>({
    id: 'brush',
    name: 'Brush',
    icon: 'brush',
    type: 'brush',
  });

  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Refs for performance
  const lastStrokeId = useRef<string | null>(null);

  // Initialize brush settings when hair style or colors change
  useEffect(() => {
    if (hairStyleId && selectedColors.length > 0) {
      const suggestedSettings = suggestBrushSettings(
        hairStyleId,
        selectedColors,
        canvasDimensions.width,
        canvasDimensions.height
      );
      setBrushSettings(suggestedSettings);
    }
  }, [hairStyleId, selectedColors, canvasDimensions]);

  // Handle canvas ready
  const handleCanvasReady = useCallback((dimensions: CanvasDimensions) => {
    setCanvasDimensions(dimensions);
  }, []);

  // Handle stroke start
  const handleStrokeStart = useCallback((stroke: DrawingStroke) => {
    lastStrokeId.current = stroke.id;
    setStrokes((prev) => [...prev, stroke]);
  }, []);

  // Handle stroke update
  const handleStrokeUpdate = useCallback((stroke: DrawingStroke) => {
    if (lastStrokeId.current === stroke.id) {
      setStrokes((prev) => prev.map((s) => (s.id === stroke.id ? stroke : s)));
    }
  }, []);

  // Handle stroke end
  const handleStrokeEnd = useCallback(
    (stroke: DrawingStroke) => {
      setStrokes((prev) => {
        const updatedStrokes = prev.map((s) =>
          s.id === stroke.id ? stroke : s
        );
        // Add to history
        const newHistory = addHistoryState(history, updatedStrokes);
        setHistory(newHistory);
        return updatedStrokes;
      });
      lastStrokeId.current = null;
    },
    [history]
  );

  // Handle undo
  const handleUndo = useCallback(() => {
    const result = undoHistory(history);
    setHistory(result.history);
    setStrokes(result.strokes);
  }, [history]);

  // Handle redo
  const handleRedo = useCallback(() => {
    const result = redoHistory(history);
    setHistory(result.history);
    setStrokes(result.strokes);
  }, [history]);

  // Handle clear all
  const handleClear = useCallback(() => {
    const clearedHistory = clearHistory(history);
    setHistory(clearedHistory);
    setStrokes([]);
  }, [history]);

  // Handle brush settings change
  const handleBrushSettingsChange = useCallback(
    (newSettings: BrushSettings) => {
      setBrushSettings(newSettings);
    },
    []
  );

  // Handle color selection
  const handleColorSelect = useCallback((color: string) => {
    setBrushSettings((prev) => ({ ...prev, color }));
  }, []);

  // Handle tool selection
  const handleToolSelect = useCallback((tool: DrawingTool) => {
    setSelectedTool(tool);

    // Handle special tools
    switch (tool.type) {
      case 'brush':
        setIsDrawingEnabled(true);
        break;
      case 'zoom':
        setIsDrawingEnabled(false);
        break;
    }
  }, []);

  // Handle gesture state change
  const handleGestureStateChange = useCallback(
    (newGestureState: GestureState) => {
      setGestureState(newGestureState);
    },
    []
  );

  // Handle save
  const handleSave = useCallback(async () => {
    if (strokes.length === 0) {
      Alert.alert('Nothing to Save', 'Please draw some highlights first.');
      return;
    }

    setIsSaving(true);
    try {
      // Create highlight drawing data
      const drawingData: HighlightDrawing = {
        id: generateStrokeId(),
        strokes,
        imageUri,
        canvasDimensions,
        timestamp: new Date().toISOString(),
        version: 1,
      };

      // Navigate back with the drawing data
      router.back();
      // In a real implementation, this would be passed back via params or state management
      console.log('Saving drawing:', drawingData);

      Alert.alert('Success', 'Your highlight design has been saved!');
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save your design. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [strokes, imageUri, canvasDimensions, router]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (strokes.length > 0) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Do you want to save before leaving?',
        [
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => router.back(),
          },
          { text: 'Save', onPress: () => void handleSave() },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } else {
      router.back();
    }
  }, [strokes, router, handleSave]);

  // Handle share
  const handleShare = useCallback(() => {
    if (strokes.length === 0) {
      Alert.alert('Nothing to Share', 'Please draw some highlights first.');
      return;
    }

    // In a real implementation, this would export the drawing
    Alert.alert('Share', 'Share functionality would be implemented here.');
  }, [strokes]);

  // Toggle preview mode
  const togglePreview = useCallback(() => {
    setShowPreview((prev) => !prev);
  }, []);

  // Render header
  const renderHeader = useCallback(() => {
    return (
      <LinearGradient
        colors={['#E91E63', '#9C27B0']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <StatusBar barStyle="light-content" />
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Highlight Studio</Text>
            <Text style={styles.headerSubtitle}>
              {strokes.length} strokes • {hairStyleId || 'Custom'}
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={togglePreview}
            >
              {showPreview ? (
                <EyeOff size={20} color="white" />
              ) : (
                <Eye size={20} color="white" />
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
              <Share size={20} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.headerButton, styles.saveButton]}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Save size={20} color="white" />
              {isSaving && <Text style={styles.saveButtonText}>Saving...</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    );
  }, [
    handleBack,
    togglePreview,
    showPreview,
    handleShare,
    handleSave,
    isSaving,
    strokes.length,
    hairStyleId,
  ]);

  // Render canvas section
  const renderCanvas = useCallback(() => {
    return (
      <View style={styles.canvasSection}>
        <DrawingCanvas
          imageUri={imageUri}
          canvasDimensions={canvasDimensions}
          brushSettings={brushSettings}
          strokes={showPreview ? [] : strokes}
          isDrawingEnabled={isDrawingEnabled}
          onStrokeStart={handleStrokeStart}
          onStrokeUpdate={handleStrokeUpdate}
          onStrokeEnd={handleStrokeEnd}
          onCanvasReady={handleCanvasReady}
          gestureState={gestureState}
          onGestureStateChange={handleGestureStateChange}
        />

        {showPreview && (
          <View style={styles.previewOverlay}>
            <Text style={styles.previewText}>Preview Mode</Text>
            <Text style={styles.previewSubtext}>
              Tap eye icon to show highlights
            </Text>
          </View>
        )}
      </View>
    );
  }, [
    imageUri,
    canvasDimensions,
    brushSettings,
    strokes,
    showPreview,
    isDrawingEnabled,
    handleStrokeStart,
    handleStrokeUpdate,
    handleStrokeEnd,
    handleCanvasReady,
    gestureState,
    handleGestureStateChange,
  ]);

  // Render tools section
  const renderTools = useCallback(() => {
    return (
      <View style={styles.toolsSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.toolsScrollContent}
        >
          <DrawingTools
            selectedTool={selectedTool}
            onToolSelect={handleToolSelect}
            canUndo={canUndo(history)}
            canRedo={canRedo(history)}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onClear={handleClear}
            strokeCount={strokes.length}
            isDrawingEnabled={isDrawingEnabled}
          />
        </ScrollView>
      </View>
    );
  }, [
    selectedTool,
    handleToolSelect,
    history,
    handleUndo,
    handleRedo,
    handleClear,
    strokes.length,
    isDrawingEnabled,
  ]);

  // Render color brush section
  const renderColorBrush = useCallback(() => {
    return (
      <View style={styles.colorBrushSection}>
        <ColorBrush
          selectedColors={selectedColors}
          currentBrushSettings={brushSettings}
          onBrushSettingsChange={handleBrushSettingsChange}
          onColorSelect={handleColorSelect}
          showOpacityControl={true}
          showSizePreview={true}
        />
      </View>
    );
  }, [
    selectedColors,
    brushSettings,
    handleBrushSettingsChange,
    handleColorSelect,
  ]);

  // Render settings modal
  const renderSettingsModal = useCallback(() => {
    const stats = getDrawingStats(history);

    return (
      <Modal
        visible={showSettings}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.settingsModal}>
            <View style={styles.settingsHeader}>
              <Text style={styles.settingsTitle}>Drawing Settings</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <Text style={styles.settingsClose}>Done</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.settingsContent}>
              <View style={styles.settingsSection}>
                <Text style={styles.settingsSectionTitle}>Statistics</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.totalStrokes}</Text>
                    <Text style={styles.statLabel}>Strokes</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.totalPoints}</Text>
                    <Text style={styles.statLabel}>Points</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.totalStates}</Text>
                    <Text style={styles.statLabel}>History States</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {Math.round(stats.memoryUsage / 1024)}KB
                    </Text>
                    <Text style={styles.statLabel}>Memory Usage</Text>
                  </View>
                </View>
              </View>

              <View style={styles.settingsSection}>
                <Text style={styles.settingsSectionTitle}>Canvas Info</Text>
                <Text style={styles.settingsText}>
                  Size: {Math.round(canvasDimensions.width)} ×{' '}
                  {Math.round(canvasDimensions.height)}px
                </Text>
                <Text style={styles.settingsText}>
                  Zoom: {Math.round(gestureState.scale * 100)}%
                </Text>
                <Text style={styles.settingsText}>
                  Mode: {isDrawingEnabled ? 'Drawing' : 'Navigation'}
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  }, [showSettings, history, canvasDimensions, gestureState, isDrawingEnabled]);

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}

      <View style={styles.content}>
        {renderCanvas()}
        {renderTools()}
        {renderColorBrush()}
      </View>

      {renderSettingsModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: 'white',
  },
  headerSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 4,
  },
  saveButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  canvasSection: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  previewOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  previewText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: 'white',
  },
  previewSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  toolsSection: {
    minHeight: 60,
  },
  toolsScrollContent: {
    paddingRight: 16,
  },
  colorBrushSection: {
    minHeight: 200,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  settingsModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1a1a1a',
  },
  settingsClose: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#E91E63',
  },
  settingsContent: {
    flex: 1,
    padding: 20,
  },
  settingsSection: {
    marginBottom: 24,
  },
  settingsSectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 12,
  },
  settingsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#E91E63',
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
