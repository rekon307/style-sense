
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, PhoneOff, Loader2, RotateCcw, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface VideoConversationEmbedProps {
  conversationUrl: string | null;
  onClose: () => void;
}

const VideoConversationEmbed = ({ conversationUrl, onClose }: VideoConversationEmbedProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    console.log('=== VIDEO EMBED STATE CHANGE ===');
    console.log('Conversation URL:', conversationUrl);
    console.log('Is loading:', isLoading);
    
    if (conversationUrl) {
      setIsLoading(false);
      setHasError(false);
      setTimeoutReached(false);
    } else {
      // Set a timeout to show error if URL doesn't come within 30 seconds
      const timeout = setTimeout(() => {
        console.log('❌ Video conversation timeout reached');
        setTimeoutReached(true);
        setIsLoading(false);
      }, 30000);

      return () => clearTimeout(timeout);
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

  const handleRetry = () => {
    console.log('🔄 Retrying video conversation...');
    setTimeoutReached(false);
    setHasError(false);
    setIsLoading(true);
    onClose(); // This will trigger a new conversation attempt
  };

  if (!conversationUrl && timeoutReached) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Video Chat Failed</h3>
            <p className="text-muted-foreground mb-4">
              Unable to start video conversation. This might be due to:
            </p>
            <ul className="text-sm text-muted-foreground mb-4 text-left">
              <li>• Network connectivity issues</li>
              <li>• Tavus API service unavailable</li>
              <li>• Missing or invalid API configuration</li>
            </ul>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleRetry} className="bg-blue-500 hover:bg-blue-600">
                <RotateCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" onClick={onClose}>
                Back to Chat
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!conversationUrl) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold mb-2">Starting Video Chat...</h3>
            <p className="text-muted-foreground mb-4">
              Setting up your conversation with Alex
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={onClose} size="sm">
                Cancel
              </Button>
            </div>
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
          onLoad={() => {
            console.log('✅ Video iframe loaded successfully');
            setIsLoading(false);
          }}
          onError={() => {
            console.error('❌ Video iframe failed to load');
            setIsLoading(false);
            setHasError(true);
          }}
        />
      </div>
    </div>
  );
};

export default VideoConversationEmbed;
