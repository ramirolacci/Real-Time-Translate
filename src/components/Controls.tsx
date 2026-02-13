import React from 'react';
import {
  Mic,
  MicOff,
  Settings2,
  Volume2,
  Volume1,
  VolumeX,
  CreditCard
} from 'lucide-react';
import { AudioSettings } from '../types/Translation';

interface ControlsProps {
  audioSettings: AudioSettings;
  isListening: boolean;
  onToggleListening: () => void;
  onVolumeChange: (volume: number) => void;
  onLanguageSwap: () => void;
  isSupported: boolean;
  hasPermission: boolean;
  onRequestPermission: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  audioSettings,
  isListening,
  onToggleListening,
  onVolumeChange,
  isSupported,
  hasPermission,
  onRequestPermission
}) => {

  const getVolumeIcon = () => {
    if (audioSettings.volume === 0) return <VolumeX className="w-5 h-5" />;
    if (audioSettings.volume < 0.5) return <Volume1 className="w-5 h-5" />;
    return <Volume2 className="w-5 h-5" />;
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Main Action Card */}
      <div className="glass p-8 rounded-3xl flex flex-col items-center gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none"></div>

        <div className="text-center space-y-2 relative z-10">
          <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Voice Interface
          </h3>
          <p className="text-sm text-slate-400">Tap to start interpreting</p>
        </div>

        <div className="relative group z-10">
          <div className={`absolute inset-0 rounded-full blur-2xl transition-all duration-500 ${isListening ? 'bg-indigo-500/40 scale-150' : 'bg-slate-500/0 scale-50'
            }`}></div>

          <button
            onClick={onToggleListening}
            disabled={!isSupported}
            className={`
              relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300
              ${!isSupported ? 'opacity-50 cursor-not-allowed bg-slate-800' :
                isListening
                  ? 'bg-gradient-to-br from-indigo-500 to-violet-600 shadow-2xl shadow-indigo-500/50 scale-105'
                  : 'bg-gradient-to-br from-slate-800 to-slate-900 shadow-xl border border-white/5 hover:border-indigo-500/30'
              }
            `}
          >
            {isListening ? (
              <span className="relative flex h-10 w-10">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <Mic className="relative inline-flex h-10 w-10 text-white" />
              </span>
            ) : (
              <MicOff className="w-8 h-8 text-slate-400 group-hover:text-white transition-colors" />
            )}
          </button>
        </div>

        <div className="text-center h-6 relative z-10">
          {isSupported && !hasPermission ? (
            <button
              onClick={onRequestPermission}
              className="px-4 py-1.5 bg-yellow-500/10 text-yellow-300 text-xs font-semibold rounded-full border border-yellow-500/20 hover:bg-yellow-500/20 transition-all"
            >
              Enable Microphone
            </button>
          ) : (
            <span className={`text-xs font-medium tracking-wider uppercase transition-colors ${isListening ? 'text-indigo-400' : 'text-slate-500'
              }`}>
              {isListening ? 'Listening...' : 'Ready to Start'}
            </span>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      <div className="glass p-6 rounded-3xl space-y-6">
        <div className="flex items-center gap-2 text-slate-300 mb-4">
          <Settings2 className="w-5 h-5 text-indigo-400" />
          <h4 className="font-semibold text-sm tracking-wide">Configuration</h4>
        </div>

        {/* Volume */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Interface Volume</span>
            <span className="text-xs font-mono text-indigo-300">{Math.round(audioSettings.volume * 100)}%</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onVolumeChange(0)}
              className="text-slate-500 hover:text-white transition-colors"
            >
              {getVolumeIcon()}
            </button>
            <div className="flex-1 relative h-2 bg-slate-800 rounded-full overflow-hidden group cursor-pointer">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={audioSettings.volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
              />
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-100 ease-out"
                style={{ width: `${audioSettings.volume * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Pro Card */}
      <div className="mt-auto p-6 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 relative overflow-hidden group shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:bg-white/20 transition-all duration-700"></div>
        <div className="relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4 backdrop-blur-md">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <h4 className="text-white font-bold text-lg mb-1">Totally Free</h4>
          <p className="text-indigo-100/80 text-sm leading-relaxed mb-4">
            Enjoy unlimited real-time translation with no hidden costs or limits.
          </p>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-200 bg-black/20 px-3 py-1.5 rounded-lg w-fit">
            <span>Powered by Google Play</span>
          </div>
        </div>
      </div>

    </div>
  );
};