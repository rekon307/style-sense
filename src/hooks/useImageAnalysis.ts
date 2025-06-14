
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UseImageAnalysisProps {
  initialImageURL: string | null;
  selectedModel: string;
  currentSessionId: string | null;
  setCurrentSessionId: (id: string | null) => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setIsAnalyzing: (analyzing: boolean) => void;
  setVisualContext: (context: string | null) => void;
}

export const useImageAnalysis = ({
  initialImageURL,
  selectedModel,
  currentSessionId,
  setCurrentSessionId,
  messages,
  setMessages,
  setIsAnalyzing,
  setVisualContext
}: UseImageAnalysisProps) => {
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
};
