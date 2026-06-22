export type PlanSanitarioTipoEvento =
  | 'CONTROL'
  | 'VACUNA'
  | 'DESPARASITACION'
  | 'REVISION'
  | 'OTRO'

export type PlanSanitarioEstado =
  | 'PENDIENTE'
  | 'REALIZADO'
  | 'VENCIDO'
  | 'CANCELADO'

export interface PlanSanitarioItem {
  id_plan_sanitario: number
  mascota: number
  mascota_nombre: string
  veterinaria: number
  usuario_registro: number
  usuario_registro_nombre: string
  tipo_evento: PlanSanitarioTipoEvento
  tipo_evento_display: string
  descripcion: string
  fecha_programada: string
  estado_plan: PlanSanitarioEstado
  estado_plan_display: string
  esta_vencido: boolean
  estado_visual: PlanSanitarioEstado
  estado_visual_display: string
  observaciones: string | null
  estado: boolean
  fecha_creacion: string
  fecha_actualizacion: string
}

export interface PlanSanitarioPayload {
  tipo_evento: PlanSanitarioTipoEvento
  descripcion: string
  fecha_programada: string
  estado_plan: PlanSanitarioEstado
  observaciones?: string
  estado?: boolean
}
