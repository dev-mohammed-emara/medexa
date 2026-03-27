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
import { PreloaderProvider } from './contexts/PreloaderContext'
import Appointments from './pages/Appointments'
import Dashboard from './pages/Dashboard'
import Doctors from './pages/Doctors'
import NotFound from './pages/NotFound'
import Patients from './pages/Patients'
import Secretary from './pages/Secretary'
import ServerError from './pages/ServerError'
import SessionExpired from './pages/SessionExpired'

const App = () => {
  useLenis()
  return (
    <PreloaderProvider>
      <SidebarProvider>
        <AuthProvider>
          <ToastContainer />
          <Router>
            <Preloader />
            <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Error Routes */}
            <Route
              path="/500"
              element={
                <ErrorRoute>
                  <ServerError />
                </ErrorRoute>
              }
            />
            <Route
              path="/419"
              element={
                <ErrorRoute>
                  <SessionExpired />
                </ErrorRoute>
              }
            />
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
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
      </SidebarProvider>
    </PreloaderProvider>
  )
}

export default App
