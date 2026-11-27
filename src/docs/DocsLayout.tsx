import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Icon } from "../components/Icon";
import { useTheme } from "../lib/theme";
import { GROUPS, PAGES, pathOf } from "./registry";

type Heading = { id: string; title: string };

export default function DocsLayout() {
  const { pathname } = useLocation();
  const { email } = useAuth();
  const { theme, toggle } = useTheme();
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [headings, setHeadings] = useState<Heading[]>([]);
  const article = useRef<HTMLElement>(null);

  useEffect(() => {
    setMenu(false);
    if (!window.location.hash) window.scrollTo({ top: 0 });
    const found = Array.from(article.current?.querySelectorAll<HTMLElement>("section[id]") ?? []).map((s) => ({
      id: s.id,
      title: s.querySelector("h2")?.textContent ?? "",
    }));
    setHeadings(found.filter((h) => h.title));
  }, [pathname]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GROUPS;
    return GROUPS.map((g) => ({ ...g, pages: g.pages.filter((p) => p.title.toLowerCase().includes(q)) })).filter((g) => g.pages.length);
  }, [query]);

  const index = PAGES.findIndex((p) => pathOf(p) === pathname.replace(/\/$/, ""));
  const previous = index > 0 ? PAGES[index - 1] : null;
  const next = index >= 0 && index < PAGES.length - 1 ? PAGES[index + 1] : null;

  const sidebar = (
    <nav aria-label="Documentation" className="space-y-6 pb-10">
      <label className="relative block">
        <span className="sr-only">Search the docs</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          className="w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition placeholder:text-muted focus:border-brand"
        />
      </label>
      {groups.map((group) => (
        <div key={group.title}>
          <p className="px-3 pb-1 text-xs font-semibold text-ink">{group.title}</p>
          <ul className="space-y-0.5">
            {group.pages.map((page) => (
              <li key={page.slug}>
                <NavLink
                  to={pathOf(page)}
                  end
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-1.5 text-sm transition ${
                      isActive ? "bg-brand-soft font-medium text-brand-text" : "text-ink-soft hover:bg-subtle hover:text-ink"
                    }`
                  }
                >
                  {page.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {groups.length === 0 && <p className="px-3 text-sm text-muted">Nothing found.</p>}
    </nav>
  );

  return (
    <div className="min-h-dvh bg-surface text-ink">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur sm:px-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setMenu(true)} aria-label="Open menu" className="rounded-md p-1.5 text-ink-soft hover:bg-subtle lg:hidden">
            <Icon name="menu" className="h-5 w-5" />
          </button>
          <Link to="/docs" className="text-lg font-semibold tracking-tight text-ink">
            Beacon
          </Link>
          <span className="rounded-full bg-subtle px-2 py-0.5 text-xs font-medium text-muted">Docs</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/pricing" className="hidden rounded-lg px-3 py-1.5 text-sm text-ink-soft hover:bg-subtle sm:block">
            Pricing
          </Link>
          <a
            href="https://docs.google.com/presentation/d/1OkhfNy8Rs-Y4naJq-8VGG4yi9fRtYj5ZdfsaBdqZrJo/present"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-lg px-3 py-1.5 text-sm text-ink-soft hover:bg-subtle sm:block"
          >
            Slides
          </a>
          <a
            href="https://tally.so/r/aOdByE"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg px-3 py-1.5 text-sm text-ink-soft hover:bg-subtle"
          >
            Feedback
          </a>
          <button onClick={toggle} aria-label="Switch theme" className="rounded-md p-2 text-ink-soft hover:bg-subtle">
            <Icon name={theme === "dark" ? "sun" : "moon"} className="h-[18px] w-[18px]" />
          </button>
          <Link to={email ? "/apps" : "/login"} className="rounded-lg bg-brand px-3.5 py-1.5 text-sm font-medium text-brand-ink hover:bg-brand-hover">
            {email ? "Dashboard" : "Sign in"}
          </Link>
        </div>
      </header>

      {menu && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenu(false)} aria-hidden />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto border-r border-line bg-surface p-4">{sidebar}</aside>
        </div>
      )}

      <div className="mx-auto flex max-w-[90rem] gap-10 px-4 sm:px-6">
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-60 shrink-0 overflow-y-auto py-8 pr-2 lg:block">{sidebar}</aside>

        <main className="min-w-0 flex-1 py-10">
          <article ref={article} className="mx-auto max-w-3xl">
            <Outlet />

            {(previous || next) && (
              <div className="mt-14 grid grid-cols-2 gap-4 border-t border-line pt-6">
                {previous ? (
                  <Link to={pathOf(previous)} className="rounded-xl border border-line p-4 transition hover:border-line-strong">
                    <span className="text-xs text-muted">Previous</span>
                    <span className="mt-0.5 block text-sm font-medium text-ink">{previous.title}</span>
                  </Link>
                ) : (
                  <span />
                )}
                {next && (
                  <Link to={pathOf(next)} className="rounded-xl border border-line p-4 text-right transition hover:border-line-strong">
                    <span className="text-xs text-muted">Next</span>
                    <span className="mt-0.5 block text-sm font-medium text-ink">{next.title}</span>
                  </Link>
                )}
              </div>
            )}
          </article>
        </main>

        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-52 shrink-0 overflow-y-auto py-10 xl:block">
          {headings.length > 1 && (
            <nav aria-label="On this page" className="space-y-1 text-sm">
              <p className="pb-2 text-xs font-semibold text-ink">On this page</p>
              {headings.map((h) => (
                <a key={h.id} href={`#${h.id}`} className="block rounded-lg px-3 py-1.5 text-ink-soft hover:bg-subtle hover:text-ink">
                  {h.title}
                </a>
              ))}
            </nav>
          )}
        </aside>
      </div>
    </div>
  );
}
