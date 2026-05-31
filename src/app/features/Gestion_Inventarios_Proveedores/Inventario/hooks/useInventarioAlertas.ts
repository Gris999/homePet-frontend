import { useMemo } from 'react';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import {
  useGetAlertasLotesProximoVencerQuery,
  useGetAlertasLotesVencidosQuery,
  useGetAlertasResumenQuery,
  useGetAlertasStocksAgotadosQuery,
  useGetAlertasStocksBajosQuery,
} from '../services/inventarioApi';
import type { EstadoAlertaInventario, InventarioAlertaItem } from '../types';

export interface UseInventarioAlertasParams {
  dias: number;
  enabled?: boolean;
  estado?: 'all' | EstadoAlertaInventario;
  categoriaNombre?: string;
  idPunto?: number;
  search?: string;
}

function ensureArray<T>(data: T[] | { resultados?: T[] } | undefined): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray(data.resultados)) {
    return data.resultados;
  }
  return [];
}

const getErrorMessage = (error?: FetchBaseQueryError | SerializedError) => {
  if (!error) return null;
  if ('status' in error) {
    if (typeof error.data === 'string') return error.data;
    if (error.data && typeof error.data === 'object' && 'detail' in error.data) {
      return String((error.data as { detail?: string }).detail ?? 'Error al cargar alertas.');
    }
    if (error.data && typeof error.data === 'object') {
      return 'No se pudieron cargar las alertas.';
    }
    return `Error HTTP ${String(error.status)}`;
  }
  if (typeof error.message === 'string') return error.message;
  return 'No se pudieron cargar las alertas.';
};

export function useInventarioAlertas(params: UseInventarioAlertasParams) {
  const queryParams = useMemo(
    () => ({ dias: params.dias }),
    [params.dias],
  );

  const stocksBajos = useGetAlertasStocksBajosQuery(undefined, {
    skip: params.enabled === false,
  });
  const stocksAgotados = useGetAlertasStocksAgotadosQuery(undefined, {
    skip: params.enabled === false,
  });
  const lotesVencidos = useGetAlertasLotesVencidosQuery(undefined, {
    skip: params.enabled === false,
  });
  const lotesProximo = useGetAlertasLotesProximoVencerQuery(queryParams, {
    skip: params.enabled === false,
  });
  const resumen = useGetAlertasResumenQuery(queryParams, {
    skip: params.enabled === false,
  });

  const isLoading =
    stocksBajos.isLoading ||
    stocksAgotados.isLoading ||
    lotesVencidos.isLoading ||
    lotesProximo.isLoading ||
    resumen.isLoading;

  const isFetching =
    stocksBajos.isFetching ||
    stocksAgotados.isFetching ||
    lotesVencidos.isFetching ||
    lotesProximo.isFetching ||
    resumen.isFetching;

  const error =
    stocksBajos.error ??
    stocksAgotados.error ??
    lotesVencidos.error ??
    lotesProximo.error ??
    resumen.error;

  const allItems = useMemo(() => {
    const bajosItems = ensureArray(stocksBajos.data);
    const agotadosItems = ensureArray(stocksAgotados.data);
    const vencidosItems = ensureArray(lotesVencidos.data);
    const proximoItems = ensureArray(lotesProximo.data);

    return [
      ...bajosItems,
      ...agotadosItems,
      ...vencidosItems,
      ...proximoItems,
    ];
  }, [stocksBajos.data, stocksAgotados.data, lotesVencidos.data, lotesProximo.data]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      if (params.estado && params.estado !== 'all' && item.tipo_alerta !== params.estado) {
        return false;
      }
      if (params.idPunto && item.id_punto !== params.idPunto) {
        return false;
      }
      if (
        params.categoriaNombre &&
        item.categoria_producto.toLowerCase() !== params.categoriaNombre.toLowerCase()
      ) {
        return false;
      }
      if (params.search) {
        const term = params.search.toLowerCase();
        if (!item.producto_nombre.toLowerCase().includes(term)) {
          return false;
        }
      }
      return true;
    });
  }, [allItems, params.estado, params.idPunto, params.categoriaNombre, params.search]);

  const refetch = () => {
    void stocksBajos.refetch();
    void stocksAgotados.refetch();
    void lotesVencidos.refetch();
    void lotesProximo.refetch();
    void resumen.refetch();
  };

  return {
    resumen: resumen.data,
    items: filteredItems,
    isLoading,
    isFetching,
    isError: Boolean(error),
    errorMessage: getErrorMessage(error),
    refetch,
  };
}
