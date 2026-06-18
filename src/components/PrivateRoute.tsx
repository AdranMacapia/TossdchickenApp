import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type Role = 'owner' | 'cashier'

interface Props {
  role: Role | ReadonlyArray<Role>
  children: ReactNode
}

export function PrivateRoute({ role, children }: Props) {
  const { session, role: userRole, loading } = useAuth()

  if (loading) return null
  if (!session) return <Navigate to="/login" replace />

  const allowed = Array.isArray(role)
    ? userRole !== null && role.includes(userRole)
    : userRole === role

  if (!allowed) {
    return <Navigate to={userRole === 'cashier' ? '/pos' : '/reports/dashboard'} replace />
  }

  return <>{children}</>
}
