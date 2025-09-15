export interface TranslationEntry {
  id: string;
  originalText: string;
  translatedText: string;
  sourceLanguage: 'es' | 'en';
  targetLanguage: 'es' | 'en';
  timestamp: Date;
  confidence: number;
}

export interface AudioSettings {
  isListening: boolean;
  volume: number;
  sourceLanguage: 'es' | 'en' | 'auto';
  targetLanguage: 'es' | 'en';
}

export interface SpeechRecognitionResult {
  text: string;
  confidence: number;
  isFinal: boolean;
}