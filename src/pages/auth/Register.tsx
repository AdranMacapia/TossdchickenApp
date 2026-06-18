import { FormEvent, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: 'owner' },
      },
    })

    setSubmitting(false)

    if (error) {
      setError(error.message)
      return
    }

    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="bg-white rounded-card shadow-md w-full max-w-sm p-8">
        <h1 className="text-2xl font-bold text-brand-text mb-1">
          Create Owner Account
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          One owner account per store
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-text mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-text mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-primary text-white rounded-btn py-2 text-sm font-semibold disabled:opacity-50"
          >
            {submitting ? 'Creating…' : 'Create Account'}
          </button>
        </form>

        <p className="text-xs text-center text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-primary font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
