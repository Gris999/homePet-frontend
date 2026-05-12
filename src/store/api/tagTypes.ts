export const TAG_TYPES = [
  'Auth',
  'User',
  'Clients',
  'Pets',
  'Appointments',
  'Bitacora',
  'Servicios',
  'PreciosServicio',
  'CategoriasServicio',
  'ClinicalHistory',
  'Veterinarias',
  'Grupos',
  'Permisos',
  'Componentes',
  'Suscripciones',
  'Planes',
  'Especies',
  'Razas',
  'Notifications',
  'Devices',
] as const

export type TagType = (typeof TAG_TYPES)[number]
