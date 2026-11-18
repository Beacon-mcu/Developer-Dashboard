import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { ErrorNote, Skeleton } from "../components/ui";
import { api } from "../lib/api";
import { loadGoogleScript } from "../lib/google";

const SAMPLE = `const beacon = new BeaconAuth({
  clientId: "bcn_app_…",
});

const { address } = await beacon.login();
// a Stellar wallet, ready to sign`;

const POINTS = [
  { title: "No seed phrases", body: "Users sign in with Google. Their wallet is created for them." },
  { title: "One wallet everywhere", body: "The same Google account has the same address in every app." },
  { title: "Testnet and mainnet", body: "Build with free test XLM, then switch to mainnet when you launch." },
];

// Sign in: a narrow panel on the left, a short pitch on the right. On a phone only the panel shows.
export function Login() {
  const { email, signIn } = useAuth();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? "/apps";
  const slotRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Beacon's Google client ID comes from the backend, so it lives in one place.
    Promise.all([api.googleClientId(), loadGoogleScript()])
      .then(([clientId]) => {
        const google = window.google;
        const slot = slotRef.current;
        if (cancelled || !google || !slot) return;

        google.accounts.id.initialize({
          client_id: clientId,
          callback: async ({ credential }) => {
            setError(null);
            setBusy(true);
            try {
              await signIn(credential);
              navigate(from, { replace: true });
            } catch (e) {
              setError(e instanceof Error ? e.message : "Sign-in failed. Please try again.");
              setBusy(false);
            }
          },
        });
        // Google's button must be between 200 and 400px wide: fill the panel up to that.
        const width = Math.max(200, Math.min(400, Math.floor(slot.clientWidth)));
        google.accounts.id.renderButton(slot, {
          theme: "outline",
          size: "large",
          shape: "rectangular",
          text: "continue_with",
          width,
        });
        setReady(true);
      })
      .catch((e: unknown) => !cancelled && setError(e instanceof Error ? e.message : "Could not start sign-in."));

    return () => {
      cancelled = true;
    };
  }, [from, navigate, signIn]);

  if (email) return <Navigate to={from} replace />;

  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,26rem)_1fr]">
      {/* ---- sign in ---- */}
      <section className="flex min-h-dvh flex-col justify-between bg-surface px-6 py-8 sm:px-10 lg:border-r lg:border-line">
        <Link to="/docs" className="text-lg font-semibold tracking-wide text-ink">
          Beacon
        </Link>

        <div className="mx-auto w-full max-w-sm py-10">
          <h1 className="text-3xl font-bold leading-tight text-ink">Sign in to Beacon</h1>
          <p className="mt-3 text-muted">Create apps, get your Client ID and start building.</p>

          <div className="mt-8 min-h-[44px]">
            {busy ? (
              <p className="py-3 text-sm text-muted">Signing you in…</p>
            ) : (
              <>
                {!ready && !error && <Skeleton className="h-11 w-full" />}
                <div ref={slotRef} className="flex w-full justify-center" />
              </>
            )}
          </div>

          {error && (
            <div className="mt-4">
              <ErrorNote>{error}</ErrorNote>
            </div>
          )}

          <p className="mt-8 text-sm text-muted">
            New to Beacon?{" "}
            <Link to="/docs" className="font-medium text-ink underline">
              Read the docs
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-muted">
          Powered by Beacon · Built on Stellar ·{" "}
          <Link to="/privacy" className="underline">
            Privacy
          </Link>{" "}
          ·{" "}
          <Link to="/terms" className="underline">
            Terms
          </Link>
        </p>
      </section>

      {/* ---- the pitch: large screens only ---- */}
      <section className="hidden bg-subtle lg:flex lg:flex-col lg:justify-center lg:px-16 xl:px-24">
        <div className="max-w-xl">
          <h2 className="text-4xl font-bold leading-tight text-ink xl:text-5xl">
            Wallets for your users. One line to add.
          </h2>
          <p className="mt-4 text-lg text-ink-soft">
            Give every user a Stellar wallet that works behind Google sign-in. No extension, no seed phrase.
          </p>

          <pre className="mt-8 overflow-x-auto rounded-2xl bg-code p-5 text-sm leading-relaxed text-slate-100">
            <code>{SAMPLE}</code>
          </pre>

          <ul className="mt-8 grid gap-5 xl:grid-cols-3">
            {POINTS.map((p) => (
              <li key={p.title}>
                <p className="text-sm font-semibold text-ink">{p.title}</p>
                <p className="mt-1 text-sm text-muted">{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
