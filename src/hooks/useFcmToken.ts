import { useEffect, useState } from 'react';
import { requestForToken } from '#/lib/firebase';
import { useRegisterDeviceMutation } from '#/app/features/NotificacionesySeguimiento/store/notificacionesApi';
import { useSelector } from 'react-redux';
import type { RootState } from '#/store/store';
import { toast } from 'sonner';

export const useFcmToken = () => {
  const [token, setToken] = useState<string | null>(null);
  const [registerDevice] = useRegisterDeviceMutation();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const getNotificationPermission = async () => {
      if (!isAuthenticated) return;

      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const fcmToken = await requestForToken();
          if (fcmToken) {
            setToken(fcmToken);
            await registerDevice({
              token_fcm: fcmToken,
              plataforma: 'WEB'
            }).unwrap();
            console.log('Token FCM registrado correctamente');
          }
        }
      } catch (err) {
        console.error('Error en flujo de permisos/registro:', err);
      }
    };

    getNotificationPermission();
  }, [isAuthenticated, registerDevice]);

  useEffect(() => {
    // Escuchar mensajes en primer plano de forma continua
    const setupListener = async () => {
      const { getMessagingSafe } = await import('#/lib/firebase');
      const messaging = await getMessagingSafe();
      if (!messaging) return;

      const { onMessage } = await import('firebase/messaging');
      
      return onMessage(messaging, (payload) => {
        console.log("Mensaje recibido en tiempo real:", payload);
        if (payload?.notification) {
          toast.info(payload.notification.title, {
            description: payload.notification.body,
            duration: 5000,
          });
        }
      });
    };

    const unsubscribe = setupListener();
    return () => {
      unsubscribe.then(unsub => unsub?.());
    };
  }, []);

  return { token };
};
