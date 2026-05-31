import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { getCookie, setCookie, deleteCookie } from '../utils/cookie'

export interface UserProfile {
  uuid?: string
  firstName: string
  surName: string
  lastName: string
  email: string
  phoneNumber: string
  gender: string
  dateOfBirth: string
  status?: string
  role?: string
  permissions?: string[]
}

interface AuthContextType {
  isAuthenticated: boolean
  user: UserProfile | null
  profileImage: string | null
  login: (email: string, password: string) => Promise<void>
  register: (payload: any) => Promise<void>
  logout: () => Promise<void>
  updateProfileImage: (image: string | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('medexa_user')
    return saved ? JSON.parse(saved) : null
  })
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!getCookie('token')
  })

  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleTokenRefresh = (expiresInSeconds: number) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current as any)
    }

    // Refresh 1 minute before expiry. If expiresIn is very small, refresh at 50% duration.
    const delay = Math.max((expiresInSeconds - 60) * 1000, (expiresInSeconds / 2) * 1000, 5000)

    refreshTimeoutRef.current = setTimeout(async () => {
      try {
        await refresh()
      } catch (err) {
        console.error("Silent token refresh failed, logging out:", err)
        await logout()
      }
    }, delay)
  }

  const refresh = async () => {
    const currentRefreshToken = getCookie('refreshToken')
    if (!currentRefreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: currentRefreshToken }),
    })

    if (!response.ok) {
      let errorMessage = 'Failed to refresh token.'
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch (e) {
        // Fallback
      }
      throw new Error(errorMessage)
    }

    const data = await response.json()
    const newAccessToken = data.accessToken
    const newRefreshToken = data.refreshToken
    const expiresIn = data.expiresIn || 900

    if (!newAccessToken || !newRefreshToken) {
      throw new Error('Refresh response missing tokens')
    }

    setCookie('token', newAccessToken, 7)
    setCookie('refreshToken', newRefreshToken, 7)

    scheduleTokenRefresh(expiresIn)
  }

  // Cross-tab Synchronization
  useEffect(() => {
    const channel = new BroadcastChannel('medexa_sync');
    channel.onmessage = (event) => {
      if (event.data.type === 'AUTH_UPDATE') {
        setIsAuthenticated(event.data.isAuthenticated);
        setUser(event.data.user || null);
      }
    };
    return () => channel.close();
  }, []);

  // Initial load silent refresh and cleanup
  useEffect(() => {
    if (isAuthenticated && getCookie('refreshToken')) {
      const performInitialRefresh = async () => {
        try {
          await refresh()
        } catch (err) {
          console.error("Initial load token refresh failed, logging out:", err)
          await logout()
        }
      }
      performInitialRefresh()
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current as any)
      }
    }
  }, [])

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      let errorMessage = 'Failed to log in. Please check your credentials.'
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch (e) {
        // Fallback to default
      }
      throw new Error(errorMessage)
    }

    const data = await response.json()
    const token = data.accessToken || data.token || data.data?.accessToken || data.data?.token
    const refreshToken = data.refreshToken || data.data?.refreshToken
    const expiresIn = data.expiresIn || 900

    if (!token) {
      throw new Error('No token returned from server.')
    }

    // Save tokens in cookies
    setCookie('token', token, 7)
    if (refreshToken) {
      setCookie('refreshToken', refreshToken, 7)
    }
    setIsAuthenticated(true)

    // Save user data (persist from registration or default)
    let userProfile: UserProfile;
    if (data.user) {
      userProfile = data.user;
    } else {
      const savedUserStr = localStorage.getItem('medexa_user');
      const savedUser = savedUserStr ? JSON.parse(savedUserStr) : null;
      userProfile = {
        firstName: savedUser?.firstName || "Ahmad",
        surName: savedUser?.surName || "Mohammed",
        lastName: savedUser?.lastName || "Almasri",
        email: email,
        phoneNumber: savedUser?.phoneNumber || "0791234567",
        gender: savedUser?.gender || "MALE",
        dateOfBirth: savedUser?.dateOfBirth || "1985-06-09",
        role: "ROLE_CLINIC_OWNER"
      };
    }
    setUser(userProfile)
    localStorage.setItem('medexa_user', JSON.stringify(userProfile))

    // Schedule silent token refresh
    scheduleTokenRefresh(expiresIn)

    const channel = new BroadcastChannel('medexa_sync');
    channel.postMessage({ type: 'AUTH_UPDATE', isAuthenticated: true, user: userProfile });
  }

  const register = async (payload: any) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      let errorMessage = 'Failed to register.'
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch (e) {
        // Fallback
      }
      throw new Error(errorMessage)
    }

    const userData: UserProfile = await response.json()
    setUser(userData)
    localStorage.setItem('medexa_user', JSON.stringify(userData))

    const channel = new BroadcastChannel('medexa_sync');
    channel.postMessage({ type: 'AUTH_UPDATE', isAuthenticated: isAuthenticated, user: userData });
  }

  const logout = async () => {
    // Clear scheduled timer
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current as any)
      refreshTimeoutRef.current = null
    }

    const token = getCookie('token')
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
      } catch (e) {
        console.error("API logout failed, performing client-side logout cleanup", e)
      }
    }

    // Client-side cleanup
    deleteCookie('token')
    deleteCookie('refreshToken')
    localStorage.removeItem('medexa_user')
    setIsAuthenticated(false)
    setUser(null)

    const channel = new BroadcastChannel('medexa_sync');
    channel.postMessage({ type: 'AUTH_UPDATE', isAuthenticated: false, user: null });
  }

  const updateProfileImage = (image: string | null) => {
    setProfileImage(image)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, profileImage, login, register, logout, updateProfileImage }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
