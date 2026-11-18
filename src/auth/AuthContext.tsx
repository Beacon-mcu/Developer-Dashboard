import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, setToken, setUnauthorizedHandler } from "../lib/api";
import { appsCache } from "../lib/cache";

// The developer's session is kept in this tab's sessionStorage: this is a first-party site (not an iframe),
// and it is gone when the tab closes. The session itself lasts 1 hour; after that the server says 401 and
// the developer is sent back to sign in.
const STORE_KEY = "beacon:dev-session";

type Saved = { session: string; email: string };

function readSaved(): Saved | null {
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

function writeSaved(value: Saved | null) {
  try {
    if (value) sessionStorage.setItem(STORE_KEY, JSON.stringify(value));
    else sessionStorage.removeItem(STORE_KEY);
  } catch {
    // storage blocked: the developer just signs in again after a refresh
  }
}

type AuthValue = {
  email: string | null;
  signIn: (googleIdToken: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<Saved | null>(() => {
    const initial = readSaved();
    setToken(initial?.session ?? null); // set before the first request is made
    return initial;
  });

  const signOut = useCallback(() => {
    appsCache.clear();
    setToken(null);
    writeSaved(null);
    setSaved(null);
  }, []);

  const signIn = useCallback(async (googleIdToken: string) => {
    const { session, email } = await api.login(googleIdToken);
    setToken(session);
    const next = { session, email };
    writeSaved(next);
    setSaved(next);
  }, []);

  // An expired session: sign out, which sends the developer back to the sign-in page.
  useEffect(() => setUnauthorizedHandler(signOut), [signOut]);

  const value = useMemo(() => ({ email: saved?.email ?? null, signIn, signOut }), [saved, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
