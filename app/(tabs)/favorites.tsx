import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Share, Download, Trash2 } from 'lucide-react-native';
import { Image } from 'expo-image';


interface FavoriteItem {
  id: string;
  originalImage: string;
  generatedImage: string;
  colors: string[];
  prompt: string;
  createdAt: string;
}

// Mock data for demonstration
const mockFavorites: FavoriteItem[] = [
  {
    id: '1',
    originalImage: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    generatedImage: 'https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg',
    colors: ['#E6D690', '#D4C47A'],
    prompt: 'Blonde highlights with subtle balayage',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    originalImage: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg',
    generatedImage: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg',
    colors: ['#FF69B4', '#9370DB'],
    prompt: 'Pink and purple ombre effect',
    createdAt: '2024-01-14',
  },
];

export default function FavoritesScreen() {
  const { width } = useWindowDimensions();
  const [favorites, setFavorites] = useState<FavoriteItem[]>(mockFavorites);

  const removeFavorite = (id: string) => {
    setFavorites(favorites.filter(fav => fav.id !== id));
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#E91E63', '#9C27B0']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Heart size={32} color="white" strokeWidth={2} />
        <Text style={styles.headerTitle}>Your Favorites</Text>
        <Text style={styles.headerSubtitle}>Saved transformations</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {favorites.length === 0 ? (
          <View style={styles.emptyState}>
            <Heart size={64} color="#ccc" strokeWidth={1} />
            <Text style={styles.emptyStateTitle}>No favorites yet</Text>
            <Text style={styles.emptyStateText}>
              Start creating hair transformations to see them here
            </Text>
          </View>
        ) : (
          favorites.map((favorite) => (
            <View key={favorite.id} style={styles.favoriteCard}>
              <View style={styles.imageContainer}>
                <View style={styles.imageWrapper}>
                  <Text style={styles.imageLabel}>Before</Text>
                  <Image source={{ uri: favorite.originalImage }} style={[styles.transformationImage, { width: (width - 80) / 2 - 10 }]} />
                </View>
                <View style={styles.imageWrapper}>
                  <Text style={styles.imageLabel}>After</Text>
                  <Image source={{ uri: favorite.generatedImage }} style={[styles.transformationImage, { width: (width - 80) / 2 - 10 }]} />
                </View>
              </View>
              
              <View style={styles.favoriteInfo}>
                <Text style={styles.favoritePrompt}>{favorite.prompt}</Text>
                <View style={styles.colorPalette}>
                  {favorite.colors.map((color, index) => (
                    <View key={index} style={[styles.colorDot, { backgroundColor: color }]} />
                  ))}
                </View>
                <Text style={styles.favoriteDate}>Created {favorite.createdAt}</Text>
              </View>

              <View style={styles.favoriteActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Share size={20} color="#E91E63" strokeWidth={2} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Download size={20} color="#E91E63" strokeWidth={2} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => removeFavorite(favorite.id)}
                >
                  <Trash2 size={20} color="#ff4444" strokeWidth={2} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
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
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: 'white',
    marginTop: 10,
  },
  headerSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: 100,
  },
  emptyStateTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#666',
    marginTop: 20,
  },
  emptyStateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
  favoriteCard: {
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
  transformationImage: {
    height: 120,
    borderRadius: 10,
  },
  favoriteInfo: {
    marginBottom: 15,
  },
  favoritePrompt: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 10,
  },
  colorPalette: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  favoriteDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#999',
  },
  favoriteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: 8,
    marginLeft: 10,
  },
});