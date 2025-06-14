
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useMessages } from "./hooks/useMessages";
import { useImageAnalysis } from "./hooks/useImageAnalysis";
import { useMessageHandler } from "./hooks/useMessageHandler";
import { useAuth } from "./hooks/useAuth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  const [initialImageURL, setInitialImageURL] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("gpt-4o-mini");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const { user, loading: authLoading } = useAuth();

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
    console.log('Session changed to:', sessionId);
    setCurrentSessionId(sessionId);
  };

  const handleAuthChange = () => {
    // Force a refresh of sessions and messages when auth state changes
    setCurrentSessionId(null);
    setMessages([]);
    setVisualContext(null);
  };

  if (authLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="ai-style-advisor-theme">
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
                      user={user}
                      onAuthChange={handleAuthChange}
                    />
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
