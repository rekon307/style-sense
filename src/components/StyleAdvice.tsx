
import { useState, useEffect, useRef } from "react";
import ChatHeader from "./chat/ChatHeader";
import ChatMessages from "./chat/ChatMessages";
import ChatInput from "./chat/ChatInput";
import DailyVideoFrame from "./DailyVideoFrame";
import { useTavus } from "@/hooks/useTavus";
import { toast } from "@/components/ui/use-toast";
import { Message } from "@/types/chat";

interface StyleAdviceProps {
  messages: Message[];
  isAnalyzing: boolean;
  onSendMessage: (message: string, image?: string | null, temperature?: number) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  currentSessionId: string | null;
  user?: any;
  onVideoModeChange?: (isVideoMode: boolean) => void;
  onVideoUrlChange?: (url: string | null) => void;
  isVideoMode: boolean;
}

const StyleAdvice = ({ 
  messages, 
  isAnalyzing, 
  onSendMessage, 
  selectedModel, 
  onModelChange, 
  currentSessionId, 
  user,
  onVideoModeChange,
  onVideoUrlChange,
  isVideoMode
}: StyleAdviceProps) => {
  const [videoConversationUrl, setVideoConversationUrl] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isCreatingVideo, setIsCreatingVideo] = useState(false);
  const [hasTriedAutoStart, setHasTriedAutoStart] = useState(false);
  
  const { 
    createConversation, 
    endConversation, 
    endAllActiveConversations,
    isCreatingConversation, 
    isEndingConversation, 
    currentConversation,
    setCurrentConversation
  } = useTavus();

  const temperature = 0.2;

  // Auto-start video conversation when switching to video mode
  useEffect(() => {
    console.log('=== VIDEO MODE EFFECT ===');
    console.log('isVideoMode:', isVideoMode);
    console.log('videoConversationUrl:', videoConversationUrl);
    console.log('isCreatingVideo:', isCreatingVideo);
    console.log('user:', !!user);
    console.log('hasTriedAutoStart:', hasTriedAutoStart);

    // Only auto-start if we're in video mode and haven't tried yet
    if (isVideoMode && !videoConversationUrl && !isCreatingVideo && !hasTriedAutoStart) {
      console.log('🎬 Auto-starting video chat...');
      setHasTriedAutoStart(true);
      handleStartVideoChat();
    }
  }, [isVideoMode, videoConversationUrl, isCreatingVideo, hasTriedAutoStart]);

  // Reset auto-start flag when switching modes or sessions
  useEffect(() => {
    if (!isVideoMode) {
      setHasTriedAutoStart(false);
    }
  }, [isVideoMode, currentSessionId]);

  // Update parent with video URL changes
  useEffect(() => {
    console.log('🔗 Updating parent with video URL:', videoConversationUrl);
    onVideoUrlChange?.(videoConversationUrl);
  }, [videoConversationUrl, onVideoUrlChange]);

  // Cleanup when switching from video to text mode
  useEffect(() => {
    if (!isVideoMode && currentConversationId) {
      console.log('🔄 Switching to text mode - ending video conversation:', currentConversationId);
      handleEndVideoCall();
    }
  }, [isVideoMode, currentConversationId]);

  const handleStartVideoChat = async () => {
    if (isCreatingVideo || isCreatingConversation) {
      console.log('⏳ Already creating video conversation, skipping...');
      return;
    }

    console.log('=== STARTING VIDEO CHAT ===');
    setIsCreatingVideo(true);
    
    try {
      console.log('Current session ID:', currentSessionId);
      console.log('User object:', user);
      
      // Clean up any existing conversations first
      console.log('🧹 Cleaning up existing conversations...');
      await endAllActiveConversations();
      
      // Wait for cleanup to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Extract user name - try multiple sources
      let userName = 'Style Enthusiast';
      if (user) {
        userName = user.user_metadata?.full_name || 
                  user.user_metadata?.name || 
                  user.email?.split('@')[0] || 
                  'Style Enthusiast';
      }
      
      console.log('👤 Using name for video chat:', userName);
      
      const conversationalContext = `You are Alex, a sophisticated AI style advisor with advanced visual analysis capabilities. The user's name is ${userName}. Provide personalized fashion advice, analyze outfits, and help users develop their personal style. Be friendly, knowledgeable, and visually perceptive. Help users understand colors, patterns, and styling techniques. Address the user by their name when appropriate.`;
      
      console.log('🎯 Creating conversation with context for:', userName);
      
      const conversation = await createConversation(
        "Style Sense Video Chat",
        conversationalContext,
        "p869ead8c67b", // Using the correct persona_id
        currentSessionId || undefined,
        userName
      );
      
      console.log('=== VIDEO CONVERSATION CREATED ===');
      console.log('Full conversation response:', conversation);
      
      if (conversation?.conversation_url && conversation?.conversation_id) {
        setVideoConversationUrl(conversation.conversation_url);
        setCurrentConversationId(conversation.conversation_id);
        
        console.log('✅ Video conversation URL set:', conversation.conversation_url);
        console.log('✅ Video conversation ID set:', conversation.conversation_id);
        
        toast({
          title: "Video chat ready!",
          description: `Welcome ${userName}! Your video chat with Alex is starting.`,
        });
      } else {
        console.error('❌ Invalid conversation response:', conversation);
        throw new Error('No conversation URL or ID returned from Tavus API');
      }
    } catch (error) {
      console.error('❌ Failed to start video conversation:', error);
      
      // Clear any partial state
      setVideoConversationUrl(null);
      setCurrentConversationId(null);
      setCurrentConversation(null);
      setHasTriedAutoStart(false); // Allow retry
      
      let errorMessage = "Failed to start video conversation. Please try again.";
      if (error.message?.includes('Authentication required')) {
        errorMessage = "Please sign in to start a video chat.";
        onVideoModeChange?.(false);
      } else if (error.message?.includes('maximum concurrent conversations')) {
        errorMessage = "Video chat limit reached. Please wait a moment and try again.";
      }
      
      toast({
        title: "Video chat error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsCreatingVideo(false);
    }
  };

  const handleEndVideoCall = async () => {
    console.log('🛑 Ending video call');
    console.log('Current conversation ID:', currentConversationId);
    
    if (currentConversationId) {
      console.log('🛑 Ending Tavus conversation:', currentConversationId);
      try {
        const result = await endConversation(currentConversationId);
        console.log('✅ Tavus conversation ended successfully:', result);
        
        toast({
          title: "Video chat ended",
          description: "Your video conversation has been properly closed.",
        });
      } catch (error) {
        console.error('❌ Failed to end Tavus conversation:', error);
        
        toast({
          title: "Warning",
          description: "Failed to properly end video conversation. It may still be active.",
          variant: "destructive",
        });
      }
    }
    
    // Clear all video call state
    setVideoConversationUrl(null);
    setCurrentConversationId(null);
    setCurrentConversation(null);
    setHasTriedAutoStart(false);
    onVideoModeChange?.(false);
    
    console.log('🧹 Video call state cleared');
  };

  const handleRetryVideoChat = () => {
    console.log('🔄 Retrying video chat...');
    setHasTriedAutoStart(false);
    setVideoConversationUrl(null);
    setCurrentConversationId(null);
    setCurrentConversation(null);
    
    // Start the video chat again
    setTimeout(() => {
      handleStartVideoChat();
    }, 500);
  };

  if (isVideoMode) {
    return (
      <div className="flex h-full flex-col bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-800/50 shadow-2xl overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <DailyVideoFrame 
            conversationUrl={videoConversationUrl}
            onClose={handleEndVideoCall}
            onRetry={handleRetryVideoChat}
            isLoading={isCreatingVideo || isCreatingConversation}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-800/50 shadow-2xl overflow-hidden">
      <div className="flex-1 overflow-hidden">
        <ChatMessages 
          messages={messages}
          isAnalyzing={isAnalyzing}
        />
      </div>
      <div className="flex-shrink-0">
        <ChatInput 
          isAnalyzing={isAnalyzing}
          onSendMessage={onSendMessage}
          temperature={temperature}
        />
      </div>
    </div>
  );
};

export default StyleAdvice;
