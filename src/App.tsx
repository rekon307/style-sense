
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

const App = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [styleAdvice, setStyleAdvice] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const analyzeStyle = async () => {
      if (!capturedImage) {
        setStyleAdvice(null);
        return;
      }

      setIsAnalyzing(true);
      setStyleAdvice(null);

      try {
        console.log('Sending image for style analysis...');
        const { data, error } = await supabase.functions.invoke('style-advisor', {
          body: { capturedImage }
        });

        if (error) {
          console.error('Error calling style-advisor function:', error);
          throw error;
        }

        console.log('Received style advice:', data);
        setStyleAdvice(data);
      } catch (error) {
        console.error('Failed to get style advice:', error);
        setStyleAdvice({
          error: 'Failed to analyze your style. Please try again.'
        });
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeStyle();
  }, [capturedImage]);

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
                  capturedImage={capturedImage} 
                  setCapturedImage={setCapturedImage}
                  styleAdvice={styleAdvice}
                  isAnalyzing={isAnalyzing}
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
