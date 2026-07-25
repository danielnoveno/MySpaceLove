'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Upload, FileText, Save, X, Loader2 } from 'lucide-react'

export default function EditDocumentPage() {
  const params = useParams()
  const slug = params.slug as string
  const docId = params.id as string
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [existingFileUrl, setExistingFileUrl] = useState('')
  const [existingFileName, setExistingFileName] = useState('')
  const [newFile, setNewFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }
    if (user && slug && docId) {
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

        const { data: doc } = await supabase
          .from('documents')
          .select('*')
          .eq('id', docId)
          .eq('space_id', space.id)
          .single()

        if (!doc) {
          router.push(`/spaces/${slug}/docs`)
          return
        }

        setTitle(doc.title)
        setNotes(doc.notes || '')
        setExistingFileUrl(doc.file_url || '')
        setExistingFileName(doc.file_name || '')
        setLoading(false)
      })()
    }
  }, [user, authLoading, router, slug, docId, supabase])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setNewFile(selectedFile)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      setNewFile(droppedFile)
    }
  }

  const removeFile = () => {
    setNewFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !title.trim()) return

    setSaving(true)
    setError('')

    let fileUrl = existingFileUrl
    let fileName = existingFileName

    // Upload new file if provided
    if (newFile) {
      setUploading(true)

      const fileExt = newFile.name.split('.').pop()
      const filePath = `documents/${docId}/${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, newFile)

      if (uploadError) {
        setError(uploadError.message)
        setUploading(false)
        setSaving(false)
        return
      }

      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath)
      fileUrl = urlData.publicUrl
      fileName = newFile.name
      setUploading(false)
    }

    const { error: updateError } = await supabase
      .from('documents')
      .update({
        title: title.trim(),
        notes: notes.trim() || null,
        file_url: fileUrl,
        file_name: fileName,
      })
      .eq('id', docId)

    if (updateError) {
      setError('Failed to update document. Please try again.')
      setSaving(false)
      return
    }

    router.push(`/spaces/${slug}/docs`)
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
        <div className="flex items-center gap-3">
          <Link
            href={`/spaces/${slug}/docs`}
            className="p-2 rounded-full hover:bg-pink-50 text-gray-600 hover:text-pink-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Document</h1>
            <p className="text-gray-600">Update your document details</p>
          </div>
        </div>
      }
    >
      <div className="max-w-lg mx-auto">
        <div className="rounded-3xl bg-white/80 backdrop-blur p-6 shadow-sm border border-white/70">
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 text-red-700 border border-red-100 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-xl border border-pink-100 bg-pink-50/50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                placeholder="Document title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current File
              </label>
              {existingFileUrl && !newFile ? (
                <div className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50/50 px-4 py-3">
                  <FileText className="h-5 w-5 text-green-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{existingFileName}</p>
                    <a
                      href={existingFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-pink-500 hover:underline"
                    >
                      View current file
                    </a>
                  </div>
                </div>
              ) : newFile ? (
                <div className="flex items-center gap-3 rounded-xl border border-pink-100 bg-pink-50/50 px-4 py-3">
                  <FileText className="h-5 w-5 text-pink-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{newFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(newFile.size / 1024 / 1024).toFixed(2)} MB (will replace current file)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Replace File
              </label>
              {newFile ? null : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragOver(true)
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
                    dragOver
                      ? 'border-pink-400 bg-pink-50'
                      : 'border-pink-200 bg-pink-50/30 hover:border-pink-300 hover:bg-pink-50/50'
                  }`}
                >
                  <Upload className="h-6 w-6 text-pink-300 mb-2" />
                  <p className="text-sm font-medium text-gray-700">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Any file type up to 50MB (optional)
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-pink-100 bg-pink-50/50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent resize-none"
                placeholder="Add any notes about this file..."
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                href={`/spaces/${slug}/docs`}
                className="rounded-xl px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving || !title.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Uploading...
                  </>
                ) : saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Update Document
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
