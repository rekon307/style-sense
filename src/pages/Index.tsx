
import { useRef } from "react";
import WebcamDisplay from "@/components/WebcamDisplay";
import Controls from "@/components/Controls";
import StyleAdvice from "@/components/StyleAdvice";
import ChatHistory from "@/components/ChatHistory";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { PanelLeft, PanelLeftClose } from "lucide-react";
import { useState } from "react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface IndexProps {
  initialImageURL: string | null;
  setInitialImageURL: (image: string | null) => void;
  messages: Message[];
  isAnalyzing: boolean;
  handleSendMessage: (message: string) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  currentSessionId: string | null;
  onSessionChange: (sessionId: string | null) => void;
}

const Index = ({ 
  initialImageURL, 
  setInitialImageURL, 
  messages, 
  isAnalyzing, 
  handleSendMessage,
  selectedModel,
  onModelChange,
  currentSessionId,
  onSessionChange
}: IndexProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showChatHistory, setShowChatHistory] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-700/25 bg-[size:32px_32px] opacity-50"></div>
      
      {/* Top Bar with Controls */}
      <div className="relative z-50 flex items-center justify-between p-4 border-b border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setShowChatHistory(!showChatHistory)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 hover:scale-105 shadow-md"
          >
            {showChatHistory ? (
              <>
                <PanelLeftClose className="h-4 w-4" />
                Hide History
              </>
            ) : (
              <>
                <PanelLeft className="h-4 w-4" />
                Show History
              </>
            )}
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-slate-100 dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent transition-colors duration-300">
              AI Style Advisor
            </h1>
          </div>
        </div>
        
        <ThemeToggle />
      </div>
      
      <div className="relative flex h-[calc(100vh-80px)]">
        {/* Chat History Sidebar */}
        <div className={`${showChatHistory ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden border-r border-slate-200/50 dark:border-slate-700/50 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm`}>
          <div className="h-full p-4">
            <ChatHistory onSessionChange={onSessionChange} />
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* Webcam Section - Larger */}
          <div className="flex-1 p-6 space-y-6">
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl h-[70vh]">
              <WebcamDisplay videoRef={videoRef} />
            </div>
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl p-6">
              <Controls 
                videoRef={videoRef} 
                capturedImage={initialImageURL} 
                setCapturedImage={setInitialImageURL} 
              />
            </div>
          </div>
          
          {/* Style Advice Panel */}
          <div className="w-96 p-6 border-l border-slate-200/50 dark:border-slate-700/50">
            <StyleAdvice 
              messages={messages} 
              isAnalyzing={isAnalyzing}
              onSendMessage={handleSendMessage}
              selectedModel={selectedModel}
              onModelChange={onModelChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
