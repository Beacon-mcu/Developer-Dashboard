import { useState, type ReactNode } from "react";
import { CopyButton } from "../components/ui";

export function DocPage({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight text-ink">{title}</h1>
      {description && <p className="mt-3 text-base leading-relaxed text-muted">{description}</p>}
      <div className="mt-8 space-y-10">{children}</div>
    </>
  );
}

export function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="space-y-3">
      <h2 className="scroll-mt-24 text-xl font-semibold tracking-tight text-ink">{title}</h2>
      {children}
    </section>
  );
}

export const P = ({ children }: { children: ReactNode }) => <p className="text-sm leading-relaxed text-ink-soft">{children}</p>;

export const C = ({ children }: { children: ReactNode }) => (
  <code className="rounded bg-subtle px-1.5 py-0.5 font-mono text-[0.8rem] text-ink">{children}</code>
);

export const H3 = ({ children }: { children: ReactNode }) => <h3 className="pt-2 text-sm font-semibold text-ink">{children}</h3>;

export function Callout({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "warn" }) {
  const style = tone === "warn" ? "border-warn-line bg-warn-soft text-warn-text" : "border-line bg-subtle text-ink-soft";
  return <div className={`rounded-xl border p-4 text-sm leading-relaxed ${style}`}>{children}</div>;
}

export function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full text-left text-sm">
        <thead className="bg-subtle text-xs text-muted">
          <tr>
            {head.map((h, i) => (
              <th key={i} className="px-3 py-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-line align-top">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 text-ink-soft">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// One file of code: a one-line summary, then its path, a copy button and the whole file.
export function FileCode({ name, code, note }: { name: string; code: string; note?: string }) {
  return (
    <div className="min-w-0 space-y-2">
      {note && <p className="text-sm text-ink-soft">{note}</p>}
      <div className="overflow-hidden rounded-xl border border-code-line bg-code">
        <div className="flex items-center justify-between gap-3 border-b border-code-line py-1.5 pl-4 pr-2">
          <span className="truncate font-mono text-xs text-code-muted">{name}</span>
          <CopyButton text={code} label="Copy" />
        </div>
        <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-code-ink">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

export function Tabs({ tabs }: { tabs: { id: string; label: string; content: ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0].id);
  return (
    <div className="space-y-4">
      <div role="tablist" className="flex gap-1 border-b border-line">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => setActive(tab.id)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition ${
              active === tab.id ? "border-brand text-brand-text" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="space-y-4">{tabs.find((t) => t.id === active)?.content}</div>
    </div>
  );
}

// "npm install ..." with the three usual package managers.
export function Install({ pkg }: { pkg: string }) {
  const commands = { npm: `npm install ${pkg}`, pnpm: `pnpm add ${pkg}`, yarn: `yarn add ${pkg}` };
  return (
    <Tabs
      tabs={(Object.keys(commands) as (keyof typeof commands)[]).map((id) => ({
        id,
        label: id,
        content: <FileCode name="terminal" code={commands[id]} />,
      }))}
    />
  );
}

export function Faq({ q, children }: { q: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-line p-4">
      <p className="text-sm font-semibold text-ink">{q}</p>
      <p className="mt-1 text-sm leading-relaxed text-ink-soft">{children}</p>
    </div>
  );
}
