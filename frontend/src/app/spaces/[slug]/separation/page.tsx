'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { FadeIn } from '@/components/motion'
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
  'Tumbuh terpisah',
  'Tujuan hidup berbeda',
  'Masalah komunikasi',
  'Masalah kepercayaan',
  'LDR tidak berhasil',
  'Butuh pertumbuhan pribadi',
  'Lainnya',
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
      setError('Pilih alasan pemisahan.')
      return
    }
    if (reason === 'Lainnya' && !otherReason.trim()) {
      setError('Jelaskan alasan Anda.')
      return
    }
    if (confirmText !== 'PISAH') {
      setError('Ketik PISAH untuk konfirmasi.')
      return
    }

    setSubmitting(true)
    setError('')

    const { error: updateError } = await supabase
      .from('spaces')
      .update({
        status: 'separated',
        separated_at: new Date().toISOString(),
        separation_reason: reason === 'Lainnya' ? otherReason.trim() : reason,
        separated_by: user.id,
      })
      .eq('id', space.id)

    if (updateError) {
      setError('Gagal memproses pemisahan. Silakan coba lagi.')
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
          <Loader2 className="h-12 w-12 text-brand-500 animate-spin" />
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout
      header={
        <FadeIn>
          <div className="flex items-center gap-4">
            <Link
              href={`/spaces/${slug}`}
              className="p-2 text-warm-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-warm-900">Permintaan Pemisahan</h1>
              <p className="text-warm-500">Kami turut prihatin. Ambil waktu Anda.</p>
            </div>
          </div>
        </FadeIn>
      }
    >
      <div className="max-w-2xl mx-auto">
        {/* Step: Info */}
        {step === 'info' && (
          <div className="space-y-6">
            <FadeIn delay={0.1}>
              <div className="rounded-3xl bg-white border border-warm-100 p-6 shadow-xl shadow-warm-900/5">
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="h-5 w-5 text-brand-500" />
                  <h3 className="font-semibold text-warm-900">Pasangan Saat Ini</h3>
                </div>
                <div className="flex items-center gap-4 p-4 bg-brand-50 rounded-2xl">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-brand-300 to-coral-300 flex items-center justify-center text-lg font-bold text-white">
                    <User className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="font-medium text-warm-900">{space?.partner_email || 'Tidak ada pasangan terhubung'}</p>
                    <p className="text-sm text-warm-500">{space?.name}</p>
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="rounded-3xl bg-white border border-warm-100 p-6 shadow-xl shadow-warm-900/5">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <h3 className="font-semibold text-warm-900">Yang Terjadi Saat Anda Berpisah</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-warm-50">
                    <Archive className="h-5 w-5 text-warm-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-warm-900">Arsip Data</p>
                      <p className="text-sm text-warm-500">Data ruang bersama Anda (timeline, galeri, pesan) akan diarsipkan dan dapat diakses selama 30 hari.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-warm-50">
                    <Shield className="h-5 w-5 text-warm-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-warm-900">Akses Pasangan Dihapus</p>
                      <p className="text-sm text-warm-500">Pasangan Anda tidak akan memiliki akses ke ruang bersama ini lagi.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-warm-50">
                    <FileText className="h-5 w-5 text-warm-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-warm-900">Data Pribadi</p>
                      <p className="text-sm text-warm-500">Data pribadi dan akun Anda tetap utuh. Anda dapat membuat ruang baru kapan saja.</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="rounded-3xl bg-white border border-warm-100 p-6 shadow-xl shadow-warm-900/5">
                <label className="block text-sm font-medium text-warm-700 mb-3">Alasan pemisahan</label>
                <div className="space-y-2">
                  {REASONS.map((r) => (
                    <label
                      key={r}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                        reason === r
                          ? 'bg-brand-50 ring-2 ring-brand-500'
                          : 'bg-warm-50 hover:bg-warm-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={r}
                        checked={reason === r}
                        onChange={(e) => setReason(e.target.value)}
                        className="h-4 w-4 text-brand-500 focus:ring-brand-400 border-warm-300"
                      />
                      <span className="text-sm text-warm-700">{r}</span>
                    </label>
                  ))}
                </div>
                {reason === 'Lainnya' && (
                  <textarea
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    rows={3}
                    placeholder="Jelaskan..."
                    className="mt-3 w-full rounded-2xl border border-warm-100 bg-warm-50 px-4 py-3 text-warm-900 placeholder-warm-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all resize-none"
                  />
                )}
              </div>
            </FadeIn>

            {error && (
              <div className="rounded-2xl bg-coral-50 border border-coral-200 px-4 py-3 text-sm text-coral-700">{error}</div>
            )}

            <div className="flex items-center justify-end gap-3">
              <Link
                href={`/spaces/${slug}`}
                className="rounded-xl px-6 py-3 text-sm font-medium text-warm-700 hover:bg-warm-50 transition-colors"
              >
                Batal
              </Link>
              <button
                onClick={() => {
                  if (!reason) {
                    setError('Pilih alasan pemisahan.')
                    return
                  }
                  setError('')
                  setStep('confirm')
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-coral-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-coral-600"
              >
                Lanjutkan
              </button>
            </div>
          </div>
        )}

        {/* Step: Confirm */}
        {step === 'confirm' && (
          <FadeIn delay={0.1}>
            <div className="space-y-6">
              <div className="rounded-3xl bg-coral-50 border border-coral-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-coral-500" />
                  <h3 className="text-lg font-bold text-coral-700">Konfirmasi Akhir</h3>
                </div>
                <p className="text-sm text-coral-600 mb-4">
                  Tindakan ini akan memisahkan Anda dari pasangan di ruang ini. Data bersama akan diarsipkan selama 30 hari.
                </p>
                <p className="text-sm text-coral-600 mb-4">
                  Untuk konfirmasi, ketik <strong>PISAH</strong> di bawah:
                </p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Ketik PISAH"
                  className="w-full rounded-2xl border border-coral-300 bg-white px-4 py-3 text-warm-900 placeholder-warm-400 focus:border-coral-500 focus:ring-2 focus:ring-coral-100 outline-none transition-all"
                />
              </div>

              {error && (
                <div className="rounded-2xl bg-coral-50 border border-coral-200 px-4 py-3 text-sm text-coral-700">{error}</div>
              )}

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => { setStep('info'); setConfirmText(''); setError('') }}
                  className="rounded-xl px-6 py-3 text-sm font-medium text-warm-700 hover:bg-warm-50 transition-colors"
                >
                  Kembali
                </button>
                <button
                  onClick={handleRequestSeparation}
                  disabled={submitting || confirmText !== 'PISAH'}
                  className="inline-flex items-center gap-2 rounded-xl bg-coral-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-coral-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4" />
                      Konfirmasi Pemisahan
                    </>
                  )}
                </button>
              </div>
            </div>
          </FadeIn>
        )}

        {/* Step: Done */}
        {step === 'done' && (
          <FadeIn delay={0.1}>
            <div className="text-center py-16">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-warm-100 mb-6">
                <CheckCircle2 className="h-10 w-10 text-warm-500" />
              </div>
              <h2 className="text-2xl font-semibold text-warm-900 mb-2">Ruang Telah Dipisah</h2>
              <p className="text-warm-500 mb-2 max-w-md mx-auto">
                Ruang bersama Anda telah dipisahkan. Data Anda telah diarsipkan dan akan tersedia selama 30 hari.
              </p>
              <p className="text-sm text-warm-400 mb-8">
                Kami harap Anda menemukan kebahagiaan. Anda selalu dapat membuat ruang baru ketika siap.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 font-semibold text-white shadow-sm transition-all hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/25 active:scale-[0.98]"
              >
                Ke Dashboard
              </Link>
            </div>
          </FadeIn>
        )}
      </div>
    </AuthenticatedLayout>
  )
}
