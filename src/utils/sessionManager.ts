
import { supabase } from '@/integrations/supabase/client';
import { ChatSession } from '@/types/chat';

export const createChatSession = async (title?: string): Promise<string | null> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    console.log('=== CREATING NEW CHAT SESSION ===');
    console.log('User ID:', userData.user?.id || 'anonymous');
    console.log('Title:', title || `Chat ${new Date().toLocaleDateString()}`);
    
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert([{ 
        title: title || `Chat ${new Date().toLocaleDateString()}`,
        user_id: userData.user?.id || null
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating session:', error);
      throw error;
    }
    
    console.log('✅ Session created successfully:', data?.id);
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
    console.log('=== SAVING MESSAGE TO SESSION ===');
    console.log('Session ID:', sessionId);
    console.log('Role:', role);
    console.log('Content length:', content.length);
    console.log('Has visual context:', !!visualContext);
    if (visualContext) {
      console.log('Visual context length:', visualContext.length);
      console.log('Visual context type:', visualContext.startsWith('data:image/') ? 'base64 image' : 'unknown');
    }
    
    const { error } = await supabase
      .from('chat_messages')
      .insert([{
        session_id: sessionId,
        role,
        content,
        visual_context: visualContext || null
      }]);

    if (error) {
      console.error('Error saving message:', error);
      throw error;
    }
    
    console.log('✅ Message saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving message:', error);
    return false;
  }
};

export const loadVisualHistory = async (sessionId: string) => {
  try {
    console.log('=== LOADING VISUAL HISTORY ===');
    console.log('Session ID:', sessionId);
    
    const { data, error } = await supabase
      .from('chat_messages')
      .select('role, content, visual_context, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading visual history:', error);
      throw error;
    }
    
    console.log('✅ Visual history loaded:', data?.length || 0, 'messages');
    const withImages = data?.filter(msg => msg.visual_context) || [];
    console.log('Messages with images:', withImages.length);
    
    return data || [];
  } catch (error) {
    console.error('Error loading visual history:', error);
    return [];
  }
};
