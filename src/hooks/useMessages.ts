
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const useMessages = (currentSessionId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [visualContext, setVisualContext] = useState<string | null>(null);

  // Clear messages when starting a new session or no session is selected
  useEffect(() => {
    if (!currentSessionId) {
      setMessages([]);
      setVisualContext(null);
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

  return {
    messages,
    setMessages,
    isAnalyzing,
    setIsAnalyzing,
    visualContext,
    setVisualContext
  };
};
