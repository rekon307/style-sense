
import { useState } from "react";
import ChatHeader from "./chat/ChatHeader";
import ChatMessages from "./chat/ChatMessages";
import ChatInput from "./chat/ChatInput";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Brain, Cpu } from "lucide-react";
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

  const getPersonalityLabel = (temp: number) => {
    if (temp <= 0.3) return "Factual";
    if (temp <= 0.6) return "Balanced";
    return "Creative";
  };

  return (
    <div className="flex h-full flex-col">
      <ChatHeader 
        isAnalyzing={isAnalyzing}
        selectedModel={selectedModel}
        onModelChange={onModelChange}
      />
      
      <div className="border-b border-slate-200/50 dark:border-slate-700/50 p-3 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Mode: {getPersonalityLabel(temperature)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="h-3 w-3 text-slate-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Temp: {temperature}
            </span>
          </div>
        </div>
        
        <ToggleGroup 
          type="single" 
          value={temperature.toString()} 
          onValueChange={(value) => value && setTemperature(parseFloat(value))}
          className="grid grid-cols-3 gap-1"
        >
          <ToggleGroupItem 
            value="0.2" 
            className="text-xs px-2 py-1"
            variant="outline"
          >
            Factual
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="0.5" 
            className="text-xs px-2 py-1"
            variant="outline"
          >
            Balanced
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="0.8" 
            className="text-xs px-2 py-1"
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
