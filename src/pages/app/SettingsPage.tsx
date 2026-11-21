import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, ErrorNote, Field, inputClass, Modal, PageHeader, SuccessNote } from "../../components/ui";
import { api, type App, type Network } from "../../lib/api";
import { appsCache } from "../../lib/cache";
import { useApp } from "./AppLayout";

export function SettingsPage() {
  const { app, setApp } = useApp();
  const navigate = useNavigate();

  return (
    <>
      <PageHeader title="Settings" description="Name and network for this app." />
      <div className="max-w-3xl space-y-6">
        <General app={app} onSaved={setApp} />
        <DeleteApp
          app={app}
          onDeleted={() => {
            appsCache.remove(app.client_id);
            navigate("/apps", { replace: true });
          }}
        />
      </div>
    </>
  );
}

function General({ app, onSaved }: { app: App; onSaved: (app: App) => void }) {
  const [name, setName] = useState(app.name);
  const [network, setNetwork] = useState<Network>(app.network);
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  const dirty = name.trim() !== app.name || network !== app.network;

  const save = async () => {
    setState("saving");
    setError(null);
    try {
      onSaved(await api.updateApp(app.client_id, { name: name.trim(), network }));
      setState("saved");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
      setState("idle");
    }
  };

  return (
    <Card title="General">
      <Field label="App name" hint="Users see this name when they sign in.">
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
      </Field>

      <Field
        label="Default network"
        hint="Testnet has free test XLM. Mainnet uses real money. Your code can also choose with defaultNetwork."
      >
        <div className="flex gap-2">
          {(["testnet", "mainnet"] as const).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setNetwork(n)}
              aria-pressed={network === n}
              className={`min-h-10 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                network === n
                  ? "border-brand bg-brand-soft text-brand-text"
                  : "border-line-strong bg-surface text-ink-soft hover:bg-subtle"
              }`}
            >
              {n === "testnet" ? "Testnet" : "Mainnet"}
            </button>
          ))}
        </div>
      </Field>

      {error && <ErrorNote>{error}</ErrorNote>}
      {state === "saved" && !dirty && <SuccessNote>Saved.</SuccessNote>}
      <Button onClick={save} disabled={!dirty || !name.trim() || state === "saving"}>
        {state === "saving" ? "Saving…" : "Save changes"}
      </Button>
    </Card>
  );
}

function DeleteApp({ app, onDeleted }: { app: App; onDeleted: () => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.deleteApp(app.client_id);
      onDeleted();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete the app.");
      setBusy(false);
    }
  };

  return (
    <Card title="Delete app" tone="danger" subtitle="Your code will stop working with this Client ID. Users' wallets are not deleted.">
      <Button variant="danger" onClick={() => setOpen(true)}>
        Delete app
      </Button>
      {open && (
        <Modal title={`Delete ${app.name}?`} onClose={() => setOpen(false)}>
          <p className="text-sm text-ink-soft">
            This removes the app and its user list. Anything using <code className="font-mono">{app.client_id}</code> will
            stop being able to sign users in. This cannot be undone.
          </p>
          {error && (
            <div className="mt-3">
              <ErrorNote>{error}</ErrorNote>
            </div>
          )}
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={remove} disabled={busy}>
              {busy ? "Deleting…" : "Delete app"}
            </Button>
          </div>
        </Modal>
      )}
    </Card>
  );
}
