import { useState } from "react";
import { OriginsEditor } from "../../components/OriginsEditor";
import { Button, Card, ErrorNote, PageHeader, SuccessNote } from "../../components/ui";
import { api } from "../../lib/api";
import { useApp } from "./AppLayout";

export function DomainsPage() {
  const { app, setApp } = useApp();
  const [origins, setOrigins] = useState<string[]>(app.allowed_origins);
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  const dirty = origins.join("\n") !== app.allowed_origins.join("\n");

  const save = async () => {
    setState("saving");
    setError(null);
    try {
      setApp(await api.updateApp(app.client_id, { allowed_origins: origins }));
      setState("saved");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
      setState("idle");
    }
  };

  return (
    <>
      <PageHeader
        title="Domains"
        description="The websites allowed to open the Beacon wallet for this app."
      />
      <div className="max-w-3xl">
        <Card
          title="Your sites"
          subtitle={
            <>
              Add your live site's address before you launch, for example <code className="font-mono">https://myapp.com</code>.
              Local development (<code className="font-mono">localhost</code>) works automatically on testnet, with nothing to add. To use mainnet from your own machine, add that exact address (for example http://localhost:3000).
            </>
          }
        >
          <OriginsEditor
            value={origins}
            onChange={(next) => {
              setOrigins(next);
              setState("idle");
            }}
          />
          {error && <ErrorNote>{error}</ErrorNote>}
          {state === "saved" && !dirty && <SuccessNote>Saved.</SuccessNote>}
          <Button onClick={save} disabled={!dirty || state === "saving"}>
            {state === "saving" ? "Saving…" : "Save domains"}
          </Button>
        </Card>
      </div>
    </>
  );
}
