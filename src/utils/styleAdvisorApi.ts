
import { Message, VisualHistoryMessage } from '@/types/chat';

interface StyleAdvisorRequest {
  messages: Message[];
  temperature: number;
  model: string;
  image?: string;
  visualHistory?: VisualHistoryMessage[];
}

export const callStyleAdvisor = async (
  messages: Message[],
  temperature: number = 0.5,
  currentImage?: string,
  visualHistory?: VisualHistoryMessage[]
): Promise<Response> => {
  const requestBody: StyleAdvisorRequest = {
    messages,
    temperature,
    model: 'gpt-4o-mini'
  };

  if (currentImage) {
    requestBody.image = currentImage;
  }

  if (visualHistory && visualHistory.length > 0) {
    requestBody.visualHistory = visualHistory;
  }

  console.log('=== CALLING STYLE ADVISOR API ===');
  console.log('Request payload:', {
    messagesCount: messages.length,
    hasImage: !!currentImage,
    visualHistoryCount: visualHistory?.length || 0,
    temperature
  });

  return fetch('https://rqubwaskrqvlsjcnsihy.supabase.co/functions/v1/style-advisor', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxdWJ3YXNrcnF2bHNqY25zaWh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MTM5MDAsImV4cCI6MjA2NTQ4OTkwMH0.v_LgbF4Hx7Vf87OI7s3GCey3PheLDRZe3Aa9wN3DtqY`,
    },
    body: JSON.stringify(requestBody)
  });
};
