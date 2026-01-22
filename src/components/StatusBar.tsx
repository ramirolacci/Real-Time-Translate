import React from 'react';
import { Wifi, WifiOff, AlertCircle, CheckCircle2, Activity } from 'lucide-react';

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
    <div className="border-t border-white/5 bg-slate-900/50 backdrop-blur-md px-8 py-3 flex items-center justify-between text-xs font-medium text-slate-400 select-none">
      <div className="flex items-center gap-6">
        {/* Status */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-indigo-500 animate-pulse' : 'bg-slate-700'}`}></div>
          <span className={isListening ? 'text-indigo-300' : 'text-slate-500'}>
            {isListening ? 'Microphone Active' : 'Standby'}
          </span>
        </div>

        {/* Connection */}
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Wifi className="w-3 h-3 text-emerald-500" />
              <span className="text-emerald-500/80">System Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-red-500" />
              <span className="text-red-500/80">Connection Lost</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Stats */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5">
          <Activity className="w-3 h-3 text-indigo-400" />
          <span className="text-indigo-200">{translationsCount} Translations</span>
        </div>

        {/* Health */}
        <div className="flex items-center gap-2">
          {error ? (
            <>
              <AlertCircle className="w-3 h-3 text-red-400" />
              <span className="text-red-400 truncate max-w-[200px]" title={error}>System Error</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span className="text-emerald-500/80">All Systems Operational</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};