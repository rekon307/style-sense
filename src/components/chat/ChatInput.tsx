
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
    <div className="border-t border-gray-200/50 dark:border-gray-700/50 p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      {selectedImage && (
        <div className="mb-4 relative inline-block animate-in slide-in-from-bottom-2 duration-300">
          <div className="relative">
            <img 
              src={selectedImage} 
              alt="Selected" 
              className="max-w-48 max-h-48 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-lg object-cover"
            />
            <Button
              onClick={removeImage}
              size="sm"
              variant="secondary"
              className="absolute -top-2 -right-2 h-8 w-8 p-0 rounded-full bg-red-500 hover:bg-red-600 text-white border-2 border-white shadow-lg transition-all duration-200 hover:scale-105"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full w-fit">
            <Image className="h-3 w-3" />
            Image attached
          </div>
        </div>
      )}
      
      <div className="flex items-end gap-3">
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => fileInputRef.current?.click()}
            size="sm"
            variant="ghost"
            className="h-11 w-11 p-0 rounded-xl text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 flex-shrink-0 border border-gray-200 dark:border-gray-600 hover:border-blue-300 shadow-sm hover:shadow-md"
            disabled={isInputDisabled}
            title="Attach photo"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={getPlaceholder()}
            className="min-h-[48px] max-h-32 resize-none rounded-xl border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 pr-14 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-all duration-200 shadow-sm focus:shadow-md"
            disabled={isInputDisabled}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <Button
              onClick={handleMicClick}
              size="sm"
              variant="ghost"
              className={`h-8 w-8 p-0 rounded-lg transition-all duration-200 ${
                status === 'listening' 
                  ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg animate-pulse' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              }`}
              disabled={isInputDisabled}
              title={status === 'listening' ? 'Stop recording' : 'Start voice recording'}
            >
              {status === 'listening' ? (
                <Square className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <Button
          onClick={handleSend}
          size="sm"
          className="h-11 w-11 p-0 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
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
