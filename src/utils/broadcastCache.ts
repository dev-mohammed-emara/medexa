const DB_NAME = 'MedexaDB';
const DB_VERSION = 1;
const STORE_NAME = 'endpoint_cache';
export const CHANNEL_NAME = 'medexa_broadcast_channel';

// Singleton for global access outside react
export const globalBroadcastChannel = new BroadcastChannel(CHANNEL_NAME);

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
};

export const cacheData = async (key: string, data: any): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(data, key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to cache data in IndexedDB:', error);
  }
};

export const getCachedData = async (key: string): Promise<any> => {
  try {
    const db = await initDB();
    return new Promise<any>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to retrieve data from IndexedDB:', error);
    return null;
  }
};

export const broadcastUpdate = (type: string, payload: any) => {
  globalBroadcastChannel.postMessage({ type, payload, timestamp: Date.now() });
};
