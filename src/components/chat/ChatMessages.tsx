
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, User } from "lucide-react";
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
        className={`flex gap-2 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
      >
        {!isUser && (
          <Avatar className="w-8 h-8 flex-shrink-0 mt-1">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
              <Sparkles className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className={`flex flex-col max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
          {hasImage && (
            <div className="mb-2">
              <img 
                src={message.visual_context} 
                alt="Shared image" 
                className="rounded-xl max-w-48 h-auto border border-gray-200 dark:border-gray-700 shadow-sm"
                onError={(e) => {
                  console.error('Error loading image:', message.visual_context);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          
          <div className={`px-4 py-2 rounded-2xl max-w-full break-words shadow-sm ${
            isUser 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
          }`}>
            <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
          </div>
          
          <div className={`text-xs text-gray-500 dark:text-gray-400 mt-1 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {message.created_at ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        
        {isUser && (
          <Avatar className="w-8 h-8 flex-shrink-0 mt-1">
            <AvatarFallback className="bg-blue-500 text-white text-xs">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  };

  const renderThinkingIndicator = () => (
    <div className="flex gap-2 mb-4 justify-start">
      <Avatar className="w-8 h-8 flex-shrink-0 mt-1">
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
          <Sparkles className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col max-w-[75%] items-start">
        <div className="px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-12 px-6">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
        <Sparkles className="h-8 w-8 text-white" />
      </div>
      <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
        Hi, I'm Alex!
      </h3>
      <p className="mx-auto mb-6 max-w-sm text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
        Your personal AI style advisor. Share a photo of your outfit and I'll help you improve your style.
      </p>
    </div>
  );

  return (
    <div className="flex-1 bg-white dark:bg-gray-900 overflow-hidden">
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
