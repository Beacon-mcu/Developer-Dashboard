import { useEffect, useState } from "react";
import { api, type AppUser } from "../lib/api";
import { formatDate, shortAddress } from "../lib/format";
import { Button, Card, ErrorNote, Skeleton } from "./ui";

const PAGE_SIZE = 20;

// The people who have signed in to this app: how many, and who.
// A table on wider screens; stacked rows on a phone.
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
          {/* wider screens: a table */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs text-muted">
                  <th className="py-2 pr-4 font-medium">Wallet</th>
                  <th className="py-2 pr-4 font-medium">Email</th>
                  <th className="py-2 pr-4 font-medium">First seen</th>
                  <th className="py-2 font-medium">Last seen</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((user) => (
                  <tr key={user.address} className="border-b border-line">
                    <td className="py-2 pr-4 font-mono text-xs" title={user.address}>
                      {shortAddress(user.address)}
                    </td>
                    <td className="py-2 pr-4">{user.email ?? "—"}</td>
                    <td className="py-2 pr-4 text-muted">{formatDate(user.first_seen)}</td>
                    <td className="py-2 text-muted">{formatDate(user.last_seen)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* phones: one card per user */}
          <ul className="space-y-2 sm:hidden">
            {data.users.map((user) => (
              <li key={user.address} className="rounded-xl border border-line p-3 text-sm">
                <p className="break-all font-mono text-xs">{user.address}</p>
                <p className="mt-1 text-ink-soft">{user.email ?? "—"}</p>
                <p className="mt-1 text-xs text-muted">
                  First seen {formatDate(user.first_seen)} · last seen {formatDate(user.last_seen)}
                </p>
              </li>
            ))}
          </ul>

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
