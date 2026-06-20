
interface AdopcionLocationPickerProps {
  latitud: string
  longitud: string
  onChange: (value: { latitud: string; longitud: string }) => void
}

const defaultLatitud = "-17.783300"
const defaultLongitud = "-63.182100"

export function AdopcionLocationPicker({ latitud, longitud, onChange }: AdopcionLocationPickerProps) {
  const hasCoordinates = Boolean(latitud && longitud)
  const mapsUrl = hasCoordinates
    ? `https://www.google.com/maps?q=${encodeURIComponent(`${latitud},${longitud}`)}`
    : null

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
          <p className="text-sm font-medium text-[#374151]">Ubicacion de referencia</p>
          <p className="text-xs text-[#6B7280]">
            Usa tu ubicacion actual o carga coordenadas manuales para la publicacion.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="h-10 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#18181B] hover:bg-[#F9FAFB]"
          >
            Usar mi ubicacion
          </button>
          <button
            type="button"
            onClick={() =>
              onChange({
                latitud: defaultLatitud,
                longitud: defaultLongitud,
              })
            }
            className="h-10 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#18181B] hover:bg-[#F9FAFB]"
          >
            Usar referencia base
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl bg-[#FFF7ED] p-4 text-sm text-[#9A3412]">
            <p className="font-semibold">Coordenadas sugeridas</p>
            <p className="mt-2">Latitud base: {defaultLatitud}</p>
            <p>Longitud base: {defaultLongitud}</p>
            <p className="mt-3 text-xs text-[#7C2D12]">
              Puedes reemplazarlas con tu ubicacion actual o copiar valores desde Google Maps.
            </p>
          </div>
          <div className="rounded-xl bg-[#FAFAFA] p-4 text-sm text-[#18181B]">
            <p className="font-semibold">Abrir en mapa</p>
            <p className="mt-2 text-[#6B7280]">
              Si ya cargaste latitud y longitud, puedes verificar el punto exacto en Google Maps.
            </p>
            {mapsUrl ? (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex h-10 items-center rounded-xl border border-[#C4B5FD] bg-white px-4 font-medium text-[#6D28D9] hover:bg-[#F5F3FF]"
              >
                Ver punto en Google Maps
              </a>
            ) : (
              <p className="mt-3 text-xs text-[#6B7280]">
                Completa ambas coordenadas para habilitar el enlace.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#FAFAFA] px-4 py-3 text-sm text-[#18181B]">
        <span>
          Coordenadas actuales: {hasCoordinates ? `${latitud}, ${longitud}` : "sin seleccionar"}
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
