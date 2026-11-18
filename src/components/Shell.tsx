import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, Outlet, useLocation, useMatch } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { appsCache } from "../lib/cache";
import { Icon, type IconName } from "./Icon";
import { ProfileMenu } from "./ProfileMenu";

const SECTION_LABELS: Record<string, string> = {
  playground: "Playground",
  users: "Users",
  settings: "Settings",
  domains: "Domains",
};

function NavItem({ to, icon, label, end }: { to: string; icon: IconName; label: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
          isActive ? "bg-brand-soft text-brand-text" : "text-ink-soft hover:bg-subtle hover:text-ink"
        }`
      }
    >
      <Icon name={icon} className="h-[18px] w-[18px]" />
      {label}
    </NavLink>
  );
}

const GroupLabel = ({ children }: { children: ReactNode }) => (
  <p className="px-3 pb-1 pt-4 text-xs font-medium text-muted">{children}</p>
);

// The signed-in frame: a sidebar on the left (a slide-out drawer on phones), a top bar with the
// breadcrumb and the profile menu, and the page filling the rest.
export function Shell() {
  const { email } = useAuth();
  const location = useLocation();
  const [drawer, setDrawer] = useState(false);

  // Which app (if any) is open: the sidebar shows that app's pages.
  const appMatch = useMatch("/apps/:clientId/*");
  const clientId = appMatch?.params.clientId;
  const app = clientId ? appsCache.find(clientId) : null;
  const section = appMatch?.params["*"]?.split("/")[0] ?? "";

  // Close the drawer after navigating.
  useEffect(() => setDrawer(false), [location.pathname]);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center justify-between px-5">
        <Link to={email ? "/apps" : "/docs"} className="text-lg font-semibold tracking-tight text-ink">
          Beacon
        </Link>
        <button
          onClick={() => setDrawer(false)}
          aria-label="Close menu"
          className="rounded-md p-1 text-muted hover:bg-subtle lg:hidden"
        >
          <Icon name="close" className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {email && (
          <>
            <GroupLabel>Workspace</GroupLabel>
            <NavItem to="/apps" end icon="apps" label="Apps" />
          </>
        )}

        {email && clientId && (
          <>
            <GroupLabel>{app ? app.name : "Current app"}</GroupLabel>
            <div className="space-y-0.5">
              <NavItem to={`/apps/${clientId}`} end icon="home" label="Overview" />
              <NavItem to={`/apps/${clientId}/playground`} icon="play" label="Playground" />
              <NavItem to={`/apps/${clientId}/users`} icon="users" label="Users" />
              <NavItem to={`/apps/${clientId}/settings`} icon="settings" label="Settings" />
              <NavItem to={`/apps/${clientId}/domains`} icon="globe" label="Domains" />
            </div>
          </>
        )}

        <GroupLabel>Resources</GroupLabel>
        <NavItem to="/docs" icon="book" label="Documentation" />
      </nav>

      <p className="shrink-0 border-t border-line px-5 py-4 text-xs text-muted">Powered by Beacon · Built on Stellar</p>
    </div>
  );

  return (
    <div className="min-h-dvh bg-canvas">
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-surface lg:block">{sidebar}</aside>

      {/* phone drawer */}
      {drawer && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawer(false)} aria-hidden />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-line bg-surface">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur sm:px-6 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setDrawer(true)}
              aria-label="Open menu"
              className="rounded-md p-1.5 text-ink-soft hover:bg-subtle lg:hidden"
            >
              <Icon name="menu" className="h-5 w-5" />
            </button>
            <span className="text-base font-semibold tracking-tight text-ink lg:hidden">Beacon</span>

            <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-2 text-sm lg:flex">
              {location.pathname.startsWith("/docs") ? (
                <span className="font-medium text-ink">Documentation</span>
              ) : (
                <>
                  <Link to="/apps" className={clientId ? "text-muted hover:text-ink" : "font-medium text-ink"}>
                    Apps
                  </Link>
                  {clientId && (
                    <>
                      <span className="text-muted">/</span>
                      <Link
                        to={`/apps/${clientId}`}
                        className={`truncate ${section ? "text-muted hover:text-ink" : "font-medium text-ink"}`}
                      >
                        {app?.name ?? "App"}
                      </Link>
                    </>
                  )}
                  {section && SECTION_LABELS[section] && (
                    <>
                      <span className="text-muted">/</span>
                      <span className="font-medium text-ink">{SECTION_LABELS[section]}</span>
                    </>
                  )}
                </>
              )}
            </nav>
          </div>

          <ProfileMenu />
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <div className="mx-auto w-full max-w-[1400px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
