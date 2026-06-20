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
const Categories = lazy(() => import('./pages/menu/Categories'))
const MenuItems = lazy(() => import('./pages/menu/MenuItems'))
const Flavors = lazy(() => import('./pages/menu/Flavors'))
const Ingredients = lazy(() => import('./pages/menu/Ingredients'))
const RecipeEditor = lazy(() => import('./pages/inventory/RecipeEditor'))
const CostingSheet = lazy(() => import('./pages/costing/CostingSheet'))

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
            <Route
              path="/menu/categories"
              element={
                <PrivateRoute role="owner">
                  <Categories />
                </PrivateRoute>
              }
            />
            <Route
              path="/menu/items"
              element={
                <PrivateRoute role="owner">
                  <MenuItems />
                </PrivateRoute>
              }
            />
            <Route
              path="/menu/items/:itemId/flavors"
              element={
                <PrivateRoute role="owner">
                  <Flavors />
                </PrivateRoute>
              }
            />
            <Route
              path="/inventory/ingredients"
              element={
                <PrivateRoute role="owner">
                  <Ingredients />
                </PrivateRoute>
              }
            />
            <Route
              path="/inventory/recipes/:itemId"
              element={
                <PrivateRoute role="owner">
                  <RecipeEditor />
                </PrivateRoute>
              }
            />
            <Route
              path="/costing"
              element={
                <PrivateRoute role="owner">
                  <CostingSheet />
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
