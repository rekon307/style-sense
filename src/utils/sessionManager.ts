
import { supabase } from '@/integrations/supabase/client';
import { ChatSession } from '@/types/chat';

export const createChatSession = async (title?: string): Promise<string | null> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert([{ 
        title: title || `Chat ${new Date().toLocaleDateString()}`,
        user_id: userData.user?.id || null
      }])
      .select()
      .single();

    if (error) throw error;
    return data?.id || null;
  } catch (error) {
    console.error('Error creating session:', error);
    return null;
  }
};

export const saveMessageToSession = async (
  sessionId: string,
  role: 'user' | 'assistant',
  content: string,
  visualContext?: string | null
) => {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .insert([{
        session_id: sessionId,
        role,
        content,
        visual_context: visualContext || null
      }]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving message:', error);
    return false;
  }
};

export const loadVisualHistory = async (sessionId: string) => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('role, content, visual_context, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error loading visual history:', error);
    return [];
  }
};
