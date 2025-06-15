
import { useState } from "react";
import ChatHeader from "./chat/ChatHeader";
import ChatMessages from "./chat/ChatMessages";
import ChatInput from "./chat/ChatInput";
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

  return (
    <div className="flex h-full flex-col bg-white dark:bg-slate-900">
      <ChatHeader 
        isAnalyzing={isAnalyzing}
        selectedModel={selectedModel}
        onModelChange={onModelChange}
      />
      
      <div className="border-b border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800">
        <ToggleGroup 
          type="single" 
          value={temperature.toString()} 
          onValueChange={(value) => value && setTemperature(parseFloat(value))}
          className="grid grid-cols-3 gap-2"
        >
          <ToggleGroupItem 
            value="0.2" 
            className="text-xs px-3 py-2 rounded-lg"
            variant="outline"
          >
            Factual
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="0.5" 
            className="text-xs px-3 py-2 rounded-lg"
            variant="outline"
          >
            Balanced
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="0.8" 
            className="text-xs px-3 py-2 rounded-lg"
            variant="outline"
          >
            Creative
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <ChatMessages 
        messages={messages}
        isAnalyzing={isAnalyzing}
      />

      <ChatInput 
        isAnalyzing={isAnalyzing}
        onSendMessage={onSendMessage}
        temperature={temperature}
      />
    </div>
  );
};

export default StyleAdvice;
