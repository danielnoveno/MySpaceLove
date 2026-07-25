'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import ApplicationLogo from '@/components/ApplicationLogo'
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50 p-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-500 mb-6">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
          <p className="text-gray-600 mb-8">
            We sent a password reset link to <strong>{email}</strong>
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <ApplicationLogo className="h-10 w-10 fill-current text-pink-500" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
          <p className="text-gray-600 mt-2">Enter your email and we&apos;ll send you a reset link</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-white/70 p-8 space-y-6">
          {error && (
            <div id="forgot-error" role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-rose-100 bg-white/70 pl-10 pr-4 py-3 text-sm text-gray-900 shadow-sm focus:border-pink-400 focus:ring-pink-400"
                placeholder="you@example.com"
                aria-describedby={error ? 'forgot-error' : undefined}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-pink-500 py-3 text-sm font-semibold text-white hover:bg-pink-600 focus:ring-2 focus:ring-pink-200 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Send reset link
          </button>

          <Link
            href="/auth/login"
            className="block text-center text-sm text-pink-600 hover:text-pink-700 font-medium"
          >
            <ArrowLeft className="h-4 w-4 inline mr-1" />
            Back to login
          </Link>
        </form>
      </div>
    </div>
  )
}
