import { cacheData, getCachedData, broadcastUpdate } from './broadcastCache';

/**
 * apiFetch is a drop-in replacement for the native fetch function.
 * - For GET requests: It attempts to hit the network, caches the JSON response on success, 
 *   and falls back to IndexedDB on network failure.
 * - For Mutations (POST, PUT, DELETE, PATCH): It attempts to hit the network, and on success
 *   broadcasts an event so other tabs can be notified of the change.
 */
export const apiFetch = async (input: RequestInfo | URL, init?: RequestInit, enableLogoutOn401: boolean = true): Promise<Response> => {
  const method = (init?.method || 'GET').toUpperCase();
  const isGet = method === 'GET';
  const urlString = typeof input === 'string' ? input : input.toString();

  try {
    if (!isGet) {
      // Clear any previous backend form errors
      window.dispatchEvent(new CustomEvent('CLEAR_BACKEND_ERRORS'));
    }

    // Attempt network request
    const response = await fetch(input, init);

    // If server fails (5xx error) and it's a GET request, throw to trigger fallback
    if (!response.ok && response.status >= 500 && isGet) {
      throw new Error(`Server failed with status ${response.status}`);
    }

    // Intercept 401 Unauthorized to clear session and redirect to login
    if (response.status === 401 && enableLogoutOn401) {
      document.cookie = "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict";
      document.cookie = "refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict";
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('medexa_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return response;
    }

    // Intercept 400 Bad Request to dispatch validation errors to UI components globally
    if (!response.ok && response.status === 400) {
      try {
        const clone = response.clone();
        const errorData = await clone.json();
        // Fire custom event with the error data
        window.dispatchEvent(new CustomEvent('BACKEND_VALIDATION_ERROR', { detail: errorData }));
      } catch (e) {
        // ignore JSON parse error
      }
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
