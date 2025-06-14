import { Camera, AlertCircle, Play, Square, Video } from "lucide-react";
import { useEffect, useState, RefObject, useRef, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";

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
      console.log('=== CAPTURE PHOTO ATTEMPT ===');
      console.log('Video ref current:', !!videoRef.current);
      console.log('Is active:', isActive);
      console.log('Canvas ref current:', !!canvasRef.current);
      
      if (!videoRef.current) {
        console.error('Video element not available');
        return null;
      }

      if (!isActive) {
        console.error('Camera not active');
        return null;
      }

      if (!canvasRef.current) {
        console.error('Canvas element not available');
        return null;
      }

      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (!context) {
          console.error('Canvas context not available');
          return null;
        }

        if (video.videoWidth === 0 || video.videoHeight === 0) {
          console.error('Video dimensions not available:', { width: video.videoWidth, height: video.videoHeight });
          return null;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        console.log('Canvas dimensions set to:', canvas.width, 'x', canvas.height);
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataURL = canvas.toDataURL('image/jpeg', 0.8);
        console.log('Photo captured successfully, size:', dataURL.length);
        console.log('=== CAPTURE PHOTO SUCCESS ===');
        return dataURL;
      } catch (error) {
        console.error('Error capturing photo:', error);
        console.log('=== CAPTURE PHOTO FAILED ===');
        return null;
      }
    }
  }));

  const startWebcam = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Starting webcam...');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });
      
      console.log('Media stream obtained');
      setStream(mediaStream);
      streamRef.current = mediaStream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Prevent popup behavior - critical settings
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('webkit-playsinline', 'true');
        videoRef.current.setAttribute('controls', 'false');
        videoRef.current.muted = true;
        videoRef.current.autoplay = true;
        videoRef.current.style.objectFit = 'cover';
        
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              console.log('Video metadata loaded, dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
              resolve(true);
            };
          }
        });
        
        await videoRef.current.play();
        console.log('Video playing');
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

  const handleToggleWebcam = () => {
    if (isActive) {
      stopWebcam();
    } else {
      startWebcam();
    }
  };

  // Improved visibility handling - prevent popup behavior
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && videoRef.current) {
        // Pause video when tab is hidden but keep stream active
        videoRef.current.pause();
        console.log('Tab hidden - video paused');
      } else if (!document.hidden && videoRef.current && streamRef.current) {
        // Resume video when tab becomes visible
        videoRef.current.play().catch(console.error);
        console.log('Tab visible - video resumed');
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
    startWebcam();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const renderOverlay = () => {
    if (isLoading) {
      return (
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center text-center text-white rounded-xl">
          <div className="max-w-sm">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Camera className="h-8 w-8 text-white animate-pulse" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Starting camera...</h3>
            <p className="text-sm text-slate-300">Please allow camera access when prompted</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center text-center text-white rounded-xl">
          <div className="max-w-md px-6">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-red-400 mb-4">Camera Error</h3>
            <p className="text-sm text-slate-300">{error}</p>
          </div>
        </div>
      );
    }

    if (!isActive) {
      return (
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center text-center text-white rounded-xl">
          <div className="max-w-sm">
            <div className="w-16 h-16 bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Video className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Camera Stopped</h3>
            <p className="text-sm text-slate-300">Click "Start Camera" to begin</p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
            <Camera className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Webcam View</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Live camera feed</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <Button
            onClick={handleToggleWebcam}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="flex items-center gap-2 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {isActive ? (
              <>
                <Square className="h-4 w-4" />
                Stop
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Start
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Video Container */}
      <div className="flex-1 p-6">
        <div className="h-full bg-slate-900 rounded-xl flex items-center justify-center overflow-hidden relative">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            webkit-playsinline="true"
            controls={false}
            controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
            disablePictureInPicture
            disableRemotePlayback
            preload="none"
            className="w-full h-full object-cover rounded-xl [&::-webkit-media-controls]:hidden [&::-webkit-media-controls-panel]:hidden [&::-webkit-media-controls-play-button]:hidden [&::-webkit-media-controls-start-playback-button]:hidden"
            style={{ 
              transform: 'scaleX(-1)',
              maxWidth: '100%',
              maxHeight: '100%'
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
