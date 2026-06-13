import React from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface RequirePermissionProps {
  permissions?: string[]
  roles?: string[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

const RequirePermission: React.FC<RequirePermissionProps> = ({ 
  permissions, 
  roles, 
  children, 
  fallback = null 
}) => {
  const { hasAnyPermission, hasRole } = useAuth()

  let hasAccess = true

  if (permissions && permissions.length > 0) {
    hasAccess = hasAccess && hasAnyPermission(permissions)
  }

  if (roles && roles.length > 0) {
    hasAccess = hasAccess && roles.some(role => hasRole(role))
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>
}

export default RequirePermission
