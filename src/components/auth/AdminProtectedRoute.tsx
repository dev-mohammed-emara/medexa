import React from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import AdminForbidden from '../../pages/admin/AdminForbidden'


const AdminProtectedRoute: React.FC = () => {
  const token = localStorage.getItem('admin_token')
  const location = useLocation()

  if (!token) {
    if (location.pathname === '/admin' || location.pathname === '/admin/') {
      return <Navigate to="/admin/login" replace />
    }
    return <AdminForbidden />
  }

  return <Outlet />
}

export default AdminProtectedRoute
