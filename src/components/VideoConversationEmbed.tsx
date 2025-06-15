
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, PhoneOff, Loader2, RotateCcw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface VideoConversationEmbedProps {
  conversationUrl: string | null;
  onClose: () => void;
}

const VideoConversationEmbed = ({ conversationUrl, onClose }: VideoConversationEmbedProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (conversationUrl) {
      setIsLoading(false);
    }
  }, [conversationUrl]);

  const handleEndCall = () => {
    toast({
      title: "Video conversation ended",
      description: "Thanks for chatting with Alex!",
    });
    onClose();
  };

  const handleReload = () => {
    setHasError(false);
    setIsLoading(true);
    // Force iframe reload
    const iframe = document.getElementById('video-iframe') as HTMLIFrameElement;
    if (iframe && conversationUrl) {
      iframe.src = conversationUrl;
    }
  };

  if (!conversationUrl) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold mb-2">Starting Video Chat...</h3>
            <p className="text-muted-foreground">
              Setting up your conversation with Alex
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Video Controls Header */}
      <div className="border-b border-gray-100 dark:border-gray-800 p-3 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Video Chat with Alex</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReload}
              className="h-8 px-3 text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reload
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEndCall}
              className="h-8 px-3 text-xs border-red-200 text-red-600 hover:bg-red-50"
            >
              <PhoneOff className="h-3 w-3 mr-1" />
              End Call
            </Button>
          </div>
        </div>
      </div>

      {/* Video Frame */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
            <div className="text-center">
              <Loader2 className="h-8 w-8 text-blue-500 mx-auto mb-3 animate-spin" />
              <p className="text-sm text-muted-foreground">Loading video chat...</p>
            </div>
          </div>
        )}
        
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
            <div className="text-center">
              <Video className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-3">Failed to load video chat</p>
              <Button onClick={handleReload} size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        )}

        <iframe
          id="video-iframe"
          src={conversationUrl}
          className="w-full h-full border-0"
          allow="camera; microphone; fullscreen"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      </div>
    </div>
  );
};

export default VideoConversationEmbed;
