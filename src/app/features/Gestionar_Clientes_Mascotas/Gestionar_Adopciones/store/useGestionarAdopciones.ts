import { useEffect, useState } from "react"
import type { AdopcionFilters, AdopcionPayload } from "../types"
import {
  useCreateAdopcionMutation,
  useDeleteAdopcionMutation,
  useGetAdopcionesQuery,
  useGetClientesAdopcionQuery,
  useGetEspeciesAdopcionQuery,
  useLazyGetRazasAdopcionByEspecieQuery,
  useUpdateAdopcionMutation,
  useUploadAdopcionFotoMutation,
} from "./gestionarAdopcionesApi"

export function useGestionarAdopciones(filters: AdopcionFilters) {
  const {
    data: adopciones = [],
    isLoading: loading,
    refetch,
  } = useGetAdopcionesQuery(filters)

  const { data: clientes = [] } = useGetClientesAdopcionQuery()
  const { data: especies = [] } = useGetEspeciesAdopcionQuery()
  const [triggerRazas, { data: razasData, isLoading: razasLoading }] =
    useLazyGetRazasAdopcionByEspecieQuery()
  const [razas, setRazas] = useState(razasData || [])

  const [createMutation] = useCreateAdopcionMutation()
  const [updateMutation] = useUpdateAdopcionMutation()
  const [deleteMutation] = useDeleteAdopcionMutation()
  const [uploadFotoMutation] = useUploadAdopcionFotoMutation()

  useEffect(() => {
    if (razasData) setRazas(razasData)
  }, [razasData])

  const loadRazasByEspecie = async (idEspecie: number | "") => {
    if (!idEspecie) {
      setRazas([])
      return
    }
    const result = await triggerRazas(idEspecie).unwrap()
    setRazas(result)
  }

  return {
    adopciones,
    clientes,
    especies,
    razas,
    loading,
    razasLoading,
    reloadAdopciones: refetch,
    loadRazasByEspecie,
    createAdopcion: (payload: AdopcionPayload) => createMutation(payload).unwrap(),
    updateAdopcion: (id: number, payload: Partial<AdopcionPayload>) =>
      updateMutation({ id, body: payload }).unwrap(),
    deleteAdopcion: (id: number) => deleteMutation(id).unwrap(),
    uploadAdopcionFoto: (file: File) => uploadFotoMutation(file).unwrap(),
  }
}
