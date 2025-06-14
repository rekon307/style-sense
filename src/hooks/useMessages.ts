
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const useMessages = (currentSessionId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [visualContext, setVisualContext] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Clear messages when starting a new session or no session is selected
  useEffect(() => {
    if (!currentSessionId) {
      console.log('Clearing messages - no current session');
      setMessages([]);
      setVisualContext(null);
    }
  }, [currentSessionId]);

  // Load messages when switching sessions
  useEffect(() => {
    const loadSessionMessages = async () => {
      if (!currentSessionId) return;

      setIsLoading(true);
      try {
        console.log('Loading messages for session:', currentSessionId);
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('session_id', currentSessionId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error loading session messages:', error);
          toast({
            title: "Error loading messages",
            description: "Failed to load chat history. Please try again.",
            variant: "destructive",
          });
          throw error;
        }
        
        const sessionMessages = data?.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })) || [];
        
        console.log('Loaded messages:', sessionMessages.length);
        setMessages(sessionMessages);
        
        // Set visual context from the first message that has it
        const messageWithContext = data?.find(msg => msg.visual_context);
        if (messageWithContext) {
          setVisualContext(messageWithContext.visual_context);
          console.log('Visual context loaded');
        }
      } catch (error) {
        console.error('Failed to load session messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSessionMessages();
  }, [currentSessionId]);

  return {
    messages,
    setMessages,
    isAnalyzing,
    setIsAnalyzing,
    visualContext,
    setVisualContext,
    isLoading
  };
};
