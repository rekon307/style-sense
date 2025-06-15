
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Image as ImageIcon, Mic, MicOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";

interface ChatInputProps {
  isAnalyzing: boolean;
  onSendMessage: (message: string, image?: string | null, temperature?: number) => void;
  temperature: number;
}

const ChatInput = ({ isAnalyzing, onSendMessage, temperature }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Voice recording hook integration
  const {
    isListening,
    liveTranscript,
    isSupported: isVoiceSupported,
    startListening,
    stopListening
  } = useVoiceRecording();

  // Update textarea with live transcript
  useState(() => {
    if (liveTranscript) {
      setMessage(liveTranscript);
      
      // Auto-resize textarea for live transcript
      if (textareaRef.current) {
        const textarea = textareaRef.current;
        textarea.style.height = 'auto';
        const newHeight = Math.min(textarea.scrollHeight, 120);
        textarea.style.height = `${newHeight}px`;
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isAnalyzing) return;
    
    onSendMessage(message.trim(), null, temperature);
    setMessage("");
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Only update if not listening (to prevent interference with live transcript)
    if (!isListening) {
      setMessage(e.target.value);
      
      // Auto-resize textarea
      const textarea = e.target;
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 120);
      textarea.style.height = `${newHeight}px`;
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      if (imageData) {
        const currentMessage = message.trim() || "Analyze this image";
        console.log('=== SENDING MESSAGE WITH UPLOADED IMAGE ===');
        console.log('Message:', currentMessage);
        console.log('Image uploaded successfully, length:', imageData.length);
        
        onSendMessage(currentMessage, imageData, temperature);
        setMessage("");
        
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
        
        toast({
          title: "Image uploaded",
          description: "Analyzing your style...",
        });
      }
    };
    reader.readAsDataURL(file);
    
    // Reset file input
    e.target.value = '';
  };

  const handleVoiceInput = () => {
    if (!isVoiceSupported) {
      toast({
        title: "Voice not supported",
        description: "Your browser doesn't support voice input.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      // Stop listening without sending message (cancel)
      stopListening();
      setMessage(""); // Clear any live transcript
    } else {
      // Start listening with automatic message submission
      startListening((finalTranscript: string) => {
        console.log('=== VOICE INPUT COMPLETED ===');
        console.log('Final transcript:', finalTranscript);
        
        if (finalTranscript.trim()) {
          onSendMessage(finalTranscript.trim(), null, temperature);
          setMessage(""); // Clear the message after sending
          
          toast({
            title: "Voice message sent",
            description: "Alex is processing your voice input...",
          });
        }
      });
    }
  };

  return (
    <div className="border-t border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <div className="p-4">
        <form onSubmit={handleSubmit}>
          {/* Integrated Input Area with Icons */}
          <div className="relative flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-colors">
            {/* Left side icons */}
            <div className="flex items-center gap-1">
              {/* Image Upload Icon */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing || isListening}
                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <ImageIcon className="h-5 w-5" />
              </Button>
            </div>

            {/* Text Input */}
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={
                isAnalyzing 
                  ? "Alex is thinking..." 
                  : isListening 
                    ? "Listening... Speak now" 
                    : "Ask about your style or speak with the mic..."
              }
              disabled={isAnalyzing}
              className="flex-1 min-h-[32px] max-h-[120px] resize-none border-0 bg-transparent px-0 py-1 text-sm leading-relaxed focus-visible:ring-0 focus-visible:ring-offset-0"
              rows={1}
            />
            
            {/* Right side icons container */}
            <div className="flex items-center gap-1">
              {/* Voice Recording Icon */}
              {isVoiceSupported && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleVoiceInput}
                  disabled={isAnalyzing}
                  className={`h-8 w-8 p-0 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700 ${
                    isListening 
                      ? 'text-red-500 bg-red-50 dark:bg-red-900/20 animate-pulse shadow-lg shadow-red-200 dark:shadow-red-900/30' 
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {isListening ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              )}
              
              {/* Send Button */}
              <Button
                type="submit"
                size="sm"
                disabled={!message.trim() || isAnalyzing || isListening}
                className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 transition-colors rounded-full"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center justify-center gap-4 mt-3">
            {isAnalyzing && (
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>Alex is thinking...</span>
                </div>
              </div>
            )}
            
            {isListening && (
              <div className="flex items-center gap-2 text-xs text-red-500 dark:text-red-400">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                  <span>Listening... Speak naturally</span>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ChatInput;
