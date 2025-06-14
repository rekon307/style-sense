
import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const useVoiceRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check if speech recognition is supported
  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  // Enhanced Voice Activity Detection with audio level monitoring
  const startVoiceActivityDetection = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return;

    const checkAudioLevel = () => {
      if (!analyserRef.current || !dataArrayRef.current || !isRecording) return;

      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      
      // Calculate average volume
      const average = dataArrayRef.current.reduce((a, b) => a + b) / dataArrayRef.current.length;
      const normalizedLevel = Math.min(100, Math.max(0, (average / 128) * 100));
      setAudioLevel(normalizedLevel);
      
      const threshold = 20; // Adjusted threshold for better sensitivity
      
      if (average < threshold) {
        // User is silent - start/continue silence timer
        if (!silenceTimerRef.current) {
          silenceTimerRef.current = setTimeout(() => {
            console.log('Auto-stopping recording due to silence');
            stopRecording();
          }, 3000); // Increased to 3 seconds for better UX
        }
      } else {
        // User is speaking - clear silence timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      }

      if (isRecording) {
        animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
      }
    };

    checkAudioLevel();
  }, [isRecording]);

  const startRecording = useCallback(async () => {
    try {
      setTranscript(''); // Clear previous transcript
      setRecordingDuration(0);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          googEchoCancellation: true,
          googAutoGainControl: true,
          googNoiseSuppression: true,
          googHighpassFilter: true
        } 
      });

      streamRef.current = stream;

      // Set up enhanced audio context for voice activity detection
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 512; // Increased for better frequency analysis
      analyserRef.current.minDecibels = -90;
      analyserRef.current.maxDecibels = -10;
      analyserRef.current.smoothingTimeConstant = 0.85;
      
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
      source.connect(analyserRef.current);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        cleanupRecording();
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Record in smaller chunks for better quality
      setIsRecording(true);

      // Start duration counter
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      // Start voice activity detection after a small delay
      setTimeout(() => {
        startVoiceActivityDetection();
      }, 500);

      toast({
        title: "Înregistrarea a început",
        description: "Vorbește acum. Înregistrarea se va opri automat când termini.",
      });

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Eroare la înregistrare",
        description: "Verifică permisiunile pentru microfon.",
        variant: "destructive",
      });
    }
  }, [startVoiceActivityDetection]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      // Clear timers and animation frames
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);
    }
  }, [isRecording]);

  const cleanupRecording = () => {
    // Stop all tracks to release microphone
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Clean up audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Clear all timers and animation frames
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      // Convert audio blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('');
      const base64Audio = btoa(binaryString);

      console.log('Sending audio for transcription, size:', base64Audio.length);

      const { data, error } = await supabase.functions.invoke('speech-to-text', {
        body: { audio: base64Audio }
      });

      if (error) {
        console.error('Transcription error:', error);
        throw new Error(error.message || 'Failed to transcribe audio');
      }

      if (data && data.text) {
        console.log('Transcription result:', data.text);
        setTranscript(data.text);
        
        toast({
          title: "Transcrierea s-a finalizat",
          description: "Textul a fost convertit cu succes.",
        });
      } else {
        throw new Error('No transcription result received');
      }

    } catch (error) {
      console.error('Error processing audio:', error);
      
      toast({
        title: "Eroare la transcriere",
        description: "Nu s-a putut converti vorbirea în text. Încearcă din nou.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    isRecording,
    isProcessing,
    transcript,
    audioLevel,
    recordingDuration: formatDuration(recordingDuration),
    isSupported,
    startRecording,
    stopRecording
  };
};
