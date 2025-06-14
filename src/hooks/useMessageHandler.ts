
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

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
    if (!newMessage.trim()) {
      toast({
        title: "Empty message",
        description: "Please enter a message before sending.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create new session if none exists
      let sessionId = currentSessionId;
      if (!sessionId) {
        console.log('Creating new session...');
        const { data: userData } = await supabase.auth.getUser();
        
        const { data, error } = await supabase
          .from('chat_sessions')
          .insert([{ 
            title: `Chat ${new Date().toLocaleDateString()}`,
            user_id: userData.user?.id 
          }])
          .select()
          .single();

        if (error) {
          console.error('Error creating session:', error);
          toast({
            title: "Session Error",
            description: "Failed to create new chat session. Please try again.",
            variant: "destructive",
          });
          throw error;
        }

        if (data) {
          sessionId = data.id;
          setCurrentSessionId(sessionId);
          console.log('New session created:', sessionId);
        }
      }

      // Create updated messages array with user's new message
      const updatedMessages: Message[] = [...messages, { role: 'user' as const, content: newMessage }];
      
      // Update state immediately to show user's message
      setMessages(updatedMessages);
      setIsAnalyzing(true);

      // Save user message to database
      if (sessionId) {
        const { error: saveError } = await supabase
          .from('chat_messages')
          .insert([{
            session_id: sessionId,
            role: 'user',
            content: newMessage
          }]);

        if (saveError) {
          console.error('Error saving user message:', saveError);
        }
      }

      console.log('Sending message to style-advisor function...');
      const { data, error } = await supabase.functions.invoke('style-advisor', {
        body: { 
          messages: updatedMessages,
          visualContext: visualContext,
          model: selectedModel
        }
      });

      if (error) {
        console.error('Error calling style-advisor function:', error);
        toast({
          title: "AI Service Error",
          description: "Failed to get AI response. Please try again.",
          variant: "destructive",
        });
        throw error;
      }

      console.log('Received AI response');
      
      // Add AI response to messages
      if (data && data.response) {
        const assistantMessage = { role: 'assistant' as const, content: data.response };
        setMessages(prev => [...prev, assistantMessage]);
        
        // Save assistant message to database
        if (sessionId) {
          const { error: saveError } = await supabase
            .from('chat_messages')
            .insert([{
              session_id: sessionId,
              role: 'assistant',
              content: data.response
            }]);

          if (saveError) {
            console.error('Error saving assistant message:', saveError);
          }
        }

        toast({
          title: "Response received",
          description: "AI style advisor has responded to your message.",
        });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage = {
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error processing your request. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Save error message to database
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

  return { handleSendMessage };
};
