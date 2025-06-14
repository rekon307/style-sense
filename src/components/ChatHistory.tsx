
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessageSquare, Trash2, Clock } from "lucide-react";
import { useChatHistory } from "@/hooks/useChatHistory";

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
    const newSessionId = await createNewSession();
    if (newSessionId) {
      onSessionChange(newSessionId);
    }
  };

  const handleSessionClick = async (sessionId: string) => {
    switchToSession(sessionId);
    onSessionChange(sessionId);
  };

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    await deleteSession(sessionId);
    if (currentSessionId === sessionId) {
      onSessionChange(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
      <CardHeader className="pb-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50">
        <CardTitle className="flex items-center justify-between text-slate-800 dark:text-slate-200">
          <span className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="font-semibold">Chat History</span>
          </span>
          <Button
            onClick={handleNewChat}
            size="sm"
            disabled={isLoading}
            className="h-9 px-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4 mr-1" />
            New Chat
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full px-4">
          <div className="space-y-3 py-4">
            {sessions.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-slate-400" />
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
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700 shadow-md scale-[1.02]'
                      : 'bg-white/60 dark:bg-slate-800/60 border-slate-200/50 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md hover:scale-[1.01]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
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
