
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Settings, Zap } from "lucide-react";

interface ChatHeaderProps {
  isAnalyzing: boolean;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const ChatHeader = ({ isAnalyzing, selectedModel, onModelChange }: ChatHeaderProps) => {
  return (
    <div className="border-b border-slate-200/50 dark:border-slate-700/50 px-4 py-4">
      <div className="flex items-center justify-between">
        {/* AI Identity Section */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 ${isAnalyzing ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></div>
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">Alex AI</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Style Consultant</p>
          </div>
        </div>
        
        {/* Status & Model Selection */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-md bg-slate-50 dark:bg-slate-800/50 px-2 py-1">
            <Zap className="h-3 w-3 text-slate-500 dark:text-slate-400" />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              {isAnalyzing ? 'Analyzing' : 'Ready'}
            </span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <Settings className="h-3 w-3 text-slate-500 dark:text-slate-400" />
            <Select value={selectedModel} onValueChange={onModelChange}>
              <SelectTrigger className="h-8 w-32 text-xs bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="Model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                <SelectItem value="gpt-4o">GPT-4o Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
