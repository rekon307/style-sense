
import { useRef, useState } from "react";
import WebcamDisplay, { WebcamDisplayRef } from "@/components/WebcamDisplay";
import StyleAdvice from "@/components/StyleAdvice";
import ChatHistory from "@/components/ChatHistory";
import AuthButton from "@/components/AuthButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PanelLeft, PanelLeftClose, Sparkles, Video, Camera } from "lucide-react";

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
  const [isVideoMode, setIsVideoMode] = useState(true);
  const [videoConversationUrl, setVideoConversationUrl] = useState<string | null>(null);

  const handleCognitiveMessage = (message: string, image?: string | null, temperature: number = 0.5) => {
    console.log('=== ALEX COGNITIVE PROCESSING ===');
    console.log('Message:', message);
    console.log('Has image:', !!image);
    console.log('Cognitive Temperature:', temperature);
    console.log('Chain-of-Thought Mode: Active');
    
    // Always use Style Mini (gpt-4o-mini) as the default and only model
    handleSendMessage(message, image, temperature);
  };

  const handleVideoModeChange = (newVideoMode: boolean) => {
    setIsVideoMode(newVideoMode);
    if (!newVideoMode) {
      setVideoConversationUrl(null);
    }
  };

  const handleVideoUrlChange = (url: string | null) => {
    setVideoConversationUrl(url);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Clean Header */}
        <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
          <div className="container flex h-14 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setShowChatHistory(!showChatHistory)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showChatHistory ? (
                      <PanelLeftClose className="h-4 w-4" />
                    ) : (
                      <PanelLeft className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{showChatHistory ? 'Hide history' : 'Show history'}</p>
                </TooltipContent>
              </Tooltip>
              
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Style AI</h1>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <AuthButton user={user} onAuthChange={onAuthChange} />
              <Separator orientation="vertical" className="h-5" />
              <ThemeToggle />
            </div>
          </div>
        </header>
        
        <div className="flex h-[calc(100vh-3.5rem)]">
          {/* Minimal Sidebar */}
          <aside className={`${showChatHistory ? 'w-72' : 'w-0'} transition-all duration-200 overflow-hidden border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900`}>
            <div className="h-full">
              <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                <ChatHistory onSessionChange={onSessionChange} />
              </div>
            </div>
          </aside>
          
          <main className="flex flex-1 gap-0">
            {/* Main Content Area */}
            <section className="flex-1 min-w-0 p-6">
              <Card className="h-full border-0 shadow-sm bg-white dark:bg-gray-900">
                <CardContent className="p-0 h-full">
                  {isVideoMode ? (
                    <div className="h-full flex flex-col rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                            <Video className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">Video Chat</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Live with Alex</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                          {videoConversationUrl ? 'Connected' : 'Connecting...'}
                        </Badge>
                      </div>
                      
                      <div className="flex-1 bg-black">
                        {videoConversationUrl ? (
                          <iframe
                            src={videoConversationUrl}
                            className="w-full h-full border-0"
                            allow="camera; microphone; fullscreen"
                            title="Video Chat with Alex"
                          />
                        ) : (
                          <div className="h-full flex items-center justify-center">
                            <div className="text-center space-y-3">
                              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
                                <Video className="h-8 w-8 text-blue-500 animate-pulse" />
                              </div>
                              <div>
                                <h3 className="text-lg font-medium text-white">Starting Video Chat</h3>
                                <p className="text-gray-300 text-sm">Connecting with Alex...</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <Camera className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">Camera</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Style analysis</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1 p-4">
                        <WebcamDisplay ref={webcamRef} />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
            
            {/* Chat Panel */}
            <section className="w-96 flex-shrink-0 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <StyleAdvice 
                messages={messages} 
                isAnalyzing={isAnalyzing}
                onSendMessage={handleCognitiveMessage}
                selectedModel={selectedModel}
                onModelChange={onModelChange}
                currentSessionId={currentSessionId}
                user={user}
                onVideoModeChange={handleVideoModeChange}
                onVideoUrlChange={handleVideoUrlChange}
              />
            </section>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Index;
