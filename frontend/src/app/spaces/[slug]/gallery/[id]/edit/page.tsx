'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft,
  Upload,
  X,
  Loader2,
  Check,
  Trash2,
} from 'lucide-react'

type FilePreview = {
  file: File
  preview: string
}

type ExistingPhoto = {
  id: string
  url: string
  caption: string | null
}

export default function EditGalleryPage() {
  const params = useParams()
  const slug = params.slug as string
  const collectionId = params.id as string
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [existingPhotos, setExistingPhotos] = useState<ExistingPhoto[]>([])
  const [deletedPhotoIds, setDeletedPhotoIds] = useState<string[]>([])
  const [newFiles, setNewFiles] = useState<FilePreview[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }
    if (user && slug && collectionId) {
      ;(async () => {
        setLoading(true)

        const { data: space } = await supabase
          .from('spaces')
          .select('id')
          .eq('slug', slug)
          .single()

        if (!space) {
          router.push('/dashboard')
          return
        }

        const { data: collection } = await supabase
          .from('gallery_collections')
          .select('*')
          .eq('id', collectionId)
          .eq('space_id', space.id)
          .single()

        if (!collection) {
          router.push(`/spaces/${slug}/gallery`)
          return
        }

        setTitle(collection.title)

        const { data: photos } = await supabase
          .from('gallery_photos')
          .select('*')
          .eq('collection_id', collectionId)

        if (photos) {
          setExistingPhotos(photos.map((p) => ({ id: p.id, url: p.url, caption: p.caption })))
        }

        setLoading(false)
      })()
    }
  }, [user, authLoading, router, slug, collectionId, supabase])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    const imageFiles = selected.filter((f) => f.type.startsWith('image/'))

    const newPreviews: FilePreview[] = imageFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }))

    setNewFiles((prev) => [...prev, ...newPreviews])
  }

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  const markExistingPhotoDeleted = (photoId: string) => {
    setExistingPhotos((prev) => prev.filter((p) => p.id !== photoId))
    setDeletedPhotoIds((prev) => [...prev, photoId])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (existingPhotos.length === 0 && newFiles.length === 0) {
      setError('A collection must have at least one photo.')
      return
    }

    setSaving(true)
    setError('')
    setUploadProgress(0)

    try {
      // Update collection title
      const { error: updateError } = await supabase
        .from('gallery_collections')
        .update({ title: title.trim() || 'Untitled Collection' })
        .eq('id', collectionId)

      if (updateError) throw updateError

      // Delete removed photos
      if (deletedPhotoIds.length > 0) {
        // Delete from storage
        for (const photoId of deletedPhotoIds) {
          const photo = existingPhotos.find((p) => p.id === photoId)
          if (photo) {
            const urlParts = photo.url.split('/gallery/')
            if (urlParts.length > 1) {
              await supabase.storage.from('gallery').remove([urlParts[1]])
            }
          }
        }

        const { error: deleteError } = await supabase
          .from('gallery_photos')
          .delete()
          .in('id', deletedPhotoIds)

        if (deleteError) throw deleteError
      }

      // Upload new files
      if (newFiles.length > 0) {
        const uploadedUrls: string[] = []
        const totalFiles = newFiles.length

        for (let i = 0; i < totalFiles; i++) {
          const { file } = newFiles[i]
          const fileExt = file.name.split('.').pop()
          const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`
          const filePath = `${collectionId}/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('gallery')
            .upload(filePath, file)

          if (uploadError) throw uploadError

          const { data: urlData } = supabase.storage
            .from('gallery')
            .getPublicUrl(filePath)

          if (urlData?.publicUrl) {
            uploadedUrls.push(urlData.publicUrl)
          }

          setUploadProgress(Math.round(((i + 1) / totalFiles) * 100))
        }

        if (uploadedUrls.length > 0) {
          const photoInserts = uploadedUrls.map((url, idx) => ({
            collection_id: collectionId,
            url,
            caption: newFiles[idx].file.name.replace(/\.[^/.]+$/, ''),
          }))

          const { error: photoError } = await supabase
            .from('gallery_photos')
            .insert(photoInserts)

          if (photoError) throw photoError
        }
      }

      newFiles.forEach((f) => URL.revokeObjectURL(f.preview))
      router.push(`/spaces/${slug}/gallery`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update. Please try again.'
      setError(message)
      setSaving(false)
      setUploading(false)
    }
  }

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
            href={`/spaces/${slug}/gallery`}
            className="p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Collection</h1>
            <p className="text-gray-600">Update your photo collection</p>
          </div>
        </div>
      }
    >
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Collection Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Our Trip to Paris, Anniversary 2024..."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
            />
          </div>

          {/* Existing Photos */}
          {existingPhotos.length > 0 && (
            <div className="rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Existing Photos ({existingPhotos.length})
              </label>
              <div className="grid grid-cols-3 gap-3">
                {existingPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative group rounded-xl overflow-hidden aspect-square"
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || 'Photo'}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => markExistingPhotoDeleted(photo.id)}
                      className="absolute top-1.5 right-1.5 bg-red-500/80 backdrop-blur-sm text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Photos Upload */}
          <div className="rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add New Photos
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-2xl border-2 border-dashed border-pink-200 bg-pink-50/50 py-8 text-center transition-all hover:border-pink-400 hover:bg-pink-50"
            >
              <Upload className="h-8 w-8 text-pink-400 mx-auto mb-2" />
              <p className="font-medium text-gray-700 text-sm">Click to upload photos</p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB each</p>
            </button>

            {newFiles.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {newFiles.map((fp, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-xl overflow-hidden aspect-square"
                  >
                    <img
                      src={fp.preview}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewFile(idx)}
                      className="absolute top-1.5 right-1.5 bg-red-500/80 backdrop-blur-sm text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {newFiles.length > 0 && (
              <p className="mt-3 text-sm text-gray-500">
                {newFiles.length} new photo{newFiles.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          {/* Upload Progress */}
          {saving && (
            <div className="rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-6">
              <div className="flex items-center gap-3 mb-3">
                <Loader2 className="h-5 w-5 text-pink-500 animate-spin" />
                <span className="text-sm font-medium text-gray-700">
                  Saving... {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href={`/spaces/${slug}/gallery`}
              className="rounded-xl px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || (existingPhotos.length === 0 && newFiles.length === 0)}
              className="inline-flex items-center gap-2 rounded-xl bg-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Update Collection
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  )
}
