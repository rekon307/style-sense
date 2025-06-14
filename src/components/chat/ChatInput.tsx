
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, Square } from "lucide-react";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { capturePhotoFromWebcam, isWebcamReady } from "@/utils/imageCapture";

interface ChatInputProps {
  isAnalyzing: boolean;
  onSendMessage: (message: string, image?: string | null, temperature?: number) => void;
  temperature: number;
}

const ChatInput = ({ isAnalyzing, onSendMessage, temperature }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const {
    isListening,
    liveTranscript,
    startListening,
    stopListening,
    isSupported
  } = useVoiceRecording();

  const handleCognitiveAutoSend = (finalTranscript: string) => {
    console.log('Alex cognitive auto-send:', finalTranscript);
    
    if (!finalTranscript.trim()) {
      console.warn('Empty transcript, skipping auto-send');
      return;
    }

    const capturedPhoto = isWebcamReady() ? capturePhotoFromWebcam() : null;
    if (!capturedPhoto) {
      console.warn('Could not capture photo for cognitive auto-send');
    }
    
    onSendMessage(finalTranscript, capturedPhoto, temperature);
    setMessage("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const messageToSend = message.trim();
    if (!messageToSend) return;

    const capturedPhoto = isWebcamReady() ? capturePhotoFromWebcam() : null;
    if (!capturedPhoto) {
      console.warn('Could not capture photo for message submission');
    }
    
    onSendMessage(messageToSend, capturedPhoto, temperature);
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

  const toggleCognitiveListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(handleCognitiveAutoSend);
    }
  };

  // Enhanced UI for cognitive mode
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
                ? "Alex analizează în timp real... vorbește natural" 
                : isAnalyzing 
                ? "Alex procesează cu arhitectura cognitivă..." 
                : "Întreabă pe Alex despre stilul tău..."
            }
            disabled={isInputDisabled}
            className={`min-h-[44px] max-h-[120px] resize-none pr-16 transition-all duration-300 ${
              isListening 
                ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-300 dark:border-blue-600 shadow-lg' 
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
            }`}
            style={{ height: 'auto' }}
          />
          
          {isSupported && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleCognitiveListening}
              disabled={isAnalyzing}
              className={`absolute right-2 top-2 h-7 w-7 p-0 transition-all duration-300 ${
                isListening 
                  ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300 animate-pulse' 
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {isListening ? (
                <Square className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        
        <Button 
          type="submit" 
          disabled={isAnalyzing || isListening || (!currentMessage.trim())}
          className={`h-11 px-4 transition-all duration-300 ${
            isAnalyzing 
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse' 
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white disabled:opacity-50`}
        >
          {isAnalyzing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span className="text-sm">Alex gândește...</span>
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
