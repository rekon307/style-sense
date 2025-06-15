import { useState } from "react";
import ChatHeader from "./chat/ChatHeader";
import ChatMessages from "./chat/ChatMessages";
import ChatInput from "./chat/ChatInput";
import VideoConversationEmbed from "./VideoConversationEmbed";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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
}

const StyleAdvice = ({ messages, isAnalyzing, onSendMessage, selectedModel, onModelChange, currentSessionId }: StyleAdviceProps) => {
  const [temperature, setTemperature] = useState<number>(0.5);
  const [isVideoMode, setIsVideoMode] = useState<boolean>(false);
  const [videoConversationUrl, setVideoConversationUrl] = useState<string | null>(null);
  const { createConversation, isCreatingConversation } = useTavus();

  const handleStartVideoChat = async () => {
    try {
      console.log('=== STARTING VIDEO CHAT ===');
      console.log('Current session ID:', currentSessionId);
      
      const conversation = await createConversation(
        "Style Sense Video Chat",
        "You are Alex, a sophisticated AI style advisor with advanced visual analysis capabilities. Provide personalized fashion advice, analyze outfits, and help users develop their personal style. Be friendly, knowledgeable, and visually perceptive. Help users understand colors, patterns, and styling techniques.",
        "p347dab0cef8",
        currentSessionId || undefined
      );
      
      console.log('=== VIDEO CONVERSATION CREATED ===');
      console.log('Conversation:', conversation);
      
      if (conversation?.conversation_url) {
        setVideoConversationUrl(conversation.conversation_url);
        console.log('✅ Video conversation URL set:', conversation.conversation_url);
      } else {
        console.error('❌ No conversation URL returned');
        toast({
          title: "Error",
          description: "Failed to get video conversation URL. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Failed to start video conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start video conversation. Please check the logs.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-full flex-col bg-white dark:bg-gray-900">
      <ChatHeader 
        isAnalyzing={isAnalyzing || isCreatingConversation}
        isVideoMode={isVideoMode}
        onVideoModeChange={setIsVideoMode}
        onStartVideoChat={handleStartVideoChat}
      />
      
      {/* Response Style - only show in text mode */}
      {!isVideoMode && (
        <div className="border-b border-gray-100 dark:border-gray-800 px-4 py-3 bg-white dark:bg-gray-900">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Response Style</div>
          <ToggleGroup 
            type="single" 
            value={temperature.toString()} 
            onValueChange={(value) => value && setTemperature(parseFloat(value))}
            className="grid grid-cols-3 gap-2"
          >
            <ToggleGroupItem 
              value="0.2" 
              className="text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 data-[state=on]:bg-blue-500 data-[state=on]:text-white data-[state=on]:border-blue-500"
              variant="outline"
            >
              Precise
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="0.5" 
              className="text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 data-[state=on]:bg-blue-500 data-[state=on]:text-white data-[state=on]:border-blue-500"
              variant="outline"
            >
              Balanced
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="0.8" 
              className="text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 data-[state=on]:bg-blue-500 data-[state=on]:text-white data-[state=on]:border-blue-500"
              variant="outline"
            >
              Creative
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}
      
      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {isVideoMode ? (
          <VideoConversationEmbed 
            conversationUrl={videoConversationUrl}
            onClose={() => {
              setIsVideoMode(false);
              setVideoConversationUrl(null);
            }}
          />
        ) : (
          <>
            <ChatMessages 
              messages={messages}
              isAnalyzing={isAnalyzing}
            />
            <ChatInput 
              isAnalyzing={isAnalyzing}
              onSendMessage={onSendMessage}
              temperature={temperature}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default StyleAdvice;
