import type { AdopcionFormValues, AdopcionPayload } from "../types"

export const estadoAdopcionOptions = [
  "disponible",
  "en_proceso",
  "adoptado",
  "inactivo",
] as const

export const tamanoAdopcionOptions = ["Pequeno", "Mediano", "Grande"] as const

export const adopcionInitialValues: AdopcionFormValues = {
  usuario_id: "",
  especie_id: "",
  raza_id: "",
  nombre: "",
  foto: "",
  edad_aproximada: "",
  sexo: "MACHO",
  tamano: "Mediano",
  ubicacion: "",
  telefono_contacto: "",
  referencia_ubicacion: "",
  latitud: "",
  longitud: "",
  estado_adopcion: "disponible",
  descripcion: "",
  estado_salud: "",
}

export function mapAdopcionFormToPayload(
  data: AdopcionFormValues,
  includeUsuario: boolean,
): AdopcionPayload {
  const ubicacionFallback =
    data.ubicacion.trim() ||
    data.referencia_ubicacion.trim() ||
    (data.latitud.trim() && data.longitud.trim()
      ? `${data.latitud.trim()}, ${data.longitud.trim()}`
      : "")

  return {
    ...(includeUsuario && data.usuario_id ? { usuario_id: Number(data.usuario_id) } : {}),
    especie_id: Number(data.especie_id),
    raza_id: data.raza_id === "" ? null : Number(data.raza_id),
    nombre: data.nombre.trim(),
    foto: data.foto.trim() || null,
    edad_aproximada: data.edad_aproximada.trim() || null,
    sexo: data.sexo || null,
    tamano: data.tamano || null,
    ubicacion: ubicacionFallback,
    telefono_contacto: data.telefono_contacto.trim(),
    referencia_ubicacion: data.referencia_ubicacion.trim() || null,
    latitud: data.latitud.trim() || null,
    longitud: data.longitud.trim() || null,
    estado_adopcion: data.estado_adopcion,
    descripcion: data.descripcion.trim(),
    estado_salud: data.estado_salud.trim(),
  }
}

export function estadoAdopcionLabel(value: string) {
  const labels: Record<string, string> = {
    disponible: "Disponible",
    en_proceso: "En proceso",
    adoptado: "Adoptado",
    inactivo: "Inactivo",
  }
  return labels[value] ?? value
}
