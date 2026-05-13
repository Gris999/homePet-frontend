import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Database, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAppSelector } from '#/store/hooks';
import type { BackupRestore } from '../store/backup.types';

interface BackupDetailsModalProps {
  backup: BackupRestore | null;
  onClose: () => void;
  onRestore?: (backup: BackupRestore) => void;
  onPerformRestore?: (payload: { motivo?: string; scope?: 'TENANT' | 'GLOBAL'; veterinaria_id_target?: number }) => Promise<void>;
}

interface Veterinaria {
  id_veterinaria: number;
  nombre: string;
  slug: string;
}

export function BackupDetailsModal({ backup, onClose, onRestore, onPerformRestore }: BackupDetailsModalProps) {
  const [copiedHash, setCopiedHash] = useState(false);
  const [motivo, setMotivo] = useState('Restauración manual');
  const [scope, setScope] = useState<'TENANT' | 'GLOBAL'>('TENANT');
  const [veterinarias, setVeterinarias] = useState<Veterinaria[]>([]);
  const [selectedVetId, setSelectedVetId] = useState<number | null>(null);
  const [loadingVets, setLoadingVets] = useState(false);
  const [vetError, setVetError] = useState<string | null>(null);
  // If parent provides onPerformRestore, we use it; otherwise we would call internal mutation (kept for backward compatibility)
  const [isRestoring, setIsRestoring] = useState(false);
  const user = useAppSelector((state) => state.auth.user);
  const isSuperuser = user?.is_superuser || false;

  useEffect(() => {
    if (!backup) return;
    setMotivo('Restauración manual');
    setScope('TENANT');
    setVeterinarias([]);
    setSelectedVetId(null);
    setVetError(null);
    setLoadingVets(false);
    setCopiedHash(false);
  }, [backup?.id_backup_restore]);

  useEffect(() => {
    // Cargar lista de veterinarias desde API cuando se selecciona GLOBAL
    if (isSuperuser && backup && scope === 'GLOBAL') {
      setLoadingVets(true);
      setVetError(null);
      fetch('/api/auth/public/veterinarias/')
        .then(r => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then(data => {
          const vetsList = data.results || (Array.isArray(data) ? data : []);
          setVeterinarias(vetsList);
          if (vetsList.length === 0) {
            setVetError('No se encontraron clínicas');
          }
        })
        .catch(err => {
          console.error('Error cargando veterinarias:', err);
          setVetError(`Error: ${err.message}`);
        })
        .finally(() => setLoadingVets(false));
    } else if (scope === 'TENANT') {
      // Reset veterinarias si vuelve a TENANT
      setVeterinarias([]);
      setSelectedVetId(null);
    }
  }, [isSuperuser, backup, scope]);

  if (!backup) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const estadoColor = {
    'EXITOSO': 'bg-green-100 text-green-800',
    'FALLIDO': 'bg-red-100 text-red-800',
    'INICIADO': 'bg-yellow-100 text-yellow-800',
  };

  return (
    <Dialog open={!!backup} onOpenChange={() => onClose()}>
      <DialogContent className="!max-w-2xl !max-h-[85vh] w-full overflow-hidden bg-white p-6 rounded-lg shadow-2xl flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-[#7C3AED]">Detalle de Copia #{backup.id_backup_restore}</DialogTitle>
          <DialogDescription>Información completa del backup</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {/* Header con estado */}
          <div className="flex items-start justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-700">Estado de la Copia</p>
              <Badge className={`mt-1 ${estadoColor[backup.estado as keyof typeof estadoColor] || 'bg-gray-100'}`}>
                {backup.estado}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Tipo</p>
              <Badge className="mt-1 bg-blue-100 text-blue-800">
                {backup.tipo}
              </Badge>
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Fecha y Hora</p>
              <p className="mt-1 text-sm text-black">
                {format(new Date(backup.fecha_hora), 'dd MMMM yyyy HH:mm:ss', { locale: es })}
              </p>
            </div>
          </div>

          {/* Usuario */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Usuario que realizó la copia</p>
            <div className="mt-1 space-y-1">
              <p className="text-sm text-black font-medium">{backup.usuario_nombre || 'Sistema'}</p>
              <p className="text-xs text-gray-600">{backup.usuario_correo}</p>
            </div>
          </div>

          {/* Almacenamiento */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Información de Almacenamiento</p>
            <div className="mt-1 space-y-2">
              <div>
                <span className="text-xs text-gray-600">Proveedor: </span>
                <span className="text-sm text-black">{backup.proveedor_almacenamiento}</span>
              </div>
              {backup.ruta_archivo && (
                <div>
                  <span className="text-xs text-gray-600">Ruta: </span>
                  <p className="text-xs text-gray-800 break-all font-mono bg-gray-100 p-2 rounded">
                    {backup.ruta_archivo}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Hash */}
          {backup.hash_archivo && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Verificación (SHA-256)</p>
              <div className="mt-1 flex items-center gap-2">
                <code className="flex-1 text-xs text-gray-800 bg-gray-100 p-2 rounded break-all font-mono">
                  {backup.hash_archivo}
                </code>
                <button
                  onClick={() => copyToClipboard(backup.hash_archivo!)}
                  className="p-2 hover:bg-gray-200 rounded transition"
                  title="Copiar hash"
                >
                  {copiedHash ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Motivo */}
          {backup.motivo && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Motivo</p>
              <p className="mt-1 text-sm text-gray-800 italic">"{backup.motivo}"</p>
            </div>
          )}

          {/* Mensaje de error si aplica */}
          {backup.estado === 'FALLIDO' && backup.motivo && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-xs font-medium text-red-900 uppercase">Razón del fallo</p>
              <p className="mt-1 text-sm text-red-800">{backup.motivo}</p>
            </div>
          )}

          <div className="my-4">
            <label className="text-sm font-medium text-gray-700">Motivo de la restauración (opcional):</label>
            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: Recuperación por error, pruebas..."
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-black bg-white"
              id="restore-reason-modal"
            />
          </div>

          {/* Selector de Scope (solo para superadministradores) */}
          {isSuperuser && (
            <div className="my-4">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Alcance de Restauración
              </label>
              <p className="text-xs text-gray-500 mt-1 mb-3">
                Elige qué datos se restaurarán desde este backup
              </p>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <input
                    type="radio"
                    name="scope"
                    value="TENANT"
                    checked={scope === 'TENANT'}
                    onChange={(e) => setScope(e.target.value as 'TENANT' | 'GLOBAL')}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Restaurar Solo Esta Clínica</p>
                    <p className="text-xs text-gray-600">Se restaurarán solo los datos de esta veterinaria (clientes, mascotas, consultas, etc.)</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border-2 border-red-300 rounded-lg cursor-pointer hover:bg-red-50 transition bg-red-50">
                  <input
                    type="radio"
                    name="scope"
                    value="GLOBAL"
                    checked={scope === 'GLOBAL'}
                    onChange={(e) => setScope(e.target.value as 'TENANT' | 'GLOBAL')}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <Database className="h-4 w-4 text-red-600" />
                      Restaurar Base de Datos Completa
                    </p>
                    <p className="text-xs text-gray-600">⚠️ Se restaurará TODO el sistema incluyendo todas las clínicas. Esta operación es irreversible.</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Selector de Veterinaria (solo si scope=GLOBAL y superuser) */}
          {isSuperuser && scope === 'GLOBAL' && (
            <div className="my-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <label className="text-sm font-medium text-gray-700 block mb-3">
                Selecciona una clínica para restaurar (opcional)
              </label>
              <p className="text-xs text-gray-600 mb-3">
                Si dejas en blanco, se restaurará TODA la base de datos. Si seleccionas una clínica, solo se restaurarán sus datos.
              </p>

              {loadingVets && (
                <div className="text-center py-3 text-gray-600">
                  <p className="text-sm">⏳ Cargando clínicas...</p>
                </div>
              )}

              {vetError && (
                <div className="p-2 rounded bg-red-100 border border-red-300 mb-3">
                  <p className="text-xs text-red-800">{vetError}</p>
                </div>
              )}

              {!loadingVets && veterinarias.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 p-2 border border-blue-300 rounded cursor-pointer hover:bg-blue-100 transition">
                    <input
                      type="radio"
                      name="vet-select"
                      value=""
                      checked={selectedVetId === null}
                      onChange={() => setSelectedVetId(null)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-900">Todas las clínicas</span>
                  </label>
                  {veterinarias.map((vet) => (
                    <label key={vet.id_veterinaria} className="flex items-center gap-2 p-2 border border-blue-300 rounded cursor-pointer hover:bg-blue-100 transition">
                      <input
                        type="radio"
                        name="vet-select"
                        value={vet.id_veterinaria}
                        checked={selectedVetId === vet.id_veterinaria}
                        onChange={() => setSelectedVetId(vet.id_veterinaria)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-900">{vet.nombre}</span>
                    </label>
                  ))}
                </div>
              )}

              {!loadingVets && veterinarias.length === 0 && !vetError && (
                <div className="text-center py-3">
                  <p className="text-xs text-gray-600">No hay clínicas disponibles</p>
                </div>
              )}
            </div>
          )}
        </div>

          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => onClose()}>Cerrar</Button>
            <Button
              variant={scope === 'GLOBAL' ? 'destructive' : 'default'}
              disabled={isRestoring}
              onClick={async () => {
                if (!backup) return;
                setIsRestoring(true);
                try {
                  if (onPerformRestore) {
                    await onPerformRestore({ motivo, scope, veterinaria_id_target: selectedVetId || undefined });
                  } else {
                    console.error('onPerformRestore no está disponible');
                  }
                  if (onRestore) onRestore(backup);
                } catch (err) {
                  console.error('Error restaurando desde modal:', err);
                } finally {
                  setIsRestoring(false);
                  onClose();
                }
              }}
            >
              {isRestoring ? 'Restaurando...' : scope === 'GLOBAL' ? '⚠️ Restaurar' : 'Restaurar'}
            </Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
