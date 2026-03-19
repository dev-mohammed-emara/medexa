import useLenis from '@/hooks/useLenis'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import { ToastContainer } from './components/ui/Toast'

import Dashboard from './pages/Dashboard'
import Doctors from './pages/Doctors'
import Secretary from './pages/Secretary'
import NotFound from './pages/NotFound'
import ServerError from './pages/ServerError'
import SessionExpired from './pages/SessionExpired'
import { PreloaderProvider } from './contexts/PreloaderContext'
import Preloader from './components/transition/Preloader'
import ErrorRoute from './components/auth/ErrorRoute'

const App = () => {
  useLenis()
  return (
    <PreloaderProvider>
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
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </PreloaderProvider>
  )
}

export default App
