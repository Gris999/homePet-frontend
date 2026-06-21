import { cn } from '#/lib/utils'

function normalizeValue(value?: string | null) {
  return (value || '').trim().toUpperCase()
}

function getEstadoPagoClasses(estado?: string | null) {
  const normalized = normalizeValue(estado)

  if (normalized === 'PAGADO') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  if (normalized === 'PENDIENTE' || normalized === 'EN_PROCESO') {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }

  if (normalized === 'FALLIDO' || normalized === 'RECHAZADO') {
    return 'border-rose-200 bg-rose-50 text-rose-700'
  }

  if (normalized === 'ANULADO') {
    return 'border-slate-200 bg-slate-100 text-slate-700'
  }

  return 'border-violet-200 bg-violet-50 text-violet-700'
}

function getEstadoReferenciaClasses(estado?: string | null) {
  const normalized = normalizeValue(estado)

  if (
    normalized.includes('ENTREG') ||
    normalized.includes('COMPLET') ||
    normalized.includes('CONFIRM') ||
    normalized.includes('PAGAD')
  ) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  if (normalized.includes('PEND') || normalized.includes('PROCES') || normalized.includes('ESPERA')) {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }

  if (
    normalized.includes('FALL') ||
    normalized.includes('RECHAZ') ||
    normalized.includes('ANUL') ||
    normalized.includes('CANCEL')
  ) {
    return 'border-rose-200 bg-rose-50 text-rose-700'
  }

  return 'border-slate-200 bg-slate-50 text-slate-700'
}

function getTipoReferenciaClasses(tipo?: string | null) {
  const normalized = normalizeValue(tipo)

  if (normalized === 'VENTA_WEB') {
    return 'border-violet-200 bg-violet-50 text-violet-700'
  }

  if (normalized === 'PEDIDO_MOVIL') {
    return 'border-sky-200 bg-sky-50 text-sky-700'
  }

  if (normalized === 'CITA_SERVICIO') {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }

  if (normalized === 'SAAS_SUSCRIPCION') {
    return 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700'
  }

  return 'border-slate-200 bg-slate-50 text-slate-700'
}

type BadgeProps = {
  label?: string | null
  className?: string
}

function Pill({ label, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide',
        className,
      )}
    >
      {label || '-'}
    </span>
  )
}

export function EstadoPagoBadge({ estado }: { estado?: string | null }) {
  return <Pill label={estado || 'SIN_ESTADO'} className={getEstadoPagoClasses(estado)} />
}

export function EstadoReferenciaBadge({ estado }: { estado?: string | null }) {
  return <Pill label={estado || 'SIN_ESTADO'} className={getEstadoReferenciaClasses(estado)} />
}

export function TipoReferenciaBadge({ tipo }: { tipo?: string | null }) {
  return <Pill label={tipo || 'SIN_REFERENCIA'} className={getTipoReferenciaClasses(tipo)} />
}
