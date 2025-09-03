import AsyncStorage from '@react-native-async-storage/async-storage';

interface GenerationRequest {
  imageUri: string;
  prompt: string;
  colors: string[];
}

interface GenerationResponse {
  imageUrl: string;
  success: boolean;
  error?: string;
}

class GeminiService {
  private apiKey: string | null = null;

  async setApiKey(key: string) {
    this.apiKey = key;
    await AsyncStorage.setItem('gemini_api_key', key);
  }

  async getApiKey(): Promise<string | null> {
    if (this.apiKey) return this.apiKey;
    
    const stored = await AsyncStorage.getItem('gemini_api_key');
    this.apiKey = stored;
    return stored;
  }

  async generateHairTransformation({
    imageUri,
    prompt,
    colors,
  }: GenerationRequest): Promise<GenerationResponse> {
    try {
      // Simulate API processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, return a mock transformation result
      // In a real implementation, this would call the actual Gemini API
      const mockTransformedImages = [
        'https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg',
        'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg',
        'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg',
        'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
      ];
      
      const randomImage = mockTransformedImages[Math.floor(Math.random() * mockTransformedImages.length)];

      return {
        imageUrl: randomImage,
        success: true,
      };
    } catch (error) {
      return {
        imageUrl: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}

export const geminiService = new GeminiService();