'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export type SpaceDoc = {
  id: number
  space_id: number
  title: string
  file_path: string
  file_name: string
  file_type: string
  file_size: number
  notes: string | null
  uploaded_by: string
  created_at: string
}

type UseDocsReturn = {
  docs: SpaceDoc[]
  loading: boolean
  error: string | null
  fetchDocs: (spaceId: number) => Promise<void>
  uploadDoc: (data: {
    space_id: number
    title: string
    file: File
    notes?: string
  }) => Promise<{ error?: string; doc?: SpaceDoc }>
  deleteDoc: (id: number) => Promise<{ error?: string }>
  getDocUrl: (filePath: string) => string
}

export function useDocs(): UseDocsReturn {
  const [docs, setDocs] = useState<SpaceDoc[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchDocs = useCallback(async (spaceId: number) => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('space_docs')
      .select('*')
      .eq('space_id', spaceId)
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setDocs(data || [])
    }
    setLoading(false)
  }, [supabase])

  const uploadDoc = useCallback(async (data: {
    space_id: number
    title: string
    file: File
    notes?: string
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { error: 'Not authenticated' }

      const fileExt = data.file.name.split('.').pop() || 'bin'
      const filePath = `spaces/${data.space_id}/docs/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('private')
        .upload(filePath, data.file, { contentType: data.file.type })

      if (uploadError) return { error: uploadError.message }

      const { data: doc, error: insertError } = await supabase
        .from('space_docs')
        .insert({
          space_id: data.space_id,
          title: data.title,
          file_path: filePath,
          file_name: data.file.name,
          file_type: data.file.type,
          file_size: data.file.size,
          notes: data.notes || null,
          uploaded_by: user.id,
        })
        .select()
        .single()

      if (insertError) return { error: insertError.message }

      setDocs((prev) => [doc, ...prev])
      return { doc }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setError(message)
      return { error: message }
    }
  }, [supabase])

  const deleteDoc = useCallback(async (id: number) => {
    try {
      const doc = docs.find((d) => d.id === id)

      if (doc?.file_path) {
        await supabase.storage.from('private').remove([doc.file_path])
      }

      const { error: deleteError } = await supabase
        .from('space_docs')
        .delete()
        .eq('id', id)

      if (deleteError) return { error: deleteError.message }

      setDocs((prev) => prev.filter((d) => d.id !== id))
      return {}
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete document'
      setError(message)
      return { error: message }
    }
  }, [docs, supabase])

  const getDocUrl = useCallback((filePath: string): string => {
    const { data } = supabase.storage.from('private').getPublicUrl(filePath)
    return data.publicUrl
  }, [supabase])

  return {
    docs,
    loading,
    error,
    fetchDocs,
    uploadDoc,
    deleteDoc,
    getDocUrl,
  }
}
