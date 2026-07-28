'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/motion'
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
  const supabase = createClient()

  const fetchDocuments = useCallback(async () => {
    const { data: space } = await supabase
      .from('spaces')
      .select('id')
      .eq('slug', slug)
      .single()

    if (!space) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('space_id', space.id)
      .order('created_at', { ascending: false })

    if (data) setDocuments(data)
    setLoading(false)
  }, [slug, supabase])

  useEffect(() => {
    if (!authLoading && !user) return
    if (user) {
      const timeout = setTimeout(fetchDocuments, 0)
      return () => clearTimeout(timeout)
    }
  }, [user, authLoading, fetchDocuments])

  const deleteDocument = async (doc: Document) => {
    if (!confirm('Hapus dokumen ini?')) return
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
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout
      header={
        <FadeIn>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href={`/spaces/${slug}`}
                className="p-2 rounded-xl hover:bg-warm-50 text-warm-500 hover:text-warm-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100">
                <FileText className="h-6 w-6 text-brand-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-warm-900">Dokumen</h1>
                <p className="text-warm-500">File dan dokumen bersama</p>
              </div>
            </div>
            <Link
              href={`/spaces/${slug}/docs/create`}
              className="flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-600 hover:shadow-md hover:shadow-brand-500/25 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Unggah
            </Link>
          </div>
        </FadeIn>
      }
    >
      <div className="max-w-2xl mx-auto">
        {documents.length === 0 ? (
          <FadeIn delay={0.1}>
            <div className="text-center py-16">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 text-brand-400 mb-4">
                <FileText className="h-10 w-10" />
              </div>
              <h2 className="text-xl font-semibold text-warm-900 mb-2">Belum ada dokumen</h2>
              <p className="text-warm-500 mb-6">
                Unggah dokumen pertama Anda untuk dibagikan dengan pasangan.
              </p>
              <Link
                href={`/spaces/${slug}/docs/create`}
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/25 active:scale-[0.98]"
              >
                <Upload className="h-5 w-5" />
                Unggah Dokumen
              </Link>
            </div>
          </FadeIn>
        ) : (
          <StaggerContainer className="space-y-3">
            {documents.map((doc) => (
              <StaggerItem key={doc.id}>
                <div className="flex items-center gap-4 rounded-2xl bg-white border border-warm-100 p-4 transition-all hover:shadow-lg hover:shadow-warm-900/5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl">
                    {getFileIcon(doc.file_name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-warm-900 truncate">{doc.title}</h3>
                    <p className="text-xs text-warm-500 truncate">{doc.file_name}</p>
                    {doc.notes && (
                      <p className="text-xs text-warm-400 mt-1 truncate">{doc.notes}</p>
                    )}
                    <p className="text-xs text-warm-400 mt-1">
                      {new Date(doc.created_at).toLocaleDateString('id-ID')} •{' '}
                      {doc.uploaded_by === user?.id ? 'Anda' : 'Pasangan'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => window.open(doc.file_url, '_blank')}
                      className="p-2 rounded-full text-warm-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                      title="Lihat"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="p-2 rounded-full text-warm-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                      title="Unduh"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteDocument(doc)}
                      className="p-2 rounded-full text-warm-400 hover:text-coral-600 hover:bg-coral-50 transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </AuthenticatedLayout>
  )
}
