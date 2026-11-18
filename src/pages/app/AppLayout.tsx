import { useEffect, useState } from "react";
import { Link, Outlet, useOutletContext, useParams } from "react-router-dom";
import { ErrorNote, Skeleton } from "../../components/ui";
import { api, ApiError, type App } from "../../lib/api";
import { appsCache } from "../../lib/cache";

export type AppContext = { app: App; setApp: (app: App) => void };

// What the pages inside an app read: the app, and a way to update it after saving.
export const useApp = () => useOutletContext<AppContext>();

// Loads the open app once and shares it with its pages (Overview, Users, Settings, Domains).
export function AppLayout() {
  const { clientId = "" } = useParams();
  // Show the cached app at once (when we came from the list), then refresh it from the server.
  const [app, setApp] = useState<App | null>(() => appsCache.find(clientId));
  const [error, setError] = useState<string | null>(null);

  const update = (next: App) => {
    appsCache.upsert(next);
    setApp(next);
  };

  useEffect(() => {
    setError(null);
    setApp(appsCache.find(clientId));
    api
      .getApp(clientId)
      .then(update)
      .catch((e: unknown) =>
        setError(e instanceof ApiError && e.status === 404 ? "This app does not exist." : "Could not load this app."),
      );
  }, [clientId]);

  if (error) {
    return (
      <div className="max-w-xl space-y-4">
        <ErrorNote>{error}</ErrorNote>
        <Link to="/apps" className="text-sm font-medium text-brand-text hover:underline">
          Back to your apps
        </Link>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="space-y-5" aria-busy="true">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return <Outlet context={{ app, setApp: update } satisfies AppContext} />;
}
