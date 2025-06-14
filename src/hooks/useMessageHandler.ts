
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
  currentSessionId: string | null;
  setCurrentSessionId: (id: string | null) => void;
}

export const useMessageHandler = ({
  messages,
  setMessages,
  setIsAnalyzing,
  currentSessionId,
  setCurrentSessionId
}: UseMessageHandlerProps) => {
  const handleSendMessage = async (message: string, image: string | null = null, temperature: number = 0.5) => {
    if (!message.trim()) {
      toast({
        title: "Empty message",
        description: "Please enter a message before sending.",
        variant: "destructive",
      });
      return;
    }

    console.log('=== MESSAGE HANDLER START ===');
    console.log('Message:', message);
    console.log('Has image:', !!image);
    console.log('Image data length:', image ? image.length : 0);
    console.log('Temperature:', temperature);

    // Add user message immediately
    const userMessage: Message = { role: 'user', content: message };
    const updatedMessages: Message[] = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsAnalyzing(true);

    try {
      // Create session if needed
      let sessionId = currentSessionId;
      if (!sessionId) {
        const { data: userData } = await supabase.auth.getUser();
        
        const { data, error } = await supabase
          .from('chat_sessions')
          .insert([{ 
            title: `Chat ${new Date().toLocaleDateString()}`,
            user_id: userData.user?.id || null
          }])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          sessionId = data.id;
          setCurrentSessionId(sessionId);
        }
      }

      // Save user message
      if (sessionId) {
        await supabase
          .from('chat_messages')
          .insert([{
            session_id: sessionId,
            role: 'user',
            content: message
          }]);
      }

      // Prepare request with enhanced image debugging
      const requestBody: {
        messages: Message[];
        temperature: number;
        model: string;
        image?: string;
      } = { 
        messages: updatedMessages,
        temperature: temperature,
        model: 'gpt-4o-mini'
      };

      // CRITICAL: Always include image if provided
      if (image) {
        requestBody.image = image;
        console.log('=== IMAGE ATTACHED TO REQUEST ===');
        console.log('Image format:', image.substring(0, 30));
        console.log('Image size (bytes):', image.length);
      } else {
        console.warn('=== NO IMAGE IN REQUEST ===');
      }

      console.log('=== SENDING REQUEST TO EDGE FUNCTION ===');
      console.log('Request body keys:', Object.keys(requestBody));

      // Make streaming request
      const response = await fetch(`https://rqubwaskrqvlsjcnsihy.supabase.co/functions/v1/style-advisor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxdWJ3YXNrcnF2bHNqY25zaWh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MTM5MDAsImV4cCI6MjA2NTQ4OTkwMH0.v_LgbF4Hx7Vf87OI7s3GCey3PheLDRZe3Aa9wN3DtqY`,
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        console.error('=== EDGE FUNCTION ERROR ===');
        console.error('Status:', response.status);
        throw new Error(`API error: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      console.log('=== STARTING STREAM PROCESSING ===');

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantContent = '';

      // Add assistant message placeholder
      const assistantMessage: Message = { role: 'assistant', content: '' };
      setMessages(prev => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              
              if (parsed.content) {
                assistantContent += parsed.content;
                
                // Update assistant message in real-time
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage.role === 'assistant') {
                    lastMessage.content = assistantContent;
                  }
                  return newMessages;
                });
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      console.log('=== STREAM COMPLETED ===');
      console.log('Final response length:', assistantContent.length);

      // Save assistant response
      if (sessionId && assistantContent) {
        await supabase
          .from('chat_messages')
          .insert([{
            session_id: sessionId,
            role: 'assistant',
            content: assistantContent
          }]);
      }

      toast({
        title: "Response received",
        description: "Alex has analyzed your image and responded.",
      });

    } catch (error) {
      console.error('=== MESSAGE HANDLER ERROR ===');
      console.error('Error details:', error);
      const errorMessage = {
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
      
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
