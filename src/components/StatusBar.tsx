import React from 'react';
import { Wifi, WifiOff, AlertCircle, CheckCircle, Mic } from 'lucide-react';

interface StatusBarProps {
  isListening: boolean;
  isConnected: boolean;
  error: string | null;
  translationsCount: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  isListening,
  isConnected,
  error,
  translationsCount
}) => {
  return (
    <div className="bg-gray-900 px-4 py-2 flex items-center justify-between text-sm">
      <div className="flex items-center gap-4">
        {/* Estado del micrófono */}
        <div className="flex items-center gap-2">
          <Mic className={`w-4 h-4 ${isListening ? 'text-red-400' : 'text-gray-500'}`} />
          <span className="text-gray-300">
            {isListening ? 'Escuchando' : 'Inactivo'}
          </span>
        </div>

        {/* Estado de conexión */}
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Wifi className="w-4 h-4 text-green-400" />
              <span className="text-gray-300">Conectado</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-red-400" />
              <span className="text-gray-300">Desconectado</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Contador de traducciones */}
        <span className="text-gray-300">
          Traducciones: {translationsCount}
        </span>

        {/* Estado general */}
        <div className="flex items-center gap-2">
          {error ? (
            <>
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-400" title={error}>Error</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-green-400">Listo</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};