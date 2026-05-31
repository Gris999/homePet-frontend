import type {
  CreateMovimientoPayload,
  TipoMovimientoInventario,
} from '../types';

export function requiresOrigen(tipo: TipoMovimientoInventario) {
  return ['SALIDA', 'CONSUMO', 'TRANSFERENCIA', 'DEVOLUCION'].includes(tipo);
}

export function requiresDestino(tipo: TipoMovimientoInventario) {
  return ['ENTRADA', 'REPOSICION', 'TRANSFERENCIA', 'DEVOLUCION'].includes(tipo);
}

export function validateMovimientoPayload(payload: CreateMovimientoPayload) {
  const errors: string[] = [];
  const cantidad = Number(payload.cantidad);

  if (!Number.isFinite(cantidad) || cantidad <= 0) {
    errors.push('La cantidad debe ser mayor a cero.');
  }

  if (requiresOrigen(payload.tipo) && !payload.id_punto_origen) {
    errors.push(
      payload.tipo === 'TRANSFERENCIA' || payload.tipo === 'DEVOLUCION'
        ? 'Transferencia/devolucion requiere origen y destino.'
        : `${payload.tipo} requiere punto de origen.`,
    );
  }

  if (requiresDestino(payload.tipo) && !payload.id_punto_destino) {
    errors.push(
      payload.tipo === 'TRANSFERENCIA' || payload.tipo === 'DEVOLUCION'
        ? 'Transferencia/devolucion requiere origen y destino.'
        : `${payload.tipo} requiere punto de destino.`,
    );
  }

  if (
    (payload.tipo === 'TRANSFERENCIA' || payload.tipo === 'DEVOLUCION') &&
    payload.id_punto_origen &&
    payload.id_punto_destino &&
    payload.id_punto_origen === payload.id_punto_destino
  ) {
    errors.push('Origen y destino no pueden ser iguales.');
  }

  return errors;
}
