
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sparkles, Camera, ImageIcon, User } from "lucide-react";
import { useEffect, useRef } from "react";
import { Message } from "@/types/chat";

interface ChatMessagesProps {
  messages: Message[];
  isAnalyzing: boolean;
}

const ChatMessages = ({ messages, isAnalyzing }: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAnalyzing]);

  const renderMessage = (message: Message, index: number) => {
    const isUser = message.role === 'user';
    const hasImage = message.visual_context && message.visual_context.length > 0;
    
    return (
      <div key={message.id || index} className={`flex gap-2 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <Avatar className="w-7 h-7 flex-shrink-0">
          <AvatarFallback className={isUser 
            ? "bg-blue-600 text-white text-xs" 
            : "bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xs"
          }>
            {isUser ? (
              <User className="h-3 w-3" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
          </AvatarFallback>
        </Avatar>
        
        <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
            isUser 
              ? 'bg-blue-600 text-white rounded-br-sm' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-sm'
          }`}>
            {message.content}
          </div>
          
          {hasImage && isUser && (
            <div className="mt-2 max-w-32">
              <img 
                src={message.visual_context} 
                alt="Shared image" 
                className="rounded-lg max-w-full h-auto border border-slate-200 dark:border-slate-700"
              />
              <p className="text-xs text-slate-500 mt-1">📷 Imagine trimisă</p>
            </div>
          )}
          
          <div className={`text-xs text-slate-500 dark:text-slate-400 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {isUser ? 'Tu' : 'Alex AI'} • {message.created_at ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    );
  };

  const renderThinkingIndicator = () => (
    <div className="flex gap-2 mb-4">
      <Avatar className="w-7 h-7 flex-shrink-0">
        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xs">
          <Sparkles className="h-3 w-3" />
        </AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col max-w-[80%] items-start">
        <div className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 rounded-bl-sm">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-400 ml-1">Alex analizează...</span>
          </div>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          AI gândește • analizează stilul tău
        </div>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-8">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
        <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="mb-2 text-base font-semibold text-slate-900 dark:text-slate-100">
        Salut, sunt Alex!
      </h3>
      <p className="mx-auto mb-4 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        Consilierul tău personal AI de stil, gata să te ajut să îți îmbunătățești garderoba cu recomandări personalizate.
      </p>
      <div className="mx-auto grid max-w-xs grid-cols-1 gap-2">
        <div className="flex items-center gap-2 rounded-lg bg-slate-50/50 dark:bg-slate-800/30 p-2">
          <Camera className="h-3 w-3 text-slate-600 dark:text-slate-400" />
          <span className="text-xs text-slate-600 dark:text-slate-400">Camera capturează automat</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-slate-50/50 dark:bg-slate-800/30 p-2">
          <ImageIcon className="h-3 w-3 text-slate-600 dark:text-slate-400" />
          <span className="text-xs text-slate-600 dark:text-slate-400">Sau încarcă manual</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      {messages.length === 0 && !isAnalyzing ? (
        renderEmptyState()
      ) : (
        <>
          {messages.map((message, index) => renderMessage(message, index))}
          {isAnalyzing && renderThinkingIndicator()}
        </>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
