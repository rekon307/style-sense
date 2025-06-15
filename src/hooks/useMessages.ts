
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Message } from '@/types/chat';

export const useMessages = (currentSessionId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!currentSessionId) {
      console.log('Clearing messages - no current session');
      setMessages([]);
    }
  }, [currentSessionId]);

  useEffect(() => {
    const loadSessionMessages = async () => {
      if (!currentSessionId) return;

      setIsLoading(true);
      try {
        console.log('=== LOADING MESSAGES FOR SESSION ===');
        console.log('Session ID:', currentSessionId);
        
        const { data, error } = await supabase
          .from('chat_messages')
          .select('id, role, content, visual_context, created_at')
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
        
        const sessionMessages: Message[] = data?.map(msg => {
          console.log('=== MESSAGE LOADED FROM DB ===');
          console.log('Message ID:', msg.id);
          console.log('Role:', msg.role);
          console.log('Content preview:', msg.content.substring(0, 50));
          console.log('Has visual context:', !!msg.visual_context);
          if (msg.visual_context) {
            console.log('Visual context length:', msg.visual_context.length);
            console.log('Visual context type:', msg.visual_context.startsWith('data:image/') ? 'base64 image' : 'other');
            console.log('Visual context preview:', msg.visual_context.substring(0, 100) + '...');
          }
          
          return {
            id: msg.id,
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
            visual_context: msg.visual_context,
            created_at: msg.created_at
          };
        }) || [];
        
        console.log('=== TOTAL MESSAGES LOADED ===');
        console.log('Total messages:', sessionMessages.length);
        console.log('Messages with images:', sessionMessages.filter(m => m.visual_context).length);
        
        setMessages(sessionMessages);
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
    isLoading
  };
};
