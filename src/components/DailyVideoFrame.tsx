
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Video, PhoneOff, Loader2, RotateCcw, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// @ts-ignore - Daily types might not be available
declare global {
  interface Window {
    DailyIframe: any;
  }
}

interface DailyVideoFrameProps {
  conversationUrl: string | null;
  onClose: () => void;
  onRetry?: () => void;
  isLoading?: boolean;
}

const DailyVideoFrame = ({ conversationUrl, onClose, onRetry, isLoading = false }: DailyVideoFrameProps) => {
  const [isFrameLoading, setIsFrameLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [callFrame, setCallFrame] = useState<any>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log('=== DAILY VIDEO FRAME SETUP ===');
    console.log('Conversation URL:', conversationUrl);
    console.log('Is Loading:', isLoading);
    console.log('URL valid:', conversationUrl && conversationUrl.startsWith('https://'));

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (conversationUrl && containerRef.current && !isLoading) {
      console.log('✅ URL available and not loading, initializing Daily frame');
      setTimeoutReached(false);
      setHasError(false);
      setIsFrameLoading(true);
      initializeDailyFrame();
    } else if (!conversationUrl && !isLoading) {
      console.log('⏳ No URL and not loading - showing timeout');
      setIsFrameLoading(false);
      
      // Set a timeout to show error if URL doesn't come within 30 seconds
      timeoutRef.current = setTimeout(() => {
        console.log('❌ Video conversation timeout reached');
        setTimeoutReached(true);
      }, 30000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      if (callFrame) {
        console.log('🧹 Cleaning up Daily call frame');
        try {
          callFrame.leave();
          callFrame.destroy();
        } catch (error) {
          console.error('Error cleaning up call frame:', error);
        }
      }
    };
  }, [conversationUrl, isLoading]);

  const loadDailyScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.DailyIframe) {
        setIsScriptLoaded(true);
        resolve();
        return;
      }

      if (isScriptLoaded) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@daily-co/daily-js';
      script.onload = () => {
        console.log('✅ Daily.co script loaded successfully');
        setIsScriptLoaded(true);
        resolve();
      };
      script.onerror = () => {
        console.error('❌ Failed to load Daily.co script');
        reject(new Error('Failed to load Daily.co script'));
      };
      document.head.appendChild(script);
    });
  };

  const initializeDailyFrame = async () => {
    try {
      // Validate URL format
      if (!conversationUrl || !conversationUrl.startsWith('https://')) {
        throw new Error('Invalid conversation URL format');
      }

      console.log('🔗 Validating conversation URL:', conversationUrl);

      // Load Daily.co script
      console.log('📥 Loading Daily.co script...');
      await loadDailyScript();

      // Wait a moment for script to initialize
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!window.DailyIframe) {
        throw new Error('Daily.co script failed to initialize');
      }

      console.log('🎥 Initializing Daily call frame with URL:', conversationUrl);
      
      const frame = window.DailyIframe.createFrame(containerRef.current, {
        iframeStyle: {
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '8px'
        },
        showLeaveButton: true,
        showFullscreenButton: true,
        activeSpeakerMode: true,
        showParticipantsBar: false
      });

      setCallFrame(frame);

      // Set up event listeners
      frame.on('loaded', () => {
        console.log('✅ Daily frame loaded successfully');
        setIsFrameLoading(false);
        setHasError(false);
        setTimeoutReached(false);
      });

      frame.on('error', (event: any) => {
        console.error('❌ Daily frame error:', event);
        setIsFrameLoading(false);
        setHasError(true);
        toast({
          title: "Video error",
          description: "Failed to load video chat. Please try again.",
          variant: "destructive",
        });
      });

      frame.on('left-meeting', () => {
        console.log('👋 User left the meeting');
        handleEndCall();
      });

      frame.on('participant-joined', (event: any) => {
        console.log('👤 Participant joined:', event.participant);
        if (event.participant && !event.participant.local) {
          toast({
            title: "Alex joined",
            description: "Your style advisor is now in the video chat!",
          });
        }
      });

      frame.on('participant-left', (event: any) => {
        console.log('👤 Participant left:', event.participant);
      });

      // Join the conversation
      console.log('🚀 Joining conversation with URL:', conversationUrl);
      await frame.join({ 
        url: conversationUrl,
        userName: 'You',
        userData: { isStyleUser: true }
      });

      console.log('✅ Successfully joined Daily conversation');
      
    } catch (error) {
      console.error('❌ Failed to initialize Daily frame:', error);
      setIsFrameLoading(false);
      setHasError(true);
      toast({
        title: "Connection failed",
        description: `Unable to connect to video chat: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleEndCall = () => {
    if (callFrame) {
      try {
        callFrame.leave();
        callFrame.destroy();
        setCallFrame(null);
      } catch (error) {
        console.error('Error ending call:', error);
      }
    }
    toast({
      title: "Video conversation ended",
      description: "Thanks for chatting with Alex!",
    });
    onClose();
  };

  const handleRetry = () => {
    console.log('🔄 Retrying video conversation...');
    setTimeoutReached(false);
    setHasError(false);
    setIsFrameLoading(true);
    
    if (onRetry) {
      onRetry();
    } else if (conversationUrl) {
      initializeDailyFrame();
    } else {
      onClose();
    }
  };

  // Show loading state while creating conversation
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold mb-2">Creating Video Chat...</h3>
            <p className="text-muted-foreground mb-4">
              Setting up your conversation with Alex
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
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

  // Show timeout error
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
              <li>• Tavus API service temporarily unavailable</li>
              <li>• Maximum conversation limit reached</li>
              <li>• Authentication issues</li>
            </ul>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleRetry} className="bg-blue-500 hover:bg-blue-600">
                <RotateCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" onClick={onClose}>
                Switch to Text Chat
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show waiting for URL
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
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '30%' }}></div>
            </div>
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
      <div className="border-b border-gray-100 dark:border-gray-800 p-4 bg-white dark:bg-gray-900 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Video className="h-5 w-5 text-blue-500" />
            <div>
              <span className="text-sm font-medium">Video Chat with Alex</span>
              <div className="text-xs text-muted-foreground">AI Style Advisor</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="h-9 px-3 text-xs"
              disabled={isFrameLoading}
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reload
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEndCall}
              className="h-9 px-3 text-xs border-red-200 text-red-600 hover:bg-red-50"
            >
              <PhoneOff className="h-3 w-3 mr-1" />
              End Call
            </Button>
          </div>
        </div>
      </div>

      {/* Video Frame Container */}
      <div className="flex-1 relative">
        {isFrameLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800 z-10">
            <div className="text-center">
              <Loader2 className="h-8 w-8 text-blue-500 mx-auto mb-3 animate-spin" />
              <p className="text-sm text-muted-foreground">Loading video chat...</p>
              <p className="text-xs text-muted-foreground mt-1">URL: {conversationUrl?.substring(0, 50)}...</p>
            </div>
          </div>
        )}
        
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800 z-10">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-3">Failed to load video chat</p>
              <Button onClick={handleRetry} size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        )}

        <div 
          ref={containerRef} 
          className="w-full h-full"
          style={{ minHeight: '400px' }}
        />
      </div>
    </div>
  );
};

export default DailyVideoFrame;
