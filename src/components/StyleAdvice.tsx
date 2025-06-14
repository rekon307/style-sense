
import { useState } from "react";
import ChatHeader from "./chat/ChatHeader";
import ChatMessages from "./chat/ChatMessages";
import ChatInput from "./chat/ChatInput";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Brain, Target, Sparkles } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface StyleAdviceProps {
  messages: Message[];
  isAnalyzing: boolean;
  onSendMessage: (message: string, image?: string | null, temperature?: number) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const StyleAdvice = ({ messages, isAnalyzing, onSendMessage, selectedModel, onModelChange }: StyleAdviceProps) => {
  const [temperature, setTemperature] = useState<number>(0.5);

  const getPersonalityConfig = (temp: number) => {
    if (temp <= 0.3) return { label: "Analyst", icon: Target, description: "Factual & Precise" };
    if (temp <= 0.6) return { label: "Maestro", icon: Brain, description: "Balanced & Sophisticated" };
    return { label: "Creative", icon: Sparkles, description: "Inspired & Experimental" };
  };

  const currentPersonality = getPersonalityConfig(temperature);

  return (
    <div className="flex h-full flex-col">
      <ChatHeader 
        isAnalyzing={isAnalyzing}
        selectedModel={selectedModel}
        onModelChange={onModelChange}
      />
      
      {/* AI Personality Dial */}
      <div className="border-b border-slate-200/50 dark:border-slate-700/50 p-4 bg-white/30 dark:bg-slate-900/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <currentPersonality.icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Alex's Personality: {currentPersonality.label}
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {currentPersonality.description}
          </span>
        </div>
        
        <ToggleGroup 
          type="single" 
          value={temperature.toString()} 
          onValueChange={(value) => value && setTemperature(parseFloat(value))}
          className="grid grid-cols-3 gap-1"
        >
          <ToggleGroupItem 
            value="0.2" 
            className="flex flex-col items-center gap-1 px-3 py-2 text-xs"
            variant="outline"
          >
            <Target className="h-3 w-3" />
            <span>Analyst</span>
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="0.5" 
            className="flex flex-col items-center gap-1 px-3 py-2 text-xs"
            variant="outline"
          >
            <Brain className="h-3 w-3" />
            <span>Maestro</span>
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="0.8" 
            className="flex flex-col items-center gap-1 px-3 py-2 text-xs"
            variant="outline"
          >
            <Sparkles className="h-3 w-3" />
            <span>Creative</span>
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
