import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const originalFetch = window.fetch;
window.fetch = async (input, init) => {
  let url = input;
  if (typeof input === 'string' && input.startsWith('/api/')) {
    const API_BASE = import.meta.env.PROD ? 'http://178.128.198.121:8080/api/v1' : '/api';
    url = input.replace(/^\/api/, API_BASE);
  } else if (input instanceof URL && input.pathname.startsWith('/api/')) {
    const API_BASE = import.meta.env.PROD ? 'http://178.128.198.121:8080/api/v1' : '/api';
    input.pathname = input.pathname.replace(/^\/api/, API_BASE);
  }
  return originalFetch(url, init);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
