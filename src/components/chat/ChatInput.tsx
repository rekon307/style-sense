
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, Square } from "lucide-react";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";

interface ChatInputProps {
  isAnalyzing: boolean;
  onSendMessage: (message: string, capturedPhoto?: string | null) => void;
}

const ChatInput = ({ isAnalyzing, onSendMessage }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const {
    isListening,
    liveTranscript,
    audioLevel,
    startListening,
    stopListening,
    isSupported
  } = useVoiceRecording();

  const capturePhotoFromWebcam = (): string | null => {
    try {
      const videoElement = document.querySelector('video') as HTMLVideoElement;
      
      if (!videoElement || videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
        console.log('Video element not available or not ready');
        return null;
      }

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        console.log('Canvas context not available');
        return null;
      }

      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      const dataURL = canvas.toDataURL('image/jpeg', 0.8);
      console.log('Photo captured from webcam for Alex analysis');
      return dataURL;
    } catch (error) {
      console.error('Error capturing photo from webcam:', error);
      return null;
    }
  };

  const handleAutomaticSend = (finalTranscript: string) => {
    console.log('Auto-sending voice message:', finalTranscript);
    
    const capturedPhoto = capturePhotoFromWebcam();
    onSendMessage(finalTranscript, capturedPhoto);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const messageToSend = message.trim();
    if (!messageToSend) return;

    const capturedPhoto = capturePhotoFromWebcam();
    onSendMessage(messageToSend, capturedPhoto);
    
    setMessage("");
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(handleAutomaticSend);
    }
  };

  // Use live transcript when listening, otherwise use typed message
  const currentMessage = isListening ? liveTranscript : message;
  const isInputDisabled = isAnalyzing || isListening;

  return (
    <div className="border-t border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="flex gap-3 p-4">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={currentMessage}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            placeholder={
              isListening 
                ? "Alex ascultă... vorbește natural" 
                : isAnalyzing 
                ? "Alex analizează..." 
                : "Întreabă pe Alex despre stilul tău..."
            }
            disabled={isInputDisabled}
            className={`min-h-[44px] max-h-[120px] resize-none pr-16 transition-colors ${
              isListening 
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600' 
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
            } ${
              isListening ? 'focus:border-blue-500 dark:focus:border-blue-400' : 'focus:border-blue-500 dark:focus:border-blue-400'
            }`}
            style={{ height: 'auto' }}
          />
          
          {/* Audio level indicator */}
          {isListening && (
            <div className="absolute right-12 top-3 w-2 bg-slate-200 dark:bg-slate-700 rounded-full h-8 overflow-hidden">
              <div 
                className="bg-gradient-to-t from-green-400 via-yellow-400 to-red-400 w-full transition-all duration-100 rounded-full"
                style={{ 
                  height: `${audioLevel}%`,
                  transform: 'translateY(' + (100 - audioLevel) + '%)'
                }}
              />
            </div>
          )}
          
          {isSupported && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleListening}
              disabled={isAnalyzing}
              className={`absolute right-2 top-2 h-7 w-7 p-0 transition-all ${
                isListening 
                  ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30 shadow-lg' 
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {isListening ? (
                <div className="relative">
                  <Mic className="h-4 w-4" />
                  <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20"></div>
                </div>
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        
        <Button 
          type="submit" 
          disabled={isAnalyzing || isListening || (!currentMessage.trim())}
          className="h-11 px-4 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
        >
          {isAnalyzing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span className="text-sm">Analizez...</span>
            </div>
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
};

export default ChatInput;
