
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Trash2, Clock, MessageSquareText, History, Archive } from "lucide-react";
import { useChatHistory } from "@/hooks/useChatHistory";
import { toast } from "@/components/ui/use-toast";

interface ChatHistoryProps {
  onSessionChange: (sessionId: string | null) => void;
}

const ChatHistory = ({ onSessionChange }: ChatHistoryProps) => {
  const { 
    sessions, 
    currentSessionId, 
    isLoading, 
    createNewSession, 
    deleteSession,
    switchToSession 
  } = useChatHistory();

  const handleNewChat = async () => {
    try {
      const newSessionId = await createNewSession();
      if (newSessionId) {
        onSessionChange(newSessionId);
        toast({
          title: "New chat created",
          description: "Started a fresh conversation.",
        });
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
      toast({
        title: "Error",
        description: "Failed to create new chat. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSessionClick = async (sessionId: string) => {
    try {
      switchToSession(sessionId);
      onSessionChange(sessionId);
      console.log('Switched to session:', sessionId);
    } catch (error) {
      console.error('Error switching session:', error);
      toast({
        title: "Error",
        description: "Failed to load chat session.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    try {
      await deleteSession(sessionId);
      if (currentSessionId === sessionId) {
        onSessionChange(null);
      }
      toast({
        title: "Chat deleted",
        description: "The conversation has been removed.",
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: "Error",
        description: "Failed to delete chat. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return 'Today';
      if (diffDays === 2) return 'Yesterday';
      if (diffDays <= 7) return `${diffDays - 1} days ago`;
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown date';
    }
  };

  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-slate-50/90 to-slate-100/90 dark:from-slate-900/90 dark:to-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-lg">
      <CardHeader className="pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
        <CardTitle className="flex items-center justify-between text-slate-800 dark:text-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 rounded-lg shadow-md">
              <History className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold">Chat History</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Your conversations</span>
            </div>
          </div>
        </CardTitle>
        <Button
          onClick={handleNewChat}
          size="sm"
          disabled={isLoading}
          className="w-full mt-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full px-4">
          <div className="space-y-3 py-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-600 dark:text-slate-400">Loading chats...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-slate-100 via-blue-100 to-purple-100 dark:from-slate-800 dark:via-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <Archive className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 font-medium mb-2">No conversations yet</p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  Start a new chat to see your conversation history
                </p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleSessionClick(session.id)}
                  className={`group p-4 rounded-xl cursor-pointer transition-all duration-200 border backdrop-blur-sm ${
                    currentSessionId === session.id
                      ? 'bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-700 shadow-md scale-[1.02]'
                      : 'bg-white/60 dark:bg-slate-800/60 border-slate-200/50 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md hover:scale-[1.01]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-xs">
                          <MessageSquareText className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-semibold truncate mb-2 ${
                          currentSessionId === session.id
                            ? 'text-blue-900 dark:text-blue-100'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}>
                          {session.title}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(session.updated_at)}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={(e) => handleDeleteSession(e, session.id)}
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-all duration-200 h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ChatHistory;
