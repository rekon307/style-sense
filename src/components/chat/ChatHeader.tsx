
import { Button } from "@/components/ui/button";
import { Sparkles, MessageSquare, Video } from "lucide-react";
import { useAlexState } from "@/contexts/AlexStateContext";

interface ChatHeaderProps {
  isAnalyzing: boolean;
  isVideoMode: boolean;
  onVideoModeChange: (isVideoMode: boolean) => void;
}

const ChatHeader = ({ isAnalyzing, isVideoMode, onVideoModeChange }: ChatHeaderProps) => {
  const { status } = useAlexState();

  const getStatusIndicator = () => {
    switch (status) {
      case 'listening':
        return 'bg-blue-500';
      case 'analyzing':
        return 'bg-orange-500';
      case 'speaking':
        return 'bg-green-500';
      default:
        return 'bg-green-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'listening':
        return 'listening...';
      case 'analyzing':
        return 'typing...';
      case 'speaking':
        return 'speaking...';
      default:
        return 'online';
    }
  };

  return (
    <div className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${getStatusIndicator()}`}></div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Alex</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{getStatusText()}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={!isVideoMode ? "default" : "outline"}
            size="sm"
            onClick={() => onVideoModeChange(false)}
            className="flex items-center gap-2 h-8 px-3 text-xs"
          >
            <MessageSquare className="h-3 w-3" />
            Text Chat
          </Button>
          <Button
            variant={isVideoMode ? "default" : "outline"}
            size="sm"
            onClick={() => onVideoModeChange(true)}
            className="flex items-center gap-2 h-8 px-3 text-xs bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Video className="h-3 w-3" />
            Video Chat
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
