
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, VideoOff, Phone, PhoneOff, Loader2, ExternalLink, History } from 'lucide-react';
import { useTavus } from '@/hooks/useTavus';
import { toast } from '@/components/ui/use-toast';

interface VideoConversationProps {
  onClose?: () => void;
  currentSessionId?: string | null;
}

const VideoConversation = ({ onClose, currentSessionId }: VideoConversationProps) => {
  const {
    createConversation,
    getConversationStatus,
    loadVideoConversations,
    isCreatingConversation,
    currentConversation,
    setCurrentConversation
  } = useTavus();

  const [conversationStatus, setConversationStatus] = useState<string>('idle');
  const [videoHistory, setVideoHistory] = useState<any[]>([]);

  useEffect(() => {
    if (currentSessionId) {
      loadVideoHistory();
    }
  }, [currentSessionId]);

  const loadVideoHistory = async () => {
    if (currentSessionId) {
      const conversations = await loadVideoConversations(currentSessionId);
      setVideoHistory(conversations);
    }
  };

  const handleStartConversation = async () => {
    try {
      const conversation = await createConversation(
        "Style Sense Video Chat",
        "You are Andrew, a sophisticated AI style advisor with advanced visual analysis capabilities. Provide personalized fashion advice, analyze outfits, and help users develop their personal style. Be friendly, knowledgeable, and visually perceptive. Help users understand colors, patterns, and styling techniques.",
        "p347dab0cef8",
        currentSessionId || undefined
      );
      
      if (conversation) {
        setConversationStatus('active');
        console.log('Conversation URL:', conversation.conversation_url);
        await loadVideoHistory(); // Refresh history
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  const handleEndConversation = () => {
    setCurrentConversation(null);
    setConversationStatus('idle');
    toast({
      title: "Video conversation ended",
      description: "Thanks for chatting with Andrew!",
    });
    onClose?.();
  };

  const handleOpenInNewTab = () => {
    if (currentConversation?.conversation_url) {
      window.open(currentConversation.conversation_url, '_blank');
    }
  };

  const handleRejoinConversation = (conversation: any) => {
    setCurrentConversation(conversation);
    setConversationStatus(conversation.status);
    window.open(conversation.conversation_url, '_blank');
  };

  const checkConversationStatus = async () => {
    if (currentConversation?.conversation_id) {
      try {
        const status = await getConversationStatus(currentConversation.conversation_id);
        setConversationStatus(status.status || 'unknown');
      } catch (error) {
        console.error('Failed to check conversation status:', error);
      }
    }
  };

  useEffect(() => {
    if (currentConversation?.conversation_id && conversationStatus === 'active') {
      const interval = setInterval(checkConversationStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [currentConversation, conversationStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'waiting': return 'bg-yellow-500';
      case 'ended': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (error) {
      return 'Unknown date';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Video className="h-6 w-6 text-blue-500" />
          Video Style Consultation with Andrew
        </CardTitle>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Badge variant="outline" className={`${getStatusColor(conversationStatus)} text-white`}>
            {conversationStatus.charAt(0).toUpperCase() + conversationStatus.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Video History Section */}
        {videoHistory.length > 0 && (
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <History className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Previous Video Sessions</h4>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {videoHistory.map((conversation) => (
                <div key={conversation.id} className="flex items-center justify-between bg-white dark:bg-slate-700 p-2 rounded text-xs">
                  <div>
                    <p className="font-medium">{conversation.conversation_name}</p>
                    <p className="text-slate-500">{formatDate(conversation.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`${getStatusColor(conversation.status)} text-white text-xs`}>
                      {conversation.status}
                    </Badge>
                    {conversation.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejoinConversation(conversation)}
                        className="text-xs"
                      >
                        Rejoin
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!currentConversation ? (
          <div className="text-center space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 rounded-lg">
              <Video className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Start Your Video Style Session</h3>
              <p className="text-muted-foreground mb-4">
                Connect with Andrew for a personalized video consultation about your style, fashion choices, and outfit analysis.
              </p>
              <Button 
                onClick={handleStartConversation}
                disabled={isCreatingConversation}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {isCreatingConversation ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating conversation...
                  </>
                ) : (
                  <>
                    <Video className="h-4 w-4 mr-2" />
                    Start Video Chat
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 p-6 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Video className="h-8 w-8 text-green-500" />
                <h3 className="text-lg font-semibold">Video Chat Ready!</h3>
              </div>
              
              <p className="text-muted-foreground mb-4">
                Your video conversation with Andrew is ready. Click the button below to join the video call.
              </p>
              
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={handleOpenInNewTab}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Join Video Call
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleEndConversation}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <PhoneOff className="h-4 w-4 mr-2" />
                  End Session
                </Button>
              </div>
              
              {currentConversation.conversation_url && (
                <div className="mt-4 p-3 bg-white dark:bg-slate-800 rounded border text-sm">
                  <p className="text-muted-foreground mb-2">Conversation URL:</p>
                  <code className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded break-all">
                    {currentConversation.conversation_url}
                  </code>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoConversation;
