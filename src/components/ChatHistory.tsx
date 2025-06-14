
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessageSquare, Trash2 } from "lucide-react";
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
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat History
          </span>
          <Button
            onClick={handleNewChat}
            size="sm"
            variant="outline"
            disabled={isLoading}
            className="h-8"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 px-3">
        <ScrollArea className="h-full">
          <div className="space-y-2">
            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No chat history yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Start a conversation to see it here
                </p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleSessionClick(session.id)}
                  className={`group p-3 rounded-lg cursor-pointer transition-colors border ${
                    currentSessionId === session.id
                      ? 'bg-blue-50 border-blue-200'
                      : 'hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {session.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(session.updated_at)}
                      </p>
                    </div>
                    <Button
                      onClick={(e) => handleDeleteSession(e, session.id)}
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
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
