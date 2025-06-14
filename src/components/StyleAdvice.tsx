
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, MessageSquare, Loader2 } from "lucide-react";

interface StyleAdviceProps {
  styleAdvice: any;
  isAnalyzing: boolean;
}

const StyleAdvice = ({ styleAdvice, isAnalyzing }: StyleAdviceProps) => {
  const renderContent = () => {
    if (isAnalyzing) {
      return (
        <div className="text-center py-12">
          <Loader2 className="h-16 w-16 mx-auto mb-4 text-blue-500 animate-spin" />
          <p className="text-gray-700 font-medium text-lg">Analyzing your style...</p>
          <p className="text-sm text-gray-500 mt-2">
            Our AI is reviewing your photo to provide personalized recommendations
          </p>
        </div>
      );
    }

    if (styleAdvice?.error) {
      return (
        <div className="text-center py-12">
          <MessageSquare className="h-16 w-16 mx-auto mb-4 text-red-300" />
          <p className="text-red-500 font-medium">{styleAdvice.error}</p>
          <p className="text-sm text-gray-400 mt-2">
            Please try capturing a new photo
          </p>
        </div>
      );
    }

    if (styleAdvice) {
      return (
        <div className="space-y-6">
          {/* Analysis Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3">Style Analysis</h4>
            <p className="text-blue-800 text-sm leading-relaxed">{styleAdvice.analysis}</p>
          </div>

          {/* Suggestions Section */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-900 mb-3">Style Suggestions</h4>
            <ul className="space-y-2">
              {styleAdvice.suggestions?.map((suggestion: string, index: number) => (
                <li key={index} className="text-green-800 text-sm flex items-start">
                  <span className="text-green-600 mr-2 mt-1">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Hairstyle Section */}
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-3">Hairstyle Recommendation</h4>
            <p className="text-purple-800 text-sm leading-relaxed">{styleAdvice.hairstyle}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center py-12">
        <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500 font-medium">No style advice yet</p>
        <p className="text-sm text-gray-400 mt-2">
          Capture a photo to receive personalized AI-powered style recommendations
        </p>
      </div>
    );
  };

  return (
    <Card className="w-full h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Style Advice
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default StyleAdvice;
