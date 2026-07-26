'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Upload, X, Loader2, Check } from 'lucide-react'

type FilePreview = { file: File; preview: string }

export default function CreateGalleryPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [files, setFiles] = useState<FilePreview[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [spaceId, setSpaceId] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) { router.push('/auth/login'); return }
    if (user && slug) {
      ;(async () => {
        const { data: space } = await supabase.from('spaces').select('id').eq('slug', slug).single()
        if (space) setSpaceId(space.id); else router.push('/dashboard')
      })()
    }
  }, [user, authLoading, router, slug, supabase])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'))
    setFiles((prev) => [...prev, ...selected.map((file) => ({ file, preview: URL.createObjectURL(file) }))])
  }

  const removeFile = (index: number) => { setFiles((prev) => { URL.revokeObjectURL(prev[index].preview); return prev.filter((_, i) => i !== index) }) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!spaceId || files.length === 0) { setError('Please add at least one photo.'); return }
    const collectionTitle = title.trim() || `Collection ${new Date().toLocaleDateString()}`
    setUploading(true); setError(''); setUploadProgress(0)
    try {
      const { data: collection, error: colError } = await supabase.from('gallery_collections').insert({ space_id: spaceId, title: collectionTitle }).select().single()
      if (colError) throw colError
      const uploadedUrls: string[] = []
      for (let i = 0; i < files.length; i++) {
        const { file } = files[i]
        const fileExt = file.name.split('.').pop()
        const filePath = `${spaceId}/${collection.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('gallery').upload(filePath, file)
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(filePath)
        if (urlData?.publicUrl) uploadedUrls.push(urlData.publicUrl)
        setUploadProgress(Math.round(((i + 1) / files.length) * 100))
      }
      if (uploadedUrls.length > 0) {
        const { error: photoError } = await supabase.from('gallery_photos').insert(uploadedUrls.map((url, idx) => ({ collection_id: collection.id, url, caption: files[idx].file.name.replace(/\.[^/.]+$/, '') })))
        if (photoError) throw photoError
      }
      files.forEach((f) => URL.revokeObjectURL(f.preview)); router.push(`/spaces/${slug}/gallery`)
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Upload failed. Please try again.'); setUploading(false) }
  }

  if (authLoading) {
    return <AuthenticatedLayout><div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 text-brand-500 animate-spin" /></div></AuthenticatedLayout>
  }

  return (
    <AuthenticatedLayout header={
      <div className="flex items-center gap-4">
        <Link href={`/spaces/${slug}/gallery`} className="p-2 text-warm-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors"><ArrowLeft className="h-5 w-5" /></Link>
        <div><h1 className="text-2xl font-bold text-warm-900">Create Collection</h1><p className="text-warm-600">Upload photos to a new collection</p></div>
      </div>
    }>
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="rounded-2xl bg-coral-50 border border-coral-200 px-4 py-3 text-sm text-coral-700">{error}</div>}
          <div className="rounded-3xl bg-white border border-warm-100 p-6 shadow-xl shadow-warm-900/5">
            <label htmlFor="title" className="block text-sm font-medium text-warm-700 mb-2">Collection Title</label>
            <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Our Trip to Paris, Anniversary 2024..."
              className="w-full rounded-2xl border border-warm-100 bg-warm-50 px-4 py-3 text-warm-900 placeholder-warm-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all" />
            <p className="mt-2 text-xs text-warm-500">Leave blank to auto-name by upload date</p>
          </div>
          <div className="rounded-3xl bg-white border border-warm-100 p-6 shadow-xl shadow-warm-900/5">
            <label className="block text-sm font-medium text-warm-700 mb-2">Photos</label>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/50 py-12 text-center transition-all hover:border-brand-400 hover:bg-brand-50">
              <Upload className="h-10 w-10 text-brand-400 mx-auto mb-3" />
              <p className="font-medium text-warm-700">Click to upload photos</p>
              <p className="text-sm text-warm-500 mt-1">PNG, JPG, GIF up to 10MB each</p>
            </button>
            {files.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {files.map((fp, idx) => (
                  <div key={idx} className="relative group rounded-2xl overflow-hidden aspect-square">
                    <img src={fp.preview} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeFile(idx)}
                      className="absolute top-1.5 right-1.5 bg-coral-500/80 backdrop-blur-sm text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-3 text-sm text-warm-500">{files.length} photo{files.length !== 1 ? 's' : ''} selected</p>
          </div>
          {uploading && (
            <div className="rounded-3xl bg-white border border-warm-100 p-6 shadow-xl shadow-warm-900/5">
              <div className="flex items-center gap-3 mb-3">
                <Loader2 className="h-5 w-5 text-brand-500 animate-spin" />
                <span className="text-sm font-medium text-warm-700">Uploading... {uploadProgress}%</span>
              </div>
              <div className="w-full bg-warm-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-brand-500 to-purple-500 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}
          <div className="flex items-center justify-end gap-3">
            <Link href={`/spaces/${slug}/gallery`} className="rounded-xl px-6 py-3 text-sm font-medium text-warm-700 hover:bg-warm-100 transition-colors">Cancel</Link>
            <button type="submit" disabled={uploading || files.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
              {uploading ? <><Loader2 className="h-4 w-4 animate-spin" />Uploading...</> : <><Check className="h-4 w-4" />Create Collection</>}
            </button>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  )
}
