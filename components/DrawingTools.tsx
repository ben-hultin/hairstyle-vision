import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  Undo2,
  Redo2,
  Trash2,
  RotateCcw,
  Settings,
  Info,
} from 'lucide-react-native';
import { DrawingToolsProps } from '@/types/components';
import { DrawingTool } from '@/types';

const { width: screenWidth } = Dimensions.get('window');

// Default drawing tools configuration
const DEFAULT_TOOLS: DrawingTool[] = [
  {
    id: 'undo',
    name: 'Undo',
    icon: 'undo',
    type: 'undo',
  },
  {
    id: 'redo',
    name: 'Redo',
    icon: 'redo',
    type: 'redo',
  },
  {
    id: 'clear',
    name: 'Clear All',
    icon: 'trash',
    type: 'clear',
  },
  {
    id: 'reset',
    name: 'Reset View',
    icon: 'rotate',
    type: 'zoom',
  },
];

export const DrawingTools = ({
  tools = DEFAULT_TOOLS,
  selectedTool,
  onToolSelect,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  strokeCount,
  isDrawingEnabled,
}: DrawingToolsProps) => {
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [toolsExpanded, setToolsExpanded] = useState(false);

  // Handle tool selection
  const handleToolSelect = useCallback(
    (tool: DrawingTool) => {
      switch (tool.type) {
        case 'undo':
          if (canUndo) {
            onUndo();
          }
          break;
        case 'redo':
          if (canRedo) {
            onRedo();
          }
          break;
        case 'clear':
          if (strokeCount > 0) {
            setPendingAction(() => onClear);
            setShowConfirmModal(true);
          }
          break;
        default:
          onToolSelect(tool);
      }
    },
    [canUndo, canRedo, onUndo, onRedo, onClear, strokeCount, onToolSelect]
  );

  // Handle confirm modal actions
  const handleConfirmAction = useCallback(() => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
    setShowConfirmModal(false);
  }, [pendingAction]);

  // Get tool icon component
  const getToolIcon = useCallback((tool: DrawingTool, size: number = 20) => {
    const iconColor = getToolIconColor(tool);

    switch (tool.type) {
      case 'undo':
        return <Undo2 size={size} color={iconColor} />;
      case 'redo':
        return <Redo2 size={size} color={iconColor} />;
      case 'clear':
        return <Trash2 size={size} color={iconColor} />;
      case 'zoom':
        return <RotateCcw size={size} color={iconColor} />;
      default:
        return <Settings size={size} color={iconColor} />;
    }
  }, []);

  // Get tool icon color based on state
  const getToolIconColor = useCallback(
    (tool: DrawingTool): string => {
      switch (tool.type) {
        case 'undo':
          return canUndo ? '#1a1a1a' : '#ccc';
        case 'redo':
          return canRedo ? '#1a1a1a' : '#ccc';
        case 'clear':
          return strokeCount > 0 ? '#E91E63' : '#ccc';
        default:
          return selectedTool?.id === tool.id ? '#E91E63' : '#1a1a1a';
      }
    },
    [canUndo, canRedo, strokeCount, selectedTool]
  );

  // Check if tool is disabled
  const isToolDisabled = useCallback(
    (tool: DrawingTool): boolean => {
      switch (tool.type) {
        case 'undo':
          return !canUndo;
        case 'redo':
          return !canRedo;
        case 'clear':
          return strokeCount === 0;
        default:
          return false;
      }
    },
    [canUndo, canRedo, strokeCount]
  );

  // Render tool button
  const renderToolButton = useCallback(
    (tool: DrawingTool, showLabel: boolean = true) => {
      const disabled = isToolDisabled(tool);
      const isSelected = selectedTool?.id === tool.id;

      return (
        <TouchableOpacity
          key={tool.id}
          style={[
            styles.toolButton,
            isSelected && styles.selectedToolButton,
            disabled && styles.disabledToolButton,
          ]}
          onPress={() => handleToolSelect(tool)}
          disabled={disabled}
        >
          {getToolIcon(tool, 20)}
          {showLabel && (
            <Text
              style={[
                styles.toolButtonText,
                disabled && styles.disabledToolButtonText,
                isSelected && styles.selectedToolButtonText,
              ]}
            >
              {tool.name}
            </Text>
          )}
        </TouchableOpacity>
      );
    },
    [selectedTool, isToolDisabled, handleToolSelect, getToolIcon]
  );

  // Render compact tool bar
  const renderCompactTools = useCallback(() => {
    const primaryTools = tools.slice(0, 3); // Show first 3 tools
    const hasMoreTools = tools.length > 3;

    return (
      <View style={styles.compactToolbar}>
        {primaryTools.map((tool) => renderToolButton(tool, false))}

        {hasMoreTools && (
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setToolsExpanded(true)}
          >
            <Settings size={16} color="#666" />
            <Text style={styles.expandButtonText}>More</Text>
          </TouchableOpacity>
        )}

        <View style={styles.toolbarInfo}>
          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => setShowStatsModal(true)}
          >
            <Info size={16} color="#666" />
            <Text style={styles.infoText}>{strokeCount}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [tools, renderToolButton, strokeCount]);

  // Render expanded tool grid
  const renderExpandedTools = useCallback(() => {
    return (
      <Modal
        visible={toolsExpanded}
        transparent
        animationType="slide"
        onRequestClose={() => setToolsExpanded(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.expandedToolsContainer}>
            <View style={styles.expandedHeader}>
              <Text style={styles.expandedTitle}>Drawing Tools</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setToolsExpanded(false)}
              >
                <Text style={styles.closeButtonText}>Done</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.expandedToolsGrid}
              showsVerticalScrollIndicator={false}
            >
              {tools.map((tool) => (
                <View key={tool.id} style={styles.expandedToolItem}>
                  {renderToolButton(tool, true)}
                </View>
              ))}
            </ScrollView>

            <View style={styles.expandedFooter}>
              <TouchableOpacity
                style={styles.statsButton}
                onPress={() => {
                  setToolsExpanded(false);
                  setShowStatsModal(true);
                }}
              >
                <Info size={16} color="#666" />
                <Text style={styles.statsButtonText}>
                  {strokeCount} strokes • Drawing{' '}
                  {isDrawingEnabled ? 'ON' : 'OFF'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }, [toolsExpanded, tools, renderToolButton, strokeCount, isDrawingEnabled]);

  // Render stats modal
  const renderStatsModal = useCallback(() => {
    return (
      <Modal
        visible={showStatsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStatsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.statsModalContent}>
            <Text style={styles.statsModalTitle}>Drawing Statistics</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{strokeCount}</Text>
                <Text style={styles.statLabel}>Strokes</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {isDrawingEnabled ? 'ON' : 'OFF'}
                </Text>
                <Text style={styles.statLabel}>Drawing Mode</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statValue}>{canUndo ? 'Yes' : 'No'}</Text>
                <Text style={styles.statLabel}>Can Undo</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statValue}>{canRedo ? 'Yes' : 'No'}</Text>
                <Text style={styles.statLabel}>Can Redo</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.statsModalButton}
              onPress={() => setShowStatsModal(false)}
            >
              <Text style={styles.statsModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }, [showStatsModal, strokeCount, isDrawingEnabled, canUndo, canRedo]);

  // Render confirmation modal
  const renderConfirmModal = useCallback(() => {
    return (
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContent}>
            <Trash2 size={32} color="#E91E63" style={styles.confirmIcon} />
            <Text style={styles.confirmTitle}>Clear All Strokes?</Text>
            <Text style={styles.confirmMessage}>
              This will permanently delete all {strokeCount} strokes. This
              action cannot be undone.
            </Text>

            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmAction}
              >
                <Text style={styles.confirmButtonText}>Clear All</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }, [showConfirmModal, strokeCount, handleConfirmAction]);

  return (
    <View style={styles.container}>
      {renderCompactTools()}
      {renderExpandedTools()}
      {renderStatsModal()}
      {renderConfirmModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  compactToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    gap: 6,
  },
  selectedToolButton: {
    backgroundColor: '#fce4ec',
  },
  disabledToolButton: {
    opacity: 0.5,
  },
  toolButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#1a1a1a',
  },
  selectedToolButtonText: {
    color: '#E91E63',
  },
  disabledToolButtonText: {
    color: '#ccc',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
    gap: 4,
  },
  expandButtonText: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#666',
  },
  toolbarInfo: {
    marginLeft: 'auto',
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  expandedToolsContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '70%',
  },
  expandedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  expandedTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1a1a1a',
  },
  closeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: '#E91E63',
  },
  closeButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: 'white',
  },
  expandedToolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 12,
  },
  expandedToolItem: {
    width: (screenWidth - 64) / 3,
  },
  expandedFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  statsButtonText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
  },
  statsModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    alignItems: 'center',
  },
  statsModalTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1a1a1a',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
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
  statsModalButton: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  statsModalButtonText: {
    fontFamily: 'Inter-Medium',
    color: 'white',
    fontSize: 14,
  },
  confirmModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    alignItems: 'center',
  },
  confirmIcon: {
    marginBottom: 16,
  },
  confirmTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1a1a1a',
    marginBottom: 8,
  },
  confirmMessage: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#666',
  },
  confirmButton: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  confirmButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: 'white',
  },
});
