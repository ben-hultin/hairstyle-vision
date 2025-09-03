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
import { Palette, Star } from 'lucide-react-native';


interface ColorCategory {
  id: string;
  name: string;
  colors: string[];
}

const colorCategories: ColorCategory[] = [
  {
    id: 'blondes',
    name: 'Blondes',
    colors: ['#F5DEB3', '#E6D690', '#D4C47A', '#C4B454', '#B8A642', '#A0943D'],
  },
  {
    id: 'brunettes',
    name: 'Brunettes',
    colors: ['#8B4513', '#654321', '#4A2C2A', '#3D1A00', '#2F1506', '#1C0F0A'],
  },
  {
    id: 'reds',
    name: 'Reds',
    colors: ['#CD853F', '#B22222', '#8B0000', '#A0522D', '#D2691E', '#FF6347'],
  },
  {
    id: 'fantasy',
    name: 'Fantasy',
    colors: ['#FF69B4', '#9370DB', '#00CED1', '#32CD32', '#FF4500', '#FFD700'],
  },
  {
    id: 'pastels',
    name: 'Pastels',
    colors: ['#F0E6FF', '#FFE6F0', '#E6F0FF', '#F0FFE6', '#FFEFE6', '#FFF0E6'],
  },
];

export default function ColorsScreen() {
  const { width } = useWindowDimensions();
  const [selectedCategory, setSelectedCategory] = useState('blondes');
  const [favoriteColors, setFavoriteColors] = useState<string[]>([]);

  const toggleFavorite = (color: string) => {
    if (favoriteColors.includes(color)) {
      setFavoriteColors(favoriteColors.filter(c => c !== color));
    } else {
      setFavoriteColors([...favoriteColors, color]);
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
        <Palette size={32} color="white" strokeWidth={2} />
        <Text style={styles.headerTitle}>Color Palette</Text>
        <Text style={styles.headerSubtitle}>Professional hair color selection</Text>
      </LinearGradient>

      <View style={styles.content}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryTabs}
          contentContainerStyle={styles.categoryTabsContent}
        >
          {colorCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryTab,
                selectedCategory === category.id && styles.activeCategoryTab,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text
                style={[
                  styles.categoryTabText,
                  selectedCategory === category.id && styles.activeCategoryTabText,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView style={styles.colorGrid} showsVerticalScrollIndicator={false}>
          {colorCategories
            .find(cat => cat.id === selectedCategory)
            ?.colors.map((color, index) => (
              <View key={index} style={styles.colorRow}>
                <View style={styles.colorCard}>
                  <View style={[styles.colorSwatch, { backgroundColor: color }]} />
                  <View style={styles.colorInfo}>
                    <Text style={styles.colorName}>
                      {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} {index + 1}
                    </Text>
                    <Text style={styles.colorCode}>{color.toUpperCase()}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => toggleFavorite(color)}
                  >
                    <Star
                      size={20}
                      color={favoriteColors.includes(color) ? '#FFD700' : '#ccc'}
                      fill={favoriteColors.includes(color) ? '#FFD700' : 'transparent'}
                      strokeWidth={2}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
        </ScrollView>

        {favoriteColors.length > 0 && (
          <View style={styles.favoritesSection}>
            <Text style={styles.favoritesTitle}>Favorites ({favoriteColors.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {favoriteColors.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.favoriteColor}
                  onPress={() => toggleFavorite(color)}
                >
                  <View style={[styles.favoriteColorSwatch, { backgroundColor: color }]} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
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
  },
  categoryTabs: {
    marginTop: 20,
    maxHeight: 50,
  },
  categoryTabsContent: {
    paddingRight: 20,
  },
  categoryTab: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeCategoryTab: {
    backgroundColor: '#E91E63',
  },
  categoryTabText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#666',
  },
  activeCategoryTabText: {
    color: 'white',
  },
  colorGrid: {
    marginTop: 20,
    flex: 1,
  },
  colorRow: {
    marginBottom: 15,
  },
  colorCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  colorSwatch: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  colorInfo: {
    flex: 1,
  },
  colorName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1a1a1a',
  },
  colorCode: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  favoriteButton: {
    padding: 8,
  },
  favoritesSection: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  favoritesTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 15,
  },
  favoriteColor: {
    marginRight: 10,
  },
  favoriteColorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
});