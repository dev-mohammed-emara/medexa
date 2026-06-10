/**
 * Centralized API configuration.
 *
 * Resolves the base URL for API requests using environment variables.
 * In development, this falls back to '/api' which leverages the Vite dev server proxy.
 * In production, it uses the VITE_API_URL environment variable, falling back to the default production endpoint.
 */

// Retrieve VITE_API_URL from Vite's environment variables
const envApiUrl = import.meta.env.VITE_API_URL;

// Base API URL fallback resolution
export const API_BASE_URL = envApiUrl || (import.meta.env.DEV ? '/api' : 'https://178.128.198.121/api/v1');

/**
 * Helper to resolve the correct API path.
 * If the input starts with '/api', it replaces '/api' with API_BASE_URL.
 */
export function resolveApiPath(path: string): string {
  if (API_BASE_URL === '/api') {
    return path;
  }
  return path.replace(/^\/api/, API_BASE_URL);
}
