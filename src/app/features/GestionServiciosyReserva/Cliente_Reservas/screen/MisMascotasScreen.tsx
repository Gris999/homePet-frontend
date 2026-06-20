import { useMemo, useState } from 'react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import {
  useCreateMiMascotaMutation,
  useGetEspeciesQuery,
  useGetMisMascotasQuery,
  useGetRazasQuery,
} from '../store/clienteApi'
import { useAppSelector } from '#/store/hooks'
import type {
  Mascota,
  MascotaPayload,
  Raza,
  SexoMascota,
} from '../store/cliente.types'

const initialForm = {
  nombre: '',
  especie: '',
  raza: '',
  sexo: '',
  color: '',
  fecha_nac: '',
  tamano: '',
  peso: '',
  alergias: '',
  notas_generales: '',
}

function getMascotaOwnerId(mascota: Mascota) {
  if (typeof mascota.usuario === 'number') return mascota.usuario
  if (mascota.usuario && typeof mascota.usuario === 'object') {
    return mascota.usuario.id_usuario
  }

  return mascota.usuario_id ?? mascota.id_usuario
}

function getEspecieName(mascota: Mascota) {
  if (mascota.especie_nombre) return mascota.especie_nombre
  if (typeof mascota.especie === 'object') return mascota.especie.nombre
  return 'Especie'
}

function getRazaEspecieId(raza: Raza) {
  if (typeof raza.especie === 'number') return raza.especie
  if (raza.especie && typeof raza.especie === 'object') {
    return raza.especie.id_especie
  }

  return raza.especie_id
}

export function MisMascotasScreen() {
  const [form, setForm] = useState(initialForm)
  const [message, setMessage] = useState<string | null>(null)
  const especieId = form.especie ? Number(form.especie) : undefined
  const user = useAppSelector((state) => state.auth.user)

  const { data: rawMascotas = [], isLoading: loadingMascotas } = useGetMisMascotasQuery()
  const { data: especies = [] } = useGetEspeciesQuery()
  const { data: razas = [] } = useGetRazasQuery(especieId)
  const [createMascota, { isLoading: saving }] = useCreateMiMascotaMutation()
  const razasWithEspecie = razas.filter(
    (raza) => getRazaEspecieId(raza) !== undefined,
  )
  const filteredRazas =
    especieId && razasWithEspecie.length > 0
      ? razas.filter((raza) => getRazaEspecieId(raza) === especieId)
      : razas
  const mascotasWithOwner = rawMascotas.filter(
    (mascota) => getMascotaOwnerId(mascota) !== undefined,
  )
  const mascotas =
    user?.role === 'CLIENT' && user.id_usuario && mascotasWithOwner.length > 0
      ? rawMascotas.filter(
          (mascota) => getMascotaOwnerId(mascota) === user.id_usuario,
        )
      : rawMascotas

  const canSubmit = useMemo(
    () => Boolean(form.nombre.trim() && form.especie),
    [form.nombre, form.especie],
  )

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setMessage(null)
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'especie' ? { raza: '' } : {}),
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return

    const payload: MascotaPayload = {
      nombre: form.nombre.trim(),
      especie_id: Number(form.especie),
      raza_id: form.raza ? Number(form.raza) : null,
      sexo: form.sexo as SexoMascota | '',
      color: form.color.trim(),
      fecha_nac: form.fecha_nac,
      tamano: form.tamano.trim(),
      peso: form.peso,
      alergias: form.alergias.trim(),
      notas_generales: form.notas_generales.trim(),
    }

    try {
      await createMascota(payload).unwrap()
      setForm(initialForm)
      setMessage('Mascota registrada correctamente.')
    } catch {
      setMessage('No se pudo registrar la mascota. Revisa los datos.')
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
          Mis mascotas
        </p>
        <h1 className="text-3xl font-bold text-gray-900">Agregar mascota</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm md:grid-cols-2">
        <Input placeholder="Nombre" value={form.nombre} onChange={(e) => updateField('nombre', e.target.value)} />

        <select
          value={form.especie}
          onChange={(e) => updateField('especie', e.target.value)}
          className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-800"
          required
        >
          <option value="">Selecciona especie</option>
          {especies.map((especie) => (
            <option key={especie.id_especie} value={especie.id_especie}>
              {especie.nombre}
            </option>
          ))}
        </select>

        <select
          value={form.raza}
          onChange={(e) => updateField('raza', e.target.value)}
          className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-800"
          disabled={!form.especie}
        >
          <option value="">Raza opcional</option>
          {filteredRazas.map((raza) => (
            <option key={raza.id_raza} value={raza.id_raza}>
              {raza.nombre}
            </option>
          ))}
        </select>

        <select
          value={form.sexo}
          onChange={(e) => updateField('sexo', e.target.value)}
          className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-800"
        >
          <option value="">Sexo opcional</option>
          <option value="MACHO">Macho</option>
          <option value="HEMBRA">Hembra</option>
        </select>

        <Input placeholder="Color" value={form.color} onChange={(e) => updateField('color', e.target.value)} />
        <Input type="date" value={form.fecha_nac} onChange={(e) => updateField('fecha_nac', e.target.value)} />
        <Input placeholder="Tamano" value={form.tamano} onChange={(e) => updateField('tamano', e.target.value)} />
        <Input type="number" step="0.01" placeholder="Peso" value={form.peso} onChange={(e) => updateField('peso', e.target.value)} />

        <Textarea className="md:col-span-2" placeholder="Alergias" value={form.alergias} onChange={(e) => updateField('alergias', e.target.value)} />
        <Textarea className="md:col-span-2" placeholder="Notas generales" value={form.notas_generales} onChange={(e) => updateField('notas_generales', e.target.value)} />

        <div className="md:col-span-2 flex items-center gap-3">
          <Button disabled={!canSubmit || saving} className="bg-orange-500 hover:bg-orange-600">
            {saving ? 'Guardando...' : 'Guardar mascota'}
          </Button>
          {message && <p className="text-sm text-gray-600">{message}</p>}
        </div>
      </form>

      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Mascotas registradas</h2>
        {loadingMascotas ? (
          <p className="mt-3 text-sm text-gray-600">Cargando mascotas...</p>
        ) : mascotas.length === 0 ? (
          <p className="mt-3 text-sm text-gray-600">Aun no tienes mascotas registradas.</p>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {mascotas.map((mascota) => (
              <div key={mascota.id_mascota} className="rounded-lg border border-gray-200 p-4">
                <p className="font-semibold text-gray-900">{mascota.nombre}</p>
                <p className="text-sm text-gray-600">
                  {getEspecieName(mascota)} {mascota.raza_nombre ? `- ${mascota.raza_nombre}` : ''}
                </p>
                <p className="text-sm text-gray-500">{mascota.sexo || 'Sin sexo registrado'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
