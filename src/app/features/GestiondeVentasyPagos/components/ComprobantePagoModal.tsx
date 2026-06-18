import { Button } from '#/components/ui/button'
import { useGetComprobanteByIdQuery } from '../services/pagosApi'
import { cn } from '#/lib/utils'

interface ComprobantePagoModalProps {
  idComprobante: number
  onClose: () => void
}

export function ComprobantePagoModal({ idComprobante, onClose }: ComprobantePagoModalProps) {
  const { data: comprobante, isLoading, error } = useGetComprobanteByIdQuery(idComprobante, {
    skip: idComprobante <= 0,
  })

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-[#6A24D4] px-6 py-4 text-white">
          <h3 className="text-lg font-black tracking-wide">Comprobante de Pago</h3>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white text-xl font-bold transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[80vh] print:p-0">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#6A24D4] border-t-transparent"></div>
              <p className="text-sm text-slate-500 font-medium">Cargando comprobante...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 text-center">
              No se pudo cargar el detalle del comprobante de pago.
            </div>
          )}

          {comprobante && (
            <div className="space-y-6 print:space-y-4" id="printable-receipt">
              
              {/* Receipt Header Style */}
              <div className="text-center pb-4 border-b border-dashed border-slate-200">
                <h2 className="text-2xl font-black text-slate-900">PET HOME</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Cuidado y Amor para tu Mascota</p>
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold uppercase">
                  <span>{comprobante.tipo_comprobante}</span>
                  <span>·</span>
                  <span>{comprobante.numero_comprobante}</span>
                </div>
              </div>

              {/* Summary details */}
              <div className="grid grid-cols-2 gap-4 text-xs text-slate-600 bg-slate-50 rounded-xl p-4">
                <div>
                  <span className="block text-slate-400 font-medium">Fecha Emisión</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(comprobante.fecha_emision).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium">Método de Pago</span>
                  <span className="font-semibold text-slate-800 uppercase">{comprobante.metodo_pago}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium">Estado Comprobante</span>
                  <span className={cn(
                    "font-bold uppercase",
                    comprobante.estado === 'EMITIDO' ? "text-emerald-600" : "text-red-500"
                  )}>
                    {comprobante.estado}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium">Código Pago</span>
                  <span className="font-semibold text-slate-800">#{comprobante.id_pago}</span>
                </div>
              </div>

              {/* Items Desglose */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3">Detalle de Cobro</h4>
                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
                        <th className="px-4 py-2 font-bold">Descripción</th>
                        <th className="px-4 py-2 font-bold text-right">Cant</th>
                        <th className="px-4 py-2 font-bold text-right">Unitario</th>
                        <th className="px-4 py-2 font-bold text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {comprobante.detalle_items?.items?.map((item, index) => (
                        <tr key={index} className="text-slate-700">
                          <td className="px-4 py-3 font-medium">
                            {item.descripcion}
                            <span className="block text-[10px] text-slate-400 mt-0.5 uppercase">
                              {item.tipo}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">{item.cantidad}</td>
                          <td className="px-4 py-3 text-right">Bs {Number(item.precio_unitario).toFixed(2)}</td>
                          <td className="px-4 py-3 text-right font-semibold">Bs {Number(item.subtotal).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-dashed border-slate-200 pt-4 flex flex-col items-end space-y-1.5">
                <div className="flex justify-between w-full max-w-[240px] text-xs text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-800">
                    Bs {Number(comprobante.monto).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between w-full max-w-[240px] text-base font-bold text-slate-900 border-t border-slate-100 pt-1.5">
                  <span>Total Final:</span>
                  <span className="text-[#6A24D4]">
                    Bs {Number(comprobante.monto).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center pt-2 text-[10px] text-slate-400 font-medium">
                Gracias por confiar en nosotros.<br />
                PetHome © {new Date().getFullYear()} - Todos los derechos reservados.
              </div>

            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="rounded-xl font-semibold text-xs h-9 px-4"
          >
            Cerrar
          </Button>
          {comprobante && (
            <Button 
              type="button" 
              onClick={handlePrint}
              className="bg-[#6A24D4] hover:bg-[#5b1fbc] text-white rounded-xl font-semibold text-xs h-9 px-4"
            >
              Imprimir
            </Button>
          )}
        </div>

      </div>
    </div>
  )
}
