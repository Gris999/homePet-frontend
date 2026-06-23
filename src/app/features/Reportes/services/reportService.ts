const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://pethome-backend-ujju.onrender.com/api';

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://petcore.app.n8n.cloud/webhook/chat';

export type ReportHistoryParams = {
  url?: string;
  page?: number;
  page_size?: number;
  search?: string;
  estado?: string;
  tipo_reporte?: string;
  tipo?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  formato?: string;
};

export type ReportDetail = Record<string, unknown>;

function getPersistedAccessToken(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem('homePet_auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { accessToken?: string | null };
    return parsed.accessToken ?? null;
  } catch {
    return null;
  }
}

function getHeaders(accessToken?: string | null, contentType = 'application/json') {
  const headers = new Headers();
  if (contentType) {
    headers.set('Content-Type', contentType);
  }
  const token = accessToken ?? getPersistedAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
}

function buildQueryString(params: Record<string, unknown>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

async function parseJsonOrThrow(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(text || 'Error inesperado en la respuesta del servidor');
  }
}

async function handleResponse(response: Response) {
  if (response.ok) {
    return response.json();
  }
  const errorData = await parseJsonOrThrow(response);
  throw new Error(errorData?.detail || errorData?.message || JSON.stringify(errorData));
}

export const reportService = {
  async getReportKpis(accessToken?: string | null) {
    const response = await fetch(`${API_URL}/reportes/kpis/`, {
      method: 'GET',
      headers: getHeaders(accessToken, ''),
    });
    return handleResponse(response);
  },

  async getStaticReports(accessToken?: string | null) {
    const response = await fetch(`${API_URL}/reportes/estaticos/`, {
      method: 'GET',
      headers: getHeaders(accessToken, ''),
    });
    return handleResponse(response);
  },

  async generateStaticReport(payload: Record<string, unknown>, accessToken?: string | null) {
    const response = await fetch(`${API_URL}/reportes/estaticos/generar/`, {
      method: 'POST',
      headers: getHeaders(accessToken),
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  async generateDynamicReport(payload: Record<string, unknown>, accessToken?: string | null) {
    const response = await fetch(`${API_URL}/reportes/dinamicos/generar/`, {
      method: 'POST',
      headers: getHeaders(accessToken),
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  async getReportHistory(params: ReportHistoryParams = {}, accessToken?: string | null) {
    const tokenHeaders = getHeaders(accessToken, '');
    const url = params.url
      ? params.url
      : `${API_URL}/reportes/historial/${buildQueryString(params)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: tokenHeaders,
    });
    return handleResponse(response);
  },

  async getReportDetail(id: string | number, accessToken?: string | null) {
    const response = await fetch(`${API_URL}/reportes/${id}/`, {
      method: 'GET',
      headers: getHeaders(accessToken, ''),
    });
    return handleResponse(response);
  },

  async exportReport(id: string | number, formato: string, accessToken?: string | null) {
    const url = `${API_URL}/reportes/${id}/exportar/?formato=${encodeURIComponent(formato)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(accessToken, ''),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Error exportando reporte ${id}`);
    }
    const blob = await response.blob();
    return {
      blob,
      contentType: response.headers.get('content-type') ?? 'application/octet-stream',
      contentDisposition: response.headers.get('content-disposition') ?? '',
    };
  },

  async generateCustomReportWithWebhook(payload: Record<string, unknown>, webhookUrl?: string) {
    const response = await fetch(webhookUrl || N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    return response;
  },
};
