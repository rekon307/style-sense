
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useMessages } from "./hooks/useMessages";
import { useImageAnalysis } from "./hooks/useImageAnalysis";
import { useMessageHandler } from "./hooks/useMessageHandler";

const queryClient = new QueryClient();

const App = () => {
  const [initialImageURL, setInitialImageURL] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("gpt-4o-mini");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const {
    messages,
    setMessages,
    isAnalyzing,
    setIsAnalyzing,
    visualContext,
    setVisualContext
  } = useMessages(currentSessionId);

  useImageAnalysis({
    initialImageURL,
    selectedModel,
    currentSessionId,
    setCurrentSessionId,
    messages,
    setMessages,
    setIsAnalyzing,
    setVisualContext
  });

  const { handleSendMessage } = useMessageHandler({
    messages,
    setMessages,
    setIsAnalyzing,
    visualContext,
    selectedModel,
    currentSessionId,
    setCurrentSessionId
  });

  const handleSessionChange = (sessionId: string | null) => {
    setCurrentSessionId(sessionId);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                <Index 
                  initialImageURL={initialImageURL} 
                  setInitialImageURL={setInitialImageURL}
                  messages={messages}
                  isAnalyzing={isAnalyzing}
                  handleSendMessage={handleSendMessage}
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                  currentSessionId={currentSessionId}
                  onSessionChange={handleSessionChange}
                />
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
