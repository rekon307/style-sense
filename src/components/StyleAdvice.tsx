
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

    if (isVideoMode && !videoConversationUrl && !isCreatingVideo && user && !currentConversation) {
      console.log('Auto-starting video chat...');
      handleStartVideoChat();
    }
  }, [isVideoMode, user, videoConversationUrl, isCreatingVideo, currentConversation]);

  // Update parent with video URL changes
  useEffect(() => {
    onVideoUrlChange?.(videoConversationUrl);
  }, [videoConversationUrl, onVideoUrlChange]);

  // Cleanup when switching from video to text mode
  useEffect(() => {
    if (!isVideoMode && currentConversationId) {
      console.log('🔄 Switching to text mode - ending video conversation');
      handleEndVideoCall();
    }
  }, [isVideoMode]);

  // Cleanup on session change
  useEffect(() => {
    if (currentConversationId) {
      console.log('🔄 Session changed - ending current conversation');
      endConversation(currentConversationId, false).then(() => {
        setVideoConversationUrl(null);
        setCurrentConversationId(null);
        setCurrentConversation(null);
      }).catch(console.error);
    }
  }, [currentSessionId]);

  const handleStartVideoChat = async () => {
    if (isCreatingVideo || isCreatingConversation) {
      console.log('Already creating video conversation, skipping...');
      return;
    }

    setIsCreatingVideo(true);
    
    try {
      console.log('=== STARTING VIDEO CHAT ===');
      console.log('Current session ID:', currentSessionId);
      console.log('User:', user);
      
      // End any existing conversations first
      await endAllActiveConversations();
      
      // Wait a moment for cleanup to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Style Enthusiast';
      console.log('Using name for video chat:', userName);
      
      const conversation = await createConversation(
        "Style Sense Video Chat",
        `You are Alex, a sophisticated AI style advisor with advanced visual analysis capabilities. The user's name is ${userName}. Provide personalized fashion advice, analyze outfits, and help users develop their personal style. Be friendly, knowledgeable, and visually perceptive. Help users understand colors, patterns, and styling techniques. Address the user by their name when appropriate.`,
        "p347dab0cef8",
        currentSessionId || undefined,
        userName
      );
      
      console.log('=== VIDEO CONVERSATION CREATED ===');
      console.log('Conversation:', conversation);
      
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
        console.error('❌ No conversation URL or ID returned');
        toast({
          title: "Error",
          description: "Failed to get video conversation details. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Failed to start video conversation:', error);
      
      toast({
        title: "Error",
        description: "Failed to start video conversation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingVideo(false);
    }
  };

  const handleEndVideoCall = async () => {
    console.log('🛑 Ending video call');
    
    if (currentConversationId) {
      console.log('🛑 Ending Tavus conversation:', currentConversationId);
      try {
        await endConversation(currentConversationId);
        console.log('✅ Tavus conversation ended successfully');
      } catch (error) {
        console.error('❌ Failed to end Tavus conversation:', error);
      }
    }
    
    // Clear all video call state
    setVideoConversationUrl(null);
    setCurrentConversationId(null);
    setCurrentConversation(null);
    onVideoModeChange?.(false);
  };

  if (isVideoMode) {
    return (
      <div className="flex h-full flex-col bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-800/50 shadow-2xl overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <DailyVideoFrame 
            conversationUrl={videoConversationUrl}
            onClose={handleEndVideoCall}
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
