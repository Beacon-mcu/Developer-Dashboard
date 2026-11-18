export type Failure = { message: string; code?: number; cancelled: boolean };

// Turns whatever was thrown into one plain message. Code -4 is the user saying no, which is not a failure.
export function explain(error: unknown): Failure {
  const e = error as { code?: unknown; message?: unknown } | null;
  const code = typeof e?.code === "number" ? e.code : undefined;
  if (code === -4) return { message: "You rejected the request in the wallet.", code, cancelled: true };
  const message = typeof e?.message === "string" && e.message ? e.message : "Something went wrong.";
  return { message: message.length > 300 ? message.slice(0, 300) + "…" : message, code, cancelled: false };
}
