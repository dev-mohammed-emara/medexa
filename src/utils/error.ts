export const getErrorMessage = (errorData: any, defaultMessage: string = 'Operation failed'): string => {
  if (!errorData) return defaultMessage;
  
  // Check if details array contains a message
  if (errorData.details && Array.isArray(errorData.details) && errorData.details.length > 0) {
    const firstDetail = errorData.details[0];
    if (firstDetail && firstDetail.message) {
      return firstDetail.message;
    }
  }
  
  return errorData.message || errorData.error || defaultMessage;
};
