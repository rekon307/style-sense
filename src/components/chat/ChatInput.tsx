import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, MicOff } from "lucide-react";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";

interface ChatInputProps {
  isAnalyzing: boolean;
  onSendMessage: (message: string, capturedPhoto?: string | null) => void;
}

const ChatInput = ({ isAnalyzing, onSendMessage }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const {
    isRecording,
    transcript,
    startRecording,
    stopRecording,
    isSupported
  } = useVoiceRecording();

  const capturePhotoFromWebcam = (): string | null => {
    try {
      // Find the video element from the webcam
      const videoElement = document.querySelector('video') as HTMLVideoElement;
      
      if (!videoElement || videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
        console.log('Video element not available or not ready');
        return null;
      }

      // Create a canvas to capture the frame
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        console.log('Canvas context not available');
        return null;
      }

      // Set canvas dimensions to match video
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      // Draw the current video frame to canvas
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      // Convert to data URL
      const dataURL = canvas.toDataURL('image/jpeg', 0.8);
      console.log('Photo captured from webcam for Alex analysis');
      return dataURL;
    } catch (error) {
      console.error('Error capturing photo from webcam:', error);
      return null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const messageToSend = message.trim() || transcript.trim();
    if (!messageToSend) return;

    // Capture photo from webcam before sending message
    const capturedPhoto = capturePhotoFromWebcam();
    
    // Send message with captured photo
    onSendMessage(messageToSend, capturedPhoto);
    
    // Reset form
    setMessage("");
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Use transcript if available, otherwise use typed message
  const currentMessage = transcript.trim() || message;

  return (
    <div className="border-t border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="flex gap-3 p-4">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={currentMessage}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            placeholder={isRecording ? "Listening..." : "Ask Alex about your style..."}
            disabled={isAnalyzing || isRecording}
            className="min-h-[44px] max-h-[120px] resize-none pr-12 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
            style={{ height: 'auto' }}
          />
          
          {isSupported && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleRecording}
              disabled={isAnalyzing}
              className={`absolute right-2 top-2 h-7 w-7 p-0 ${
                isRecording 
                  ? 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' 
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {isRecording ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        
        <Button 
          type="submit" 
          disabled={isAnalyzing || (!currentMessage.trim())}
          className="h-11 px-4 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isAnalyzing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span className="text-sm">Analyzing...</span>
            </div>
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
};

export default ChatInput;
