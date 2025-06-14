
import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

export const useVoiceRecording = () => {
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const onSpeechEndRef = useRef<((transcript: string) => void) | null>(null);

  // Check if speech recognition is supported
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const isSupported = !!SpeechRecognition;

  // Audio level monitoring
  const startAudioLevelMonitoring = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      streamRef.current = stream;
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;
      
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
      source.connect(analyserRef.current);

      const monitorAudioLevel = () => {
        if (!analyserRef.current || !dataArrayRef.current || !isListening) return;

        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        const average = dataArrayRef.current.reduce((a, b) => a + b) / dataArrayRef.current.length;
        const normalizedLevel = Math.min(100, Math.max(0, (average / 128) * 100));
        setAudioLevel(normalizedLevel);

        if (isListening) {
          animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);
        }
      };

      monitorAudioLevel();
    } catch (error) {
      console.error('Error accessing microphone for audio level monitoring:', error);
    }
  }, [isListening]);

  const stopAudioLevelMonitoring = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setAudioLevel(0);
  }, []);

  const startListening = useCallback((onSpeechEnd?: (transcript: string) => void) => {
    if (!isSupported) {
      toast({
        title: "Recunoașterea vocală nu este suportată",
        description: "Browser-ul tău nu suportă această funcționalitate.",
        variant: "destructive",
      });
      return;
    }

    try {
      onSpeechEndRef.current = onSpeechEnd || null;
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ro-RO';

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
        setLiveTranscript('');
        startAudioLevelMonitoring();
        
        toast({
          title: "Alex ascultă",
          description: "Vorbește natural. Alex va răspunde automat când termini.",
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

        // Update live transcript with interim results
        setLiveTranscript(finalTranscript + interimTranscript);

        // Clear existing pause timer
        if (pauseTimerRef.current) {
          clearTimeout(pauseTimerRef.current);
          pauseTimerRef.current = null;
        }

        // If we have some content and speech seems to have paused, set a timer
        if (finalTranscript.trim() || interimTranscript.trim()) {
          pauseTimerRef.current = setTimeout(() => {
            const fullTranscript = (finalTranscript + interimTranscript).trim();
            if (fullTranscript) {
              console.log('Speech pause detected, finalizing transcript:', fullTranscript);
              stopListening();
              if (onSpeechEndRef.current) {
                onSpeechEndRef.current(fullTranscript);
              }
            }
          }, 1500); // 1.5 second pause detection
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        stopAudioLevelMonitoring();
        
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
        stopAudioLevelMonitoring();
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
  }, [isSupported, startAudioLevelMonitoring, stopAudioLevelMonitoring]);

  const stopListening = useCallback(() => {
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    stopAudioLevelMonitoring();
    setIsListening(false);
  }, [stopAudioLevelMonitoring]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isListening,
    liveTranscript,
    audioLevel,
    isSupported,
    startListening,
    stopListening
  };
};
