
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, User, Zap } from "lucide-react";
import { useEffect, useRef } from "react";
import { Message } from "@/types/chat";

interface ChatMessagesProps {
  messages: Message[];
  isAnalyzing: boolean;
}

const ChatMessages = ({ messages, isAnalyzing }: ChatMessagesProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: "smooth",
        block: "end"
      });
    }
  };

  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages, isAnalyzing]);

  const renderMessage = (message: Message, index: number) => {
    const isUser = message.role === 'user';
    const hasImage = message.visual_context && message.visual_context.length > 0;
    
    return (
      <div 
        key={message.id || index} 
        className={`flex gap-2 mb-3 ${isUser ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-200`}
      >
        {!isUser && (
          <Avatar className="w-7 h-7 flex-shrink-0 mt-0.5">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 text-white text-xs">
              <Sparkles className="h-3.5 w-3.5" />
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className={`flex flex-col max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
          {hasImage && (
            <div className="mb-2">
              <img 
                src={message.visual_context} 
                alt="Shared image" 
                className="rounded-xl max-w-40 h-auto border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow duration-200"
                onError={(e) => {
                  console.error('Error loading image:', message.visual_context);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          
          <div className={`px-3 py-2 rounded-2xl max-w-full break-words shadow-sm transition-all duration-200 ${
            isUser 
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md' 
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200/30 dark:border-gray-700/30 rounded-bl-md'
          }`}>
            <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
          </div>
          
          <div className={`text-xs text-gray-400 dark:text-gray-500 mt-1 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {message.created_at ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        
        {isUser && (
          <Avatar className="w-7 h-7 flex-shrink-0 mt-0.5">
            <AvatarFallback className="bg-gradient-to-br from-gray-500 to-gray-600 text-white text-xs">
              <User className="h-3.5 w-3.5" />
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  };

  const renderThinkingIndicator = () => (
    <div className="flex gap-2 mb-3 justify-start animate-in slide-in-from-bottom-2 duration-200">
      <Avatar className="w-7 h-7 flex-shrink-0 mt-0.5">
        <AvatarFallback className="bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 text-white text-xs">
          <Sparkles className="h-3.5 w-3.5" />
        </AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col max-w-[75%] items-start">
        <div className="px-3 py-2 rounded-2xl rounded-bl-md bg-white dark:bg-gray-800 border border-gray-200/30 dark:border-gray-700/30 shadow-sm">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">thinking...</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="py-6 px-3">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex-shrink-0 shadow-lg">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Hi, I'm Alex!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-2 text-sm">
            Your personal AI style advisor. Share a photo of your outfit and I'll help you elevate your style.
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Zap className="w-3 h-3" />
            <span>Ready to analyze your style</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-gradient-to-b from-gray-50/30 to-white dark:from-gray-900/30 dark:to-gray-900 overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-3">
          {messages.length === 0 && !isAnalyzing ? (
            renderEmptyState()
          ) : (
            <>
              {messages.map((message, index) => renderMessage(message, index))}
              {isAnalyzing && renderThinkingIndicator()}
            </>
          )}
          <div ref={messagesEndRef} className="h-1" />
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatMessages;
