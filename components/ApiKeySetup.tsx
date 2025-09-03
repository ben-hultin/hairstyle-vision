import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Key, X, ExternalLink } from 'lucide-react-native';
import { geminiService } from './GeminiService';

interface ApiKeySetupProps {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function ApiKeySetup({ visible, onClose, onSaved }: ApiKeySetupProps) {
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter your Gemini API key');
      return;
    }

    setSaving(true);
    try {
      await geminiService.setApiKey(apiKey.trim());
      onSaved();
      onClose();
      Alert.alert('Success', 'API key saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save API key. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <LinearGradient
          colors={['#E91E63', '#9C27B0']}
          style={styles.header}
        >
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="white" strokeWidth={2} />
          </TouchableOpacity>
          <Key size={32} color="white" strokeWidth={2} />
          <Text style={styles.headerTitle}>Setup Gemini API</Text>
          <Text style={styles.headerSubtitle}>Configure your AI image generation</Text>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>Get your API key:</Text>
            <Text style={styles.instructionStep}>
              1. Visit Google AI Studio
            </Text>
            <Text style={styles.instructionStep}>
              2. Sign in with your Google account
            </Text>
            <Text style={styles.instructionStep}>
              3. Create a new API key
            </Text>
            <Text style={styles.instructionStep}>
              4. Copy and paste it below
            </Text>
            
            <TouchableOpacity style={styles.linkButton}>
              <ExternalLink size={16} color="#E91E63" strokeWidth={2} />
              <Text style={styles.linkText}>Open Google AI Studio</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Gemini API Key</Text>
            <TextInput
              style={styles.input}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="Enter your Gemini API key"
              placeholderTextColor="#999"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, (!apiKey.trim() || saving) && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!apiKey.trim() || saving}
          >
            <LinearGradient
              colors={(!apiKey.trim() || saving) ? ['#ccc', '#999'] : ['#E91E63', '#9C27B0']}
              style={styles.saveGradient}
            >
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Save API Key'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    padding: 8,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: 'white',
    marginTop: 10,
  },
  headerSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  instructionsCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  instructionsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 15,
  },
  instructionStep: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    padding: 10,
    backgroundColor: '#fce4ec',
    borderRadius: 10,
  },
  linkText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#E91E63',
    marginLeft: 8,
  },
  inputSection: {
    marginBottom: 30,
  },
  inputLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 10,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 15,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#1a1a1a',
  },
  saveButton: {
    borderRadius: 25,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveGradient: {
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: 'white',
  },
});