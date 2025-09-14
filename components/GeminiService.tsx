import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as FileSystem from 'expo-file-system';
import {
  GenerationRequest,
  GenerationResponse,
  HighlightDrawing,
} from '@/types';
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
    highlightDrawing,
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
        hairStyle,
        highlightDrawing
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
    highlightDrawing,
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
        highlightDrawing,
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
        hairStyle,
        highlightDrawing
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
          prompt: this.createEnhancedPrompt(
            prompt,
            colorNames,
            hairStyle,
            highlightDrawing
          ),
          colors: colors,
          analysis: analysisResult.analysis,
          highlightDrawing,
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
    hairStyleId?: string,
    highlightDrawing?: HighlightDrawing
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

    const highlightInstructions =
      this.createHighlightInstructions(highlightDrawing);

    return `Analyze this reference photo and provide detailed hair transformation suggestions. 

Reference Image: This is the person whose hair we want to transform.

User Request: "${userPrompt}"

Color Palette: ${colorDescription}

${styleDescription}

${highlightInstructions}

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
    hairStyleId?: string,
    highlightDrawing?: HighlightDrawing
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

    const highlightInstructions =
      this.createHighlightInstructions(highlightDrawing);
    const highlightDescription = highlightDrawing
      ? ' Apply the custom highlight pattern as specified in the drawing reference.'
      : '';

    return `Using the provided reference image, modify ONLY the hair color ${colorDescription}${techniqueDescription}.${highlightDescription} 

CRITICAL REQUIREMENTS:
- Keep the EXACT same person, facial features, and appearance from the reference image
- Keep the EXACT same background, lighting, and composition
- Keep the EXACT same pose, clothing, and accessories
- ONLY change the hair color to match: ${colorDescription}
- ${styleInstructions}
${highlightInstructions}
- Maintain the same hair length and texture as in the reference
- Preserve all facial features, skin tone, and expressions
- The result should look like the exact same person with only hair color changed

Style: ${userPrompt}

Generate an image that is identical to the reference but with the hair color professionally transformed using the specified technique.`;
  }

  private createHighlightInstructions(
    highlightDrawing?: HighlightDrawing
  ): string {
    if (!highlightDrawing?.strokes?.length) {
      return '';
    }

    const strokeCount = highlightDrawing.strokes.length;
    const uniqueColors = new Set(
      highlightDrawing.strokes.map((stroke) => stroke.color)
    );
    const colorList = Array.from(uniqueColors);

    // Analyze stroke patterns
    const strokeAnalysis = highlightDrawing.strokes.map((stroke) => {
      const pointCount = stroke.points.length;
      const strokeWidth = stroke.width || 10;
      return {
        color: stroke.color,
        length: pointCount,
        thickness: strokeWidth,
        opacity: stroke.opacity || 1,
      };
    });

    // Group strokes by color
    const colorGroups = strokeAnalysis.reduce((groups, stroke) => {
      if (!groups[stroke.color]) {
        groups[stroke.color] = [];
      }
      groups[stroke.color].push(stroke);
      return groups;
    }, {} as Record<string, typeof strokeAnalysis>);

    let instructions = `\n\nCUSTOM HIGHLIGHT PATTERN REFERENCE:
The user has drawn a custom highlight pattern with ${strokeCount} strokes using ${colorList.length} different colors.

HIGHLIGHT PLACEMENT INSTRUCTIONS:`;

    // Add color-specific instructions
    Object.entries(colorGroups).forEach(([color, strokes]) => {
      const totalStrokes = strokes.length;
      const avgThickness =
        strokes.reduce((sum, s) => sum + s.thickness, 0) / totalStrokes;
      const avgOpacity =
        strokes.reduce((sum, s) => sum + s.opacity, 0) / totalStrokes;

      instructions += `\n- Color ${color}: Apply ${totalStrokes} highlight section(s) with medium thickness (${Math.round(
        avgThickness
      )}px brush equivalent) and ${Math.round(avgOpacity * 100)}% opacity`;
    });

    instructions += `\n\nPATTERN GUIDELINES:
- Follow the exact placement and flow indicated by the drawn strokes
- Maintain natural hair growth direction and texture
- Blend highlights seamlessly with base hair color
- Apply colors with the specified intensity and coverage
- Ensure the final result looks professionally done, not painted on`;

    return instructions;
  }
}

export const geminiService = new GeminiService();
