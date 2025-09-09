import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Alert,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, Upload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { ColorPalette } from '@/components/ColorPalette';
import { PromptInput } from '@/components/PromptInput';
import { GenerateButton } from '@/components/GenerateButton';
import { FullscreenImageViewer } from '@/components/FullscreenImageViewer';
import { geminiService } from '@/components/GeminiService';
import { TransformationResult } from '@/types';

export default function StudioScreen() {
  const { width } = useWindowDimensions();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] =
    useState<TransformationResult | null>(null);
  const [isFullscreenVisible, setIsFullscreenVisible] = useState(false);

  // Debug logging for fullscreen state changes
  React.useEffect(() => {
    console.log('Fullscreen visibility changed:', isFullscreenVisible);
  }, [isFullscreenVisible]);

  // Debug logging for generated result
  React.useEffect(() => {
    if (generatedResult) {
      console.log('Generated result updated:', generatedResult);
      console.log('Generated image URI:', generatedResult.generatedImage);
    }
  }, [generatedResult]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Camera permission is required to take photos'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage || selectedColors.length === 0) {
      Alert.alert(
        'Missing Information',
        'Please select a photo and at least one color'
      );
      return;
    }

    setIsGenerating(true);

    try {
      const result = await geminiService.generateHairTransformation({
        imageUri: selectedImage,
        prompt: prompt || 'Hair color transformation',
        colors: selectedColors,
      });

      if (result.success) {
        const transformationResult: TransformationResult = {
          id: Date.now().toString(),
          originalImage: selectedImage,
          generatedImage: result.imageUrl,
          prompt: prompt || 'Hair color transformation',
          colors: selectedColors,
          timestamp: new Date().toISOString(),
          analysis: result.metadata?.analysis,
        };

        setGeneratedResult(transformationResult);
        console.log('Generated result set:', transformationResult);
        console.log(
          'Generated image URI:',
          transformationResult.generatedImage
        );
        Alert.alert('Success!', 'Your hair transformation analysis is ready!');
      } else {
        Alert.alert(
          'Error',
          result.error || 'Failed to generate transformation'
        );
      }
    } catch (error) {
      console.error('Generation error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#E91E63', '#9C27B0']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>ChromaVision Studio</Text>
        <Text style={styles.headerSubtitle}>Transform your hair with AI</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Choose Your Photo</Text>
          <View style={styles.photoSection}>
            {selectedImage ? (
              <View style={styles.selectedImageContainer}>
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.selectedImage}
                />
                <TouchableOpacity
                  style={styles.changePhotoButton}
                  onPress={pickImage}
                >
                  <Text style={styles.changePhotoText}>Change Photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.photoOptions}>
                <TouchableOpacity
                  style={[styles.photoOption, { width: (width - 80) / 2 }]}
                  onPress={takePhoto}
                >
                  <Camera size={32} color="#E91E63" strokeWidth={2} />
                  <Text style={styles.photoOptionText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.photoOption, { width: (width - 80) / 2 }]}
                  onPress={pickImage}
                >
                  <Upload size={32} color="#E91E63" strokeWidth={2} />
                  <Text style={styles.photoOptionText}>Upload Photo</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Select Your Colors</Text>
          <ColorPalette
            selectedColors={selectedColors}
            onColorSelect={setSelectedColors}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Describe Your Vision</Text>
          <PromptInput
            value={prompt}
            onChangeText={setPrompt}
            placeholder="Describe your desired hair style... (e.g., subtle balayage highlights, bold ombre effect)"
          />
        </View>

        {generatedResult && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Transformation</Text>
            <View style={styles.resultCard}>
              <View style={styles.resultImages}>
                <View style={styles.resultImageWrapper}>
                  <Text style={styles.resultImageLabel}>Before</Text>
                  <Image
                    source={{ uri: generatedResult.originalImage }}
                    style={styles.resultImage}
                  />
                </View>
                <View style={styles.resultImageWrapper}>
                  <Text style={styles.resultImageLabel}>After</Text>
                  <Pressable
                    onPress={() => {
                      console.log(
                        'After image tapped, setting fullscreen visible to true'
                      );
                      console.log(
                        'Generated result image URI:',
                        generatedResult.generatedImage
                      );
                      setIsFullscreenVisible(true);
                    }}
                    style={styles.resultImage}
                  >
                    <Image
                      source={{ uri: generatedResult.generatedImage }}
                      style={styles.resultImage}
                    />
                  </Pressable>
                </View>
              </View>
              <View style={styles.resultInfo}>
                <Text style={styles.resultPrompt}>
                  {generatedResult.prompt}
                </Text>
                <View style={styles.resultColors}>
                  {generatedResult.colors.map((color) => (
                    <View
                      key={color}
                      style={[
                        styles.resultColorDot,
                        { backgroundColor: color },
                      ]}
                    />
                  ))}
                </View>
                {generatedResult.analysis && (
                  <View style={styles.analysisContainer}>
                    <Text style={styles.analysisTitle}>AI Analysis:</Text>
                    <Text style={styles.analysisText}>
                      {generatedResult.analysis}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        <View style={styles.generateSection}>
          <GenerateButton
            onPress={handleGenerate}
            isLoading={isGenerating}
            disabled={!selectedImage || selectedColors.length === 0}
          />
        </View>
      </ScrollView>

      {generatedResult && (
        <FullscreenImageViewer
          visible={isFullscreenVisible}
          imageUri={generatedResult.generatedImage}
          onClose={() => {
            console.log('Closing fullscreen viewer');
            setIsFullscreenVisible(false);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 30,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1a1a1a',
    marginBottom: 15,
  },
  photoSection: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  photoOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  photoOption: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fce4ec',
    borderRadius: 15,
  },
  photoOptionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#1a1a1a',
    marginTop: 10,
    textAlign: 'center',
  },
  selectedImageContainer: {
    alignItems: 'center',
  },
  selectedImage: {
    width: 200,
    height: 250,
    borderRadius: 15,
    marginBottom: 15,
  },
  changePhotoButton: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  changePhotoText: {
    fontFamily: 'Inter-Medium',
    color: 'white',
    fontSize: 14,
  },
  generateSection: {
    marginTop: 40,
    marginBottom: 30,
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  resultImages: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  resultImageWrapper: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  resultImageLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  resultImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
  },
  resultInfo: {
    alignItems: 'center',
  },
  resultPrompt: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 10,
  },
  resultColors: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  resultColorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  analysisContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  analysisTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#1a1a1a',
    marginBottom: 8,
  },
  analysisText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
});
