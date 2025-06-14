import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sparkles, Send, Settings, User, Camera, Bot, Plus, ImageIcon, Zap } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface StyleAdviceProps {
  messages: Message[];
  isAnalyzing: boolean;
  onSendMessage: (message: string, uploadedImage?: string | null) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const StyleAdvice = ({ messages, isAnalyzing, onSendMessage, selectedModel, onModelChange }: StyleAdviceProps) => {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAnalyzing]);

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

  const renderMessage = (message: Message, index: number) => {
    const isUser = message.role === 'user';
    return (
      <div key={index} className={`flex gap-3 mb-6 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <Avatar className="w-9 h-9 flex-shrink-0">
          <AvatarFallback className={isUser 
            ? "bg-blue-600 text-white" 
            : "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
          }>
            {isUser ? (
              <User className="h-4 w-4" />
            ) : (
              <Bot className="h-4 w-4" />
            )}
          </AvatarFallback>
        </Avatar>
        
        <div className={`flex flex-col max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
            isUser 
              ? 'bg-blue-600 text-white' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
          }`}>
            {message.content}
          </div>
          <div className={`text-xs text-slate-500 dark:text-slate-400 mt-2 ${isUser ? 'text-right' : 'text-left'}`}>
            {isUser ? 'You' : 'Alex AI'} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    );
  };

  const renderThinkingIndicator = () => (
    <div className="flex gap-3 mb-6">
      <Avatar className="w-9 h-9 flex-shrink-0">
        <AvatarFallback className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col max-w-[85%] items-start">
        <div className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-400 ml-2">Alex is analyzing...</span>
          </div>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          AI is thinking • analyzing your style
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-slate-200/50 dark:border-slate-700/50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white dark:border-slate-900 ${isAnalyzing ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></div>
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">Alex AI</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Style Consultant</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 px-3 py-2">
            <Zap className="h-3 w-3 text-slate-500 dark:text-slate-400" />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              {isAnalyzing ? 'Analyzing' : 'Ready'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          <Select value={selectedModel} onValueChange={onModelChange}>
            <SelectTrigger className="h-9 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
              <SelectValue placeholder="Select AI model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4o-mini">GPT-4o Mini (Fast)</SelectItem>
              <SelectItem value="gpt-4o">GPT-4o (Advanced)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-6 py-6"
      >
        {messages.length === 0 && !isAnalyzing ? (
          <div className="text-center py-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
              <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              Hello, I'm Alex!
            </h3>
            <p className="mx-auto mb-6 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Your personal AI style advisor, ready to help elevate your fashion game with personalized recommendations.
            </p>
            <div className="mx-auto grid max-w-xs grid-cols-1 gap-3">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 p-3">
                <Camera className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                <span className="text-xs text-slate-600 dark:text-slate-400">Camera captures automatically</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 p-3">
                <ImageIcon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                <span className="text-xs text-slate-600 dark:text-slate-400">Or upload photos manually</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => renderMessage(message, index))}
            {isAnalyzing && renderThinkingIndicator()}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
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
    </div>
  );
};

export default StyleAdvice;
