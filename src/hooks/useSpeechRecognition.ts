import { useState, useRef, useCallback, useEffect } from 'react';
import { SpeechRecognitionResult } from '../types/Translation';

interface UseSpeechRecognitionProps {
  language: string;
  continuous: boolean;
  onResult: (result: SpeechRecognitionResult) => void;
  onError: (error: string) => void;
}

export const useSpeechRecognition = ({
  language,
  continuous,
  onResult,
  onError
}: UseSpeechRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(isListening);
  const hasPermissionRef = useRef(hasPermission);

  // Sync refs with state
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    hasPermissionRef.current = hasPermission;
  }, [hasPermission]);

  useEffect(() => {
    // Verificar soporte para Web Speech API
    const checkSupport = () => {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const isSupported = !!SpeechRecognition;
      setIsSupported(isSupported);
      return { SpeechRecognition, isSupported };
    };

    const { SpeechRecognition, isSupported: supported } = checkSupport();

    if (supported && SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        // Configuración básica
        recognition.continuous = continuous;
        recognition.interimResults = true;
        recognition.lang = language;
        recognition.maxAlternatives = 1;

        // Event handlers
        recognition.onstart = () => {
          console.log('Speech recognition started');
          setIsListening(true);
          setHasPermission(true);
        };

        recognition.onresult = (event: any) => {
          const results = event.results;
          const lastResult = results[results.length - 1];
          const transcript = lastResult[0].transcript;
          const confidence = lastResult[0].confidence || 0.9;
          const isFinal = lastResult.isFinal;

          onResult({
            text: transcript,
            confidence,
            isFinal
          });
        };

        recognition.onerror = (event: any) => {
          // Ignore 'no-speech' errors in continuous mode as they just mean silence
          if (event.error === 'no-speech') {
            return;
          }

          console.error('Speech recognition error:', event);

          let errorMessage = 'Error de reconocimiento de voz';
          let shouldStop = true;

          switch (event.error) {
            case 'not-allowed':
              errorMessage = 'Permisos de micrófono denegados. Por favor, permite el acceso al micrófono.';
              setHasPermission(false);
              break;
            case 'audio-capture':
              errorMessage = 'No se pudo capturar audio. Verifica que tu micrófono esté conectado.';
              break;
            case 'network':
              errorMessage = 'Error de red. Verifica tu conexión a internet.';
              break;
            case 'service-not-allowed':
              errorMessage = 'Servicio de reconocimiento de voz no disponible.';
              break;
            case 'aborted':
              // User likely stopped it manually or another instance took over
              shouldStop = false;
              break;
            default:
              errorMessage = `Error: ${event.error || 'Desconocido'}`;
          }

          if (shouldStop) {
            setIsListening(false);
            if (event.error !== 'aborted') {
              onError(errorMessage);
            }
          }
        };

        recognition.onend = () => {
          console.log('Speech recognition ended');

          // Only auto-restart if we think we should still be listening
          // We use the ref here to check the INTENDED state, not necessarily the current React state which might be pending
          if (continuous && isListeningRef.current && hasPermissionRef.current) {
            console.log('Attempting auto-restart...');
            try {
              recognitionRef.current?.start();
            } catch (e) {
              console.error('Failed to auto-restart:', e);
              setIsListening(false);
            }
          } else {
            setIsListening(false);
          }
        };

      } catch (error) {
        console.error('Error initializing speech recognition:', error);
        setIsSupported(false);
        onError('Error al inicializar el reconocimiento de voz');
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          // ignore errors on cleanup
        }
      }
    };
    // Crucial: removed isListening and hasPermission from dependencies to prevent restart loops
  }, [language, continuous, onResult, onError]);

  const requestMicrophonePermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setHasPermission(false);
      onError('Permisos de micrófono denegados.');
      return false;
    }
  }, [onError]);

  const startListening = useCallback(async () => {
    if (!isSupported) {
      onError('Navegador no soportado.');
      return;
    }

    if (!hasPermission) {
      const granted = await requestMicrophonePermission();
      if (!granted) return;
    }

    if (recognitionRef.current) {
      try {
        // Explicitly set intent to listen
        setIsListening(true);
        recognitionRef.current.start();
      } catch (error: any) {
        console.error('Error starting:', error);
        if (error.name !== 'InvalidStateError') {
          setIsListening(false);
          onError('No se pudo iniciar el reconocimiento.');
        }
      }
    }
  }, [isSupported, hasPermission, requestMicrophonePermission, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        // Explicitly set intent to stop listening
        setIsListening(false);
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping:', error);
      }
    }
  }, []);

  return {
    isListening,
    isSupported,
    hasPermission,
    startListening,
    stopListening,
    requestMicrophonePermission
  };
};