/**
 * Light-weight utilities for managing browser cookies.
 */


interface DecodedToken {
  exp?: number
  [key: string]: unknown
}

// Helper function to parse JWT token
export const parseJWT = (token: string): DecodedToken | null => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Failed to parse JWT:', error)
    return null
  }
}

export const isTokenExpired = (token: string): boolean => {
  const decoded = parseJWT(token)
  if (!decoded || !decoded.exp) return true
  // exp is in seconds, Date.now() is in milliseconds
  return decoded.exp * 1000 < Date.now()
}

export const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }
  // Fallback to localStorage if cookie is not available
  return localStorage.getItem(name);
};

export const setCookie = (name: string, value: string, days?: number): void => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  // Use SameSite=Strict and path=/ for security
  document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/; SameSite=Strict";
  // Also sync to localStorage
  localStorage.setItem(name, value);
};

export const deleteCookie = (name: string): void => {
  document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict";
  // Also remove from localStorage
  localStorage.removeItem(name);
};

export const checkTokenOrRedirect = (): void => {

  const token = getCookie('token')
  if (!token || isTokenExpired(token)) {
    // Perform cleanup
    deleteCookie('token')
    deleteCookie('refreshToken')
    localStorage.removeItem('medexa_user')
    // Redirect
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
    throw new Error('Session expired. Redirecting to login...')
  }
}

