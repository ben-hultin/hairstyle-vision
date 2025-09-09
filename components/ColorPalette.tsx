import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Check } from 'lucide-react-native';

interface ColorPaletteProps {
  selectedColors: string[];
  onColorSelect: (colors: string[]) => void;
}

const hairColors = [
  // Natural Blondes
  { name: 'Platinum', hex: '#F5DEB3', category: 'Blonde' },
  { name: 'Ash Blonde', hex: '#E6D690', category: 'Blonde' },
  { name: 'Golden Blonde', hex: '#D4C47A', category: 'Blonde' },
  { name: 'Honey Blonde', hex: '#C4B454', category: 'Blonde' },

  // Natural Browns
  { name: 'Light Brown', hex: '#8B4513', category: 'Brown' },
  { name: 'Medium Brown', hex: '#654321', category: 'Brown' },
  { name: 'Dark Brown', hex: '#4A2C2A', category: 'Brown' },
  { name: 'Espresso', hex: '#3D1A00', category: 'Brown' },

  // Reds
  { name: 'Auburn', hex: '#A0522D', category: 'Red' },
  { name: 'Copper', hex: '#D2691E', category: 'Red' },
  { name: 'Cherry Red', hex: '#B22222', category: 'Red' },
  { name: 'Burgundy', hex: '#8B0000', category: 'Red' },

  // Fashion Colors
  { name: 'Rose Gold', hex: '#E8B4B8', category: 'Fashion' },
  { name: 'Lavender', hex: '#C8A8E8', category: 'Fashion' },
  { name: 'Mint', hex: '#98E4D6', category: 'Fashion' },
  { name: 'Peachy Pink', hex: '#FFCBA4', category: 'Fashion' },

  // Bold Colors
  { name: 'Electric Blue', hex: '#00CED1', category: 'Bold' },
  { name: 'Hot Pink', hex: '#FF69B4', category: 'Bold' },
  { name: 'Purple', hex: '#9370DB', category: 'Bold' },
  { name: 'Neon Green', hex: '#32CD32', category: 'Bold' },
];

export function ColorPalette({
  selectedColors,
  onColorSelect,
}: ColorPaletteProps) {
  const toggleColor = (hex: string) => {
    if (selectedColors.includes(hex)) {
      onColorSelect(selectedColors.filter((color) => color !== hex));
    } else if (selectedColors.length < 3) {
      onColorSelect([...selectedColors, hex]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instructions}>
        Select up to 3 colors for your transformation
      </Text>
      <ScrollView
        style={styles.colorGrid}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled={true}
      >
        <View style={styles.colorRows}>
          {hairColors.map((color) => (
            <TouchableOpacity
              key={color.hex}
              style={[
                styles.colorItem,
                selectedColors.includes(color.hex) && styles.selectedColorItem,
              ]}
              onPress={() => toggleColor(color.hex)}
            >
              <View
                style={[styles.colorSwatch, { backgroundColor: color.hex }]}
              >
                {selectedColors.includes(color.hex) && (
                  <Check size={16} color="white" strokeWidth={3} />
                )}
              </View>
              <Text style={styles.colorName}>{color.name}</Text>
              <Text style={styles.colorCategory}>{color.category}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {selectedColors.length > 0 && (
        <View style={styles.selectedColorsContainer}>
          <Text style={styles.selectedTitle}>
            Selected Colors ({selectedColors.length}/3)
          </Text>
          <View style={styles.selectedColors}>
            {selectedColors.map((color, index) => (
              <TouchableOpacity
                key={index}
                style={styles.selectedColor}
                onPress={() => toggleColor(color)}
              >
                <View
                  style={[
                    styles.selectedColorSwatch,
                    { backgroundColor: color },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  instructions: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  colorGrid: {
    maxHeight: 300,
  },
  scrollContent: {
    flexGrow: 1,
  },
  colorRows: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  colorItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#f8f9fa',
  },
  selectedColorItem: {
    backgroundColor: '#fce4ec',
    borderWidth: 2,
    borderColor: '#E91E63',
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#1a1a1a',
    textAlign: 'center',
  },
  colorCategory: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  selectedColorsContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  selectedTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#1a1a1a',
    marginBottom: 10,
  },
  selectedColors: {
    flexDirection: 'row',
  },
  selectedColor: {
    marginRight: 10,
  },
  selectedColorSwatch: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    borderWidth: 2,
    borderColor: '#E91E63',
  },
});
