
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
import { PanelLeft, PanelLeftClose, Sparkles, Video, Camera, MessageSquare, Zap } from "lucide-react";

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Modern Glass Header */}
        <header className="sticky top-0 z-50 border-b border-white/20 dark:border-gray-800/50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl shadow-lg">
          <div className="container flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setShowChatHistory(!showChatHistory)}
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200"
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
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 shadow-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Style AI</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Powered by Alex</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <AuthButton user={user} onAuthChange={onAuthChange} />
              <Separator orientation="vertical" className="h-6" />
              <ThemeToggle />
            </div>
          </div>
        </header>
        
        <div className="flex h-[calc(100vh-4rem)]">
          {/* Modern Sidebar */}
          <aside className={`${showChatHistory ? 'w-80' : 'w-0'} transition-all duration-300 ease-in-out overflow-hidden border-r border-white/20 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm`}>
            <div className="h-full">
              <div className="p-4 border-b border-gray-100/50 dark:border-gray-800/50">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  <h2 className="font-semibold text-gray-900 dark:text-white">Chat History</h2>
                </div>
                <ChatHistory onSessionChange={onSessionChange} />
              </div>
            </div>
          </aside>
          
          <main className="flex flex-1 gap-0">
            {/* Main Content Area with Modern Design */}
            <section className="flex-1 min-w-0 p-6">
              <Card className="h-full border-0 shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl overflow-hidden">
                <CardContent className="p-0 h-full">
                  {isVideoMode ? (
                    <div className="h-full flex flex-col">
                      <div className="flex items-center justify-between p-6 border-b border-gray-100/50 dark:border-gray-800/50 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                            <Video className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Video Chat with Alex</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered style consultation</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700 px-3 py-1 rounded-full font-medium">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                          {videoConversationUrl ? 'Connected' : 'Connecting...'}
                        </Badge>
                      </div>
                      
                      <div className="flex-1 bg-gradient-to-br from-gray-900 to-black rounded-b-3xl overflow-hidden">
                        {videoConversationUrl ? (
                          <iframe
                            src={videoConversationUrl}
                            className="w-full h-full border-0"
                            allow="camera; microphone; fullscreen"
                            title="Video Chat with Alex"
                          />
                        ) : (
                          <div className="h-full flex items-center justify-center">
                            <div className="text-center space-y-4">
                              <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
                                <Video className="h-10 w-10 text-blue-400" />
                              </div>
                              <div>
                                <h3 className="text-xl font-semibold text-white mb-2">Starting Video Chat</h3>
                                <p className="text-gray-300">Connecting with Alex...</p>
                                <div className="flex justify-center mt-4">
                                  <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col">
                      <div className="flex items-center justify-between p-6 border-b border-gray-100/50 dark:border-gray-800/50 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                            <Camera className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Camera View</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Capture your style for analysis</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700 px-3 py-1 rounded-full font-medium">
                          <Zap className="w-3 h-3 mr-2" />
                          Ready
                        </Badge>
                      </div>
                      
                      <div className="flex-1 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 to-gray-900">
                        <div className="h-full rounded-2xl overflow-hidden shadow-inner">
                          <WebcamDisplay ref={webcamRef} />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
            
            {/* Chat Panel - Only show in text mode */}
            {!isVideoMode && (
              <section className="w-96 flex-shrink-0 border-l border-white/20 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
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
            )}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Index;
