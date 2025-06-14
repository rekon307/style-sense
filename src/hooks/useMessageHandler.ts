
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
  initialImageURL: string | null;
}

export const useMessageHandler = ({
  messages,
  setMessages,
  setIsAnalyzing,
  visualContext,
  selectedModel,
  currentSessionId,
  setCurrentSessionId,
  initialImageURL
}: UseMessageHandlerProps) => {
  const handleSendMessage = async (newMessage: string, capturedPhoto?: string | null, temperature?: number) => {
    if (!newMessage.trim()) {
      toast({
        title: "Empty message",
        description: "Please enter a message before sending.",
        variant: "destructive",
      });
      return;
    }

    console.log('=== MESSAGE HANDLER START ===');
    console.log('Sending message:', newMessage);
    console.log('Current session ID:', currentSessionId);
    console.log('Visual context available:', !!visualContext);
    console.log('Captured photo available:', !!capturedPhoto);
    console.log('Initial image available:', !!initialImageURL);
    console.log('Temperature setting:', temperature);
    console.log('Current messages count:', messages.length);

    // Create new user message and add it immediately to show in chat
    const userMessage: Message = { role: 'user', content: newMessage };
    const updatedMessages: Message[] = [...messages, userMessage];
    
    // Update state immediately to show user's message
    setMessages(updatedMessages);
    setIsAnalyzing(true);

    try {
      // Create new session if none exists
      let sessionId = currentSessionId;
      if (!sessionId) {
        console.log('Creating new session for message...');
        const { data: userData } = await supabase.auth.getUser();
        
        const { data, error } = await supabase
          .from('chat_sessions')
          .insert([{ 
            title: `Chat ${new Date().toLocaleDateString()}`,
            user_id: userData.user?.id || null
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
        } else {
          console.log('User message saved to database');
        }
      }

      // Determine which image to send - prefer captured photo, then initial image
      const imageToSend = capturedPhoto || initialImageURL;
      
      console.log('Sending message to style-advisor function...');
      console.log('Payload:', { 
        messagesCount: updatedMessages.length,
        hasVisualContext: !!visualContext,
        hasImageToSend: !!imageToSend,
        selectedModel,
        temperature
      });

      const requestBody: any = { 
        messages: updatedMessages,
        visualContext: visualContext,
        model: selectedModel
      };

      // Include temperature if provided
      if (temperature !== undefined) {
        requestBody.temperature = temperature;
      }

      // Include the current image if available
      if (imageToSend) {
        requestBody.currentImage = imageToSend;
        console.log('Including current image in request');
      }

      const { data, error } = await supabase.functions.invoke('style-advisor', {
        body: requestBody
      });

      if (error) {
        console.error('Error calling style-advisor function:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        toast({
          title: "AI Service Error",
          description: `Failed to get AI response: ${error.message || 'Unknown error'}. Please try again.`,
          variant: "destructive",
        });
        throw error;
      }

      console.log('Received AI response:', data);
      
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
          } else {
            console.log('Assistant message saved to database');
          }
        }

        toast({
          title: "Response received",
          description: "Alex has responded to your message.",
        });
      } else {
        console.error('No response content in data:', data);
        throw new Error('No response content from AI');
      }

      console.log('=== MESSAGE HANDLER END ===');
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage = {
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error processing your request. Please ensure your camera is working and try again.'
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
      
      toast({
        title: "Message Failed",
        description: "Unable to process your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return { handleSendMessage };
};
