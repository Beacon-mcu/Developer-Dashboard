import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { loadGoogleScript } from "../lib/google";
import { ErrorNote, Modal } from "./ui";

// "Confirm it is you": a fresh Google sign-in, asked before something that could let another site act for an app's users
// (changing its Domains). A stolen dashboard session alone is not enough, because the Google sign-in happens in Google's window.
export function ReauthModal({ onCredential, onClose }: { onCredential: (credential: string) => void; onClose: () => void }) {
  const slotRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.googleClientId(), loadGoogleScript()])
      .then(([clientId]) => {
        const google = window.google;
        const slot = slotRef.current;
        if (cancelled || !google || !slot) return;
        google.accounts.id.initialize({ client_id: clientId, callback: ({ credential }) => onCredential(credential) });
        google.accounts.id.renderButton(slot, { theme: "outline", size: "large", shape: "rectangular", text: "continue_with", width: 280 });
      })
      .catch((e: unknown) => !cancelled && setError(e instanceof Error ? e.message : "Could not start Google sign-in."));
    return () => {
      cancelled = true;
    };
  }, [onCredential]);

  return (
    <Modal title="Confirm it is you" onClose={onClose}>
      <p className="mt-3 text-sm text-muted">
        Changing your domains decides which websites can open the wallet for your app, so Google asks you to sign in again first.
      </p>
      <div ref={slotRef} className="mt-4 flex min-h-11 justify-center" />
      {error && <ErrorNote>{error}</ErrorNote>}
    </Modal>
  );
}
