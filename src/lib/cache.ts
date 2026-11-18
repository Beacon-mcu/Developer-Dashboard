import type { App } from "./api";

// A tiny in-memory copy of the developer's apps, so moving between pages feels instant:
// pages show what is cached right away, then refresh it from the server.
let apps: App[] | null = null;

export const appsCache = {
  get: (): App[] | null => apps,
  find: (clientId: string): App | null => apps?.find((a) => a.client_id === clientId) ?? null,
  set: (next: App[]) => void (apps = next),
  upsert: (app: App) => {
    if (!apps) return;
    apps = apps.some((a) => a.client_id === app.client_id)
      ? apps.map((a) => (a.client_id === app.client_id ? app : a))
      : [app, ...apps];
  },
  remove: (clientId: string) => void (apps = apps?.filter((a) => a.client_id !== clientId) ?? null),
  clear: () => void (apps = null), // on sign-out: never show one developer's apps to the next
};
