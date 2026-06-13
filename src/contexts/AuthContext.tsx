/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { deleteCookie, getCookie, setCookie, isTokenExpired } from '../utils/cookie'
import { jwtDecode } from 'jwt-decode'

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
  roles?: string[]
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
  hasRole: (role: string) => boolean
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper function to parse JWT token
const parseJWT = (token: string): any => {
  try {
    const decoded = jwtDecode(token)
    console.log('Decoded JWT Claims:', decoded)
    return decoded
  } catch (error) {
    console.error('Failed to parse JWT:', error)
    return null
  }
}

const getProfileEndpoint = (token: string): string => {
  try {
    const savedUserStr = localStorage.getItem('medexa_user')
    if (savedUserStr) {
      const savedUser = JSON.parse(savedUserStr)
      if (savedUser && savedUser.role === 'ROLE_SECRETARY') {
        return '/api/secretary/me'
      }
    }
  } catch (e) {}

  const decoded = parseJWT(token)
  if (!decoded) return '/api/doctor/me'

  const authorities = decoded.authorities || ''
  const roles = decoded.roles || []
  const role = decoded.role || ''

  const isSecretary =
    authorities.includes('ROLE_SECRETARY') ||
    (Array.isArray(roles) && roles.includes('ROLE_SECRETARY')) ||
    (typeof roles === 'string' && roles.includes('ROLE_SECRETARY')) ||
    role === 'ROLE_SECRETARY'

  return isSecretary ? '/api/secretary/me' : '/api/doctor/me'
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profileImage, setProfileImage] = useState<string | null>(null)

  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('medexa_user')
    return saved ? JSON.parse(saved) : null
  })
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const token = getCookie('token')
    return !!token && !isTokenExpired(token)
  })
  const [loading, setLoading] = useState<boolean>(() => {
    const token = getCookie('token')
    return !!token && !isTokenExpired(token) && !!getCookie('refreshToken')
  })

  useEffect(() => {
    if (user?.email) {
      const savedImage = localStorage.getItem(`medexa_profile_image_${user.email}`)
      setProfileImage(savedImage)
    } else {
      setProfileImage(null)
    }
  }, [user?.email])

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
    const tokenRoles = decodedToken?.roles || []
    if (tokenRoles.length > 0) {
      console.log('Roles from refresh token:', tokenRoles)
    }

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
      permissions: tokenRoles,
      roles: tokenRoles,
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
      const token = getCookie('token')
      if (token && isTokenExpired(token)) {
        console.warn("Initial load token expired, logging out...")
        await logout()
        setLoading(false)
        return
      }

      // If token is valid, schedule refresh for later and finish loading immediately
      if (token && !isTokenExpired(token)) {
        try {
          const decoded = parseJWT(token)
          if (decoded && decoded.exp) {
            const expiresInSeconds = decoded.exp - Math.floor(Date.now() / 1000)
            if (expiresInSeconds > 0) {
              scheduleTokenRefresh(expiresInSeconds)
            }
          }

          // Fetch user data from correct endpoint depending on role
          const profileUrl = getProfileEndpoint(token);
          const response = await fetch(profileUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          if (response.ok) {
            const data = await response.json()
            const tokenRoles = decoded?.roles || []
            const tokenAuthoritiesStr = decoded?.authorities || ''
            const tokenAuthorities = typeof tokenAuthoritiesStr === 'string' 
              ? tokenAuthoritiesStr.split(',').map(s => s.trim()).filter(Boolean)
              : (Array.isArray(tokenAuthoritiesStr) ? tokenAuthoritiesStr : [])
            const allPermissions = Array.from(new Set([...tokenRoles, ...tokenAuthorities]))

            const userProfile: UserProfile = {
              ...data.user,
              specialty: data.specialty,
              summary: data.summary,
              uuid: data.uuid,
              email: decoded?.username || data.user?.email || '',
              username: decoded?.username,
              sub: decoded?.sub,
              clinicId: decoded?.clinicId,
              permissions: allPermissions,
              roles: allPermissions,
            }
            setUser(userProfile)
            localStorage.setItem('medexa_user', JSON.stringify(userProfile))
          }
        } catch (e) {
          console.error("Failed to schedule refresh or fetch doctor profile from existing token:", e)
        }
        setLoading(false)
        return
      }

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
    const tokenRoles = decodedToken?.roles || []
    if (tokenRoles.length > 0) {
      console.log('Roles from login token:', tokenRoles)
    }

    // Save user data (prefer profile endpoint, fallback to JWT/response data, then defaults)
    let userProfile: UserProfile;
    try {
      const profileUrl = getProfileEndpoint(token);
      const profileRes = await fetch(profileUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (profileRes.ok) {
        const profileData = await profileRes.json()
        userProfile = {
          ...profileData.user,
          specialty: profileData.specialty,
          summary: profileData.summary,
          uuid: profileData.uuid,
          email: decodedToken?.username || profileData.user?.email || email,
          username: decodedToken?.username,
          sub: decodedToken?.sub,
          clinicId: decodedToken?.clinicId,
          permissions: tokenRoles,
          roles: tokenRoles,
        }
      } else {
        throw new Error("Failed to fetch doctor profile")
      }
    } catch (err) {
      if (data.user) {
        userProfile = {
          ...data.user,
          email: decodedToken?.username || data.user.email || email,
          username: decodedToken?.username,
          sub: decodedToken?.sub,
          clinicId: decodedToken?.clinicId,
          permissions: tokenRoles,
          roles: tokenRoles,
        };
      } else {
        const savedUserStr = localStorage.getItem('medexa_user');
        const savedUser = savedUserStr ? JSON.parse(savedUserStr) : null;
        const tokenRoles = decodedToken?.roles || [];
        const tokenAuthoritiesStr = decodedToken?.authorities || '';
        const tokenAuthorities = typeof tokenAuthoritiesStr === 'string' 
          ? tokenAuthoritiesStr.split(',').map(s => s.trim()).filter(Boolean)
          : (Array.isArray(tokenAuthoritiesStr) ? tokenAuthoritiesStr : [])
        const allPermissions = Array.from(new Set([...tokenRoles, ...tokenAuthorities]))

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
          permissions: allPermissions,
          roles: allPermissions,
        };
      }
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
        permissions: []
      }
      setUser(userProfile)
      localStorage.setItem('medexa_user', JSON.stringify(userProfile))

      const channel = new BroadcastChannel('medexa_sync');
      channel.postMessage({ type: 'AUTH_UPDATE', isAuthenticated: isAuthenticated, user: userProfile });
    }
  }

  async function logout(): Promise<string | void> {
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
    if (user?.email) {
      if (image) {
        localStorage.setItem(`medexa_profile_image_${user.email}`, image)
      } else {
        localStorage.removeItem(`medexa_profile_image_${user.email}`)
      }
    }
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

  const hasRole = useCallback((role: string): boolean => {
    if (!user) return false
    return user.roles?.includes(role) || user.role === role || false
  }, [user])

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false
    if (user.roles?.includes('ROLE_ADMIN') || user.role === 'ROLE_ADMIN') return true
    if (user.roles?.includes('ROLE_CLINIC_OWNER') || user.role === 'ROLE_CLINIC_OWNER') return true

    return user.permissions?.includes(permission) || user.roles?.includes(permission) || false
  }, [user])

  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    if (!user) return false
    if (user.roles?.includes('ROLE_ADMIN') || user.role === 'ROLE_ADMIN') return true
    if (user.roles?.includes('ROLE_CLINIC_OWNER') || user.role === 'ROLE_CLINIC_OWNER') return true

    return permissions.some(p => user.permissions?.includes(p) || user.roles?.includes(p))
  }, [user])

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      loading, 
      user, 
      profileImage, 
      login, 
      register, 
      logout, 
      updateProfileImage, 
      updateUser,
      hasRole,
      hasPermission,
      hasAnyPermission
    }}>
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
