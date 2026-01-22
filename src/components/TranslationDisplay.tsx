import React, { useEffect, useRef } from 'react';
import { TranslationEntry } from '../types/Translation';
import { Languages, ArrowRightLeft, Sparkles } from 'lucide-react';

interface TranslationDisplayProps {
  translations: TranslationEntry[];
  currentText: string;
  isListening: boolean;
  onLanguageSwap: () => void;
  sourceLanguage: 'es' | 'en' | 'auto';
  targetLanguage: 'es' | 'en';
}

export const TranslationDisplay: React.FC<TranslationDisplayProps> = ({
  translations,
  currentText,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isListening,
  onLanguageSwap,
  sourceLanguage,
  targetLanguage
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [translations, currentText]);

  const getLanguageName = (code: string) => {
    const names: Record<string, string> = { es: 'Spanish', en: 'English', auto: 'Auto Detect' };
    return names[code] || code.toUpperCase();
  };

  const getFlag = (code: string) => {
    if (code === 'es') return '🇪🇸';
    if (code === 'en') return '🇺🇸';
    return '🌐';
  };

  return (
    <div className="flex-1 flex flex-col gap-6 h-full">
      {/* Header with Language Swap */}
      <div className="flex items-center justify-between p-1">
        <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-2xl border border-white/5 mx-auto glass">
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 text-slate-200 min-w-[140px] justify-center transition-colors">
            <span className="text-xl">{getFlag(sourceLanguage)}</span>
            <span className="font-medium text-sm tracking-wide">{getLanguageName(sourceLanguage)}</span>
          </div>

          <button
            onClick={onLanguageSwap}
            className="p-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95 group"
          >
            <ArrowRightLeft className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
          </button>

          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 min-w-[140px] justify-center">
            <span className="text-xl">{getFlag(targetLanguage)}</span>
            <span className="font-medium text-sm tracking-wide">{getLanguageName(targetLanguage)}</span>
          </div>
        </div>
      </div>

      {/* Translations Area */}
      <div className="flex-1 overflow-y-auto px-4 custom-scrollbar" ref={scrollRef}>
        <div className="space-y-6 pb-4">
          {/* Live Transcription */}
          {currentText && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="glass p-6 rounded-2xl border-l-4 border-l-indigo-500 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-50">
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-medium uppercase tracking-wider animate-pulse">
                    <Sparkles className="w-3 h-3" />
                    Transcribing...
                  </div>
                </div>
                <p className="text-2xl text-white font-light leading-relaxed tracking-wide">
                  {currentText}
                </p>
              </div>
            </div>
          )}

          {/* History */}
          <div className="flex flex-col-reverse gap-6">
            {translations.map((entry) => (
              <div key={entry.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {/* Source */}
                <div className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-2 mb-2 opacity-50">
                    <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">{entry.sourceLanguage}</span>
                  </div>
                  <p className="text-lg text-slate-300 font-light leading-relaxed opacity-90">{entry.originalText}</p>
                </div>

                {/* Target */}
                <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 hover:border-indigo-500/20 transition-colors relative group">
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Languages className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="flex items-center gap-2 mb-2 opacity-50">
                    <span className="text-xs uppercase tracking-wider font-semibold text-indigo-300">{entry.targetLanguage}</span>
                  </div>
                  <p className="text-xl text-indigo-100 font-light leading-relaxed">{entry.translatedText}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
