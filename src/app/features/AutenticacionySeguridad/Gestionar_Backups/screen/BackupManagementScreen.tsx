import { useEffect, useState, useMemo } from 'react';
import { useGetBackupsQuery, useCreateBackupMutation, useGetBackupConfigQuery, useUpdateBackupConfigMutation, useRestoreBackupMutation } from '../store/backupApi';
import { useGetPublicVeterinariasQuery } from '#/store/veterinarias/publicVeterinariaApi';
import { BackupConfigPanel, BackupActionButtons, BackupTable, BackupDetailsModal } from '../components';
import type { BackupFilters, BackupRestore } from '../store/backup.types';
import { useAppSelector } from '#/store/hooks';

interface VeterinariaOption {
  id_veterinaria: number;
  nombre: string;
  direccion?: string | null;
}

export default function BackupManagementScreen() {
  const [filters, setFilters] = useState<BackupFilters>({ page: 1 });
  const [selectedBackup, setSelectedBackup] = useState<BackupRestore | null>(null);
  const [veterinarias, setVeterinarias] = useState<VeterinariaOption[]>([]);
  const [selectedVeterinariaId, setSelectedVeterinariaId] = useState<number | undefined>(undefined);
  const user = useAppSelector((state) => state.auth.user);
  const isSuperuser = user?.is_superuser || false;

  useEffect(() => {
    // Usar RTK Query para obtener veterinarias públicas (maneja basePath y parsing)
    if (!isSuperuser) return;
    // trigger query via hook below
  }, [isSuperuser]);

  // Hook RTK Query para obtener veterinarias públicas
  const { data: publicVets, isLoading: loadingVets, error: vetError } = useGetPublicVeterinariasQuery(undefined);

  useEffect(() => {
    if (!isSuperuser) return;
    const vets = Array.isArray(publicVets) ? publicVets : publicVets?.results || [];
    setVeterinarias(vets as VeterinariaOption[]);
    if (!selectedVeterinariaId && vets.length > 0) {
      setSelectedVeterinariaId(vets[0].id_veterinaria);
    }
  }, [publicVets, isSuperuser]);

  // Queries
  const backupsQueryArgs = isSuperuser ? filters : { ...filters, veterinaria_id: selectedVeterinariaId };
  const {
    data: backupsData,
    isLoading: backupsLoading,
    refetch: refetchBackups,
  } = useGetBackupsQuery(backupsQueryArgs);
  const { data: configData, isLoading: configLoading } = useGetBackupConfigQuery(
    isSuperuser ? selectedVeterinariaId : undefined,
    { skip: isSuperuser && !selectedVeterinariaId }
  );

  // Mutations
  const [createBackup, { isLoading: isCreatingBackup }] = useCreateBackupMutation();
  const [restoreBackup, { isLoading: isRestoring }] = useRestoreBackupMutation();
  const [updateConfig, { isLoading: isUpdatingConfig }] = useUpdateBackupConfigMutation();

  // Manejadores
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
    // Abrir el modal de detalles para que el usuario pueda seleccionar el scope y veterinaria
    setSelectedBackup(toRestore);
  };

  const handlePerformRestore = async ({ motivo, scope, veterinaria_id_target }: { motivo?: string; scope?: 'TENANT' | 'GLOBAL'; veterinaria_id_target?: number }) => {
    const backup = selectedBackup;
    if (!backup) return;
    try {
      const inferredScope = scope || (backup.ruta_archivo?.includes('backups/global/') ? 'GLOBAL' : 'TENANT');
      await restoreBackup({
        backup_id: backup.id_backup_restore,
        motivo: motivo || 'Restauración manual',
        scope: inferredScope,
        veterinaria_id_target: veterinaria_id_target || undefined,
      }).unwrap();
      // Refrescar lista
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
      });
    } catch (error) {
      console.error('Error actualizando configuración:', error);
    }
  };

  const totalPages = useMemo(() => {
    if (!backupsData?.count) return 1;
    return Math.ceil(backupsData.count / 10);
  }, [backupsData?.count]);

  // Para superuser: mostrar la última copia GLOBAL si existe en el listado de backups
  const lastGlobalBackup = useMemo(() => {
    if (!isSuperuser) return null;
    const list = backupsData?.results || [];
    // Buscar el backup con ruta 'backups/global/' y tomar el más reciente por fecha
    const globals = list.filter((b: any) => b.ruta_archivo && b.ruta_archivo.includes('backups/global/'));
    if (globals.length === 0) return null;
    return globals.reduce((a: any, c: any) => (new Date(a.fecha_hora) > new Date(c.fecha_hora) ? a : c));
  }, [isSuperuser, backupsData]);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Copias de Seguridad</h1>
        <p className="text-gray-500 mt-1">
          Administra tus copias de seguridad, configura la automatización y restaura desde versiones anteriores.
        </p>
      </div>

      {isSuperuser && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
          <p className="text-sm font-medium text-blue-900">Modo global activado</p>
          <p className="mt-1 text-sm text-blue-800">
            Las copias manuales se crearán automáticamente como GLOBAL. Se usa una clínica de referencia solo para leer historial y configuración.
          </p>
        </div>
      )}

      {/* Panel de Configuración */}
      <BackupConfigPanel
        config={configData}
        isLoading={configLoading}
        onSave={handleConfigSave}
        isSaving={isUpdatingConfig}
      />

      {/* Resumen rápido: última copia / próxima ejecución */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Última copia</p>
            <p className="text-base font-medium text-gray-800">
              {isSuperuser
                ? lastGlobalBackup?.fecha_hora
                  ? new Date(lastGlobalBackup.fecha_hora).toLocaleString()
                  : configData?.["último_backup"]
                    ? new Date(configData["último_backup"]).toLocaleString()
                    : '— No disponible'
                : configData?.["último_backup"]
                  ? new Date(configData["último_backup"]).toLocaleString()
                  : '— No disponible'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Próxima ejecución</p>
            <p className="text-base font-medium text-gray-800">
              {configData?.["próximo_backup_programado"] ? new Date(configData["próximo_backup_programado"]).toLocaleString() : '— No programada'}
            </p>
          </div>
        </div>
      </div>

      {/* Sección de Acciones */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Acciones Rápidas</h2>
        <BackupActionButtons
          onBackupClick={handleBackupClick}
          onRestoreClick={handleRestoreClick}
          onPerformRestore={handlePerformRestore}
          isBackupLoading={isCreatingBackup}
          isRestoreLoading={isRestoring}
          selectedBackupId={selectedBackup?.id_backup_restore}
          allowRestore={true} // TODO: verificar permisos del usuario
        />
      </div>

      {/* Historial de Copias */}
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

      {/* Modal de Detalles de Backup */}
      <BackupDetailsModal
        backup={selectedBackup}
        onClose={() => setSelectedBackup(null)}
        onRestore={(backup) => {
          console.log('Backup restaurado:', backup);
          // Refrescar lista de backups después de restaurar
          setFilters({ page: 1 });
        }}
        onPerformRestore={handlePerformRestore}
      />
    </div>
  );
}
