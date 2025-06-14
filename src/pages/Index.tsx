
import WebcamDisplay from "@/components/WebcamDisplay";
import Controls from "@/components/Controls";
import StyleAdvice from "@/components/StyleAdvice";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-center text-gray-800">
            Webcam AI Stylist
          </h1>
          <p className="text-lg text-center text-gray-600 mt-2">
            Get personalized style advice powered by AI
          </p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Webcam and Controls */}
          <div className="lg:col-span-2 space-y-6">
            <WebcamDisplay />
            <Controls />
          </div>
          
          {/* Right column - Style Advice */}
          <div className="lg:col-span-1">
            <StyleAdvice />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
