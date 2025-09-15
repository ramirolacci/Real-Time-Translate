import React from 'react';
import { TranslationEntry } from '../types/Translation';
import { Languages, Clock } from 'lucide-react';

interface TranslationDisplayProps {
  translations: TranslationEntry[];
  currentText: string;
  isListening: boolean;
}

export const TranslationDisplay: React.FC<TranslationDisplayProps> = ({
  translations,
  currentText,
  isListening
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-4">
      {/* Texto Original */}
      <div className="flex-1 bg-gray-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3 text-blue-400">
          <Languages className="w-4 h-4" />
          <span className="font-medium">Original</span>
          {isListening && (
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          )}
        </div>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {currentText && (
            <div className="p-3 bg-gray-700 rounded border-l-2 border-blue-500">
              <p className="text-gray-200">{currentText}</p>
              <span className="text-xs text-gray-400">En tiempo real...</span>
            </div>
          )}
          
          {translations.map((entry) => (
            <div key={entry.id} className="p-3 bg-gray-700 rounded">
              <p className="text-gray-200 mb-1">{entry.originalText}</p>
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(entry.timestamp)}
                </span>
                <span>{entry.sourceLanguage.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Texto Traducido */}
      <div className="flex-1 bg-gray-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3 text-green-400">
          <Languages className="w-4 h-4 scale-x-[-1]" />
          <span className="font-medium">Traducido</span>
        </div>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {translations.map((entry) => (
            <div key={entry.id} className="p-3 bg-gray-700 rounded">
              <p className="text-gray-200 mb-1">{entry.translatedText}</p>
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(entry.timestamp)}
                </span>
                <span>{entry.targetLanguage.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};