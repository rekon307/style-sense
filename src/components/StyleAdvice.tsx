
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, MessageSquare } from "lucide-react";

const StyleAdvice = () => {
  return (
    <Card className="w-full h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Style Advice
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 font-medium">No style advice yet</p>
          <p className="text-sm text-gray-400 mt-2">
            Capture a photo to receive personalized AI-powered style recommendations
          </p>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Coming Soon:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Color palette analysis</li>
            <li>• Outfit recommendations</li>
            <li>• Style trend insights</li>
            <li>• Personal styling tips</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default StyleAdvice;
