'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import {
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  ArrowLeft,
  Plus,
} from 'lucide-react'

type Document = {
  id: number
  space_id: number
  title: string
  file_name: string
  file_url: string
  notes: string | null
  uploaded_by: string
  created_at: string
}

export default function DocsPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user, loading: authLoading } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [spaceId, setSpaceId] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && !user) return
    if (user) fetchDocuments()
  }, [user, authLoading])

  const fetchDocuments = async () => {
    const { data: space } = await supabase
      .from('spaces')
      .select('id')
      .eq('slug', slug)
      .single()

    if (!space) {
      setLoading(false)
      return
    }

    setSpaceId(space.id)

    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('space_id', space.id)
      .order('created_at', { ascending: false })

    if (data) setDocuments(data)
    setLoading(false)
  }

  const deleteDocument = async (doc: Document) => {
    // Delete from storage
    const filePath = doc.file_url.split('/').slice(-2).join('/')
    await supabase.storage.from('documents').remove([filePath])

    // Delete from database
    await supabase.from('documents').delete().eq('id', doc.id)

    setDocuments((prev) => prev.filter((d) => d.id !== doc.id))
  }

  const handleDownload = (doc: Document) => {
    const link = document.createElement('a')
    link.href = doc.file_url
    link.download = doc.file_name
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return '🖼️'
    if (['pdf'].includes(ext || '')) return '📄'
    if (['doc', 'docx'].includes(ext || '')) return '📝'
    if (['xls', 'xlsx'].includes(ext || '')) return '📊'
    if (['mp4', 'mov', 'avi'].includes(ext || '')) return '🎬'
    return '📎'
  }

  if (authLoading || loading) {
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/spaces/${slug}`}
              className="p-2 rounded-full hover:bg-pink-50 text-gray-600 hover:text-pink-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
              <p className="text-gray-600">Shared files and documents</p>
            </div>
          </div>
          <Link
            href={`/spaces/${slug}/docs/create`}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            Upload
          </Link>
        </div>
      }
    >
      <div className="max-w-2xl mx-auto">
        {documents.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-pink-100 text-pink-400 mb-4">
              <FileText className="h-10 w-10" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No documents yet</h2>
            <p className="text-gray-500 mb-6">
              Upload your first document to share with your partner.
            </p>
            <Link
              href={`/spaces/${slug}/docs/create`}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
            >
              <Upload className="h-5 w-5" />
              Upload Document
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-4 rounded-2xl bg-white/80 backdrop-blur p-4 shadow-sm border border-white/70 transition-all hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-50 text-2xl">
                  {getFileIcon(doc.file_name)}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{doc.title}</h3>
                  <p className="text-xs text-gray-500 truncate">{doc.file_name}</p>
                  {doc.notes && (
                    <p className="text-xs text-gray-400 mt-1 truncate">{doc.notes}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(doc.created_at).toLocaleDateString()} •{' '}
                    {doc.uploaded_by === user?.id ? 'You' : 'Partner'}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => window.open(doc.file_url, '_blank')}
                    className="p-2 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="View"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDownload(doc)}
                    className="p-2 rounded-full text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteDocument(doc)}
                    className="p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  )
}
