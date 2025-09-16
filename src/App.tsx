import React, { useState, useCallback, useRef, useEffect } from 'react';
import { TranslationEntry, AudioSettings, SpeechRecognitionResult } from './types/Translation';
import { TranslationService } from './services/TranslationService';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { TranslationDisplay } from './components/TranslationDisplay';
import { Controls } from './components/Controls';
import { StatusBar } from './components/StatusBar';
import { ApiKeyModal } from './components/ApiKeyModal';
import { Languages, Headphones } from 'lucide-react';

function App() {
  const [translations, setTranslations] = useState<TranslationEntry[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    isListening: false,
    volume: 0.8,
    sourceLanguage: 'auto',
    targetLanguage: 'en'
  });

  const translationService = useRef(new TranslationService());
  const currentTextRef = useRef('');
  const translationTimeoutRef = useRef<NodeJS.Timeout>();

  const handleSpeechResult = useCallback(async (result: SpeechRecognitionResult) => {
    setError(null);
    
    if (result.isFinal && result.text.trim()) {
      // Procesar la traducción
      console.log('Processing translation for:', result.text);
      try {
        const detectedLanguage = audioSettings.sourceLanguage === 'auto' 
          ? translationService.current.detectLanguage(result.text)
          : audioSettings.sourceLanguage as 'es' | 'en';
        
        console.log('Detected language:', detectedLanguage);
        
        const targetLang = detectedLanguage === 'es' ? 'en' : 'es';
        console.log('Target language:', targetLang);
        
        const translatedText = await translationService.current.translateText(
          result.text,
          detectedLanguage,
          targetLang
        );
        
        console.log('Translation result:', translatedText);

        const newEntry: TranslationEntry = {
          id: Date.now().toString(),
          originalText: result.text,
          translatedText,
          sourceLanguage: detectedLanguage,
          targetLanguage: targetLang,
          timestamp: new Date(),
          confidence: result.confidence
        };

        setTranslations(prev => [newEntry, ...prev]);
        // Limpiar texto actual solo después de traducción exitosa
        currentTextRef.current = '';
        setCurrentText('');
      } catch (error) {
        console.error('Translation error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido al traducir';
        
        setError(errorMessage);
        
        // Mantener el texto original visible cuando hay error
        // No limpiar currentText para que el usuario vea qué se transcribió
      }
    } else {
      // Mostrar texto temporal
      currentTextRef.current = result.text;
      setCurrentText(result.text);
      
      // Limpiar timeout anterior y crear uno nuevo
      if (translationTimeoutRef.current) {
        clearTimeout(translationTimeoutRef.current);
      }
      
      // Auto-limpiar texto temporal después de 3 segundos de inactividad
      translationTimeoutRef.current = setTimeout(() => {
        if (currentTextRef.current === result.text) {
          setCurrentText('');
          currentTextRef.current = '';
        }
      }, 3000);
    }
  }, [audioSettings.sourceLanguage]);

  const handleSpeechError = useCallback((error: string) => {
    setError(error);
    setAudioSettings(prev => ({ ...prev, isListening: false }));
  }, []);

  const { isListening, isSupported, hasPermission, startListening, stopListening, requestMicrophonePermission } = useSpeechRecognition({
    language: audioSettings.sourceLanguage === 'auto' ? 'es-ES' : 
              audioSettings.sourceLanguage === 'es' ? 'es-ES' : 'en-US',
    continuous: true,
    onResult: handleSpeechResult,
    onError: handleSpeechError
  });

  const handleToggleListening = useCallback(() => {
    if (!hasPermission) {
      requestMicrophonePermission();
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
    
    setAudioSettings(prev => ({ ...prev, isListening: !isListening }));
  }, [isListening, startListening, stopListening, hasPermission, requestMicrophonePermission]);

  const handleVolumeChange = useCallback((volume: number) => {
    setAudioSettings(prev => ({ ...prev, volume }));
  }, []);

  const handleLanguageSwap = useCallback(() => {
    setAudioSettings(prev => ({
      ...prev,
      sourceLanguage: prev.targetLanguage,
      targetLanguage: prev.sourceLanguage as 'es' | 'en'
    }));
  }, []);

  const clearTranslations = useCallback(() => {
    setTranslations([]);
    setCurrentText('');
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Headphones className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold">Traductor Simultáneo</h1>
              <p className="text-gray-400 text-sm">Traducción gratuita en tiempo real</p>
            </div>
          </div>
          
          <button
            onClick={clearTranslations}
            disabled={translations.length === 0}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-sm"
          >
            Limpiar Historial
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col lg:flex-row min-h-[calc(100vh-140px)]">
        {/* Translation Display */}
        <div className="flex-1 p-6">
          <TranslationDisplay
            translations={translations}
            currentText={currentText}
            isListening={isListening}
            onLanguageSwap={handleLanguageSwap}
            sourceLanguage={audioSettings.sourceLanguage}
            targetLanguage={audioSettings.targetLanguage}
          />
        </div>

        {/* Controls Sidebar */}
        <div className="lg:w-80 p-6">
          <Controls
            audioSettings={audioSettings}
            onToggleListening={handleToggleListening}
            onVolumeChange={handleVolumeChange}
            onLanguageSwap={handleLanguageSwap}
            isSupported={isSupported}
            hasPermission={hasPermission}
            onRequestPermission={requestMicrophonePermission}
          />

          {/* Instrucciones */}
          <div className="mt-6 bg-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <Languages className="w-4 h-4" />
              Instrucciones
            </h3>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Haz clic en el micrófono para empezar</li>
              <li>• Habla en español o inglés</li>
              <li>• La traducción aparecerá automáticamente</li>
              <li>• Funciona completamente gratis</li>
              <li>• Perfecto para reuniones y conversaciones</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Status Bar */}
      <StatusBar
        isListening={isListening}
        isConnected={isSupported}
        error={error}
        translationsCount={translations.length}
      />

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}

export default App;