import useLenis from '@/hooks/useLenis'
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { ToastContainer } from './components/ui/Toast'
import { AuthProvider } from './contexts/AuthContext'
import { SidebarProvider } from './contexts/SidebarContext'
import Login from './pages/Login'
import Register from './pages/Register'

import AdminProtectedRoute from './components/auth/AdminProtectedRoute'
import ErrorRoute from './components/auth/ErrorRoute'
import ProtectedRoute from './components/auth/ProtectedRoute'
import RoleProtectedRoute from './components/auth/RoleProtectedRoute'
import Preloader from './components/transition/Preloader'
import { LanguageProvider } from './contexts/LanguageContext'
import { PreloaderProvider } from './contexts/PreloaderContext'
import AppointmentTypes from './pages/AppointmentTypes'
import Appointments from './pages/Appointments'
import Dashboard from './pages/Dashboard'
import Doctors from './pages/Doctors'
import Finance from './pages/Finance'
import NotFound from './pages/NotFound'
import Patients from './pages/Patients'
import Profile from './pages/Profile'
import Records from './pages/Records'
import Secretary from './pages/Secretary'
import ServerError from './pages/ServerError'
import SessionExpired from './pages/SessionExpired'
import SupportTickets from './pages/SupportTickets'
import AdminApprovals from './pages/admin/AdminApprovals'
import AdminClinicDetails from './pages/admin/AdminClinicDetails'
import AdminClinics from './pages/admin/AdminClinics'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminLogDetails from './pages/admin/AdminLogDetails'
import AdminLogin from './pages/admin/AdminLogin'
import AdminLogs from './pages/admin/AdminLogs'
import AdminManagers from './pages/admin/AdminManagers'
import AdminPatients from './pages/admin/AdminPatients'
import AdminSettings from './pages/admin/AdminSettings'
import AdminStats from './pages/admin/AdminStats'
import AdminTicketDetails from './pages/admin/AdminTicketDetails'
import AdminTickets from './pages/admin/AdminTickets'
import AdminUsers from './pages/admin/AdminUsers'



const AppRoutes = () => {
  return (
    <Router>
      <Preloader />
      <Routes>
        {/* Public Routes (routable even when authenticated) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Guarded Admin Routes */}
        <Route path="/admin" element={<AdminProtectedRoute />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="patients" element={<AdminPatients />} />
          <Route path="clinics">
            <Route index element={<AdminClinics />} />
            <Route path=":id" element={<AdminClinicDetails />} />
          </Route>
          <Route path="approvals" element={<AdminApprovals />} />
          <Route path="tickets">
            <Route index element={<AdminTickets />} />
            <Route path=":id" element={<AdminTicketDetails />} />
          </Route>
          <Route path="managers" element={<AdminManagers />} />
          <Route path="stats" element={<AdminStats />} />
          <Route path="audit-logs">
            <Route index element={<AdminLogs />} />
            <Route path=":id" element={<AdminLogDetails />} />
          </Route>
          <Route path="settings" element={<AdminSettings />} />
          <Route path="*" element={<ErrorRoute><NotFound /></ErrorRoute>} />
        </Route>

        {/* Guarded Application Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleProtectedRoute requiredPermissions={['MANAGE_STATISTICS', 'ROLE_CLINIC_OWNER', 'ROLE_ADMIN']} fallbackPath="/profile" />}>
            <Route index element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
          <Route element={<RoleProtectedRoute requiredPermissions={['MANAGE_DOCTORS', 'ROLE_CLINIC_OWNER', 'ROLE_ADMIN']} fallbackPath="/profile" />}>
            <Route path="/doctors" element={<Doctors />} />
          </Route>
          <Route element={<RoleProtectedRoute requiredPermissions={['MANAGE_SECRETARIES', 'ROLE_CLINIC_OWNER', 'ROLE_ADMIN']} />}>
            <Route path="/secretary" element={<Secretary />} />
          </Route>
          <Route element={<RoleProtectedRoute requiredPermissions={['MANAGE_PATIENTS', 'ROLE_CLINIC_OWNER', 'ROLE_ADMIN']} />}>
            <Route path="/patients" element={<Patients />} />
          </Route>
          <Route element={<RoleProtectedRoute requiredPermissions={['MANAGE_APPOINTMENTS', 'ROLE_CLINIC_OWNER', 'ROLE_ADMIN']} />}>
            <Route path="/appointments" element={<Appointments />} />
          </Route>
          <Route path="/appointment-types" element={<AppointmentTypes />} />
          <Route element={<RoleProtectedRoute requiredPermissions={['MANAGE_MEDICAL_RECORDS', 'MANAGE_PATIENTS', 'ROLE_CLINIC_OWNER', 'ROLE_ADMIN']} />}>
            <Route path="/records" element={<Records />} />
          </Route>
          <Route element={<RoleProtectedRoute requiredPermissions={['MANAGE_TRANSACTIONS', 'MANAGE_CLINIC', 'ROLE_CLINIC_OWNER', 'ROLE_ADMIN']} />}>
            <Route path="/finance" element={<Finance />} />
          </Route>
          <Route path="/profile" element={<Profile />} />
          <Route path="/support-tickets" element={<SupportTickets />} />
          <Route path="/500" element={<ServerError />} />
          <Route path="/419" element={<SessionExpired />} />
        </Route>

        {/* Catch-all route for 404 */}
        <Route path="*" element={<ErrorRoute><NotFound /></ErrorRoute>} />
      </Routes>
    </Router>
  )
}

const App = () => {
  useLenis()
  return (
    <LanguageProvider>
      <PreloaderProvider>
        <SidebarProvider>
          <AuthProvider>
            <ToastContainer />
            <AppRoutes />
          </AuthProvider>
        </SidebarProvider>
      </PreloaderProvider>
    </LanguageProvider>
  )
}

export default App
