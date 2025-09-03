import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Camera, Upload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

interface PhotoCaptureProps {
  onImageSelected: (uri: string) => void;
}

export function PhotoCapture({ onImageSelected }: PhotoCaptureProps) {
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    if (!result.canceled) {
      onImageSelected(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    if (!result.canceled) {
      onImageSelected(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.option} onPress={takePhoto}>
        <Camera size={32} color="#E91E63" strokeWidth={2} />
        <Text style={styles.optionText}>Take Photo</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.option} onPress={pickImage}>
        <Upload size={32} color="#E91E63" strokeWidth={2} />
        <Text style={styles.optionText}>Upload Photo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  option: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fce4ec',
    borderRadius: 15,
    flex: 1,
    marginHorizontal: 5,
  },
  optionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#1a1a1a',
    marginTop: 10,
    textAlign: 'center',
  },
});