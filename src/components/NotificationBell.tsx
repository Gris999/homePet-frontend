import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { 
  useGetNotificationHistoryQuery, 
  useMarkNotificationReadMutation 
} from '#/app/features/NotificacionesySeguimiento/store/notificacionesApi';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu';
import { Button } from '#/components/ui/button';
import { Badge } from '#/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Notificacion } from '#/app/features/NotificacionesySeguimiento/types/notificaciones.types';

export const NotificationBell = () => {
  const { data: notifications = [], isLoading } = useGetNotificationHistoryQuery(undefined, {
    pollingInterval: 30000, // Refrescar cada 30 segundos
  });
  const [markAsRead] = useMarkNotificationReadMutation();
  const [lastCount, setLastCount] = useState(0);

  const unreadCount = notifications.filter((n: Notificacion) => n.estado !== 'LEIDA').length;

  // Sistema de respaldo: Si el número de no leídas sube, avisamos visualmente
  useEffect(() => {
    if (unreadCount > lastCount) {
      const newNotif = notifications[0]; // La más reciente
      if (newNotif) {
        import('sonner').then(({ toast }) => {
          toast.info(newNotif.titulo, {
            description: newNotif.mensaje,
            duration: 5000,
          });
        });
      }
    }
    setLastCount(unreadCount);
  }, [unreadCount, notifications, lastCount]);

  const handleNotificationClick = async (id: number) => {
    try {
      await markAsRead(id).unwrap();
    } catch (err) {
      console.error('Error al marcar como leída:', err);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative z-50 pointer-events-auto">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-red-600 text-[10px] p-0"
              variant="destructive"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 z-[100]" sideOffset={8}>
        <DropdownMenuLabel className="flex items-center justify-between">
          Notificaciones
          {unreadCount > 0 && <span className="text-xs font-normal text-muted-foreground">{unreadCount} nuevas</span>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[400px] overflow-y-auto overflow-x-hidden">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Cargando...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No tienes notificaciones</div>
          ) : (
            notifications.map((notif: Notificacion) => (
              <DropdownMenuItem 
                key={notif.id_notificacion}
                className={`flex flex-col items-start gap-1 p-4 cursor-pointer focus:bg-accent ${notif.estado !== 'LEIDA' ? 'bg-accent/30' : ''}`}
                onClick={() => handleNotificationClick(notif.id_notificacion)}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className={`text-sm font-medium ${notif.estado !== 'LEIDA' ? 'text-primary' : ''}`}>
                    {notif.titulo}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(notif.fecha_creacion), { addSuffix: true, locale: es })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {notif.mensaje}
                </p>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
