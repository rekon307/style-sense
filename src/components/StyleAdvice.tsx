
import ChatHeader from "./chat/ChatHeader";
import ChatMessages from "./chat/ChatMessages";
import ChatInput from "./chat/ChatInput";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface StyleAdviceProps {
  messages: Message[];
  isAnalyzing: boolean;
  onSendMessage: (message: string, uploadedImage?: string | null) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const StyleAdvice = ({ messages, isAnalyzing, onSendMessage, selectedModel, onModelChange }: StyleAdviceProps) => {
  return (
    <div className="flex h-full flex-col">
      <ChatHeader 
        isAnalyzing={isAnalyzing}
        selectedModel={selectedModel}
        onModelChange={onModelChange}
      />
      
      <ChatMessages 
        messages={messages}
        isAnalyzing={isAnalyzing}
      />

      <ChatInput 
        isAnalyzing={isAnalyzing}
        onSendMessage={onSendMessage}
      />
    </div>
  );
};

export default StyleAdvice;
