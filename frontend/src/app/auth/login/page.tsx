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
        title: 'Selamat datang kembali di ruang berbagi Anda.',
        subtitle: 'Masuk untuk melanjutkan perjalanan Anda bersama.',
        features: [
          'Lanjutkan dari mana Anda dan pasangan berhenti.',
          'Periksa pesan, memori, dan kejutan baru.',
          'Pertahankan ruang berbagi Anda tetap hidup dan terhubung.',
        ],
      }}
    >
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-warm-900 tracking-tight">
            Selamat datang kembali
          </h1>
          <p className="text-sm text-warm-500 leading-relaxed">
            Masuk untuk melanjutkan perjalanan Anda bersama.
          </p>
        </div>

        {error && (
          <div id="login-error" role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Google Sign In */}
        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-warm-200 bg-white px-4 py-3.5 text-sm font-medium text-warm-700 transition-all hover:border-warm-300 hover:bg-warm-50 hover:shadow-sm active:scale-[0.98]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Masuk dengan Google
          </button>

          <div className="relative flex items-center justify-center">
            <span className="h-px w-full bg-warm-100" aria-hidden="true" />
            <span className="absolute bg-white px-4 text-xs font-medium uppercase tracking-widest text-warm-400">
              atau
            </span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-warm-700">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-warm-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-warm-200 bg-warm-50/50 pl-11 pr-4 py-3 text-sm text-warm-900 transition-all placeholder:text-warm-400 focus:border-brand-300 focus:bg-white focus:ring-2 focus:ring-brand-100/50"
                placeholder="email@anda.com"
                autoComplete="username"
                required
                aria-describedby={error ? 'login-error' : undefined}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-warm-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-warm-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-warm-200 bg-warm-50/50 pl-11 pr-12 py-3 text-sm text-warm-900 transition-all placeholder:text-warm-400 focus:border-brand-300 focus:bg-white focus:ring-2 focus:ring-brand-100/50"
                placeholder="Masukkan password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600 transition-colors"
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-warm-600 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="rounded-lg border-warm-300 text-brand-500 focus:ring-brand-400"
              />
              <span>Ingat saya</span>
            </label>

            <Link
              href="/auth/forgot-password"
              className="font-medium text-brand-500 hover:text-brand-600 transition-colors"
            >
              Lupa password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full justify-center rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-3.5 text-sm font-semibold text-white transition-all hover:from-brand-600 hover:to-brand-700 hover:shadow-lg hover:shadow-brand-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Masuk...
              </span>
            ) : (
              'Masuk'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-warm-500">
          Belum punya akun?{' '}
          <Link
            href="/auth/register"
            className="font-semibold text-brand-500 hover:text-brand-600 transition-colors"
          >
            Buat akun
          </Link>
        </p>
      </div>
    </GuestLayout>
  )
}
