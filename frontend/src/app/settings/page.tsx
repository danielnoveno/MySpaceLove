'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Bell, Mail, Globe, Shield, LogOut } from 'lucide-react'
import LoadingSpinner from '@/components/LoadingSpinner'

type UserSettings = {
  email_notifications: boolean
  push_notifications: boolean
  weekly_digest: boolean
  language: string
}

const defaultSettings: UserSettings = {
  email_notifications: true,
  push_notifications: true,
  weekly_digest: false,
  language: 'id',
}

export default function SettingsPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)
  const supabase = createClient()

  const fetchSettings = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('users')
      .select('settings')
      .eq('id', user.id)
      .single()

    if (data?.settings) {
      setSettings({ ...defaultSettings, ...data.settings })
    }
    setLoading(false)
  }, [supabase, user])

  useEffect(() => {
    if (!authLoading && !user) { router.push('/auth/login'); return }
    if (user) {
      const timeout = setTimeout(fetchSettings, 0)
      return () => clearTimeout(timeout)
    }
  }, [user, authLoading, router, fetchSettings])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setMessage({ type: '', text: '' })

    const { error } = await supabase
      .from('users')
      .upsert({ id: user.id, settings }, { onConflict: 'id' })

    if (error) {
      setMessage({ type: 'error', text: 'Gagal menyimpan pengaturan' })
    } else {
      setMessage({ type: 'success', text: 'Pengaturan tersimpan!' })
    }
    setSaving(false)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  const toggleSetting = (key: keyof UserSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: typeof prev[key] === 'boolean' ? !prev[key] : prev[key]
    }))
  }

  if (authLoading || loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Memuat pengaturan..." />
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout header={
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="p-2 rounded-full hover:bg-brand-50 text-warm-600 hover:text-brand-600 transition-colors" aria-label="Back to dashboard">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-warm-900">Pengaturan</h1>
          <p className="text-warm-500">Kelola notifikasi dan preferensi akun Anda</p>
        </div>
      </div>
    }>
      <div className="max-w-2xl mx-auto space-y-6">
        {message.text && (
          <div role="alert" className={`rounded-2xl px-4 py-3 text-sm ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
            {message.text}
          </div>
        )}

        {/* Notification Settings */}
        <div className="rounded-[2rem] bg-white border border-warm-100 p-6 sm:p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-warm-900">Notifikasi</h2>
              <p className="text-sm text-warm-500">Atur cara Anda menerima pemberitahuan</p>
            </div>
          </div>

          <div className="space-y-4">
            <ToggleRow
              icon={<Mail className="h-4 w-4" />}
              label="Notifikasi Email"
              description="Terima email saat ada aktivitas di space Anda"
              enabled={settings.email_notifications}
              onToggle={() => toggleSetting('email_notifications')}
            />
            <ToggleRow
              icon={<Bell className="h-4 w-4" />}
              label="Notifikasi Push"
              description="Notifikasi langsung di browser Anda"
              enabled={settings.push_notifications}
              onToggle={() => toggleSetting('push_notifications')}
            />
            <ToggleRow
              icon={<Globe className="h-4 w-4" />}
              label="Ringkasan Mingguan"
              description="Ringkasan aktivitas space dikirim setiap minggu"
              enabled={settings.weekly_digest}
              onToggle={() => toggleSetting('weekly_digest')}
            />
          </div>
        </div>

        {/* Language Settings */}
        <div className="rounded-[2rem] bg-white border border-warm-100 p-6 sm:p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-warm-900">Bahasa</h2>
              <p className="text-sm text-warm-500">Pilih bahasa tampilan aplikasi</p>
            </div>
          </div>

          <select
            value={settings.language}
            onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
            className="w-full rounded-2xl border border-warm-200 bg-warm-50/50 px-4 py-3 text-sm text-warm-900 transition-all focus:border-brand-300 focus:bg-white focus:ring-2 focus:ring-brand-100/50"
          >
            <option value="id">Bahasa Indonesia</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-3.5 text-sm font-semibold text-white transition-all hover:from-brand-600 hover:to-brand-700 hover:shadow-lg hover:shadow-brand-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-50 active:scale-[0.98]"
        >
          {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>

        {/* Account Section */}
        <div className="rounded-[2rem] bg-white border border-warm-100 p-6 sm:p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-warm-900">Akun</h2>
              <p className="text-sm text-warm-500">Kelola akun dan keamanan</p>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href="/profile"
              className="flex items-center justify-between rounded-2xl border border-warm-200 bg-warm-50/50 px-4 py-3.5 text-sm text-warm-700 transition-all hover:border-warm-300 hover:bg-warm-50"
            >
              <span>Edit Profile & Password</span>
              <span className="text-warm-400">&rarr;</span>
            </Link>

            {!showSignOutConfirm ? (
              <button
                onClick={() => setShowSignOutConfirm(true)}
                className="flex w-full items-center gap-2 rounded-2xl border border-red-200 bg-red-50/50 px-4 py-3.5 text-sm font-medium text-red-600 transition-all hover:border-red-300 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Keluar dari Akun
              </button>
            ) : (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 space-y-3">
                <p className="text-sm text-red-600">Yakin ingin keluar?</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleSignOut}
                    className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
                  >
                    Ya, Keluar
                  </button>
                  <button
                    onClick={() => setShowSignOutConfirm(false)}
                    className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-warm-700 border border-warm-200 transition hover:bg-warm-50"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}

function ToggleRow({
  icon,
  label,
  description,
  enabled,
  onToggle,
}: {
  icon: React.ReactNode
  label: string
  description: string
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-warm-100 bg-warm-50/30 px-4 py-4">
      <div className="flex items-center gap-3 min-w-0">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-warm-500 border border-warm-100">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-warm-800">{label}</p>
          <p className="text-xs text-warm-500 truncate">{description}</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
          enabled ? 'bg-brand-500' : 'bg-warm-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}
