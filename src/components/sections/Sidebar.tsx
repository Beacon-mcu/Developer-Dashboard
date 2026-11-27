import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import {
  BookOpen,
  FlaskConical,
  Globe,
  House,
  LayoutGrid,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShieldCheck,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "../Logo";
import { useCurrentApp } from "./useCurrentApp";

// The navigation. It sits straight on the page background (no panel of its own), like the sign-in page.
// On large screens it can retract to an icon rail (`collapsed`, toggled by the button at its top, or Ctrl+B);
// on phones the same content shows in a slide-out drawer (`onClose` is then given, for its close button).
export function Sidebar({
  collapsed = false,
  onToggle,
  onClose,
}: {
  collapsed?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}) {
  const { email } = useAuth();
  const { appSlug, app } = useCurrentApp();

  return (
    <div className="flex h-full flex-col">
      {/* top: the logo and the toggle. In the rail: the mark alone, with the toggle under it. */}
      <div
        className={`flex shrink-0 items-center ${
          collapsed ? "flex-col justify-center gap-2 pb-1 pt-4" : "h-14 justify-between pl-5 pr-3"
        }`}
      >
        <Link to={email ? "/apps" : "/docs"} className="text-ink">
          {collapsed ? <Logo variant="mark" className="h-6" /> : <Logo className="h-6" />}
        </Link>
        {onToggle && (
          <button
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            title={`${collapsed ? "Expand" : "Collapse"} sidebar (Ctrl+B)`}
            className="rounded-lg p-1.5 text-muted transition hover:bg-surface hover:text-ink"
          >
            {collapsed ? <PanelLeftOpen className="size-[18px]" strokeWidth={1.75} /> : <PanelLeftClose className="size-[18px]" strokeWidth={1.75} />}
          </button>
        )}
        {onClose && (
          <button onClick={onClose} aria-label="Close menu" className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-ink">
            <X className="size-5" strokeWidth={1.75} />
          </button>
        )}
      </div>

      <nav className={`flex-1 overflow-y-auto overflow-x-hidden pb-4 ${collapsed ? "px-2.5" : "px-3"}`}>
        {email && (
          <>
            <GroupLabel collapsed={collapsed}>Workspace</GroupLabel>
            <NavItem to="/apps" end icon={LayoutGrid} label="Apps" collapsed={collapsed} />
          </>
        )}

        {email && appSlug && (
          <>
            <GroupLabel collapsed={collapsed}>{app ? app.name : "Current app"}</GroupLabel>
            <div className="space-y-0.5">
              <NavItem to={`/apps/${appSlug}`} end icon={House} label="Overview" collapsed={collapsed} />
              <NavItem to={`/apps/${appSlug}/playground`} icon={FlaskConical} label="Playground" collapsed={collapsed} />
              <NavItem to={`/apps/${appSlug}/users`} icon={UsersRound} label="Users" collapsed={collapsed} />
              <NavItem to={`/apps/${appSlug}/authentication`} icon={ShieldCheck} label="Authentication" collapsed={collapsed} />
              <NavItem to={`/apps/${appSlug}/settings`} icon={Settings} label="Settings" collapsed={collapsed} />
              <NavItem to={`/apps/${appSlug}/domains`} icon={Globe} label="Domains" collapsed={collapsed} />
            </div>
          </>
        )}

        <GroupLabel collapsed={collapsed}>Resources</GroupLabel>
        <NavItem to="/docs" icon={BookOpen} label="Documentation" collapsed={collapsed} />
      </nav>

      {!collapsed && (
        // on a solid chip so it stays readable over the grainy wash behind the sidebar
        <div className="shrink-0 px-3 py-3">
          <p className="whitespace-nowrap rounded-lg border border-line bg-surface px-3 py-2 text-xs font-medium text-ink-soft shadow-sm">
            Powered by Beacon · Built on Stellar
          </p>
        </div>
      )}
    </div>
  );
}

// The active page reads as a small raised card on the background, the same surface as the content panel.
function NavItem({
  to,
  icon: Glyph,
  label,
  end,
  collapsed,
}: {
  to: string;
  icon: LucideIcon;
  label: string;
  end?: boolean;
  collapsed: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        `flex h-9 items-center rounded-lg border text-sm font-medium transition ${
          collapsed ? "justify-center px-0" : "gap-3 px-3"
        } ${
          isActive
            ? "border-line bg-surface text-ink shadow-sm"
            : "border-transparent text-ink-soft hover:bg-surface/60 hover:text-ink"
        }`
      }
    >
      <Glyph className="size-[18px] shrink-0" strokeWidth={1.75} />
      <span className={collapsed ? "sr-only" : "truncate"}>{label}</span>
    </NavLink>
  );
}

// A group heading; in the rail it becomes a thin divider so the groups still read as separate.
function GroupLabel({ children, collapsed }: { children: ReactNode; collapsed: boolean }) {
  if (collapsed) return <div aria-hidden className="mx-2 my-3 h-px bg-line" />;
  return <p className="truncate px-3 pb-1.5 pt-5 text-xs font-medium text-muted">{children}</p>;
}
