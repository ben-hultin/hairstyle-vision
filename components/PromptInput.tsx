import React, { forwardRef } from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { Sparkles } from 'lucide-react-native';

interface PromptInputProps {
  readonly value: string;
  readonly onChangeText: (text: string) => void;
  readonly placeholder: string;
}

export const PromptInput = forwardRef<TextInput, PromptInputProps>(
  ({ value, onChangeText, placeholder }, ref) => {
    return (
      <View style={styles.container}>
        <View style={styles.inputHeader}>
          <Sparkles size={20} color="#E91E63" strokeWidth={2} />
          <Text style={styles.inputLabel}>Style Description</Text>
        </View>
        <TextInput
          ref={ref}
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          returnKeyType="done"
        />
        <Text style={styles.helperText}>
          Be specific about placement, intensity, and style for best results
        </Text>
      </View>
    );
  }
);

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
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  inputLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1a1a1a',
    marginLeft: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 15,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#1a1a1a',
    minHeight: 100,
    backgroundColor: '#f8f9fa',
  },
  helperText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#666',
    marginTop: 10,
    lineHeight: 16,
  },
});
