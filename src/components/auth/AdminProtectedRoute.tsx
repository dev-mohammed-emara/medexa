import React from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import AdminForbidden from '../../pages/admin/AdminForbidden'
import { BYPASS_AUTH_GUARDS } from '../../config/auth'

const AdminProtectedRoute: React.FC = () => {
  const token = localStorage.getItem('admin_token')
  const location = useLocation()

  if (!token && !BYPASS_AUTH_GUARDS) {
    if (location.pathname === '/admin' || location.pathname === '/admin/') {
      return <Navigate to="/admin/login" replace />
    }
    return <AdminForbidden />
  }

  return <Outlet />
}

export default AdminProtectedRoute
