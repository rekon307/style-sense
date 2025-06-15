
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Send, Square, Paperclip, X, Image, Zap } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { useAlexState } from "@/contexts/AlexStateContext";

interface ChatInputProps {
  isAnalyzing: boolean;
  onSendMessage: (message: string, image?: string | null, temperature?: number) => void;
  temperature?: number;
}

const ChatInput = ({ isAnalyzing, onSendMessage, temperature = 0.5 }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { status, setStatus } = useAlexState();

  const { 
    isListening, 
    liveTranscript, 
    startListening, 
    stopListening,
    clearTranscript
  } = useVoiceRecording();

  useEffect(() => {
    if (isListening) {
      setStatus('listening');
    } else if (status === 'listening') {
      setStatus('idle');
    }
  }, [isListening, setStatus, status]);

  useEffect(() => {
    if (isAnalyzing) {
      setStatus('analyzing');
    } else if (status === 'analyzing') {
      setStatus('idle');
    }
  }, [isAnalyzing, setStatus, status]);

  useEffect(() => {
    if (liveTranscript) {
      setMessage(liveTranscript);
    }
  }, [liveTranscript]);

  const clearInput = () => {
    console.log('🧹 Clearing chat input...');
    setMessage("");
    setSelectedImage(null);
    clearTranscript();
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleSend = () => {
    if (!message.trim() && !selectedImage) {
      toast({
        title: "Empty message",
        description: "Please enter a message or select an image before sending.",
        variant: "destructive",
      });
      return;
    }

    console.log('📤 Sending message and clearing input...');
    onSendMessage(message.trim(), selectedImage, temperature);
    clearInput();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isAnalyzing && !isListening) {
        handleSend();
      }
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((finalTranscript: string) => {
        if (finalTranscript.trim()) {
          console.log('🎤 Voice message completed, sending and clearing...');
          onSendMessage(finalTranscript.trim(), selectedImage, temperature);
          setSelectedImage(null);
        }
      });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedImage(result);
        toast({
          title: "Image uploaded",
          description: "Image ready to be sent with your message.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getPlaceholder = () => {
    if (status === 'listening') return 'Listening...';
    if (status === 'analyzing') return 'Alex is thinking...';
    return 'Ask Alex about your style...';
  };

  const isInputDisabled = status === 'analyzing';

  return (
    <div className="border-t border-gray-200/30 dark:border-gray-700/30 p-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
      {selectedImage && (
        <div className="mb-3 relative inline-block animate-in slide-in-from-bottom-2 duration-300">
          <div className="relative">
            <img 
              src={selectedImage} 
              alt="Selected" 
              className="max-w-32 max-h-32 rounded-xl border border-gray-200/50 dark:border-gray-600/50 shadow-sm object-cover"
            />
            <Button
              onClick={removeImage}
              size="sm"
              variant="secondary"
              className="absolute -top-1.5 -right-1.5 h-6 w-6 p-0 rounded-full bg-red-500 hover:bg-red-600 text-white border border-white shadow-sm transition-all duration-200"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5 bg-gray-100/80 dark:bg-gray-800/80 px-2 py-1 rounded-lg w-fit">
            <Image className="h-3 w-3" />
            Image attached
          </div>
        </div>
      )}
      
      <div className="flex items-end gap-2">
        <Button
          onClick={() => fileInputRef.current?.click()}
          size="sm"
          variant="ghost"
          className="h-9 w-9 p-0 rounded-lg text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50/80 dark:hover:bg-blue-900/20 transition-all duration-200 flex-shrink-0 border border-gray-200/50 dark:border-gray-600/50 hover:border-blue-300/50"
          disabled={isInputDisabled}
          title="Attach photo"
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={getPlaceholder()}
            className="min-h-[40px] max-h-24 resize-none rounded-xl border-gray-200/50 dark:border-gray-600/50 bg-white/80 dark:bg-gray-800/80 px-3 py-2.5 pr-12 text-sm focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-all duration-200 shadow-sm focus:shadow-md"
            disabled={isInputDisabled}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Button
              onClick={handleMicClick}
              size="sm"
              variant="ghost"
              className={`h-7 w-7 p-0 rounded-lg transition-all duration-200 ${
                status === 'listening' 
                  ? 'bg-red-500/90 text-white hover:bg-red-600 shadow-sm animate-pulse' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50/80 dark:hover:bg-blue-900/20'
              }`}
              disabled={isInputDisabled}
              title={status === 'listening' ? 'Stop recording' : 'Start voice recording'}
            >
              {status === 'listening' ? (
                <Square className="h-3.5 w-3.5" />
              ) : (
                <Mic className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>

        <Button
          onClick={handleSend}
          size="sm"
          className="h-9 w-9 p-0 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all duration-200"
          disabled={isInputDisabled || (!message.trim() && !selectedImage)}
          title="Send message"
        >
          {isInputDisabled ? (
            <Zap className="h-4 w-4 animate-pulse" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
};

export default ChatInput;
