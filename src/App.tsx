
import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AlexStateProvider } from "@/contexts/AlexStateContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useMessages } from "./hooks/useMessages";
import { useMessageHandler } from "./hooks/useMessageHandler";
import { useAuth } from "./hooks/useAuth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const App = () => {
  const [selectedModel, setSelectedModel] = useState<string>("gpt-4o-mini");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const { user, loading: authLoading } = useAuth();

  const {
    messages,
    setMessages,
    isAnalyzing,
    setIsAnalyzing
  } = useMessages(currentSessionId);

  const { handleSendMessage } = useMessageHandler({
    messages,
    setMessages,
    setIsAnalyzing,
    currentSessionId,
    setCurrentSessionId
  });

  const handleSessionChange = (sessionId: string | null) => {
    setCurrentSessionId(sessionId);
  };

  const handleAuthChange = () => {
    setCurrentSessionId(null);
    setMessages([]);
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
        <AlexStateProvider>
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
        </AlexStateProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
