
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, VideoOff, Phone, PhoneOff, Loader2 } from 'lucide-react';
import { useTavus } from '@/hooks/useTavus';
import { toast } from '@/components/ui/use-toast';

interface VideoConversationProps {
  onClose?: () => void;
}

const VideoConversation = ({ onClose }: VideoConversationProps) => {
  const {
    createConversation,
    getConversationStatus,
    isCreatingConversation,
    currentConversation,
    setCurrentConversation
  } = useTavus();

  const [conversationStatus, setConversationStatus] = useState<string>('idle');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const handleStartConversation = async () => {
    try {
      const conversation = await createConversation(
        "Style Sense Video Chat",
        "You are Alex, a sophisticated AI style advisor with advanced visual analysis capabilities. Provide personalized fashion advice, analyze outfits, and help users develop their personal style. Be friendly, knowledgeable, and visually perceptive. Help users understand colors, patterns, and styling techniques."
      );
      
      if (conversation) {
        setConversationStatus('active');
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
      description: "Thanks for chatting with Alex!",
    });
    onClose?.();
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

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Video className="h-6 w-6 text-blue-500" />
          Video Style Consultation with Alex
        </CardTitle>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Badge variant="outline" className={`${getStatusColor(conversationStatus)} text-white`}>
            {conversationStatus.charAt(0).toUpperCase() + conversationStatus.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!currentConversation ? (
          <div className="text-center space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 rounded-lg">
              <Video className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Start Your Video Style Session</h3>
              <p className="text-muted-foreground mb-4">
                Connect with Alex for a personalized video consultation about your style, fashion choices, and outfit analysis.
              </p>
              <Button 
                onClick={handleStartConversation}
                disabled={isCreatingConversation}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {isCreatingConversation ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Setting up video...
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
            <div className="bg-black rounded-lg aspect-video flex items-center justify-center relative">
              {currentConversation.conversation_url ? (
                <iframe
                  src={currentConversation.conversation_url}
                  className="w-full h-full rounded-lg"
                  allow="camera; microphone"
                  title="Tavus Video Conversation"
                />
              ) : (
                <div className="text-center text-white">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
                  <p>Connecting to Alex...</p>
                </div>
              )}
              
              {/* Video Controls Overlay */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                  className="bg-black/50 hover:bg-black/70 text-white"
                >
                  {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleEndConversation}
                  className="bg-red-500/80 hover:bg-red-600"
                >
                  <PhoneOff className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                You're now connected with Alex for your personalized style consultation!
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoConversation;
