
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface VideoConversation {
  id: string;
  conversation_id: string;
  conversation_name: string | null;
  conversation_url: string;
  status: string;
  callback_url: string | null;
  user_id: string | null;
  session_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useVideoHistory = () => {
  const [videoConversations, setVideoConversations] = useState<VideoConversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadVideoConversations = async (sessionId?: string) => {
    setIsLoading(true);
    try {
      console.log('=== LOADING VIDEO CONVERSATIONS ===');
      
      let query = supabase
        .from('video_conversations')
        .select('*')
        .order('created_at', { ascending: false });

      if (sessionId) {
        query = query.eq('session_id', sessionId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading video conversations:', error);
        throw error;
      }

      console.log('✅ Video conversations loaded:', data?.length || 0);
      setVideoConversations(data || []);
      return data || [];
    } catch (error) {
      console.error('Failed to load video conversations:', error);
      setVideoConversations([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const updateConversationStatus = async (conversationId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('video_conversations')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('conversation_id', conversationId);

      if (error) {
        console.error('Error updating conversation status:', error);
        throw error;
      }

      // Update local state
      setVideoConversations(prev => 
        prev.map(conv => 
          conv.conversation_id === conversationId 
            ? { ...conv, status, updated_at: new Date().toISOString() }
            : conv
        )
      );
    } catch (error) {
      console.error('Failed to update conversation status:', error);
    }
  };

  const deleteVideoConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('video_conversations')
        .delete()
        .eq('conversation_id', conversationId);

      if (error) {
        console.error('Error deleting video conversation:', error);
        throw error;
      }

      // Update local state
      setVideoConversations(prev => 
        prev.filter(conv => conv.conversation_id !== conversationId)
      );
    } catch (error) {
      console.error('Failed to delete video conversation:', error);
    }
  };

  return {
    videoConversations,
    isLoading,
    loadVideoConversations,
    updateConversationStatus,
    deleteVideoConversation
  };
};
