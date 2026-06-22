import type { AppDispatch } from "../store";
import { setCredentials, updateUser } from "./authSlice";
import { setTenant } from "../tenant/tenantSlice";
import { setComponents } from "../components/componentSlice";
import type { AuthContextResponse, LoginResponse } from "./auth.types";

export function applyLoginContext(dispatch: AppDispatch, data: LoginResponse) {
  // Guardar tokens y usuario básico
  dispatch(
    setCredentials({
      accessToken: data.access,
      refreshToken: data.refresh,
      user: data.usuario,
    })
  );

  // Guardar veterinaria y plan
  dispatch(
    setTenant({
      veterinaria: data.veterinaria,
      plan: data.plan,
    })
  );

  // Guardar componentes y permisos
  dispatch(setComponents(data.componentes));
}

export function applyMeContext(
  dispatch: AppDispatch,
  data: AuthContextResponse
) {
  // Aquí no actualizamos tokens porque /me no los devuelve,
  // solo actualizamos el usuario y el contexto.
  // Pero podríamos necesitar una acción para actualizar solo el usuario.
  
  // Usamos setCredentials conservando los tokens actuales si fuera necesario,
  // o creamos una acción específica en el futuro.
  // Por ahora, el plan dice "reconstruir Redux".
  
  dispatch(updateUser(data.usuario))

  dispatch(
    setTenant({
      veterinaria: data.veterinaria,
      plan: data.plan,
    })
  );

  dispatch(setComponents(data.componentes));
}
