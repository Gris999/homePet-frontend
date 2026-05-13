import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Save, AlertCircle } from 'lucide-react';
import type { BackupConfig } from '../store/backup.types';

interface BackupConfigPanelProps {
  config: BackupConfig | undefined;
  isLoading: boolean;
  onSave: (data: Partial<BackupConfig>) => void;
  isSaving: boolean;
}

export function BackupConfigPanel({
  config,
  isLoading,
  onSave,
  isSaving,
}: BackupConfigPanelProps) {
  const [frecuencia, setFrecuencia] = useState<string>(config?.frecuencia || 'SEMANAL');
  const [diasRetention, setDiasRetention] = useState<number>(config?.dias_retención || 30);
  const [horaEjecucion, setHoraEjecucion] = useState<number>(config?.hora_ejecucion ?? 2);
  const [minutoEjecucion, setMinutoEjecucion] = useState<number>(config?.minuto_ejecucion ?? 15);
  const [diasSemana, setDiasSemana] = useState<number[]>(config?.dias_semana ?? []);

  useEffect(() => {
    setFrecuencia(config?.frecuencia || 'SEMANAL');
    setDiasRetention(config?.dias_retención || 30);
    setHoraEjecucion(config?.hora_ejecucion ?? 2);
    setMinutoEjecucion(config?.minuto_ejecucion ?? 15);
    setDiasSemana(config?.dias_semana ?? []);
  }, [config?.id_backup_config, config?.frecuencia, config?.dias_retención, config?.hora_ejecucion, config?.minuto_ejecucion, config?.dias_semana]);

  const diasSemanaLabels = [
    'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
  ];

  const toggleDiaSemana = (dia: number) => {
    setDiasSemana(prev => 
      prev.includes(dia) 
        ? prev.filter(d => d !== dia)
        : [...prev, dia].sort()
    );
  };

  const handleSave = () => {
    const saveData: any = {
      frecuencia: frecuencia as 'DIARIO' | 'SEMANAL' | 'MENSUAL' | 'PERSONALIZADO',
      dias_retención: diasRetention,
    };

    if (frecuencia === 'PERSONALIZADO') {
      saveData.hora_ejecucion = horaEjecucion;
      saveData.minuto_ejecucion = minutoEjecucion;
      if (diasSemana.length > 0) {
        saveData.dias_semana = diasSemana;
      }
    }

    onSave(saveData);
  };

  const hasChanges = 
    frecuencia !== config?.frecuencia || 
    diasRetention !== config?.dias_retención ||
    (frecuencia === 'PERSONALIZADO' && (
      horaEjecucion !== config?.hora_ejecucion ||
      minutoEjecucion !== (config?.minuto_ejecucion ?? 15) ||
      JSON.stringify(diasSemana) !== JSON.stringify(config?.dias_semana || [])
    ));

  return (
    <Card className="border-[#7C3AED] bg-gradient-to-br from-white to-purple-50">
      <CardHeader>
        <CardTitle className="text-[#7C3AED]">Configuración de Copias Automáticas</CardTitle>
        <CardDescription>
          Define la frecuencia y política de retención de tus copias de seguridad automáticas
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Frecuencia */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Frecuencia de Copia Automática</label>
          <Select value={frecuencia} onValueChange={setFrecuencia} disabled={isLoading}>
            <SelectTrigger className="bg-white border-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DIARIO">Diario (cada 24 horas)</SelectItem>
              <SelectItem value="SEMANAL">Semanal (cada 7 días)</SelectItem>
              <SelectItem value="MENSUAL">Mensual (cada 30 días)</SelectItem>
              <SelectItem value="PERSONALIZADO">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Configuración Personalizada */}
        {frecuencia === 'PERSONALIZADO' && (
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Hora de Ejecución</label>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={horaEjecucion}
                  onChange={(e) => setHoraEjecucion(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                  disabled={isLoading}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg bg-white text-black"
                />
                <span className="text-sm text-gray-600">hrs</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutoEjecucion}
                  onChange={(e) => setMinutoEjecucion(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  disabled={isLoading}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg bg-white text-black"
                />
                <span className="text-sm text-gray-600">min</span>
                <span className="text-sm text-gray-600 ml-2">
                  {String(horaEjecucion).padStart(2, '0')}:{String(minutoEjecucion).padStart(2, '0')} hrs
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Hora del día en que se ejecutará el backup</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Días de Ejecución</label>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {diasSemanaLabels.map((dia, index) => (
                  <button
                    key={index}
                    onClick={() => toggleDiaSemana(index)}
                    disabled={isLoading}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                      diasSemana.includes(index)
                        ? 'bg-[#7C3AED] text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {dia.slice(0, 3)}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Selecciona qué días ejecutar el backup
                {diasSemana.length === 0 && <span className="text-orange-600"> (Selecciona al menos un día)</span>}
              </p>
            </div>
          </div>
        )}

        {/* Días de Retención */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Días de Retención</label>
          <div className="flex gap-3 items-center">
            <input
              type="number"
              min="1"
              max="365"
              value={diasRetention}
              onChange={(e) => setDiasRetention(Math.max(1, Math.min(365, parseInt(e.target.value) || 30)))}
              disabled={isLoading}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-black"
            />
            <span className="text-sm text-gray-600">días</span>
          </div>
          <p className="text-xs text-gray-500">
            Las copias más antiguas se eliminarán automáticamente
          </p>
        </div>

        {/* Información del Próximo Backup */}
        {config?.próximo_backup_programado && (
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 space-y-1">
            <div className="flex items-center gap-2 text-blue-900">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Próxima copia programada</span>
            </div>
            <p className="text-sm text-blue-800 ml-6">
              {format(new Date(config.próximo_backup_programado), 'dd MMMM yyyy HH:mm', {
                locale: es,
              })}
            </p>
          </div>
        )}

        {/* Última Copia */}
        {config?.último_backup && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-3 space-y-1">
            <div className="flex items-center gap-2 text-green-900">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Última copia realizada</span>
            </div>
            <p className="text-sm text-green-800 ml-6">
              {format(new Date(config.último_backup), 'dd MMMM yyyy HH:mm', {
                locale: es,
              })}
            </p>
          </div>
        )}

        {config?.actualizado && (
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 space-y-1">
            <div className="flex items-center gap-2 text-gray-800">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Última actualización</span>
            </div>
            <p className="text-sm text-gray-700 ml-6">
              {format(new Date(config.actualizado), 'dd MMMM yyyy HH:mm', {
                locale: es,
              })}
            </p>
          </div>
        )}

        {/* Botones de Acción */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving || isLoading}
            className="bg-[#F97316] text-white hover:bg-[#EA580C]"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>

          {!hasChanges && (
            <p className="text-sm text-gray-500 self-center">Sin cambios</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
