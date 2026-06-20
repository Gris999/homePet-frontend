import { Button } from "@/components/ui/button"
import type { Adopcion } from "../types"
import { estadoAdopcionLabel } from "../store"
import { resolveMediaUrl } from "../utils"

interface Props {
  open: boolean
  adopcion: Adopcion | null
  onClose: () => void
}

export function AdopcionDetailsDialog({ open, adopcion, onClose }: Props) {
  if (!open || !adopcion) return null

  const phone = sanitizePhoneForTel(adopcion.telefono_contacto)
  const whatsappPhone = sanitizePhoneForWhatsApp(adopcion.telefono_contacto)
  const mapsUrl = buildMapsUrl(adopcion.latitud, adopcion.longitud)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-[#111827]">{adopcion.nombre}</h2>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#D4D4D8] bg-white text-[#18181B] hover:bg-[#F4F4F5]"
          >
            Cerrar
          </Button>
        </div>
        <div className="grid gap-5 md:grid-cols-[220px_1fr]">
          <div className="h-56 overflow-hidden rounded-2xl bg-[#FFF7ED]">
            {adopcion.foto ? (
              <img
                src={resolveMediaUrl(adopcion.foto)}
                alt={adopcion.nombre}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[#F97316]">
                Sin foto
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Info label="Especie" value={adopcion.especie?.nombre} />
            <Info label="Raza" value={adopcion.raza?.nombre} />
            <Info label="Edad" value={adopcion.edad_aproximada} />
            <Info label="Sexo" value={adopcion.sexo} />
            <Info label="Tamano" value={adopcion.tamano} />
            <Info label="Ubicacion" value={adopcion.ubicacion} />
            <Info label="Telefono" value={adopcion.telefono_contacto} />
            <Info label="Referencia" value={adopcion.referencia_ubicacion} />
            <Info
              label="Coordenadas"
              value={adopcion.latitud && adopcion.longitud ? `${adopcion.latitud}, ${adopcion.longitud}` : null}
            />
            <Info label="Estado" value={estadoAdopcionLabel(adopcion.estado_adopcion)} />
            <Info label="Publicado por" value={adopcion.usuario?.nombre} />
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          {phone && (
            <a
              href={`tel:${phone}`}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#F97316] px-4 text-sm font-semibold text-white hover:bg-[#EA580C]"
            >
              Llamar
            </a>
          )}
          {phone && (
            <a
              href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
                `Hola, vi la publicación de adopción de ${adopcion.nombre}.`,
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-[#25D366] bg-white px-4 text-sm font-semibold text-[#128C7E] hover:bg-[#F0FDF4]"
            >
              WhatsApp
            </a>
          )}
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#18181B] hover:bg-[#F4F4F5]"
            >
              Ver en mapa
            </a>
          )}
        </div>
        <div className="mt-5 space-y-4 text-sm text-[#374151]">
          <section>
            <h3 className="font-semibold text-[#111827]">Descripcion</h3>
            <p className="mt-1 whitespace-pre-wrap">{adopcion.descripcion}</p>
          </section>
          <section>
            <h3 className="font-semibold text-[#111827]">Estado de salud</h3>
            <p className="mt-1 whitespace-pre-wrap">{adopcion.estado_salud}</p>
          </section>
        </div>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-xl bg-[#FAFAFA] p-3">
      <p className="text-xs font-semibold uppercase text-[#7C3AED]">{label}</p>
      <p className="mt-1 text-[#18181B]">{value || "-"}</p>
    </div>
  )
}

function sanitizePhoneForTel(value?: string | null) {
  const raw = (value || "").trim()
  if (!raw) return ""
  return raw.replace(/[^0-9+]/g, "")
}

function sanitizePhoneForWhatsApp(value?: string | null) {
  const raw = (value || "").trim()
  if (!raw) return ""
  return raw.replace(/\D/g, "")
}

function buildMapsUrl(latitud?: string | null, longitud?: string | null) {
  const lat = (latitud || "").trim()
  const lng = (longitud || "").trim()
  if (!lat || !lng) return null
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`
}
