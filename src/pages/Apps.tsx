import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CreateAppDialog } from "../components/CreateAppDialog";
import { Icon } from "../components/Icon";
import { Button, CopyButton, ErrorNote, PageHeader, Skeleton } from "../components/ui";
import { api, type App } from "../lib/api";
import { appsCache } from "../lib/cache";
import { formatDate } from "../lib/format";

const ROW_GRID = "md:grid md:grid-cols-[minmax(0,1.3fr)_7rem_minmax(0,2fr)_8rem] md:items-center md:gap-4";

export function Apps() {
  // Show the cached list immediately (if there is one), then refresh it from the server.
  const [apps, setApps] = useState<App[] | null>(appsCache.get());
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api
      .listApps()
      .then((list) => {
        appsCache.set(list);
        setApps(list);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Could not load your apps."));
  }, []);

  return (
    <>
      <PageHeader
        title="Apps"
        description="Each app has its own Client ID, domains and users."
        actions={
          <Button onClick={() => setCreating(true)} className="w-full sm:w-auto">
            <Icon name="plus" />
            Create app
          </Button>
        }
      />

      {error && <ErrorNote>{error}</ErrorNote>}

      {!apps && !error && (
        <div className="space-y-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      {apps && apps.length === 0 && (
        <div className="rounded-xl border border-dashed border-line-strong bg-surface p-8 text-center sm:p-12">
          <h2 className="text-lg font-semibold text-ink">Create your first app</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            An app is how your project connects to Beacon. It gives you a Client ID to put in your code, so your users can
            sign in with Google and get a Stellar wallet.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <Button onClick={() => setCreating(true)}>
              <Icon name="plus" />
              Create app
            </Button>
            <Link
              to="/docs"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line-strong px-4 py-2 text-sm font-medium text-ink-soft hover:bg-subtle sm:min-h-10"
            >
              Read the docs
            </Link>
          </div>
        </div>
      )}

      {apps && apps.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-line bg-surface">
          <div className={`hidden border-b border-line bg-subtle px-5 py-2.5 text-xs font-medium text-muted ${ROW_GRID}`}>
            <span>Name</span>
            <span>Network</span>
            <span>Client ID</span>
            <span>Created</span>
          </div>

          <ul className="divide-y divide-line">
            {apps.map((app) => (
              <li key={app.client_id} className={`px-4 py-4 transition hover:bg-subtle/60 sm:px-5 ${ROW_GRID}`}>
                <Link to={`/apps/${appsCache.slug(app)}`} className="block min-w-0 font-medium text-ink hover:text-brand-text">
                  <span className="block truncate">{app.name}</span>
                </Link>

                <span className="mt-1 block text-sm text-muted md:mt-0">
                  {app.network === "mainnet" ? "Mainnet" : "Testnet"}
                  <span className="md:hidden"> · created {formatDate(app.created_at)}</span>
                </span>

                <span className="mt-3 flex min-w-0 items-center gap-2 md:mt-0">
                  <code className="min-w-0 flex-1 truncate rounded-md bg-subtle px-2.5 py-1.5 font-mono text-xs text-ink-soft">
                    {app.client_id}
                  </code>
                  <CopyButton text={app.client_id} label="" />
                </span>

                <span className="hidden text-sm text-muted md:block">{formatDate(app.created_at)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {creating && <CreateAppDialog onClose={() => setCreating(false)} />}
    </>
  );
}
