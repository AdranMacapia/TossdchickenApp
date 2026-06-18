import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AuthProvider } from './context/AuthContext'
import { PrivateRoute } from './components/PrivateRoute'

const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const Dashboard = lazy(() => import('./pages/reports/Dashboard'))
const OrderScreen = lazy(() => import('./pages/pos/OrderScreen'))

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<div className="min-h-screen bg-brand-bg" />}>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Owner routes */}
            <Route
              path="/reports/dashboard"
              element={
                <PrivateRoute role="owner">
                  <Dashboard />
                </PrivateRoute>
              }
            />

            {/* Cashier routes */}
            <Route
              path="/pos"
              element={
                <PrivateRoute role="cashier">
                  <OrderScreen />
                </PrivateRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}
