
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, AlertCircle, Play, Square } from "lucide-react";
import { useEffect, useState, RefObject, useRef, forwardRef, useImperativeHandle } from "react";

interface WebcamDisplayProps {
  videoRef: RefObject<HTMLVideoElement>;
}

export interface WebcamDisplayRef {
  capturePhoto: () => string | null;
}

const WebcamDisplay = forwardRef<WebcamDisplayRef, WebcamDisplayProps>(({ videoRef }, ref) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useImperativeHandle(ref, () => ({
    capturePhoto: () => {
      console.log('Attempting to capture photo...');
      console.log('Video ref current:', !!videoRef.current);
      console.log('Is active:', isActive);
      
      if (videoRef.current && isActive) {
        try {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          if (!canvas) {
            console.error('Canvas not available');
            return null;
          }
          
          const context = canvas.getContext('2d');
          if (!context) {
            console.error('Canvas context not available');
            return null;
          }

          // Set canvas size to match video dimensions
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
          
          // Draw the video frame to canvas
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Convert to data URL
          const dataURL = canvas.toDataURL('image/jpeg', 0.8);
          console.log('Photo captured successfully, size:', dataURL.length);
          return dataURL;
        } catch (error) {
          console.error('Error capturing photo:', error);
          return null;
        }
      } else {
        console.warn('Cannot capture photo - video not available or not active');
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
        await videoRef.current.play();
      }
      
      setIsActive(true);
      setIsLoading(false);
      console.log('Webcam started successfully');
    } catch (err) {
      console.error('Error accessing webcam:', err);
      setIsLoading(false);
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Camera access is required to get styling advice. Please allow camera access and try again.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found. Please connect a camera and try again.');
        } else {
          setError('Failed to access camera. Please check your browser settings.');
        }
      } else {
        setError('An unexpected error occurred while accessing the camera.');
      }
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
    setIsActive(false);
    setError(null);
    console.log('Webcam stopped');
  };

  useEffect(() => {
    startWebcam();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const handleToggleWebcam = () => {
    if (isActive) {
      stopWebcam();
    } else {
      startWebcam();
    }
  };

  const renderOverlay = () => {
    if (isLoading) {
      return (
        <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center text-center text-gray-300 rounded-xl">
          <div>
            <Camera className="h-20 w-20 mx-auto mb-6 opacity-50 animate-pulse" />
            <p className="text-xl font-medium mb-2">Starting camera...</p>
            <p className="text-sm opacity-75">Please allow camera access when prompted</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center text-center text-gray-300 rounded-xl">
          <div className="max-w-md px-6">
            <AlertCircle className="h-20 w-20 mx-auto mb-6 text-red-400" />
            <p className="text-xl font-medium text-red-400 mb-4">Camera Error</p>
            <p className="text-sm opacity-75">{error}</p>
          </div>
        </div>
      );
    }

    if (!isActive) {
      return (
        <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center text-center text-gray-300 rounded-xl">
          <div>
            <Camera className="h-20 w-20 mx-auto mb-6 opacity-50" />
            <p className="text-xl font-medium mb-2">Camera Stopped</p>
            <p className="text-sm opacity-75">Click "Start Camera" to begin</p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-slate-50/80 to-slate-100/80 dark:from-slate-900/80 dark:to-slate-800/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-slate-800 dark:text-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Camera className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="font-semibold">Webcam View</span>
          </div>
          <Button
            onClick={handleToggleWebcam}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 hover:scale-105 shadow-md"
          >
            {isActive ? (
              <>
                <Square className="h-4 w-4" />
                Stop Camera
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Start Camera
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <div className="h-full bg-gray-900 rounded-xl flex items-center justify-center overflow-hidden relative">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover transform -scale-x-100"
          />
          <canvas ref={canvasRef} className="hidden" />
          {renderOverlay()}
        </div>
      </CardContent>
    </Card>
  );
});

WebcamDisplay.displayName = "WebcamDisplay";

export default WebcamDisplay;
