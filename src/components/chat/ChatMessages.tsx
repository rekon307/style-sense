
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
        className={`flex gap-2 mb-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      >
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className={isUser 
            ? "bg-gray-400 text-white text-xs" 
            : "bg-blue-600 text-white text-xs"
          }>
            {isUser ? (
              <User className="h-4 w-4" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </AvatarFallback>
        </Avatar>
        
        <div className={`flex flex-col max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
          {hasImage && isUser && (
            <div className="mb-2 max-w-48">
              <img 
                src={message.visual_context} 
                alt="Shared image" 
                className="rounded-xl max-w-full h-auto"
              />
            </div>
          )}
          
          <div className={`px-3 py-2 rounded-2xl text-sm max-w-full break-words ${
            isUser 
              ? 'bg-blue-600 text-white' 
              : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600'
          }`}>
            {message.content}
          </div>
          
          <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {message.created_at ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    );
  };

  const renderThinkingIndicator = () => (
    <div className="flex gap-2 mb-3">
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback className="bg-blue-600 text-white text-xs">
          <Sparkles className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col max-w-[70%] items-start">
        <div className="px-3 py-2 rounded-2xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-16 px-6">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
        <Sparkles className="h-8 w-8 text-blue-600" />
      </div>
      <h3 className="mb-3 text-xl font-medium text-gray-900 dark:text-gray-100">
        Hi, I'm Alex!
      </h3>
      <p className="mx-auto mb-6 max-w-sm text-base text-gray-600 dark:text-gray-400">
        Your personal AI style advisor, ready to help you improve your wardrobe.
      </p>
      <div className="mx-auto grid max-w-sm grid-cols-1 gap-3">
        <div className="flex items-center gap-3 rounded-lg bg-gray-100 dark:bg-gray-800 p-3">
          <Camera className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Camera captures automatically</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900">
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
