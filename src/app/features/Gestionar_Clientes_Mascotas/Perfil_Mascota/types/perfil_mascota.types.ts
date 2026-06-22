export interface HistorialClinico {
  id_historial: number
  mascota_id: number
  fecha_registro: string
  diagnostico: string | null
  notas: string | null
  estado: boolean
}

export interface Tratamiento {
  id_tratamiento: number
  historial_clinico_id: number
  nombre: string
  descripcion: string | null
  fecha_inicio: string
  fecha_fin: string | null
  estado: boolean
}

export interface VacunaAplicada {
  id_vacuna_aplicada: number
  historial_clinico_id: number
  nombre_vacuna: string
  fecha_aplicacion: string
  proxima_dosis: string | null
  veterinario: string | null
  estado: boolean
}

export interface HistorialClinicoResponse {
  historial_clinico: HistorialClinico
  tratamientos: Tratamiento[]
}

export interface VacunasResponse {
  vacunas_aplicadas: VacunaAplicada[]
}

export interface PlanSanitarioPreventivoItem {
  id_plan_sanitario: number
  mascota: number
  mascota_nombre: string
  tipo_evento: string
  tipo_evento_display: string
  descripcion: string
  fecha_programada: string
  estado_plan: 'PENDIENTE' | 'REALIZADO' | 'VENCIDO' | 'CANCELADO'
  estado_plan_display: string
  observaciones: string | null
  usuario_registro_nombre: string
  estado: boolean
}
