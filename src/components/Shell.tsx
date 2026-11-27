import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { grainMask } from "../lib/grain";
import { Header } from "./sections/Header";
import { Sidebar } from "./sections/Sidebar";

const COLLAPSED_KEY = "beacon.sidebar.collapsed";

// The bottom-left wash behind the sidebar, the same grain as the sign-in card's glow.
const SWEEP = "radial-gradient(ellipse 60% 45% at 0% 100%, black 15%, transparent 70%)";

// The signed-in frame, styled like the sign-in page: the sidebar sits on the grainy page background, the content
// is an inset rounded panel beside it. The sidebar retracts to an icon rail on large screens and becomes a
// slide-out drawer on phones. The pieces live in ./sections.
export function Shell() {
  const location = useLocation();
  const [drawer, setDrawer] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSED_KEY) === "1");

  const toggleSidebar = () =>
    setCollapsed((c) => {
      localStorage.setItem(COLLAPSED_KEY, c ? "0" : "1");
      return !c;
    });

  // Close the drawer after navigating.
  useEffect(() => setDrawer(false), [location.pathname]);

  // Ctrl+B / Cmd+B toggles the sidebar, as in most editors.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-dvh bg-canvas">
      {/* the page background: light paper grain everywhere, a denser brand wash low behind the sidebar */}
      <div aria-hidden className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-brand opacity-[0.08]" style={grainMask()} />
        <div className="absolute inset-0 bg-brand opacity-40" style={grainMask(SWEEP)} />
      </div>

      {/* large screens: the sidebar, full width or an icon rail, straight on the background */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden transition-[width] duration-200 lg:block ${collapsed ? "w-16" : "w-60"}`}
      >
        <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />
      </aside>

      {/* phones: slide-out drawer */}
      {drawer && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawer(false)} aria-hidden />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-line bg-canvas">
            <Sidebar onClose={() => setDrawer(false)} />
          </aside>
        </div>
      )}

      {/* large screens: a strip of background above the panel, so content scrolling under the sticky header
          never shows in the gap */}
      <div
        aria-hidden
        className={`fixed right-0 top-0 z-20 hidden h-3 bg-canvas transition-[left] duration-200 lg:block ${
          collapsed ? "left-16" : "left-60"
        }`}
      >
        <div className="absolute inset-0 bg-brand opacity-[0.08]" style={grainMask()} />
      </div>

      <div className={`relative transition-[padding] duration-200 lg:py-3 lg:pr-3 ${collapsed ? "lg:pl-16" : "lg:pl-60"}`}>
        {/* the content panel */}
        <div className="min-h-dvh bg-surface lg:min-h-[calc(100dvh-1.5rem)] lg:rounded-2xl lg:border lg:border-line lg:shadow-sm">
          <Header onOpenDrawer={() => setDrawer(true)} />

          <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-[1400px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
