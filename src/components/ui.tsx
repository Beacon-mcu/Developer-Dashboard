import { useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Icon } from "./Icon";

// ---- layout pieces ----

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="break-words text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}

export function Card({
  title,
  subtitle,
  children,
  tone = "default",
}: {
  title?: string;
  subtitle?: ReactNode;
  children: ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <section
      className={`rounded-xl border bg-surface p-4 sm:p-6 ${tone === "danger" ? "border-danger-line" : "border-line"}`}
    >
      {title && <h2 className="text-base font-semibold text-ink">{title}</h2>}
      {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      <div className={title ? "mt-4 space-y-4" : "space-y-4"}>{children}</div>
    </section>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4 sm:p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

// ---- controls ----

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" };

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const styles = {
    primary: "bg-brand text-brand-ink hover:bg-brand-hover",
    ghost: "border border-line-strong bg-surface text-ink-soft hover:bg-subtle",
    danger: "bg-danger text-white hover:bg-danger-hover",
  }[variant];
  return (
    <button
      {...props}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-10 ${styles} ${className}`}
    />
  );
}

export const inputClass =
  "min-h-11 w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-base text-ink outline-none placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:bg-subtle sm:min-h-10 sm:text-sm";

export function Field({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted">{hint}</span>}
    </label>
  );
}

// ---- feedback ----

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-lg border border-danger-line bg-danger-soft p-3 text-sm text-danger-text">
      {children}
    </p>
  );
}

export function SuccessNote({ children }: { children: ReactNode }) {
  return <p className="rounded-lg border border-success-line bg-success-soft p-3 text-sm text-success-text">{children}</p>;
}

export function WarnNote({ children }: { children: ReactNode }) {
  return <p className="rounded-lg border border-warn-line bg-warn-soft p-3 text-sm text-warn-text">{children}</p>;
}

// A grey placeholder shown while content loads, so the page keeps its shape.
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-subtle ${className}`} />;
}

export function Spinner() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="h-6 w-6 animate-spin rounded-full border-[3px] border-line border-t-brand"
    />
  );
}

// ---- code ----

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="ghost"
      className="min-h-9 shrink-0 px-3 py-1.5 text-xs sm:min-h-8"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // clipboard blocked: the text is still selectable
        }
      }}
    >
      <Icon name="copy" className="h-3.5 w-3.5" />
      {copied ? "Copied" : label}
    </Button>
  );
}

// A code sample with a copy button. Always dark, in both themes.
export function CodeBlock({ code, language }: { code: string; language?: string }) {
  return (
    <div className="relative rounded-lg bg-code text-slate-100">
      <div className="absolute right-2 top-2 flex items-center gap-2">
        {language && <span className="text-xs text-slate-500">{language}</span>}
        <CopyButton text={code} label="" />
      </div>
      <pre className="overflow-x-auto p-4 pr-24 font-mono text-xs leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// A long prompt to copy: a short scrollable preview and a prominent Copy button.
export function PromptBlock({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-subtle px-4 py-2.5">
        <p className="text-sm font-medium text-ink">Prompt</p>
        <Button
          className="min-h-9 px-4 py-1.5 sm:min-h-9"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(prompt);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch {
              // clipboard blocked: the text can still be selected below
            }
          }}
        >
          <Icon name="copy" className="h-3.5 w-3.5" />
          {copied ? "Copied" : "Copy prompt"}
        </Button>
      </div>
      <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words bg-surface p-4 font-mono text-xs leading-relaxed text-ink-soft">
        {prompt}
      </pre>
    </div>
  );
}

// ---- dialog ----

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-line bg-surface p-5 sm:rounded-2xl sm:p-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1 text-muted hover:bg-subtle hover:text-ink">
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
