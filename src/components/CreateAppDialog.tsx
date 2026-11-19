import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { appsCache } from "../lib/cache";
import { Button, ErrorNote, Field, inputClass, Modal } from "./ui";

// Creating an app asks for a name and nothing else. Websites and the network are optional
// settings on the app's page, and local development works without any setup.
export function CreateAppDialog({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async () => {
    const trimmed = name.trim();
    if (!trimmed) return setError("Give your app a name.");
    setBusy(true);
    setError(null);
    try {
      const app = await api.createApp(trimmed);
      appsCache.upsert(app);
      navigate(`/apps/${appsCache.slug(app)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create the app.");
      setBusy(false);
    }
  };

  return (
    <Modal title="Create app" onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void create();
        }}
      >
        <Field label="App name" hint="Users see this name when they sign in. You can change it later.">
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            placeholder="My dApp"
            autoFocus
          />
        </Field>
        {error && <ErrorNote>{error}</ErrorNote>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy || !name.trim()}>
            {busy ? "Creating…" : "Create app"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
