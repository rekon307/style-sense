
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, AlertCircle } from "lucide-react";
import { useEffect, useState, RefObject } from "react";

interface WebcamDisplayProps {
  videoRef: RefObject<HTMLVideoElement>;
}

const WebcamDisplay = ({ videoRef }: WebcamDisplayProps) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let currentStream: MediaStream | null = null;

    const startWebcam = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: false
        });
        
        currentStream = mediaStream;
        setStream(mediaStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          // Ensure the video plays
          videoRef.current.play().catch(console.error);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error accessing webcam:', err);
        setIsLoading(false);
        
        if (err instanceof Error) {
          if (err.name === 'NotAllowedError') {
            setError('Camera access is required to get styling advice. Please allow camera access and refresh the page.');
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

    startWebcam();

    // Cleanup function to stop the webcam stream
    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [videoRef]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center text-gray-400">
          <Camera className="h-16 w-16 mx-auto mb-4 opacity-50 animate-pulse" />
          <p className="text-lg font-medium">Starting camera...</p>
          <p className="text-sm mt-2">Please allow camera access when prompted</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-gray-400">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-400" />
          <p className="text-lg font-medium text-red-400">Camera Error</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      );
    }

    return (
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover rounded-lg"
      />
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Webcam View
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-700 overflow-hidden">
          {renderContent()}
        </div>
      </CardContent>
    </Card>
  );
};

export default WebcamDisplay;
