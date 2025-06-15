
import { useRef, useState } from "react";
import WebcamDisplay, { WebcamDisplayRef } from "@/components/WebcamDisplay";
import StyleAdvice from "@/components/StyleAdvice";
import ChatHistory from "@/components/ChatHistory";
import AuthButton from "@/components/AuthButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { PanelLeft, PanelLeftClose, Sparkles } from "lucide-react";

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
  const [showChatHistory, setShowChatHistory] = useState(true);

  const handleCognitiveMessage = (message: string, image?: string | null, temperature: number = 0.5) => {
    console.log('=== ALEX COGNITIVE PROCESSING ===');
    console.log('Message:', message);
    console.log('Has image:', !!image);
    console.log('Cognitive Temperature:', temperature);
    console.log('Chain-of-Thought Mode: Active');
    
    // Always use Style Mini (gpt-4o-mini) as the default and only model
    handleSendMessage(message, image, temperature);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowChatHistory(!showChatHistory)}
              variant="ghost"
              size="sm"
              className="h-8 px-2"
            >
              {showChatHistory ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeft className="h-4 w-4" />
              )}
            </Button>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border border-white ${isAnalyzing ? 'bg-amber-500 animate-pulse' : 'bg-green-500'} dark:border-slate-900`}></div>
              </div>
              <div>
                <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  AI Style
                </h1>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <AuthButton user={user} onAuthChange={onAuthChange} />
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      <div className="flex h-[calc(100vh-3.5rem)]">
        <aside className={`${showChatHistory ? 'w-72' : 'w-0'} transition-all duration-300 overflow-hidden border-r border-slate-200 dark:border-slate-800`}>
          <div className="h-full bg-white dark:bg-slate-900">
            <div className="p-4">
              <ChatHistory onSessionChange={onSessionChange} />
            </div>
          </div>
        </aside>
        
        <main className="flex flex-1 gap-0">
          <section className="flex-1 min-w-0 bg-slate-100 dark:bg-slate-800">
            <WebcamDisplay ref={webcamRef} />
          </section>
          
          <section className="w-96 flex-shrink-0 border-l border-slate-200 dark:border-slate-800">
            <StyleAdvice 
              messages={messages} 
              isAnalyzing={isAnalyzing}
              onSendMessage={handleCognitiveMessage}
              selectedModel={selectedModel}
              onModelChange={onModelChange}
              currentSessionId={currentSessionId}
            />
          </section>
        </main>
      </div>
    </div>
  );
};

export default Index;
