const API_URL = import.meta.env.VITE_API_URL;

export type Network = "testnet" | "mainnet";

export type App = {
  client_id: string;
  name: string;
  allowed_origins: string[];
  auth_methods: string[];
  network: Network;
  created_at: number;
};

export type AppUser = {
  address: string;
  email: string | null;
  first_seen: number;
  last_seen: number;
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

// The signed-in developer's session, sent as a Bearer token. It lasts 1 hour.
let token: string | null = null;
export const setToken = (value: string | null) => void (token = value);

// Called when the server says the session is gone (401): the app signs the developer out.
let onUnauthorized: () => void = () => {};
export const setUnauthorizedHandler = (handler: () => void) => void (onUnauthorized = handler);

async function request<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(API_URL + path, {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Cannot reach the Beacon server. Check your connection.");
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { error?: unknown };
      if (typeof body.error === "string") message = body.error;
    } catch {
      // keep the default message
    }
    if (res.status === 401 && token) onUnauthorized(); // an expired session, not a failed sign-in
    throw new ApiError(res.status, message);
  }

  return (res.status === 204 ? undefined : await res.json()) as T;
}

export const api = {
  googleClientId: () => request<{ googleClientId: string }>("/auth/config").then((c) => c.googleClientId),

  login: (idToken: string) =>
    request<{ session: string; developerId: string; email: string }>("/dev/login", {
      method: "POST",
      body: { idToken },
    }),

  listApps: () => request<{ apps: App[] }>("/dev/apps").then((r) => r.apps),

  createApp: (name: string) =>
    request<{ app: App }>("/dev/apps", { method: "POST", body: { name } }).then((r) => r.app),

  getApp: (clientId: string) => request<{ app: App }>(`/dev/apps/${encodeURIComponent(clientId)}`).then((r) => r.app),

  updateApp: (
    clientId: string,
    changes: Partial<Pick<App, "name" | "allowed_origins" | "network" | "auth_methods">>,
  ) =>
    request<{ app: App }>(`/dev/apps/${encodeURIComponent(clientId)}`, { method: "PATCH", body: changes }).then(
      (r) => r.app,
    ),

  deleteApp: (clientId: string) =>
    request<void>(`/dev/apps/${encodeURIComponent(clientId)}`, { method: "DELETE" }),

  listUsers: (clientId: string, limit: number, offset: number) =>
    request<{ total: number; users: AppUser[] }>(
      `/dev/apps/${encodeURIComponent(clientId)}/users?limit=${limit}&offset=${offset}`,
    ),
};
