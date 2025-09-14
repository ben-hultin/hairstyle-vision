import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as FileSystem from 'expo-file-system';
import { GenerationRequest, GenerationResponse } from '@/types';
import { hairStyles } from './HairStyleSelector';

class GeminiService {
  private apiKey: string | null = null;

  async setApiKey(key: string) {
    this.apiKey = key;
    await AsyncStorage.setItem('gemini_api_key', key);
  }

  async getApiKey(): Promise<string | null> {
    if (this.apiKey) return this.apiKey;

    // First try to get from environment variable
    const envApiKey = Constants.expoConfig?.extra?.GEMINI_API_KEY;
    if (envApiKey) {
      this.apiKey = envApiKey;
      return envApiKey;
    }

    // Fallback to AsyncStorage
    const stored = await AsyncStorage.getItem('gemini_api_key');
    this.apiKey = stored;
    return stored;
  }

  async generateHairAnalysis({
    imageUri,
    prompt,
    colors,
    hairStyle,
  }: GenerationRequest): Promise<{
    analysis: string;
    success: boolean;
    error?: string;
  }> {
    try {
      const apiKey = await this.getApiKey();
      if (!apiKey) {
        return {
          analysis: '',
          success: false,
          error: 'API key not found. Please set your Gemini API key.',
        };
      }

      const genAI = new GoogleGenerativeAI(apiKey);

      // Convert image to base64
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Create a detailed prompt incorporating the reference image, colors, and user input
      const colorNames = this.getColorNames(colors);
      const enhancedPrompt = this.createEnhancedPrompt(
        prompt,
        colorNames,
        hairStyle
      );

      // Get analysis from Gemini 1.5 Flash
      const analysisModel = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
      });

      const analysisResult = await analysisModel.generateContent([
        {
          inlineData: {
            data: base64Image,
            mimeType: 'image/jpeg',
          },
        },
        {
          text: enhancedPrompt,
        },
      ]);

      const analysisResponse = analysisResult.response;
      const analysisText = analysisResponse.text();

      return {
        analysis: analysisText,
        success: true,
      };
    } catch (error) {
      console.error('Gemini Analysis Error:', error);
      return {
        analysis: '',
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate analysis',
      };
    }
  }

  async generateHairTransformation({
    imageUri,
    prompt,
    colors,
    hairStyle,
  }: GenerationRequest): Promise<GenerationResponse> {
    try {
      const apiKey = await this.getApiKey();
      if (!apiKey) {
        return {
          imageUrl: '',
          success: false,
          error: 'API key not found. Please set your Gemini API key.',
        };
      }

      const genAI = new GoogleGenerativeAI(apiKey);

      // Convert image to base64
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Get hair analysis first using the standalone function
      const analysisResult = await this.generateHairAnalysis({
        imageUri,
        prompt,
        colors,
        hairStyle,
      });

      if (!analysisResult.success) {
        return {
          imageUrl: '',
          success: false,
          error: analysisResult.error || 'Failed to generate analysis',
        };
      }

      // Create image generation prompt
      const colorNames = this.getColorNames(colors);
      const imageGenerationPrompt = this.createImageGenerationPrompt(
        prompt,
        colorNames,
        analysisResult.analysis,
        hairStyle
      );

      // Generate the transformed image using Gemini 2.5 Flash Image Preview
      const imageModel = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash-image-preview',
      });

      const imageResult = await imageModel.generateContent([
        { text: imageGenerationPrompt },
        {
          inlineData: {
            data: base64Image,
            mimeType: 'image/jpeg',
          },
        },
      ]);

      const imageResponse = imageResult.response;

      // Extract the generated image URL from the response
      let generatedImageUrl = '';
      const parts = imageResponse.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData?.data) {
            generatedImageUrl = `data:image/jpeg;base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      // If no image was generated, fall back to original image
      if (!generatedImageUrl) {
        generatedImageUrl = imageUri;
      }

      return {
        imageUrl: generatedImageUrl,
        success: true,
        metadata: {
          prompt: this.createEnhancedPrompt(prompt, colorNames, hairStyle),
          colors: colors,
          analysis: analysisResult.analysis,
        },
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      return {
        imageUrl: '',
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate transformation',
      };
    }
  }

  private getColorNames(colors: string[]): string[] {
    const colorMap: { [key: string]: string } = {
      '#F5DEB3': 'platinum blonde',
      '#E6D690': 'ash blonde',
      '#D4C47A': 'golden blonde',
      '#C4B454': 'honey blonde',
      '#8B4513': 'light brown',
      '#654321': 'medium brown',
      '#4A2C2A': 'dark brown',
      '#3D1A00': 'espresso brown',
      '#A0522D': 'auburn',
      '#D2691E': 'copper',
      '#B22222': 'cherry red',
      '#8B0000': 'burgundy',
      '#E8B4B8': 'rose gold',
      '#C8A8E8': 'lavender',
      '#98E4D6': 'mint',
      '#FFCBA4': 'peachy pink',
      '#00CED1': 'electric blue',
      '#FF69B4': 'hot pink',
      '#9370DB': 'purple',
      '#32CD32': 'neon green',
    };

    return colors.map((color) => colorMap[color] || color);
  }

  private createEnhancedPrompt(
    userPrompt: string,
    colorNames: string[],
    hairStyleId?: string
  ): string {
    const colorDescription =
      colorNames.length > 0
        ? `using the following hair colors: ${colorNames.join(', ')}`
        : '';

    const selectedHairStyle = hairStyleId
      ? hairStyles.find((style) => style.id === hairStyleId)
      : null;

    const styleDescription = selectedHairStyle
      ? `Hair Style Technique: ${selectedHairStyle.name} - ${selectedHairStyle.description}`
      : '';

    return `Analyze this reference photo and provide detailed hair transformation suggestions. 

Reference Image: This is the person whose hair we want to transform.

User Request: "${userPrompt}"

Color Palette: ${colorDescription}

${styleDescription}

Please provide:
1. A detailed description of how the hair transformation should look
2. Specific styling techniques that would work best (especially ${
      selectedHairStyle?.name || 'the requested technique'
    })
3. Color placement and blending suggestions
4. Any additional styling recommendations

Focus on creating a natural, flattering look that complements the person's features and skin tone.`;
  }

  private createImageGenerationPrompt(
    userPrompt: string,
    colorNames: string[],
    analysisText: string,
    hairStyleId?: string
  ): string {
    const colorDescription =
      colorNames.length > 0 ? `to ${colorNames.join(', ')} hair colors` : '';

    const selectedHairStyle = hairStyleId
      ? hairStyles.find((style) => style.id === hairStyleId)
      : null;

    const styleInstructions = selectedHairStyle
      ? `Apply ${selectedHairStyle.name} technique: ${selectedHairStyle.description}`
      : '';

    const techniqueDescription = selectedHairStyle
      ? ` using ${selectedHairStyle.name} technique`
      : '';

    return `Using the provided reference image, modify ONLY the hair color ${colorDescription}${techniqueDescription}. 

CRITICAL REQUIREMENTS:
- Keep the EXACT same person, facial features, and appearance from the reference image
- Keep the EXACT same background, lighting, and composition
- Keep the EXACT same pose, clothing, and accessories
- ONLY change the hair color to match: ${colorDescription}
- ${styleInstructions}
- Maintain the same hair length and texture as in the reference
- Preserve all facial features, skin tone, and expressions
- The result should look like the exact same person with only hair color changed

Style: ${userPrompt}

Generate an image that is identical to the reference but with the hair color professionally transformed using the specified technique.`;
  }
}

export const geminiService = new GeminiService();
