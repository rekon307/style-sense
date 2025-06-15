
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
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Main Input Area */}
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={isAnalyzing ? "Alex is thinking..." : "Ask about your style..."}
              disabled={isAnalyzing}
              className="min-h-[50px] max-h-[120px] resize-none pr-12 py-3 text-sm leading-relaxed bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
              rows={1}
            />
            
            {/* Send Button - Positioned inside textarea */}
            <Button
              type="submit"
              size="sm"
              disabled={!message.trim() || isAnalyzing}
              className="absolute right-2 top-2 h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 transition-colors"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Image Upload */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
                className="h-9 px-3 text-xs font-medium border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <ImageIcon className="h-4 w-4 mr-1.5" />
                Upload
              </Button>

              {/* Voice Recording */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={toggleRecording}
                disabled={isAnalyzing}
                className={`h-9 px-3 text-xs font-medium border-slate-200 dark:border-slate-700 transition-colors ${
                  isRecording 
                    ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {isRecording ? (
                  <MicOff className="h-4 w-4 mr-1.5" />
                ) : (
                  <Mic className="h-4 w-4 mr-1.5" />
                )}
                {isRecording ? 'Stop' : 'Voice'}
              </Button>
            </div>

            {/* Status Indicator */}
            {isAnalyzing && (
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>Alex is thinking...</span>
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
