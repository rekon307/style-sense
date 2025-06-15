
import { toast } from '@/components/ui/use-toast';
import { Message } from '@/types/chat';
import { createChatSession, saveMessageToSession, loadVisualHistory } from '@/utils/sessionManager';
import { forcePhotoCapture } from '@/utils/imageCapture';
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
    console.log('Has manual image:', !!image);
    console.log('Temperature:', temperature);

    // Try to capture photo automatically if no manual image provided
    let finalImage = image;
    if (!image) {
      console.log('=== ATTEMPTING AUTOMATIC PHOTO CAPTURE ===');
      try {
        const capturedPhoto = forcePhotoCapture();
        if (capturedPhoto) {
          finalImage = capturedPhoto;
          console.log('✅ PHOTO CAPTURED SUCCESSFULLY');
          console.log('Captured image length:', capturedPhoto.length);
          console.log('Image preview:', capturedPhoto.substring(0, 50) + '...');
        } else {
          console.log('❌ PHOTO CAPTURE FAILED - NO IMAGE RETURNED');
        }
      } catch (error) {
        console.error('❌ PHOTO CAPTURE ERROR:', error);
      }
    }

    console.log('=== FINAL IMAGE STATUS ===');
    console.log('Using image:', !!finalImage);
    console.log('Image source:', image ? 'manual upload' : finalImage ? 'auto capture' : 'none');

    // Add user message to UI immediately
    const userMessage: Message = { 
      role: 'user', 
      content: message,
      visual_context: finalImage 
    };
    const updatedMessages: Message[] = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsAnalyzing(true);

    try {
      // Ensure we have a session
      let sessionId = currentSessionId;
      if (!sessionId) {
        console.log('=== CREATING NEW SESSION ===');
        sessionId = await createChatSession();
        if (!sessionId) throw new Error('Failed to create session');
        setCurrentSessionId(sessionId);
        console.log('New session created:', sessionId);
      }

      // Save user message to database
      console.log('=== SAVING MESSAGE TO DATABASE ===');
      const saved = await saveMessageToSession(sessionId, 'user', message, finalImage);
      if (!saved) throw new Error('Failed to save message');
      console.log('Message saved successfully');

      // Load visual history for context
      console.log('=== LOADING VISUAL HISTORY ===');
      const visualHistory = await loadVisualHistory(sessionId);
      console.log('Visual history loaded:', visualHistory.length, 'items');

      // Call style advisor API
      console.log('=== CALLING STYLE ADVISOR API ===');
      console.log('Sending to API:', {
        messagesCount: updatedMessages.length,
        hasCurrentImage: !!finalImage,
        visualHistoryCount: visualHistory.length,
        temperature
      });

      const response = await callStyleAdvisor(updatedMessages, temperature, finalImage, visualHistory);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API ERROR RESPONSE:', response.status, errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      console.log('✅ API RESPONSE OK - PROCESSING STREAM');

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

  console.log('=== STARTING STREAM PROCESSING ===');

  // Add assistant message placeholder
  const assistantMessage: Message = { role: 'assistant', content: '' };
  setMessages(prev => [...prev, assistantMessage]);

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      console.log('=== STREAM COMPLETED ===');
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        
        try {
          const parsed = JSON.parse(data);
          
          if (parsed.error) {
            console.error('❌ STREAM ERROR:', parsed.error);
            throw new Error(parsed.error);
          }
          
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
    console.log('=== SAVING ASSISTANT RESPONSE ===');
    await saveMessageToSession(sessionId, 'assistant', assistantContent);
    console.log('Assistant response saved');
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
