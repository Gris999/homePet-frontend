export type EstadoAdopcion = "disponible" | "en_proceso" | "adoptado" | "inactivo"
export type SexoAdopcion = "MACHO" | "HEMBRA"
export type TamanoAdopcion = "Pequeno" | "Mediano" | "Grande"

export interface AdopcionEspecie {
  id_especie: number
  nombre: string
}

export interface AdopcionRaza {
  id_raza: number
  nombre: string
}

export interface AdopcionUsuario {
  id_usuario: number
  correo?: string
  nombre: string
}

export interface Adopcion {
  id_adopcion: number
  nombre: string
  foto: string | null
  edad_aproximada: string | null
  sexo: SexoAdopcion | null
  tamano: TamanoAdopcion | null
  ubicacion: string
  telefono_contacto: string | null
  referencia_ubicacion: string | null
  latitud: string | null
  longitud: string | null
  estado_adopcion: EstadoAdopcion
  descripcion: string
  estado_salud: string
  fecha_publicacion: string
  fecha_actualizacion: string
  usuario?: AdopcionUsuario | null
  especie?: AdopcionEspecie | null
  raza?: AdopcionRaza | null
  puede_editar?: boolean
}

export interface AdopcionPayload {
  usuario_id?: number
  especie_id: number
  raza_id: number | null
  nombre: string
  foto: string | null
  edad_aproximada: string | null
  sexo: SexoAdopcion | null
  tamano: TamanoAdopcion | null
  ubicacion: string
  telefono_contacto: string
  referencia_ubicacion: string | null
  latitud: string | null
  longitud: string | null
  estado_adopcion?: EstadoAdopcion
  descripcion: string
  estado_salud: string
}

export interface AdopcionFormValues {
  usuario_id: number | ""
  especie_id: number | ""
  raza_id: number | ""
  nombre: string
  foto: string
  edad_aproximada: string
  sexo: SexoAdopcion
  tamano: TamanoAdopcion
  ubicacion: string
  telefono_contacto: string
  referencia_ubicacion: string
  latitud: string
  longitud: string
  estado_adopcion: EstadoAdopcion
  descripcion: string
  estado_salud: string
}

export interface AdopcionFilters {
  search?: string
  estado_adopcion?: EstadoAdopcion | "todos"
  especie_id?: number | ""
  mias?: boolean
  publica?: boolean
}
