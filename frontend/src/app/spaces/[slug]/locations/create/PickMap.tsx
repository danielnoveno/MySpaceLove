'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useMapEvents } from 'react-leaflet'

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

function MapClickHandler({ onPosition }: { onPosition: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPosition(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

type PickMapProps = {
  onPick: (lat: number, lng: number) => void
}

export default function PickMap({ onPick }: PickMapProps) {
  const [pickedPos, setPickedPos] = useState<[number, number] | null>(null)

  const handleClick = useCallback((lat: number, lng: number) => {
    setPickedPos([lat, lng])
  }, [])

  const handleConfirm = useCallback(() => {
    if (pickedPos) {
      onPick(pickedPos[0], pickedPos[1])
    }
  }, [pickedPos, onPick])

  return (
    <div>
      <p className="text-xs text-warm-500 mb-2">
        Click anywhere on the map to place a pin, then confirm.
      </p>
      <div className="rounded-2xl overflow-hidden border border-warm-200">
        <MapContainer
          center={[-6.2088, 106.8456]}
          zoom={11}
          style={{ height: '300px', width: '100%' }}
        >
          <MapClickHandler onPosition={handleClick} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {pickedPos && <Marker position={pickedPos} />}
        </MapContainer>
      </div>
      {pickedPos && (
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-warm-500">
            Pinned: {pickedPos[0].toFixed(6)}, {pickedPos[1].toFixed(6)}
          </span>
          <button
            type="button"
            onClick={handleConfirm}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 transition-colors"
          >
            Confirm Pin
          </button>
        </div>
      )}
    </div>
  )
}
