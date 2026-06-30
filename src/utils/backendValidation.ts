/**
 * Utility functions for handling and parsing backend validation errors.
 */

export interface BackendErrorDetail {
  field: string;
  message: string;
}

export interface BackendErrorResponse {
  code?: string | number;
  message?: string;
  details?: BackendErrorDetail[];
}

/**
 * Matches a backend field name against a list of possible frontend field names.
 * Supports:
 * 1. Exact match ('owner.summary' === 'owner.summary')
 * 2. Last segment match ('owner.summary' === 'summary')
 * 3. camelCase match ('owner.summary' === 'ownerSummary')
 * 4. snake_case match ('owner.summary' === 'owner_summary')
 * 
 * @param backendField The nested field name from backend (e.g., 'owner.summary')
 * @param frontendNames An array of names used by the frontend input component
 * @returns boolean True if any of the frontend names map to the backend field
 */
export const matchFieldName = (backendField: string, frontendNames: string[]): boolean => {
  if (!backendField || !frontendNames || frontendNames.length === 0) return false;

  const bfLower = backendField.toLowerCase();
  const namesLower = frontendNames.map(n => n.toLowerCase());

  // 1. Exact match (case-insensitive)
  if (namesLower.includes(bfLower)) return true;

  const backendSegments = backendField.split('.');
  const lastSegment = backendSegments[backendSegments.length - 1].toLowerCase();

  for (const name of frontendNames) {
    const nameLower = name.toLowerCase();

    // 2. Last segment match: 'owner.summary' === 'summary'
    if (nameLower === lastSegment) return true;

    // 3. camelCase conversion: 'owner.summary' === 'ownerSummary'
    const camelCaseBackend = backendSegments.reduce((acc, part, index) => {
      if (index === 0) return part;
      return acc + part.charAt(0).toUpperCase() + part.slice(1);
    }, '').toLowerCase();
    
    if (nameLower === camelCaseBackend) return true;

    // 4. snake_case conversion: 'owner.summary' === 'owner_summary'
    const snakeCaseBackend = backendSegments.join('_').toLowerCase();
    if (nameLower === snakeCaseBackend) return true;
  }

  return false;
};

/**
 * Parses a standard backend error response into a flat dictionary of error messages
 * keyed by all possible frontend field name permutations.
 * 
 * Useful for form libraries like react-hook-form or Formik.
 * 
 * @param errorData The raw error JSON payload from the backend
 * @returns Record<string, string> A dictionary mapping field names to error messages
 */
export const parseBackendValidationErrors = (
  errorData: any
): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (!errorData || typeof errorData !== 'object') return errors;

  if (Array.isArray(errorData.details)) {
    errorData.details.forEach((d: any) => {
      if (d.field) {
        const segments = d.field.split('.');
        const lastSegment = segments[segments.length - 1];
        
        const camelCase = segments.reduce((acc: string, part: string, index: number) => {
          if (index === 0) return part;
          return acc + part.charAt(0).toUpperCase() + part.slice(1);
        }, '');
        
        const snakeCase = segments.join('_');
        
        const message = d.message || errorData.message || 'Invalid field';

        errors[d.field] = message;
        errors[d.field.toLowerCase()] = message;
        
        if (!errors[lastSegment]) errors[lastSegment] = message;
        if (!errors[lastSegment.toLowerCase()]) errors[lastSegment.toLowerCase()] = message;
        
        if (!errors[camelCase]) errors[camelCase] = message;
        if (!errors[camelCase.toLowerCase()]) errors[camelCase.toLowerCase()] = message;
        
        if (!errors[snakeCase]) errors[snakeCase] = message;
        if (!errors[snakeCase.toLowerCase()]) errors[snakeCase.toLowerCase()] = message;
      }
    });
  }

  return errors;
};
