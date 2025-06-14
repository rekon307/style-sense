
import { useRef, useState } from "react";
import WebcamDisplay, { WebcamDisplayRef } from "@/components/WebcamDisplay";
import StyleAdvice from "@/components/StyleAdvice";
import ChatHistory from "@/components/ChatHistory";
import AuthButton from "@/components/AuthButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { PanelLeft, PanelLeftClose, Sparkles2 } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface IndexProps {
  initialImageURL: string | null;
  setInitialImageURL: (image: string | null) => void;
  messages: Message[];
  isAnalyzing: boolean;
  handleSendMessage: (message: string, photoDataURL?: string | null) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  currentSessionId: string | null;
  onSessionChange: (sessionId: string | null) => void;
  user: any;
  onAuthChange: () => void;
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
  onSessionChange,
  user,
  onAuthChange
}: IndexProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const webcamRef = useRef<WebcamDisplayRef>(null);
  const [showChatHistory, setShowChatHistory] = useState(true);
  const [lastCapturedPhoto, setLastCapturedPhoto] = useState<string | null>(null);

  const handleSendMessageWithPhoto = async (message: string, uploadedImage?: string | null) => {
    console.log('=== PHOTO CAPTURE FLOW START ===');
    console.log('Attempting to send message with photo capture:', message);
    console.log('Uploaded image provided:', !!uploadedImage);
    
    let photoDataURL: string | null = null;
    
    // If an uploaded image is provided, use it directly
    if (uploadedImage) {
      photoDataURL = uploadedImage;
      console.log('Using uploaded image, size:', uploadedImage.length);
    } else {
      // Try to capture a new photo from webcam
      if (webcamRef.current) {
        console.log('Webcam ref available, attempting capture...');
        try {
          photoDataURL = webcamRef.current.capturePhoto();
          console.log('New photo capture result:', photoDataURL ? `Success (${photoDataURL.length} chars)` : 'Failed');
        } catch (error) {
          console.error('Error during photo capture:', error);
        }
      }
      
      // If no new photo captured, use the last captured photo from memory
      if (!photoDataURL && lastCapturedPhoto) {
        photoDataURL = lastCapturedPhoto;
        console.log('Using last captured photo from memory');
      }
      
      // If no photo captured and no memory, use the initial image if available
      if (!photoDataURL && initialImageURL) {
        photoDataURL = initialImageURL;
        console.log('Using initial image URL as fallback');
      }
    }
    
    // If we have a photo (uploaded, new, from memory, or initial), store it
    if (photoDataURL) {
      console.log('Setting photo for analysis, size:', photoDataURL.length);
      setInitialImageURL(photoDataURL);
      setLastCapturedPhoto(photoDataURL);
      console.log('Photo set for analysis and stored in memory');
    } else {
      console.warn('No photo available for analysis');
    }
    
    console.log('=== PHOTO CAPTURE FLOW END ===');
    
    // Send the message with the captured photo
    handleSendMessage(message, photoDataURL);
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Modern Header */}
      <header className="relative z-50 flex items-center justify-between px-6 py-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/20 dark:border-slate-800/20">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setShowChatHistory(!showChatHistory)}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
          >
            {showChatHistory ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeft className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">{showChatHistory ? 'Hide' : 'Show'} History</span>
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-xl flex items-center justify-center">
                <Sparkles2 className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">AI Style Advisor</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Your personal fashion AI</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <AuthButton user={user} onAuthChange={onAuthChange} />
          <ThemeToggle />
        </div>
      </header>
      
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className={`${showChatHistory ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-r border-slate-200/20 dark:border-slate-800/20`}>
          <div className="h-full p-6">
            <ChatHistory onSessionChange={onSessionChange} />
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 flex min-w-0 bg-slate-50 dark:bg-slate-950">
          {/* Camera Section */}
          <section className="flex-1 p-6">
            <div className="h-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
              <WebcamDisplay ref={webcamRef} videoRef={videoRef} />
            </div>
          </section>
          
          {/* Chat Section */}
          <section className="w-[420px] p-6">
            <div className="h-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
              <StyleAdvice 
                messages={messages} 
                isAnalyzing={isAnalyzing}
                onSendMessage={handleSendMessageWithPhoto}
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
