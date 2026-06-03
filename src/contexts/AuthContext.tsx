/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { deleteCookie, getCookie, setCookie } from '../utils/cookie'

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
  clinicId?: number
  username?: string
  sub?: string
}

interface AuthContextType {
  isAuthenticated: boolean
  loading: boolean
  user: UserProfile | null
  profileImage: string | null
  login: (email: string, password: string) => Promise<void>
  register: (payload: any) => Promise<void>
  logout: () => Promise<string | void>
  updateProfileImage: (image: string | null) => void
  updateUser: (updatedFields: Partial<UserProfile>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper function to parse JWT token
const parseJWT = (token: string): any => {
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

// Helper function to extract permissions from JWT
const extractPermissionsFromJWT = (token: string): string[] => {
  const decoded = parseJWT(token)
  if (!decoded || !decoded.authorities) {
    return ['MANAGE_CLINIC']
  }
  const permissions = decoded.authorities.split(',').map((p: string) => p.trim())
  // Add MANAGE_CLINIC as default if not already present
  if (!permissions.includes('MANAGE_CLINIC')) {
    permissions.push('MANAGE_CLINIC')
  }
  return permissions
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('medexa_user')
    return saved ? JSON.parse(saved) : null
  })
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!getCookie('token')
  })
  const [loading, setLoading] = useState<boolean>(() => {
    return !!getCookie('token') && !!getCookie('refreshToken')
  })

  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleTokenRefresh = (expiresInSeconds: number) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
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

    const data = await response.json() as Record<string, any>
    const newAccessToken = data.accessToken || data.token || data.data?.accessToken || data.data?.token
    const newRefreshToken = data.refreshToken || data.data?.refreshToken
    let expiresIn: number = data.expiresIn || data.data?.expiresIn || 900
    if (expiresIn > 100000) {
      expiresIn = expiresIn / 1000
    }

    if (!newAccessToken) {
      throw new Error('Refresh response missing access token')
    }

    // Parse JWT to extract user data
    const decodedToken = parseJWT(newAccessToken)
    const permissions = extractPermissionsFromJWT(newAccessToken)

    // Update access token (always)
    setCookie('token', newAccessToken, 7)

    // Update refresh token if provided (fallback to current if not)
    if (newRefreshToken) {
      setCookie('refreshToken', newRefreshToken, 7)
    }

    // Sync user profile with JWT data
    const currentUser = user || {} as Partial<UserProfile>
    const updatedUser: UserProfile = {
      uuid: currentUser.uuid,
      email: decodedToken?.username || currentUser.email || '',
      username: decodedToken?.username,
      sub: decodedToken?.sub,
      clinicId: decodedToken?.clinicId,
      permissions: permissions,
      firstName: currentUser.firstName || decodedToken?.sub || 'User',
      surName: currentUser.surName || '',
      lastName: currentUser.lastName || '',
      phoneNumber: currentUser.phoneNumber || '',
      gender: currentUser.gender || '',
      dateOfBirth: currentUser.dateOfBirth || '',
      role: currentUser.role,
      status: currentUser.status,
    }

    setUser(updatedUser)
    localStorage.setItem('medexa_user', JSON.stringify(updatedUser))

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
    const performInitialRefresh = async () => {
      if (isAuthenticated && getCookie('refreshToken')) {
        try {
          await refresh()
        } catch (err) {
          console.error("Initial load token refresh failed, logging out:", err)
          await logout()
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }
    performInitialRefresh()

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
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

    const data = await response.json() as Record<string, any>
    const token = data.accessToken || data.token || data.data?.accessToken || data.data?.token
    const refreshToken = data.refreshToken || data.data?.refreshToken
    let expiresIn: number = data.expiresIn || 900
    if (expiresIn > 100000) {
      expiresIn = expiresIn / 1000
    }

    if (!token) {
      throw new Error('No token returned from server.')
    }

    // Save tokens in cookies
    setCookie('token', token, 7)
    if (refreshToken) {
      setCookie('refreshToken', refreshToken, 7)
    }
    setIsAuthenticated(true)

    // Parse JWT to extract user data
    const decodedToken = parseJWT(token)
    const permissions = extractPermissionsFromJWT(token)

    // Save user data (prefer JWT data, fallback to response data, then defaults)
    let userProfile: UserProfile;
    if (data.user) {
      userProfile = {
        ...data.user,
        email: decodedToken?.username || data.user.email || email,
        username: decodedToken?.username,
        sub: decodedToken?.sub,
        clinicId: decodedToken?.clinicId,
        permissions: permissions,
      };
    } else {
      const savedUserStr = localStorage.getItem('medexa_user');
      const savedUser = savedUserStr ? JSON.parse(savedUserStr) : null;
      userProfile = {
        firstName: savedUser?.firstName || "Ahmad",
        surName: savedUser?.surName || "Mohammed",
        lastName: savedUser?.lastName || "Almasri",
        email: decodedToken?.username || email,
        phoneNumber: savedUser?.phoneNumber || "0791234567",
        gender: savedUser?.gender || "MALE",
        dateOfBirth: savedUser?.dateOfBirth || "1985-06-09",
        role: "ROLE_CLINIC_OWNER",
        username: decodedToken?.username,
        sub: decodedToken?.sub,
        clinicId: decodedToken?.clinicId,
        permissions: permissions,
      };
    }
    setUser(userProfile)
    localStorage.setItem('medexa_user', JSON.stringify(userProfile))

    // Schedule silent token refresh
    scheduleTokenRefresh(expiresIn)

    const channel = new BroadcastChannel('medexa_sync');
    channel.postMessage({ type: 'AUTH_UPDATE', isAuthenticated: true, user: userProfile });
  }

  const register = async (payload: Record<string, any>) => {
    const response = await fetch('/api/clinic', {
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

    const clinicData = await response.json() as Record<string, any>
    console.log('Clinic registered:', clinicData)
    const ownerUser = payload.owner?.user
    if (ownerUser) {
      const userProfile: UserProfile = {
        firstName: ownerUser.firstName,
        surName: ownerUser.surName,
        lastName: ownerUser.lastName,
        email: ownerUser.email,
        phoneNumber: ownerUser.phoneNumber,
        gender: ownerUser.gender,
        dateOfBirth: ownerUser.dateOfBirth,
        role: "ROLE_CLINIC_OWNER",
        permissions: ['MANAGE_CLINIC']
      }
      setUser(userProfile)
      localStorage.setItem('medexa_user', JSON.stringify(userProfile))

      const channel = new BroadcastChannel('medexa_sync');
      channel.postMessage({ type: 'AUTH_UPDATE', isAuthenticated: isAuthenticated, user: userProfile });
    }
  }

  const logout = async (): Promise<string | void> => {
    // Clear scheduled timer
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current as any)
      refreshTimeoutRef.current = null
    }

    let successMessage: string | void = undefined;

    const token = getCookie('token')
    if (token) {
      try {
        const res = await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        const data = await res.json().catch(() => ({}));
        if (data.message) {
          successMessage = data.message;
        }
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

    return successMessage;
  }

  const updateProfileImage = (image: string | null) => {
    setProfileImage(image)
  }

  const updateUser = (updatedFields: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null
      const nextUser = { ...prev, ...updatedFields }
      localStorage.setItem('medexa_user', JSON.stringify(nextUser))
      const channel = new BroadcastChannel('medexa_sync')
      channel.postMessage({ type: 'AUTH_UPDATE', isAuthenticated: true, user: nextUser })
      return nextUser
    })
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, user, profileImage, login, register, logout, updateProfileImage, updateUser }}>
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
