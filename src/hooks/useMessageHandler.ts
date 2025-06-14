
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UseMessageHandlerProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setIsAnalyzing: (analyzing: boolean) => void;
  visualContext: string | null;
  selectedModel: string;
  currentSessionId: string | null;
  setCurrentSessionId: (id: string | null) => void;
}

export const useMessageHandler = ({
  messages,
  setMessages,
  setIsAnalyzing,
  visualContext,
  selectedModel,
  currentSessionId,
  setCurrentSessionId
}: UseMessageHandlerProps) => {
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

  return { handleSendMessage };
};
