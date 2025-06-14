
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  visual_context: string | null;
  created_at: string;
}

export const useChatHistory = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load chat sessions
  const loadSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  // Create a new chat session
  const createNewSession = async (title?: string) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert([{ 
          title: title || 'New Chat',
          user_id: user?.id || null // Allow null for anonymous users
        }])
        .select()
        .single();

      if (error) throw error;
      
      setCurrentSessionId(data.id);
      await loadSessions();
      return data.id;
    } catch (error) {
      console.error('Error creating session:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Load messages for a session
  const loadMessages = async (sessionId: string): Promise<ChatMessage[]> => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Type cast the role field to ensure TypeScript compatibility
      return (data || []).map(msg => ({
        ...msg,
        role: msg.role as 'user' | 'assistant'
      }));
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  };

  // Save a message to the current session
  const saveMessage = async (role: 'user' | 'assistant', content: string, visualContext?: string) => {
    if (!currentSessionId) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert([{
          session_id: currentSessionId,
          role,
          content,
          visual_context: visualContext || null
        }]);

      if (error) throw error;

      // Update session's updated_at timestamp
      await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', currentSessionId);

      await loadSessions();
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  // Delete a session
  const deleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
      
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
      }
      await loadSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  // Switch to a different session
  const switchToSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  useEffect(() => {
    loadSessions();
  }, []);

  return {
    sessions,
    currentSessionId,
    isLoading,
    createNewSession,
    loadMessages,
    saveMessage,
    deleteSession,
    switchToSession,
    loadSessions
  };
};
