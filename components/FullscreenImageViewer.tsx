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

interface FullscreenImageViewerProps {
  visible: boolean;
  imageUri: string;
  onClose: () => void;
}

export const FullscreenImageViewer: React.FC<FullscreenImageViewerProps> = ({
  visible,
  imageUri,
  onClose,
}) => {
  const { width, height } = Dimensions.get('window');

  // Debug logging
  React.useEffect(() => {
    console.log('FullscreenImageViewer - visible:', visible);
    console.log('FullscreenImageViewer - imageUri:', imageUri);
  }, [visible, imageUri]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <StatusBar hidden={true} />
      <View style={styles.container}>
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
          <Image
            source={{ uri: imageUri }}
            style={[styles.fullscreenImage, { width, height }]}
            contentFit="contain"
          />
        </View>
      </View>
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
    zIndex: 1,
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
  fullscreenImage: {
    maxWidth: '100%',
    maxHeight: '100%',
  },
});
