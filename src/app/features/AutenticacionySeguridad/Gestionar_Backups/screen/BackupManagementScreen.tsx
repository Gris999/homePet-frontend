import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  useCreateBackupMutation,
  useGetBackupsQuery,
  useGetBackupConfigQuery,
  useRestoreBackupMutation,
  useUpdateBackupConfigMutation,
} from '../store/backupApi';
import { useGetPublicVeterinariasQuery } from '#/store/veterinarias/publicVeterinariaApi';
import { BackupActionButtons, BackupConfigPanel, BackupDetailsModal, BackupTable } from '../components';
import type { BackupFilters, BackupRestore } from '../store/backup.types';
import { useAppSelector } from '#/store/hooks';

interface VeterinariaOption {
  id_veterinaria: number;
  nombre: string;
  direccion?: string | null;
}

const getLastBackup = (cfg: any): string | null => cfg?.['último_backup'] ?? cfg?.Ãºltimo_backup ?? null;
const getNextBackup = (cfg: any): string | null => cfg?.['próximo_backup_programado'] ?? cfg?.prÃ³ximo_backup_programado ?? null;

export default function BackupManagementScreen() {
  const [filters, setFilters] = useState<BackupFilters>({ page: 1 });
  const [selectedBackup, setSelectedBackup] = useState<BackupRestore | null>(null);
  const [veterinarias, setVeterinarias] = useState<VeterinariaOption[]>([]);
  const [selectedVeterinariaId, setSelectedVeterinariaId] = useState<number | undefined>(undefined);
  const user = useAppSelector((state) => state.auth.user);
  const isSuperuser = user?.is_superuser || false;

  const { data: publicVets } = useGetPublicVeterinariasQuery(undefined);

  useEffect(() => {
    if (!isSuperuser) return;
    const vets = Array.isArray(publicVets) ? publicVets : publicVets?.results || [];
    setVeterinarias(vets as VeterinariaOption[]);
    if (!selectedVeterinariaId && vets.length > 0) {
      setSelectedVeterinariaId(vets[0].id_veterinaria);
    }
  }, [publicVets, isSuperuser, selectedVeterinariaId]);

  const backupsQueryArgs = isSuperuser ? filters : { ...filters, veterinaria_id: selectedVeterinariaId };
  const {
    data: backupsData,
    isLoading: backupsLoading,
    refetch: refetchBackups,
  } = useGetBackupsQuery(backupsQueryArgs);

  const {
    data: configData,
    isLoading: configLoading,
    refetch: refetchConfig,
  } = useGetBackupConfigQuery(isSuperuser ? selectedVeterinariaId : undefined, {
    skip: isSuperuser && !selectedVeterinariaId,
  });

  const [createBackup, { isLoading: isCreatingBackup }] = useCreateBackupMutation();
  const [restoreBackup, { isLoading: isRestoring }] = useRestoreBackupMutation();
  const [updateConfig, { isLoading: isUpdatingConfig }] = useUpdateBackupConfigMutation();

  const handleBackupClick = async (scope: 'TENANT' | 'GLOBAL' = 'TENANT') => {
    try {
      await createBackup({
        motivo: 'Copia de seguridad manual',
        scope,
        veterinaria_id: scope === 'TENANT' && isSuperuser ? selectedVeterinariaId : undefined,
      }).unwrap();
      setFilters({ page: 1 });
      await refetchBackups();
    } catch (error) {
      console.error('Error creando backup:', error);
    }
  };

  const handleRestoreClick = async (backup?: BackupRestore | null) => {
    const toRestore = backup ?? selectedBackup;
    if (!toRestore) return;
    setSelectedBackup(toRestore);
  };

  const handlePerformRestore = async ({
    motivo,
    scope,
    veterinaria_id_target,
  }: {
    motivo?: string;
    scope?: 'TENANT' | 'GLOBAL';
    veterinaria_id_target?: number;
  }) => {
    const backup = selectedBackup;
    if (!backup) return;
    try {
      const inferredScope = scope || (backup.ruta_archivo?.includes('backups/global/') ? 'GLOBAL' : 'TENANT');
      await restoreBackup({
        backup_id: backup.id_backup_restore,
        motivo: motivo || 'Restauracion manual',
        scope: inferredScope,
        veterinaria_id_target: veterinaria_id_target || undefined,
      }).unwrap();
      setFilters({ page: 1 });
      await refetchBackups();
      setSelectedBackup(null);
    } catch (err) {
      console.error('Error realizando restore:', err);
    }
  };

  const handleConfigSave = async (data: any) => {
    try {
      await updateConfig({
        ...data,
        veterinaria_id: isSuperuser ? selectedVeterinariaId : undefined,
      }).unwrap();

      await Promise.all([refetchConfig(), refetchBackups()]);
      toast.success('Configuración guardada');
    } catch (error) {
      console.error('Error actualizando configuracion:', error);
      const err = error as any;
      const backendMessage =
        err?.data?.detail ||
        err?.data?.message ||
        (typeof err?.data === 'string' ? err.data : null) ||
        'No se pudo guardar la configuración';
      toast.error(String(backendMessage));
    }
  };

  const totalPages = useMemo(() => {
    if (!backupsData?.count) return 1;
    return Math.ceil(backupsData.count / 10);
  }, [backupsData?.count]);

  const lastGlobalBackup = useMemo(() => {
    if (!isSuperuser) return null;
    const list = backupsData?.results || [];
    const globals = list.filter((b: any) => b.ruta_archivo && b.ruta_archivo.includes('backups/global/'));
    if (globals.length === 0) return null;
    return globals.reduce((a: any, c: any) => (new Date(a.fecha_hora) > new Date(c.fecha_hora) ? a : c));
  }, [isSuperuser, backupsData]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Gestion de Copias de Seguridad</h1>
        <p className="text-gray-500 mt-1">Administra copias, automatizacion y restauracion.</p>
      </div>

      {isSuperuser && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
          <p className="text-sm font-medium text-blue-900">Modo global activado</p>
          <p className="mt-1 text-sm text-blue-800">Se usa una clinica de referencia para historial y configuracion.</p>
        </div>
      )}

      <BackupConfigPanel config={configData} isLoading={configLoading} onSave={handleConfigSave} isSaving={isUpdatingConfig} />

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Ultima copia</p>
            <p className="text-base font-medium text-gray-800">
              {isSuperuser
                ? lastGlobalBackup?.fecha_hora
                  ? new Date(lastGlobalBackup.fecha_hora).toLocaleString()
                  : getLastBackup(configData)
                    ? new Date(getLastBackup(configData) as string).toLocaleString()
                    : '- No disponible'
                : getLastBackup(configData)
                  ? new Date(getLastBackup(configData) as string).toLocaleString()
                  : '- No disponible'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Proxima ejecucion</p>
            <p className="text-base font-medium text-gray-800">
              {getNextBackup(configData) ? new Date(getNextBackup(configData) as string).toLocaleString() : '- No programada'}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Acciones Rapidas</h2>
        <BackupActionButtons
          onBackupClick={handleBackupClick}
          onRestoreClick={handleRestoreClick}
          onPerformRestore={handlePerformRestore}
          isBackupLoading={isCreatingBackup}
          isRestoreLoading={isRestoring}
          selectedBackupId={selectedBackup?.id_backup_restore}
          allowRestore={true}
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Historial de Copias</h2>
        <BackupTable
          data={backupsData?.results || []}
          isLoading={backupsLoading}
          page={filters.page || 1}
          totalPages={totalPages}
          hasNext={!!backupsData?.next}
          hasPrevious={!!backupsData?.previous}
          onPageChange={(newPage) => setFilters((prev) => ({ ...prev, page: newPage }))}
          onSelectBackup={setSelectedBackup}
        />
      </div>

      <BackupDetailsModal
        backup={selectedBackup}
        onClose={() => setSelectedBackup(null)}
        onRestore={() => setFilters({ page: 1 })}
        onPerformRestore={handlePerformRestore}
      />
    </div>
  );
}
