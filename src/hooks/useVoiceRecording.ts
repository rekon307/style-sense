
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
    setLiveTranscript('');
    onSpeechEndRef.current = null;
    
    setTimeout(() => {
      isCleanupRef.current = false;
    }, 100);
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
      recognition.lang = 'ro-RO';

      recognition.onstart = () => {
        console.log('Alex is listening - real-time cognitive mode');
        setIsListening(true);
        setLiveTranscript('');
        
        toast({
          title: "Alex ascultă în timp real",
          description: "Vorbește natural. Alex analizează continuu cu arhitectura sa cognitivă.",
        });
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

        // Enhanced smart pause detection - 1.5 seconds for cognitive processing
        if (fullTranscript) {
          pauseTimerRef.current = setTimeout(() => {
            if (fullTranscript && onSpeechEndRef.current && !isCleanupRef.current) {
              console.log('Cognitive pause detected, processing:', fullTranscript);
              const callback = onSpeechEndRef.current;
              cleanup();
              callback(fullTranscript);
            }
          }, 1500);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        
        if (event.error !== 'aborted' && !isCleanupRef.current) {
          toast({
            title: "Eroare la recunoașterea vocală",
            description: `A apărut o problemă: ${event.error}. Încearcă din nou.`,
            variant: "destructive",
          });
        }
        
        cleanup();
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        if (!isCleanupRef.current) {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();

    } catch (error) {
      console.error('Error starting speech recognition:', error);
      cleanup();
      toast({
        title: "Eroare la pornirea recunoașterii vocale",
        description: "Verifică permisiunile pentru microfon.",
        variant: "destructive",
      });
    }
  }, [isListening, cleanup]);

  const stopListening = useCallback(() => {
    console.log('Stopping speech recognition manually');
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
    stopListening
  };
};
