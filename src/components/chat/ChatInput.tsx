
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Image as ImageIcon, Mic, MicOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ChatInputProps {
  isAnalyzing: boolean;
  onSendMessage: (message: string, image?: string | null, temperature?: number) => void;
  temperature: number;
}

const ChatInput = ({ isAnalyzing, onSendMessage, temperature }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 120); // Max 120px
    textarea.style.height = `${newHeight}px`;
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

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Voice recording functionality would be implemented here
    toast({
      title: "Voice recording",
      description: "Feature coming soon!",
    });
  };

  return (
    <div className="border-t border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <div className="p-4">
        <form onSubmit={handleSubmit}>
          {/* Integrated Input Area with Icons */}
          <div className="relative flex items-end gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-colors">
            {/* Left side icons */}
            <div className="flex items-center gap-1 pb-2">
              {/* Image Upload Icon */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <ImageIcon className="h-5 w-5" />
              </Button>

              {/* Voice Recording Icon */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggleRecording}
                disabled={isAnalyzing}
                className={`h-8 w-8 p-0 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 ${
                  isRecording 
                    ? 'text-red-500 hover:text-red-600' 
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {isRecording ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </Button>
            </div>

            {/* Text Input */}
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={isAnalyzing ? "Alex is thinking..." : "Ask about your style..."}
              disabled={isAnalyzing}
              className="flex-1 min-h-[40px] max-h-[120px] resize-none border-0 bg-transparent px-0 py-2 text-sm leading-relaxed focus-visible:ring-0 focus-visible:ring-offset-0"
              rows={1}
            />
            
            {/* Send Button */}
            <div className="pb-2">
              <Button
                type="submit"
                size="sm"
                disabled={!message.trim() || isAnalyzing}
                className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 transition-colors rounded-full"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Status Indicator */}
          {isAnalyzing && (
            <div className="flex items-center justify-center gap-2 mt-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Alex is thinking...</span>
              </div>
            </div>
          )}
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
