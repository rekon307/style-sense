
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

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
          console.log('No image and no session - clearing state');
          setMessages([]);
          setVisualContext(null);
        }
        return;
      }

      // Only analyze if we have an image and no existing messages for this session
      if (messages.length > 0) {
        console.log('Messages already exist, skipping analysis');
        return;
      }

      try {
        console.log('=== STYLE ANALYSIS START ===');
        console.log('Starting style analysis with image...');
        console.log('Image size:', initialImageURL.length, 'characters');
        console.log('Selected model:', selectedModel);
        
        // Create new session if none exists
        if (!currentSessionId) {
          console.log('Creating new session for image analysis...');
          const { data: userData } = await supabase.auth.getUser();
          
          const { data, error } = await supabase
            .from('chat_sessions')
            .insert([{ 
              title: 'Style Analysis',
              user_id: userData.user?.id || null // Allow null for anonymous users
            }])
            .select()
            .single();

          if (error) {
            console.error('Error creating session:', error);
            toast({
              title: "Session Error",
              description: "Failed to create analysis session. Please try again.",
              variant: "destructive",
            });
            throw error;
          }

          if (data) {
            setCurrentSessionId(data.id);
            console.log('Analysis session created:', data.id);
          }
        }

        setIsAnalyzing(true);

        console.log('Sending image for style analysis...');
        
        const { data, error } = await supabase.functions.invoke('style-advisor', {
          body: { 
            capturedImage: initialImageURL,
            model: selectedModel
          }
        });

        if (error) {
          console.error('Error calling style-advisor function:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          toast({
            title: "Analysis Error",
            description: `Failed to analyze your style: ${error.message || 'Unknown error'}. Please try again.`,
            variant: "destructive",
          });
          throw error;
        }

        console.log('Style analysis completed successfully');
        console.log('Response data:', data);
        
        // Add the first AI message to the conversation and store visual context
        if (data && data.reply) {
          const newMessage = { role: 'assistant' as const, content: data.reply };
          setMessages([newMessage]);
          
          // Save to database if we have a session
          if (currentSessionId) {
            const { error: saveError } = await supabase
              .from('chat_messages')
              .insert([{
                session_id: currentSessionId,
                role: 'assistant',
                content: data.reply,
                visual_context: data.visualContext || null
              }]);

            if (saveError) {
              console.error('Error saving analysis message:', saveError);
            } else {
              console.log('Analysis message saved to database');
            }
          }

          toast({
            title: "Analysis complete",
            description: "Your style analysis is ready!",
          });
        } else {
          console.error('No reply in response data:', data);
          throw new Error('No response from AI analysis');
        }
        
        if (data && data.visualContext) {
          setVisualContext(data.visualContext);
          console.log('Visual context set from analysis');
        }

        console.log('=== STYLE ANALYSIS END ===');
      } catch (error) {
        console.error('Failed to analyze style:', error);
        const errorMessage = {
          role: 'assistant' as const,
          content: 'Failed to analyze your style. Please ensure your camera is working and try again, or check your connection.'
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
        
        toast({
          title: "Analysis Failed",
          description: "Unable to analyze your style. Please check your camera and try again.",
          variant: "destructive",
        });
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeStyle();
  }, [initialImageURL, selectedModel]); // Removed other dependencies to prevent unnecessary re-runs
};
