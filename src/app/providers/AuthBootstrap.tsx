import { useEffect, useState } from "react";
import { useLazyMeQuery } from "../../store/auth/authApi";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { applyMeContext } from "../../store/auth/applyAuthContext";
import { logout } from "../../store/auth/authSlice";
import { useFcmToken } from "../../hooks/useFcmToken";

export const AuthBootstrap = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const { accessToken } = useAppSelector((state) => state.auth);
  const [isInitializing, setIsInitializing] = useState(true);
  const [triggerMe] = useLazyMeQuery();
  
  // Activar escucha de notificaciones
  useFcmToken();

  useEffect(() => {
    const initializeAuth = async () => {
      // Si hay un token pero no estamos marcados como autenticados en esta sesión 
      // o simplemente al recargar la página (cuando Redux se vacía).
      // Nota: isAuthenticated ya viene de persisted state si lo configuramos así,
      // pero /me es necesario para reconstruir el contexto SaaS (veterinaria, plan, componentes).
      
      if (accessToken) {
        try {
          const data = await triggerMe().unwrap();
          applyMeContext(dispatch, data);
        } catch (error) {
          console.error("Error reconstruyendo contexto SaaS:", error);
          dispatch(logout());
        }
      }
      
      setIsInitializing(false);
    };

    initializeAuth();
  }, [accessToken, dispatch, triggerMe]);

  if (isInitializing) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#7C3AED] border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500 animate-pulse">
            Iniciando PetHome...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
