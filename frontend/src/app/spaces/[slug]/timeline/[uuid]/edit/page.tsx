'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { useTimeline, TimelineItem } from '@/lib/hooks/useTimeline'
import { Calendar, ArrowLeft, Upload, X, Loader2 } from 'lucide-react'

const MAX_FILES = 5
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

type ExistingMediaItem = {
  kind: 'existing'
  path: string
  url: string
}

type NewMediaItem = {
  kind: 'new'
  id: string
  file: File
  url: string
}

type MediaItem = ExistingMediaItem | NewMediaItem

export default function EditTimelinePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const uuid = params.uuid as string
  const supabase = createClient()
  const { updateTimeline } = useTimeline()

  const [spaceTitle, setSpaceTitle] = useState('')
  const [spaceId, setSpaceId] = useState<number | null>(null)
  const [timelineItem, setTimelineItem] = useState<TimelineItem | null>(null)
  const [pageLoading, setPageLoading] = useState(true)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [newMediaKeys, setNewMediaKeys] = useState<string[]>([])
  const [removedPaths, setRemovedPaths] = useState<string[]>([])
  const [fileError, setFileError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [errors, setErrors] = useState<{ title?: string; date?: string }>({})
  const [modalImage, setModalImage] = useState<string | null>(null)

  const createdPreviewUrls = useRef<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }

    if (user && slug && uuid) {
      loadData()
    }

    return () => {
      createdPreviewUrls.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [user, authLoading, slug, uuid, router])

  const loadData = async () => {
    const { data: space } = await supabase
      .from('spaces')
      .select('id, title')
      .eq('slug', slug)
      .single()

    if (!space) {
      router.push('/spaces')
      return
    }

    setSpaceTitle(space.title)
    setSpaceId(space.id)

    const { data: item } = await supabase
      .from('love_timelines')
      .select('*')
      .eq('uuid', uuid)
      .eq('space_id', space.id)
      .single()

    if (!item) {
      router.push(`/spaces/${slug}/timeline`)
      return
    }

    setTimelineItem(item)
    setTitle(item.title || '')
    setDescription(item.description || '')
    setDate(item.date || '')

    const existingMedia: MediaItem[] = (item.media_paths || []).map((path: string) => ({
      kind: 'existing' as const,
      path,
      url: supabase.storage.from('public').getPublicUrl(path).data.publicUrl,
    }))

    setMediaItems(existingMedia)
    setPageLoading(false)
  }

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const total = mediaItems.length + files.length
    if (total > MAX_FILES) {
      setFileError(`You can upload up to ${MAX_FILES} photos at once.`)
      return
    }

    const convertedMedia: NewMediaItem[] = []
    const convertedFiles: File[] = []

    for (const file of files) {
      if (file.size > MAX_UPLOAD_BYTES) {
        setFileError('File size too large. Maximum 10 MB per file.')
        return
      }

      const id = crypto.randomUUID ? crypto.randomUUID() : `new-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`
      const url = URL.createObjectURL(file)
      createdPreviewUrls.current.push(url)

      convertedFiles.push(file)
      convertedMedia.push({ kind: 'new', id, file, url })
    }

    setFileError(null)
    setMediaItems((prev) => [...prev, ...convertedMedia])
    setNewFiles((prev) => [...prev, ...convertedFiles])
    setNewMediaKeys((prev) => [...prev, ...convertedMedia.map((m) => m.id)])
  }, [mediaItems])

  const handleRemove = useCallback((index: number) => {
    const target = mediaItems[index]
    if (!target) return

    setMediaItems((prev) => prev.filter((_, idx) => idx !== index))

    if (target.kind === 'existing') {
      setRemovedPaths((prev) => prev.includes(target.path) ? prev : [...prev, target.path])
    } else {
      URL.revokeObjectURL(target.url)
      createdPreviewUrls.current = createdPreviewUrls.current.filter((url) => url !== target.url)

      const keyIndex = newMediaKeys.indexOf(target.id)
      if (keyIndex !== -1) {
        const nextFiles = [...newFiles]
        const nextKeys = [...newMediaKeys]
        nextFiles.splice(keyIndex, 1)
        nextKeys.splice(keyIndex, 1)
        setNewFiles(nextFiles)
        setNewMediaKeys(nextKeys)
      }
    }
  }, [mediaItems, newMediaKeys, newFiles])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (processing || !spaceId || !timelineItem) return

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

    const result = await updateTimeline(uuid, {
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      media: newFiles.length > 0 ? newFiles : undefined,
      removed: removedPaths.length > 0 ? removedPaths : undefined,
    })

    if (result.error) {
      setFileError(result.error)
      setProcessing(false)
      return
    }

    router.push(`/spaces/${slug}/timeline`)
  }, [title, description, date, newFiles, removedPaths, processing, spaceId, timelineItem, updateTimeline, uuid, router, slug])

  if (authLoading || pageLoading || !spaceId) {
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
            href={`/spaces/${slug}/timeline`}
            className="rounded-lg p-2 transition hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Memory</h1>
            <p className="text-gray-600">Refresh the details for {spaceTitle}.</p>
          </div>
        </div>
      }
    >
      <div className="relative min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="relative max-w-4xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-100 p-8 md:p-10 relative z-10 space-y-8"
          >
            {/* Title */}
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2">
                Moment Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-pink-500"
                placeholder="e.g. Our first anniversary dinner"
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-pink-500"
                />
              </div>
              {errors.date && (
                <p className="mt-2 text-sm text-red-500">{errors.date}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-pink-500"
                placeholder="Tell the story behind this moment..."
              />
            </div>

            {/* Current Media */}
            {mediaItems.length > 0 && (
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-3">
                  Current Photos
                </label>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {mediaItems.map((item, index) => (
                    <div key={item.kind === 'existing' ? item.path : item.id} className="group relative flex-shrink-0">
                      <img
                        src={item.url}
                        className="h-32 w-40 cursor-pointer rounded-xl object-cover shadow"
                        onClick={() => setModalImage(item.url)}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemove(index)}
                        className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white opacity-0 transition group-hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload New */}
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2">
                Add More Photos
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-pink-400 transition">
                <Upload className="w-14 h-14 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-4">
                  Upload up to {MAX_FILES} photos (max 10MB each).
                </p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  id="media-upload"
                />
                <label
                  htmlFor="media-upload"
                  className="cursor-pointer bg-pink-500 text-white px-8 py-3 rounded-xl font-medium hover:bg-pink-600 transition"
                >
                  Choose Photos
                </label>
                {fileError && (
                  <p className="text-red-500 text-sm mt-3">{fileError}</p>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Link
                href={`/spaces/${slug}/timeline`}
                className="flex-1 px-6 py-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={processing}
                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg disabled:opacity-50"
              >
                {processing ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Image Preview Modal */}
        {modalImage && (
          <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            onClick={() => setModalImage(null)}
          >
            <img
              src={modalImage}
              alt="Preview"
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
            />
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  )
}
