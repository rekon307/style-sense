
import { useRef, useState } from "react";
import WebcamDisplay, { WebcamDisplayRef } from "@/components/WebcamDisplay";
import StyleAdvice from "@/components/StyleAdvice";
import ChatHistory from "@/components/ChatHistory";
import AuthButton from "@/components/AuthButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { PanelLeft, PanelLeftClose, Sparkles, Cpu } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface IndexProps {
  messages: Message[];
  isAnalyzing: boolean;
  handleSendMessage: (message: string, image?: string | null, temperature?: number) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  currentSessionId: string | null;
  onSessionChange: (sessionId: string | null) => void;
  user: any;
  onAuthChange: () => void;
}

const Index = ({ 
  messages, 
  isAnalyzing, 
  handleSendMessage,
  selectedModel,
  onModelChange,
  currentSessionId,
  onSessionChange,
  user,
  onAuthChange
}: IndexProps) => {
  const webcamRef = useRef<WebcamDisplayRef>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showChatHistory, setShowChatHistory] = useState(true);

  // Enhanced cognitive message handler
  const handleCognitiveMessage = (message: string, image?: string | null, temperature?: number) => {
    console.log('=== ALEX COGNITIVE PROCESSING ===');
    console.log('Message:', message);
    console.log('Has image:', !!image);
    console.log('Cognitive Temperature:', temperature);
    console.log('Chain-of-Thought Mode: Active');
    
    handleSendMessage(message, image, temperature);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Enhanced Header with Cognitive Indicators */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setShowChatHistory(!showChatHistory)}
              variant="ghost"
              size="sm"
              className="h-9 px-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
            >
              {showChatHistory ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeft className="h-4 w-4" />
              )}
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-green-500 dark:border-slate-900">
                  <Cpu className="h-2 w-2 text-white m-0.5" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                  AI Style - Alex
                </h1>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Cognitive Architecture</p>
                  <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-xs text-green-600 dark:text-green-400">Active</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <AuthButton user={user} onAuthChange={onAuthChange} />
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className={`${showChatHistory ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden`}>
          <div className="h-full border-r border-slate-200/50 dark:border-slate-700/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm">
            <div className="p-6">
              <ChatHistory onSessionChange={onSessionChange} />
            </div>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex flex-1 gap-6 p-6">
          {/* Camera Section */}
          <section className="flex-1 min-w-0">
            <div className="h-full rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 shadow-xl shadow-black/5">
              <WebcamDisplay ref={webcamRef} videoRef={videoRef} />
            </div>
          </section>
          
          {/* Chat Section */}
          <section className="w-[420px] flex-shrink-0">
            <div className="h-full rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 shadow-xl shadow-black/5">
              <StyleAdvice 
                messages={messages} 
                isAnalyzing={isAnalyzing}
                onSendMessage={handleCognitiveMessage}
                selectedModel={selectedModel}
                onModelChange={onModelChange}
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Index;
