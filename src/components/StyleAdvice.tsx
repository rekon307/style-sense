
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
  const [isVideoMode, setIsVideoMode] = useState<boolean>(true);
  const [videoConversationUrl, setVideoConversationUrl] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [preservedVideoUrl, setPreservedVideoUrl] = useState<string | null>(null);
  const [preservedConversationId, setPreservedConversationId] = useState<string | null>(null);
  const { createConversation, endConversation, isCreatingConversation, isEndingConversation, cleanupOldConversations } = useTavus();

  // Fixed temperature for precise mode only
  const temperature = 0.2;

  // Auto-start video chat when component mounts
  useEffect(() => {
    if (isVideoMode && !videoConversationUrl && !isCreatingConversation && !preservedVideoUrl) {
      handleStartVideoChat();
    }
  }, []);

  // Notify parent component of video mode changes
  useEffect(() => {
    onVideoModeChange?.(isVideoMode);
  }, [isVideoMode, onVideoModeChange]);

  // Notify parent component of video URL changes
  useEffect(() => {
    onVideoUrlChange?.(videoConversationUrl);
  }, [videoConversationUrl, onVideoUrlChange]);

  // Restore preserved video URL when switching back to video mode
  useEffect(() => {
    if (isVideoMode && preservedVideoUrl && !videoConversationUrl) {
      console.log('🔄 Restoring preserved video conversation:', preservedVideoUrl);
      setVideoConversationUrl(preservedVideoUrl);
      toast({
        title: "Video chat restored",
        description: "Your previous video conversation has been restored.",
      });
    }
  }, [isVideoMode, preservedVideoUrl, videoConversationUrl]);

  const handleStartVideoChat = async () => {
    try {
      console.log('=== STARTING DAILY VIDEO CHAT ===');
      console.log('Current session ID:', currentSessionId);
      console.log('User:', user);
      
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
        setPreservedVideoUrl(conversation.conversation_url);
        setPreservedConversationId(conversation.conversation_id);
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
        console.log('Attempting to cleanup old conversations...');
        toast({
          title: "Video chat limit reached",
          description: "Cleaning up previous sessions. Please try again in a moment.",
          variant: "destructive",
        });
        
        // Try cleanup in background
        cleanupOldConversations().then(() => {
          console.log('Cleanup completed, user can try again');
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to start video conversation. Please check the logs.",
          variant: "destructive",
        });
      }
    }
  };

  const handleVideoModeToggle = (newVideoMode: boolean) => {
    console.log('🔄 Video mode toggle:', { from: isVideoMode, to: newVideoMode, hasUrl: !!videoConversationUrl });
    
    if (!newVideoMode && videoConversationUrl) {
      // Switching from video to text - preserve the URL and conversation ID
      console.log('💾 Preserving video URL for later restore:', videoConversationUrl);
      console.log('💾 Preserving conversation ID:', currentConversationId);
      setPreservedVideoUrl(videoConversationUrl);
      setPreservedConversationId(currentConversationId);
      // Don't clear videoConversationUrl immediately to avoid triggering new conversation
    } else if (newVideoMode && !videoConversationUrl && !preservedVideoUrl && !isCreatingConversation) {
      // Switching to video mode with no existing conversation
      handleStartVideoChat();
    } else if (newVideoMode && preservedVideoUrl && preservedConversationId) {
      // Restore preserved conversation
      setVideoConversationUrl(preservedVideoUrl);
      setCurrentConversationId(preservedConversationId);
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
        // Don't block the UI cleanup even if Tavus ending fails
      }
    }
    
    // Clear all video call state
    setVideoConversationUrl(null);
    setCurrentConversationId(null);
    setPreservedVideoUrl(null);
    setPreservedConversationId(null);
    setIsVideoMode(false);
  };

  return (
    <div className="flex h-full flex-col bg-white dark:bg-gray-900">
      <ChatHeader 
        isAnalyzing={isAnalyzing || isCreatingConversation || isEndingConversation}
        isVideoMode={isVideoMode}
        onVideoModeChange={handleVideoModeToggle}
        onStartVideoChat={handleStartVideoChat}
      />
      
      {/* Content Area - only show text chat interface */}
      {!isVideoMode && (
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
      
      {/* Video mode */}
      {isVideoMode && (
        <div className="flex-1 overflow-hidden">
          <DailyVideoFrame 
            conversationUrl={videoConversationUrl}
            onClose={handleEndVideoCall}
          />
        </div>
      )}
    </div>
  );
};

export default StyleAdvice;
