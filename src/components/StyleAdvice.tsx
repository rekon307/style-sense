
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sparkles, Send, Settings, User, Camera, Brain, Cpu } from "lucide-react";
import { useState } from "react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface StyleAdviceProps {
  messages: Message[];
  isAnalyzing: boolean;
  onSendMessage: (message: string) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const StyleAdvice = ({ messages, isAnalyzing, onSendMessage, selectedModel, onModelChange }: StyleAdviceProps) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  const renderMessage = (message: Message, index: number) => {
    const isUser = message.role === 'user';
    return (
      <div
        key={index}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}
      >
        {isUser ? (
          // User message - keep original layout with avatar on the right
          <div className="flex items-start gap-3 w-full max-w-[95%] flex-row-reverse">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-medium">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 px-4 py-3 rounded-2xl shadow-sm border backdrop-blur-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-500/20">
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
            </div>
          </div>
        ) : (
          // AI message - avatar on top, message below
          <div className="w-full max-w-[95%] flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="w-9 h-9 flex-shrink-0">
                <AvatarFallback className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white">
                  <div className="relative">
                    <Brain className="h-5 w-5" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Alex</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">AI Style Advisor</span>
              </div>
            </div>
            <div className="w-full px-4 py-4 rounded-2xl shadow-sm border backdrop-blur-sm bg-white/95 dark:bg-slate-800/95 text-slate-900 dark:text-slate-100 border-slate-200/50 dark:border-slate-700/50">
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTypingIndicator = () => (
    <div className="flex justify-start mb-6">
      <div className="w-full max-w-[95%] flex flex-col">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-9 h-9 flex-shrink-0">
            <AvatarFallback className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white">
              <div className="relative">
                <Brain className="h-5 w-5 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
              </div>
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Alex</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">AI Style Advisor</span>
          </div>
        </div>
        <div className="w-full bg-white/95 dark:bg-slate-800/95 text-slate-900 dark:text-slate-100 px-4 py-3 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
      <CardHeader className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50 pb-3 pt-3">
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
          
          {/* User and AI icons in header */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <User className="h-3 w-3 text-blue-600" />
              <Cpu className="h-3 w-3 text-purple-600" />
            </div>
          </div>
        </CardTitle>
        
        {/* Model Selector - more compact */}
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
      
      <CardContent className="flex flex-col h-full p-0">
        {/* Chat Log */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {messages.length === 0 ? (
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
              <div className="flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-xl p-3 mx-4">
                <Camera className="h-4 w-4" />
                <span>Photos are automatically captured when you send a message</span>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => renderMessage(message, index))}
              {isAnalyzing && renderTypingIndicator()}
            </>
          )}
        </div>

        {/* Input Form */}
        <div className="border-t border-slate-200/50 dark:border-slate-700/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm p-4">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <Input
              type="text"
              placeholder="Ask Alex about style, trends, or fashion advice..."
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
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default StyleAdvice;
