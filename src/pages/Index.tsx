
import { useRef, useState, useEffect } from "react";
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
import { PanelLeft, PanelLeftClose, Sparkles, Video, Camera, MessageSquare, Zap, Users } from "lucide-react";
import { useTavus } from "@/hooks/useTavus";

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
  const [isVideoMode, setIsVideoMode] = useState(true); // Default to video mode
  const [videoConversationUrl, setVideoConversationUrl] = useState<string | null>(null);
  
  const { endAllActiveConversations } = useTavus();
  
  // Track previous session ID to detect changes
  const previousSessionIdRef = useRef<string | null>(currentSessionId);

  const handleCognitiveMessage = (message: string, image?: string | null, temperature: number = 0.5) => {
    console.log('=== ALEX COGNITIVE PROCESSING ===');
    console.log('Message:', message);
    console.log('Has image:', !!image);
    console.log('Cognitive Temperature:', temperature);
    console.log('Chain-of-Thought Mode: Active');
    
    handleSendMessage(message, image, temperature);
  };

  const handleVideoModeChange = (newVideoMode: boolean) => {
    console.log('🔄 Index: Video mode changing to:', newVideoMode);
    setIsVideoMode(newVideoMode);
  };

  const handleVideoUrlChange = (url: string | null) => {
    console.log('🔗 Index: Video URL changed to:', url);
    setVideoConversationUrl(url);
  };

  const handleSessionChange = async (sessionId: string | null) => {
    console.log('🔄 Session changing from', previousSessionIdRef.current, 'to', sessionId);
    
    // If we're changing sessions and currently in video mode, end all conversations
    if (previousSessionIdRef.current !== sessionId && isVideoMode) {
      console.log('🛑 Session change detected - ending all active conversations');
      try {
        await endAllActiveConversations();
        setVideoConversationUrl(null);
      } catch (error) {
        console.error('Failed to end conversations on session change:', error);
      }
    }
    
    previousSessionIdRef.current = sessionId;
    onSessionChange(sessionId);
  };

  const handleAuthChange = async () => {
    console.log('🛑 Auth change detected - ending all active conversations');
    try {
      await endAllActiveConversations();
      setIsVideoMode(true); // Reset to default video mode
      setVideoConversationUrl(null);
    } catch (error) {
      console.error('Failed to end conversations on auth change:', error);
    }
    onAuthChange();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isVideoMode) {
        endAllActiveConversations().catch(console.error);
      }
    };
  }, []);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Unified Header with All Controls */}
        <header className="sticky top-0 z-50 border-b border-white/20 dark:border-gray-800/50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl shadow-lg">
          <div className="container flex h-20 items-center justify-between px-6">
            {/* Left Side - Logo and Navigation */}
            <div className="flex items-center gap-6">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setShowChatHistory(!showChatHistory)}
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200"
                  >
                    {showChatHistory ? (
                      <PanelLeftClose className="h-5 w-5" />
                    ) : (
                      <PanelLeft className="h-5 w-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{showChatHistory ? 'Hide history' : 'Show history'}</p>
                </TooltipContent>
              </Tooltip>
              
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Style AI</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Users className="w-3 h-3" />
                    Powered by Alex
                  </p>
                </div>
              </div>
            </div>
            
            {/* Center - Mode Toggle */}
            <div className="flex items-center gap-3 bg-gray-100/80 dark:bg-gray-800/80 p-2 rounded-xl">
              <Button
                variant={isVideoMode ? "default" : "ghost"}
                size="sm"
                onClick={() => handleVideoModeChange(true)}
                disabled={isAnalyzing}
                className={`flex items-center gap-2 h-10 px-6 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isVideoMode 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl' 
                    : 'hover:bg-white/50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-300'
                }`}
              >
                <Video className="h-4 w-4" />
                Video Chat
              </Button>
              <Button
                variant={!isVideoMode ? "default" : "ghost"}
                size="sm"
                onClick={() => handleVideoModeChange(false)}
                disabled={isAnalyzing}
                className={`flex items-center gap-2 h-10 px-6 text-sm font-medium rounded-lg transition-all duration-200 ${
                  !isVideoMode 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl' 
                    : 'hover:bg-white/50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-300'
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                Text Chat
              </Button>
            </div>
            
            {/* Right Side - User Controls */}
            <div className="flex items-center gap-4">
              <AuthButton user={user} onAuthChange={handleAuthChange} />
              <Separator orientation="vertical" className="h-8" />
              <ThemeToggle />
            </div>
          </div>
        </header>
        
        <div className="flex h-[calc(100vh-5rem)]">
          {/* Modern Sidebar */}
          <aside className={`${showChatHistory ? 'w-80' : 'w-0'} transition-all duration-300 ease-in-out overflow-hidden border-r border-white/20 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm`}>
            <div className="h-full">
              <div className="p-6 border-b border-gray-100/50 dark:border-gray-800/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Chat History</h2>
                </div>
                <ChatHistory onSessionChange={handleSessionChange} />
              </div>
            </div>
          </aside>
          
          <main className="flex flex-1 gap-0">
            {isVideoMode ? (
              /* Video Mode - Full Screen */
              <section className="flex-1 min-w-0 p-6">
                <Card className="h-full border-0 shadow-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl overflow-hidden">
                  <CardContent className="p-0 h-full">
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
                  </CardContent>
                </Card>
              </section>
            ) : (
              /* Text Mode - Split Layout */
              <>
                {/* Camera Section */}
                <section className="flex-1 min-w-0 p-6">
                  <Card className="h-full border-0 shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl overflow-hidden">
                    <CardContent className="p-0 h-full">
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
                          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700 px-4 py-2 rounded-full font-medium">
                            <Zap className="w-4 h-4 mr-2" />
                            Ready
                          </Badge>
                        </div>
                        
                        <div className="flex-1 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 to-gray-900">
                          <div className="h-full rounded-2xl overflow-hidden shadow-inner">
                            <WebcamDisplay ref={webcamRef} />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>
                
                {/* Chat Panel */}
                <section className="w-96 flex-shrink-0 border-l border-white/20 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-6">
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
              </>
            )}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Index;
