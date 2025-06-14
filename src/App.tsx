
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
  const [visualContext, setVisualContext] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("gpt-4o-mini");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Clear messages when starting a new session or no session is selected
  useEffect(() => {
    if (!currentSessionId) {
      setMessages([]);
      setVisualContext(null);
      setInitialImageURL(null);
    }
  }, [currentSessionId]);

  // Load messages when switching sessions
  useEffect(() => {
    const loadSessionMessages = async () => {
      if (!currentSessionId) return;

      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('session_id', currentSessionId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        
        const sessionMessages = data?.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })) || [];
        
        setMessages(sessionMessages);
        
        // Set visual context from the first message that has it
        const messageWithContext = data?.find(msg => msg.visual_context);
        if (messageWithContext) {
          setVisualContext(messageWithContext.visual_context);
        }
      } catch (error) {
        console.error('Error loading session messages:', error);
      }
    };

    loadSessionMessages();
  }, [currentSessionId]);

  useEffect(() => {
    const analyzeStyle = async () => {
      if (!initialImageURL) {
        if (!currentSessionId) {
          setMessages([]);
          setVisualContext(null);
        }
        return;
      }

      // Create new session if none exists
      if (!currentSessionId) {
        const { data, error } = await supabase
          .from('chat_sessions')
          .insert([{ 
            title: 'Style Analysis',
            user_id: (await supabase.auth.getUser()).data.user?.id 
          }])
          .select()
          .single();

        if (!error && data) {
          setCurrentSessionId(data.id);
        }
      }

      setIsAnalyzing(true);
      if (!currentSessionId) {
        setMessages([]);
        setVisualContext(null);
      }

      try {
        console.log('Sending image for style analysis...');
        const { data, error } = await supabase.functions.invoke('style-advisor', {
          body: { 
            capturedImage: initialImageURL,
            model: selectedModel
          }
        });

        if (error) {
          console.error('Error calling style-advisor function:', error);
          throw error;
        }

        console.log('Received style advice:', data);
        
        // Add the first AI message to the conversation and store visual context
        if (data && data.reply) {
          const newMessage = { role: 'assistant' as const, content: data.reply };
          setMessages([newMessage]);
          
          // Save to database if we have a session
          if (currentSessionId) {
            await supabase
              .from('chat_messages')
              .insert([{
                session_id: currentSessionId,
                role: 'assistant',
                content: data.reply,
                visual_context: data.visualContext || null
              }]);
          }
        }
        
        if (data && data.visualContext) {
          setVisualContext(data.visualContext);
        }
      } catch (error) {
        console.error('Failed to get style advice:', error);
        const errorMessage = {
          role: 'assistant' as const,
          content: 'Failed to analyze your style. Please try again.'
        };
        setMessages([errorMessage]);
        
        // Save error message to database if we have a session
        if (currentSessionId) {
          await supabase
            .from('chat_messages')
            .insert([{
              session_id: currentSessionId,
              role: 'assistant',
              content: errorMessage.content
            }]);
        }
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeStyle();
  }, [initialImageURL, selectedModel, currentSessionId]);

  const handleSendMessage = async (newMessage: string) => {
    // Create new session if none exists
    let sessionId = currentSessionId;
    if (!sessionId) {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert([{ 
          title: 'Chat Session',
          user_id: (await supabase.auth.getUser()).data.user?.id 
        }])
        .select()
        .single();

      if (!error && data) {
        sessionId = data.id;
        setCurrentSessionId(sessionId);
      }
    }

    // Create updated messages array with user's new message
    const updatedMessages: Message[] = [...messages, { role: 'user' as const, content: newMessage }];
    
    // Update state immediately to show user's message
    setMessages(updatedMessages);
    setIsAnalyzing(true);

    // Save user message to database
    if (sessionId) {
      await supabase
        .from('chat_messages')
        .insert([{
          session_id: sessionId,
          role: 'user',
          content: newMessage
        }]);
    }

    try {
      console.log('Sending follow-up message...');
      const { data, error } = await supabase.functions.invoke('style-advisor', {
        body: { 
          messages: updatedMessages,
          visualContext: visualContext,
          model: selectedModel
        }
      });

      if (error) {
        console.error('Error calling style-advisor function:', error);
        throw error;
      }

      console.log('Received follow-up response:', data);
      
      // Add AI response to messages
      if (data && data.response) {
        const assistantMessage = { role: 'assistant' as const, content: data.response };
        setMessages(prev => [...prev, assistantMessage]);
        
        // Save assistant message to database
        if (sessionId) {
          await supabase
            .from('chat_messages')
            .insert([{
              session_id: sessionId,
              role: 'assistant',
              content: data.response
            }]);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage = {
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Save error message to database
      if (sessionId) {
        await supabase
          .from('chat_messages')
          .insert([{
            session_id: sessionId,
            role: 'assistant',
            content: errorMessage.content
          }]);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
