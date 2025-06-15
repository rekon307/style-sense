
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles } from "lucide-react";
import { useAlexState } from "@/contexts/AlexStateContext";

interface ChatHeaderProps {
  isAnalyzing: boolean;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const ChatHeader = ({ isAnalyzing, selectedModel, onModelChange }: ChatHeaderProps) => {
  const { status } = useAlexState();

  const getStatusIndicator = () => {
    switch (status) {
      case 'listening':
        return 'bg-blue-500 animate-pulse';
      case 'analyzing':
        return 'bg-amber-500 animate-pulse';
      case 'speaking':
        return 'bg-cyan-500 animate-pulse';
      default:
        return 'bg-green-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'listening':
        return 'Listening';
      case 'analyzing':
        return 'Thinking';
      case 'speaking':
        return 'Speaking';
      default:
        return 'Online';
    }
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800 ${getStatusIndicator()}`}></div>
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Alex
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {getStatusText()}
            </p>
          </div>
        </div>
        
        <Select value={selectedModel} onValueChange={onModelChange}>
          <SelectTrigger className="h-9 w-36 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-4o-mini">AI Style Mini</SelectItem>
            <SelectItem value="gpt-4o">AI Style Pro</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ChatHeader;
