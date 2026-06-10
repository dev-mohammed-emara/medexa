import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { API_BASE_URL } from './config/api'

const originalFetch = window.fetch;
window.fetch = async (input, init) => {
  let url: RequestInfo | URL = input;
  if (typeof input === 'string' && input.startsWith('/api/')) {
    url = input.replace(/^\/api/, API_BASE_URL);
  } else if (input instanceof URL && input.pathname.startsWith('/api/')) {
    if (API_BASE_URL.startsWith('http')) {
      const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;
      const relativePath = input.pathname.replace(/^\/api\//, '');
      const newUrl = new URL(relativePath, baseUrl);
      newUrl.search = input.search;
      newUrl.hash = input.hash;
      url = newUrl;
    } else {
      input.pathname = input.pathname.replace(/^\/api/, API_BASE_URL);
      url = input;
    }
  }

  try {
    return await originalFetch(url, init);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[API Fetch Network/SSL Failure Details]:', {
        targetUrl: url.toString(),
        error
      });
    }
    throw new Error(
      'Unable to connect to the server. This could be due to a temporary network issue, an invalid SSL/TLS certificate, or server downtime. Please verify your connection or contact support.'
    );
  }
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
