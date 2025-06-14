import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sparkles, Send, Settings, User, Camera, Brain, Cpu, Plus, ImageIcon } from "lucide-react";
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
          // Send the uploaded image with a default message or prompt user for message
          const message = inputValue.trim() || "Analizează această imagine și dă-mi sfaturi de stil.";
          onSendMessage(message, result);
          setInputValue("");
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset the input so the same file can be selected again
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
      <div key={index} className={`flex gap-3 mb-6 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fade-in`}>
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className={isUser 
            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-medium" 
            : "bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white"
          }>
            {isUser ? (
              <User className="h-4 w-4" />
            ) : (
              <div className="relative">
                <Brain className="h-4 w-4" />
                <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full"></div>
              </div>
            )}
          </AvatarFallback>
        </Avatar>
        
        <div className={`flex flex-col max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words shadow-sm ${
            isUser 
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' 
              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
          }`}>
            {message.content}
          </div>
          <div className={`text-xs text-slate-400 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {isUser ? 'You' : 'Alex AI'} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    );
  };

  const renderThinkingIndicator = () => (
    <div className="flex gap-3 mb-6 animate-fade-in">
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white">
          <div className="relative">
            <Brain className="h-4 w-4 animate-pulse" />
            <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></div>
          </div>
        </AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col max-w-[85%] items-start">
        <div className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-400 ml-2">Alex is thinking...</span>
          </div>
        </div>
        <div className="text-xs text-slate-400 mt-1">
          Alex AI • analyzing your style
        </div>
      </div>
    </div>
  );

  return (
    <Card className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
      <CardHeader className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50 pb-3 pt-3 flex-shrink-0">
        <CardTitle className="flex items-center justify-between text-slate-800 dark:text-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-100 via-indigo-100 to-blue-100 dark:from-purple-900/30 dark:via-indigo-900/30 dark:to-blue-900/30 rounded-xl shadow-md">
              <div className="relative">
                <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <Sparkles className="h-2 w-2 text-yellow-500 absolute -top-1 -right-1" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">Alex AI</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Style Advisor</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {isAnalyzing ? 'Thinking' : 'Ready'}
              </span>
            </div>
          </div>
        </CardTitle>
        
        <div className="flex items-center gap-2 pt-2">
          <Settings className="h-3 w-3 text-slate-500" />
          <Select value={selectedModel} onValueChange={onModelChange}>
            <SelectTrigger className="w-40 h-8 text-xs bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700">
              <SelectValue placeholder="Select AI model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4o-mini">GPT-4o Mini (Fast)</SelectItem>
              <SelectItem value="gpt-4o">GPT-4o (Advanced)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="flex flex-col h-full p-0 overflow-hidden">
        {/* Chat Messages Container - Fixed Height with Scroll */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-4 py-4 min-h-0 scroll-smooth"
          style={{ maxHeight: 'calc(100vh - 300px)' }}
        >
          {messages.length === 0 && !isAnalyzing ? (
            <div className="text-center py-12">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-purple-100 via-indigo-100 to-blue-100 dark:from-purple-900/30 dark:via-indigo-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <div className="relative">
                  <Brain className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                  <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
                </div>
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-semibold mb-2 text-lg">Hello, I'm Alex!</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                Your personal AI style advisor, ready to help elevate your fashion game
              </p>
              <div className="flex flex-col items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-xl p-3 mx-4">
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  <span>Camera captures automatically</span>
                </div>
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  <span>Or upload photos manually</span>
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

        {/* Input Form - Fixed at Bottom */}
        <div className="border-t border-slate-200/50 dark:border-slate-700/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm p-4 flex-shrink-0">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <Button
              type="button"
              onClick={handleUploadClick}
              size="sm"
              variant="outline"
              disabled={isAnalyzing}
              className="h-10 px-3 bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
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
              placeholder={isAnalyzing ? "Alex is thinking..." : "Ask Alex about style, trends, or fashion advice..."}
              className="flex-1 h-10 bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 focus:border-purple-400 dark:focus:border-purple-500 transition-colors text-sm px-3"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isAnalyzing}
            />
            <Button 
              type="submit" 
              size="sm"
              disabled={isAnalyzing || !inputValue.trim()}
              className="h-10 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isAnalyzing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default StyleAdvice;
