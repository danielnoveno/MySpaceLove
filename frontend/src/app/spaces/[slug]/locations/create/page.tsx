'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'
import {
  ArrowLeft,
  Loader2,
  Check,
  MapPin,
  FileText,
  Star,
  Calendar,
  Utensils,
  Coffee,
  TreePine,
  Ticket,
  Plane,
  StickyNote,
  Crosshair,
} from 'lucide-react'

const PickMap = dynamic(() => import('./PickMap'), { ssr: false })

const CATEGORIES = [
  { id: 'restaurant', label: 'Restaurant', icon: Utensils },
  { id: 'cafe', label: 'Cafe', icon: Coffee },
  { id: 'park', label: 'Park', icon: TreePine },
  { id: 'activity', label: 'Activity', icon: Ticket },
  { id: 'travel', label: 'Travel', icon: Plane },
  { id: 'other', label: 'Other', icon: StickyNote },
]

export default function CreateLocationPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [category, setCategory] = useState('')
  const [notes, setNotes] = useState('')
  const [rating, setRating] = useState(0)
  const [savedAt, setSavedAt] = useState('')
  const [latitude, setLatitude] = useState<string>('')
  const [longitude, setLongitude] = useState<string>('')
  const [showMap, setShowMap] = useState(false)
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

  const handleMapPick = useCallback((lat: number, lng: number) => {
    setLatitude(lat.toFixed(6))
    setLongitude(lng.toFixed(6))
    setShowMap(false)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!spaceId) return
    if (!name.trim()) {
      setError('Please enter a location name.')
      return
    }
    if (!category) {
      setError('Please select a category.')
      return
    }

    setSaving(true)
    setError('')

    const { error: insertError } = await supabase
      .from('shared_locations')
      .insert({
        space_id: spaceId,
        name: name.trim(),
        address: address.trim() || null,
        city: city.trim() || null,
        category,
        notes: notes.trim() || null,
        rating: rating || null,
        saved_at: savedAt ? new Date(savedAt).toISOString() : null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      })

    if (insertError) {
      setError('Failed to save location. Please try again.')
      setSaving(false)
      return
    }

    router.push(`/spaces/${slug}/locations`)
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
            href={`/spaces/${slug}/locations`}
            className="p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Add Location
            </h1>
            <p className="text-gray-600">
              Save a place to visit together
            </p>
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

          {/* Name */}
          <div className="rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-6">
            <label
              htmlFor="name"
              className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
            >
              <MapPin className="h-4 w-4 text-pink-500" />
              Location Name <span className="text-pink-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. That cute cafe downtown"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
            />
          </div>

          {/* Address & City */}
          <div className="rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-6 space-y-4">
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Address
              </label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
              />
            </div>
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                City
              </label>
              <input
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Jakarta, Bandung, etc."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
              />
            </div>
          </div>

          {/* Category */}
          <div className="rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Category <span className="text-pink-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl p-3 text-sm font-medium transition-all ${
                      category === cat.id
                        ? 'bg-pink-100 text-pink-700 ring-2 ring-pink-500'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {cat.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Rating */}
          <div className="rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-6">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Star className="h-4 w-4 text-pink-500" />
              Rating
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(rating === value ? 0 : value)}
                  className="p-1 transition-colors"
                >
                  <Star
                    className={`h-8 w-8 ${
                      value <= rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-gray-500">
                  {rating}/5
                </span>
              )}
            </div>
          </div>

          {/* Pin on Map */}
          <div className="rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-6">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Crosshair className="h-4 w-4 text-pink-500" />
              Pin Location on Map
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Optionally pin this location on the map for easier discovery.
            </p>
            <div className="flex gap-3 mb-3">
              <div className="flex-1">
                <label htmlFor="latitude" className="block text-xs text-gray-500 mb-1">
                  Latitude
                </label>
                <input
                  id="latitude"
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="-6.2088"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="longitude" className="block text-xs text-gray-500 mb-1">
                  Longitude
                </label>
                <input
                  id="longitude"
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="106.8456"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowMap(!showMap)}
              className="inline-flex items-center gap-2 rounded-xl bg-pink-50 px-4 py-2 text-sm font-medium text-pink-600 hover:bg-pink-100 transition-colors"
            >
              <MapPin className="h-4 w-4" />
              {showMap ? 'Close Map' : 'Pick on Map'}
            </button>
            {showMap && (
              <div className="mt-3">
                <PickMap onPick={handleMapPick} />
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-6">
            <label
              htmlFor="notes"
              className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
            >
              <FileText className="h-4 w-4 text-pink-500" />
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Why you want to visit, what to try, etc."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all resize-none"
            />
          </div>

          {/* Save Date */}
          <div className="rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-6">
            <label
              htmlFor="savedAt"
              className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
            >
              <Calendar className="h-4 w-4 text-pink-500" />
              When to visit
            </label>
            <input
              id="savedAt"
              type="date"
              value={savedAt}
              onChange={(e) => setSavedAt(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href={`/spaces/${slug}/locations`}
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
                  Save Location
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  )
}
