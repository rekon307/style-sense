
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
    
    console.log('=== RENDERING MESSAGE ===');
    console.log('Message ID:', message.id);
    console.log('Has visual context:', hasImage);
    console.log('Visual context length:', message.visual_context?.length || 0);
    
    return (
      <div 
        key={message.id || index} 
        className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      >
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className={isUser 
            ? "bg-blue-500 text-white" 
            : "bg-gray-600 text-white"
          }>
            {isUser ? (
              <User className="h-4 w-4" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </AvatarFallback>
        </Avatar>
        
        <div className={`flex flex-col max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
          {hasImage && (
            <div className={`mb-2 ${isUser ? 'order-first' : 'order-first'}`}>
              <img 
                src={message.visual_context} 
                alt="Shared image" 
                className="rounded-lg max-w-48 h-auto border border-gray-200"
                onError={(e) => {
                  console.error('Error loading image:', message.visual_context);
                  e.currentTarget.style.display = 'none';
                }}
                onLoad={() => {
                  console.log('Image loaded successfully');
                }}
              />
            </div>
          )}
          
          <div className={`px-4 py-2 rounded-2xl max-w-full break-words ${
            isUser 
              ? 'bg-blue-500 text-white' 
              : 'bg-white border border-gray-200 text-gray-900'
          }`}>
            {message.content}
          </div>
          
          <span className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {message.created_at ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    );
  };

  const renderThinkingIndicator = () => (
    <div className="flex gap-3 mb-4">
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback className="bg-gray-600 text-white">
          <Sparkles className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col max-w-[75%] items-start">
        <div className="px-4 py-2 rounded-2xl bg-white border border-gray-200">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-16 px-6">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
        <Sparkles className="h-8 w-8 text-blue-600" />
      </div>
      <h3 className="mb-3 text-xl font-semibold text-gray-900">
        Hi, I'm Alex!
      </h3>
      <p className="mx-auto mb-6 max-w-sm text-gray-600">
        Your personal AI style advisor. Share a photo of your outfit and I'll help you improve your style.
      </p>
    </div>
  );

  return (
    <div className="flex-1 bg-gray-50">
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
