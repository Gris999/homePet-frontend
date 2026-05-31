import type { DisponibilidadProductoResponse } from '../types';

function asNumber(value: string | number | undefined) {
  const numeric = typeof value === 'number' ? value : Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

export function DisponibilidadProductoCard({
  data,
  isLoading,
}: {
  data?: DisponibilidadProductoResponse;
  isLoading?: boolean;
}) {
  return (
    <section className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-[#7C3AED]">
        Disponibilidad por producto
      </h3>
      {isLoading ? (
        <p className="mt-3 text-sm text-slate-500">Consultando disponibilidad...</p>
      ) : !data ? (
        <p className="mt-3 text-sm text-slate-500">
          Selecciona un producto para ver su disponibilidad.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Metric label="Stock total" value={asNumber(data.stock_total)} />
          <Metric label="Stock general" value={asNumber(data.stock_general)} />
          <Metric label="Stock movil" value={asNumber(data.stock_movil)} />
        </div>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-orange-100 bg-[#FFF7ED] px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-extrabold text-[#F97316]">
        {value.toFixed(2)}
      </p>
    </div>
  );
}
