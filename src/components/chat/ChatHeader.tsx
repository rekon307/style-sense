
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Settings, Zap } from "lucide-react";

interface ChatHeaderProps {
  isAnalyzing: boolean;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const ChatHeader = ({ isAnalyzing, selectedModel, onModelChange }: ChatHeaderProps) => {
  return (
    <div className="border-b border-slate-200/50 dark:border-slate-700/50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white dark:border-slate-900 ${isAnalyzing ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></div>
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">Alex AI</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Style Consultant</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 px-3 py-2">
          <Zap className="h-3 w-3 text-slate-500 dark:text-slate-400" />
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {isAnalyzing ? 'Analyzing' : 'Ready'}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Settings className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        <Select value={selectedModel} onValueChange={onModelChange}>
          <SelectTrigger className="h-9 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
            <SelectValue placeholder="Select AI model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-4o-mini">GPT-4o Mini (Fast)</SelectItem>
            <SelectItem value="gpt-4o">GPT-4o (Advanced)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ChatHeader;
