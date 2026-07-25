'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft,
  Loader2,
  Check,
} from 'lucide-react'

export default function CreateWishlistPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [spaceId, setSpaceId] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }
    if (user && slug) {
      ;(async () => {
        const { data: space } = await supabase
          .from('spaces')
          .select('id')
          .eq('slug', slug)
          .single()

        if (space) {
          setSpaceId(space.id)
        } else {
          router.push('/dashboard')
        }
      })()
    }
  }, [user, authLoading, router, slug, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!spaceId) return
    if (!title.trim()) {
      setError('Please enter a title.')
      return
    }

    setSaving(true)
    setError('')

    const { error: insertError } = await supabase.from('wishlist_items').insert({
      space_id: spaceId,
      title: title.trim(),
      description: description.trim() || null,
      location: location.trim() || null,
      notes: notes.trim() || null,
      status: 'pending',
    })

    if (insertError) {
      setError('Failed to save item. Please try again.')
      setSaving(false)
      return
    }

    router.push(`/spaces/${slug}/wishlist`)
  }

  if (authLoading) {
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
            href={`/spaces/${slug}/wishlist`}
            className="p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add Wishlist Item</h1>
            <p className="text-gray-600">Something you want to do or get together</p>
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
              What do you want? <span className="text-pink-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Visit Paris, Buy matching watches..."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
            />
          </div>

          {/* Description */}
          <div className="rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Tell me more about this..."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all resize-none"
            />
          </div>

          {/* Location */}
          <div className="rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-6">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Where is this? (optional)"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
            />
          </div>

          {/* Notes */}
          <div className="rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any additional notes..."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href={`/spaces/${slug}/wishlist`}
              className="rounded-xl px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
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
                  Add to Wishlist
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  )
}
