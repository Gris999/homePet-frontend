import { Eye, Pencil, Trash2 } from "lucide-react"
import type { Adopcion } from "../types"
import { estadoAdopcionLabel } from "../store"
import { resolveMediaUrl } from "../utils"

interface AdopcionesTableProps {
  adopciones: Adopcion[]
  onViewDetails: (adopcion: Adopcion) => void
  onEdit: (adopcion: Adopcion) => void
  onDelete: (adopcion: Adopcion) => void
}

function badgeClass(estado: string) {
  const variants: Record<string, string> = {
    disponible: "border-emerald-200 bg-emerald-50 text-emerald-700",
    en_proceso: "border-sky-200 bg-sky-50 text-sky-700",
    adoptado: "border-violet-200 bg-violet-50 text-violet-700",
    inactivo: "border-zinc-200 bg-zinc-50 text-zinc-600",
  }
  return variants[estado] ?? variants.disponible
}

function canManage(adopcion: Adopcion) {
  return adopcion.puede_editar !== false
}

export function AdopcionesTable({
  adopciones,
  onViewDetails,
  onEdit,
  onDelete,
}: AdopcionesTableProps) {
  if (adopciones.length === 0) {
    return (
      <div className="rounded-2xl border border-[#FDBA74] bg-white px-6 py-10 text-center text-[#6B7280]">
        No hay publicaciones de adopcion
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#FDBA74] bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6] text-white">
            <tr className="text-left">
              <th className="px-6 py-4 font-semibold">Animal</th>
              <th className="px-6 py-4 font-semibold">Especie</th>
              <th className="px-6 py-4 font-semibold">Raza</th>
              <th className="px-6 py-4 font-semibold">Edad</th>
              <th className="px-6 py-4 font-semibold">Ubicacion</th>
              <th className="px-6 py-4 font-semibold">Contacto</th>
              <th className="px-6 py-4 font-semibold">Estado</th>
              <th className="px-6 py-4 font-semibold">Publicado por</th>
              <th className="px-6 py-4 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {adopciones.map((adopcion) => (
              <tr
                key={adopcion.id_adopcion}
                className="border-b border-[#FFEDD5] last:border-b-0 hover:bg-[#FFFDF9]"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 overflow-hidden rounded-xl bg-[#FFF7ED]">
                      {adopcion.foto ? (
                        <img
                          src={resolveMediaUrl(adopcion.foto)}
                          alt={adopcion.nombre}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#F97316]">
                          <span className="text-lg font-bold">P</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-[#111827]">{adopcion.nombre}</p>
                      <p className="text-xs text-[#6B7280]">{adopcion.sexo ?? "-"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-[#4B5563]">
                  {adopcion.especie?.nombre ?? "-"}
                </td>
                <td className="px-6 py-4 text-[#4B5563]">
                  {adopcion.raza?.nombre ?? "-"}
                </td>
                <td className="px-6 py-4 text-[#4B5563]">
                  {adopcion.edad_aproximada ?? "-"}
                </td>
                <td className="px-6 py-4 text-[#4B5563]">
                  <div>
                    <p>{adopcion.ubicacion}</p>
                    {adopcion.referencia_ubicacion && (
                      <p className="text-xs text-[#6B7280]">{adopcion.referencia_ubicacion}</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-[#4B5563]">
                  {adopcion.telefono_contacto ?? "-"}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${badgeClass(
                      adopcion.estado_adopcion,
                    )}`}
                  >
                    {estadoAdopcionLabel(adopcion.estado_adopcion)}
                  </span>
                </td>
                <td className="px-6 py-4 text-[#4B5563]">
                  {adopcion.usuario?.nombre ?? "-"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onViewDetails(adopcion)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#E9D5FF] text-[#7C3AED] hover:bg-[#FAF5FF]"
                      aria-label="Ver detalle"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {canManage(adopcion) && (
                      <>
                        <button
                          type="button"
                          onClick={() => onEdit(adopcion)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#FED7AA] text-[#F97316] hover:bg-[#FFF7ED]"
                          aria-label="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(adopcion)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                          aria-label="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
