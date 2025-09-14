import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Check } from 'lucide-react-native';

interface HairStyleSelectorProps {
  selectedHairStyle: string | null;
  onHairStyleSelect: (style: string | null) => void;
}

export const hairStyles = [
  {
    id: 'balayage',
    name: 'Balayage Highlights',
    description: 'Soft, hand-painted highlights',
  },
  {
    id: 'foiled',
    name: 'Foiled Highlights',
    description:
      'Traditional method for more defined and evenly distributed highlights',
  },
  {
    id: 'ombre',
    name: 'Ombre Highlights',
    description: 'A gradual transition from one color to another',
  },
  {
    id: 'alternating',
    name: 'Alternating Highlights',
    description:
      'A mix of two or more colors, often created with foils, for a multi-dimensional look',
  },
  {
    id: 'solid',
    name: 'Solid Color Hair Dye',
    description: 'Hair colored uniformly in a single color',
  },
  {
    id: 'peekaboo',
    name: 'Peek-a-Boo Highlights',
    description: "A hidden layer of color that's revealed when the hair moves",
  },
];

export const HairStyleSelector = ({
  selectedHairStyle,
  onHairStyleSelect,
}: HairStyleSelectorProps) => {
  const toggleStyle = (styleId: string) => {
    if (selectedHairStyle === styleId) {
      onHairStyleSelect(null);
    } else {
      onHairStyleSelect(styleId);
    }
  };

  const selectedStyleData = hairStyles.find(
    (style) => style.id === selectedHairStyle
  );

  return (
    <View style={styles.container}>
      <Text style={styles.instructions}>Select a hair style technique</Text>
      <ScrollView
        style={styles.styleGrid}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled={true}
      >
        <View style={styles.styleRows}>
          {hairStyles.map((style) => (
            <TouchableOpacity
              key={style.id}
              style={[
                styles.styleItem,
                selectedHairStyle === style.id && styles.selectedStyleItem,
              ]}
              onPress={() => toggleStyle(style.id)}
            >
              <Text
                style={[
                  styles.styleName,
                  selectedHairStyle === style.id && styles.selectedStyleName,
                ]}
              >
                {style.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {selectedStyleData && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>{selectedStyleData.name}</Text>
          <Text style={styles.descriptionText}>
            {selectedStyleData.description}
          </Text>
        </View>
      )}
    </View>
  );
};

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
  styleGrid: {
    maxHeight: 300,
  },
  scrollContent: {
    flexGrow: 1,
  },
  styleRows: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  styleItem: {
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedStyleItem: {
    backgroundColor: '#fce4ec',
    borderColor: '#E91E63',
  },
  checkContainer: {
    height: 24,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  styleName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#1a1a1a',
    textAlign: 'center',
    lineHeight: 16,
  },
  selectedStyleName: {
    color: '#E91E63',
  },
  descriptionContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  descriptionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  descriptionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
