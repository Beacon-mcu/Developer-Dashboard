import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { ErrorNote, Skeleton } from "../../components/ui";
import { api, ApiError, type App } from "../../lib/api";
import { appsCache } from "../../lib/cache";
import { findBySlug } from "../../lib/slug";

export type AppContext = { app: App; setApp: (app: App) => void };

// What the pages inside an app read: the app, and a way to update it after saving.
export const useApp = () => useOutletContext<AppContext>();

// Loads the open app once and shares it with its pages (Overview, Users, Settings, Domains).
// The address holds the app's name ("/apps/my-app"), not its Client ID.
export function AppLayout() {
  const { appSlug = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  // Show the cached app at once (when we came from the list), then refresh it from the server.
  const [app, setApp] = useState<App | null>(() => appsCache.findBySlug(appSlug));
  const [error, setError] = useState<string | null>(null);

  // After a rename (or when an old link with the Client ID was opened), put the right name in the address.
  const fixAddress = (next: App) => {
    const slug = appsCache.slug(next);
    if (slug !== appSlug) {
      navigate(location.pathname.replace(`/apps/${appSlug}`, `/apps/${slug}`) + location.search, { replace: true });
    }
  };

  const update = (next: App) => {
    appsCache.upsert(next);
    setApp(next);
    fixAddress(next);
  };

  useEffect(() => {
    let cancelled = false;
    setError(null);
    const cached = appsCache.findBySlug(appSlug);
    setApp(cached);

    const load = async () => {
      let target = cached;
      if (!target) {
        // Opened directly (a refresh or a bookmark): the app's Client ID is found from the name in the list.
        const list = await api.listApps();
        appsCache.set(list);
        target = findBySlug(list, appSlug);
        if (!target) throw new ApiError(404, "This app does not exist.");
      }
      const fresh = await api.getApp(target.client_id);
      if (!cancelled) update(fresh);
    };

    load().catch((e: unknown) => {
      if (cancelled) return;
      setError(e instanceof ApiError && e.status === 404 ? "This app does not exist." : "Could not load this app.");
    });
    return () => {
      cancelled = true;
    };
  }, [appSlug]);

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
