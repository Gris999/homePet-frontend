import { useMemo, useState, useEffect } from 'react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { EditReservaModal } from '../components'
import {
  useIniciarPagoOnlineMutation,
  useConfirmarPagoManualMutation,
  useGetPagosQuery,
} from '#/app/features/GestiondeVentasyPagos/services/pagosApi'
import { ComprobantePagoModal } from '#/app/features/GestiondeVentasyPagos/components/ComprobantePagoModal'
import { CreateConsultaModal } from '#/app/features/Gestionar_Clinica_Veterinaria/Gestionar_Historia_Clinica/components'
import {
  useGetMascotasOptionsQuery,
  useGetPreciosOptionsQuery,
  useGetReservasQuery,
  useGetServiciosOptionsQuery,
  usePatchEstadoReservaMutation,
  useUpdateReservaMutation,
} from '../store/reservasApi'
import type {
  EstadoReserva,
  ModalidadReserva,
  Reserva,
  ReservaPatchPayload,
} from '../store/reservas.types'
import { useCanEdit, useCanDelete } from '#/store/auth/auth.hooks'

const estadoOptions: EstadoReserva[] = ['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA']
const modalidadOptions: ModalidadReserva[] = ['CLINICA', 'DOMICILIO']
type EditableReserva = {
  id: number
  mascota: string
  servicio: string
  precio_servicio: string
  fecha_programada: string
  hora_inicio: string
  modalidad: ModalidadReserva
  direccion_cita: string
  descripcion: string
  estado: EstadoReserva 
}

