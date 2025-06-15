
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type AlexStatus = 'idle' | 'listening' | 'analyzing' | 'speaking';

interface AlexStateContextType {
  status: AlexStatus;
  setStatus: (status: AlexStatus) => void;
}

const AlexStateContext = createContext<AlexStateContextType | undefined>(undefined);

export const useAlexState = () => {
  const context = useContext(AlexStateContext);
  if (context === undefined) {
    throw new Error('useAlexState must be used within an AlexStateProvider');
  }
  return context;
};

interface AlexStateProviderProps {
  children: ReactNode;
}

export const AlexStateProvider: React.FC<AlexStateProviderProps> = ({ children }) => {
  const [status, setStatus] = useState<AlexStatus>('idle');

  return (
    <AlexStateContext.Provider value={{ status, setStatus }}>
      {children}
    </AlexStateContext.Provider>
  );
};
