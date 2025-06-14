
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const App = () => {
  const [initialImageURL, setInitialImageURL] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const analyzeStyle = async () => {
      if (!initialImageURL) {
        setMessages([]);
        return;
      }

      setIsAnalyzing(true);
      setMessages([]);

      try {
        console.log('Sending image for style analysis...');
        const { data, error } = await supabase.functions.invoke('style-advisor', {
          body: { capturedImage: initialImageURL }
        });

        if (error) {
          console.error('Error calling style-advisor function:', error);
          throw error;
        }

        console.log('Received style advice:', data);
        
        // Add the first AI message to the conversation
        if (data && data.analysis) {
          setMessages([{ role: 'assistant' as const, content: data.analysis }]);
        }
      } catch (error) {
        console.error('Failed to get style advice:', error);
        setMessages([{
          role: 'assistant' as const,
          content: 'Failed to analyze your style. Please try again.'
        }]);
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeStyle();
  }, [initialImageURL]);

  const handleSendMessage = async (newMessage: string) => {
    // Create updated messages array with user's new message
    const updatedMessages: Message[] = [...messages, { role: 'user' as const, content: newMessage }];
    
    // Update state immediately to show user's message
    setMessages(updatedMessages);
    setIsAnalyzing(true);

    try {
      console.log('Sending follow-up message...');
      const { data, error } = await supabase.functions.invoke('style-advisor', {
        body: { messages: updatedMessages }
      });

      if (error) {
        console.error('Error calling style-advisor function:', error);
        throw error;
      }

      console.log('Received follow-up response:', data);
      
      // Add AI response to messages
      if (data && data.response) {
        setMessages(prev => [...prev, { role: 'assistant' as const, content: data.response }]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsAnalyzing(false);
    }
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
                />
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
