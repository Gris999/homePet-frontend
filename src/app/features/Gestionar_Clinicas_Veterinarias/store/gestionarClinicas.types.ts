export interface Veterinaria {
  id_veterinaria: number
  nombre: string
  slug: string
  nit: string | null
  correo: string | null
  telefono: string | null
  direccion: string | null
  logo: string | null
  estado: boolean
  permite_auto_registro_clientes: boolean
  fecha_creacion: string
  plan_id: number | null
  plan_nombre: string | null
  suscripcion_estado: string | null
  suscripcion_fecha_inicio: string | null
  suscripcion_fecha_fin: string | null
  permite_app_movil: boolean
  permite_reportes: boolean
  permite_backup: boolean
  limite_usuarios: number
  limite_mascotas: number
}

export interface VeterinariaCreatePayload {
  nombre: string
  slug: string
  nit?: string | null
  correo?: string | null
  telefono?: string | null
  direccion?: string | null
  logo?: string | null
  estado?: boolean
  permite_auto_registro_clientes?: boolean
}

export interface VeterinariaUpdatePayload {
  nombre?: string
  slug?: string
  nit?: string | null
  correo?: string | null
  telefono?: string | null
  direccion?: string | null
  logo?: string | null
  permite_auto_registro_clientes?: boolean
  estado?: boolean
}

export interface VeterinariasQueryParams {
  page?: number
  page_size?: number
  search?: string
  estado?: boolean | string
}

export interface PaginatedVeterinariasResponse {
  count: number
  next: string | null
  previous: string | null
  results: Veterinaria[]
}

export interface ChangePlanPayload {
  id_plan: number
  estado_suscripcion: string
  fecha_inicio: string
  fecha_fin: string | null
  renovacion_automatica: boolean
}
