import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { cacheData, getCachedData, broadcastUpdate, CHANNEL_NAME } from '../utils/broadcastCache';

interface BroadcastMessage {
  type: string;
  payload: unknown;
  timestamp: number;
}

interface BroadcastContextType {
  cacheData: (key: string, data: unknown) => Promise<void>;
  getCachedData: (key: string) => Promise<unknown>;
  broadcastUpdate: (type: string, payload: unknown) => void;
  subscribe: (type: string, callback: (payload: unknown) => void) => () => void;
}

const BroadcastContext = createContext<BroadcastContextType | undefined>(undefined);

export const BroadcastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [, setListeners] = useState<Record<string, Array<(payload: unknown) => void>>>({});

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

  const subscribe = useCallback((type: string, callback: (payload: unknown) => void) => {
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
