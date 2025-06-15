
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Send, Square, Camera } from "lucide-react";
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
    return 'Type a message...';
  };

  const isInputDisabled = status === 'analyzing';

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
      {selectedImage && (
        <div className="mb-3 relative inline-block">
          <img 
            src={selectedImage} 
            alt="Selected" 
            className="max-w-32 max-h-32 rounded-xl"
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
        <Button
          onClick={() => fileInputRef.current?.click()}
          size="sm"
          variant="ghost"
          className="h-10 w-10 p-0 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
          disabled={isInputDisabled}
        >
          <Camera className="h-5 w-5" />
        </Button>

        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={getPlaceholder()}
            className="min-h-[40px] max-h-32 resize-none rounded-full border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-2 pr-12 text-sm"
            disabled={isInputDisabled}
          />
          <Button
            onClick={handleMicClick}
            size="sm"
            variant="ghost"
            className={`absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 rounded-full ${
              status === 'listening' 
                ? 'bg-blue-100 text-blue-600 animate-pulse' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            disabled={isInputDisabled}
          >
            {status === 'listening' ? (
              <Square className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
        </div>

        <Button
          onClick={handleSend}
          size="sm"
          className="h-10 w-10 p-0 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
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
