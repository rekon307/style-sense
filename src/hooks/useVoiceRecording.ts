import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

export const useVoiceRecording = () => {
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const onSpeechEndRef = useRef<((transcript: string) => void) | null>(null);
  const isCleanupRef = useRef(false);

  const getSpeechRecognition = () => {
    return window.SpeechRecognition || window.webkitSpeechRecognition;
  };
  
  const isSupported = !!getSpeechRecognition();

  const cleanup = useCallback(() => {
    if (isCleanupRef.current) return;
    isCleanupRef.current = true;

    console.log('🧹 Cleaning up voice recording...');

    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.warn('Error stopping recognition:', error);
      }
      recognitionRef.current = null;
    }

    setIsListening(false);
    onSpeechEndRef.current = null;
    
    setTimeout(() => {
      isCleanupRef.current = false;
    }, 100);
  }, []);

  const clearTranscript = useCallback(() => {
    console.log('🧹 Clearing transcript manually...');
    setLiveTranscript('');
  }, []);

  const startListening = useCallback((onSpeechEnd?: (transcript: string) => void) => {
    const SpeechRecognitionClass = getSpeechRecognition();
    
    if (!SpeechRecognitionClass) {
      toast({
        title: "Speech recognition not supported",
        description: "Your browser doesn't support this feature.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      console.warn('Already listening, stopping first');
      cleanup();
      return;
    }

    try {
      onSpeechEndRef.current = onSpeechEnd || null;
      
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        console.log('🎤 Voice recording started');
        setIsListening(true);
        setLiveTranscript('');
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const fullTranscript = (finalTranscript + interimTranscript).trim();
        setLiveTranscript(fullTranscript);

        // Clear existing pause timer
        if (pauseTimerRef.current) {
          clearTimeout(pauseTimerRef.current);
          pauseTimerRef.current = null;
        }

        // Smart pause detection - 2 seconds for natural conversation flow
        if (fullTranscript) {
          pauseTimerRef.current = setTimeout(() => {
            if (fullTranscript && onSpeechEndRef.current && !isCleanupRef.current) {
              console.log('🎤 Speech completed, processing:', fullTranscript);
              const callback = onSpeechEndRef.current;
              // Keep the transcript visible and don't clear it immediately
              setIsListening(false);
              callback(fullTranscript);
              // Clear transcript after a short delay to show what was said
              setTimeout(() => {
                setLiveTranscript('');
              }, 1000);
            }
          }, 2000);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('❌ Speech recognition error:', event.error);
        
        if (event.error !== 'aborted' && !isCleanupRef.current) {
          toast({
            title: "Speech recognition error",
            description: `Something went wrong: ${event.error}. Please try again.`,
            variant: "destructive",
          });
        }
        
        cleanup();
      };

      recognition.onend = () => {
        console.log('🎤 Speech recognition ended');
        if (!isCleanupRef.current) {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();

    } catch (error) {
      console.error('❌ Error starting speech recognition:', error);
      cleanup();
      toast({
        title: "Error starting voice recording",
        description: "Please check microphone permissions.",
        variant: "destructive",
      });
    }
  }, [isListening, cleanup]);

  const stopListening = useCallback(() => {
    console.log('🛑 Stopping speech recognition manually');
    cleanup();
  }, [cleanup]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    isListening,
    liveTranscript,
    isSupported,
    startListening,
    stopListening,
    clearTranscript
  };
};
