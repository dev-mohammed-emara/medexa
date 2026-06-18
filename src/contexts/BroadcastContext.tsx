import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { cacheData, getCachedData, broadcastUpdate, CHANNEL_NAME } from '../utils/broadcastCache';

interface BroadcastMessage {
  type: string;
  payload: any;
  timestamp: number;
}

interface BroadcastContextType {
  cacheData: (key: string, data: any) => Promise<void>;
  getCachedData: (key: string) => Promise<any>;
  broadcastUpdate: (type: string, payload: any) => void;
  subscribe: (type: string, callback: (payload: any) => void) => () => void;
}

const BroadcastContext = createContext<BroadcastContextType | undefined>(undefined);

export const BroadcastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [, setListeners] = useState<Record<string, Array<(payload: any) => void>>>({});

  useEffect(() => {
    const bc = new BroadcastChannel(CHANNEL_NAME);

    bc.onmessage = (event: MessageEvent<BroadcastMessage>) => {
      const { type, payload } = event.data;
      setListeners((prev) => {
        const callbacks = prev[type] || [];
        callbacks.forEach((cb) => cb(payload));
        return prev;
      });
    };

    return () => {
      bc.close();
    };
  }, []);

  const subscribe = useCallback((type: string, callback: (payload: any) => void) => {
    setListeners((prev) => {
      const newListeners = { ...prev };
      if (!newListeners[type]) {
        newListeners[type] = [];
      }
      newListeners[type].push(callback);
      return newListeners;
    });

    return () => {
      setListeners((prev) => {
        const newListeners = { ...prev };
        if (newListeners[type]) {
          newListeners[type] = newListeners[type].filter((cb) => cb !== callback);
        }
        return newListeners;
      });
    };
  }, []);

  const value = {
    cacheData,
    getCachedData,
    broadcastUpdate,
    subscribe,
  };

  return (
    <BroadcastContext.Provider value={value}>
      {children}
    </BroadcastContext.Provider>
  );
};

export const useBroadcast = (): BroadcastContextType => {
  const context = useContext(BroadcastContext);
  if (context === undefined) {
    throw new Error('useBroadcast must be used within a BroadcastProvider');
  }
  return context;
};
