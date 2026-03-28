import { useEffect } from 'react';

type BroadcastEvent = 
  | { type: 'LANGUAGE_UPDATE'; language: 'ar' | 'en' }
  | { type: 'AUTH_UPDATE'; isAuthenticated: boolean }
  | { type: 'DATA_UPDATE'; module: 'doctors' | 'secretaries' | 'patients' | 'records' | 'finance' };

const channel = new BroadcastChannel('medexa_sync');

export const useBroadcast = (onMessage?: (event: BroadcastEvent) => void) => {
  useEffect(() => {
    if (!onMessage) return;

    const handler = (event: MessageEvent<BroadcastEvent>) => {
      onMessage(event.data);
    };

    channel.addEventListener('message', handler);
    return () => channel.removeEventListener('message', handler);
  }, [onMessage]);

  const broadcast = (event: BroadcastEvent) => {
    channel.postMessage(event);
  };

  return { broadcast };
};
