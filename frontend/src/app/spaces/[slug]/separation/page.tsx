'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Heart,
  User,
  FileText,
  CheckCircle2,
  XCircle,
  Shield,
  Archive,
} from 'lucide-react'

type Space = {
  id: string
  name: string
  slug: string
  partner_email: string | null
}

const REASONS = [
  'Growing apart',
  'Different life goals',
  'Communication issues',
  'Trust issues',
  'Long distance not working',
  'Personal growth needed',
  'Other',
]

export default function SeparationPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [space, setSpace] = useState<Space | null>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<'info' | 'confirm' | 'done'>('info')
  const [reason, setReason] = useState('')
  const [otherReason, setOtherReason] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }
    if (user && slug) {
      ;(async () => {
        setLoading(true)

        const { data: spaceData } = await supabase
          .from('spaces')
          .select('id, name, slug, partner_email')
          .eq('slug', slug)
          .single()

        setSpace(spaceData)
        setLoading(false)
      })()
    }
  }, [user, authLoading, router, slug, supabase])

  const handleRequestSeparation = useCallback(async () => {
    if (!space || !user) return
    if (!reason) {
      setError('Please select a reason.')
      return
    }
    if (reason === 'Other' && !otherReason.trim()) {
      setError('Please describe your reason.')
      return
    }
    if (confirmText !== 'SEPARATE') {
      setError('Please type SEPARATE to confirm.')
      return
    }

    setSubmitting(true)
    setError('')

    const { error: updateError } = await supabase
      .from('spaces')
      .update({
        status: 'separated',
        separated_at: new Date().toISOString(),
        separation_reason: reason === 'Other' ? otherReason.trim() : reason,
        separated_by: user.id,
      })
      .eq('id', space.id)

    if (updateError) {
      setError('Failed to process separation. Please try again.')
      setSubmitting(false)
      return
    }

    setStep('done')
    setSubmitting(false)
  }, [space, user, reason, otherReason, confirmText, supabase])

  if (authLoading || loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 text-pink-500 animate-spin" />
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center gap-4">
          <Link
            href={`/spaces/${slug}`}
            className="p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Separation Request
            </h1>
            <p className="text-gray-600">
              We&apos;re sorry to see this. Take your time.
            </p>
          </div>
        </div>
      }
    >
      <div className="max-w-2xl mx-auto">
        {/* Step: Info */}
        {step === 'info' && (
          <div className="space-y-6">
            {/* Current Partner Info */}
            <div className="rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="h-5 w-5 text-pink-500" />
                <h3 className="font-semibold text-gray-900">
                  Current Partner
                </h3>
              </div>
              <div className="flex items-center gap-4 p-4 bg-pink-50 rounded-2xl">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-pink-300 to-purple-300 flex items-center justify-center text-lg font-bold text-white">
                  <User className="h-7 w-7" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {space?.partner_email || 'No partner linked'}
                  </p>
                  <p className="text-sm text-gray-500">{space?.name}</p>
                </div>
              </div>
            </div>

            {/* Effects of Separation */}
            <div className="rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h3 className="font-semibold text-gray-900">
                  What Happens When You Separate
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                  <Archive className="h-5 w-5 text-gray-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Data Archival
                    </p>
                    <p className="text-sm text-gray-500">
                      Your shared space data (timeline, gallery, messages) will
                      be archived and accessible for 30 days.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                  <Shield className="h-5 w-5 text-gray-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Partner Access Removed
                    </p>
                    <p className="text-sm text-gray-500">
                      Your partner will no longer have access to this shared
                      space.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                  <FileText className="h-5 w-5 text-gray-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Personal Data
                    </p>
                    <p className="text-sm text-gray-500">
                      Your personal data and account remain intact. You can
                      create a new space anytime.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reason Selection */}
            <div className="rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Reason for separation
              </label>
              <div className="space-y-2">
                {REASONS.map((r) => (
                  <label
                    key={r}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                      reason === r
                        ? 'bg-pink-50 ring-2 ring-pink-500'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={r}
                      checked={reason === r}
                      onChange={(e) => setReason(e.target.value)}
                      className="h-4 w-4 text-pink-500 focus:ring-pink-400 border-gray-300"
                    />
                    <span className="text-sm text-gray-700">{r}</span>
                  </label>
                ))}
              </div>
              {reason === 'Other' && (
                <textarea
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  rows={3}
                  placeholder="Please describe..."
                  className="mt-3 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all resize-none"
                />
              )}
            </div>

            {error && (
              <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <Link
                href={`/spaces/${slug}`}
                className="rounded-xl px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </Link>
              <button
                onClick={() => {
                  if (!reason) {
                    setError('Please select a reason.')
                    return
                  }
                  setError('')
                  setStep('confirm')
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-600"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step: Confirm */}
        {step === 'confirm' && (
          <div className="space-y-6">
            <div className="rounded-3xl bg-red-50/80 backdrop-blur shadow-sm border border-red-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-500" />
                <h3 className="text-lg font-bold text-red-700">
                  Final Confirmation
                </h3>
              </div>
              <p className="text-sm text-red-600 mb-4">
                This action will separate you from your partner in this space.
                Shared data will be archived for 30 days.
              </p>
              <p className="text-sm text-red-600 mb-4">
                To confirm, please type <strong>SEPARATE</strong> below:
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type SEPARATE"
                className="w-full rounded-xl border border-red-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
              />
            </div>

            {error && (
              <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setStep('info')
                  setConfirmText('')
                  setError('')
                }}
                className="rounded-xl px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={handleRequestSeparation}
                disabled={submitting || confirmText !== 'SEPARATE'}
                className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    Confirm Separation
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step: Done */}
        {step === 'done' && (
          <div className="text-center py-16">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 mb-6">
              <CheckCircle2 className="h-10 w-10 text-gray-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Space Separated
            </h2>
            <p className="text-gray-600 mb-2 max-w-md mx-auto">
              Your shared space has been separated. Your data has been archived
              and will be available for 30 days.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              We hope you find happiness. You can always create a new space
              when you&apos;re ready.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-pink-500 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-pink-600"
            >
              Go to Dashboard
            </Link>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  )
}
