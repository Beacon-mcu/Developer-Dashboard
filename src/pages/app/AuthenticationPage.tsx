import { useState } from "react";
import { Icon, type IconName } from "../../components/Icon";
import { ErrorNote, PageHeader } from "../../components/ui";
import { api } from "../../lib/api";
import { useApp } from "./AppLayout";

// The ways people can sign in to this app. Google is always on (an app needs at least one way to sign in).
// External wallets (Freighter, xBull, LOBSTR, ...) can be switched on: the SDK then shows them next to Google.

function GoogleG() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.5 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.8V6.5H1.4a12 12 0 0 0 0 11z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.5l4 3.1C6.3 6.9 8.9 4.8 12 4.8z" />
    </svg>
  );
}

function Switch({ on, locked, busy, label, onChange }: { on: boolean; locked?: boolean; busy?: boolean; label: string; onChange?: (next: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={locked || busy}
      onClick={() => onChange?.(!on)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? "bg-brand" : "bg-line-strong"} ${
        locked ? "cursor-not-allowed opacity-60" : busy ? "opacity-60" : "cursor-pointer"
      }`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

function Row({ icon, title, hint, children }: { icon: React.ReactNode; title: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3.5">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center text-ink-soft">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="text-xs text-muted">{hint}</p>
      </div>
      {children}
    </div>
  );
}

const walletIcon: IconName = "wallet";

export function AuthenticationPage() {
  const { app, setApp } = useApp();
  const walletsOn = app.auth_methods.includes("wallets");
  const passkeyOn = app.auth_methods.includes("passkey");
  const emailOn = app.auth_methods.includes("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setMethod = async (method: "wallets" | "passkey" | "email", on: boolean) => {
    setBusy(true);
    setError(null);
    try {
      const methods = new Set(app.auth_methods);
      methods.add("google");
      if (on) methods.add(method);
      else methods.delete(method);
      setApp(await api.updateApp(app.client_id, { auth_methods: [...methods] }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Authentication" description="How people sign in to this app." />
      <div className="max-w-3xl space-y-3">
        <Row icon={<GoogleG />} title="Google" hint="Always on. An app needs at least one way to sign in.">
          <Switch on locked label="Google sign-in" />
        </Row>

        <Row
          icon={<Icon name={walletIcon} className="h-5 w-5" />}
          title="External wallets"
          hint="Let people connect Freighter, xBull, LOBSTR, Hana, Albedo or Rabet. Shown next to Google when they sign in."
        >
          <Switch on={walletsOn} busy={busy} label="External wallets" onChange={(next) => void setMethod("wallets", next)} />
        </Row>

        <Row
          icon={<Icon name="mail" className="h-5 w-5" />}
          title="Email"
          hint="Let people sign in with a 6-digit code sent to their email. Shown at the top of the sign-in window."
        >
          <Switch on={emailOn} busy={busy} label="Email" onChange={(next) => void setMethod("email", next)} />
        </Row>

        <Row
          icon={<Icon name="passkey" className="h-5 w-5" />}
          title="Passkeys"
          hint="Let people sign in with their fingerprint, face or screen lock. Shown next to Google when they sign in."
        >
          <Switch on={passkeyOn} busy={busy} label="Passkeys" onChange={(next) => void setMethod("passkey", next)} />
        </Row>

        {error && <ErrorNote>{error}</ErrorNote>}

        {emailOn && (
          <p className="px-1 text-xs leading-relaxed text-muted">
            People who sign in with email get a Beacon wallet, the same as with Google, and appear in your Users list and monthly
            active users with their email address. Each email has its own wallet.
          </p>
        )}

        {passkeyOn && (
          <p className="px-1 text-xs leading-relaxed text-muted">
            People who use a passkey get a Beacon wallet, the same as with Google, and appear in your Users list and monthly active
            users. They have no email. A passkey is kept by their device or password manager.
          </p>
        )}

        {walletsOn && (
          <p className="px-1 text-xs leading-relaxed text-muted">
            People who connect an external wallet keep their own keys. <code className="font-mono">sendPayment</code> and{" "}
            <code className="font-mono">signTransaction</code> still work: their wallet asks them to approve each one. They are not
            added to your Users list or your monthly active users.
          </p>
        )}
      </div>
    </>
  );
}
