import React, { createContext, useContext, useState, useEffect } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  profileImage: string | null
  login: () => void
  logout: () => void
  updateProfileImage: (image: string | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isLoggedIn') === 'true'
  })

  // Cross-tab Synchronization
  useEffect(() => {
    const channel = new BroadcastChannel('medexa_sync');
    channel.onmessage = (event) => {
      if (event.data.type === 'AUTH_UPDATE') {
        setIsAuthenticated(event.data.isAuthenticated);
      }
    };
    return () => channel.close();
  }, []);

  const login = () => {
    setIsAuthenticated(true)
    localStorage.setItem('isLoggedIn', 'true')
    const channel = new BroadcastChannel('medexa_sync');
    channel.postMessage({ type: 'AUTH_UPDATE', isAuthenticated: true });
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('isLoggedIn')
    const channel = new BroadcastChannel('medexa_sync');
    channel.postMessage({ type: 'AUTH_UPDATE', isAuthenticated: false });
  }

  const updateProfileImage = (image: string | null) => {
    setProfileImage(image)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, profileImage, login, logout, updateProfileImage }}>
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
