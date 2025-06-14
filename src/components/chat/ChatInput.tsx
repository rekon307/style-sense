
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, Square } from "lucide-react";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { captureImageFromWebcam, isWebcamAvailable } from "@/utils/imageUtils";
import { toast } from "@/components/ui/use-toast";

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

  const handleAutoSend = (finalTranscript: string) => {
    console.log('=== AUTO-SEND START ===');
    console.log('Transcript:', finalTranscript);
    
    if (!finalTranscript.trim()) return;

    const captureResult = captureImageFromWebcam();
    if (!captureResult.success) {
      console.warn('Auto image capture failed:', captureResult.error);
    }
    
    onSendMessage(finalTranscript, captureResult.image || null, temperature);
    setMessage("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const messageToSend = message.trim();
    if (!messageToSend) return;

    console.log('=== MANUAL SUBMIT START ===');
    
    const captureResult = captureImageFromWebcam();
    if (!captureResult.success) {
      console.warn('Manual image capture failed:', captureResult.error);
      toast({
        title: "Image capture failed",
        description: captureResult.error,
        variant: "destructive",
      });
    }
    
    onSendMessage(messageToSend, captureResult.image || null, temperature);
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
      startListening(handleAutoSend);
    }
  };

  const currentMessage = isListening ? liveTranscript : message;
  const isInputDisabled = isAnalyzing || isListening;
  const webcamAvailable = isWebcamAvailable();

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
                : webcamAvailable
                ? "Întreabă pe Alex despre stilul tău (foto auto-capturată)..."
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
              onClick={toggleListening}
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
      
      {!webcamAvailable && (
        <div className="px-4 pb-2">
          <p className="text-xs text-amber-600 dark:text-amber-400">
            📷 Camera nu este disponibilă - mesajele vor fi trimise fără imagine
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatInput;
