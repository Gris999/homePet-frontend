import { useState } from 'react';
import { useAppSelector } from '#/store/hooks';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../../../components/ui/alert-dialog';
import { Download, RotateCcw, AlertCircle } from 'lucide-react';

interface BackupActionButtonsProps {
  onBackupClick: (scope?: 'TENANT' | 'GLOBAL') => void;
  onRestoreClick: () => void;
  onPerformRestore?: (payload: { motivo?: string }) => Promise<void>;
  isBackupLoading: boolean;
  isRestoreLoading: boolean;
  selectedBackupId?: number;
  allowRestore: boolean;
}

export function BackupActionButtons({
  onBackupClick,
  onRestoreClick,
  onPerformRestore,
  isBackupLoading,
  isRestoreLoading,
  selectedBackupId,
  allowRestore,
}: BackupActionButtonsProps) {
  const [showBackupConfirm, setShowBackupConfirm] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [restoreMotivo, setRestoreMotivo] = useState('Restauración manual');
  const user = useAppSelector((s) => s.auth.user);
  const isSuperuser = user?.is_superuser || false;
  const backupScope: 'TENANT' | 'GLOBAL' = isSuperuser ? 'GLOBAL' : 'TENANT';

  const handleBackupConfirm = () => {
    setShowBackupConfirm(false);
    onBackupClick(backupScope);
  };

  const handleRestoreConfirm = () => {
    setShowRestoreConfirm(false);
    if (onPerformRestore) {
      onPerformRestore({ motivo: restoreMotivo }).catch((e) => console.error(e));
    } else {
      onRestoreClick();
    }
  };

  return (
    <>
      <div className="flex gap-3">
        {/* Botón de Backup Manual */}
        <Button
          onClick={() => setShowBackupConfirm(true)}
          disabled={isBackupLoading}
          className="bg-green-600 text-white hover:bg-green-700"
        >
          <Download className="mr-2 h-4 w-4" />
          {isBackupLoading ? 'Creando copia...' : 'Hacer Copia Ahora'}
        </Button>

        {/* Botón de Restaurar */}
        <Button
          onClick={() => setShowRestoreConfirm(true)}
          disabled={!selectedBackupId || isRestoreLoading || !allowRestore}
          variant="destructive"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          {isRestoreLoading ? 'Restaurando...' : 'Restaurar'}
        </Button>

        {!allowRestore && (
          <div className="flex items-center gap-2 text-orange-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>Sin permisos de restauración</span>
          </div>
        )}
      </div>

      {/* Confirmación de Backup */}
      <AlertDialog open={showBackupConfirm} onOpenChange={setShowBackupConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Crear Copia de Seguridad</AlertDialogTitle>
            <AlertDialogDescription>
              {isSuperuser
                ? 'Se creará una copia GLOBAL de todas las clínicas. Este proceso puede tomar varios minutos dependiendo del tamaño de la BD.'
                : 'Se creará una copia de seguridad de esta clínica. Este proceso puede tomar varios minutos dependiendo del tamaño de la BD.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-900">
              {isSuperuser
                ? 'La copia global será almacenada en Google Cloud Storage y estará disponible para restauración.'
                : 'La copia de tu clínica será almacenada en Google Cloud Storage y estará disponible para restauración.'}
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>
              <Button variant="ghost">Cancelar</Button>
            </AlertDialogCancel>
            <AlertDialogAction>
              <Button onClick={handleBackupConfirm} className="bg-green-600 hover:bg-green-700">
                Crear Copia
              </Button>
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmación de Restauración */}
      <AlertDialog open={showRestoreConfirm} onOpenChange={setShowRestoreConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restaurar Base de Datos</AlertDialogTitle>
            <AlertDialogDescription>
              Se reemplazará el contenido actual de la base de datos con la copia seleccionada.
              Esta acción NO se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4 space-y-3">
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm font-medium text-red-900">⚠️ Advertencia:</p>
              <p className="text-sm text-red-800 mt-1">
                Todos los datos creados después de esta copia serán perdidos.
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Motivo de la restauración (opcional):</label>
              <input
                type="text"
                placeholder="Ej: Recuperación por error, pruebas..."
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-black bg-white"
                id="restore-reason"
                value={restoreMotivo}
                onChange={(e) => setRestoreMotivo(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestoreConfirm} className="bg-red-600 hover:bg-red-700">
              Restaurar Base de Datos
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
