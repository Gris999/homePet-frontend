import { useEffect, useRef, useState } from 'react'
import {
  Search,
  Filter,
  LayoutDashboard,
  Calendar,
  Mic,
  ShoppingBag,
  TrendingUp,
  RotateCcw,
  Clock,
  Printer,
  FileSpreadsheet
} from 'lucide-react'
import { Card, CardContent } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { useAppSelector } from '#/store/hooks'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { Badge } from '#/components/ui/badge'

// Mock data
const mockKPIs = [
  { label: 'Citas del día', value: '6', icon: Clock, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  { label: 'Ingresos (mes)', value: 'Bs 4.820', icon: TrendingUp, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  { label: 'Reservas pendientes', value: '5', icon: ShoppingBag, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { label: 'Actualizaciones hoy', value: '9', icon: RotateCcw, color: 'text-orange-600', bgColor: 'bg-orange-100' },
]

const mockReports = [
  { id: 'SEG-00125', tipo: 'Cita médica', cliente: 'Ana Rojas / Max', estado: 'En proceso', fecha: '10/05/2026', via: 'SÍ' },
  { id: 'PED-00074', tipo: 'Pedido producto', cliente: 'Carlos Méndez / Luna', estado: 'Pendiente', fecha: '09/05/2026', via: 'SÍ' },
  { id: 'SER-00031', tipo: 'Servicio grooming', cliente: 'María Pérez / Rocky', estado: 'Finalizado', fecha: '08/05/2026', via: 'No' },
  { id: 'CIT-00089', tipo: 'Consulta general', cliente: 'Jorge Vaca / Toby', estado: 'Fallido', fecha: '07/05/2026', via: 'No' },
  { id: 'PED-00061', tipo: 'Pedido producto', cliente: 'Sofía Castro / Nala', estado: 'Finalizado', fecha: '06/05/2026', via: 'SÍ' },
]
//link de n8n
const n8nWebhookUrl = 'https://petjs.app.n8n.cloud/webhook/chat'

export default function ReportManagementScreen() {
  // Obtener usuario directamente del store (ya existe porque hay sesión)
  const user = useAppSelector((state) => state.auth.user)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isSendingAudio, setIsSendingAudio] = useState(false)
  const [recordingError, setRecordingError] = useState<string | null>(null)
  const [audioReady, setAudioReady] = useState(false)
  const [transcription, setTranscription] = useState<string | null>(null)
  const [interimTranscript, setInterimTranscript] = useState<string>('')
  const recognitionRef = useRef<any>(null)

  // Datos del usuario (ya existen porque hay sesión activa)
  const userEmail = user?.correo
  const userId = user?.id_usuario
  const userVeterinariaId = user?.id_veterinaria
  const canRecordAudio = Boolean(userEmail && userId != null && userVeterinariaId != null)

  const getExtensionFromContentType = (contentType: string) => {
    if (contentType.includes('pdf')) return 'pdf'
    if (contentType.includes('spreadsheet') || contentType.includes('excel')) return 'xlsx'
    if (contentType.includes('csv')) return 'csv'
    if (contentType.includes('json')) return 'json'
    if (contentType.includes('text/plain')) return 'txt'
    if (contentType.includes('text/')) return 'txt'
    return 'bin'
  }

  const extractFilenameFromContentDisposition = (header: string) => {
    const match = /filename\*?=([^;]+)/i.exec(header)
    if (!match) return null

    let filename = match[1].trim()
    if (filename.startsWith("UTF-8''")) {
      filename = decodeURIComponent(filename.replace("UTF-8''", ''))
    }
    filename = filename.replace(/['"\s]/g, '')
    return filename || null
  }

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const sendTranscriptToWebhook = async (transcriptText: string) => {
    if (!canRecordAudio) {
      throw new Error('No se encontró usuario autenticado con veterinaria asociada.')
    }

    setIsSendingAudio(true)
    setTranscription(null)
    setRecordingError(null)
    setAudioReady(false)

    try {
      const payload = {
        action: 'sendMessage',
        sessionId: `session${userId}49c3832dfefe4505b87442`,
        chatInput: transcriptText,
        email: userEmail || '',
        id_veterinaria: userVeterinariaId,
        webhookUrl: n8nWebhookUrl,
        executionMode: 'production',
      }

      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status} al enviar audio`)
      }

      const contentType = response.headers.get('content-type') ?? ''
      const contentDisposition = response.headers.get('content-disposition') ?? ''

      if (contentType.includes('application/json') || contentType.includes('text/json') || contentType.startsWith('text/')) {
        const text = contentType.includes('application/json')
          ? (() => {
              const json = response.json() as Promise<Record<string, unknown>>
              return json.then((data) =>
                typeof data.transcription === 'string'
                  ? data.transcription
                  : typeof data.text === 'string'
                  ? data.text
                  : typeof data.message === 'string'
                  ? data.message
                  : JSON.stringify(data, null, 2),
              )
            })()
          : response.text()

        const transcriptionText = await text
        setTranscription(transcriptionText)
        const filename = `transcripcion_${Date.now()}.txt`
        downloadFile(new Blob([transcriptionText], { type: 'text/plain' }), filename)
        setAudioReady(true)
        return response
      }

      const buffer = await response.arrayBuffer()
      const blob = new Blob([buffer], { type: contentType || 'application/octet-stream' })
      const filename =
        extractFilenameFromContentDisposition(contentDisposition) ||
        `reporte_n8n_${Date.now()}.${getExtensionFromContentType(contentType)}`

      downloadFile(blob, filename)
      setAudioReady(true)
      return response
    } catch (error) {
      setRecordingError('No se pudo enviar el audio. Intenta nuevamente.')
      throw error
    } finally {
      setIsSendingAudio(false)
    }
  }

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const handleStartRecording = async () => {
    setRecordingError(null)
    setAudioReady(false)

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setRecordingError('Tu navegador no soporta transcripción de voz.')
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.lang = 'es-ES'
      recognition.interimResults = true
      recognition.continuous = true
      recognition.maxAlternatives = 1
      recognitionRef.current = recognition
      let finalTranscript = ''

      recognition.onresult = (event: any) => {
        let interim = ''
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i]
          if (result.isFinal) {
            finalTranscript += result[0].transcript
          } else {
            interim += result[0].transcript
          }
        }
        setInterimTranscript(interim)
        setTranscription(finalTranscript + interim)
      }

      recognition.onerror = () => {
        setRecordingError('Error al transcribir el audio.')
        setIsRecording(false)
      }

      recognition.onend = async () => {
        recognitionRef.current = null
        setIsRecording(false)

        const finalText = finalTranscript.trim()
        if (!finalText) {
          setRecordingError('No se detectó voz para transcribir.')
          return
        }

        await sendTranscriptToWebhook(finalText)
      }

      recognition.start()
      setIsRecording(true)
    } catch (error) {
      setRecordingError('No se pudo iniciar la transcripción de audio.')
    }
  }

  const handleStopRecording = () => {
    if (!recognitionRef.current) {
      setRecordingError('No hay transcripción activa.')
      return
    }

    setIsRecording(false)
    recognitionRef.current.stop()
  }

  const handleToggleRecording = async () => {
    if (isRecording) {
      handleStopRecording()
      return
    }

    await handleStartRecording()
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 bg-gray-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-100 rounded-2xl">
            <LayoutDashboard className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestionar reportes</h1>
            <p className="text-gray-500 mt-1">
              Consulta KPIs, genera reportes estáticos y dinámicos de tu veterinaria.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-white border-gray-200 text-gray-400 cursor-not-allowed">
            <Printer className="w-4 h-4 mr-2" /> Exportar PDF
          </Button>
          <Button variant="outline" className="bg-white border-gray-200 text-gray-400 cursor-not-allowed">
            <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel / CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockKPIs.map((kpi, index) => (
          <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-4 rounded-xl ${kpi.bgColor}`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{kpi.label}</p>
                <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters Section */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Cliente, mascota o código"
                className="pl-10 bg-gray-800 text-white border-none rounded-xl h-12"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Estado</label>
            <Select defaultValue="todos">
              <SelectTrigger className="h-12 bg-gray-800 text-white border-none rounded-xl">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="proceso">En proceso</SelectItem>
                <SelectItem value="finalizado">Finalizado</SelectItem>
                <SelectItem value="fallido">Fallido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Tipo de servicio</label>
            <Select defaultValue="todos">
              <SelectTrigger className="h-12 bg-gray-800 text-white border-none rounded-xl">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="cita">Cita médica</SelectItem>
                <SelectItem value="pedido">Pedido producto</SelectItem>
                <SelectItem value="grooming">Servicio grooming</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Desde</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input type="date" className="pl-10 bg-gray-800 text-white border-none rounded-xl h-12 w-40" defaultValue="2026-05-01" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Hasta</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input type="date" className="pl-10 bg-gray-800 text-white border-none rounded-xl h-12 w-40" defaultValue="2026-05-10" />
            </div>
          </div>
          <div className="flex gap-2 ml-auto">
            <Button className="h-12 px-8 rounded-xl bg-gray-100 text-gray-400 hover:bg-gray-200 border-none shadow-none" disabled>
              <Filter className="w-4 h-4 mr-2" /> Filtrar
            </Button>
            <Button variant="outline" className="h-12 px-8 rounded-xl border-gray-100 text-gray-400 hover:bg-gray-50">
              Limpiar filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Audio Recording */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-2xl">
              <Mic className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Enviar audio para reportes</p>
              <p className="text-xs text-gray-500">
                Graba una nota de voz y envíala directamente al webhook n8n para procesar el reporte.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Button
              onClick={handleToggleRecording}
              disabled={isSendingAudio || !canRecordAudio}
              className={`h-12 rounded-xl ${isRecording ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
            >
              <Mic className="w-4 h-4 mr-2" />
              {isRecording ? 'Detener y enviar audio' : 'Grabar audio'}
            </Button>
            <span className="text-sm text-gray-500">
              {isRecording
                ? 'Transcribiendo... habla ahora.'
                : isSendingAudio
                  ? 'Enviando transcripción...'
                  : audioReady
                    ? 'Transcripción enviada correctamente.'
                    : canRecordAudio
                      ? 'Presiona para transcribir y enviar audio.'
                      : 'Necesitas iniciar sesión para enviar audio.'}
            </span>
          </div>

          {recordingError && (
            <p className="text-sm text-rose-600">{recordingError}</p>
          )}

          {transcription ? (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Transcripción de audio</p>
              <p className="whitespace-pre-line text-sm text-gray-600">{transcription}</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {['Todos', 'Citas', 'Servicios', 'Pedidos'].map((tab) => (
          <Button
            key={tab}
            variant="outline"
            className={`rounded-full px-8 py-2 h-auto font-medium transition-all ${
              tab === 'Todos' && searchTerm === ''
                ? 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700'
                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Resultados del reporte</h2>
          <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-100 px-3 py-1 font-medium">
            Datos de prueba agregados
          </Badge>
        </div>
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="border-none">
              <TableHead className="font-bold text-gray-500 py-4">Código</TableHead>
              <TableHead className="font-bold text-gray-500">Tipo</TableHead>
              <TableHead className="font-bold text-gray-500">Cliente / Mascota</TableHead>
              <TableHead className="font-bold text-gray-500">Estado</TableHead>
              <TableHead className="font-bold text-gray-500">Fecha</TableHead>
              <TableHead className="font-bold text-gray-500">Vía</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockReports.map((report) => (
              <TableRow key={report.id} className="hover:bg-gray-50/50 border-gray-100">
                <TableCell className="font-medium text-gray-900 py-4">{report.id}</TableCell>
                <TableCell className="text-gray-600">{report.tipo}</TableCell>
                <TableCell className="text-gray-900 font-medium">{report.cliente}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={`rounded-full px-3 py-1 font-medium ${
                      report.estado === 'Finalizado' ? 'bg-emerald-100 text-emerald-700' :
                      report.estado === 'En proceso' ? 'bg-orange-100 text-orange-700' :
                      report.estado === 'Pendiente' ? 'bg-purple-100 text-purple-700' :
                      'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {report.estado}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-600">{report.fecha}</TableCell>
                <TableCell>
                  <span className={`font-bold ${report.via === 'SÍ' ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {report.via}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}