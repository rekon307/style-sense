
import { toast } from '@/components/ui/use-toast';
import { Message } from '@/types/chat';
import { createChatSession, saveMessageToSession, loadVisualHistory } from '@/utils/sessionManager';
import { captureImageFromWebcam } from '@/utils/imageUtils';
import { callStyleAdvisor } from '@/utils/styleAdvisorApi';

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

    console.log('=== STARTING MESSAGE PROCESSING ===');
    console.log('Message:', message);
    console.log('Has image:', !!image);
    console.log('Temperature:', temperature);

    // Add user message to UI immediately
    const userMessage: Message = { role: 'user', content: message };
    const updatedMessages: Message[] = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsAnalyzing(true);

    try {
      // Ensure we have a session
      let sessionId = currentSessionId;
      if (!sessionId) {
        sessionId = await createChatSession();
        if (!sessionId) throw new Error('Failed to create session');
        setCurrentSessionId(sessionId);
      }

      // Save user message to database
      const saved = await saveMessageToSession(sessionId, 'user', message, image);
      if (!saved) throw new Error('Failed to save message');

      // Load visual history for context
      const visualHistory = await loadVisualHistory(sessionId);

      // Call style advisor API
      const response = await callStyleAdvisor(updatedMessages, temperature, image, visualHistory);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Handle streaming response
      await processStreamingResponse(response, sessionId, setMessages);

      toast({
        title: "Response received",
        description: "Alex has analyzed your request.",
      });

    } catch (error) {
      console.error('=== MESSAGE HANDLER ERROR ===', error);
      handleError(error, setMessages);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return { handleSendMessage };
};

const processStreamingResponse = async (
  response: Response,
  sessionId: string,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) => {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

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
          
          if (parsed.error) throw new Error(parsed.error);
          
          if (parsed.content) {
            assistantContent += parsed.content;
            
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

  // Save assistant response to database
  if (assistantContent) {
    await saveMessageToSession(sessionId, 'assistant', assistantContent);
  }
};

const handleError = (
  error: unknown,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) => {
  const errorMessage: Message = {
    role: 'assistant',
    content: 'Sorry, I encountered an error. Please try again.'
  };
  setMessages(prev => [...prev, errorMessage]);
  
  toast({
    title: "Message Failed",
    description: "Unable to process your message. Please try again.",
    variant: "destructive",
  });
};
