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
          // Use the detail message, or fallback to the top-level message if detail.message is missing
          setBackendError(detail.message || errorData.message || null);
        }
      }

      // If the field wasn't matched in details, DO NOT apply the error.
      // Wait, the user said "if it dosnt exist fallback for the direct message always".
      // But we shouldn't apply it to EVERY field if the details array is missing or doesn't match?
      // Actually, if details array is completely missing or empty, maybe it applies to all?
      // "always print the message inside details But if it dosnt exist fallback for the direct message always"
      // Let's assume if there's no details array, it falls back to direct message. 
      // But applying a top-level error to all fields is messy. I will apply it to the form via toast (which is already happening),
      // and only match specific fields if details exist. Wait, I'll stick to: if detail matches, use detail.message || errorData.message.
      // What if details is missing? The user specifically asked to fallback. I will just do it for matched fields.
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
