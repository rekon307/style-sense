
import { useState } from "react";
import ChatHeader from "./chat/ChatHeader";
import ChatMessages from "./chat/ChatMessages";
import ChatInput from "./chat/ChatInput";
import VideoConversation from "./VideoConversation";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Message } from "@/types/chat";

interface StyleAdviceProps {
  messages: Message[];
  isAnalyzing: boolean;
  onSendMessage: (message: string, image?: string | null, temperature?: number) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const StyleAdvice = ({ messages, isAnalyzing, onSendMessage, selectedModel, onModelChange }: StyleAdviceProps) => {
  const [temperature, setTemperature] = useState<number>(0.5);
  const [isVideoMode, setIsVideoMode] = useState<boolean>(false);

  return (
    <div className="flex h-full flex-col bg-white dark:bg-gray-900">
      <ChatHeader 
        isAnalyzing={isAnalyzing}
        isVideoMode={isVideoMode}
        onVideoModeChange={setIsVideoMode}
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
          <div className="h-full flex items-center justify-center p-4">
            <VideoConversation onClose={() => setIsVideoMode(false)} />
          </div>
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
