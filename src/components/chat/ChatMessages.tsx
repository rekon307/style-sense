
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Camera, User } from "lucide-react";
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
        className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      >
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className={isUser 
            ? "bg-blue-600 text-white" 
            : "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
          }>
            {isUser ? (
              <User className="h-4 w-4" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </AvatarFallback>
        </Avatar>
        
        <div className={`flex flex-col max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
          {hasImage && isUser && (
            <div className="mb-2 max-w-60">
              <img 
                src={message.visual_context} 
                alt="Shared image" 
                className="rounded-2xl max-w-full h-auto border border-slate-200 dark:border-slate-700"
                onLoad={() => console.log('✅ Image loaded successfully')}
                onError={(e) => {
                  console.error('❌ Image failed to load:', e);
                }}
              />
            </div>
          )}
          
          <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
            isUser 
              ? 'bg-blue-600 text-white rounded-br-md shadow-md' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-md shadow-sm'
          }`}>
            {message.content}
          </div>
          
          <div className={`text-xs text-slate-500 dark:text-slate-400 mt-1 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {message.created_at ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    );
  };

  const renderThinkingIndicator = () => (
    <div className="flex gap-3 mb-4">
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
          <Sparkles className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col max-w-[75%] items-start">
        <div className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 rounded-bl-md shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-400 ml-2">Alex is thinking...</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-16 px-6">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
        <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="mb-3 text-xl font-semibold text-slate-900 dark:text-slate-100">
        Hi, I'm Alex!
      </h3>
      <p className="mx-auto mb-6 max-w-sm text-base leading-relaxed text-slate-600 dark:text-slate-400">
        Your personal AI style advisor, ready to help you improve your wardrobe with personalized recommendations.
      </p>
      <div className="mx-auto grid max-w-sm grid-cols-1 gap-3">
        <div className="flex items-center gap-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3">
          <Camera className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          <span className="text-sm text-slate-600 dark:text-slate-400">Camera captures automatically</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-white dark:bg-slate-900">
      <ScrollArea className="h-full">
        <div className="p-4">
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
