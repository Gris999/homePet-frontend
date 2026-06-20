import {
  Users,
  PawPrint,
  DollarSign,
  ShoppingCart,
  Heart,
  RefreshCw,
} from 'lucide-react'
import { useCallback } from 'react'
import { StatCard } from '../components/StatCard'
import { SalesChart } from '../components/SalesChart'
import { ReservationsPieChart } from '../components/ReservationsPieChart'
import { TopServicesChart } from '../components/TopServicesChart'
import { TopProductsChart } from '../components/TopProductsChart'
import { LowStockTable } from '../components/LowStockTable'
import { UpcomingReservations } from '../components/UpcomingReservations'
import { AdoptionsList } from '../components/AdoptionsList'
import { useAppSelector } from '#/store/hooks'
import { useGetDashboardKPIsQuery } from '../store/dashboardApi'

export function DashboardScreen() {
  const veterinaria = useAppSelector((state) => state.tenant.veterinaria)

  const {
    data: kpis,
    isLoading,
    error,
    refetch,
  } = useGetDashboardKPIsQuery(
    { periodo: 'mes' },
    { pollingInterval: 30000, refetchOnFocus: true },
  )

  const resumen = kpis?.resumen
  const ventas = kpis?.ventas
  const reservas = kpis?.reservas
  const inventario = kpis?.inventario
  const adopciones = kpis?.adopciones
  const alertas = kpis?.alertas

  const hasError = Boolean(error)
  const ultimaActualizacion = kpis?.ultima_actualizacion
    ? new Date(kpis.ultima_actualizacion).toLocaleTimeString('es', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : null

  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight font-sans">
            Dashboard
          </h2>
          <p className="text-gray-500 mt-1">
            {veterinaria?.nombre
              ? `Resumen de ${veterinaria.nombre}`
              : 'Resumen de tu clínica veterinaria.'}
            {ultimaActualizacion && (
              <span className="ml-2 text-xs text-gray-400">
                · Última actualización: {ultimaActualizacion}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw
            className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
          />
          Actualizar
        </button>
      </div>

      {/* Alertas */}
      {alertas && alertas.length > 0 && !hasError && (
        <div className="flex flex-wrap gap-2">
          {alertas.map((alerta, i) => (
            <div
              key={i}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                alerta.severidad === 'alta'
                  ? 'bg-red-100 text-red-700'
                  : alerta.severidad === 'media'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-blue-100 text-blue-700'
              }`}
            >
              {alerta.mensaje}
            </div>
          ))}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Ventas Hoy"
          value={resumen?.ventas_dia ?? '--'}
          trend={
            hasError
              ? 'Error al cargar'
              : isLoading
                ? 'Cargando...'
                : (resumen?.ventas_dia ?? 0) === 0
                  ? 'Sin ventas hoy'
                  : 'Datos reales'
          }
          trendUp={false}
          hasError={hasError}
          icon={<ShoppingCart className="w-5 h-5 text-purple-600" />}
          iconBgSpan="bg-purple-100"
        />
        <StatCard
          title="Ingresos Hoy"
          value={
            resumen?.ingresos_dia != null
              ? `$${Number(resumen.ingresos_dia).toFixed(2)}`
              : '--'
          }
          trend={
            hasError
              ? 'Error al cargar'
              : isLoading
                ? 'Cargando...'
                : (resumen?.ingresos_dia ?? 0) === 0
                  ? 'Sin ingresos'
                  : 'Datos reales'
          }
          trendUp={false}
          hasError={hasError}
          icon={<DollarSign className="w-5 h-5 text-green-600" />}
          iconBgSpan="bg-green-100"
        />
        <StatCard
          title="Ventas del Mes"
          value={resumen?.ventas_periodo ?? '--'}
          trend={
            hasError
              ? 'Error al cargar'
              : isLoading
                ? 'Cargando...'
                : (resumen?.ventas_periodo ?? 0) === 0
                  ? 'Sin ventas'
                  : 'Datos reales'
          }
          trendUp={false}
          hasError={hasError}
          icon={<ShoppingCart className="w-5 h-5 text-blue-600" />}
          iconBgSpan="bg-blue-100"
        />
        <StatCard
          title="Clientes"
          value={resumen?.clientes_total ?? '--'}
          trend={
            hasError
              ? 'Error al cargar'
              : isLoading
                ? 'Cargando...'
                : (resumen?.clientes_total ?? 0) === 0
                  ? 'Sin clientes'
                  : `+${resumen?.clientes_nuevos_periodo ?? 0} este mes`
          }
          trendUp={true}
          hasError={hasError}
          icon={<Users className="w-5 h-5 text-purple-600" />}
          iconBgSpan="bg-purple-100"
        />
        <StatCard
          title="Mascotas"
          value={resumen?.mascotas_total ?? '--'}
          trend={
            hasError
              ? 'Error al cargar'
              : isLoading
                ? 'Cargando...'
                : (resumen?.mascotas_total ?? 0) === 0
                  ? 'Sin mascotas'
                  : `+${resumen?.mascotas_nuevas_periodo ?? 0} este mes`
          }
          trendUp={true}
          hasError={hasError}
          icon={<PawPrint className="w-5 h-5 text-orange-500" />}
          iconBgSpan="bg-orange-100"
        />
        <StatCard
          title="Adopciones"
          value={resumen?.adopciones_disponibles ?? '--'}
          trend={
            hasError
              ? 'Error al cargar'
              : isLoading
                ? 'Cargando...'
                : (resumen?.adopciones_disponibles ?? 0) === 0
                  ? 'Sin disponibles'
                  : 'Disponibles'
          }
          trendUp={false}
          hasError={hasError}
          icon={<Heart className="w-5 h-5 text-pink-600" />}
          iconBgSpan="bg-pink-100"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart
          data={ventas?.por_dia || []}
          isLoading={isLoading}
          hasError={hasError}
        />
        <ReservationsPieChart
          data={reservas?.por_estado || []}
          isLoading={isLoading}
          hasError={hasError}
        />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopServicesChart
          data={reservas?.servicios_mas_solicitados || []}
          isLoading={isLoading}
          hasError={hasError}
        />
        <TopProductsChart
          data={ventas?.productos_mas_vendidos || []}
          isLoading={isLoading}
          hasError={hasError}
        />
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <UpcomingReservations
            data={reservas?.proximas_reservas || []}
            isLoading={isLoading}
            hasError={hasError}
          />
        </div>
        <div className="lg:col-span-1">
          <LowStockTable
            data={inventario?.stock_bajo || []}
            isLoading={isLoading}
            hasError={hasError}
          />
        </div>
        <div className="lg:col-span-1">
          <AdoptionsList
            data={adopciones?.lista || []}
            isLoading={isLoading}
            hasError={hasError}
          />
        </div>
      </div>
    </div>
  )
}
