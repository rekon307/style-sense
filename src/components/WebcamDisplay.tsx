
import { Camera, AlertCircle, Video } from "lucide-react";
import { useEffect, useState, RefObject, useRef, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";

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

  const renderOverlay = () => {
    if (isLoading) {
      return (
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center text-center text-white rounded-2xl">
          <div className="max-w-sm">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Camera className="h-6 w-6 text-white animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Starting camera...</h3>
            <p className="text-sm text-slate-300">Please allow camera access</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center text-center text-white rounded-2xl">
          <div className="max-w-md px-4">
            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-red-400 mb-3">Camera Error</h3>
            <p className="text-sm text-slate-300">{error}</p>
          </div>
        </div>
      );
    }

    if (!isActive) {
      return (
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center text-center text-white rounded-2xl">
          <div className="max-w-sm">
            <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Video className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Camera off</h3>
            <p className="text-sm text-slate-300">Press "Start" to begin</p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Cleaner Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Camera className="h-3 w-3 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Webcam View</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Live camera feed</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <Button
            onClick={handleToggleWebcam}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="h-8 px-3 text-xs font-medium"
          >
            {isActive ? "Stop" : "Start"}
          </Button>
        </div>
      </div>
      
      {/* Improved Video Container */}
      <div className="flex-1 p-3">
        <div className="h-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl overflow-hidden relative shadow-inner">
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
          {renderOverlay()}
        </div>
      </div>
    </div>
  );
});

WebcamDisplay.displayName = "WebcamDisplay";

export default WebcamDisplay;
