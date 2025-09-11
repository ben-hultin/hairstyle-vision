import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { X } from 'lucide-react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

interface FullscreenImageViewerProps {
  visible: boolean;
  imageUri?: string;
  beforeImageUri?: string;
  afterImageUri?: string;
  onClose: () => void;
}

export const FullscreenImageViewer: React.FC<FullscreenImageViewerProps> = ({
  visible,
  imageUri,
  beforeImageUri,
  afterImageUri,
  onClose,
}) => {
  const { width, height } = Dimensions.get('window');
  const sliderPosition = useSharedValue(width / 2);
  const isComparisonMode = Boolean(beforeImageUri && afterImageUri);

  // Debug logging
  React.useEffect(() => {
    console.log('FullscreenImageViewer - visible:', visible);
    console.log('FullscreenImageViewer - imageUri:', afterImageUri);
    console.log('FullscreenImageViewer - isComparisonMode:', isComparisonMode);
  }, [visible, afterImageUri, isComparisonMode]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
    })
    .onUpdate((event) => {
      'worklet';
      const newPosition = width / 2 + event.translationX;
      sliderPosition.value = Math.max(0, Math.min(width, newPosition));
    })
    .onEnd(() => {
      'worklet';
    });

  const sliderStyle = useAnimatedStyle(() => {
    return {
      left: sliderPosition.value - 1, // -1 to center the 2px wide slider
    };
  });

  const beforeImageStyle = useAnimatedStyle(() => {
    return {
      width: sliderPosition.value,
    };
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <StatusBar hidden={true} />
      <GestureHandlerRootView style={styles.container}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            console.log('Close button pressed in FullscreenImageViewer');
            onClose();
          }}
          activeOpacity={0.7}
        >
          <X size={24} color="white" strokeWidth={2} />
        </TouchableOpacity>

        <View style={styles.imageContainer}>
          <View style={styles.afterImageWrapper}>
            <Image
              source={{ uri: afterImageUri }}
              style={[styles.fullscreenImage, { width, height }]}
              contentFit="contain"
            />
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 10,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  comparisonContainer: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  imageWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    overflow: 'hidden',
  },
  afterImageWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  fullscreenImage: {
    maxWidth: '100%',
    maxHeight: '100%',
  },
  slider: {
    position: 'absolute',
    top: 0,
    width: 2,
    height: '100%',
    backgroundColor: 'white',
    zIndex: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 5,
  },
});
