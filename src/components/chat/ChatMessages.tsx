
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

  // Scroll to bottom whenever messages change or when analyzing starts/stops
  useEffect(() => {
    console.log('=== CHAT MESSAGES EFFECT ===');
    console.log('Messages count:', messages.length);
    console.log('Is analyzing:', isAnalyzing);
    
    // Small delay to ensure DOM has updated
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 50);
    
    return () => clearTimeout(timer);
  }, [messages, isAnalyzing]);

  // Additional scroll effect with longer delay for content rendering
  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 200);
    return () => clearTimeout(timer);
  }, [messages.length]);

  const renderMessage = (message: Message, index: number) => {
    const isUser = message.role === 'user';
    const hasImage = message.visual_context && message.visual_context.length > 0;
    
    console.log('=== RENDERING MESSAGE ===');
    console.log('Message ID:', message.id);
    console.log('Role:', message.role);
    console.log('Content preview:', message.content.substring(0, 50));
    console.log('Has image:', hasImage);
    
    return (
      <div 
        key={message.id || `message-${index}`} 
        className={`flex gap-2 mb-2 ${isUser ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-1 duration-200`}
      >
        {!isUser && (
          <Avatar className="w-6 h-6 flex-shrink-0 mt-0.5">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 text-white text-xs">
              <Sparkles className="h-3 w-3" />
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
          {hasImage && (
            <div className="mb-1">
              <img 
                src={message.visual_context} 
                alt="Shared image" 
                className="rounded-lg max-w-32 h-auto border border-gray-200/50 dark:border-gray-700/50 shadow-sm"
                onError={(e) => {
                  console.error('Error loading image:', message.visual_context);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          
          <div className={`px-2.5 py-1.5 rounded-xl max-w-full break-words text-sm leading-relaxed ${
            isUser 
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-sm' 
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200/30 dark:border-gray-700/30 rounded-bl-sm shadow-sm'
          }`}>
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
          
          <div className={`text-xs text-gray-400 dark:text-gray-500 mt-0.5 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {message.created_at ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        
        {isUser && (
          <Avatar className="w-6 h-6 flex-shrink-0 mt-0.5">
            <AvatarFallback className="bg-gradient-to-br from-gray-500 to-gray-600 text-white text-xs">
              <User className="h-3 w-3" />
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  };

  const renderThinkingIndicator = () => (
    <div className="flex gap-2 mb-2 justify-start animate-in slide-in-from-bottom-1 duration-200">
      <Avatar className="w-6 h-6 flex-shrink-0 mt-0.5">
        <AvatarFallback className="bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 text-white text-xs">
          <Sparkles className="h-3 w-3" />
        </AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col max-w-[80%] items-start">
        <div className="px-2.5 py-1.5 rounded-xl rounded-bl-sm bg-white dark:bg-gray-800 border border-gray-200/30 dark:border-gray-700/30 shadow-sm">
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1 h-1 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">thinking...</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="py-4 px-2">
      <div className="flex items-start gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex-shrink-0 shadow-lg">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Hi, I'm Alex!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-1 text-sm">
            Your personal AI style advisor. Share a photo of your outfit and I'll help you elevate your style.
          </p>
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Zap className="w-3 h-3" />
            <span>Ready to analyze your style</span>
          </div>
        </div>
      </div>
    </div>
  );

  console.log('=== CHAT MESSAGES RENDER ===');
  console.log('Total messages to render:', messages.length);
  console.log('Is analyzing:', isAnalyzing);

  return (
    <div className="flex-1 bg-gradient-to-b from-gray-50/30 to-white dark:from-gray-900/30 dark:to-gray-900 overflow-hidden">
      <ScrollArea ref={scrollAreaRef} className="h-full">
        <div className="p-2">
          {messages.length === 0 && !isAnalyzing ? (
            renderEmptyState()
          ) : (
            <>
              {messages.map((message, index) => {
                console.log(`Rendering message ${index + 1}/${messages.length}:`, message.id, message.role);
                return renderMessage(message, index);
              })}
              {isAnalyzing && renderThinkingIndicator()}
            </>
          )}
          <div ref={messagesEndRef} className="h-2" />
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatMessages;
