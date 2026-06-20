import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAppSelector } from "@/store/hooks"
import {
  adopcionInitialValues,
  estadoAdopcionLabel,
  mapAdopcionFormToPayload,
  useGestionarAdopciones,
} from "../store"
import type { Adopcion, AdopcionFilters, AdopcionFormValues, EstadoAdopcion } from "../types"
import {
  AdopcionDetailsDialog,
  AdopcionDialog,
  AdopcionesTable,
  DeleteAdopcionConfirmation,
} from "../components"

function normalizeRole(value?: string) {
  return (value || "").trim().toUpperCase()
}

export function Gestionar_Adopciones() {
  const user = useAppSelector((state) => state.auth.user)
  const roleName = normalizeRole(user?.role)
  const isAdminLike = ["ADMIN", "VETERINARIAN", "VETERINARIO", "SUPERADMIN"].includes(roleName)

  const [search, setSearch] = useState("")
  const [estado, setEstado] = useState<EstadoAdopcion | "todos">("todos")
  const [soloMias, setSoloMias] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingAdopcion, setEditingAdopcion] = useState<Adopcion | null>(null)
  const [selectedAdopcion, setSelectedAdopcion] = useState<Adopcion | null>(null)
  const [detailsAdopcion, setDetailsAdopcion] = useState<Adopcion | null>(null)
  const [formValues, setFormValues] = useState<AdopcionFormValues>(adopcionInitialValues)

  const filters: AdopcionFilters = useMemo(
    () => ({
      search: search.trim() || undefined,
      estado_adopcion: estado,
      mias: soloMias,
      publica: !isAdminLike && !soloMias,
    }),
    [estado, isAdminLike, search, soloMias],
  )

  const {
    adopciones,
    clientes,
    especies,
    razas,
    loading,
    createAdopcion,
    updateAdopcion,
    deleteAdopcion,
    uploadAdopcionFoto,
    loadRazasByEspecie,
  } = useGestionarAdopciones(filters)

  const stats = useMemo(() => {
    return {
      total: adopciones.length,
      disponibles: adopciones.filter((item) => item.estado_adopcion === "disponible").length,
      enProceso: adopciones.filter((item) => item.estado_adopcion === "en_proceso").length,
    }
  }, [adopciones])

  const handleChange = (field: keyof AdopcionFormValues, value: string | number) => {
    setFormValues((prev) => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormValues(adopcionInitialValues)
    setEditingAdopcion(null)
  }

  const handleOpenCreate = async () => {
    resetForm()
    await loadRazasByEspecie("")
    setDialogOpen(true)
  }

  const handleEdit = async (adopcion: Adopcion) => {
    setEditingAdopcion(adopcion)
    const especieId = adopcion.especie?.id_especie ?? ""
    setFormValues({
      usuario_id: adopcion.usuario?.id_usuario ?? "",
      especie_id: especieId,
      raza_id: adopcion.raza?.id_raza ?? "",
      nombre: adopcion.nombre,
      foto: adopcion.foto ?? "",
      edad_aproximada: adopcion.edad_aproximada ?? "",
      sexo: adopcion.sexo ?? "MACHO",
      tamano: adopcion.tamano ?? "Mediano",
      ubicacion: adopcion.ubicacion,
      telefono_contacto: adopcion.telefono_contacto ?? "",
      referencia_ubicacion: adopcion.referencia_ubicacion ?? "",
      latitud: adopcion.latitud ?? "",
      longitud: adopcion.longitud ?? "",
      estado_adopcion: adopcion.estado_adopcion,
      descripcion: adopcion.descripcion,
      estado_salud: adopcion.estado_salud,
    })
    await loadRazasByEspecie(especieId)
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    const ubicacionFallback =
      formValues.ubicacion.trim() ||
      formValues.referencia_ubicacion.trim() ||
      (formValues.latitud.trim() && formValues.longitud.trim()
        ? `${formValues.latitud.trim()}, ${formValues.longitud.trim()}`
        : "")

    if (
      !formValues.nombre.trim() ||
      !formValues.especie_id ||
      !ubicacionFallback ||
      !formValues.telefono_contacto.trim()
    ) {
      alert("Completa nombre, especie y telefono de contacto. La ubicacion puede venir del mapa o la referencia.")
      return
    }
    if (!formValues.descripcion.trim() || !formValues.estado_salud.trim()) {
      alert("Completa descripcion y estado de salud.")
      return
    }
    if (
      (formValues.latitud.trim() && !formValues.longitud.trim()) ||
      (!formValues.latitud.trim() && formValues.longitud.trim())
    ) {
      alert("Si agregas coordenadas, debes completar latitud y longitud.")
      return
    }

    try {
      const payload = mapAdopcionFormToPayload(
        {
          ...formValues,
          ubicacion: ubicacionFallback,
        },
        isAdminLike,
      )
      if (editingAdopcion) {
        await updateAdopcion(editingAdopcion.id_adopcion, payload)
      } else {
        await createAdopcion(payload)
      }
      setDialogOpen(false)
      resetForm()
    } catch (error: any) {
      alert(error?.detail || "No se pudo guardar la publicacion.")
    }
  }

  const confirmDelete = async () => {
    if (!selectedAdopcion) return
    try {
      await deleteAdopcion(selectedAdopcion.id_adopcion)
      setDeleteOpen(false)
      setSelectedAdopcion(null)
    } catch (error: any) {
      alert(error?.detail || "No se pudo desactivar la publicacion.")
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] px-6 py-8 md:px-10">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-[#F97316]">Gestionar Adopciones</h1>
            <p className="mt-2 text-lg text-[#18181B]">
              Gestion de Clientes, Mascotas y Adopciones
            </p>
          </div>
          <Button
            onClick={handleOpenCreate}
            className="h-12 rounded-2xl bg-[#F97316] px-6 text-white hover:bg-[#EA580C]"
          >
            Nueva publicacion
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Metric label="Publicaciones" value={stats.total} tone="purple" />
          <Metric label="Disponibles" value={stats.disponibles} tone="orange" />
          <Metric label="En proceso" value={stats.enProceso} tone="purple" />
        </div>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <Input
            placeholder="Buscar por nombre, especie, raza, ubicacion o descripcion..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-12 rounded-2xl border-[#8B5CF6] bg-white text-[#7C3AED] md:max-w-xl"
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={estado}
              onChange={(event) => setEstado(event.target.value as EstadoAdopcion | "todos")}
              className="h-12 rounded-2xl border border-[#8B5CF6] bg-white px-4 text-[#7C3AED]"
            >
              <option value="todos">Todos los estados</option>
              {(["disponible", "en_proceso", "adoptado", "inactivo"] as EstadoAdopcion[]).map(
                (item) => (
                  <option key={item} value={item}>
                    {estadoAdopcionLabel(item)}
                  </option>
                ),
              )}
            </select>
            <Button
              type="button"
              variant={soloMias ? "default" : "outline"}
              onClick={() => setSoloMias((prev) => !prev)}
              className={
                soloMias
                  ? "h-12 rounded-2xl bg-[#7C3AED] text-white hover:bg-[#6D28D9]"
                  : "h-12 rounded-2xl border-[#D4D4D8] bg-white text-[#18181B] hover:bg-[#F4F4F5]"
              }
            >
              Mis publicaciones
            </Button>
          </div>
        </div>

        <p className="text-[#4B5563]">
          {loading ? "Cargando publicaciones..." : `Mostrando ${adopciones.length} publicaciones`}
        </p>

        <AdopcionesTable
          adopciones={adopciones}
          onViewDetails={(adopcion) => {
            setDetailsAdopcion(adopcion)
            setDetailsOpen(true)
          }}
          onEdit={handleEdit}
          onDelete={(adopcion) => {
            setSelectedAdopcion(adopcion)
            setDeleteOpen(true)
          }}
        />

        <AdopcionDialog
          open={dialogOpen}
          title={editingAdopcion ? "Editar publicacion" : "Nueva publicacion"}
          values={formValues}
          clientes={clientes}
          especies={especies}
          razas={razas}
          editing={Boolean(editingAdopcion)}
          showUsuario={isAdminLike}
          onChange={handleChange}
          onEspecieChange={(value) => {
            setFormValues((prev) => ({ ...prev, especie_id: value, raza_id: "" }))
            loadRazasByEspecie(value)
          }}
          onPhotoSelected={async (file) => {
            const uploaded = await uploadAdopcionFoto(file)
            setFormValues((prev) => ({ ...prev, foto: uploaded.url }))
          }}
          onClose={() => {
            setDialogOpen(false)
            resetForm()
          }}
          onSubmit={handleSubmit}
        />

        <AdopcionDetailsDialog
          open={detailsOpen}
          adopcion={detailsAdopcion}
          onClose={() => {
            setDetailsOpen(false)
            setDetailsAdopcion(null)
          }}
        />

        <DeleteAdopcionConfirmation
          open={deleteOpen}
          adopcion={selectedAdopcion}
          onClose={() => {
            setDeleteOpen(false)
            setSelectedAdopcion(null)
          }}
          onConfirm={confirmDelete}
        />
      </div>
    </div>
  )
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: "purple" | "orange"
}) {
  return (
    <div className="rounded-3xl border border-[#FED7AA] bg-white px-6 py-7 shadow-sm">
      <p className="text-lg text-[#18181B]">{label}</p>
      <h2 className={`mt-2 text-5xl font-bold ${tone === "purple" ? "text-[#7C3AED]" : "text-[#F97316]"}`}>
        {value}
      </h2>
    </div>
  )
}
