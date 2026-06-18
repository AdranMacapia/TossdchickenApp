import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface Props {
  role: 'owner' | 'cashier'
  children: ReactNode
}

export function PrivateRoute({ role, children }: Props) {
  const { session, role: userRole, loading } = useAuth()

  if (loading) return null

  if (!session) return <Navigate to="/login" replace />

  if (userRole !== role) {
    return <Navigate to={userRole === 'cashier' ? '/pos' : '/reports/dashboard'} replace />
  }

  return <>{children}</>
}
