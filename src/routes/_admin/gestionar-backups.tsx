import { createFileRoute } from '@tanstack/react-router';
import { BackupManagementScreen } from '@/app/features/AutenticacionySeguridad/Gestionar_Backups';

export const Route = createFileRoute('/_admin/gestionar-backups')({
  component: BackupManagementScreen,
});
