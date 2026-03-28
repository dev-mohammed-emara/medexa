import useLenis from '@/hooks/useLenis'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import ProtectedRoute from './components/auth/ProtectedRoute'
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
                {/* ... existing routes ... */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Error Routes */}
                <Route
                  path="/500"
                  element={
                    <ProtectedRoute>
                      <ServerError />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/419"
                  element={
                    <ProtectedRoute>
                      <SessionExpired />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctors"
                  element={
                    <ProtectedRoute>
                      <Doctors />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/secretary"
                  element={
                    <ProtectedRoute>
                      <Secretary />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patients"
                  element={
                    <ProtectedRoute>
                      <Patients />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/appointments"
                  element={
                    <ProtectedRoute>
                      <Appointments />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/records"
                  element={
                    <ProtectedRoute>
                      <Records />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/finance"
                  element={
                    <ProtectedRoute>
                      <Finance />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

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
