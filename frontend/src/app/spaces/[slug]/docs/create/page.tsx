'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Upload, FileText, Save, X } from 'lucide-react'

export default function UploadDocumentPage() {
  const params = useParams()
  const slug = params.slug as string
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''))
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      setFile(droppedFile)
      if (!title) {
        setTitle(droppedFile.name.replace(/\.[^/.]+$/, ''))
      }
    }
  }

  const removeFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !file || !title) return

    setSaving(true)
    setError('')

    const { data: space } = await supabase
      .from('spaces')
      .select('id')
      .eq('slug', slug)
      .single()

    if (!space) {
      setError('Space not found')
      setSaving(false)
      return
    }

    setUploading(true)

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const filePath = `documents/${space.id}/${Date.now()}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file)

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      setSaving(false)
      return
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath)

    // Save document record
    const { error: insertError } = await supabase.from('documents').insert({
      space_id: space.id,
      title,
      file_name: file.name,
      file_url: urlData.publicUrl,
      notes: notes || null,
      uploaded_by: user.id,
    })

    setUploading(false)

    if (insertError) {
      setError(insertError.message)
    } else {
      router.push(`/spaces/${slug}/docs`)
    }
    setSaving(false)
  }

  if (authLoading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
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
            <h1 className="text-2xl font-bold text-gray-900">Upload Document</h1>
            <p className="text-gray-600">Share a file with your partner</p>
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
                File *
              </label>
              {file ? (
                <div className="flex items-center gap-3 rounded-xl border border-pink-100 bg-pink-50/50 px-4 py-3">
                  <FileText className="h-5 w-5 text-pink-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
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
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragOver(true)
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
                    dragOver
                      ? 'border-pink-400 bg-pink-50'
                      : 'border-pink-200 bg-pink-50/30 hover:border-pink-300 hover:bg-pink-50/50'
                  }`}
                >
                  <Upload className="h-8 w-8 text-pink-300 mb-3" />
                  <p className="text-sm font-medium text-gray-700">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Any file type up to 50MB
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

            <button
              type="submit"
              disabled={saving || !file || !title}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Uploading...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Upload Document'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
