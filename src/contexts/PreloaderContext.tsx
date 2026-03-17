
import React, { createContext, useContext, useState } from 'react';

interface PreloaderContextType {
  isLoaded: boolean;
  setIsLoaded: (loaded: boolean) => void;
  isExiting: boolean;
  setIsExiting: (exiting: boolean) => void;
  hasServerError: boolean;
  setHasServerError: (val: boolean) => void;
  hasSessionExpired: boolean;
  setHasSessionExpired: (val: boolean) => void;
}

const PreloaderContext = createContext<PreloaderContextType | undefined>(undefined);

export const PreloaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [hasServerError, setHasServerError] = useState(false);
  const [hasSessionExpired, setHasSessionExpired] = useState(false);

  return (
    <PreloaderContext.Provider value={{ 
      isLoaded, setIsLoaded, 
      isExiting, setIsExiting,
      hasServerError, setHasServerError,
      hasSessionExpired, setHasSessionExpired
    }}>
      {children}
    </PreloaderContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const usePreloader = () => {
  const context = useContext(PreloaderContext);
  if (context === undefined) {
    throw new Error('usePreloader must be used within a PreloaderProvider');
  }
  return context;
};
