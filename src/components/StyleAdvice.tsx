
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
  
  // Track previous values to detect changes
  const previousVideoModeRef = useRef<boolean>(isVideoMode);
  const previousSessionIdRef = useRef<string | null>(currentSessionId);
  const isEndingConversationRef = useRef<boolean>(false);
  
  const { 
    createConversation, 
    endConversation, 
    endAllActiveConversations,
    isCreatingConversation, 
    currentConversation,
    setCurrentConversation
  } = useTavus();

  const temperature = 0.2;

  // Function to safely end video conversation
  const safeEndVideoConversation = async (conversationId: string | null = null) => {
    const idToEnd = conversationId || currentConversationId;
    
    if (!idToEnd || isEndingConversationRef.current) {
      console.log('🔄 No conversation to end or already ending');
      return;
    }

    isEndingConversationRef.current = true;
    console.log('🛑 Safely ending video conversation:', idToEnd);
    
    try {
      await endConversation(idToEnd);
      console.log('✅ Video conversation ended successfully');
      
      // Clear all video call state
      setVideoConversationUrl(null);
      setCurrentConversationId(null);
      setCurrentConversation(null);
      setHasTriedAutoStart(false);
      
      // Update parent component
      onVideoUrlChange?.(null);
      
      toast({
        title: "Video chat ended",
        description: "Your video conversation has been properly closed.",
      });
    } catch (error) {
      console.error('❌ Failed to end video conversation:', error);
      
      toast({
        title: "Warning",
        description: "Failed to properly end video conversation. It may still be active.",
        variant: "destructive",
      });
    } finally {
      isEndingConversationRef.current = false;
    }
  };

  // Watch for session changes and end conversation immediately
  useEffect(() => {
    console.log('=== SESSION CHANGE DETECTION ===');
    console.log('Previous session:', previousSessionIdRef.current);
    console.log('Current session:', currentSessionId);
    console.log('Current conversation ID:', currentConversationId);

    // If session changed and we have an active conversation, end it immediately
    if (previousSessionIdRef.current !== currentSessionId && currentConversationId) {
      console.log('🔄 Session changed - ending video conversation');
      safeEndVideoConversation();
    }
    
    // Update the ref for next comparison
    previousSessionIdRef.current = currentSessionId;
  }, [currentSessionId, currentConversationId]);

  // Watch for video mode changes and end conversation when switching to text mode
  useEffect(() => {
    console.log('=== VIDEO MODE CHANGE DETECTION ===');
    console.log('Previous video mode:', previousVideoModeRef.current);
    console.log('Current video mode:', isVideoMode);
    console.log('Current conversation ID:', currentConversationId);

    // If we're switching FROM video mode TO text mode and have an active conversation
    if (previousVideoModeRef.current === true && isVideoMode === false && currentConversationId) {
      console.log('🔄 Detected switch from video to text mode - ending conversation');
      safeEndVideoConversation();
    }
    
    // Update the ref for next comparison
    previousVideoModeRef.current = isVideoMode;
  }, [isVideoMode, currentConversationId]);

  // Auto-start video conversation when switching to video mode (only if no active conversation)
  useEffect(() => {
    console.log('=== VIDEO MODE AUTO-START EFFECT ===');
    console.log('isVideoMode:', isVideoMode);
    console.log('videoConversationUrl:', videoConversationUrl);
    console.log('currentConversationId:', currentConversationId);
    console.log('isCreatingVideo:', isCreatingVideo);
    console.log('hasTriedAutoStart:', hasTriedAutoStart);

    // Only auto-start if we're in video mode, don't have an active conversation, and haven't tried yet
    if (isVideoMode && !videoConversationUrl && !currentConversationId && !isCreatingVideo && !hasTriedAutoStart) {
      console.log('🎬 Auto-starting video chat...');
      setHasTriedAutoStart(true);
      handleStartVideoChat();
    }
  }, [isVideoMode, videoConversationUrl, currentConversationId, isCreatingVideo, hasTriedAutoStart]);

  // Reset auto-start flag when switching away from video mode
  useEffect(() => {
    if (!isVideoMode) {
      setHasTriedAutoStart(false);
    }
  }, [isVideoMode]);

  // Update parent with video URL changes
  useEffect(() => {
    console.log('🔗 Updating parent with video URL:', videoConversationUrl);
    onVideoUrlChange?.(videoConversationUrl);
  }, [videoConversationUrl, onVideoUrlChange]);

  // Handle component unmount - always end active conversations
  useEffect(() => {
    return () => {
      if (currentConversationId) {
        console.log('🧹 Component unmounting - ending conversation:', currentConversationId);
        // Use the Tavus hook directly for cleanup on unmount
        endConversation(currentConversationId).catch(console.error);
      }
    };
  }, [currentConversationId, endConversation]);

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
      
      const conversationalContext = `You are Andrew, a sophisticated AI style advisor with advanced visual analysis capabilities. The user's name is ${userName}. Provide personalized fashion advice, analyze outfits, and help users develop their personal style. Be friendly, knowledgeable, and visually perceptive. Help users understand colors, patterns, and styling techniques. Address the user by their name when appropriate.`;
      
      console.log('🎯 Creating conversation with context for:', userName);
      
      const conversation = await createConversation(
        "Style Sense Video Chat",
        conversationalContext,
        "p869ead8c67b",
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
          description: `Welcome ${userName}! Your video chat with Andrew is starting.`,
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
      setHasTriedAutoStart(false);
      
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
    console.log('🛑 Manual end video call triggered');
    await safeEndVideoConversation();
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

  const handleVideoModeChange = async (newVideoMode: boolean) => {
    console.log('🔄 Video mode changing to:', newVideoMode);
    
    // If switching to text mode and we have an active conversation, end it first
    if (!newVideoMode && currentConversationId) {
      console.log('🛑 Manual switch to text mode - ending conversation:', currentConversationId);
      await safeEndVideoConversation();
    }
    
    // Then update the mode
    if (onVideoModeChange) {
      onVideoModeChange(newVideoMode);
    }
  };

  if (isVideoMode) {
    return (
      <div className="flex h-full flex-col bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-800/50 shadow-2xl overflow-hidden">
        <ChatHeader 
          isAnalyzing={isAnalyzing}
          isVideoMode={isVideoMode}
          onVideoModeChange={handleVideoModeChange}
          onStartVideoChat={handleStartVideoChat}
        />
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
      <ChatHeader 
        isAnalyzing={isAnalyzing}
        isVideoMode={isVideoMode}
        onVideoModeChange={handleVideoModeChange}
        onStartVideoChat={handleStartVideoChat}
      />
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
