import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { Button } from '#/components/ui/button'
import { useAppSelector } from '#/store/hooks'
import {
  ReservaForm,
  ReservasList,
  formatCoordinates,
  getApiErrorMessage,
  getCitaOwnerMatches,
  getMascotaOwnerId,
  getPrecioServicioId,
  initialReservaForm,
  isActive,
  isFutureDateTime,
  normalizeModalidad,
  parseCoordinates,
} from '../components'
import type { ReservaFormState } from '../components'
import {
  useCancelCitaMutation,
  useCreateCitaMutation,
  useGetMisCitasQuery,
  useGetMisMascotasQuery,
  useGetPreciosServicioQuery,
  useGetServiciosQuery,
  useUpdateCitaMutation,
} from '../store/clienteApi'
import type { Cita, CitaPayload } from '../store/cliente.types'

export function MisReservasScreen() {
  const [form, setForm] = useState<ReservaFormState>(initialReservaForm)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [cancelId, setCancelId] = useState<number | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [selectedCoords, setSelectedCoords] = useState(parseCoordinates(''))
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const user = useAppSelector((state) => state.auth.user)

  const {
    data: rawMascotas = [],
    isLoading: loadingMascotas,
    isError: mascotasError,
  } = useGetMisMascotasQuery()
  const {
    data: servicios = [],
    isLoading: loadingServicios,
    isError: serviciosError,
  } = useGetServiciosQuery()
  const {
    data: precios = [],
    isLoading: loadingPrecios,
    isError: preciosError,
  } = useGetPreciosServicioQuery()
  const {
    data: rawCitas = [],
    isLoading: loadingCitas,
    isError: citasError,
  } = useGetMisCitasQuery()
  const [createCita, { isLoading: creating }] = useCreateCitaMutation()
  const [updateCita, { isLoading: updating }] = useUpdateCitaMutation()
  const [cancelCita, { isLoading: canceling }] = useCancelCitaMutation()

  const loadingCatalogs = loadingMascotas || loadingServicios || loadingPrecios
  const mascotasWithOwner = rawMascotas.filter(
    (mascota) => getMascotaOwnerId(mascota) !== undefined,
  )
  const mascotas =
    user?.role === 'CLIENT' && user.id_usuario && mascotasWithOwner.length > 0
      ? rawMascotas.filter(
          (mascota) => getMascotaOwnerId(mascota) === user.id_usuario,
        )
      : rawMascotas
  const citasWithOwner = rawCitas.filter(
    (cita) => cita.usuario !== undefined || cita.correo_usuario,
  )
  const citas =
    user?.role === 'CLIENT' && user.id_usuario && citasWithOwner.length > 0
      ? rawCitas.filter((cita) =>
          getCitaOwnerMatches(cita, user.id_usuario, user.correo),
        )
      : rawCitas

  const activeServicios = servicios.filter(
    (servicio) =>
      servicio.estado &&
      (form.modalidad === 'CLINICA' || servicio.disponible_domicilio),
  )
  const selectedServiceId = form.servicio ? Number(form.servicio) : null
  const selectedService = servicios.find(
    (servicio) => servicio.id_servicio === selectedServiceId,
  )
  const availablePrecios = precios.filter(
    (precio) =>
      isActive(precio.estado) &&
      (!selectedServiceId || getPrecioServicioId(precio) === selectedServiceId) &&
      normalizeModalidad(precio.modalidad) === form.modalidad,
  )
  const selectedPriceId = form.precio_servicio ? Number(form.precio_servicio) : null
  const selectedPrice = precios.find((precio) => precio.id_precio === selectedPriceId)
  const serviceAllowsModality =
    form.modalidad === 'CLINICA' || Boolean(selectedService?.disponible_domicilio)
  const priceMatchesSelection = Boolean(
    selectedPrice &&
      isActive(selectedPrice.estado) &&
      getPrecioServicioId(selectedPrice) === selectedServiceId &&
      normalizeModalidad(selectedPrice.modalidad) === form.modalidad,
  )
  const dateTimeIsFuture = isFutureDateTime(form.fecha_programada, form.hora_inicio)
  const parsedAddressCoords = useMemo(
    () => parseCoordinates(form.direccion_cita),
    [form.direccion_cita],
  )
  const mapCoords = selectedCoords ?? parsedAddressCoords

  const canSubmit = useMemo(
    () =>
      Boolean(
        form.mascota &&
          form.servicio &&
          form.precio_servicio &&
          form.fecha_programada &&
          form.hora_inicio &&
          serviceAllowsModality &&
          priceMatchesSelection &&
          dateTimeIsFuture &&
          (form.modalidad === 'CLINICA' || form.direccion_cita.trim()),
      ),
    [dateTimeIsFuture, form, priceMatchesSelection, serviceAllowsModality],
  )

  const updateField = (field: keyof ReservaFormState, value: string) => {
    setMessage(null)
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'modalidad'
        ? { servicio: '', precio_servicio: '', direccion_cita: '' }
        : {}),
      ...(field === 'servicio' ? { precio_servicio: '' } : {}),
    }))

    if (field === 'direccion_cita') {
      setSelectedCoords(parseCoordinates(value))
    }

    if (field === 'modalidad' && value === 'CLINICA') {
      setSelectedCoords(null)
    }
  }

  const buildPayload = (): CitaPayload => ({
    mascota: Number(form.mascota),
    servicio: Number(form.servicio),
    precio_servicio: Number(form.precio_servicio),
    fecha_programada: form.fecha_programada,
    hora_inicio: form.hora_inicio,
    modalidad: form.modalidad,
    direccion_cita:
      form.modalidad === 'DOMICILIO' ? form.direccion_cita.trim() || null : null,
    descripcion: form.descripcion.trim(),
  })

  const resetForm = () => {
    setForm(initialReservaForm)
    setEditingId(null)
    setSelectedCoords(null)
    setIsGettingLocation(false)
  }

  const closeForm = () => {
    resetForm()
    setIsFormOpen(false)
  }

  const openCreateModal = () => {
    resetForm()
    setMessage(null)
    setIsFormOpen(true)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return

    try {
      if (editingId) {
        await updateCita({ id: editingId, body: buildPayload() }).unwrap()
        setMessage('Reserva modificada correctamente.')
      } else {
        await createCita(buildPayload()).unwrap()
        setMessage('Reserva creada correctamente.')
      }
      closeForm()
    } catch (error) {
      setMessage(getApiErrorMessage(error))
    }
  }

  const startEdit = (cita: Cita) => {
    setMessage(null)
    const existingAddress = cita.direccion_cita || ''

    setEditingId(cita.id_cita)
    setForm({
      mascota: String(cita.mascota),
      servicio: String(cita.servicio),
      precio_servicio: String(cita.precio_servicio),
      fecha_programada: cita.fecha_programada,
      hora_inicio: cita.hora_inicio.slice(0, 5),
      modalidad: cita.modalidad,
      direccion_cita: existingAddress,
      descripcion: cita.descripcion || '',
    })
    setSelectedCoords(parseCoordinates(existingAddress))
    setIsFormOpen(true)
  }

  const handleCancel = async () => {
    if (!cancelId || !cancelReason.trim()) return

    try {
      await cancelCita({
        id: cancelId,
        motivo_cancelacion: cancelReason.trim(),
      }).unwrap()
      setCancelId(null)
      setCancelReason('')
      setMessage('Reserva cancelada correctamente.')
    } catch (error) {
      setMessage(getApiErrorMessage(error))
    }
  }

  const obtenerUbicacion = () => {
    if (!navigator.geolocation) {
      setMessage('Tu navegador no soporta geolocalizacion.')
      return
    }

    setIsGettingLocation(true)
    setMessage(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }

        setSelectedCoords(coords)
        setForm((prev) => ({
          ...prev,
          direccion_cita: formatCoordinates(coords),
        }))
        setIsGettingLocation(false)
      },
      () => {
        setIsGettingLocation(false)
        setMessage('No se pudo obtener la ubicacion actual.')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    )
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
          Mis reservas
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-gray-900">Listado de reservas</h1>
          <Button
            type="button"
            className="bg-orange-500 hover:bg-orange-600"
            onClick={openCreateModal}
          >
            Agregar reserva nueva
          </Button>
        </div>
      </div>

      <ReservaForm
        availablePrecios={availablePrecios}
        canSubmit={canSubmit}
        creating={creating}
        dateTimeIsFuture={dateTimeIsFuture}
        editingId={editingId}
        form={form}
        handleSubmit={handleSubmit}
        isFormOpen={isFormOpen}
        isGettingLocation={isGettingLocation}
        loadingCatalogs={loadingCatalogs}
        loadingMascotas={loadingMascotas}
        loadingServicios={loadingServicios}
        mapCoords={mapCoords}
        mascotas={mascotas}
        mascotasError={mascotasError}
        message={message}
        onCancel={closeForm}
        onGetLocation={obtenerUbicacion}
        openChange={(open) => {
          setIsFormOpen(open)
          if (!open) closeForm()
        }}
        preciosError={preciosError}
        servicios={activeServicios}
        serviciosError={serviciosError}
        updateField={updateField}
        updating={updating}
        citas={citas}
      />

      <ReservasList
        cancelId={cancelId}
        cancelReason={cancelReason}
        canceling={canceling}
        citas={citas}
        citasError={citasError}
        loadingCitas={loadingCitas}
        onCancelReasonChange={setCancelReason}
        onCloseCancel={() => setCancelId(null)}
        onConfirmCancel={handleCancel}
        onOpenCancel={setCancelId}
        onStartEdit={startEdit}
      />
    </section>
  )
}
