import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useContext } from 'react'
import { AuthContext, AuthProvider } from './AuthContext'

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
  },
}))

function TestConsumer() {
  const ctx = useContext(AuthContext)
  return (
    <div>
      <span data-testid="role">{ctx.role ?? 'none'}</span>
      <span data-testid="loading">{ctx.loading ? 'loading' : 'ready'}</span>
    </div>
  )
}

describe('AuthContext', () => {
  it('starts loading then resolves to no session', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )
    await waitFor(() =>
      expect(screen.getByTestId('loading')).toHaveTextContent('ready')
    )
    expect(screen.getByTestId('role')).toHaveTextContent('none')
  })

  it('extracts owner role from user metadata', async () => {
    const { supabase } = await import('../lib/supabase')
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: {
        session: {
          user: {
            id: 'uid-1',
            user_metadata: { role: 'owner' },
          },
        } as any,
      },
      error: null,
    })

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('role')).toHaveTextContent('owner')
    )
  })

  it('extracts cashier role from user metadata', async () => {
    const { supabase } = await import('../lib/supabase')
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: {
        session: {
          user: {
            id: 'uid-2',
            user_metadata: { role: 'cashier' },
          },
        } as any,
      },
      error: null,
    })

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('role')).toHaveTextContent('cashier')
    )
  })
})
