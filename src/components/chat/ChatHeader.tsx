
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Settings } from "lucide-react";

interface ChatHeaderProps {
  isAnalyzing: boolean;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const ChatHeader = ({ isAnalyzing, selectedModel, onModelChange }: ChatHeaderProps) => {
  const getModelDisplayName = (model: string) => {
    switch (model) {
      case "gpt-4o-mini":
        return "AI Style";
      case "gpt-4o":
        return "AI Style PRO";
      default:
        return "AI Style";
    }
  };

  return (
    <div className="border-b border-slate-200/50 dark:border-slate-700/50 px-4 py-4">
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
        
        {/* Right Column - Model Selector */}
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          <Select value={selectedModel} onValueChange={onModelChange}>
            <SelectTrigger className="h-10 w-32 text-sm bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4o-mini">
                <div className="flex flex-col items-start py-1">
                  <span className="font-medium">AI Style</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">GPT-4o Mini</span>
                </div>
              </SelectItem>
              <SelectItem value="gpt-4o">
                <div className="flex flex-col items-start py-1">
                  <span className="font-medium">AI Style PRO</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">GPT-4o</span>
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
