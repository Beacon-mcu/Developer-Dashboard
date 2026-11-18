import { useEffect, useRef } from "react";
import { Button, Card } from "../ui";
import type { LogEntry, LogKind } from "./usePlayground";

const COLOR: Record<LogKind, string> = {
  event: "text-sky-300",
  call: "text-slate-300",
  ok: "text-emerald-300",
  error: "text-red-300",
};

const LABEL: Record<LogKind, string> = { event: "event", call: "call ", ok: "ok   ", error: "error" };

// A live feed of what the SDK is doing: calls, answers and events. Always dark, like the code blocks.
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
      <div className="h-80 overflow-auto rounded-lg bg-code p-3 font-mono text-xs leading-relaxed xl:h-[28rem]">
        {logs.length === 0 && <p className="text-slate-500">Nothing yet. Log in to get started.</p>}
        {logs.map((entry) => (
          <p key={entry.id} className="break-words">
            <span className="text-slate-500">{entry.time} </span>
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
