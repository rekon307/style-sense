
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Camera, ImageIcon, User } from "lucide-react";
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
    console.log('Message index:', index);
    console.log('Is user:', isUser);
    console.log('Has image:', hasImage);
    if (hasImage) {
      console.log('Image data length:', message.visual_context?.length);
      console.log('Image starts with:', message.visual_context?.substring(0, 30));
    }
    
    return (
      <div 
        key={message.id || index} 
        className={`flex gap-3 mb-6 animate-fade-in ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className={isUser 
            ? "bg-blue-600 text-white text-xs" 
            : "bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xs"
          }>
            {isUser ? (
              <User className="h-4 w-4" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </AvatarFallback>
        </Avatar>
        
        <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
          {/* Show image first if it exists and it's a user message */}
          {hasImage && isUser && (
            <div className="mb-2 max-w-60 animate-scale-in">
              <img 
                src={message.visual_context} 
                alt="Shared image" 
                className="rounded-lg max-w-full h-auto border border-slate-200 dark:border-slate-700 transition-transform duration-200 hover:scale-105"
                onLoad={() => console.log('✅ Image loaded successfully')}
                onError={(e) => {
                  console.error('❌ Image failed to load:', e);
                  console.error('Image src:', message.visual_context?.substring(0, 100));
                }}
              />
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <Camera className="h-3 w-3" />
                Image shared
              </p>
            </div>
          )}
          
          {/* Message content */}
          <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words transition-all duration-300 hover:shadow-md ${
            isUser 
              ? 'bg-blue-600 text-white rounded-br-md' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-md'
          }`}>
            {message.content}
          </div>
          
          {/* Timestamp */}
          <div className={`text-xs text-slate-500 dark:text-slate-400 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {isUser ? 'You' : 'Alex AI'} • {message.created_at ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    );
  };

  const renderThinkingIndicator = () => (
    <div className="flex gap-3 mb-6 animate-fade-in">
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xs">
          <Sparkles className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col max-w-[80%] items-start">
        <div className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 rounded-bl-md">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-400 ml-2">Alex is analyzing...</span>
          </div>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          AI thinking • analyzing your style
        </div>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-12 animate-fade-in">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
        <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="mb-3 text-xl font-semibold text-slate-900 dark:text-slate-100">
        Hi, I'm Alex!
      </h3>
      <p className="mx-auto mb-6 max-w-sm text-base leading-relaxed text-slate-500 dark:text-slate-400">
        Your personal AI style advisor, ready to help you improve your wardrobe with personalized recommendations.
      </p>
      <div className="mx-auto grid max-w-sm grid-cols-1 gap-3">
        <div className="flex items-center gap-3 rounded-lg bg-slate-50/50 dark:bg-slate-800/30 p-3 transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-700/30">
          <Camera className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          <span className="text-sm text-slate-600 dark:text-slate-400">Camera captures automatically</span>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-slate-50/50 dark:bg-slate-800/30 p-3 transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-700/30">
          <ImageIcon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          <span className="text-sm text-slate-600 dark:text-slate-400">Or upload manually</span>
        </div>
      </div>
    </div>
  );

  return (
    <ScrollArea className="flex-1 px-6">
      <div className="py-6">
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
  );
};

export default ChatMessages;
