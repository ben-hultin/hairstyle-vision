export interface TransformationResult {
  id: string;
  originalImage: string;
  generatedImage: string;
  prompt: string;
  colors: string[];
  hairStyle?: string;
  timestamp: string;
  isFavorite?: boolean;
  analysis?: string;
}

export interface ColorOption {
  name: string;
  hex: string;
  category: string;
}

export interface GenerationRequest {
  imageUri: string;
  prompt: string;
  colors: string[];
  hairStyle?: string;
}

export interface GenerationResponse {
  imageUrl: string;
  success: boolean;
  error?: string;
  metadata?: {
    prompt: string;
    colors: string[];
    analysis: string;
  };
}
