'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import ApplicationLogo from '@/components/ApplicationLogo'
import { FadeIn } from '@/components/motion'
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
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f6] p-4">
        <FadeIn>
          <div className="w-full max-w-md text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-500 mb-6">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-warm-900 mb-2 tracking-tight">Periksa email Anda</h1>
            <p className="text-warm-600 mb-8 leading-relaxed">
              Kami telah mengirimkan tautan reset password ke <strong className="text-warm-800">{email}</strong>
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-brand-500 hover:text-brand-600 font-semibold transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke masuk
            </Link>
          </div>
        </FadeIn>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf8f6] p-4">
      <FadeIn>
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <ApplicationLogo className="h-10 w-10 text-brand-500" />
            </Link>
            <h1 className="text-2xl font-bold text-warm-900 tracking-tight">Reset password Anda</h1>
            <p className="text-warm-500 mt-2 leading-relaxed">Masukkan email dan kami akan mengirimkan tautan reset</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] border border-warm-100 p-8 sm:p-10 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)] space-y-6">
            {error && (
              <div id="forgot-error" role="alert" className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">{error}</div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-warm-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-warm-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-warm-200 bg-warm-50/50 pl-11 pr-4 py-3 text-sm text-warm-900 transition-all placeholder:text-warm-400 focus:border-brand-300 focus:bg-white focus:ring-2 focus:ring-brand-100/50"
                  placeholder="email@anda.com"
                  aria-describedby={error ? 'forgot-error' : undefined}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 py-3.5 text-sm font-semibold text-white hover:from-brand-600 hover:to-brand-700 transition-all hover:shadow-lg hover:shadow-brand-500/20 focus:ring-2 focus:ring-brand-200 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Kirim tautan reset
            </button>

            <Link
              href="/auth/login"
              className="block text-center text-sm text-brand-500 hover:text-brand-600 font-semibold transition-colors"
            >
              <ArrowLeft className="h-4 w-4 inline mr-1" />
              Kembali ke masuk
            </Link>
          </form>
        </div>
      </FadeIn>
    </div>
  )
}
