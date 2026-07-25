'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'
import {
  Plus,
  MapPin,
  Loader2,
  Trash2,
  Edit3,
  Star,
  Utensils,
  Coffee,
  TreePine,
  Ticket,
  Plane,
  StickyNote,
} from 'lucide-react'

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

type Location = {
  id: string
  space_id: string
  name: string
  address: string | null
  city: string | null
  category: string
  notes: string | null
  rating: number | null
  saved_at: string | null
  latitude: number | null
  longitude: number | null
  created_at: string
}

const CATEGORIES = [
  { id: 'restaurant', label: 'Restaurant', icon: Utensils, color: 'text-orange-500 bg-orange-100' },
  { id: 'cafe', label: 'Cafe', icon: Coffee, color: 'text-amber-600 bg-amber-100' },
  { id: 'park', label: 'Park', icon: TreePine, color: 'text-green-600 bg-green-100' },
  { id: 'activity', label: 'Activity', icon: Ticket, color: 'text-purple-500 bg-purple-100' },
  { id: 'travel', label: 'Travel', icon: Plane, color: 'text-blue-500 bg-blue-100' },
  { id: 'other', label: 'Other', icon: StickyNote, color: 'text-gray-500 bg-gray-100' },
]

const CATEGORY_ICONS: Record<string, string> = {
  restaurant: '🍽️',
  cafe: '☕',
  park: '🌳',
  activity: '🎫',
  travel: '✈️',
  other: '📌',
}

export default function LocationsPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }
    if (user && slug) {
      ;(async () => {
        setLoading(true)

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
          .from('shared_locations')
          .select('*')
          .eq('space_id', space.id)
          .order('created_at', { ascending: false })

        setLocations(data || [])
        setLoading(false)
      })()
    }
  }, [user, authLoading, router, slug, supabase])

  const deleteLocation = useCallback(async (id: string) => {
    if (!confirm('Delete this location?')) return

    setDeleting(id)
    await supabase.from('shared_locations').delete().eq('id', id)
    setLocations((prev) => prev.filter((l) => l.id !== id))
    setDeleting(null)
  }, [supabase])

  const getCategoryInfo = (catId: string) => {
    return CATEGORIES.find((c) => c.id === catId) || CATEGORIES[5]
  }

  const filteredLocations =
    filter === 'all'
      ? locations
      : locations.filter((l) => l.category === filter)

  // Locations that have coordinates for the map
  const mappedLocations = useMemo(
    () => filteredLocations.filter((l) => l.latitude != null && l.longitude != null),
    [filteredLocations]
  )

  // Compute map center from all locations with coordinates
  const mapCenter = useMemo(() => {
    const allWithCoords = locations.filter(
      (l) => l.latitude != null && l.longitude != null
    )
    if (allWithCoords.length === 0) {
      // Default: Jakarta, Indonesia
      return { lat: -6.2088, lng: 106.8456 }
    }
    const lat =
      allWithCoords.reduce((sum, l) => sum + (l.latitude as number), 0) /
      allWithCoords.length
    const lng =
      allWithCoords.reduce((sum, l) => sum + (l.longitude as number), 0) /
      allWithCoords.length
    return { lat, lng }
  }, [locations])

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Shared Locations
            </h1>
            <p className="text-gray-600">
              Places you want to visit together
            </p>
          </div>
          <Link
            href={`/spaces/${slug}/locations/create`}
            className="inline-flex items-center gap-2 rounded-full bg-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-600"
          >
            <Plus className="h-4 w-4" />
            Add Location
          </Link>
        </div>
      }
    >
      {/* Interactive Map */}
      {locations.length > 0 && (
        <div className="mb-6 rounded-3xl overflow-hidden border border-pink-200 shadow-sm">
          <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={mappedLocations.length === 1 ? 14 : 11}
            scrollWheelZoom={false}
            style={{ height: '400px', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {mappedLocations.map((location) => (
              <Marker
                key={location.id}
                position={[location.latitude as number, location.longitude as number]}
              >
                <Popup>
                  <div className="min-w-[180px]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{CATEGORY_ICONS[location.category] || '📌'}</span>
                      <strong className="text-gray-900">{location.name}</strong>
                    </div>
                    {location.address && (
                      <p className="text-gray-600 text-xs">
                        {location.address}
                        {location.city ? `, ${location.city}` : ''}
                      </p>
                    )}
                    {location.rating && (
                      <div className="flex items-center gap-0.5 mt-1">
                        {Array.from({ length: location.rating }).map((_, i) => (
                          <span key={i} className="text-yellow-400 text-xs">★</span>
                        ))}
                      </div>
                    )}
                    {location.notes && (
                      <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                        {location.notes}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
            filter === 'all'
              ? 'bg-pink-500 text-white'
              : 'bg-white text-gray-600 hover:bg-pink-50 border border-gray-200'
          }`}
        >
          All ({locations.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = locations.filter((l) => l.category === cat.id).length
          if (count === 0) return null
          return (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                filter === cat.id
                  ? 'bg-pink-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-pink-50 border border-gray-200'
              }`}
            >
              {cat.label} ({count})
            </button>
          )
        })}
      </div>

      {locations.length === 0 ? (
        <div className="text-center py-20">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-pink-100 text-pink-500 mb-6">
            <MapPin className="h-12 w-12" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            No saved locations yet
          </h2>
          <p className="text-gray-600 mb-6">
            Save places you want to visit together!
          </p>
          <Link
            href={`/spaces/${slug}/locations/create`}
            className="inline-flex items-center gap-2 rounded-full bg-pink-500 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-pink-600"
          >
            <Plus className="h-5 w-5" />
            Add First Location
          </Link>
        </div>
      ) : filteredLocations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No locations in this category yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLocations.map((location) => {
            const catInfo = getCategoryInfo(location.category)
            const CatIcon = catInfo.icon
            return (
              <div
                key={location.id}
                className="group rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-5 transition-all hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`shrink-0 h-12 w-12 rounded-xl flex items-center justify-center ${catInfo.color}`}
                  >
                    <CatIcon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {location.name}
                      </h3>
                      {location.rating && (
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: location.rating }).map(
                            (_, i) => (
                              <Star
                                key={i}
                                className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400"
                              />
                            )
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500">
                      {location.address && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {location.address}
                          {location.city && `, ${location.city}`}
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${catInfo.color}`}
                      >
                        {catInfo.label}
                      </span>
                    </div>
                    {location.notes && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {location.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Link
                      href={`/spaces/${slug}/locations/${location.id}/edit`}
                      className="p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => deleteLocation(location.id)}
                      disabled={deleting === location.id}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    >
                      {deleting === location.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </AuthenticatedLayout>
  )
}
