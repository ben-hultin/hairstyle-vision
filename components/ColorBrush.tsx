import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import { Palette, Circle, Minus, Plus } from 'lucide-react-native';
import { ColorBrushProps } from '@/types/components';
import { clamp, isValidHexColor } from './drawing.util';

const { width: screenWidth } = Dimensions.get('window');

// Default brush sizes
const BRUSH_SIZES = [2, 4, 6, 8, 12, 16, 20, 24, 32];
const MIN_BRUSH_SIZE = 1;
const MAX_BRUSH_SIZE = 50;

// Default opacity levels
const OPACITY_LEVELS = [0.3, 0.5, 0.7, 0.8, 0.9, 1.0];

export const ColorBrush = ({
  selectedColors,
  currentBrushSettings,
  onBrushSettingsChange,
  onColorSelect,
  availableColors,
  showOpacityControl = true,
  showSizePreview = true,
}: ColorBrushProps) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [expandedSection, setExpandedSection] = useState<
    'colors' | 'size' | 'opacity' | null
  >(null);

  // Use available colors or selected colors as fallback
  const colorPalette = availableColors || selectedColors;

  // Handle color selection
  const handleColorSelect = useCallback(
    (color: string) => {
      if (!isValidHexColor(color)) return;

      onColorSelect(color);
      onBrushSettingsChange({
        ...currentBrushSettings,
        color,
      });
    },
    [currentBrushSettings, onColorSelect, onBrushSettingsChange]
  );

  // Handle brush size change
  const handleSizeChange = useCallback(
    (newSize: number) => {
      const clampedSize = clamp(newSize, MIN_BRUSH_SIZE, MAX_BRUSH_SIZE);
      onBrushSettingsChange({
        ...currentBrushSettings,
        width: clampedSize,
      });
    },
    [currentBrushSettings, onBrushSettingsChange]
  );

  // Handle opacity change
  const handleOpacityChange = useCallback(
    (newOpacity: number) => {
      const clampedOpacity = clamp(newOpacity, 0.1, 1.0);
      onBrushSettingsChange({
        ...currentBrushSettings,
        opacity: clampedOpacity,
      });
    },
    [currentBrushSettings, onBrushSettingsChange]
  );

  // Toggle section expansion
  const toggleSection = useCallback(
    (section: 'colors' | 'size' | 'opacity') => {
      setExpandedSection((prev) => (prev === section ? null : section));
    },
    []
  );

  // Render color palette
  const renderColorPalette = useCallback(() => {
    if (colorPalette.length === 0) return null;

    return (
      <View style={styles.colorPalette}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.colorScrollContent}
        >
          {colorPalette.map((color, index) => (
            <TouchableOpacity
              key={`${color}-${index}`}
              style={[
                styles.colorSwatch,
                {
                  backgroundColor: color,
                  borderWidth: currentBrushSettings.color === color ? 3 : 1,
                  borderColor:
                    currentBrushSettings.color === color ? '#333' : '#ddd',
                },
              ]}
              onPress={() => handleColorSelect(color)}
            />
          ))}
          <TouchableOpacity
            style={styles.customColorButton}
            onPress={() => setShowColorPicker(true)}
          >
            <Palette size={20} color="#666" />
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }, [colorPalette, currentBrushSettings.color, handleColorSelect]);

  // Render brush size selector
  const renderBrushSizeSelector = useCallback(() => {
    return (
      <View style={styles.sizeSelector}>
        <View style={styles.sizeControls}>
          <TouchableOpacity
            style={styles.sizeButton}
            onPress={() => handleSizeChange(currentBrushSettings.width - 1)}
          >
            <Minus size={16} color="#666" />
          </TouchableOpacity>

          <View style={styles.sizeDisplay}>
            <Text style={styles.sizeText}>{currentBrushSettings.width}px</Text>
            {showSizePreview && (
              <View
                style={[
                  styles.sizePreview,
                  {
                    width: Math.max(8, currentBrushSettings.width),
                    height: Math.max(8, currentBrushSettings.width),
                    backgroundColor: currentBrushSettings.color,
                    opacity: currentBrushSettings.opacity,
                  },
                ]}
              />
            )}
          </View>

          <TouchableOpacity
            style={styles.sizeButton}
            onPress={() => handleSizeChange(currentBrushSettings.width + 1)}
          >
            <Plus size={16} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sizePresets}
        >
          {BRUSH_SIZES.map((size) => (
            <TouchableOpacity
              key={size}
              style={[
                styles.sizePreset,
                currentBrushSettings.width === size &&
                  styles.selectedSizePreset,
              ]}
              onPress={() => handleSizeChange(size)}
            >
              <View
                style={[
                  styles.sizePresetDot,
                  {
                    width: size,
                    height: size,
                    backgroundColor: currentBrushSettings.color,
                  },
                ]}
              />
              <Text style={styles.sizePresetText}>{size}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }, [currentBrushSettings, handleSizeChange, showSizePreview]);

  // Render opacity selector
  const renderOpacitySelector = useCallback(() => {
    if (!showOpacityControl) return null;

    return (
      <View style={styles.opacitySelector}>
        <Text style={styles.opacityLabel}>
          Opacity: {Math.round(currentBrushSettings.opacity * 100)}%
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.opacityLevels}
        >
          {OPACITY_LEVELS.map((opacity) => (
            <TouchableOpacity
              key={opacity}
              style={[
                styles.opacityButton,
                currentBrushSettings.opacity === opacity &&
                  styles.selectedOpacityButton,
              ]}
              onPress={() => handleOpacityChange(opacity)}
            >
              <View
                style={[
                  styles.opacityPreview,
                  {
                    backgroundColor: currentBrushSettings.color,
                    opacity,
                  },
                ]}
              />
              <Text style={styles.opacityText}>
                {Math.round(opacity * 100)}%
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }, [currentBrushSettings, handleOpacityChange, showOpacityControl]);

  // Render current brush preview
  const renderBrushPreview = useCallback(() => {
    return (
      <View style={styles.brushPreview}>
        <Text style={styles.brushPreviewLabel}>Current Brush:</Text>
        <View style={styles.brushPreviewContainer}>
          <View
            style={[
              styles.brushPreviewDot,
              {
                width: Math.max(12, currentBrushSettings.width),
                height: Math.max(12, currentBrushSettings.width),
                backgroundColor: currentBrushSettings.color,
                opacity: currentBrushSettings.opacity,
              },
            ]}
          />
          <Text style={styles.brushPreviewText}>
            {currentBrushSettings.width}px •{' '}
            {Math.round(currentBrushSettings.opacity * 100)}%
          </Text>
        </View>
      </View>
    );
  }, [currentBrushSettings]);

  return (
    <View style={styles.container}>
      {/* Brush Preview */}
      {renderBrushPreview()}

      {/* Color Selection */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('colors')}
        >
          <Text style={styles.sectionTitle}>Colors</Text>
          <Circle
            size={16}
            color={currentBrushSettings.color}
            fill={currentBrushSettings.color}
          />
        </TouchableOpacity>
        {(expandedSection === 'colors' || expandedSection === null) &&
          renderColorPalette()}
      </View>

      {/* Brush Size */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('size')}
        >
          <Text style={styles.sectionTitle}>Brush Size</Text>
          <Text style={styles.sectionValue}>
            {currentBrushSettings.width}px
          </Text>
        </TouchableOpacity>
        {(expandedSection === 'size' || expandedSection === null) &&
          renderBrushSizeSelector()}
      </View>

      {/* Opacity */}
      {showOpacityControl && (
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('opacity')}
          >
            <Text style={styles.sectionTitle}>Opacity</Text>
            <Text style={styles.sectionValue}>
              {Math.round(currentBrushSettings.opacity * 100)}%
            </Text>
          </TouchableOpacity>
          {(expandedSection === 'opacity' || expandedSection === null) &&
            renderOpacitySelector()}
        </View>
      )}

      {/* Color Picker Modal */}
      <Modal
        visible={showColorPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowColorPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Custom Color</Text>
            <Text style={styles.modalMessage}>
              Custom color picker would go here
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowColorPicker(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  brushPreview: {
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  brushPreviewLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  brushPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brushPreviewDot: {
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  brushPreviewText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#1a1a1a',
  },
  sectionValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#666',
  },
  colorPalette: {
    marginTop: 8,
  },
  colorScrollContent: {
    paddingRight: 16,
    gap: 8,
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  customColorButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeSelector: {
    marginTop: 8,
  },
  sizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 16,
  },
  sizeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeDisplay: {
    alignItems: 'center',
    gap: 8,
    minWidth: 80,
  },
  sizeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1a1a1a',
  },
  sizePreview: {
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sizePresets: {
    paddingRight: 16,
    gap: 12,
  },
  sizePreset: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    minWidth: 40,
  },
  selectedSizePreset: {
    backgroundColor: '#fce4ec',
  },
  sizePresetDot: {
    borderRadius: 50,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sizePresetText: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: '#666',
  },
  opacitySelector: {
    marginTop: 8,
  },
  opacityLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  opacityLevels: {
    paddingRight: 16,
    gap: 8,
  },
  opacityButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    minWidth: 50,
  },
  selectedOpacityButton: {
    backgroundColor: '#fce4ec',
  },
  opacityPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  opacityText: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: screenWidth - 40,
    maxWidth: 300,
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1a1a1a',
    marginBottom: 12,
  },
  modalMessage: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  modalButtonText: {
    fontFamily: 'Inter-Medium',
    color: 'white',
    fontSize: 14,
  },
});
