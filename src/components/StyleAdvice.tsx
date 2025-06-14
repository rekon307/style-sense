
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Send, Settings, Bot, User, Camera } from "lucide-react";
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
        <div className={`flex items-start gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser 
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' 
              : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
          }`}>
            {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </div>
          <div
            className={`p-4 rounded-2xl shadow-sm border backdrop-blur-sm ${
              isUser
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-500/20'
                : 'bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 border-slate-200/50 dark:border-slate-700/50'
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderTypingIndicator = () => (
    <div className="flex justify-start mb-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-purple-700 text-white flex items-center justify-center">
          <Bot className="h-4 w-4" />
        </div>
        <div className="bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 p-4 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
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
      <CardHeader className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50">
        <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-slate-200">
          <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
            <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <span className="font-semibold">AI Style Advisor</span>
        </CardTitle>
        
        {/* Model Selector */}
        <div className="flex items-center gap-3 pt-3">
          <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <Settings className="h-4 w-4 text-slate-500" />
          </div>
          <Select value={selectedModel} onValueChange={onModelChange}>
            <SelectTrigger className="w-48 bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700">
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
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-semibold mb-2">Ready to help with your style!</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Ask me anything about fashion and style trends
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-lg p-3 mx-4">
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
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              type="text"
              placeholder="Ask about style, trends, or fashion advice..."
              className="flex-1 bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 focus:border-purple-400 dark:focus:border-purple-500 transition-colors"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isAnalyzing}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isAnalyzing || !inputValue.trim()}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50"
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
