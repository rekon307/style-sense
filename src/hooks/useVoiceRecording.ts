
import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

export const useVoiceRecording = () => {
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const onSpeechEndRef = useRef<((transcript: string) => void) | null>(null);

  const getSpeechRecognition = () => {
    return window.SpeechRecognition || window.webkitSpeechRecognition;
  };
  
  const isSupported = !!getSpeechRecognition();

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

    try {
      onSpeechEndRef.current = onSpeechEnd || null;
      
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ro-RO';

      recognition.onstart = () => {
        console.log('Voice recognition started - real-time mode');
        setIsListening(true);
        setLiveTranscript('');
        
        toast({
          title: "Alex ascultă în timp real",
          description: "Vorbește natural. Textul va apărea pe măsură ce vorbești.",
        });
      };

      recognition.onresult = (event) => {
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

        const fullTranscript = finalTranscript + interimTranscript;
        setLiveTranscript(fullTranscript);

        // Clear existing pause timer
        if (pauseTimerRef.current) {
          clearTimeout(pauseTimerRef.current);
          pauseTimerRef.current = null;
        }

        // Smart pause detection - 1.5 seconds of silence
        if (fullTranscript.trim()) {
          pauseTimerRef.current = setTimeout(() => {
            const currentTranscript = fullTranscript.trim();
            if (currentTranscript && onSpeechEndRef.current) {
              console.log('Speech pause detected, auto-sending:', currentTranscript);
              stopListening();
              onSpeechEndRef.current(currentTranscript);
            }
          }, 1500);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error !== 'aborted') {
          toast({
            title: "Eroare la recunoașterea vocală",
            description: "A apărut o problemă. Încearcă din nou.",
            variant: "destructive",
          });
        }
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();

    } catch (error) {
      console.error('Error starting speech recognition:', error);
      toast({
        title: "Eroare la pornirea recunoașterii vocale",
        description: "Verifică permisiunile pentru microfon.",
        variant: "destructive",
      });
    }
  }, []);

  const stopListening = useCallback(() => {
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    setIsListening(false);
  }, []);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isListening,
    liveTranscript,
    isSupported,
    startListening,
    stopListening
  };
};
