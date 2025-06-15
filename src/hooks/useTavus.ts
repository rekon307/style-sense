import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface TavusConversation {
  conversation_id: string;
  conversation_url: string;
  status: string;
  conversation_name?: string;
  callback_url?: string;
  created_at?: string;
}

export const useTavus = () => {
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<TavusConversation | null>(null);

  const createConversation = async (
    conversationName?: string,
    conversationalContext?: string,
    personaId?: string,
    sessionId?: string,
    participantName?: string
  ) => {
    setIsCreatingConversation(true);
    try {
      console.log('=== CREATING TAVUS CONVERSATION ===');
      
      const { data, error } = await supabase.functions.invoke('tavus-integration', {
        body: {
          action: 'create_conversation',
          data: {
            conversation_name: conversationName,
            conversational_context: conversationalContext,
            persona_id: personaId || "p347dab0cef8",
            participant_name: participantName
          }
        }
      });

      if (error) {
        console.error('Error creating conversation:', error);
        throw error;
      }

      console.log('✅ Conversation created:', data);
      
      // Save to database
      const { data: userData } = await supabase.auth.getUser();
      const { error: dbError } = await supabase
        .from('video_conversations')
        .insert([{
          conversation_id: data.conversation_id,
          conversation_name: data.conversation_name || conversationName,
          conversation_url: data.conversation_url,
          status: data.status,
          callback_url: data.callback_url || null,
          user_id: userData.user?.id || null,
          session_id: sessionId || null
        }]);

      if (dbError) {
        console.error('Error saving conversation to database:', dbError);
      } else {
        console.log('✅ Conversation saved to database');
      }

      setCurrentConversation(data);
      
      toast({
        title: "Video conversation ready",
        description: "Your AI style advisor is ready for a video chat!",
      });

      return data;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      toast({
        title: "Error",
        description: "Failed to create video conversation. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const generateVideo = async (
    greeting: string,
    styleContext: string,
    userName?: string,
    campaignId?: string,
    callbackUrl?: string
  ) => {
    setIsGeneratingVideo(true);
    try {
      console.log('=== GENERATING TAVUS VIDEO ===');
      
      const { data, error } = await supabase.functions.invoke('tavus-integration', {
        body: {
          action: 'generate_video',
          data: {
            greeting,
            styleContext,
            userName,
            campaignId,
            callbackUrl
          }
        }
      });

      if (error) {
        console.error('Error generating video:', error);
        throw error;
      }

      console.log('✅ Video generation initiated:', data);
      
      toast({
        title: "Video generation started",
        description: "Your personalized style advice video is being created!",
      });

      return data;
    } catch (error) {
      console.error('Failed to generate video:', error);
      toast({
        title: "Error",
        description: "Failed to generate video. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const getConversationStatus = async (conversationId: string) => {
    try {
      console.log('=== CHECKING CONVERSATION STATUS ===');
      
      const { data, error } = await supabase.functions.invoke('tavus-integration', {
        body: {
          action: 'get_conversation_status',
          data: {
            conversation_id: conversationId
          }
        }
      });

      if (error) {
        console.error('Error getting conversation status:', error);
        throw error;
      }

      console.log('✅ Conversation status:', data);
      
      // Update status in database
      await supabase
        .from('video_conversations')
        .update({ 
          status: data.status,
          updated_at: new Date().toISOString()
        })
        .eq('conversation_id', conversationId);

      return data;
    } catch (error) {
      console.error('Failed to get conversation status:', error);
      throw error;
    }
  };

  const loadVideoConversations = async (sessionId?: string) => {
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
      return data || [];
    } catch (error) {
      console.error('Failed to load video conversations:', error);
      return [];
    }
  };

  return {
    createConversation,
    generateVideo,
    getConversationStatus,
    loadVideoConversations,
    isCreatingConversation,
    isGeneratingVideo,
    currentConversation,
    setCurrentConversation
  };
};
