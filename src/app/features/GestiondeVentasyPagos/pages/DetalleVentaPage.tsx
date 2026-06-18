import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import { useGetClientesQuery } from '#/app/features/Gestionar_Clientes_Mascotas/Gestionar_Clientes/store/gestionarClientesApi'
import { useGetClientesMascotaQuery } from '#/app/features/Gestionar_Clientes_Mascotas/Gestionar_Mascotas/store/gestionarMascotasApi'
import { useGetUsuariosQuery } from '#/app/features/AutenticacionySeguridad/Gestionar_Usuarios/store/gestionarUsuariosApi'
import { useAppSelector } from '#/store/hooks'
import { DetallesVentaTable } from '../components/DetallesVentaTable'
import { VentaEstadoBadge } from '../components/VentaEstadoBadge'
import { VentaResumenCard } from '../components/VentaResumenCard'
import { useGetVentaByIdQuery } from '../services/ventasService'
import {
  useIniciarPagoOnlineMutation,
  useConfirmarPagoManualMutation,
  useGetPagosQuery,
} from '../services/pagosApi'
import { ComprobantePagoModal } from '../components/ComprobantePagoModal'
import {
  formatDateTime,
  getVentaClienteRefId,
  getVentaClienteNombre,
  getVentaDetalles,
  getVentaEstado,
  getVentaMascotaNombre,
  getVentaObservacion,
  getVentaTotal,
  getVentaUsuarioResponsableRefId,
  getVentaUsuarioNombre,
  hasProductoDetalle,
  hasServicioDetalle,
} from '../utils/ventasFormatters'
import { canAccessVentasModule } from '../utils/ventasGuards'
import { getVentasApiErrorMessage } from '../utils/ventasValidators'

type DetalleVentaPageProps = {
  ventaId: number
}

function getVentaObservacionSafe(observacion?: string | null) {
  return observacion?.trim() ? observacion : '-'
}

