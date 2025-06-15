import { useState, useRef } from 'react';
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
  const [isEndingConversation, setIsEndingConversation] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<TavusConversation | null>(null);
  
  // Track active conversations to ensure proper cleanup
  const activeConversationsRef = useRef<Set<string>>(new Set());

  const endConversation = async (conversationId: string, showToast: boolean = true) => {
    if (!conversationId) {
      console.warn('⚠️ No conversation ID provided for ending');
      return;
    }

    setIsEndingConversation(true);
    try {
      console.log('=== ENDING TAVUS CONVERSATION ===');
      console.log('Conversation ID:', conversationId);
      
      const { data, error } = await supabase.functions.invoke('tavus-integration', {
        body: {
          action: 'end_conversation',
          data: {
            conversation_id: conversationId
          }
        }
      });

      if (error) {
        console.error('❌ Error ending conversation:', error);
        throw error;
      }

      console.log('✅ Conversation ended successfully:', data);
      
      // Remove from active conversations tracking
      activeConversationsRef.current.delete(conversationId);
      console.log('🗑️ Removed from active tracking:', conversationId);
      
      // Update status in database
      try {
        const { error: dbError } = await supabase
          .from('video_conversations')
          .update({ 
            status: 'ended',
            updated_at: new Date().toISOString()
          })
          .eq('conversation_id', conversationId);

        if (dbError) {
          console.error('⚠️ Failed to update conversation status in DB:', dbError);
        } else {
          console.log('✅ Updated conversation status in database');
        }
      } catch (dbError) {
        console.error('⚠️ Database update error:', dbError);
      }

      // Clear current conversation if it's the one we're ending
      if (currentConversation?.conversation_id === conversationId) {
        console.log('🧹 Clearing current conversation state');
        setCurrentConversation(null);
      }

      if (showToast) {
        toast({
          title: "Conversation ended",
          description: "The video conversation has been properly closed.",
        });
      }

      return data;
    } catch (error) {
      console.error('❌ Failed to end conversation:', error);
      if (showToast) {
        toast({
          title: "Warning",
          description: "Failed to properly end the conversation. It may still be active on Tavus.",
          variant: "destructive",
        });
      }
      throw error;
    } finally {
      setIsEndingConversation(false);
    }
  };

  const endAllActiveConversations = async () => {
    console.log('=== ENDING ALL ACTIVE CONVERSATIONS ===');
    const activeIds = Array.from(activeConversationsRef.current);
    
    if (activeIds.length === 0) {
      console.log('✅ No active conversations to end');
      return;
    }

    console.log('🛑 Ending active conversations:', activeIds);

    const endPromises = activeIds.map(id => 
      endConversation(id, false).catch(error => {
        console.error(`❌ Failed to end conversation ${id}:`, error);
      })
    );

    await Promise.allSettled(endPromises);
    
    // Clear the tracking set
    activeConversationsRef.current.clear();
    
    console.log(`✅ Attempted to end ${activeIds.length} active conversations`);
  };

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
      console.log('Conversation name:', conversationName);
      console.log('Persona ID:', personaId);
      console.log('Session ID:', sessionId);
      console.log('Participant name:', participantName);
      console.log('Context length:', conversationalContext?.length);
      
      // First, end any existing active conversations to prevent conflicts
      await endAllActiveConversations();
      
      // Wait for cleanup
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const requestData = {
        conversation_name: conversationName,
        conversational_context: conversationalContext,
        persona_id: personaId || "p869ead8c67b"
      };
      
      console.log('🚀 Sending conversation creation request:', requestData);
      
      const { data, error } = await supabase.functions.invoke('tavus-integration', {
        body: {
          action: 'create_conversation',
          data: requestData
        }
      });

      if (error) {
        console.error('❌ Error creating conversation:', error);
        
        if (error.message && error.message.includes('maximum concurrent conversations')) {
          toast({
            title: "Video chat limit reached",
            description: "Please wait a moment and try again. We're cleaning up previous sessions.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to create video conversation. Please try again.",
            variant: "destructive",
          });
        }
        throw error;
      }

      console.log('✅ Conversation created successfully:', data);
      
      // Validate response
      if (!data?.conversation_id || !data?.conversation_url) {
        console.error('❌ Invalid conversation response - missing required fields');
        throw new Error('Invalid conversation response from Tavus API');
      }
      
      // Track this conversation as active
      if (data.conversation_id) {
        activeConversationsRef.current.add(data.conversation_id);
        console.log('📝 Added to active tracking:', data.conversation_id);
        console.log('Total active conversations:', activeConversationsRef.current.size);
      }
      
      // Save to database
      try {
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
          console.error('⚠️ Error saving conversation to database:', dbError);
        } else {
          console.log('✅ Conversation saved to database');
        }
      } catch (dbError) {
        console.error('⚠️ Database save error:', dbError);
      }

      setCurrentConversation(data);
      
      toast({
        title: "Video conversation ready",
        description: `Welcome ${participantName || 'there'}! Your direct conversation with Alex is starting.`,
      });

      return data;
    } catch (error) {
      console.error('❌ Failed to create conversation:', error);
      
      if (!error.message?.includes('maximum concurrent conversations')) {
        toast({
          title: "Error",
          description: "Failed to create video conversation. Please try again.",
          variant: "destructive",
        });
      }
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

      console.log('✅ Video generation response:', data);
      
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

  const cleanupOldConversations = async () => {
    try {
      console.log('=== CLEANING UP OLD CONVERSATIONS ===');
      
      const { data, error } = await supabase.functions.invoke('tavus-integration', {
        body: {
          action: 'cleanup_conversations',
          data: {}
        }
      });

      if (error) {
        console.error('❌ Error cleaning up conversations:', error);
        return false;
      }

      console.log('✅ Cleanup result:', data);
      return true;
    } catch (error) {
      console.error('❌ Failed to cleanup conversations:', error);
      return false;
    }
  };

  return {
    createConversation,
    endConversation,
    endAllActiveConversations,
    generateVideo,
    getConversationStatus,
    loadVideoConversations,
    cleanupOldConversations,
    isCreatingConversation,
    isGeneratingVideo,
    isEndingConversation,
    currentConversation,
    setCurrentConversation
  };
};
