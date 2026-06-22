interface ApiErrorData {
  message?: string
  error?: string
  details?: Array<{ message?: string }>
}

export const getErrorMessage = (errorData: unknown, defaultMessage: string = 'Operation failed'): string => {
  if (!errorData || typeof errorData !== 'object') return defaultMessage;
  
  const err = errorData as ApiErrorData;

  // Check if details array contains a message
  if (err.details && Array.isArray(err.details) && err.details.length > 0) {
    const firstDetail = err.details[0];
    if (firstDetail && firstDetail.message) {
      return firstDetail.message;
    }
  }
  
  return err.message || err.error || defaultMessage;
};
