'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import AppImage from '@/components/AppImage'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { useTimeline } from '@/lib/hooks/useTimeline'
import { ArrowLeft, Calendar, Upload, X, Loader2 } from 'lucide-react'

const MAX_FILES = 5
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

export default function CreateTimelinePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const supabase = createClient()
  const { createTimeline } = useTimeline()

  const [spaceTitle, setSpaceTitle] = useState('')
  const [spaceId, setSpaceId] = useState<number | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [media, setMedia] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [fileError, setFileError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [errors, setErrors] = useState<{ title?: string; date?: string }>({})

  const createdPreviewUrls = useRef<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchSpace = useCallback(async () => {
    const { data, error } = await supabase
      .from('spaces')
      .select('id, title')
      .eq('slug', slug)
      .single()

    if (error || !data) {
      router.push('/spaces')
      return
    }

    setSpaceTitle(data.title)
    setSpaceId(data.id)
  }, [router, slug, supabase])

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined

    if (!authLoading && !user) {
      router.push('/auth/login')
    } else if (user && slug) {
      timeout = setTimeout(fetchSpace, 0)
    }

    return () => {
      if (timeout) clearTimeout(timeout)
      createdPreviewUrls.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [user, authLoading, slug, router, fetchSpace])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length === 0) return

    if (media.length + selectedFiles.length > MAX_FILES) {
      setFileError(`You can upload up to ${MAX_FILES} photos at once.`)
      return
    }

    const newPreviews: string[] = []
    const validFiles: File[] = []

    for (const file of selectedFiles) {
      if (file.size > MAX_UPLOAD_BYTES) {
        setFileError('File size too large. Maximum 10 MB per file.')
        return
      }

      validFiles.push(file)
      const url = URL.createObjectURL(file)
      createdPreviewUrls.current.push(url)
      newPreviews.push(url)
    }

    setFileError(null)
    setMedia((prev) => [...prev, ...validFiles])
    setPreviews((prev) => [...prev, ...newPreviews])
  }, [media])

  const removeFile = useCallback((index: number) => {
    const newPreviews = [...previews]
    const [removedPreview] = newPreviews.splice(index, 1)
    if (removedPreview) {
      URL.revokeObjectURL(removedPreview)
      createdPreviewUrls.current = createdPreviewUrls.current.filter((url) => url !== removedPreview)
    }

    const newFiles = [...media]
    newFiles.splice(index, 1)

    setPreviews(newPreviews)
    setMedia(newFiles)
  }, [previews, media])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (processing || !spaceId) return

    setErrors({})
    setFileError(null)

    const newErrors: typeof errors = {}
    if (!title.trim()) newErrors.title = 'Title is required.'
    if (!date) newErrors.date = 'Date is required.'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setProcessing(true)

    const result = await createTimeline(spaceId, {
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      media: media.length > 0 ? media : undefined,
    })

    if (result.error) {
      setFileError(result.error)
      setProcessing(false)
      return
    }

    router.push(`/spaces/${slug}/timeline`)
  }, [title, description, date, media, processing, spaceId, createTimeline, router, slug])

  if (authLoading || !spaceId) {
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
        <div className="flex items-center gap-4">
          <Link
            href={`/spaces/${slug}/timeline`}
            className="rounded-lg p-2 transition hover:bg-warm-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-warm-900">Add Special Moment</h1>
            <p className="text-warm-600">Record a cherished memory for {spaceTitle}.</p>
          </div>
        </div>
      }
    >
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-brand-50 via-white to-coral-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-4xl">
          <form
            onSubmit={handleSubmit}
            className="relative z-10 rounded-3xl border border-warm-100 bg-white p-8 shadow-lg md:p-10"
          >
            <div className="space-y-8">
              {/* Title */}
              <div>
                <label className="mb-2 block text-base font-semibold text-warm-800">
                  Moment Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-warm-200 px-5 py-4 text-warm-800 transition focus:border-transparent focus:ring-2 focus:ring-brand-500"
                  placeholder="e.g. Our first anniversary dinner"
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-coral-500">{errors.title}</p>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="mb-2 block text-base font-semibold text-warm-800">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-warm-400" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-2xl border border-warm-200 pl-12 pr-5 py-4 text-warm-800 transition focus:border-transparent focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                {errors.date && (
                  <p className="mt-2 text-sm text-coral-500">{errors.date}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-base font-semibold text-warm-800">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="w-full rounded-2xl border border-warm-200 px-5 py-4 text-warm-800 transition focus:border-transparent focus:ring-2 focus:ring-brand-500"
                  placeholder="Tell the story behind this moment..."
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="mb-3 block text-base font-semibold text-warm-800">
                  Photos
                </label>
                <div className="rounded-2xl border-2 border-dashed border-warm-200 p-8 text-center transition hover:border-brand-400">
                  <Upload className="mx-auto mb-4 h-16 w-16 text-brand-500" />
                  <p className="mb-2 text-sm text-warm-600">
                    Upload up to {MAX_FILES} photos (max 10MB each).
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-500 px-8 py-3 font-semibold text-white transition hover:bg-brand-600"
                  >
                    Choose Photos
                  </button>
                  {media.length > 0 && (
                    <p className="mt-4 text-sm text-warm-600">
                      {media.length} / {MAX_FILES}
                    </p>
                  )}
                </div>
                {fileError && (
                  <p className="mt-2 text-sm text-coral-500">{fileError}</p>
                )}
              </div>

              {/* Preview */}
              <div className="rounded-2xl border border-brand-100 bg-white/75 p-6 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-600">
                  Preview
                </h3>
                {previews.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {previews.map((url, index) => (
                      <div
                        key={`${url}-${index}`}
                        className="group relative overflow-hidden rounded-2xl border border-brand-100 shadow-sm"
                      >
                        <AppImage
                          src={url}
                          alt={`preview-${index}`}
                          className="h-48 w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute right-3 top-3 inline-flex items-center justify-center rounded-full bg-black/60 p-2 text-white transition hover:bg-black"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-warm-500">No photos selected yet.</p>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href={`/spaces/${slug}/timeline`}
                className="flex-1 rounded-xl border border-warm-200 px-6 py-4 text-center font-medium text-warm-700 transition hover:bg-warm-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={processing}
                className="flex-1 rounded-xl bg-gradient-to-r from-brand-500 to-coral-500 px-6 py-4 font-semibold text-white shadow transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processing ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  'Save Memory'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
