'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import GuestLayout from '@/layouts/GuestLayout'
import { useAuth } from '@/contexts/AuthContext'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signInWithGoogle } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: signInError } = await signIn(email, password)
    if (signInError) {
      setError(signInError)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const handleGoogleSignIn = async () => {
    await signInWithGoogle()
  }

  return (
    <GuestLayout
      hero={{
        badge: 'MySpaceLove',
        title: 'Welcome back to your shared space.',
        subtitle: 'Sign in to continue your journey together.',
        features: [
          'Pick up where you left off with your partner.',
          'Check new messages, memories, and surprises.',
          'Keep your shared space alive and connected.',
        ],
      }}
    >
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold text-gray-900">
            Welcome back
          </h1>
          <p className="text-sm text-gray-600">
            Sign in to continue your shared journey together.
          </p>
        </div>

        {error && (
          <div id="login-error" role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Google Sign In */}
        <div className="space-y-6">
          <button
            onClick={handleGoogleSignIn}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-rose-200 bg-white/90 px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 focus-visible:ring-offset-2"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </button>

          <div className="relative flex items-center justify-center">
            <span className="h-px w-full bg-rose-100" aria-hidden="true" />
            <span className="absolute bg-white px-4 text-xs font-semibold uppercase tracking-[0.3em] text-rose-300">
              Email login
            </span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2 text-left">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-rose-100 bg-white/70 pl-10 pr-4 py-3 text-sm text-gray-900 shadow-sm focus:border-pink-400 focus:ring-pink-400"
                autoComplete="username"
                required
                aria-describedby={error ? 'login-error' : undefined}
              />
            </div>
          </div>

          <div className="space-y-2 text-left">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-rose-100 bg-white/70 pl-10 pr-12 py-3 text-sm text-gray-900 shadow-sm focus:border-pink-400 focus:ring-pink-400"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="rounded border-gray-300 text-pink-500 focus:ring-pink-400"
              />
              <span>Remember me</span>
            </label>

            <Link
              href="/auth/forgot-password"
              className="font-semibold text-pink-500 transition hover:text-pink-400"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full justify-center rounded-full bg-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/register"
            className="font-semibold text-pink-500 transition hover:text-pink-400"
          >
            Create one
          </Link>
        </p>
      </div>
    </GuestLayout>
  )
}
