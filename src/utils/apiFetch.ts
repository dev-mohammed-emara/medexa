import { cacheData, getCachedData, broadcastUpdate } from './broadcastCache';

/**
 * apiFetch is a drop-in replacement for the native fetch function.
 * - For GET requests: It attempts to hit the network, caches the JSON response on success, 
 *   and falls back to IndexedDB on network failure.
 * - For Mutations (POST, PUT, DELETE, PATCH): It attempts to hit the network, and on success
 *   broadcasts an event so other tabs can be notified of the change.
 */
export const apiFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const method = (init?.method || 'GET').toUpperCase();
  const isGet = method === 'GET';
  const urlString = typeof input === 'string' ? input : input.toString();

  try {
    // Attempt network request
    const response = await fetch(input, init);

    // If server fails (5xx error) and it's a GET request, throw to trigger fallback
    if (!response.ok && response.status >= 500 && isGet) {
      throw new Error(`Server failed with status ${response.status}`);
    }

    // If successful and it's a GET request, cache the JSON payload
    if (response.ok && isGet) {
      try {
        const clone = response.clone();
        const data = await clone.json();
        await cacheData(urlString, data);
      } catch (err) {
        // Response might not be JSON, ignore caching error
        console.warn('Could not cache response for', urlString, err);
      }
    }

    // If successful and it's a mutation, broadcast to other tabs
    if (response.ok && !isGet) {
      broadcastUpdate('MUTATION_SUCCESS', {
        url: urlString,
        method,
      });
    }

    return response;

  } catch (error) {
    // On network failure or server 5xx error
    if (isGet) {
      console.warn(`Network/Server failed for GET ${urlString}. Attempting to read from IndexedDB...`, error);
      const cachedData = await getCachedData(urlString);
      
      if (cachedData) {
        // Broadcast that we are using fallback data so UI can react (e.g. show "Offline Mode" warning)
        broadcastUpdate('OFFLINE_FALLBACK', {
          url: urlString,
          method,
        });

        // Return a mocked Response object containing the cached data
        return new Response(JSON.stringify(cachedData), {
          status: 200,
          statusText: 'OK (Cached)',
          headers: new Headers({
            'Content-Type': 'application/json',
            'X-From-Cache': 'true'
          })
        });
      }
    }
    
    // If it's a mutation or we don't have cache, propagate the error
    throw error;
  }
};
