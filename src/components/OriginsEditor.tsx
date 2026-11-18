import { useState } from "react";
import { checkOrigin, MAX_ORIGINS } from "../lib/origins";
import { Button, inputClass } from "./ui";

// The list of live site addresses allowed to open the wallet. Local development needs no entry.
export function OriginsEditor({ value, onChange }: { value: string[]; onChange: (next: string[]) => void }) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const add = () => {
    const result = checkOrigin(draft);
    if ("error" in result) return setError(result.error);
    if (value.includes(result.origin)) return setError("That address is already in the list.");
    if (value.length >= MAX_ORIGINS) return setError(`You can add up to ${MAX_ORIGINS} addresses.`);
    onChange([...value, result.origin]);
    setDraft("");
    setError(null);
  };

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <ul className="space-y-2">
          {value.map((origin) => (
            <li key={origin} className="flex items-center justify-between gap-3 rounded-xl bg-subtle px-3 py-2">
              <span className="min-w-0 truncate font-mono text-sm">{origin}</span>
              <button
                type="button"
                onClick={() => onChange(value.filter((o) => o !== origin))}
                className="shrink-0 text-sm text-muted hover:text-danger-text"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          className={inputClass}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="https://myapp.com"
          spellCheck={false}
        />
        <Button type="button" variant="ghost" onClick={add} className="shrink-0">
          Add
        </Button>
      </div>
      {error && <p className="text-sm text-danger-text">{error}</p>}
    </div>
  );
}
