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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any pending timeouts from previous effect runs
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Stop any existing recognition instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log('Error stopping previous recognition:', error);
      }
      recognitionRef.current = null;
    }

    // Verificar soporte para Web Speech API de manera más robusta
    const checkSupport = () => {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const isSupported = !!SpeechRecognition;
      
      console.log('Speech Recognition Support:', {
        SpeechRecognition: !!(window as any).SpeechRecognition,
        webkitSpeechRecognition: !!(window as any).webkitSpeechRecognition,
        isSupported,
        userAgent: navigator.userAgent
      });
      
      setIsSupported(isSupported);
      return { SpeechRecognition, isSupported };
    };

    const { SpeechRecognition, isSupported: supported } = checkSupport();

    if (supported && SpeechRecognition) {
      try {
        recognitionRef.current = new SpeechRecognition();
        const recognition = recognitionRef.current;

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
          console.log('Speech recognition result:', event);
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
          console.error('Speech recognition error:', event);
          setIsListening(false);
          
          let errorMessage = 'Error de reconocimiento de voz';
          
          switch (event.error) {
            case 'not-allowed':
              errorMessage = 'Permisos de micrófono denegados. Por favor, permite el acceso al micrófono.';
              setHasPermission(false);
              break;
            case 'no-speech':
              errorMessage = 'No se detectó voz. Intenta hablar más cerca del micrófono.';
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
            default:
              errorMessage = `Error desconocido: ${event.error || event.message || 'Verifica tu micrófono o conexión.'}`;
          }
          
          onError(errorMessage);
        };

        recognition.onend = () => {
          console.log('Speech recognition ended');
          setIsListening(false);
          
          // Reiniciar automáticamente si está en modo continuo y no hay errores
          if (continuous && hasPermission) {
            timeoutRef.current = setTimeout(() => {
              if (recognitionRef.current && !isListening) {
                try {
                  recognitionRef.current.start();
                } catch (error) {
                  console.log('Auto-restart failed:', error);
                }
              }
              timeoutRef.current = null;
            }, 1000);
          }
        };

      } catch (error) {
        console.error('Error initializing speech recognition:', error);
        setIsSupported(false);
        onError('Error al inicializar el reconocimiento de voz');
      }
    }

    return () => {
      // Clear any pending timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.log('Error stopping recognition:', error);
        }
        recognitionRef.current = null;
      }
    };
  }, [language, continuous, onResult, onError, hasPermission, isListening]);

  const requestMicrophonePermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Liberar el stream
      setHasPermission(true);
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setHasPermission(false);
      onError('Permisos de micrófono denegados. Por favor, permite el acceso al micrófono en la configuración del navegador.');
      return false;
    }
  }, [onError]);

  const startListening = useCallback(async () => {
    if (!isSupported) {
      onError('Reconocimiento de voz no soportado en este navegador. Usa Chrome, Edge o Safari.');
      return;
    }

    if (!hasPermission) {
      const granted = await requestMicrophonePermission();
      if (!granted) return;
    }

    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error: any) {
        console.error('Error starting speech recognition:', error);
        if (error.name === 'InvalidStateError') {
          // Ya está corriendo, intentar parar y reiniciar
          try {
            recognitionRef.current.stop();
            setTimeout(() => {
              if (recognitionRef.current) {
                recognitionRef.current.start();
              }
            }, 100);
          } catch (restartError) {
            onError('Error al reiniciar el reconocimiento de voz');
          }
        } else {
          onError('No se pudo iniciar el reconocimiento de voz');
        }
      }
    }
  }, [isSupported, hasPermission, isListening, onError, requestMicrophonePermission]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
  }, [isListening]);

  return {
    isListening,
    isSupported,
    hasPermission,
    startListening,
    stopListening,
    requestMicrophonePermission
  };
};