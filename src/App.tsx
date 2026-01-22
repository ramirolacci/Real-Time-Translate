import React, { useState, useCallback, useRef } from 'react';
import { TranslationEntry, AudioSettings, SpeechRecognitionResult } from './types/Translation';
import { TranslationService } from './services/TranslationService';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { TranslationDisplay } from './components/TranslationDisplay';
import { Controls } from './components/Controls';
import { StatusBar } from './components/StatusBar';
import { Sparkles } from 'lucide-react';

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
      try {
        const detectedLanguage = audioSettings.sourceLanguage === 'auto'
          ? translationService.current.detectLanguage(result.text)
          : audioSettings.sourceLanguage as 'es' | 'en';

        const targetLang = detectedLanguage === 'es' ? 'en' : 'es';

        const translatedText = await translationService.current.translateText(
          result.text,
          detectedLanguage,
          targetLang
        );

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

        // TTS Logic
        try {
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(translatedText);
            const langCode = targetLang === 'es' ? 'es-ES' : 'en-US';
            utterance.lang = langCode;
            utterance.volume = Math.min(Math.max(audioSettings.volume, 0), 1);

            const pickVoice = () => {
              const voices = window.speechSynthesis.getVoices();
              const match = voices.find(v => v.lang?.toLowerCase().startsWith(langCode.toLowerCase()));
              if (match) utterance.voice = match;
            };

            if (window.speechSynthesis.getVoices().length === 0) {
              window.speechSynthesis.onvoiceschanged = () => {
                pickVoice();
                window.speechSynthesis.speak(utterance);
                window.speechSynthesis.onvoiceschanged = null;
              };
            } else {
              pickVoice();
              window.speechSynthesis.speak(utterance);
            }
          }
        } catch (ttsError) {
          console.warn('Error al reproducir TTS:', ttsError);
        }

        currentTextRef.current = '';
        setCurrentText('');
      } catch (error) {
        console.error('Translation error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido al traducir';
        setError(errorMessage);
      }
    } else {
      currentTextRef.current = result.text;
      setCurrentText(result.text);

      if (translationTimeoutRef.current) {
        clearTimeout(translationTimeoutRef.current);
      }

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
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-violet-600/20 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-slate-800/20 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <header className="px-8 py-5 flex items-center justify-between border-b border-white/5 glass bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
                Nexus Translate
              </h1>
              <p className="text-xs text-slate-400 font-medium">Real-time AI Interpretation</p>
            </div>
          </div>

          <button
            onClick={clearTranslations}
            disabled={translations.length === 0}
            className="px-4 py-2 text-xs font-semibold tracking-wide text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent"
          >
            CLEAR HISTORY
          </button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          {/* Main Translation View */}
          <div className="flex-1 p-4 lg:p-8 overflow-y-auto lg:overflow-hidden flex flex-col order-2 lg:order-1 h-full">
            <TranslationDisplay
              translations={translations}
              currentText={currentText}
              isListening={isListening}
              onLanguageSwap={handleLanguageSwap}
              sourceLanguage={audioSettings.sourceLanguage}
              targetLanguage={audioSettings.targetLanguage}
            />
          </div>

          {/* Right Sidebar Controls */}
          <div className="w-full lg:w-96 border-b lg:border-b-0 lg:border-l border-white/5 bg-slate-900/30 backdrop-blur-sm p-6 lg:p-8 flex flex-col gap-8 order-1 lg:order-2 z-20">
            <Controls
              audioSettings={audioSettings}
              onToggleListening={handleToggleListening}
              onVolumeChange={handleVolumeChange}
              onLanguageSwap={handleLanguageSwap}
              isSupported={isSupported}
              hasPermission={hasPermission}
              onRequestPermission={requestMicrophonePermission}
            />
          </div>
        </main>

        {/* Status Bar */}
        <StatusBar
          isListening={isListening}
          isConnected={isSupported}
          error={error}
          translationsCount={translations.length}
        />
      </div>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-red-500/10 border border-red-500/50 text-red-200 px-6 py-3 rounded-xl backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            {error}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;