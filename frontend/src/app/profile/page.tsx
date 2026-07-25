'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { User, Mail, Lock, Upload, Trash2, Copy, Check, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [partnerCode, setPartnerCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }
    if (user) fetchProfile()
  }, [user, authLoading])

  const fetchProfile = async () => {
    if (!user) return

    setEmail(user.email || '')
    setName(user.user_metadata?.name || '')

    // Fetch partner code from users table
    const { data: profileData } = await supabase
      .from('users')
      .select('partner_code')
      .eq('id', user.id)
      .single()

    if (profileData?.partner_code) {
      setPartnerCode(profileData.partner_code)
    } else {
      // Fallback: generate from user ID
      setPartnerCode(user.id.slice(0, 8).toUpperCase())
    }

    setLoading(false)
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setMessage({ type: '', text: '' })

    const { error } = await supabase.auth.updateUser({
      data: { name },
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    }
    setSaving(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }
    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }

    setSavingPassword(true)
    setMessage({ type: '', text: '' })

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Password changed successfully!' })
      setPassword('')
      setConfirmPassword('')
    }
    setSavingPassword(false)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setUploading(true)
    setMessage({ type: '', text: '' })

    const fileExt = file.name.split('.').pop()
    const filePath = `avatars/${user.id}.${fileExt}`

    const { error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      await supabase.auth.updateUser({ data: { avatar_url: data.publicUrl } })
      setMessage({ type: 'success', text: 'Avatar updated!' })
    }
    setUploading(false)
  }

  const handleDeleteAccount = async () => {
    // Note: Supabase doesn't have a direct delete user function from client.
    // This would need a server-side function.
    setMessage({ type: 'error', text: 'Account deletion requires contacting support.' })
    setShowDeleteConfirm(false)
  }

  const copyPartnerCode = () => {
    navigator.clipboard.writeText(partnerCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (authLoading || loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading profile..." />
        </div>
      </AuthenticatedLayout>
    )
  }

  const avatarUrl = user?.user_metadata?.avatar_url

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-full hover:bg-pink-50 text-gray-600 hover:text-pink-600 transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600">Manage your account settings</p>
          </div>
        </div>
      }
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Status Message */}
        {message.text && (
          <div
            role="alert"
            className={`rounded-xl px-4 py-3 text-sm ${
              message.type === 'error'
                ? 'bg-red-50 text-red-700 border border-red-100'
                : 'bg-green-50 text-green-700 border border-green-100'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Avatar Section */}
        <div className="rounded-3xl bg-white/80 backdrop-blur p-6 shadow-sm border border-white/70">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Photo</h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()
                )}
              </div>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 rounded-full bg-pink-50 px-4 py-2 text-sm font-medium text-pink-600 hover:bg-pink-100 transition-colors disabled:opacity-50"
                aria-label={uploading ? 'Uploading avatar' : 'Change profile photo'}
              >
                <Upload className="h-4 w-4" />
                {uploading ? 'Uploading...' : 'Change Photo'}
              </button>
            </div>
          </div>
        </div>

        {/* Edit Profile */}
        <div className="rounded-3xl bg-white/80 backdrop-blur p-6 shadow-sm border border-white/70">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-pink-100 bg-pink-50/50 py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                  placeholder="Your name"
                  aria-describedby={message.type === 'error' ? 'profile-message' : undefined}
                />
              </div>
            </div>
            <div>
              <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="profile-email"
                  type="email"
                  value={email}
                  disabled
                  className="w-full rounded-xl border border-pink-100 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-500 cursor-not-allowed"
                  aria-describedby="email-disabled-hint"
                />
              </div>
              <p id="email-disabled-hint" className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="rounded-3xl bg-white/80 backdrop-blur p-6 shadow-sm border border-white/70">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-pink-100 bg-pink-50/50 py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                  placeholder="New password"
                  aria-describedby={message.type === 'error' ? 'profile-message' : undefined}
                />
              </div>
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-pink-100 bg-pink-50/50 py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                  placeholder="Confirm password"
                  aria-describedby={message.type === 'error' ? 'profile-message' : undefined}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={savingPassword}
              className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-50"
            >
              {savingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* Partner Code */}
        <div className="rounded-3xl bg-white/80 backdrop-blur p-6 shadow-sm border border-white/70">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Partner Code</h2>
          <p className="text-sm text-gray-600 mb-3">
            Share this code with your partner to connect your spaces.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 rounded-xl border border-pink-100 bg-pink-50/50 px-4 py-3 text-lg font-mono font-bold text-pink-600 tracking-wider">
              {partnerCode}
            </div>
            <button
              onClick={copyPartnerCode}
              className="flex items-center gap-2 rounded-xl bg-pink-50 px-4 py-3 text-sm font-medium text-pink-600 hover:bg-pink-100 transition-colors"
              aria-label={copied ? 'Copied partner code' : 'Copy partner code to clipboard'}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-3xl bg-red-50/50 backdrop-blur p-6 shadow-sm border border-red-100">
          <h2 className="text-lg font-semibold text-red-700 mb-4">Danger Zone</h2>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-600"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-red-600">
                This action is irreversible. All your data will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
