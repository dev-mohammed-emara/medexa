import { useState, useEffect } from 'react';

export const useFieldError = (nameOrNames?: string | string[]) => {
  const [backendError, setBackendError] = useState<string | null>(null);

  useEffect(() => {
    if (!nameOrNames) return;
    const names = Array.isArray(nameOrNames) ? nameOrNames : [nameOrNames];
    if (names.length === 0) return;

    const handleBackendError = (e: Event) => {
      const customEvent = e as CustomEvent;
      const errorData = customEvent.detail as { details?: Array<{ field: string; message?: string }>; message?: string } | null;
      
      // Check if there are details and try to find the specific field
      if (errorData && errorData.details && Array.isArray(errorData.details) && errorData.details.length > 0) {
        const detail = errorData.details.find((d) => names.includes(d.field));
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