export const Gestionar_Reservas = () => {
  const [search, setSearch] = useState('')
  const [estadoFilter, setEstadoFilter] = useState<'ALL' | EstadoReserva>('ALL')
  const [editing, setEditing] = useState<EditableReserva | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [createConsultaOpen, setCreateConsultaOpen] = useState(false)
  const [selectedReservaForConsulta, setSelectedReservaForConsulta] = useState<Reserva | null>(null)

  // Payments integration states and hooks
  const [iniciarPagoOnline, { isLoading: isStripeStarting }] = useIniciarPagoOnlineMutation()
  const [confirmarPagoManual, { isLoading: isConfirmingManual }] = useConfirmarPagoManualMutation()
  const { data: pagosList = [], refetch: refetchPagos } = useGetPagosQuery()

  const [payingReserva, setPayingReserva] = useState<Reserva | null>(null)
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
              refetch()
              if (matched.comprobante?.id_comprobante) {
                setShowComprobanteId(matched.comprobante.id_comprobante)
              }
            } else if (matched.estado_pago === 'FALLIDO' || matched.estado_pago === 'RECHAZADO') {
              clearInterval(intervalId)
              setStripeError('El pago fue fallido o rechazado. Intenta de nuevo.')
            }
          }
        } catch (err) {
          // ignore
        }
      }, 2000)
    }
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [showStripeModal, stripePagoId, stripeStatus, refetchPagos])

  const handleStripePay = async (reserva: Reserva) => {
    setStripeError(null)
    setStripeStatus('PENDIENTE')
    try {
      const res = await iniciarPagoOnline({
        tipo_referencia: 'CITA_SERVICIO',
        referencia_id: reserva.id_cita,
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

  const handleManualPay = async (reserva: Reserva) => {
    setManualError(null)
    try {
      const res = await confirmarPagoManual({
        tipo_referencia: 'CITA_SERVICIO',
        referencia_id: reserva.id_cita,
        metodo_pago: manualMethod,
        observacion: manualObs,
      }).unwrap()

      setShowManualModal(false)
      setPayingReserva(null)
      refetch()
      refetchPagos()
      if (res.comprobante?.id_comprobante) {
        setShowComprobanteId(res.comprobante.id_comprobante)
      }
    } catch (err: any) {
      const msg = err.data?.detail || err.data?.message || 'Error al registrar pago manual.'
      setManualError(msg)
    }
  }

  const canEdit = useCanEdit('SERV_CITAS')
  const canDelete = useCanDelete('SERV_CITAS')

  const { data: reservas = [], refetch } = useGetReservasQuery()
  const { data: mascotas = [] } = useGetMascotasOptionsQuery()
  const { data: servicios = [] } = useGetServiciosOptionsQuery()
  const { data: precios = [] } = useGetPreciosOptionsQuery()
  const [updateReserva] = useUpdateReservaMutation()
  const [patchEstadoReserva] = usePatchEstadoReservaMutation()

  const visibleReservas = useMemo(() => {
    return reservas.filter((reserva) => {
      const matchesEstado = estadoFilter === 'ALL' || reserva.estado === estadoFilter
      const source = `${reserva.correo_usuario} ${reserva.mascota_nombre || ''} ${reserva.servicio_nombre || ''}`.toLowerCase()
      const matchesSearch = source.includes(search.trim().toLowerCase())
      return matchesEstado && matchesSearch
    })
  }, [reservas, search, estadoFilter])

  const preciosFiltrados = useMemo(() => {
    if (!editing?.servicio) return []
    return precios.filter((precio) => {
      return (
        precio.estado &&
        precio.servicio === Number(editing.servicio) &&
        precio.modalidad === editing.modalidad
      )
    })
  }, [precios, editing])

  const startEdit = (reserva: Reserva) => {
    setMessage(null)
    setCancelReason('')
    setEditing({
      id: reserva.id_cita,
      mascota: String(reserva.mascota),
      servicio: String(reserva.servicio),
      precio_servicio: String(reserva.precio_servicio),
      fecha_programada: reserva.fecha_programada,
      hora_inicio: (reserva.hora_inicio || '').slice(0, 5),
      modalidad: reserva.modalidad,
      direccion_cita: reserva.direccion_cita || '',
      descripcion: reserva.descripcion || '',
      estado: reserva.estado,
    })
  }

  const onChangeEditing = (field: keyof EditableReserva, value: string) => {
    if (!editing) return
    const next: EditableReserva = {
      ...editing,
      [field]: value,
    }
    if (field === 'servicio' || field === 'modalidad') {
      next.precio_servicio = ''
    }
    setEditing(next)
  }

  const saveEdit = async () => {
    if (!editing) return
    setMessage(null)

    const body: ReservaPatchPayload = {
      mascota: Number(editing.mascota),
      servicio: Number(editing.servicio),
      precio_servicio: Number(editing.precio_servicio),
      fecha_programada: editing.fecha_programada,
      hora_inicio: editing.hora_inicio,
      modalidad: editing.modalidad,
      direccion_cita: editing.modalidad === 'DOMICILIO' ? editing.direccion_cita : null,
      descripcion: editing.descripcion,
    }

    try {
      await updateReserva({ id: editing.id, body }).unwrap()
      await refetch()
      setMessage('Reserva actualizada correctamente.')
      setEditing(null)
    } catch {
      setMessage('No se pudo actualizar la reserva.')
    }
  }

  const updateStatus = async (id: number, estado: EstadoReserva) => {
    setMessage(null)
    const payload =
      estado === 'CANCELADA'
        ? { estado, motivo_cancelacion: cancelReason || 'Cancelada desde administración.' }
        : { estado }

    try {
      await patchEstadoReserva({ id, body: payload }).unwrap()
      await refetch()
      setMessage('Estado de la reserva actualizado.')
      setCancelReason('')
    } catch {
      setMessage('No se pudo cambiar el estado de la reserva.')
    }
  }

  const handleConsultaCreada = async (id: number) => {
    try {
      await patchEstadoReserva({ id, body: { estado: 'COMPLETADA' } }).unwrap()
      await refetch()
      setMessage('Consulta creada y reserva completada correctamente.')
    } catch {
      setMessage('La consulta se creó, pero no se pudo completar la reserva.')
    }
  }

  return (
    <section className="space-y-5 text-gray-900">
      
      <div>
        <h1 className="text-3xl font-bold text-[#F97316]">Gestionar Reservas</h1>
        <p className="text-sm text-gray-700">Módulo de Gestión de Servicios y Reserva</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Input
          className="text-gray-900"
          placeholder="Buscar por correo, mascota o servicio"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={estadoFilter}
          onChange={(e) => setEstadoFilter(e.target.value as 'ALL' | EstadoReserva)}
          className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900"
        >
          <option value="ALL">Todos los estados</option>
          {estadoOptions.map((estado) => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
        </select>

        <div className="flex items-center justify-end text-sm text-gray-700">
          {visibleReservas.length} reservas
        </div>
      </div>

      {message && <p className="text-sm text-[#7C3AED]">{message}</p>}

      {/* TABLA */}
      <div className="overflow-x-auto rounded-lg border border-violet-200 bg-white text-gray-900">
        <table className="min-w-full text-sm text-gray-900">
          <thead className="bg-violet-600 text-white" >
            <tr>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Cliente</th>
              <th className="px-3 py-2">Mascota</th>
              <th className="px-3 py-2">Servicio</th>
              <th className="px-3 py-2">Fecha</th>
              <th className="px-3 py-2">Hora</th>
              <th className="px-3 py-2">Estado</th>
              {(canEdit || canDelete) && (
                <th className="px-3 py-2 text-right">Acciones</th>
              )}
            </tr>
          </thead>

          <tbody>
            {visibleReservas.map((reserva) => (
              <tr key={reserva.id_cita} className="border-t">
                <td className="px-3 py-2">#{reserva.id_cita}</td>
                <td className="px-3 py-2">{reserva.correo_usuario}</td>
                <td className="px-3 py-2">{reserva.mascota_nombre}</td>
                <td className="px-3 py-2">{reserva.servicio_nombre}</td>
                <td className="px-3 py-2">{reserva.fecha_programada}</td>
                <td className="px-3 py-2">{(reserva.hora_inicio || '').slice(0, 5)}</td>
                <td className="px-3 py-2">{reserva.estado}</td>

                {(canEdit || canDelete) && (
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {canEdit && (
                        <>
                          <Button 
                            className="bg-orange-500 text-white h-8 text-xs px-3"
                            onClick={() => startEdit(reserva)}
                          >
                            Editar
                          </Button>
                          {reserva.estado === 'PENDIENTE' && (
                            <>
                              <Button
                                className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs px-3"
                                onClick={() => updateStatus(reserva.id_cita, 'CONFIRMADA')}
                              >
                                Confirmar
                              </Button>
                              <Button
                                className="bg-green-600 hover:bg-green-700 text-white h-8 text-xs px-3"
                                onClick={() => updateStatus(reserva.id_cita, 'COMPLETADA')}
                              >
                                Completar
                              </Button>
                            </>
                          )}
                          {reserva.estado === 'CONFIRMADA' && (
                            <Button
                              className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 text-xs px-3"
                              onClick={() => {
                                setSelectedReservaForConsulta(reserva)
                                setCreateConsultaOpen(true)
                              }}
                            >
                              + Consulta
                            </Button>
                          )}
                          {(() => {
                            const matchPago = pagosList.find(
                              (p) => p.tipo_referencia === 'CITA_SERVICIO' && p.referencia_id === reserva.id_cita && p.estado_pago === 'PAGADO'
                            )
                            if (matchPago) {
                              return (
                                <Button
                                  type="button"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs px-3"
                                  onClick={() => {
                                    if (matchPago.comprobante?.id_comprobante) {
                                      setShowComprobanteId(matchPago.comprobante.id_comprobante)
                                    }
                                  }}
                                >
                                  Recibo
                                </Button>
                              )
                            } else if (reserva.estado === 'PENDIENTE' || reserva.estado === 'CONFIRMADA') {
                              return (
                                <Button
                                  type="button"
                                  className="bg-purple-700 hover:bg-purple-800 text-white h-8 text-xs px-3"
                                  onClick={() => {
                                    setPayingReserva(reserva)
                                    setManualObs('')
                                    setManualError(null)
                                    setStripeError(null)
                                  }}
                                >
                                  Cobrar
                                </Button>
                              )
                            }
                            return null
                          })()}
                        </>
                      )}
                      
                      {canDelete && reserva.estado === 'PENDIENTE' && (
                        <Button
                          className="bg-red-500 hover:bg-red-600 text-white h-8 text-xs px-3"
                          onClick={() => {
                            if (window.confirm('¿Seguro que deseas cancelar esta reserva?')) {
                              updateStatus(reserva.id_cita, 'CANCELADA')
                            }
                          }}
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))} 
          </tbody>
        </table>
      </div>

        <EditReservaModal
        editing={editing}
        setEditing={setEditing}
        onChangeEditing={onChangeEditing}
        saveEdit={saveEdit}
        mascotas={mascotas}
        servicios={servicios}
        preciosFiltrados={preciosFiltrados}
        modalidadOptions={modalidadOptions}
        />

        {selectedReservaForConsulta && (
          <CreateConsultaModal
            isOpen={createConsultaOpen}
            onClose={() => {
              setCreateConsultaOpen(false)
              setSelectedReservaForConsulta(null)
              refetch()
            }}
            onConsultaCreada={() => handleConsultaCreada(selectedReservaForConsulta.id_cita)}
            citaId={selectedReservaForConsulta.id_cita}
            mascotaId={selectedReservaForConsulta.mascota}
            petName={selectedReservaForConsulta.mascota_nombre ?? ''}
          />
        )}

      {/* Resumen de Cobro y Métodos */}
      {payingReserva && !showManualModal && !showStripeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-slate-900 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-black text-slate-900 border-b pb-3 mb-4">Resumen de Cobro de Cita</h3>
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Servicio:</span>
                <span className="font-semibold text-slate-800 text-right">{payingReserva.servicio_nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Mascota:</span>
                <span className="font-semibold text-slate-800 text-right">{payingReserva.mascota_nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Fecha y Hora:</span>
                <span className="font-semibold text-slate-800 text-right">{payingReserva.fecha_programada} a las {payingReserva.hora_inicio.slice(0, 5)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Modalidad:</span>
                <span className="font-semibold text-slate-800 text-right">{payingReserva.modalidad}</span>
              </div>
              {payingReserva.direccion_cita && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Dirección:</span>
                  <span className="font-semibold text-slate-800 text-right max-w-[200px] truncate" title={payingReserva.direccion_cita}>{payingReserva.direccion_cita}</span>
                </div>
              )}
              <div className="border-t border-dashed pt-3 space-y-1.5">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Subtotal Servicio:</span>
                  <span>Bs. {Number(payingReserva.precio_servicio).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Insumos / Productos:</span>
                  <span>Bs. 0.00</span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 border-t pt-1.5">
                  <span>Total Final:</span>
                  <span className="text-[#6A24D4]">Bs. {Number(payingReserva.precio_servicio).toFixed(2)}</span>
                </div>
              </div>
            </div>
            {stripeError && <p className="text-xs text-red-600 mb-3 font-semibold">{stripeError}</p>}
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                onClick={() => {
                  setManualError(null)
                  setManualObs('')
                  setShowManualModal(true)
                }}
                className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white rounded-xl font-semibold text-xs h-10"
              >
                Registrar Pago Manual
              </Button>
              <Button
                type="button"
                disabled={isStripeStarting}
                onClick={() => handleStripePay(payingReserva)}
                className="w-full bg-[#635BFF] hover:bg-[#564FE0] text-white rounded-xl font-semibold text-xs h-10"
              >
                {isStripeStarting ? 'Iniciando Stripe...' : 'Pagar con Stripe'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPayingReserva(null)}
                className="w-full rounded-xl font-semibold text-xs h-10 mt-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pago Manual */}
      {payingReserva && showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 text-slate-900">
            <h3 className="text-lg font-black text-slate-900 border-b pb-3 mb-4">Registrar Pago Manual</h3>
            <p className="text-sm text-slate-600 mb-4">
              ¿Confirmar recepción de <strong>Bs. {Number(payingReserva.precio_servicio).toFixed(2)}</strong>? Esta acción registrará el pago y emitirá el comprobante inmediatamente.
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
                  placeholder="Ej: Pago de consulta en efectivo."
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
                Atrás
              </Button>
              <Button
                type="button"
                onClick={() => handleManualPay(payingReserva)}
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
      {payingReserva && showStripeModal && stripeUrl && (
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
                  setPayingReserva(null)
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