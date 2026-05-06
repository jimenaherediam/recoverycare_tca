/**
 * Cliente API hacia el servidor FastAPI (carpeta `server/`).
 * URL base configurable con VITE_API_URL (por defecto http://localhost:8000).
 */
const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");
const TOKEN_KEY = "rc_jwt";
const USER_KEY = "rc_user";

export type ApiUser = {
  id: number;
  nombre: string;
  email?: string | null;
  dni?: string | null;
  tipo: "PACIENTE" | "PROFESIONAL" | "ADMIN" | "VOLUNTARIO";
  edad?: number | null;
  localidad?: string | null;
  codigo_profesional?: string | null;
  created_at?: string | null;
};

export const auth = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  getUser: (): ApiUser | null => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  set: (token: string, user: ApiUser) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

export class ApiError extends Error {
  status: number;
  body: any;
  constructor(status: number, body: any, message: string) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  opts: { auth?: boolean } = { auth: true }
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.auth !== false) {
    const t = auth.getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  let resp: Response;
  try {
    resp = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw new ApiError(0, null, `No se puede conectar al servidor (${API_URL}). ¿Está arrancado?`);
  }
  const text = await resp.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!resp.ok) {
    const detail = data?.detail || resp.statusText;
    throw new ApiError(resp.status, data, typeof detail === "string" ? detail : JSON.stringify(detail));
  }
  return data as T;
}

export const api = {
  // Auth
  register: (payload: {
    nombre: string; dni: string; password: string;
    edad?: number; localidad?: string; codigo_profesional?: string;
  }) => request<{ access_token: string; user: ApiUser }>("POST", "/auth/register", payload, { auth: false }),

  login: (dni: string, password: string) =>
    request<{ access_token: string; user: ApiUser }>("POST", "/auth/login", { dni, password }, { auth: false }),

  me: () => request<ApiUser>("GET", "/auth/me"),

  // Meals
  recordMeal: (payload: any) => request<any>("POST", "/meals/record", payload),
  listMeals: (date?: string) => request<any[]>("GET", `/meals/${date ? `?date=${date}` : ""}`),

  // Chat (no streaming aquí — ver `streamChat` abajo)
  chatHistory: () => request<any[]>("GET", "/chat/history"),

  // Appointments
  appointments: () => request<any[]>("GET", "/appointments"),

  // History
  dayHistory: (date: string) => request<any>("GET", `/history?date=${date}`),

  // Plans
  plansToday: () => request<any[]>("GET", "/plans/today"),

  // Alerts
  alerts: () => request<any[]>("GET", "/alerts"),
};

/**
 * Streaming SSE para el chatbot. Devuelve un AsyncIterable de chunks de texto.
 */
export async function* streamChat(messages: { role: string; content: string }[]): AsyncGenerator<string> {
  const t = auth.getToken();
  const resp = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
    },
    body: JSON.stringify({ messages }),
  });
  if (!resp.ok || !resp.body) {
    const txt = await resp.text().catch(() => "");
    throw new ApiError(resp.status, txt, `Chat error ${resp.status}: ${txt || resp.statusText}`);
  }
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, nl);
      buffer = buffer.slice(nl + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") return;
      try {
        const parsed = JSON.parse(json);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch {
        // ignore malformed line
      }
    }
  }
}

export { API_URL };
