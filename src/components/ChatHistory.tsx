
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Trash2, Clock, MessageSquareText, Image, Video } from "lucide-react";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useVideoHistory } from "@/hooks/useVideoHistory";
import { toast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ChatHistoryProps {
  onSessionChange: (sessionId: string | null) => void;
}

interface SessionPreview {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messageCount: number;
  hasImages: boolean;
  hasVideo: boolean;
  lastMessage: string;
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

  const { videoConversations, loadVideoConversations } = useVideoHistory();

  const [sessionPreviews, setSessionPreviews] = useState<SessionPreview[]>([]);

  useEffect(() => {
    loadVideoConversations();
  }, []);

  useEffect(() => {
    const loadSessionPreviews = async () => {
      if (sessions.length === 0) return;

      const previews = await Promise.all(
        sessions.map(async (session) => {
          try {
            const { data: messages } = await supabase
              .from('chat_messages')
              .select('content, visual_context')
              .eq('session_id', session.id)
              .order('created_at', { ascending: false })
              .limit(1);

            const { count } = await supabase
              .from('chat_messages')
              .select('*', { count: 'exact', head: true })
              .eq('session_id', session.id);

            const { data: imagesData } = await supabase
              .from('chat_messages')
              .select('id')
              .eq('session_id', session.id)
              .not('visual_context', 'is', null)
              .limit(1);

            // Check for video conversations in this session
            const sessionVideoConversations = videoConversations.filter(
              vc => vc.session_id === session.id
            );

            return {
              ...session,
              messageCount: count || 0,
              hasImages: (imagesData?.length || 0) > 0,
              hasVideo: sessionVideoConversations.length > 0,
              lastMessage: messages?.[0]?.content?.substring(0, 60) + (messages?.[0]?.content?.length > 60 ? '...' : '') || 'No messages yet'
            };
          } catch (error) {
            console.error('Error loading session preview:', error);
            return {
              ...session,
              messageCount: 0,
              hasImages: false,
              hasVideo: false,
              lastMessage: 'Error loading preview'
            };
          }
        })
      );

      setSessionPreviews(previews);
    };

    loadSessionPreviews();
  }, [sessions, videoConversations]);

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
    <Card className="h-full flex flex-col bg-background dark:bg-card border-border">
      <CardHeader className="pb-4 border-b border-border">
        <CardTitle className="flex items-center justify-between text-foreground">
          <div className="flex items-center gap-2">
            <MessageSquareText className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            <span className="font-semibold">Chats</span>
          </div>
        </CardTitle>
        <Button
          onClick={handleNewChat}
          size="sm"
          disabled={isLoading}
          className="w-full mt-3 bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full px-4">
          <div className="space-y-2 py-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading chats...</p>
              </div>
            ) : sessionPreviews.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquareText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-foreground font-medium mb-2">No conversations yet</p>
                <p className="text-sm text-muted-foreground">
                  Start a new chat to see your conversation history
                </p>
              </div>
            ) : (
              sessionPreviews.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleSessionClick(session.id)}
                  className={`group p-3 rounded-lg cursor-pointer transition-all border ${
                    currentSessionId === session.id
                      ? 'bg-blue-600/20 border-blue-500/50'
                      : 'bg-card border-border hover:bg-accent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarFallback className="bg-blue-500 text-white text-xs">
                          <MessageSquareText className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`text-sm font-medium truncate ${
                            currentSessionId === session.id
                              ? 'text-blue-300'
                              : 'text-foreground'
                          }`}>
                            {session.title}
                          </h4>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {session.hasImages && (
                              <Image className="h-3 w-3 text-muted-foreground" />
                            )}
                            {session.hasVideo && (
                              <Video className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mb-1">
                          {session.lastMessage}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(session.updated_at)}</span>
                          </div>
                          <span>{session.messageCount} messages</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={(e) => handleDeleteSession(e, session.id)}
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-red-500/20 hover:text-red-400 text-muted-foreground"
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
