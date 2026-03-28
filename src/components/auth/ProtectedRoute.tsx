import React from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import NotFound from '../../pages/NotFound'

interface ProtectedRouteProps {
  children?: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <NotFound />
  }

  return children ? <>{children}</> : <Outlet />
}

export default ProtectedRoute
