import { useState } from "react"
import { ImagePlus, X } from "lucide-react"
import type { AdopcionFormValues } from "../types"
import type {
  ClienteOption,
  EspecieOption,
  RazaOption,
} from "../../Gestionar_Mascotas/types"
import { estadoAdopcionLabel, estadoAdopcionOptions, tamanoAdopcionOptions } from "../store"
import { AdopcionLocationPicker } from "./AdopcionLocationPicker"
import { resolveMediaUrl } from "../utils"

interface AdopcionFormProps {
  values: AdopcionFormValues
  clientes: ClienteOption[]
  especies: EspecieOption[]
  razas: RazaOption[]
  editing: boolean
  showUsuario: boolean
  onChange: (field: keyof AdopcionFormValues, value: string | number) => void
  onEspecieChange: (value: number | "") => void
  onPhotoSelected: (file: File) => Promise<void>
}

export function AdopcionForm({
  values,
  clientes,
  especies,
  razas,
  editing,
  showUsuario,
  onChange,
  onEspecieChange,
  onPhotoSelected,
}: AdopcionFormProps) {
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)

  const handlePhotoChange = async (file?: File) => {
    if (!file) return
    setUploadingPhoto(true)
    setPhotoError(null)
    try {
      await onPhotoSelected(file)
    } catch {
      setPhotoError("No se pudo subir la foto. Intenta con JPG, PNG o WEBP menor a 5MB.")
    } finally {
      setUploadingPhoto(false)
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {showUsuario && (
        <label className="space-y-2 text-sm font-medium text-[#374151]">
          Publicado por
          <select
            value={values.usuario_id}
            onChange={(event) =>
              onChange("usuario_id", event.target.value ? Number(event.target.value) : "")
            }
            className="h-11 w-full rounded-xl border border-[#E5E7EB] px-3"
          >
            <option value="">Usuario actual</option>
            {clientes.map((cliente) => (
              <option key={cliente.id_usuario} value={cliente.id_usuario}>
                {cliente.nombre}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="space-y-2 text-sm font-medium text-[#374151]">
        Nombre
        <input
          value={values.nombre}
          onChange={(event) => onChange("nombre", event.target.value)}
          className="h-11 w-full rounded-xl border border-[#E5E7EB] px-3"
        />
      </label>

      <label className="space-y-2 text-sm font-medium text-[#374151]">
        Especie
        <select
          value={values.especie_id}
          onChange={(event) =>
            onEspecieChange(event.target.value ? Number(event.target.value) : "")
          }
          className="h-11 w-full rounded-xl border border-[#E5E7EB] px-3"
        >
          <option value="">Selecciona</option>
          {especies.map((especie) => (
            <option key={especie.id_especie} value={especie.id_especie}>
              {especie.nombre}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2 text-sm font-medium text-[#374151]">
        Raza
        <select
          value={values.raza_id}
          onChange={(event) =>
            onChange("raza_id", event.target.value ? Number(event.target.value) : "")
          }
          className="h-11 w-full rounded-xl border border-[#E5E7EB] px-3"
        >
          <option value="">Sin raza</option>
          {razas.map((raza) => (
            <option key={raza.id_raza} value={raza.id_raza}>
              {raza.nombre}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2 text-sm font-medium text-[#374151]">
        Edad aproximada
        <input
          value={values.edad_aproximada}
          onChange={(event) => onChange("edad_aproximada", event.target.value)}
          className="h-11 w-full rounded-xl border border-[#E5E7EB] px-3"
        />
      </label>

      <label className="space-y-2 text-sm font-medium text-[#374151]">
        Sexo
        <select
          value={values.sexo}
          onChange={(event) => onChange("sexo", event.target.value)}
          className="h-11 w-full rounded-xl border border-[#E5E7EB] px-3"
        >
          <option value="MACHO">Macho</option>
          <option value="HEMBRA">Hembra</option>
        </select>
      </label>

      <label className="space-y-2 text-sm font-medium text-[#374151]">
        Tamano
        <select
          value={values.tamano}
          onChange={(event) => onChange("tamano", event.target.value)}
          className="h-11 w-full rounded-xl border border-[#E5E7EB] px-3"
        >
          {tamanoAdopcionOptions.map((tamano) => (
            <option key={tamano} value={tamano}>
              {tamano}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2 text-sm font-medium text-[#374151]">
        Ubicacion
        <input
          value={values.ubicacion}
          onChange={(event) => onChange("ubicacion", event.target.value)}
          className="h-11 w-full rounded-xl border border-[#E5E7EB] px-3"
        />
      </label>

      <label className="space-y-2 text-sm font-medium text-[#374151]">
        Telefono de contacto
        <input
          value={values.telefono_contacto}
          onChange={(event) => onChange("telefono_contacto", event.target.value)}
          className="h-11 w-full rounded-xl border border-[#E5E7EB] px-3"
        />
      </label>

      <label className="space-y-2 text-sm font-medium text-[#374151] md:col-span-2">
        Referencia de ubicacion
        <textarea
          value={values.referencia_ubicacion}
          onChange={(event) => onChange("referencia_ubicacion", event.target.value)}
          className="min-h-20 w-full rounded-xl border border-[#E5E7EB] px-3 py-2"
          placeholder="Ejemplo: al lado de la cancha, frente al parque, casa azul con reja negra"
        />
      </label>

      <label className="space-y-2 text-sm font-medium text-[#374151]">
        Latitud
        <input
          value={values.latitud}
          onChange={(event) => onChange("latitud", event.target.value)}
          inputMode="decimal"
          step="0.000001"
          className="h-11 w-full rounded-xl border border-[#E5E7EB] px-3"
        />
      </label>

      <label className="space-y-2 text-sm font-medium text-[#374151]">
        Longitud
        <input
          value={values.longitud}
          onChange={(event) => onChange("longitud", event.target.value)}
          inputMode="decimal"
          step="0.000001"
          className="h-11 w-full rounded-xl border border-[#E5E7EB] px-3"
        />
      </label>

      <AdopcionLocationPicker
        latitud={values.latitud}
        longitud={values.longitud}
        onChange={({ latitud, longitud }) => {
          onChange("latitud", latitud)
          onChange("longitud", longitud)
        }}
      />

      {editing && (
        <label className="space-y-2 text-sm font-medium text-[#374151]">
          Estado
          <select
            value={values.estado_adopcion}
            onChange={(event) => onChange("estado_adopcion", event.target.value)}
            className="h-11 w-full rounded-xl border border-[#E5E7EB] px-3"
          >
            {estadoAdopcionOptions.map((estado) => (
              <option key={estado} value={estado}>
                {estadoAdopcionLabel(estado)}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="space-y-3 md:col-span-2">
        <p className="text-sm font-medium text-[#374151]">Foto del animal</p>
        <div className="grid gap-4 md:grid-cols-[180px_1fr]">
          <div className="h-36 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#FFF7ED]">
            {values.foto ? (
              <img
                src={resolveMediaUrl(values.foto)}
                alt={values.nombre || "Foto de adopcion"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-[#F97316]">
                <ImagePlus className="h-8 w-8" />
                <span className="text-sm font-medium">Sin foto</span>
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center gap-3">
            <label className="inline-flex h-11 w-fit cursor-pointer items-center justify-center rounded-xl border border-[#F97316] bg-[#FFF7ED] px-4 text-sm font-semibold text-[#C2410C] transition hover:bg-[#FFEDD5]">
              {uploadingPhoto ? "Subiendo..." : "Seleccionar foto"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="sr-only"
                disabled={uploadingPhoto}
                onChange={(event) => handlePhotoChange(event.target.files?.[0])}
              />
            </label>
            {values.foto && (
              <button
                type="button"
                onClick={() => onChange("foto", "")}
                className="inline-flex h-9 w-fit items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB]"
              >
                <X className="h-4 w-4" />
                Quitar foto
              </button>
            )}
            <p className="text-xs text-[#6B7280]">
              Formatos permitidos: JPG, PNG o WEBP. Tamano maximo: 5MB.
            </p>
            {photoError && <p className="text-xs text-red-600">{photoError}</p>}
          </div>
        </div>
      </div>

      <label className="space-y-2 text-sm font-medium text-[#374151] md:col-span-2">
        Descripcion
        <textarea
          value={values.descripcion}
          onChange={(event) => onChange("descripcion", event.target.value)}
          className="min-h-24 w-full rounded-xl border border-[#E5E7EB] px-3 py-2"
        />
      </label>

      <label className="space-y-2 text-sm font-medium text-[#374151] md:col-span-2">
        Estado de salud
        <textarea
          value={values.estado_salud}
          onChange={(event) => onChange("estado_salud", event.target.value)}
          className="min-h-20 w-full rounded-xl border border-[#E5E7EB] px-3 py-2"
        />
      </label>
    </div>
  )
}
