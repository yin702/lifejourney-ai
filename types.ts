export interface TimelineSlot {
  age: number;
  image: string | null; // Base64 data or URL
  isGenerated: boolean;
  isLoading: boolean;
  error?: string;
}

export enum GeminiModel {
  FLASH_IMAGE = 'gemini-2.5-flash-image',
  PRO_IMAGE = 'gemini-3-pro-image-preview',
}

export interface AppConfig {
  currentAge: number;
  selectedModel: GeminiModel;
  isMusicPlaying: boolean;
}