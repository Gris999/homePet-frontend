import { api } from '#/store/api/api';
import type { BackupRestore, BackupConfig, PaginatedResponse, BackupFilters } from './backup.types';

export const backupApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBackups: builder.query<PaginatedResponse<BackupRestore>, BackupFilters & { veterinaria_id?: number }>({
      query: (params) => ({
        url: 'auth/backups/',
        params,
      }),
      providesTags: ['Backup'],
    }),

    createBackup: builder.mutation<BackupRestore, { motivo?: string; scope?: 'TENANT' | 'GLOBAL'; veterinaria_id?: number }>({
      query: (data) => ({
        url: 'auth/backups/create/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Backup', 'BackupConfig'],
    }),

    restoreBackup: builder.mutation<
      { success: boolean; message: string },
      { backup_id: number; motivo: string; scope?: 'TENANT' | 'GLOBAL'; veterinaria_id_target?: number }
    >({
      query: ({ backup_id, motivo, scope, veterinaria_id_target }) => ({
        url: `auth/backups/${backup_id}/restore/`,
        method: 'POST',
        body: { motivo, scope, veterinaria_id_target },
      }),
      invalidatesTags: ['Backup'],
    }),

    getBackupConfig: builder.query<BackupConfig, number | void>({
      query: (veterinariaId) => ({
        url: 'auth/backups/config/',
        method: 'GET',
        ...(veterinariaId ? { params: { veterinaria_id: veterinariaId } } : {}),
      }),
      providesTags: ['BackupConfig'],
    }),

    updateBackupConfig: builder.mutation<BackupConfig, Partial<BackupConfig> & { veterinaria_id?: number }>({
      query: (data) => ({
        url: 'auth/backups/config/',
        method: 'PATCH',
        ...(data.veterinaria_id ? { params: { veterinaria_id: data.veterinaria_id } } : {}),
        body: data,
      }),
      invalidatesTags: ['BackupConfig', 'Backup'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetBackupsQuery,
  useCreateBackupMutation,
  useRestoreBackupMutation,
  useGetBackupConfigQuery,
  useUpdateBackupConfigMutation,
} = backupApi;