export function DetalleVentaPage({ ventaId }: DetalleVentaPageProps) {
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)
  const canAccess = canAccessVentasModule(user)

  const [iniciarPagoOnline, { isLoading: isStripeStarting }] = useIniciarPagoOnlineMutation()
  const [confirmarPagoManual, { isLoading: isConfirmingManual }] = useConfirmarPagoManualMutation()
  const { data: pagosList = [], refetch: refetchPagos } = useGetPagosQuery(undefined, { skip: !canAccess })

  const [showManualModal, setShowManualModal] = useState(false)
  const [manualMethod, setManualMethod] = useState<'EFECTIVO' | 'TRANSFERENCIA' | 'QR' | 'ADMINISTRATIVO'>('EFECTIVO')
  const [manualObs, setManualObs] = useState('')
  const [manualError, setManualError] = useState<string | null>(null)

  const [showStripeModal, setShowStripeModal] = useState(false)
  const [stripePagoId, setStripePagoId] = useState<number | null>(null)
  const [stripeUrl, setStripeUrl] = useState<string | null>(null)
  const [stripeStatus, setStripeStatus] = useState<string>('PENDIENTE')
  const [stripeError, setStripeError] = useState<string | null>(null)

  const [showComprobanteId, setShowComprobanteId] = useState<number | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)

  const clientesQuery = useGetClientesQuery({ page: 1, page_size: 200 }, { skip: !canAccess })
  const clientesUsuariosQuery = useGetClientesMascotaQuery(undefined, { skip: !canAccess })
  const usuariosQuery = useGetUsuariosQuery(undefined, { skip: !canAccess })
  const ventaQuery = useGetVentaByIdQuery(ventaId, { skip: !canAccess || ventaId <= 0 })
  const detalles = useMemo(() => getVentaDetalles(ventaQuery.data), [ventaQuery.data])
  const venta = ventaQuery.data
  const clientes = clientesQuery.data?.results ?? []
  const clientesUsuarios = clientesUsuariosQuery.data ?? []
  const usuariosSistema = usuariosQuery.data ?? []

  const clientNameById = useMemo(() => {
    const map = new Map<number, string>()

    clientesUsuarios.forEach((cliente) => {
      const label = cliente.nombre || `Cliente ${cliente.id_usuario}`
      map.set(cliente.id_usuario, label)
    })

    clientes.forEach((cliente) => {
      const label = cliente.nombre || cliente.correo || `Cliente ${cliente.id_perfil}`
      map.set(cliente.id_perfil, label)
      map.set(cliente.usuario, label)
    })
    return map
  }, [clientes, clientesUsuarios])

  const usuarioSistemaById = useMemo(() => {
    const map = new Map<number, string>()
    usuariosSistema.forEach((usuario) => {
      const label = usuario.nombre || usuario.correo || `Usuario ${usuario.id_usuario ?? usuario.id}`
      if (usuario.id_usuario) map.set(usuario.id_usuario, label)
      map.set(usuario.id, label)
    })
    return map
  }, [usuariosSistema])

  const clienteNombre = useMemo(() => {
    if (!venta) return 'Sin cliente'
    const id = getVentaClienteRefId(venta)
    if (id > 0) {
      const fromMap = clientNameById.get(id)
      if (fromMap) return fromMap
      return `Cliente #${id}`
    }
    return getVentaClienteNombre(venta)
  }, [clientNameById, venta])

  const usuarioResponsableNombre = useMemo(() => {
    if (!venta) return '-'
    const id = getVentaUsuarioResponsableRefId(venta)
    const fallbackName = id > 0 && id === user?.id_usuario ? user.nombre || user.correo || '-' : null
    if (id > 0) {
      const fromMap = usuarioSistemaById.get(id)
      if (fromMap) return fromMap
    }
    const fromVenta = getVentaUsuarioNombre(venta, { fallbackName })
    if (fromVenta !== '-' && fromVenta.trim() !== '') return fromVenta
    if (id > 0) return `Usuario #${id}`
    return fallbackName ?? '-'
  }, [user?.correo, user?.id_usuario, user?.nombre, usuarioSistemaById, venta])

  const existingPago = useMemo(() => {
    return pagosList.find(
      (p) => p.tipo_referencia === 'VENTA_WEB' && p.referencia_id === ventaId && p.estado_pago === 'PAGADO'
    )
  }, [pagosList, ventaId])

  useEffect(() => {
    let intervalId: any
    let attempts = 0
    if (showStripeModal && stripePagoId && stripeStatus === 'PENDIENTE') {
      intervalId = setInterval(async () => {
        attempts++
        if (attempts > 30) {
          setStripeError('Tu pago se está procesando. Puedes verificar el estado en tu historial en unos minutos.')
          clearInterval(intervalId)
          return
        }
        try {
          const res = await refetchPagos().unwrap()
          const matched = res.find((p) => p.id_pago === stripePagoId)
          if (matched) {
            setStripeStatus(matched.estado_pago)
            if (matched.estado_pago === 'PAGADO') {
              clearInterval(intervalId)
              ventaQuery.refetch()
              if (matched.comprobante?.id_comprobante) {
                setShowComprobanteId(matched.comprobante.id_comprobante)
              }
            } else if (matched.estado_pago === 'FALLIDO' || matched.estado_pago === 'RECHAZADO') {
              clearInterval(intervalId)
              setStripeError('El pago fue fallido o rechazado. Intenta de nuevo.')
            }
          }
        } catch (err) {
          // Ignore temp errors
        }
      }, 2000)
    }
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [showStripeModal, stripePagoId, stripeStatus, refetchPagos, ventaQuery])

  const handleStripePay = async () => {
    setStripeError(null)
    setStripeStatus('PENDIENTE')
    try {
      const res = await iniciarPagoOnline({
        tipo_referencia: 'VENTA_WEB',
        referencia_id: ventaId,
        metodo_pago: 'STRIPE',
      }).unwrap()

      if (res.checkout_url) {
        setStripePagoId(res.id_pago)
        setStripeUrl(res.checkout_url)
        setShowStripeModal(true)
      } else {
        setStripeError('No se recibió la URL de checkout de Stripe.')
      }
    } catch (err: any) {
      const msg = err.data?.detail || err.data?.message || 'Error al iniciar pago con Stripe.'
      setStripeError(msg)
    }
  }

  const handleManualPay = async () => {
    setManualError(null)
    try {
      const res = await confirmarPagoManual({
        tipo_referencia: 'VENTA_WEB',
        referencia_id: ventaId,
        metodo_pago: manualMethod,
        observacion: manualObs,
      }).unwrap()

      setShowManualModal(false)
      ventaQuery.refetch()
      refetchPagos()
      if (res.comprobante?.id_comprobante) {
        setShowComprobanteId(res.comprobante.id_comprobante)
      }
    } catch (err: any) {
      const msg = err.data?.detail || err.data?.message || 'Error al registrar pago manual.'
      setManualError(msg)
    }
  }

  if (!canAccess) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-5 text-sm font-medium text-red-700">
          No tiene permisos para acceder al módulo de ventas.
        </CardContent>
      </Card>
    )
  }

  if (ventaQuery.isLoading) {
    return (
      <Card className="border-violet-100">
        <CardContent className="p-5 text-sm text-slate-600">Cargando detalle de venta...</CardContent>
      </Card>
    )
  }

  if (ventaQuery.error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-5 text-sm text-red-700">
          {getVentasApiErrorMessage(ventaQuery.error, 'No se pudo cargar el detalle de la venta.')}
        </CardContent>
      </Card>
    )
  }

  if (!venta) {
    return (
      <Card className="border-violet-100">
        <CardContent className="p-5 text-sm text-slate-600">La venta no existe.</CardContent>
      </Card>
    )
  }

  const hasProducts = hasProductoDetalle(detalles)
  const hasServices = hasServicioDetalle(detalles)

  return (
    <section className="space-y-5 text-slate-900">
      <div>
        <h1 className="text-5xl font-black text-slate-900">Detalle de venta</h1>
        <p className="mt-1 text-sm text-slate-600">
          Consulta de cabecera, detalles y movimientos asociados
        </p>
      </div>

      <Card className="border-violet-100">
        <CardContent className="grid gap-4 p-5 lg:grid-cols-[1fr_220px]">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-4xl font-black text-slate-900">Venta #{ventaId}</h2>
              <VentaEstadoBadge estado={getVentaEstado(venta)} />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              Fecha: {formatDateTime(venta.fecha_venta ?? venta.fecha ?? venta.created_at)}
            </p>
            <div className="grid gap-1 text-sm text-slate-700 md:grid-cols-2">
              <p>
                <span className="font-semibold">Cliente:</span> {clienteNombre}
              </p>
              <p>
                <span className="font-semibold">Usuario responsable:</span> {usuarioResponsableNombre}
              </p>
              <p>
                <span className="font-semibold">Mascota:</span> {getVentaMascotaNombre(venta)}
              </p>
              <p>
                <span className="font-semibold">Observación:</span>{' '}
                {getVentaObservacionSafe(getVentaObservacion(venta))}
              </p>
            </div>
          </div>
          <VentaResumenCard title="Total" amount={getVentaTotal(venta)} />
        </CardContent>
      </Card>

      {venta.estado_venta === 'PENDIENTE_COBRO' && (
        <Card className="border-amber-200 bg-amber-50/50 p-5">
          <CardContent className="p-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-amber-800 text-lg">Venta pendiente de cobro</h3>
              <p className="text-sm text-slate-600">Registra el pago manual en caja o genera el enlace para pagar con Stripe.</p>
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => {
                  setManualError(null)
                  setManualObs('')
                  setShowManualModal(true)
                }}
                className="bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold text-xs h-10 px-4 rounded-xl"
              >
                Registrar Pago Manual
              </Button>
              <Button
                type="button"
                onClick={handleStripePay}
                disabled={isStripeStarting}
                className="bg-[#635BFF] hover:bg-[#564FE0] text-white font-semibold text-xs h-10 px-4 rounded-xl"
              >
                {isStripeStarting ? 'Iniciando Stripe...' : 'Pagar con Stripe'}
              </Button>
            </div>
          </CardContent>
          {stripeError && <p className="text-xs text-red-600 mt-2 font-medium">{stripeError}</p>}
        </Card>
      )}

      {venta.estado_venta === 'PAGADA' && (
        <Card className="border-emerald-200 bg-emerald-50/50 p-5">
          <CardContent className="p-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-emerald-800 text-lg">Venta Pagada</h3>
              <p className="text-sm text-slate-600">Esta venta ya cuenta con un pago aprobado y el comprobante está disponible.</p>
            </div>
            <div>
              <Button
                type="button"
                onClick={() => {
                  if (existingPago?.comprobante?.id_comprobante) {
                    setShowComprobanteId(existingPago.comprobante.id_comprobante)
                  } else {
                    const alt = pagosList.find(p => p.tipo_referencia === 'VENTA_WEB' && p.referencia_id === ventaId)
                    if (alt?.comprobante?.id_comprobante) {
                      setShowComprobanteId(alt.comprobante.id_comprobante)
                    } else {
                      alert('El comprobante aún no se ha cargado. Por favor, actualiza la página.')
                    }
                  }
                }}
                className="bg-[#6A24D4] hover:bg-[#5b1fbc] text-white font-semibold text-xs h-10 px-4 rounded-xl"
              >
                Ver Comprobante
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <h2 className="text-3xl font-black text-slate-900">Detalles</h2>
        <DetallesVentaTable detalles={detalles} />
      </div>

      <div className="space-y-2">
        {hasProducts ? (
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="p-4 text-sm font-medium text-emerald-700">
              Movimiento de inventario: el stock disminuyó en el almacén principal.
            </CardContent>
          </Card>
        ) : null}
        {hasServices ? (
          <Card className="border-violet-200 bg-violet-50">
            <CardContent className="p-4 text-sm font-medium text-violet-700">
              Nota clínica: este módulo no genera historia clínica automáticamente.
            </CardContent>
          </Card>
        ) : null}
      </div>

      <Button
        type="button"
        onClick={() => navigate({ to: '/ventas-pagos/ventas' })}
        className="h-10 bg-[#6A24D4] px-8 font-semibold text-white hover:bg-[#5b1fbc]"
      >
        Volver
      </Button>

      {/* Modal Pago Manual */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 text-slate-900">
            <h3 className="text-lg font-black text-slate-900 border-b pb-3 mb-4">Registrar Pago Manual</h3>
            <p className="text-sm text-slate-600 mb-4">
              ¿Confirmar recepción de <strong>Bs. {Number(venta.total).toFixed(2)}</strong>? Esta acción registrará el pago y emitirá el comprobante inmediatamente.
            </p>
            <div className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Método de Pago</label>
                <select
                  value={manualMethod}
                  onChange={(e: any) => setManualMethod(e.target.value)}
                  className="w-full h-10 border rounded-xl px-3 text-sm text-slate-900 bg-white"
                >
                  <option value="EFECTIVO">EFECTIVO</option>
                  <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                  <option value="QR">QR</option>
                  <option value="ADMINISTRATIVO">ADMINISTRATIVO</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Observación / Nota</label>
                <textarea
                  value={manualObs}
                  onChange={(e) => setManualObs(e.target.value)}
                  placeholder="Ej: Pago en efectivo en recepción."
                  className="w-full p-3 border rounded-xl text-sm text-slate-900 h-20 bg-white resize-none"
                />
              </div>
            </div>
            {manualError && <p className="text-xs text-red-600 mt-3 font-semibold">{manualError}</p>}
            <div className="flex justify-end gap-3 mt-6 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowManualModal(false)}
                className="rounded-xl font-semibold text-xs h-9 px-4"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleManualPay}
                disabled={isConfirmingManual}
                className="bg-[#6A24D4] hover:bg-[#5b1fbc] text-white rounded-xl font-semibold text-xs h-9 px-4"
              >
                {isConfirmingManual ? 'Registrando...' : 'Confirmar Recepción'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Stripe Link/QR & Polling */}
      {showStripeModal && stripeUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-center animate-in fade-in zoom-in duration-200 text-slate-900">
            <h3 className="text-lg font-black text-slate-900 border-b pb-3 mb-4">Pagar con Stripe</h3>
            <p className="text-sm text-slate-600 mb-5">
              Escanea el código QR o haz clic en el enlace para pagar de forma segura con tarjeta.
            </p>
            
            <div className="flex justify-center mb-6">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(stripeUrl)}`}
                alt="Stripe QR Code"
                className="border p-2 rounded-xl bg-white shadow-sm"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={stripeUrl}
                  className="flex-1 h-9 bg-slate-50 border rounded-xl px-3 text-xs text-slate-600"
                />
                <Button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(stripeUrl)
                    setCopiedLink(true)
                    setTimeout(() => setCopiedLink(false), 2000)
                  }}
                  className="bg-slate-200 text-slate-700 hover:bg-slate-300 font-semibold text-xs h-9 px-3 rounded-xl"
                >
                  {copiedLink ? 'Copiado!' : 'Copiar'}
                </Button>
              </div>

              <div className="bg-violet-50 rounded-xl p-4 flex flex-col items-center justify-center gap-2">
                {stripeStatus === 'PENDIENTE' && (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#6A24D4] border-t-transparent"></div>
                    <p className="text-xs text-slate-600 font-medium">Esperando confirmación del pago de Stripe...</p>
                  </>
                )}
                {stripeStatus === 'PAGADO' && (
                  <p className="text-xs text-emerald-600 font-bold uppercase">¡Pago aprobado correctamente!</p>
                )}
              </div>
            </div>

            {stripeError && <p className="text-xs text-red-600 mt-4 font-semibold">{stripeError}</p>}

            <div className="flex justify-end gap-3 mt-6 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowStripeModal(false)
                  setStripePagoId(null)
                  setStripeUrl(null)
                }}
                className="rounded-xl font-semibold text-xs h-9 px-4"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Comprobante de Pago */}
      {showComprobanteId && (
        <ComprobantePagoModal
          idComprobante={showComprobanteId}
          onClose={() => setShowComprobanteId(null)}
        />
      )}
    </section>
  )
}
