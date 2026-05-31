import { useMemo, useState } from 'react';
import { Button } from '#/components/ui/button';
import { Input } from '#/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select';
import { toast } from 'sonner';
import type {
  CreateMovimientoPayload,
  PuntoInventario,
  TipoMovimientoInventario,
} from '../types';
import { requiresDestino, requiresOrigen, validateMovimientoPayload } from '../utils/validations';

const TIPOS_MOVIMIENTO: TipoMovimientoInventario[] = [
  'ENTRADA',
  'SALIDA',
  'CONSUMO',
  'REPOSICION',
  'TRANSFERENCIA',
  'DEVOLUCION',
  'AJUSTE',
];

type ProductoOption = {
  id: number;
  nombre: string;
  requiere_control_vencimiento?: boolean;
  dias_alerta_vencimiento?: number | null;
};

export function MovimientoForm({
  productos,
  puntos,
  onSubmit,
  isLoading,
}: {
  productos: ProductoOption[];
  puntos: PuntoInventario[];
  onSubmit: (payload: CreateMovimientoPayload) => Promise<void>;
  isLoading?: boolean;
}) {
  const [tipo, setTipo] = useState<TipoMovimientoInventario>('ENTRADA');
  const [idProducto, setIdProducto] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState('');
  const [idOrigen, setIdOrigen] = useState<number | null>(null);
  const [idDestino, setIdDestino] = useState<number | null>(null);
  const [numeroLote, setNumeroLote] = useState('');
  const [fechaVencimientoLote, setFechaVencimientoLote] = useState('');
  const [motivo, setMotivo] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const productoSeleccionado = productos.find((p) => p.id === idProducto);
  const requiereDatosLote =
    (tipo === 'ENTRADA' || tipo === 'REPOSICION') &&
    Boolean(productoSeleccionado?.requiere_control_vencimiento);

  const payload = useMemo<CreateMovimientoPayload | null>(() => {
    if (!idProducto) return null;
    return {
      tipo,
      id_producto: idProducto,
      cantidad,
      id_punto_origen: idOrigen,
      id_punto_destino: idDestino,
      numero_lote: requiereDatosLote ? numeroLote.trim() || null : null,
      fecha_vencimiento_lote: requiereDatosLote ? fechaVencimientoLote || null : null,
      motivo: motivo.trim() || null,
    };
  }, [tipo, idProducto, cantidad, idOrigen, idDestino, numeroLote, fechaVencimientoLote, motivo, requiereDatosLote]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!payload) {
      setErrors(['Debes seleccionar un producto.']);
      return;
    }

    const validationErrors = validateMovimientoPayload(payload);
    if (requiereDatosLote && !numeroLote.trim()) {
      validationErrors.push('El numero de lote es obligatorio para este producto.');
    }
    if (requiereDatosLote && !fechaVencimientoLote) {
      validationErrors.push('La fecha de vencimiento del lote es obligatoria.');
    }
    setErrors(validationErrors);

    if (validationErrors.length) {
      validationErrors.forEach((message) => toast.error(message));
      return;
    }

    await onSubmit(payload);
    setCantidad('');
    setMotivo('');
    setNumeroLote('');
    setFechaVencimientoLote('');
    if (!requiresOrigen(tipo)) setIdOrigen(null);
    if (!requiresDestino(tipo)) setIdDestino(null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"
    >
      <h3 className="text-lg font-bold text-[#7C3AED]">Registrar movimiento</h3>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormSelect
          label="Tipo"
          value={tipo}
          onValueChange={(value) => setTipo(value as TipoMovimientoInventario)}
          options={TIPOS_MOVIMIENTO.map((value) => ({ value, label: value }))}
        />

        <FormSelect
          label="Producto"
          value={idProducto ? String(idProducto) : ''}
          onValueChange={(value) => setIdProducto(Number(value))}
          options={productos.map((producto) => ({
            value: String(producto.id),
            label: producto.nombre,
          }))}
          placeholder="Selecciona producto"
        />

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">Cantidad</label>
          <Input
            value={cantidad}
            onChange={(event) => setCantidad(event.target.value)}
            placeholder="0.00"
            type="number"
            min="0"
            step="0.01"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">Motivo (opcional)</label>
          <Input
            value={motivo}
            onChange={(event) => setMotivo(event.target.value)}
            placeholder="Detalle del movimiento"
          />
        </div>

        {tipo === 'ENTRADA' || tipo === 'REPOSICION' ? (
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800 md:col-span-2">
            {productoSeleccionado?.requiere_control_vencimiento
              ? `Este producto requiere control de vencimiento. Debes registrar lote y fecha de vencimiento del lote.`
              : 'Lote y vencimiento de lote aplican solo a productos con control de vencimiento activo.'}
          </div>
        ) : null}

        {requiereDatosLote && (
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Numero de lote</label>
            <Input
              value={numeroLote}
              onChange={(event) => setNumeroLote(event.target.value)}
              placeholder="Ej: LOTE-2026-001"
            />
          </div>
        )}

        {requiereDatosLote && (
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Vencimiento de lote</label>
            <Input
              value={fechaVencimientoLote}
              onChange={(event) => setFechaVencimientoLote(event.target.value)}
              type="date"
            />
          </div>
        )}

        {requiresOrigen(tipo) && (
          <FormSelect
            label="Punto origen"
            value={idOrigen ? String(idOrigen) : ''}
            onValueChange={(value) => setIdOrigen(Number(value))}
            options={puntos.map((punto) => ({
              value: String(punto.id_punto),
              label: `${punto.nombre} (${punto.tipo})`,
            }))}
            placeholder="Selecciona origen"
          />
        )}

        {requiresDestino(tipo) && (
          <FormSelect
            label="Punto destino"
            value={idDestino ? String(idDestino) : ''}
            onValueChange={(value) => setIdDestino(Number(value))}
            options={puntos.map((punto) => ({
              value: String(punto.id_punto),
              label: `${punto.nombre} (${punto.tipo})`,
            }))}
            placeholder="Selecciona destino"
          />
        )}
      </div>

      {!!errors.length && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="mt-5 w-full bg-[#F97316] font-semibold text-white hover:bg-[#EA580C]"
      >
        {isLoading ? 'Guardando movimiento...' : 'Guardar movimiento'}
      </Button>
    </form>
  );
}

function FormSelect({
  label,
  value,
  onValueChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-11 w-full border-[#C4B5FD] bg-white text-slate-900 data-placeholder:text-slate-400">
          <SelectValue placeholder={placeholder ?? 'Selecciona'} />
        </SelectTrigger>
        <SelectContent className="border-[#E9D5FF] bg-white text-slate-900">
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="text-slate-900 focus:bg-[#F3E8FF] focus:text-[#6A24D4]"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
