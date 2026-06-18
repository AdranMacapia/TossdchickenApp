import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { PrivateRoute } from './components/PrivateRoute'

const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const Dashboard = lazy(() => import('./pages/reports/Dashboard'))
const OrderScreen = lazy(() => import('./pages/pos/OrderScreen'))
const Receipt = lazy(() => import('./pages/pos/Receipt'))

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<div className="min-h-screen bg-brand-bg" />}>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Owner-only */}
            <Route
              path="/reports/dashboard"
              element={
                <PrivateRoute role="owner">
                  <Dashboard />
                </PrivateRoute>
              }
            />

            {/* POS — accessible to owner and cashier */}
            <Route
              path="/pos"
              element={
                <PrivateRoute role={['owner', 'cashier']}>
                  <CartProvider>
                    <OrderScreen />
                  </CartProvider>
                </PrivateRoute>
              }
            />
            <Route
              path="/pos/receipt/:orderId"
              element={
                <PrivateRoute role={['owner', 'cashier']}>
                  <Receipt />
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
