import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Share, Download, Heart } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface TransformationResult {
  id: string;
  originalImage: string;
  generatedImage: string;
  prompt: string;
  colors: string[];
  timestamp: string;
}

interface ResultsGalleryProps {
  results: TransformationResult[];
  onShare: (result: TransformationResult) => void;
  onSave: (result: TransformationResult) => void;
  onFavorite: (result: TransformationResult) => void;
}

export function ResultsGallery({ results, onShare, onSave, onFavorite }: ResultsGalleryProps) {
  if (results.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>No transformations yet</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {results.map((result) => (
        <View key={result.id} style={styles.resultCard}>
          <View style={styles.imageContainer}>
            <View style={styles.imageWrapper}>
              <Text style={styles.imageLabel}>Original</Text>
              <Image source={{ uri: result.originalImage }} style={styles.resultImage} />
            </View>
            <View style={styles.imageWrapper}>
              <Text style={styles.imageLabel}>Transformed</Text>
              <Image source={{ uri: result.generatedImage }} style={styles.resultImage} />
            </View>
          </View>

          <View style={styles.resultInfo}>
            <Text style={styles.resultPrompt}>{result.prompt}</Text>
            <View style={styles.colorPalette}>
              {result.colors.map((color, index) => (
                <View key={index} style={[styles.colorDot, { backgroundColor: color }]} />
              ))}
            </View>
          </View>

          <View style={styles.resultActions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => onFavorite(result)}>
              <Heart size={20} color="#E91E63" strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => onShare(result)}>
              <Share size={20} color="#E91E63" strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => onSave(result)}>
              <Download size={20} color="#E91E63" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingTop: 50,
  },
  emptyStateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666',
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  imageWrapper: {
    alignItems: 'center',
  },
  imageLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  resultImage: {
    width: (width - 80) / 2 - 10,
    height: 120,
    borderRadius: 10,
  },
  resultInfo: {
    marginBottom: 15,
  },
  resultPrompt: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#1a1a1a',
    marginBottom: 10,
  },
  colorPalette: {
    flexDirection: 'row',
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resultActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: 8,
    marginLeft: 10,
  },
});