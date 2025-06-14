
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, RotateCcw, Sparkles } from "lucide-react";
import { RefObject } from "react";
import { toast } from "sonner";

interface ControlsProps {
  videoRef: RefObject<HTMLVideoElement>;
  capturedImage: string | null;
  setCapturedImage: (image: string | null) => void;
}

const Controls = ({ videoRef, capturedImage, setCapturedImage }: ControlsProps) => {
  const capturePhoto = () => {
    if (!videoRef.current) {
      toast.error("Camera not ready. Please wait for the camera to start.");
      return;
    }

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      toast.error("Failed to create canvas context.");
      return;
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to data URL
    const dataURL = canvas.toDataURL('image/png');
    setCapturedImage(dataURL);
    
    toast.success("Photo captured! Ready for style analysis.");
  };

  const tryAgain = () => {
    setCapturedImage(null);
    toast("Ready to capture a new photo!");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Controls
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          {!capturedImage ? (
            <Button 
              onClick={capturePhoto}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Sparkles className="h-4 w-4" />
              Get My Style Advice
            </Button>
          ) : (
            <Button 
              onClick={tryAgain}
              variant="outline" 
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Try Again
            </Button>
          )}
        </div>
        
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Instructions:</strong> {!capturedImage 
              ? "Click 'Get My Style Advice' to capture a photo from your webcam for AI analysis."
              : "Photo captured! Click 'Try Again' to take a new photo or wait for style analysis."
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Controls;
