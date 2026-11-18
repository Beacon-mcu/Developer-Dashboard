import { PageHeader } from "../../components/ui";
import { UsersTable } from "../../components/UsersTable";
import { useApp } from "./AppLayout";

export function UsersPage() {
  const { app } = useApp();
  return (
    <>
      <PageHeader title="Users" description="Everyone who has signed in to this app, and the wallet they got." />
      <UsersTable clientId={app.client_id} />
    </>
  );
}
