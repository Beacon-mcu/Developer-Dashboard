import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Logo } from "../components/Logo";
import { ErrorNote, Skeleton } from "../components/ui";
import { api } from "../lib/api";
import { grainMask } from "../lib/grain";
import { loadGoogleScript } from "../lib/google";

// Sign in: a rounded gradient card on the left (logo on top, tagline at the bottom) and the sign-in form centred
// on the right. On a phone only the form shows.
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
        // Google's button must be between 200 and 400px wide: fill the form up to that.
        const width = Math.max(200, Math.min(400, Math.floor(slot.clientWidth)));
        google.accounts.id.renderButton(slot, {
          theme: "outline",
          size: "large",
          shape: "pill",
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
    // Phones and tablets: the card is a banner on top and the form sits under it. Large screens: side by side.
    <div className="flex min-h-dvh flex-col gap-3 bg-canvas p-3 lg:grid lg:grid-cols-2">
      {/* ---- the gradient card ---- */}
      <aside className="relative flex min-h-[20rem] flex-col justify-between overflow-hidden rounded-3xl border border-line bg-surface p-6 sm:min-h-[23rem] sm:p-8 lg:min-h-0 lg:p-10 xl:p-12">
        <Grain />

        {/* the Stellar mark, pushed past the edge so the card cuts it: the top-right corner on phones (clear of the
            tagline), the middle of the right edge on large screens */}
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute -right-12 -top-14 size-44 text-ink sm:-right-16 sm:-top-16 sm:size-56 lg:-right-[22%] lg:top-1/2 lg:size-[26rem] lg:-translate-y-1/2 xl:size-[34rem]"
          fill="currentColor"
          aria-hidden
        >
          <path d={STELLAR} />
        </svg>

        <Link to="/docs" className="relative w-fit text-ink">
          <Logo className="h-7" />
        </Link>

        <div className="relative">
          <h2 className="max-w-[16ch] text-3xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-4xl lg:max-w-md xl:text-5xl">
            Wallets for your users. One line to add.
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-soft sm:mt-4 sm:text-base">
            Give every user a Stellar wallet behind Google sign-in. No extension, no seed phrase.
          </p>
        </div>
      </aside>

      {/* ---- sign in ---- */}
      <main className="flex flex-1 flex-col px-3 pb-3 pt-6 sm:px-10 lg:py-8">
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-6 text-center lg:py-12">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Sign in</h1>
          <p className="mt-2 text-sm text-muted">Create apps, get your Client ID and start building.</p>

          <div className="mt-8 min-h-[44px]">
            {busy ? (
              <p className="py-3 text-sm text-muted">Signing you in…</p>
            ) : (
              <>
                {!ready && !error && <Skeleton className="h-11 w-full rounded-full" />}
                <div ref={slotRef} className="flex w-full justify-center" />
              </>
            )}
          </div>

          {error && (
            <div className="mt-4 text-left">
              <ErrorNote>{error}</ErrorNote>
            </div>
          )}

          <p className="mt-6 text-sm text-muted">
            New to Beacon?{" "}
            <Link to="/docs" className="font-medium text-ink underline underline-offset-2">
              Read the docs
            </Link>
          </p>
        </div>

        <p className="flex items-center justify-center gap-1.5 text-xs text-muted">
          <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden>
            <path d={STELLAR} />
          </svg>
          Built on Stellar ·{" "}
          <Link to="/privacy" className="underline">
            Privacy
          </Link>{" "}
          ·{" "}
          <Link to="/terms" className="underline">
            Terms
          </Link>
        </p>
      </main>
    </div>
  );
}

// The card's one glow: a static, grainy wash of the brand colour on the right, behind the Stellar mark and out
// past the card's edge. Brand colour cut by a speckle mask (SVG noise thresholded to hard dots) and a fading gradient.
const SWEEP = "radial-gradient(ellipse 65% 75% at 90% 50%, black 20%, transparent 70%)";

function Grain() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {/* a faint even tint so the speckles sit on colour, not on bare surface */}
      <div className="absolute inset-0 bg-brand opacity-[0.05]" style={{ maskImage: SWEEP, WebkitMaskImage: SWEEP }} />
      <div className="absolute inset-0 bg-brand opacity-60" style={grainMask(SWEEP)} />
      {/* lighter speckle across the whole card, like paper grain */}
      <div className="absolute inset-0 bg-brand opacity-[0.12]" style={grainMask()} />
    </div>
  );
}

// Stellar's logo mark (from Simple Icons).
const STELLAR =
  "M12.003 1.716c-1.37 0-2.7.27-3.948.78A10.18 10.18 0 0 0 2.66 7.901a10.136 10.136 0 0 0-.797 3.954c0 .258.01.516.027.775a1.942 1.942 0 0 1-1.055 1.88L0 14.934v1.902l2.463-1.26.072-.032v.005l.77-.39.758-.385.066-.039 14.807-7.56 1.666-.847 3.392-1.732V2.694L17.792 5.86 3.744 13.025l-.104.055-.017-.115a8.286 8.286 0 0 1-.071-1.105c0-2.255.88-4.377 2.474-5.977a8.462 8.462 0 0 1 2.71-1.82 8.513 8.513 0 0 1 3.2-.654h.067a8.41 8.41 0 0 1 4.09 1.055l1.628-.83.126-.066a10.11 10.11 0 0 0-5.845-1.853zM24 7.143 5.047 16.808l-1.666.847L0 19.382v1.902l3.282-1.671 2.91-1.485 14.058-7.153.105-.055.016.115c.05.369.072.743.072 1.11 0 2.255-.88 4.383-2.475 5.978a8.461 8.461 0 0 1-2.71 1.82 8.305 8.305 0 0 1-3.2.654h-.06c-1.441 0-2.86-.369-4.102-1.061l-.066.033-1.683.857c.594.418 1.232.776 1.903 1.062a10.11 10.11 0 0 0 3.947.797 10.09 10.09 0 0 0 7.17-2.975 10.136 10.136 0 0 0 2.969-7.18c0-.259-.005-.523-.027-.781a1.942 1.942 0 0 1 1.055-1.88L24 9.044z";
