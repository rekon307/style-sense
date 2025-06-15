
import { useState, useEffect, useRef } from "react";
import ChatHeader from "./chat/ChatHeader";
import ChatMessages from "./chat/ChatMessages";
import ChatInput from "./chat/ChatInput";
import DailyVideoFrame from "./DailyVideoFrame";
import { useTavus } from "@/hooks/useTavus";
import { toast } from "@/hooks/use-toast";
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
  
  const endingConversationRef = useRef<string | null>(null);
  const previousSessionIdRef = useRef<string | null>(currentSessionId);
  const isInitialRenderRef = useRef<boolean>(true);
  const previousVideoModeRef = useRef<boolean | null>(null);
  
  const { 
    createConversation, 
    endConversation, 
    endAllActiveConversations,
    isCreatingConversation, 
    currentConversation,
    setCurrentConversation
  } = useTavus();

  const temperature = 0.2;

  const safeEndVideoConversation = async (conversationId: string | null = null) => {
    const idToEnd = conversationId || currentConversationId;
    
    if (!idToEnd) {
      console.log('🔄 No conversation to end');
      return;
    }

    if (endingConversationRef.current === idToEnd) {
      console.log('🔄 Already ending conversation:', idToEnd);
      return;
    }

    endingConversationRef.current = idToEnd;
    console.log('🛑 Starting to end video conversation:', idToEnd);
    
    try {
      await endConversation(idToEnd);
      console.log('✅ Video conversation ended successfully');
      
      setVideoConversationUrl(null);
      setCurrentConversationId(null);
      setCurrentConversation(null);
      setHasTriedAutoStart(false);
      
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
      endingConversationRef.current = null;
    }
  };

  // Watch for session changes - only end conversation if we actually had one and session changed
  useEffect(() => {
    console.log('=== SESSION CHANGE DETECTION ===');
    console.log('Is initial render:', isInitialRenderRef.current);
    console.log('Previous session:', previousSessionIdRef.current);
    console.log('Current session:', currentSessionId);
    console.log('Current conversation ID:', currentConversationId);

    // Skip on initial render
    if (isInitialRenderRef.current) {
      isInitialRenderRef.current = false;
      previousSessionIdRef.current = currentSessionId;
      return;
    }

    // Only end conversation if session actually changed AND we have an active conversation
    if (previousSessionIdRef.current !== null && 
        previousSessionIdRef.current !== currentSessionId && 
        currentConversationId && 
        !endingConversationRef.current) {
      console.log('🔄 Session changed - ending video conversation');
      safeEndVideoConversation();
    }
    
    previousSessionIdRef.current = currentSessionId;
  }, [currentSessionId, currentConversationId]);

  // Watch for video mode changes - only end when explicitly switching FROM video TO text
  useEffect(() => {
    console.log('=== VIDEO MODE CHANGE DETECTION ===');
    console.log('Previous video mode:', previousVideoModeRef.current);
    console.log('Current video mode:', isVideoMode);
    console.log('Current conversation ID:', currentConversationId);

    // Skip on initial render - just set the initial state
    if (previousVideoModeRef.current === null) {
      console.log('🔄 Setting initial video mode state');
      previousVideoModeRef.current = isVideoMode;
      return;
    }

    // Only end conversation when explicitly switching FROM video mode TO text mode
    // and we have an active conversation
    if (previousVideoModeRef.current === true && 
        isVideoMode === false && 
        currentConversationId && 
        !endingConversationRef.current) {
      console.log('🔄 Detected switch from video to text mode - ending conversation');
      safeEndVideoConversation();
    }

    // Update the previous state
    previousVideoModeRef.current = isVideoMode;
  }, [isVideoMode, currentConversationId]);

  // Auto-start video conversation when switching to video mode
  useEffect(() => {
    console.log('=== VIDEO MODE AUTO-START EFFECT ===');
    console.log('isVideoMode:', isVideoMode);
    console.log('videoConversationUrl:', videoConversationUrl);
    console.log('currentConversationId:', currentConversationId);
    console.log('isCreatingVideo:', isCreatingVideo);
    console.log('hasTriedAutoStart:', hasTriedAutoStart);

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
      
      // Only clean up if we have existing conversations
      if (currentConversationId) {
        console.log('🧹 Cleaning up existing conversation...');
        await endAllActiveConversations();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
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
      
      if (conversation?.conversation_id && conversation?.conversation_url) {
        console.log('✅ Setting video conversation URL:', conversation.conversation_url);
        console.log('✅ Setting video conversation ID:', conversation.conversation_id);
        
        setVideoConversationUrl(conversation.conversation_url);
        setCurrentConversationId(conversation.conversation_id);
        
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
    
    setTimeout(() => {
      handleStartVideoChat();
    }, 500);
  };

  const handleVideoModeChange = async (newVideoMode: boolean) => {
    console.log('🔄 Video mode changing to:', newVideoMode);
    
    // Don't end conversation when switching TO video mode, only when switching FROM video mode
    // The useEffect will handle the actual ending logic
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
