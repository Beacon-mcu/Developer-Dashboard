import { Link, NavLink, useLocation } from "react-router-dom";
import { Icon } from "../Icon";
import { Logo } from "../Logo";
import { ProfileMenu } from "../ProfileMenu";
import { useCurrentApp } from "./useCurrentApp";

const SECTION_LABELS: Record<string, string> = {
  playground: "Playground",
  users: "Users",
  authentication: "Authentication",
  settings: "Settings",
  domains: "Domains",
};

// The top bar of the content panel: the breadcrumb, the links and the profile menu. On phones it also has the
// button that opens the sidebar drawer (on large screens the sidebar's own button retracts it).
export function Header({ onOpenDrawer }: { onOpenDrawer: () => void }) {
  const location = useLocation();
  const { appSlug, app, section } = useCurrentApp();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-line bg-surface/85 px-4 backdrop-blur sm:px-6 lg:top-3 lg:rounded-t-2xl lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        {/* phones: open the drawer */}
        <button onClick={onOpenDrawer} aria-label="Open menu" className="rounded-md p-1.5 text-ink-soft hover:bg-subtle lg:hidden">
          <Icon name="menu" className="h-5 w-5" />
        </button>
        <Logo className="h-5 text-ink lg:hidden" />

        <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-2 text-sm lg:flex">
          {location.pathname.startsWith("/docs") ? (
            <span className="font-medium text-ink">Documentation</span>
          ) : location.pathname.startsWith("/pricing") ? (
            <span className="font-medium text-ink">Pricing</span>
          ) : (
            <>
              <Link to="/apps" className={appSlug ? "text-muted hover:text-ink" : "font-medium text-ink"}>
                Apps
              </Link>
              {appSlug && (
                <>
                  <span className="text-muted">/</span>
                  <Link
                    to={`/apps/${appSlug}`}
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

      <div className="flex shrink-0 items-center gap-1 sm:gap-3">
        <NavLink
          to="/pricing"
          className={({ isActive }) =>
            `rounded-md px-2.5 py-1.5 text-sm font-medium transition ${isActive ? "text-ink" : "text-muted hover:text-ink"}`
          }
        >
          Pricing
        </NavLink>
        <a
          href="https://docs.google.com/presentation/d/1OkhfNy8Rs-Y4naJq-8VGG4yi9fRtYj5ZdfsaBdqZrJo/present"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden rounded-md px-2.5 py-1.5 text-sm font-medium text-muted transition hover:text-ink sm:block"
        >
          Slides
        </a>
        <a
          href="https://tally.so/r/aOdByE"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md px-2.5 py-1.5 text-sm font-medium text-muted transition hover:text-ink"
        >
          Feedback
        </a>
        <ProfileMenu />
      </div>
    </header>
  );
}
