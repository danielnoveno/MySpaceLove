'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft,
  Heart,
  Calendar,
  FileText,
  Upload,
  X,
  Loader2,
  Check,
  AlertCircle,
  Trash2,
} from 'lucide-react'

const CATEGORIES = [
  { value: 'first-date', label: 'First Date' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'trip', label: 'Trip' },
  { value: 'milestone', label: 'Milestone' },
  { value: 'gift', label: 'Gift' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'other', label: 'Other' },
]

type Memory = {
  id: string
  space_id: string
  user_id: string
  title: string
  description: string | null
  date: string
  category: string
  image_url: string | null
  notes: string | null
  created_at: string
}

export default function EditMemoryPage() {
  const params = useParams()
  const slug = params.slug as string
  const memoryId = params.id as string
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [memory, setMemory] = useState<Memory | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [category, setCategory] = useState('other')
  const [notes, setNotes] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }
    if (user && slug && memoryId) {
      fetchMemory()
    }
  }, [user, authLoading, slug, memoryId, router])

  const fetchMemory = async () => {
    setLoadingData(true)

    const { data, error: fetchError } = await supabase
      .from('memory_lane')
      .select('*')
      .eq('id', memoryId)
      .single()

    if (fetchError || !data) {
      router.push(`/spaces/${slug}/memory-lane`)
      return
    }

    setMemory(data)
    setTitle(data.title)
    setDescription(data.description || '')
    setDate(data.date ? new Date(data.date).toISOString().split('T')[0] : '')
    setCategory(data.category || 'other')
    setNotes(data.notes || '')
    setExistingImageUrl(data.image_url)
    setLoadingData(false)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.')
      return
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setExistingImageUrl(null)
    setError('')
  }

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
    setImageFile(null)
    setImagePreview(null)
    setExistingImageUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !date) {
      setError('Please fill in title and date.')
      return
    }

    setUploading(true)
    setError('')

    let imageUrl = existingImageUrl

    // Remove old image if replacing
    if (imageFile && existingImageUrl) {
      const oldPath = existingImageUrl.split('/').pop()
      if (oldPath) {
        await supabase.storage.from('memory-lane').remove([oldPath])
      }
    }

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`
      const filePath = `${memory!.space_id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('memory-lane')
        .upload(filePath, imageFile)

      if (uploadError) {
        setError(uploadError.message)
        setUploading(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('memory-lane')
        .getPublicUrl(filePath)

      imageUrl = urlData?.publicUrl ?? null
    }

    const { error: updateError } = await supabase
      .from('memory_lane')
      .update({
        title: title.trim(),
        description: description.trim() || null,
        date: new Date(date).toISOString(),
        category,
        image_url: imageUrl,
        notes: notes.trim() || null,
      })
      .eq('id', memoryId)

    if (updateError) {
      setError(updateError.message)
      setUploading(false)
      return
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }

    router.push(`/spaces/${slug}/memory-lane`)
  }

  if (authLoading || loadingData) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 text-pink-500 animate-spin" />
        </div>
      </AuthenticatedLayout>
    )
  }

  if (!memory) return null

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center gap-4">
          <Link
            href={`/spaces/${slug}/memory-lane`}
            className="p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Memory</h1>
            <p className="text-gray-600 text-sm">Update your memory details</p>
          </div>
        </div>
      }
    >
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Title & Date */}
          <div className="rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-6 space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-pink-500" />
                  Memory Title
                </span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Our First Date, Paris Trip..."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-pink-500" />
                  Date
                </span>
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div className="rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    category === cat.value
                      ? 'bg-pink-500 text-white shadow-sm'
                      : 'bg-pink-50 text-pink-700 hover:bg-pink-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-pink-500" />
                Description (optional)
              </span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this memory..."
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all resize-none"
            />
          </div>

          {/* Image Upload */}
          <div className="rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo (optional)
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            {imagePreview || existingImageUrl ? (
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src={imagePreview || existingImageUrl!}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500/80 backdrop-blur-sm text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-2xl border-2 border-dashed border-pink-200 bg-pink-50/50 py-10 text-center transition-all hover:border-pink-400 hover:bg-pink-50"
              >
                <Upload className="h-8 w-8 text-pink-400 mx-auto mb-2" />
                <p className="font-medium text-gray-700 text-sm">Click to upload a photo</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
              </button>
            )}
          </div>

          {/* Notes */}
          <div className="rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Private Notes (optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Personal notes only you can see..."
              rows={2}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href={`/spaces/${slug}/memory-lane`}
              className="rounded-xl px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={uploading || !title.trim() || !date}
              className="inline-flex items-center gap-2 rounded-xl bg-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Update Memory
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  )
}
