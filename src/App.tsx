import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { RequireAuth } from "./components/RequireAuth";
import { Shell } from "./components/Shell";
import { ThemeProvider } from "./lib/theme";
import { Apps } from "./pages/Apps";
import { Docs } from "./pages/Docs";
import { Login } from "./pages/Login";
import { Pricing } from "./pages/Pricing";
import { Privacy } from "./pages/Privacy";
import { Terms } from "./pages/Terms";
import { AppLayout } from "./pages/app/AppLayout";
import { DomainsPage } from "./pages/app/DomainsPage";
import { Overview } from "./pages/app/Overview";
import { SettingsPage } from "./pages/app/SettingsPage";
import { UsersPage } from "./pages/app/UsersPage";
import { Skeleton } from "./components/ui";

const Playground = lazy(() => import("./pages/app/Playground"));

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<Shell />}>
              <Route path="/" element={<Navigate to="/apps" replace />} />
              <Route path="/docs" element={<Docs />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/billing" element={<Navigate to="/pricing" replace />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route
                path="/apps"
                element={
                  <RequireAuth>
                    <Apps />
                  </RequireAuth>
                }
              />
              <Route
                path="/apps/:appSlug"
                element={
                  <RequireAuth>
                    <AppLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<Overview />} />
                <Route
                  path="playground"
                  element={
                    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                      <Playground />
                    </Suspense>
                  }
                />
                <Route path="users" element={<UsersPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="domains" element={<DomainsPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/apps" replace />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
