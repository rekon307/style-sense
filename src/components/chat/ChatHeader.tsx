
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles } from "lucide-react";

interface ChatHeaderProps {
  isAnalyzing: boolean;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const ChatHeader = ({ isAnalyzing, selectedModel, onModelChange }: ChatHeaderProps) => {
  return (
    <div className="border-b border-slate-200/50 dark:border-slate-700/50 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Column - AI Identity with 2 rows */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 ${isAnalyzing ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></div>
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Alex
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              AI Style Consultant
            </p>
          </div>
        </div>
        
        {/* Right Column - AI Style Model Selector without settings icon */}
        <div className="flex items-center">
          <Select value={selectedModel} onValueChange={onModelChange}>
            <SelectTrigger className="h-10 w-40 text-sm bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4o-mini">
                <div className="flex flex-col items-start py-1">
                  <span className="font-medium">AI Style Mini</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Faster responses</span>
                </div>
              </SelectItem>
              <SelectItem value="gpt-4o">
                <div className="flex flex-col items-start py-1">
                  <span className="font-medium">AI Style</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">More precise analysis</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
