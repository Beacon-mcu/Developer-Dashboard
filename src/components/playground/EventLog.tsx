import { useEffect, useRef } from "react";
import { Button, Card } from "../ui";
import type { LogEntry, LogKind } from "./usePlayground";

const COLOR: Record<LogKind, string> = {
  event: "text-log-event",
  call: "text-log-call",
  ok: "text-log-ok",
  error: "text-log-error",
};

const LABEL: Record<LogKind, string> = { event: "event", call: "call ", ok: "ok   ", error: "error" };

// A live feed of what the SDK is doing: calls, answers and events. It follows the theme, like the code blocks.
export function EventLog({ logs, onClear }: { logs: LogEntry[]; onClear: () => void }) {
  const endRef = useRef<HTMLDivElement>(null);

  // Keep the newest line in view.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [logs.length]);

  return (
    <Card
      title="Live log"
      subtitle="Every SDK call, answer and event shows up here as it happens."
    >
      <div className="h-80 overflow-auto rounded-lg border border-code-line bg-code p-3 font-mono text-xs leading-relaxed xl:h-[28rem]">
        {logs.length === 0 && <p className="text-code-muted">Nothing yet. Log in to get started.</p>}
        {logs.map((entry) => (
          <p key={entry.id} className="break-words">
            <span className="text-code-muted">{entry.time} </span>
            <span className={COLOR[entry.kind]}>
              {LABEL[entry.kind]} {entry.text}
            </span>
          </p>
        ))}
        <div ref={endRef} />
      </div>
      <Button variant="ghost" className="min-h-9 px-3 py-1.5 text-xs" onClick={onClear} disabled={logs.length === 0}>
        Clear log
      </Button>
    </Card>
  );
}
