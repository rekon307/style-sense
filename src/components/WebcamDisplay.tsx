
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, AlertCircle, Play, Square } from "lucide-react";
import { useEffect, useState, RefObject, useRef } from "react";

interface WebcamDisplayProps {
  videoRef: RefObject<HTMLVideoElement>;
}

const WebcamDisplay = ({ videoRef }: WebcamDisplayProps) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const startWebcam = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false
      });
      
      setStream(mediaStream);
      streamRef.current = mediaStream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(console.error);
      }
      
      setIsActive(true);
      setIsLoading(false);
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
  };

  useEffect(() => {
    // Auto-start webcam on component mount
    startWebcam();

    // Cleanup function to stop the webcam stream using streamRef
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
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center text-center text-gray-400 rounded-lg">
          <div>
            <Camera className="h-16 w-16 mx-auto mb-4 opacity-50 animate-pulse" />
            <p className="text-lg font-medium">Starting camera...</p>
            <p className="text-sm mt-2">Please allow camera access when prompted</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center text-center text-gray-400 rounded-lg">
          <div>
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-400" />
            <p className="text-lg font-medium text-red-400">Camera Error</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
        </div>
      );
    }

    if (!isActive) {
      return (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center text-center text-gray-400 rounded-lg">
          <div>
            <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Camera Stopped</p>
            <p className="text-sm mt-2">Click "Start Camera" to begin</p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Webcam View
          </div>
          <Button
            onClick={handleToggleWebcam}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="flex items-center gap-2"
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
      <CardContent>
        <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-700 overflow-hidden relative">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover rounded-lg ${!isActive ? 'hidden' : ''}`}
          />
          {renderOverlay()}
        </div>
      </CardContent>
    </Card>
  );
};

export default WebcamDisplay;
