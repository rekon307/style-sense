
import { Camera, AlertCircle, Video, Play, Square } from "lucide-react";
import { useEffect, useState, RefObject, useRef, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WebcamDisplayProps {
  videoRef?: RefObject<HTMLVideoElement>;
}

export interface WebcamDisplayRef {
  capturePhoto: () => string | null;
}

const WebcamDisplay = forwardRef<WebcamDisplayRef, WebcamDisplayProps>(({ videoRef: externalVideoRef }, ref) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  
  const videoRef = externalVideoRef || internalVideoRef;

  useImperativeHandle(ref, () => ({
    capturePhoto: () => {
      if (!videoRef.current || !isActive || !canvasRef.current) {
        return null;
      }

      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (!context || video.videoWidth === 0 || video.videoHeight === 0) {
          return null;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        return canvas.toDataURL('image/jpeg', 0.8);
      } catch (error) {
        console.error('Error capturing photo:', error);
        return null;
      }
    }
  }));

  const startWebcam = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });
      
      setStream(mediaStream);
      streamRef.current = mediaStream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('webkit-playsinline', 'true');
        videoRef.current.muted = true;
        videoRef.current.autoplay = true;
        
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => resolve(true);
          }
        });
        
        await videoRef.current.play();
      }
      
      setIsActive(true);
      setIsLoading(false);
    } catch (err) {
      console.error('Error accessing webcam:', err);
      setIsLoading(false);
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Camera access is required. Please allow access and try again.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found. Please connect a camera and try again.');
        } else {
          setError('Error accessing camera. Check your browser settings.');
        }
      }
    }
  };

  const stopWebcam = () => {
    console.log('=== STOPPING WEBCAM ===');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind);
        track.stop();
      });
      streamRef.current = null;
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
    setIsActive(false);
    setError(null);
  };

  const handleToggleWebcam = () => {
    if (isActive) {
      stopWebcam();
    } else {
      startWebcam();
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && videoRef.current) {
        videoRef.current.pause();
      } else if (!document.hidden && videoRef.current && streamRef.current) {
        videoRef.current.play().catch(console.error);
      }
    };

    const handleBeforeUnload = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    console.log('=== WEBCAM COMPONENT MOUNTED ===');
    startWebcam();
    
    return () => {
      console.log('=== WEBCAM COMPONENT UNMOUNTING ===');
      if (streamRef.current) {
        console.log('Cleaning up webcam stream on unmount');
        streamRef.current.getTracks().forEach(track => {
          console.log('Stopping track on unmount:', track.kind);
          track.stop();
        });
        streamRef.current = null;
      }
    };
  }, []);

  return (
    <div className="h-full">
      <Card className="h-full">
        <CardContent className="p-0 h-full flex flex-col">
          {/* Controls Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <Badge variant={isActive ? "default" : "secondary"} className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                {isActive ? 'Live' : 'Offline'}
              </Badge>
              <span className="text-sm font-medium">Camera Feed</span>
            </div>
            
            <Button
              onClick={handleToggleWebcam}
              variant={isActive ? "destructive" : "default"}
              size="sm"
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : isActive ? (
                <Square className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isLoading ? "Starting..." : isActive ? "Stop" : "Start"}
            </Button>
          </div>
          
          {/* Video Container */}
          <div className="flex-1 relative bg-muted/30">
            {error && (
              <div className="absolute top-4 left-4 right-4 z-10">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}
            
            <div className="absolute inset-4">
              <Card className="h-full overflow-hidden">
                <CardContent className="p-0 h-full relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    style={{ 
                      transform: 'scaleX(-1)',
                      aspectRatio: '16/9'
                    }}
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {/* Loading Overlay */}
                  {isLoading && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                          <Camera className="h-6 w-6 text-primary animate-pulse" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Starting Camera</h3>
                          <p className="text-sm text-muted-foreground">Please allow camera access</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Inactive Overlay */}
                  {!isActive && !isLoading && !error && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                          <Video className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Camera Offline</h3>
                          <p className="text-sm text-muted-foreground">Click "Start" to begin</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

WebcamDisplay.displayName = "WebcamDisplay";

export default WebcamDisplay;
