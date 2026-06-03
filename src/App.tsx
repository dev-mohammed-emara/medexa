import useLenis from '@/hooks/useLenis'
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { ToastContainer } from './components/ui/Toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { SidebarProvider } from './contexts/SidebarContext'
import Login from './pages/Login'
import Register from './pages/Register'

import AdminProtectedRoute from './components/auth/AdminProtectedRoute'
import ErrorRoute from './components/auth/ErrorRoute'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Preloader from './components/transition/Preloader'
import { LanguageProvider } from './contexts/LanguageContext'
import { PreloaderProvider } from './contexts/PreloaderContext'
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

// Component to handle redirecting authenticated users away from auth pages
const PublicAuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

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
          <Route index element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/secretary" element={<Secretary />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/records" element={<Records />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/profile" element={<Profile />} />
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
