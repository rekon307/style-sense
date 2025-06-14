
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Square, Camera, Settings } from "lucide-react";

const Controls = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Controls
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          <Button className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Start Camera
          </Button>
          
          <Button variant="secondary" className="flex items-center gap-2">
            <Square className="h-4 w-4" />
            Stop Camera
          </Button>
          
          <Button variant="outline" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Capture Photo
          </Button>
          
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
        
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Instructions:</strong> Click "Start Camera" to begin, then "Capture Photo" to get AI style advice.
            Camera functionality will be implemented in the next phase.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Controls;
