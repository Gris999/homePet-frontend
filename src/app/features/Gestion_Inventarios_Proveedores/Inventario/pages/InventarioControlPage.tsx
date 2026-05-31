import { Component, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Input } from '#/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select';
import { PackageSearch } from 'lucide-react';
import { useGetCategoriasQuery } from '#/store/inventario/categoriasApi';
import { useGetProductosQuery } from '#/store/inventario/productosApi';
import { useAppSelector } from '#/store/hooks';
import {
  useGetDisponibilidadProductoQuery,
  useGetPuntosInventarioQuery,
  useGetStockGeneralQuery,
  useGetStockUnidadesMovilesQuery,
} from '../services/inventarioApi';
import { AlertasStockTable } from '../components/AlertasStockTable';
import { DisponibilidadProductoCard } from '../components/DisponibilidadProductoCard';
import { StockTable } from '../components/StockTable';
import { useInventarioAlertas } from '../hooks/useInventarioAlertas';

type TabType = 'GENERAL' | 'MOVIL' | 'ALERTAS';

class AlertasSectionBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    if (import.meta.env.DEV) {
      console.error('Error renderizando Alertas:', error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
          <p className="text-sm font-semibold">No se pudieron renderizar las alertas.</p>
          <p className="mt-1 text-sm">Recarga la pagina e intenta nuevamente.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export function InventarioControlPage() {
  const userRole = useAppSelector((state) => state.auth.user?.role);
  const [activeTab, setActiveTab] = useState<TabType>('GENERAL');
  const [search, setSearch] = useState('');
  const [idCategoria, setIdCategoria] = useState<string>('all');
  const [idPunto, setIdPunto] = useState<string>('all');
  const [estadoAlerta, setEstadoAlerta] = useState<
    'all' | 'STOCK_BAJO' | 'AGOTADO' | 'VENCIDO' | 'PROXIMO_VENCER'
  >('all');
  const [diasProximoVencer, setDiasProximoVencer] = useState<string>('30');
  const [productoSeleccionado, setProductoSeleccionado] = useState<string>('all');

  const { data: categorias = [] } = useGetCategoriasQuery();
  const { data: puntos = [] } = useGetPuntosInventarioQuery();
  const { data: productos = [] } = useGetProductosQuery();

  const stockParams = useMemo(
    () => ({
      search: search.trim() || undefined,
      id_categoria_producto: idCategoria === 'all' ? undefined : Number(idCategoria),
      id_punto: idPunto === 'all' ? undefined : Number(idPunto),
    }),
    [search, idCategoria, idPunto],
  );

  const stockGeneralQuery = useGetStockGeneralQuery(stockParams, {
    skip: activeTab !== 'GENERAL' && activeTab !== 'ALERTAS',
  });
  const stockMovilQuery = useGetStockUnidadesMovilesQuery(stockParams, {
    skip: activeTab !== 'MOVIL',
  });
  const categoriaSeleccionadaNombre =
    idCategoria === 'all'
      ? undefined
      : categorias.find((cat) => cat.id_categoria_producto === Number(idCategoria))?.nombre;

  const alertas = useInventarioAlertas({
    enabled: activeTab === 'ALERTAS',
    estado: estadoAlerta,
    dias: Number(diasProximoVencer) || 30,
    idPunto: idPunto === 'all' ? undefined : Number(idPunto),
    categoriaNombre: categoriaSeleccionadaNombre,
    search: search.trim() || undefined,
  });
  const isAdmin = userRole === 'ADMIN';

  const isForbiddenAlertas = alertas.errorMessage
    ?.toLowerCase()
    .includes('solo los veterinarios');

  const fallbackAlertas = useMemo(() => {
    const today = new Date();
    const dias = Number(diasProximoVencer) || 30;
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + dias);

    const base = (stockGeneralQuery.data ?? []).filter((item) => {
      const byPunto = idPunto === 'all' || item.id_punto === Number(idPunto);
      const byCategoria =
        idCategoria === 'all' ||
        item.categoria_producto === categoriaSeleccionadaNombre;
      const bySearch =
        !search.trim() ||
        item.producto_nombre.toLowerCase().includes(search.trim().toLowerCase());
      return byPunto && byCategoria && bySearch;
    });

    const withType = base.flatMap((item) => {
      const results: Array<typeof item & { tipo_alerta: 'STOCK_BAJO' | 'AGOTADO' | 'VENCIDO' | 'PROXIMO_VENCER' }> = [];
      if (item.estado_stock === 'AGOTADO') {
        results.push({ ...item, tipo_alerta: 'AGOTADO' });
      }
      if (item.estado_stock === 'STOCK_BAJO') {
        results.push({ ...item, tipo_alerta: 'STOCK_BAJO' });
      }

      const venc = item.fecha_vencimiento_lote;
      if (venc) {
        const vDate = new Date(venc);
        if (!Number.isNaN(vDate.getTime())) {
          if (vDate < today) {
            results.push({ ...item, tipo_alerta: 'VENCIDO' });
          } else if (vDate <= endDate) {
            results.push({ ...item, tipo_alerta: 'PROXIMO_VENCER' });
          }
        }
      }

      return results;
    });

    const filteredByEstado =
      estadoAlerta === 'all'
        ? withType
        : withType.filter((item) => item.tipo_alerta === estadoAlerta);

    const resumen = {
      stocks_bajos: withType.filter((x) => x.tipo_alerta === 'STOCK_BAJO').length,
      stocks_agotados: withType.filter((x) => x.tipo_alerta === 'AGOTADO').length,
      lotes_vencidos: withType.filter((x) => x.tipo_alerta === 'VENCIDO').length,
      lotes_proximo_vencer: withType.filter((x) => x.tipo_alerta === 'PROXIMO_VENCER').length,
      total_alertas: withType.length,
    };

    return { items: filteredByEstado, resumen };
  }, [
    stockGeneralQuery.data,
    diasProximoVencer,
    idPunto,
    idCategoria,
    categoriaSeleccionadaNombre,
    search,
    estadoAlerta,
  ]);

  const shouldUseFallback = isAdmin && Boolean(isForbiddenAlertas);
  const alertItems = shouldUseFallback ? fallbackAlertas.items : alertas.items;
  const alertResumen = shouldUseFallback ? fallbackAlertas.resumen : alertas.resumen;
  const alertIsError = shouldUseFallback ? false : alertas.isError;
  const alertErrorMessage = shouldUseFallback ? null : alertas.errorMessage;
  const alertIsLoading = shouldUseFallback
    ? stockGeneralQuery.isLoading || stockGeneralQuery.isFetching
    : alertas.isLoading || alertas.isFetching;
  const disponibilidadQuery = useGetDisponibilidadProductoQuery(
    Number(productoSeleccionado),
    { skip: productoSeleccionado === 'all' },
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-orange-100 bg-white px-5 py-6 shadow-sm sm:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F3E8FF]">
              <PackageSearch className="h-7 w-7 text-[#7C3AED]" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#F97316]">
                Control de Inventario
              </h1>
              <p className="text-sm text-slate-600">
                Stock general, unidades moviles, alertas y disponibilidad por producto.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto..."
              className="lg:col-span-2 border-[#C4B5FD] bg-white text-slate-900 placeholder:text-slate-400"
            />

            <Select value={idCategoria} onValueChange={setIdCategoria}>
              <SelectTrigger className="h-11 w-full border-[#C4B5FD] bg-white text-slate-900 data-placeholder:text-slate-400">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent className="border-[#E9D5FF] bg-white text-slate-900">
                <SelectItem value="all" className="text-slate-900 focus:bg-[#F3E8FF] focus:text-[#6A24D4]">Todas las categorias</SelectItem>
                {categorias.map((cat) => (
                  <SelectItem
                    key={cat.id_categoria_producto}
                    value={String(cat.id_categoria_producto)}
                    className="text-slate-900 focus:bg-[#F3E8FF] focus:text-[#6A24D4]"
                  >
                    {cat.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={idPunto} onValueChange={setIdPunto}>
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
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {(['GENERAL', 'MOVIL', 'ALERTAS'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTab === tab
                    ? 'bg-[#7C3AED] text-white'
                    : 'bg-[#F3E8FF] text-[#6A24D4] hover:bg-[#E9D5FF]'
                }`}
              >
                {tab === 'GENERAL'
                  ? 'Stock general'
                  : tab === 'MOVIL'
                    ? 'Unidades moviles'
                    : 'Alertas'}
              </button>
            ))}
          </div>

          {activeTab === 'ALERTAS' && (
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <Select value={estadoAlerta} onValueChange={(v) => setEstadoAlerta(v as typeof estadoAlerta)}>
                <SelectTrigger className="h-11 w-full border-[#C4B5FD] bg-white text-slate-900 data-placeholder:text-slate-400">
                  <SelectValue placeholder="Estado alerta" />
                </SelectTrigger>
                <SelectContent className="border-[#E9D5FF] bg-white text-slate-900">
                  <SelectItem value="all" className="text-slate-900 focus:bg-[#F3E8FF] focus:text-[#6A24D4]">Todas</SelectItem>
                  <SelectItem value="STOCK_BAJO" className="text-slate-900 focus:bg-[#F3E8FF] focus:text-[#6A24D4]">Stock bajo</SelectItem>
                  <SelectItem value="AGOTADO" className="text-slate-900 focus:bg-[#F3E8FF] focus:text-[#6A24D4]">Agotado</SelectItem>
                  <SelectItem value="VENCIDO" className="text-slate-900 focus:bg-[#F3E8FF] focus:text-[#6A24D4]">Vencido</SelectItem>
                  <SelectItem value="PROXIMO_VENCER" className="text-slate-900 focus:bg-[#F3E8FF] focus:text-[#6A24D4]">Proximo a vencer</SelectItem>
                </SelectContent>
              </Select>

              <Input
                value={diasProximoVencer}
                onChange={(e) => setDiasProximoVencer(e.target.value)}
                placeholder="Dias para proximos (ej: 30)"
                type="number"
                min={1}
                className="border-[#C4B5FD] bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>
          )}
        </section>

        {activeTab === 'GENERAL' && (
          <StockTable
            items={stockGeneralQuery.data ?? []}
            isLoading={stockGeneralQuery.isLoading}
          />
        )}

        {activeTab === 'MOVIL' && (
          <StockTable
            items={stockMovilQuery.data ?? []}
            isLoading={stockMovilQuery.isLoading}
          />
        )}

        {activeTab === 'ALERTAS' && (
          <AlertasSectionBoundary>
            <AlertasStockTable
              items={alertItems}
              resumen={alertResumen}
              isLoading={alertIsLoading}
              isError={alertIsError}
              errorMessage={alertErrorMessage}
              onRetry={alertas.refetch}
            />
          </AlertasSectionBoundary>
        )}

        <section className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
          <div className="max-w-md">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Producto para disponibilidad
            </label>
            <Select value={productoSeleccionado} onValueChange={setProductoSeleccionado}>
              <SelectTrigger className="h-11 w-full border-[#C4B5FD] bg-white text-slate-900 data-placeholder:text-slate-400">
                <SelectValue placeholder="Selecciona producto" />
              </SelectTrigger>
              <SelectContent className="border-[#E9D5FF] bg-white text-slate-900">
                <SelectItem value="all" className="text-slate-900 focus:bg-[#F3E8FF] focus:text-[#6A24D4]">Selecciona producto</SelectItem>
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
          </div>
        </section>

        <DisponibilidadProductoCard
          data={disponibilidadQuery.data}
          isLoading={disponibilidadQuery.isLoading}
        />
      </div>
    </div>
  );
}
