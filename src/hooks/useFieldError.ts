import { useState, useEffect } from 'react';
import { matchFieldName } from '../utils/backendValidation';

export const useFieldError = (nameOrNames?: string | string[]) => {
  const [backendError, setBackendError] = useState<string | null>(null);
  const [backendErrors, setBackendErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!nameOrNames) return;
    const names = Array.isArray(nameOrNames) ? nameOrNames : [nameOrNames];
    if (names.length === 0) return;

    const handleBackendError = (e: Event) => {
      const customEvent = e as CustomEvent;
      const errorData = customEvent.detail as { details?: Array<{ field: string; message?: string }>; message?: string } | null;
      
      // Check if there are details and try to find matching fields
      if (errorData && errorData.details && Array.isArray(errorData.details) && errorData.details.length > 0) {
        const matchingDetails = errorData.details.filter((d) => matchFieldName(d.field, names));
        if (matchingDetails.length > 0) {
          const messages = matchingDetails.map(d => d.message || errorData.message || 'Invalid field');
          setBackendErrors(messages);
          setBackendError(messages[0]);
        }
      }
    };

    const handleClear = () => {
      setBackendError(null);
      setBackendErrors([]);
    };

    window.addEventListener('BACKEND_VALIDATION_ERROR', handleBackendError);
    window.addEventListener('CLEAR_BACKEND_ERRORS', handleClear);

    return () => {
      window.removeEventListener('BACKEND_VALIDATION_ERROR', handleBackendError);
      window.removeEventListener('CLEAR_BACKEND_ERRORS', handleClear);
    };
  }, [JSON.stringify(nameOrNames)]);

  return { backendError, backendErrors, setBackendError, setBackendErrors };
};
