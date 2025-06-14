
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Plus } from "lucide-react";
import { useState, useRef } from "react";

interface ChatInputProps {
  isAnalyzing: boolean;
  onSendMessage: (message: string, uploadedImage?: string | null) => void;
}

const ChatInput = ({ isAnalyzing, onSendMessage }: ChatInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isAnalyzing) {
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          console.log('Image uploaded, size:', result.length);
          const message = inputValue.trim() || "Analizează această imagine și dă-mi sfaturi de stil.";
          onSendMessage(message, result);
          setInputValue("");
        }
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="border-t border-slate-200/50 dark:border-slate-700/50 p-6">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <Button
          type="button"
          onClick={handleUploadClick}
          size="sm"
          variant="outline"
          disabled={isAnalyzing}
          className="h-11 px-3 border-slate-300/50 dark:border-slate-600/50 hover:bg-slate-50 dark:hover:bg-slate-800/50"
          title="Upload image"
        >
          <Plus className="h-4 w-4" />
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp,image/svg+xml"
          onChange={handleFileUpload}
          className="hidden"
        />
        
        <Input
          type="text"
          placeholder={isAnalyzing ? "Alex is analyzing..." : "Ask Alex about style, trends, or fashion advice..."}
          className="flex-1 h-11 bg-slate-50/50 dark:bg-slate-800/50 border-slate-300/50 dark:border-slate-600/50 focus:border-blue-500 dark:focus:border-blue-400"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isAnalyzing}
        />
        <Button 
          type="submit" 
          size="sm"
          disabled={isAnalyzing || !inputValue.trim()}
          className="h-11 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
        >
          {isAnalyzing ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
};

export default ChatInput;
