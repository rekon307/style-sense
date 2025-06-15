
import { Button } from "@/components/ui/button";
import { Sparkles, MessageSquare, Video, Zap } from "lucide-react";
import { useAlexState } from "@/contexts/AlexStateContext";

interface ChatHeaderProps {
  isAnalyzing: boolean;
  isVideoMode: boolean;
  onVideoModeChange: (isVideoMode: boolean) => void;
  onStartVideoChat: () => void;
}

const ChatHeader = ({ isAnalyzing, isVideoMode, onVideoModeChange, onStartVideoChat }: ChatHeaderProps) => {
  const { status } = useAlexState();

  const getStatusIndicator = () => {
    switch (status) {
      case 'listening':
        return 'bg-blue-500 animate-pulse';
      case 'analyzing':
        return 'bg-orange-500 animate-pulse';
      case 'speaking':
        return 'bg-green-500 animate-pulse';
      default:
        return 'bg-green-500';
    }
  };

  const getStatusText = () => {
    if (isAnalyzing) return 'processing...';
    
    switch (status) {
      case 'listening':
        return 'listening...';
      case 'analyzing':
        return 'thinking...';
      case 'speaking':
        return 'speaking...';
      default:
        return 'ready';
    }
  };

  const handleTextModeClick = () => {
    console.log('📝 Switching to text mode');
    onVideoModeChange(false);
  };

  const handleVideoModeClick = () => {
    console.log('🎥 Switching to video mode');
    if (!isVideoMode) {
      onStartVideoChat();
    }
    onVideoModeChange(true);
  };

  return (
    <div className="border-b border-gray-100/50 dark:border-gray-800/50 bg-gradient-to-r from-white/80 to-gray-50/80 dark:from-gray-900/80 dark:to-gray-800/80 backdrop-blur-sm px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 ${getStatusIndicator()}`}></div>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Alex</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {getStatusText()}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={!isVideoMode ? "default" : "outline"}
            size="sm"
            onClick={handleTextModeClick}
            disabled={isAnalyzing}
            className={`flex items-center gap-2 h-10 px-4 text-sm font-medium rounded-xl transition-all duration-200 ${
              !isVideoMode 
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Text Chat
          </Button>
          <Button
            variant={isVideoMode ? "default" : "outline"}
            size="sm"
            onClick={handleVideoModeClick}
            disabled={isAnalyzing}
            className={`flex items-center gap-2 h-10 px-4 text-sm font-medium rounded-xl transition-all duration-200 ${
              isVideoMode 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}
          >
            <Video className="h-4 w-4" />
            Video Chat
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
