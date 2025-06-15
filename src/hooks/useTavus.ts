
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface TavusConversation {
  conversation_id: string;
  conversation_url: string;
  status: string;
}

export const useTavus = () => {
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<TavusConversation | null>(null);

  const createConversation = async (
    conversationName?: string,
    conversationalContext?: string,
    replicaId?: string
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
            replica_id: replicaId || "r4fa3e64f1"
          }
        }
      });

      if (error) {
        console.error('Error creating conversation:', error);
        throw error;
      }

      console.log('✅ Conversation created:', data);
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
      return data;
    } catch (error) {
      console.error('Failed to get conversation status:', error);
      throw error;
    }
  };

  return {
    createConversation,
    generateVideo,
    getConversationStatus,
    isCreatingConversation,
    isGeneratingVideo,
    currentConversation,
    setCurrentConversation
  };
};
