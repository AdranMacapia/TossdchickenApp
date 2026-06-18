import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { PrivateRoute } from './PrivateRoute'

function makeAuth(overrides: Partial<Parameters<typeof AuthContext.Provider>[0]['value']>) {
  return {
    session: null,
    user: null,
    role: null as 'owner' | 'cashier' | null,
    loading: false,
    signIn: async () => ({ error: null }),
    signOut: async () => {},
    ...overrides,
  }
}

function renderWithRouter(authValue: ReturnType<typeof makeAuth>, allowedRole: 'owner' | 'cashier') {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/pos" element={<div>POS Page</div>} />
          <Route path="/reports/dashboard" element={<div>Dashboard Page</div>} />
          <Route
            path="/protected"
            element={
              <PrivateRoute role={allowedRole}>
                <div>Protected Content</div>
              </PrivateRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

describe('PrivateRoute', () => {
  it('redirects unauthenticated user to /login', () => {
    renderWithRouter(makeAuth({ role: null }), 'owner')
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('redirects cashier trying to access owner route to /pos', () => {
    renderWithRouter(
      makeAuth({ role: 'cashier', session: { user: {} } as any }),
      'owner'
    )
    expect(screen.getByText('POS Page')).toBeInTheDocument()
  })

  it('renders content when role matches', () => {
    renderWithRouter(
      makeAuth({ role: 'owner', session: { user: {} } as any }),
      'owner'
    )
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('renders cashier content when cashier accesses cashier route', () => {
    renderWithRouter(
      makeAuth({ role: 'cashier', session: { user: {} } as any }),
      'cashier'
    )
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects owner trying to access cashier route to /reports/dashboard', () => {
    renderWithRouter(
      makeAuth({ role: 'owner', session: { user: {} } as any }),
      'cashier'
    )
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
  })
})
