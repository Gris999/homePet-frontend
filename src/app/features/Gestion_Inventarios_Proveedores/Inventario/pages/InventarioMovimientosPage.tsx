import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Input } from '#/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select';
import { useGetProductosQuery } from '#/store/inventario/productosApi';
import {
  useCreateMovimientoMutation,
  useGetMovimientosQuery,
  useGetPuntosInventarioQuery,
} from '../services/inventarioApi';
import { MovimientoForm } from '../components/MovimientoForm';
import { MovimientosTable } from '../components/MovimientosTable';
import type {
  ApiErrorResponse,
  CreateMovimientoPayload,
  TipoMovimientoInventario,
} from '../types';

const MOVIMIENTO_OPTIONS: Array<TipoMovimientoInventario | 'all'> = [
  'all',
  'ENTRADA',
  'SALIDA',
  'CONSUMO',
  'REPOSICION',
  'TRANSFERENCIA',
  'DEVOLUCION',
  'AJUSTE',
];

function extractApiMessages(error: unknown) {
  const response = (error as { data?: ApiErrorResponse }).data;
  const messages: string[] = [];

  if (!response || typeof response !== 'object') return messages;

  if (typeof response.detail === 'string' && response.detail.trim()) {
    messages.push(response.detail);
  }

  Object.entries(response).forEach(([key, value]) => {
    if (key === 'detail') return;
    if (Array.isArray(value)) {
      value
        .filter((item): item is string => typeof item === 'string')
        .forEach((item) => messages.push(item));
    } else if (typeof value === 'string') {
      messages.push(value);
    }
  });

  return [...new Set(messages)];
}

export function InventarioMovimientosPage() {
  const { data: productos = [] } = useGetProductosQuery();
  const { data: puntos = [] } = useGetPuntosInventarioQuery();
  const [createMovimiento, createState] = useCreateMovimientoMutation();

  const [tipoFiltro, setTipoFiltro] = useState<TipoMovimientoInventario | 'all'>('all');
  const [productoFiltro, setProductoFiltro] = useState<string>('all');
  const [puntoFiltro, setPuntoFiltro] = useState<string>('all');
  const [usuarioFiltro, setUsuarioFiltro] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  const movimientosParams = useMemo(
    () => ({
      tipo: tipoFiltro === 'all' ? undefined : tipoFiltro,
      id_producto: productoFiltro === 'all' ? undefined : Number(productoFiltro),
      id_punto: puntoFiltro === 'all' ? undefined : Number(puntoFiltro),
      id_usuario: usuarioFiltro.trim() ? Number(usuarioFiltro) : undefined,
      fecha_desde: fechaDesde || undefined,
      fecha_hasta: fechaHasta || undefined,
    }),
    [tipoFiltro, productoFiltro, puntoFiltro, usuarioFiltro, fechaDesde, fechaHasta],
  );

  const movimientosQuery = useGetMovimientosQuery(movimientosParams);

  const handleCreate = async (payload: CreateMovimientoPayload) => {
    try {
      const response = await createMovimiento(payload).unwrap();
      toast.success(response.message || 'Movimiento registrado correctamente');
    } catch (error) {
      const backendMessages = extractApiMessages(error);
      if (backendMessages.length) {
        backendMessages.forEach((message) => toast.error(message));
        return;
      }
      toast.error('No se pudo registrar el movimiento.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-orange-100 bg-white px-5 py-6 shadow-sm sm:px-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#F97316]">
            Movimientos de Inventario
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Registra movimientos y consulta el historial por filtros.
          </p>
        </section>

        <MovimientoForm
          productos={productos.map((p) => ({
            id: p.id_producto,
            nombre: p.nombre,
            requiere_control_vencimiento: p.requiere_control_vencimiento,
            dias_alerta_vencimiento: p.dias_alerta_vencimiento,
          }))}
          puntos={puntos}
          onSubmit={handleCreate}
          isLoading={createState.isLoading}
        />

        <section className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-[#7C3AED]">Historial</h3>
          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
            <Select value={tipoFiltro} onValueChange={(value) => setTipoFiltro(value as any)}>
              <SelectTrigger className="h-11 w-full border-[#C4B5FD] bg-white text-slate-900 data-placeholder:text-slate-400">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent className="border-[#E9D5FF] bg-white text-slate-900">
                {MOVIMIENTO_OPTIONS.map((tipo) => (
                  <SelectItem
                    key={tipo}
                    value={tipo}
                    className="text-slate-900 focus:bg-[#F3E8FF] focus:text-[#6A24D4]"
                  >
                    {tipo === 'all' ? 'Todos los tipos' : tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={productoFiltro} onValueChange={setProductoFiltro}>
              <SelectTrigger className="h-11 w-full border-[#C4B5FD] bg-white text-slate-900 data-placeholder:text-slate-400">
                <SelectValue placeholder="Producto" />
              </SelectTrigger>
              <SelectContent className="border-[#E9D5FF] bg-white text-slate-900">
                <SelectItem value="all" className="text-slate-900 focus:bg-[#F3E8FF] focus:text-[#6A24D4]">Todos los productos</SelectItem>
                {productos.map((producto) => (
                  <SelectItem
                    key={producto.id_producto}
                    value={String(producto.id_producto)}
                    className="text-slate-900 focus:bg-[#F3E8FF] focus:text-[#6A24D4]"
                  >
                    {producto.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={puntoFiltro} onValueChange={setPuntoFiltro}>
              <SelectTrigger className="h-11 w-full border-[#C4B5FD] bg-white text-slate-900 data-placeholder:text-slate-400">
                <SelectValue placeholder="Punto" />
              </SelectTrigger>
              <SelectContent className="border-[#E9D5FF] bg-white text-slate-900">
                <SelectItem value="all" className="text-slate-900 focus:bg-[#F3E8FF] focus:text-[#6A24D4]">Todos los puntos</SelectItem>
                {puntos.map((punto) => (
                  <SelectItem
                    key={punto.id_punto}
                    value={String(punto.id_punto)}
                    className="text-slate-900 focus:bg-[#F3E8FF] focus:text-[#6A24D4]"
                  >
                    {punto.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="ID usuario"
              value={usuarioFiltro}
              onChange={(e) => setUsuarioFiltro(e.target.value)}
              type="number"
            />

            <Input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
            />

            <Input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
            />
          </div>
        </section>

        <MovimientosTable
          items={movimientosQuery.data ?? []}
          isLoading={movimientosQuery.isLoading}
        />
      </div>
    </div>
  );
}
