
import { useState } from "react";
import ChatHeader from "./chat/ChatHeader";
import ChatMessages from "./chat/ChatMessages";
import ChatInput from "./chat/ChatInput";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Brain, Target, Sparkles, Cpu } from "lucide-react";

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

  const getCognitivePersonality = (temp: number) => {
    if (temp <= 0.3) return { 
      label: "Analyst", 
      icon: Target, 
      description: "Factual & Precise",
      color: "text-slate-600 dark:text-slate-400"
    };
    if (temp <= 0.6) return { 
      label: "Maestro", 
      icon: Brain, 
      description: "Balanced & Sophisticated",
      color: "text-blue-600 dark:text-blue-400"
    };
    return { 
      label: "Creative", 
      icon: Sparkles, 
      description: "Inspired & Experimental",
      color: "text-purple-600 dark:text-purple-400"
    };
  };

  const currentPersonality = getCognitivePersonality(temperature);

  return (
    <div className="flex h-full flex-col">
      <ChatHeader 
        isAnalyzing={isAnalyzing}
        selectedModel={selectedModel}
        onModelChange={onModelChange}
      />
      
      {/* Alex's Cognitive Personality Dial */}
      <div className="border-b border-slate-200/50 dark:border-slate-700/50 p-4 bg-gradient-to-r from-white/40 to-blue-50/40 dark:from-slate-900/40 dark:to-slate-800/40 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Cpu className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Alex's Cognitive Mode: 
            </span>
            <span className={`text-sm font-semibold ${currentPersonality.color}`}>
              {currentPersonality.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <currentPersonality.icon className={`h-4 w-4 ${currentPersonality.color}`} />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {currentPersonality.description}
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
            className="flex flex-col items-center gap-1 px-3 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 data-[state=on]:bg-slate-200 dark:data-[state=on]:bg-slate-700"
            variant="outline"
          >
            <Target className="h-3 w-3" />
            <span>Analyst</span>
            <span className="text-[10px] text-slate-500">Factual</span>
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="0.5" 
            className="flex flex-col items-center gap-1 px-3 py-2 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20 data-[state=on]:bg-blue-100 dark:data-[state=on]:bg-blue-900/40"
            variant="outline"
          >
            <Brain className="h-3 w-3" />
            <span>Maestro</span>
            <span className="text-[10px] text-slate-500">Balanced</span>
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="0.8" 
            className="flex flex-col items-center gap-1 px-3 py-2 text-xs hover:bg-purple-50 dark:hover:bg-purple-900/20 data-[state=on]:bg-purple-100 dark:data-[state=on]:bg-purple-900/40"
            variant="outline"
          >
            <Sparkles className="h-3 w-3" />
            <span>Creative</span>
            <span className="text-[10px] text-slate-500">Inspired</span>
          </ToggleGroupItem>
        </ToggleGroup>
        
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 text-center">
          Cognitive Temperature: {temperature} | Chain-of-Thought Processing Active
        </div>
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
