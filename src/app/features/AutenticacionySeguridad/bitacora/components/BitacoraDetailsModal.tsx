import type { Bitacora } from '../store/bitacora.types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '#/components/ui/dialog';

interface BitacoraDetailsModalProps {
  bitacora: Bitacora | null;
  onClose: () => void;
}

export function BitacoraDetailsModal({ bitacora, onClose }: BitacoraDetailsModalProps) {
  // Si no hay bitácora seleccionada, no renderizamos el contenido interno para evitar errores
  if (!bitacora) return null;

  return (
    <Dialog
      open={!!bitacora}
      onOpenChange={(isOpen) => !isOpen && onClose()}
    >
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#7C3AED]">
            Detalle del Evento #{bitacora.id_bitacora}
          </DialogTitle>
          <DialogDescription>
            Información técnica, sistema de origen y metadatos del evento registrado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">

          {/* Información Básica */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-gray-500">Acción:</span>
              <p className="font-medium text-gray-900">{bitacora.accion}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-500">Entidad Afectada:</span>
              <p className="font-medium text-gray-900">
                {bitacora.entidad_tipo || 'N/A'}
                {bitacora.entidad_id ? ` (#${bitacora.entidad_id})` : ''}
              </p>
            </div>
            <div className="col-span-2">
              <span className="font-semibold text-gray-500">Descripción:</span>
              <p className="font-medium text-gray-900">{bitacora.descripcion}</p>
            </div>
          </div>

          {/* Datos Técnicos (Navegador) */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <span className="font-semibold text-gray-500 text-sm block mb-1">
              User Agent (Navegador/Dispositivo):
            </span>
            <p className="font-mono text-xs text-gray-700 break-words">
              {bitacora.user_agent || 'Desconocido'}
            </p>
          </div>

          {/* Visualización de Metadatos: Tabla Antes y Después */}
          <div>
            <span className="font-semibold text-gray-800 text-sm block mb-2">
              Metadatos y Registro de Cambios:
            </span>
            {bitacora.metadatos && bitacora.metadatos.comparacion && Object.keys(bitacora.metadatos.comparacion).length > 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm mb-4">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#7C3AED]/10 text-[#7C3AED] border-b border-[#7C3AED]/20">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Propiedad Modificada</th>
                      <th className="px-4 py-3 font-semibold text-red-500">Valor Anterior (Antes)</th>
                      <th className="px-4 py-3 font-semibold text-green-600">Nuevo Valor (Después)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {Object.entries(bitacora.metadatos.comparacion).map(([key, diff]: [string, any]) => (
                      <tr key={key} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900 capitalize">
                          {key.replace(/_/g, ' ')}
                        </td>
                        <td className="px-4 py-3 text-red-600 font-mono text-xs bg-red-50/50">
                          {diff.anterior === null ? 'null' : String(diff.anterior)}
                        </td>
                        <td className="px-4 py-3 text-green-600 font-mono text-xs bg-green-50/50">
                          {diff.actualizado === null ? 'null' : String(diff.actualizado)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {/* Si no hay comparación o se trata de una tabla de otro tipo de evento */}
            {!bitacora.metadatos?.comparacion && (
              <div className="bg-slate-900 p-4 rounded-xl overflow-x-auto shadow-inner mt-2">
                <pre className="font-mono text-xs text-green-400">
                  <code>
                    {Object.keys(bitacora.metadatos || {}).length > 0
                      ? JSON.stringify(bitacora.metadatos, null, 2)
                      : '// No hay metadatos adicionales para este evento.'}
                  </code>
                </pre>
              </div>
            )}

            {/* Resto de metadatos adicionales en caso de actualización */}
            {bitacora.metadatos && bitacora.metadatos.comparacion && (
              <div className="mt-3">
                <span className="font-semibold text-gray-500 text-xs block mb-2">
                  Metadatos adicionales de la petición:
                </span>
                <div className="bg-slate-900 p-3 rounded-lg overflow-x-auto shadow-inner">
                  <pre className="font-mono text-xs text-gray-300">
                    <code>
                      {JSON.stringify(
                        Object.fromEntries(
                          Object.entries(bitacora.metadatos).filter(
                            ([k]) =>
                              !['comparacion', 'datos_anteriores', 'datos_actualizados', 'campos_actualizados'].includes(
                                k
                              )
                          )
                        ),
                        null,
                        2
                      )}
                    </code>
                  </pre>
                </div>
              </div>
            )}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}