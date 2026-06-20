import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { BYPASS_AUTH_GUARDS } from '../../config/auth'

interface RoleProtectedRouteProps {
  children?: React.ReactNode
  requiredPermissions?: string[]
  requiredRoles?: string[]
  fallbackPath?: string
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ 
  children, 
  requiredPermissions, 
  requiredRoles,
  fallbackPath = '/'
}) => {
  const { hasAnyPermission, hasRole } = useAuth()

  let hasAccess = true

  if (requiredPermissions && requiredPermissions.length > 0) {
    hasAccess = hasAccess && hasAnyPermission(requiredPermissions)
  }

  if (requiredRoles && requiredRoles.length > 0) {
    // If requiredRoles is specified, user must have at least one of these roles
    hasAccess = hasAccess && requiredRoles.some(role => hasRole(role))
  }

  if (!hasAccess && !BYPASS_AUTH_GUARDS) {
    return <Navigate to={fallbackPath} replace />
  }

  return children ? <>{children}</> : <Outlet />
}

export default RoleProtectedRoute
