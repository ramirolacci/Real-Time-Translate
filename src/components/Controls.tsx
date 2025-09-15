import React from 'react';
import { 
  Mic, 
  MicOff, 
  Settings, 
  Volume2,
  ArrowRightLeft,
  Key,
  Languages
} from 'lucide-react';
import { AudioSettings } from '../types/Translation';

interface ControlsProps {
  audioSettings: AudioSettings;
  onToggleListening: () => void;
  onVolumeChange: (volume: number) => void;
  onLanguageSwap: () => void;
  isSupported: boolean;
  hasPermission: boolean;
  onRequestPermission: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  audioSettings,
  onToggleListening,
  onVolumeChange,
  onLanguageSwap,
  isSupported,
  hasPermission,
  onRequestPermission
}) => {
  const getLanguageName = (code: string) => {
    const names = { es: 'Español', en: 'English', auto: 'Auto' };
    return names[code as keyof typeof names] || code;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Controles
        </h3>
        
        <div className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-lg text-sm">
          <Languages className="w-4 h-4" />
          Traducción Gratuita
        </div>
      </div>

      {/* Control principal de micrófono */}
      <div className="flex items-center justify-center">
        <button
          onClick={onToggleListening}
          disabled={!isSupported}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
            audioSettings.isListening
              ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30'
              : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30'
          } ${!isSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {audioSettings.isListening ? (
            <MicOff className="w-8 h-8 text-white" />
          ) : (
            <Mic className="w-8 h-8 text-white" />
          )}
        </button>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-400">
          {!isSupported 
            ? 'Reconocimiento de voz no soportado. Usa Chrome, Edge o Safari.'
            : !hasPermission
            ? 'Se necesitan permisos de micrófono'
            : audioSettings.isListening 
            ? 'Escuchando...' 
            : 'Click para empezar a escuchar'
          }
        </p>
      </div>

      {/* Botón para solicitar permisos */}
      {isSupported && !hasPermission && (
        <div className="text-center">
          <button
            onClick={onRequestPermission}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm"
          >
            Permitir Micrófono
          </button>
        </div>
      )}

      {/* Información del servicio gratuito */}
      <div className="bg-green-900 border border-green-600 rounded-lg p-3">
        <p className="text-green-200 text-xs">
          <strong>Traducción Gratuita:</strong><br/>
          • Calidad profesional con Google Translate<br/>
          • Sin límites ni configuración<br/>
          • Funciona completamente offline como respaldo<br/>
          • Listo para usar inmediatamente
        </p>
      </div>

      {/* Información del navegador */}
      {!isSupported && (
        <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-3">
          <p className="text-yellow-200 text-xs">
            <strong>Navegadores compatibles:</strong><br/>
            • Chrome (recomendado)<br/>
            • Microsoft Edge<br/>
            • Safari (macOS/iOS)<br/>
            • Opera
          </p>
        </div>
      )}

      {/* Control de volumen */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-white">
          <Volume2 className="w-4 h-4" />
          <span className="text-sm">Volumen: {Math.round(audioSettings.volume * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={audioSettings.volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

      {/* Selector de idiomas */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Idiomas:</span>
          <button
            onClick={onLanguageSwap}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title="Intercambiar idiomas"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className={`px-2 py-1 rounded ${
            audioSettings.sourceLanguage === 'es' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
          }`}>
            {getLanguageName(audioSettings.sourceLanguage)}
          </span>
          <ArrowRightLeft className="w-4 h-4 text-gray-400" />
          <span className={`px-2 py-1 rounded ${
            audioSettings.targetLanguage === 'en' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
          }`}>
            {getLanguageName(audioSettings.targetLanguage)}
          </span>
        </div>
      </div>
    </div>
  );
};