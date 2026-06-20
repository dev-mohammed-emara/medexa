import { useState, useEffect } from 'react';

export const useFieldError = (name?: string) => {
  const [backendError, setBackendError] = useState<string | null>(null);

  useEffect(() => {
    if (!name) return;

    const handleBackendError = (e: Event) => {
      const customEvent = e as CustomEvent;
      const errorData = customEvent.detail;
      
      // Check if there are details and try to find the specific field
      if (errorData.details && Array.isArray(errorData.details) && errorData.details.length > 0) {
        const detail = errorData.details.find((d: any) => d.field === name);
        if (detail) {
          setBackendError(detail.message || errorData.message || null);
        }
      }
    };

    const handleClear = () => {
      setBackendError(null);
    };

    window.addEventListener('BACKEND_VALIDATION_ERROR', handleBackendError);
    window.addEventListener('CLEAR_BACKEND_ERRORS', handleClear);

    return () => {
      window.removeEventListener('BACKEND_VALIDATION_ERROR', handleBackendError);
      window.removeEventListener('CLEAR_BACKEND_ERRORS', handleClear);
    };
  }, [name]);

  return { backendError, setBackendError };
};
