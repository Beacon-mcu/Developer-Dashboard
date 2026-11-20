import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { api } from "../lib/api";
import { useTheme } from "../lib/theme";
import { Icon } from "./Icon";

// The profile button in the header: a round avatar with the person's initial. Clicking it opens a menu
// with the account, the theme switch and Sign out.
export function ProfileMenu() {
  const { email, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [plan, setPlan] = useState<string | null>(null); // the developer's plan name, read when the menu opens

  useEffect(() => {
    if (!open || !email) return;
    let cancelled = false;
    api
      .billing()
      .then((b) => {
        if (cancelled) return;
        const name = b.plans.find((p) => p.id === b.plan)?.name ?? b.plan;
        setPlan(b.status === "past_due" ? `${name} (payment failed)` : name);
      })
      .catch(() => undefined); // the menu works without it
    return () => {
      cancelled = true;
    };
  }, [open, email]);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on a click elsewhere or Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!email) {
    return (
      <Link to="/login" className="text-sm font-medium text-brand-text hover:underline">
        Sign in
      </Link>
    );
  }

  const initial = email.trim().charAt(0).toUpperCase() || "?";
  const item =
    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-ink-soft hover:bg-subtle hover:text-ink";

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand-text ring-1 ring-line transition hover:ring-line-strong"
      >
        {initial}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-line bg-surface p-1.5 shadow-lg shadow-black/5"
        >
          <div className="px-3 py-2">
            <p className="text-xs text-muted">Signed in as</p>
            <p className="truncate text-sm font-medium text-ink">{email}</p>
          </div>
          <div className="my-1 border-t border-line" />

          <Link role="menuitem" to="/pricing" className={`${item} justify-between`} onClick={() => setOpen(false)}>
            <span className="flex items-center gap-3">
              <Icon name="check" />
              Plan
            </span>
            <span className="text-xs font-medium text-brand-text">{plan ?? "…"}</span>
          </Link>
          <button role="menuitem" className={item} onClick={toggle}>
            <Icon name={theme === "dark" ? "sun" : "moon"} />
            {theme === "dark" ? "Light theme" : "Dark theme"}
          </button>
          <Link role="menuitem" to="/docs" className={item} onClick={() => setOpen(false)}>
            <Icon name="book" />
            Documentation
          </Link>

          <div className="my-1 border-t border-line" />
          <button
            role="menuitem"
            className={`${item} hover:text-danger-text`}
            onClick={() => {
              setOpen(false);
              signOut();
            }}
          >
            <Icon name="logout" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
