import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  useCreateConsultaClinicaMutation,
  useUpdateConsultaClinicaMutation,
  useGetVeterinariosQuery,
  type ConsultaClinica,
} from "../store"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  idHistorialClinico: number | null
  nombreMascota?: string
  modo?: "crear" | "editar"
  consultaInicial?: ConsultaClinica | null
}

interface FormState {
  usuario_veterinario: string
  fecha_consulta: string
  motivo_consulta: string
  diagnostico: string
  observaciones: string
  peso: string
  temperatura: string
  frecuencia_cardiaca: string
  frecuencia_respiratoria: string
  proxima_revision: string
}

const initialForm: FormState = {
  usuario_veterinario: "",
  fecha_consulta: "",
  motivo_consulta: "",
  diagnostico: "",
  observaciones: "",
  peso: "",
  temperatura: "",
  frecuencia_cardiaca: "",
  frecuencia_respiratoria: "",
  proxima_revision: "",
}

function toInputDateTime(value?: string | null) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function toStringSafe(value: unknown) {
  if (value === null || value === undefined) return ""
  return String(value)
}

function openNativePicker(event: React.MouseEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) {
  const input = event.currentTarget as HTMLInputElement & {
    showPicker?: () => void
  }

  input.showPicker?.()
}

export function NuevaConsultaDialog({
  open,
  onOpenChange,
  idHistorialClinico,
  nombreMascota,
  modo = "crear",
  consultaInicial = null,
}: Props) {
  const [form, setForm] = useState<FormState>(initialForm)
  const [error, setError] = useState("")

  const [createConsultaClinica, { isLoading: isCreating }] =
    useCreateConsultaClinicaMutation()

  const [updateConsultaClinica, { isLoading: isUpdating }] =
    useUpdateConsultaClinicaMutation()

  const { data: veterinarios = [], isLoading: loadingVeterinarios } =
    useGetVeterinariosQuery()

  const isEditing = modo === "editar"
  const isLoading = isCreating || isUpdating

  useEffect(() => {
    if (!open) return

    setError("")

    if (isEditing && consultaInicial) {
      setForm({
        usuario_veterinario: toStringSafe(consultaInicial.usuario_veterinario),
        fecha_consulta: toInputDateTime(consultaInicial.fecha_consulta),
        motivo_consulta: consultaInicial.motivo_consulta ?? "",
        diagnostico: consultaInicial.diagnostico ?? "",
        observaciones: consultaInicial.observaciones ?? "",
        peso: toStringSafe(consultaInicial.peso),
        temperatura: toStringSafe(consultaInicial.temperatura),
        frecuencia_cardiaca: toStringSafe(consultaInicial.frecuencia_cardiaca),
        frecuencia_respiratoria: toStringSafe(
          consultaInicial.frecuencia_respiratoria
        ),
        proxima_revision: toInputDateTime(consultaInicial.proxima_revision),
      })
    } else {
      setForm(initialForm)
    }
  }, [open, isEditing, consultaInicial])

  const veterinariosOptions = useMemo(() => {
    return veterinarios.map((vet: any) => ({
      id: vet.id_usuario ?? vet.id ?? vet.usuario_id ?? vet.value,
      nombre:
        vet.nombre ??
        vet.veterinario_nombre ??
        vet.label ??
        vet.correo ??
        "Veterinario",
    }))
  }, [veterinarios])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const buildPayload = () => ({
    usuario_veterinario: Number(form.usuario_veterinario),
    fecha_consulta: form.fecha_consulta,
    motivo_consulta: form.motivo_consulta.trim(),
    diagnostico: form.diagnostico.trim() || null,
    observaciones: form.observaciones.trim() || null,
    peso: form.peso ? Number(form.peso) : null,
    temperatura: form.temperatura ? Number(form.temperatura) : null,
    frecuencia_cardiaca: form.frecuencia_cardiaca
      ? Number(form.frecuencia_cardiaca)
      : null,
    frecuencia_respiratoria: form.frecuencia_respiratoria
      ? Number(form.frecuencia_respiratoria)
      : null,
    proxima_revision: form.proxima_revision || null,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!form.usuario_veterinario) {
      setError("Debes seleccionar un veterinario.")
      return
    }

    if (!form.fecha_consulta) {
      setError("Debes seleccionar la fecha de la consulta.")
      return
    }

    if (!form.motivo_consulta.trim()) {
      setError("El motivo de consulta es obligatorio.")
      return
    }

    try {
      if (isEditing) {
        if (!consultaInicial?.id_consulta_clinica) {
          setError("No se encontró la consulta a editar.")
          return
        }

        await updateConsultaClinica({
          idConsultaClinica: consultaInicial.id_consulta_clinica,
          body: buildPayload(),
        }).unwrap()
      } else {
        if (!idHistorialClinico) {
          setError("No se encontró el historial clínico seleccionado.")
          return
        }

        await createConsultaClinica({
          idHistorialClinico,
          body: buildPayload(),
        }).unwrap()
      }

      onOpenChange(false)
      setForm(initialForm)
    } catch (err: any) {
      console.error(err)

      if (err?.data) {
        const backendError =
          typeof err.data === "string"
            ? err.data
            : JSON.stringify(err.data)
        setError(
          isEditing
            ? `No se pudo actualizar la consulta. ${backendError}`
            : `No se pudo registrar la consulta. ${backendError}`
        )
      } else {
        setError(
          isEditing
            ? "No se pudo actualizar la consulta clínica."
            : "No se pudo registrar la consulta clínica."
        )
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[95vw] !max-w-[95vw] sm:!max-w-[1100px] max-h-[90vh] overflow-hidden rounded-[32px] border border-orange-200 bg-white p-0 shadow-2xl">
        <form onSubmit={handleSubmit} className="flex max-h-[90vh] flex-col">
          <div className="bg-gradient-to-r from-violet-700 via-violet-500 to-violet-400 px-8 py-7 text-white md:px-10">
            <div className="pr-10">
              <h2 className="text-3xl font-extrabold leading-tight md:text-5xl">
                {isEditing ? "Editar consulta clínica" : "Nueva consulta clínica"}
              </h2>
              <p className="mt-2 text-base text-white/90 md:text-xl">
                {isEditing
                  ? "Actualiza la información clínica registrada."
                  : "Registra la atención médica realizada a la mascota."}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-7 md:px-10">
            <div className="space-y-6">
              <section className="rounded-[28px] border border-violet-200 bg-violet-50/70 p-6 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-wide text-violet-600">
                  Mascota seleccionada
                </p>
                <p className="mt-2 text-2xl font-bold text-violet-700">
                  {nombreMascota || consultaInicial?.mascota_nombre || "Sin mascota seleccionada"}
                </p>
              </section>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <section className="rounded-[28px] border border-orange-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-violet-600">
                    Datos principales
                  </h3>
                  <p className="mt-1 text-base text-slate-600">
                    Completa la información clínica principal de la atención.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-base font-semibold text-slate-800">
                      Veterinario
                    </label>
                    <select
                      name="usuario_veterinario"
                      value={form.usuario_veterinario}
                      onChange={handleChange}
                      disabled={loadingVeterinarios}
                      className="h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 text-base text-slate-800 outline-none transition focus:border-violet-500"
                    >
                      <option value="">
                        {loadingVeterinarios
                          ? "Cargando veterinarios..."
                          : "Selecciona un veterinario"}
                      </option>
                      {veterinariosOptions.map((vet) => (
                        <option key={vet.id} value={vet.id}>
                          {vet.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-base font-semibold text-slate-800">
                      Fecha de consulta
                    </label>
                    <Input
                      type="datetime-local"
                      name="fecha_consulta"
                      value={form.fecha_consulta}
                      onChange={handleChange}
                      onClick={openNativePicker}
                      onFocus={openNativePicker}
                      className="h-14 rounded-2xl border-slate-300 text-base focus-visible:ring-violet-500"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-base font-semibold text-slate-800">
                      Motivo de consulta
                    </label>
                    <Textarea
                      name="motivo_consulta"
                      value={form.motivo_consulta}
                      onChange={handleChange}
                      placeholder="Ej: control general, vómitos, alergia, revisión de herida..."
                      className="min-h-[110px] rounded-2xl border-slate-300 text-base focus-visible:ring-violet-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-base font-semibold text-slate-800">
                      Diagnóstico
                    </label>
                    <Textarea
                      name="diagnostico"
                      value={form.diagnostico}
                      onChange={handleChange}
                      placeholder="Diagnóstico clínico"
                      className="min-h-[110px] rounded-2xl border-slate-300 text-base focus-visible:ring-violet-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-base font-semibold text-slate-800">
                      Observaciones
                    </label>
                    <Textarea
                      name="observaciones"
                      value={form.observaciones}
                      onChange={handleChange}
                      placeholder="Observaciones adicionales"
                      className="min-h-[110px] rounded-2xl border-slate-300 text-base focus-visible:ring-violet-500"
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-[28px] border border-orange-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-violet-600">
                    Signos vitales y medidas
                  </h3>
                  <p className="mt-1 text-base text-slate-600">
                    Registra los datos clínicos si están disponibles.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                  <div className="space-y-2">
                    <label className="text-base font-semibold text-slate-800">
                      Peso (kg)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      name="peso"
                      value={form.peso}
                      onChange={handleChange}
                      placeholder="Ej: 12.50"
                      className="h-14 rounded-2xl border-slate-300 text-base focus-visible:ring-violet-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-base font-semibold text-slate-800">
                      Temperatura (°C)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      name="temperatura"
                      value={form.temperatura}
                      onChange={handleChange}
                      placeholder="Ej: 38.5"
                      className="h-14 rounded-2xl border-slate-300 text-base focus-visible:ring-violet-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-base font-semibold text-slate-800">
                      Frecuencia cardíaca
                    </label>
                    <Input
                      type="number"
                      name="frecuencia_cardiaca"
                      value={form.frecuencia_cardiaca}
                      onChange={handleChange}
                      placeholder="Ej: 90"
                      className="h-14 rounded-2xl border-slate-300 text-base focus-visible:ring-violet-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-base font-semibold text-slate-800">
                      Frecuencia respiratoria
                    </label>
                    <Input
                      type="number"
                      name="frecuencia_respiratoria"
                      value={form.frecuencia_respiratoria}
                      onChange={handleChange}
                      placeholder="Ej: 24"
                      className="h-14 rounded-2xl border-slate-300 text-base focus-visible:ring-violet-500"
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-[28px] border border-orange-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-violet-600">
                    Seguimiento
                  </h3>
                  <p className="mt-1 text-base text-slate-600">
                    Programa la próxima revisión si corresponde.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-base font-semibold text-slate-800">
                      Próxima revisión
                    </label>
                    <Input
                      type="datetime-local"
                      name="proxima_revision"
                      value={form.proxima_revision}
                      onChange={handleChange}
                      onClick={openNativePicker}
                      onFocus={openNativePicker}
                      className="h-14 rounded-2xl border-slate-300 text-base focus-visible:ring-violet-500"
                    />
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-4 border-t border-slate-200 bg-white px-8 py-5 md:px-10">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-12 rounded-2xl border-violet-500 px-6 text-lg font-semibold text-violet-600 hover:bg-violet-50"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 rounded-2xl bg-orange-500 px-6 text-lg font-semibold text-white hover:bg-orange-600"
            >
              {isLoading
                ? isEditing
                  ? "Actualizando..."
                  : "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Guardar consulta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
