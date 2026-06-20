import { useEffect, useMemo } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet"

interface AdopcionLocationPickerProps {
  latitud: string
  longitud: string
  onChange: (value: { latitud: string; longitud: string }) => void
}

const defaultCenter: [number, number] = [-17.7833, -63.1821]

const pinIcon = L.divIcon({
  className: "adoption-map-pin",
  html: '<div style="width:18px;height:18px;border-radius:9999px;background:#F97316;border:3px solid #ffffff;box-shadow:0 8px 20px rgba(249,115,22,0.35);"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

export function AdopcionLocationPicker({ latitud, longitud, onChange }: AdopcionLocationPickerProps) {
  const parsedPoint = useMemo(() => {
    const lat = Number(latitud)
    const lng = Number(longitud)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
    return [lat, lng] as [number, number]
  }, [latitud, longitud])

  const center = parsedPoint ?? defaultCenter

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange({
          latitud: position.coords.latitude.toFixed(6),
          longitud: position.coords.longitude.toFixed(6),
        })
      },
      () => {
        // La selección manual sigue disponible si el navegador bloquea la ubicación.
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return (
    <div className="space-y-3 md:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#374151]">Ubicacion en mapa</p>
          <p className="text-xs text-[#6B7280]">Haz clic en el mapa para fijar la ubicacion de la publicacion.</p>
        </div>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="h-10 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#18181B] hover:bg-[#F9FAFB]"
        >
          Usar mi ubicacion
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
        <MapContainer
          center={center}
          zoom={parsedPoint ? 16 : 12}
          scrollWheelZoom
          style={{ height: 300, width: "100%" }}
        >
          <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapClickHandler
            onPick={(point) =>
              onChange({
                latitud: point[0].toFixed(6),
                longitud: point[1].toFixed(6),
              })
            }
          />
          <MapViewport point={parsedPoint ?? center} />
          {parsedPoint && <Marker position={parsedPoint} icon={pinIcon} />}
        </MapContainer>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#FAFAFA] px-4 py-3 text-sm text-[#18181B]">
        <span>
          Coordenadas actuales: {parsedPoint ? `${parsedPoint[0].toFixed(6)}, ${parsedPoint[1].toFixed(6)}` : "sin seleccionar"}
        </span>
        <button
          type="button"
          onClick={() => onChange({ latitud: "", longitud: "" })}
          className="font-medium text-[#7C3AED] hover:text-[#6D28D9]"
        >
          Limpiar
        </button>
      </div>
    </div>
  )
}

function MapClickHandler({ onPick }: { onPick: (point: [number, number]) => void }) {
  useMapEvents({
    click(event) {
      onPick([event.latlng.lat, event.latlng.lng])
    },
  })

  return null
}

function MapViewport({ point }: { point: [number, number] }) {
  const map = useMap()

  useEffect(() => {
    map.setView(point, point === defaultCenter ? 12 : 16)
  }, [map, point])

  return null
}
