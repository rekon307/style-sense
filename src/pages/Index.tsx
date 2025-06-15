
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setShowChatHistory(!showChatHistory)}
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0"
            >
              {showChatHistory ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeft className="h-4 w-4" />
              )}
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-600">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                <Badge 
                  variant={isAnalyzing ? "default" : "secondary"} 
                  className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center ${
                    isAnalyzing ? 'animate-pulse bg-amber-500' : 'bg-green-500'
                  }`}
                >
                  <div className="h-2 w-2 rounded-full bg-white" />
                </Badge>
              </div>
              <div>
                <h1 className="text-xl font-bold">AI Style Assistant</h1>
                <p className="text-sm text-muted-foreground">
                  {isAnalyzing ? 'Analyzing...' : 'Ready to help'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <AuthButton user={user} onAuthChange={onAuthChange} />
            <Separator orientation="vertical" className="h-6" />
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className={`${showChatHistory ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden border-r`}>
          <div className="h-full bg-muted/30">
            <div className="p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Chat History</h2>
                <p className="text-sm text-muted-foreground">Previous conversations</p>
              </div>
              <ChatHistory onSessionChange={onSessionChange} />
            </div>
          </div>
        </aside>
        
        <main className="flex flex-1 gap-0">
          {/* Main Content Area */}
          <section className="flex-1 min-w-0 p-4">
            <Card className="h-full">
              <CardContent className="p-0 h-full">
                {isVideoMode ? (
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Video className="h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-semibold">Video Chat</h3>
                          <p className="text-sm text-muted-foreground">Live conversation with Alex</p>
                        </div>
                      </div>
                      <Badge variant="default" className="bg-green-500">
                        {videoConversationUrl ? 'Connected' : 'Connecting...'}
                      </Badge>
                    </div>
                    
                    <div className="flex-1">
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
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                              <Video className="h-10 w-10 text-primary animate-pulse" />
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold">Starting Video Chat</h3>
                              <p className="text-muted-foreground">Setting up your conversation with Alex</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Camera className="h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-semibold">Camera View</h3>
                          <p className="text-sm text-muted-foreground">Live camera feed for style analysis</p>
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
          
          {/* Style Advice Panel */}
          <section className="w-96 flex-shrink-0 border-l">
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
  );
};

export default Index;
