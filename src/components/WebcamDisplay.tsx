
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera } from "lucide-react";

const WebcamDisplay = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Webcam View
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-700">
          <div className="text-center text-gray-400">
            <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Webcam feed will appear here</p>
            <p className="text-sm mt-2">Camera access not yet implemented</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebcamDisplay;
