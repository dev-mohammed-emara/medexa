import useLenis from '@/hooks/useLenis'
import { Route, BrowserRouter as Router, Routes, Navigate } from 'react-router-dom'
// import ProtectedRoute from './components/auth/ProtectedRoute'
import { ToastContainer } from './components/ui/Toast'
import { AuthProvider } from './contexts/AuthContext'
import { SidebarProvider } from './contexts/SidebarContext'
import Login from './pages/Login'
import Register from './pages/Register'

import ErrorRoute from './components/auth/ErrorRoute'
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
import Settings from './pages/Settings'

const App = () => {
  useLenis()
  return (
    <LanguageProvider>
      <PreloaderProvider>
        <SidebarProvider>
          <AuthProvider>
            <ToastContainer />
            <Router>
              <Preloader />
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* All Application Routes (open, no auth required) */}
                <Route index element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/doctors" element={<Doctors />} />
                <Route path="/secretary" element={<Secretary />} />
                <Route path="/patients" element={<Patients />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/records" element={<Records />} />
                <Route path="/finance" element={<Finance />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />

                {/* System/Error Routes */}
                <Route path="/500" element={<ServerError />} />
                <Route path="/419" element={<SessionExpired />} />

                {/* --- COMMENTED OUT: Protected Route wrapper (for future use) ---
                <Route element={<ProtectedRoute />}>
                  <Route index element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/doctors" element={<Doctors />} />
                  <Route path="/secretary" element={<Secretary />} />
                  <Route path="/patients" element={<Patients />} />
                  <Route path="/appointments" element={<Appointments />} />
                  <Route path="/records" element={<Records />} />
                  <Route path="/finance" element={<Finance />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/500" element={<ServerError />} />
                  <Route path="/419" element={<SessionExpired />} />
                </Route>
                --- END COMMENTED OUT --- */}

                {/* Aliases for misspelled routes reported in production - preserved as redirects */}
                <Route path="/dcotros" element={<Navigate to="/doctors" replace />} />
                <Route path="/dctros" element={<Navigate to="/doctors" replace />} />
                <Route path="/secrates" element={<Navigate to="/secretary" replace />} />
                <Route path="/secraters" element={<Navigate to="/secretary" replace />} />

                {/* Catch-all route for 404 */}
                <Route path="*" element={<ErrorRoute><NotFound /></ErrorRoute>} />
              </Routes>
            </Router>
          </AuthProvider>
        </SidebarProvider>
      </PreloaderProvider>
    </LanguageProvider>
  )
}

export default App
