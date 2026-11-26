import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "./Icon";
import { api, type AppUser } from "../lib/api";
import { formatDate, shortAddress } from "../lib/format";
import { Button, Card, ErrorNote, Skeleton } from "./ui";

const PAGE_SIZE = 20;

function GoogleG() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.5 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.8V6.5H1.4a12 12 0 0 0 0 11z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.5l4 3.1C6.3 6.9 8.9 4.8 12 4.8z" />
    </svg>
  );
}

const METHODS: Record<string, { label: string; icon: ReactNode }> = {
  google: { label: "Google", icon: <GoogleG /> },
  email: { label: "Email code", icon: <Icon name="mail" className="h-4 w-4 text-amber-600" /> },
  passkey: { label: "Passkey", icon: <Icon name="passkey" className="h-4 w-4 text-violet-600" /> },
};

// How the person signed in, as an icon (the name shows on hover and to screen readers).
function MethodIcon({ method }: { method: AppUser["method"] }) {
  const m = method ? METHODS[method] : undefined;
  if (!m) return <span className="text-muted">—</span>;
  return (
    <span
      title={m.label}
      className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-line bg-subtle"
    >
      {m.icon}
      <span className="sr-only">{m.label}</span>
    </span>
  );
}

// The people who have signed in to this app: how many, and who.
// A table on every screen; on a phone it scrolls sideways.
export function UsersTable({ clientId }: { clientId: string }) {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<{ total: number; users: AppUser[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listUsers(clientId, PAGE_SIZE, page * PAGE_SIZE)
      .then((result) => {
        setData(result);
        setError(null);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Could not load users."));
  }, [clientId, page]);

  const pages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <Card
      title="Users"
      subtitle={data ? `${data.total} ${data.total === 1 ? "person has" : "people have"} signed in to this app.` : undefined}
    >
      {error && <ErrorNote>{error}</ErrorNote>}
      {!data && !error && (
        <div className="space-y-2" aria-busy="true">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      )}

      {data && data.users.length === 0 && (
        <p className="rounded-xl bg-subtle p-4 text-sm text-muted">
          Nobody has signed in yet. Users appear here after their first login through your app.
        </p>
      )}

      {data && data.users.length > 0 && (
        <>
          {/* a table on every screen size; on a phone it scrolls sideways inside its box */}
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[38rem] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs text-muted">
                  <th className="whitespace-nowrap py-2 pr-4 font-medium">Wallet</th>
                  <th className="whitespace-nowrap py-2 pr-4 font-medium">Email</th>
                  <th className="whitespace-nowrap py-2 pr-4 font-medium">Sign-in</th>
                  <th className="whitespace-nowrap py-2 pr-4 font-medium">First seen</th>
                  <th className="whitespace-nowrap py-2 font-medium">Last seen</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((user) => (
                  <tr key={user.address} className="border-b border-line">
                    <td className="whitespace-nowrap py-2.5 pr-4 font-mono text-xs" title={user.address}>
                      {shortAddress(user.address)}
                    </td>
                    <td className="max-w-[16rem] truncate py-2.5 pr-4" title={user.email ?? undefined}>
                      {user.email || "Passkey user"}
                    </td>
                    <td className="whitespace-nowrap py-2.5 pr-4">
                      <MethodIcon method={user.method} />
                    </td>
                    <td className="whitespace-nowrap py-2.5 pr-4 text-muted">{formatDate(user.first_seen)}</td>
                    <td className="whitespace-nowrap py-2.5 text-muted">{formatDate(user.last_seen)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted sm:hidden">Swipe the table sideways to see every column.</p>

          {pages > 1 && (
            <div className="flex items-center justify-between gap-2 pt-1">
              <Button variant="ghost" className="px-3 py-1.5" disabled={page === 0} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <span className="text-xs text-muted">
                Page {page + 1} of {pages}
              </span>
              <Button variant="ghost" className="px-3 py-1.5" disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
