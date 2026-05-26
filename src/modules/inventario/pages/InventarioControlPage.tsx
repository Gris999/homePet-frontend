import { useMemo, useState } from 'react';
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
import {
  useGetDisponibilidadProductoQuery,
  useGetPuntosInventarioQuery,
  useGetStockAlertasQuery,
  useGetStockGeneralQuery,
  useGetStockUnidadesMovilesQuery,
} from '../services/inventarioApi';
import { AlertasStockTable } from '../components/AlertasStockTable';
import { DisponibilidadProductoCard } from '../components/DisponibilidadProductoCard';
import { StockTable } from '../components/StockTable';

type TabType = 'GENERAL' | 'MOVIL' | 'ALERTAS';

export function InventarioControlPage() {
  const [activeTab, setActiveTab] = useState<TabType>('GENERAL');
  const [search, setSearch] = useState('');
  const [idCategoria, setIdCategoria] = useState<string>('all');
  const [idPunto, setIdPunto] = useState<string>('all');
  const [estadoAlerta, setEstadoAlerta] = useState<'all' | 'AGOTADO' | 'STOCK_BAJO'>(
    'all',
  );
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
    skip: activeTab !== 'GENERAL',
  });
  const stockMovilQuery = useGetStockUnidadesMovilesQuery(stockParams, {
    skip: activeTab !== 'MOVIL',
  });
  const stockAlertasQuery = useGetStockAlertasQuery(
    {
      estado: estadoAlerta === 'all' ? undefined : estadoAlerta,
    },
    { skip: activeTab !== 'ALERTAS' },
  );
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
            <div className="mt-4 max-w-xs">
              <Select value={estadoAlerta} onValueChange={(v) => setEstadoAlerta(v as any)}>
                <SelectTrigger className="h-11 w-full border-[#C4B5FD] bg-white text-slate-900 data-placeholder:text-slate-400">
                  <SelectValue placeholder="Estado alerta" />
                </SelectTrigger>
                <SelectContent className="border-[#E9D5FF] bg-white text-slate-900">
                  <SelectItem value="all" className="text-slate-900 focus:bg-[#F3E8FF] focus:text-[#6A24D4]">Todas</SelectItem>
                  <SelectItem value="AGOTADO" className="text-slate-900 focus:bg-[#F3E8FF] focus:text-[#6A24D4]">AGOTADO</SelectItem>
                  <SelectItem value="STOCK_BAJO" className="text-slate-900 focus:bg-[#F3E8FF] focus:text-[#6A24D4]">STOCK_BAJO</SelectItem>
                </SelectContent>
              </Select>
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
          <AlertasStockTable
            items={stockAlertasQuery.data ?? []}
            isLoading={stockAlertasQuery.isLoading}
          />
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
