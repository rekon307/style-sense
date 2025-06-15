
import { useState, useEffect } from "react";
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
  onVideoUrlChange
}: StyleAdviceProps) => {
  const [isVideoMode, setIsVideoMode] = useState<boolean>(false);
  const [videoConversationUrl, setVideoConversationUrl] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isCreatingVideo, setIsCreatingVideo] = useState(false);
  const { createConversation, endConversation, isCreatingConversation, isEndingConversation, cleanupOldConversations } = useTavus();

  // Fixed temperature for precise mode only
  const temperature = 0.2;

  // Notify parent component of video mode changes
  useEffect(() => {
    onVideoModeChange?.(isVideoMode);
  }, [isVideoMode, onVideoModeChange]);

  // Notify parent component of video URL changes
  useEffect(() => {
    onVideoUrlChange?.(videoConversationUrl);
  }, [videoConversationUrl, onVideoUrlChange]);

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
      
      // First, cleanup any old conversations
      console.log('Cleaning up old conversations before creating new one...');
      await cleanupOldConversations();
      
      // Wait a moment for cleanup to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get user's name or use default
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
      
      // If it's a concurrent conversation limit, try cleanup and show helpful message
      if (error.message && error.message.includes('maximum concurrent conversations')) {
        toast({
          title: "Video chat limit reached",
          description: "Cleaning up previous sessions. Please wait a moment and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to start video conversation. Please try again in a moment.",
          variant: "destructive",
        });
      }
    } finally {
      setIsCreatingVideo(false);
    }
  };

  const handleVideoModeToggle = async (newVideoMode: boolean) => {
    console.log('🔄 Video mode toggle:', { from: isVideoMode, to: newVideoMode });
    
    if (newVideoMode && !videoConversationUrl && !isCreatingVideo) {
      // Switching to video mode - create new conversation
      await handleStartVideoChat();
    } else if (!newVideoMode && currentConversationId) {
      // Switching from video to text - end the video conversation
      try {
        await endConversation(currentConversationId);
        setVideoConversationUrl(null);
        setCurrentConversationId(null);
      } catch (error) {
        console.error('Failed to end conversation:', error);
      }
    }
    
    setIsVideoMode(newVideoMode);
  };

  const handleEndVideoCall = async () => {
    console.log('🛑 Ending video call');
    
    // End the conversation on Tavus if we have a conversation ID
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
    setIsVideoMode(false);
  };

  return (
    <div className="flex h-full flex-col bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-800/50 shadow-2xl overflow-hidden">
      <ChatHeader 
        isAnalyzing={isAnalyzing || isCreatingConversation || isEndingConversation || isCreatingVideo}
        isVideoMode={isVideoMode}
        onVideoModeChange={handleVideoModeToggle}
        onStartVideoChat={handleStartVideoChat}
      />
      
      {isVideoMode ? (
        <div className="flex-1 overflow-hidden">
          <DailyVideoFrame 
            conversationUrl={videoConversationUrl}
            onClose={handleEndVideoCall}
          />
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

export default StyleAdvice;
