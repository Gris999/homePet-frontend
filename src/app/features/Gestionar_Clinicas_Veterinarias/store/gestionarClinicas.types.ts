export interface Veterinaria {
  id_veterinaria: number
  nombre: string
  slug: string
  nit: string
  correo: string
  telefono: string
  direccion: string
  logo: string | null
  estado: boolean
  permite_auto_registro_clientes: boolean
  fecha_creacion: string
}

export interface VeterinariaCreatePayload {
  nombre: string
  slug: string
  nit: string
  correo: string
  telefono?: string
  direccion?: string
  logo?: string | null
  permite_auto_registro_clientes: boolean
}

export interface VeterinariaUpdatePayload {
  nombre?: string
  slug?: string
  nit?: string
  correo?: string
  telefono?: string
  direccion?: string
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
