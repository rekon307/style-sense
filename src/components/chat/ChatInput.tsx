
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Send, Square, Camera, ImageIcon } from "lucide-react";
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
    stopListening 
  } = useVoiceRecording();

  // Update status when listening changes
  useEffect(() => {
    if (isListening) {
      setStatus('listening');
    } else if (status === 'listening') {
      setStatus('idle');
    }
  }, [isListening, setStatus, status]);

  // Update status when analyzing changes
  useEffect(() => {
    if (isAnalyzing) {
      setStatus('analyzing');
    } else if (status === 'analyzing') {
      setStatus('idle');
    }
  }, [isAnalyzing, setStatus, status]);

  // Update textarea with live transcript
  useEffect(() => {
    if (liveTranscript) {
      setMessage(liveTranscript);
    }
  }, [liveTranscript]);

  const handleSend = () => {
    if (!message.trim() && !selectedImage) {
      toast({
        title: "Empty message",
        description: "Please enter a message or select an image before sending.",
        variant: "destructive",
      });
      return;
    }

    onSendMessage(message.trim(), selectedImage, temperature);
    setMessage("");
    setSelectedImage(null);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
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
          onSendMessage(finalTranscript.trim(), selectedImage, temperature);
          setMessage("");
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
    return 'Ask about your style or speak...';
  };

  const isInputDisabled = status === 'analyzing';

  return (
    <div className="border-t border-slate-200/50 dark:border-slate-700/50 p-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
      {selectedImage && (
        <div className="mb-3 relative inline-block">
          <img 
            src={selectedImage} 
            alt="Selected" 
            className="max-w-32 max-h-32 rounded-lg border border-slate-200 dark:border-slate-700"
          />
          <Button
            onClick={removeImage}
            size="sm"
            variant="destructive"
            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
          >
            ×
          </Button>
        </div>
      )}
      
      <div className="flex items-end gap-2">
        <div className="flex gap-1">
          <Button
            onClick={handleMicClick}
            size="sm"
            variant="ghost"
            className={`h-10 w-10 p-0 transition-all duration-300 ${
              status === 'listening' 
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-500/25 animate-pulse' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
            disabled={isInputDisabled}
          >
            {status === 'listening' ? (
              <Square className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            size="sm"
            variant="ghost"
            className="h-10 w-10 p-0 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            disabled={isInputDisabled}
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>

        <div className={`flex-1 relative transition-all duration-300 ${
          status === 'analyzing' 
            ? 'ring-2 ring-amber-400/50 ring-offset-2 ring-offset-white dark:ring-offset-slate-900' 
            : ''
        }`}>
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={getPlaceholder()}
            className="min-h-[2.5rem] max-h-32 resize-none border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-all duration-300"
            disabled={isInputDisabled}
          />
        </div>

        <Button
          onClick={handleSend}
          size="sm"
          className={`h-10 w-10 p-0 transition-all duration-300 ${
            status === 'analyzing'
              ? 'bg-amber-500 hover:bg-amber-600 animate-pulse'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          disabled={isInputDisabled || (!message.trim() && !selectedImage)}
        >
          <Send className="h-4 w-4" />
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
