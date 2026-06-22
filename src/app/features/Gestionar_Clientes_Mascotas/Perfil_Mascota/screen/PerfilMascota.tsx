"use client"

import { useEffect, useState } from "react"
import type { Mascota } from "../../Gestionar_Mascotas/types"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  useGetMascotaPerfilQuery,
  useGetMascotaHistorialClinicoQuery,
  useGetMascotaPlanSanitarioQuery,
  useGetMascotaVacunasQuery,
} from "../store"
import { useGetMascotasMeQuery } from "../../Gestionar_Mascotas/store/gestionarMascotasApi"
import {
  MascotaProfileCard,
  HistorialClinicoTratamientos,
  PlanSanitarioPreventivo,
  VacunasAplicadas,
} from "../components"

export function PerfilMascotaScreen() {
  const [selectedMascotaId, setSelectedMascotaId] = useState<number | null>(null)

  // Obtener lista de mascotas del usuario autenticado
  const {
    data: mascotas = [],
    isLoading: isLoadingMascotas,
  } = useGetMascotasMeQuery()

  // Queries para el perfil seleccionado
  const {
    data: mascota,
    isLoading: isLoadingMascota,
  } = useGetMascotaPerfilQuery(selectedMascotaId || 0, {
    skip: !selectedMascotaId,
  })

  const {
    data: historialData,
    isLoading: isLoadingHistorial,
  } = useGetMascotaHistorialClinicoQuery(selectedMascotaId || 0, {
    skip: !selectedMascotaId,
  })

  const {
    data: planSanitario = [],
    isLoading: isLoadingPlanSanitario,
  } = useGetMascotaPlanSanitarioQuery(selectedMascotaId || 0, {
    skip: !selectedMascotaId,
  })

  const {
    data: vacunasData,
    isLoading: isLoadingVacunas,
  } = useGetMascotaVacunasQuery(selectedMascotaId || 0, {
    skip: !selectedMascotaId,
  })

  useEffect(() => {
    if (!selectedMascotaId && mascotas.length > 0) {
      setSelectedMascotaId(mascotas[0].id_mascota)
    }
  }, [mascotas, selectedMascotaId])

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="rounded-3xl border border-[#FED7AA] bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6] p-6 text-white">
        <h1 className="text-3xl font-bold">Perfil de la Mascota</h1>
        <p className="mt-2 opacity-90">
          Selecciona una mascota para ver su información completa
        </p>
      </div>

      {/* Selector de Mascotas */}
      <Card className="border-[#FED7AA] bg-white">
        <CardHeader className="bg-gradient-to-r from-[#ff8d23] via-[#ff8d23] to-[#ff8d23] text-white">
          <CardTitle className="flex items-center gap-3 text-white text-2xl font-bold">
            
            Mis Mascotas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoadingMascotas ? (
            <div className="space-y-2">
              <div className="h-10 animate-pulse rounded bg-gray-200"></div>
            </div>
          ) : mascotas.length === 0 ? (
            <p className="text-center text-gray-500">
              No tienes mascotas registradas
            </p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {mascotas.map((petItem: Mascota) => (
                <Button
                  key={petItem.id_mascota}
                  onClick={() => setSelectedMascotaId(petItem.id_mascota)}
                  variant={
                    selectedMascotaId === petItem.id_mascota
                      ? "default"
                      : "outline"
                  }
                  className={`${
                    selectedMascotaId === petItem.id_mascota
                      ? "bg-[#7C3AED] text-white hover:bg-[#6D28D9]"
                      : "border-[#FFEDD5] text-[#7C3AED] hover:bg-[#FFFDFB]"
                  }`}
                >
                   {petItem.nombre}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contenido del Perfil */}
      {selectedMascotaId ? (
        <div className="space-y-6">
          {/* Perfil Básico */}
          {mascota && (
            <MascotaProfileCard
              mascota={mascota}
              isLoading={isLoadingMascota}
            />
          )}

          <Separator className="bg-[#FFEDD5]" />

          {/* Historial Clínico y Tratamientos */}
          <HistorialClinicoTratamientos
            historial={historialData?.historial_clinico || null}
            tratamientos={historialData?.tratamientos || []}
            isLoading={isLoadingHistorial}
          />

          <Separator className="bg-[#FFEDD5]" />

          <PlanSanitarioPreventivo
            items={planSanitario}
            isLoading={isLoadingPlanSanitario}
          />

          <Separator className="bg-[#FFEDD5]" />

          {/* Vacunas */}
          <VacunasAplicadas
            vacunas={vacunasData?.vacunas_aplicadas || []}
            isLoading={isLoadingVacunas}
          />
        </div>
      ) : (
        <Card className="border-[#FED7AA] bg-white">
          <CardContent className="flex items-center justify-center p-12">
            <p className="text-center text-gray-500">
              Selecciona una mascota para ver su información completa
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
