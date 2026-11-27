import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CodeBlock, CopyButton, PageHeader, Stat } from "../../components/ui";
import { api } from "../../lib/api";
import { formatDate } from "../../lib/format";
import { useApp } from "./AppLayout";
import { appsCache } from "../../lib/cache";

export function Overview() {
  const { app } = useApp();
  const [users, setUsers] = useState<number | null>(null);

  useEffect(() => {
    setUsers(null);
    api
      .listUsers(app.client_id, 1, 0)
      .then((r) => setUsers(r.total))
      .catch(() => setUsers(null));
  }, [app.client_id]);

  const code = `import { BeaconAuth } from "@beaconmcu/auth";

const beacon = new BeaconAuth({
  clientId: "${app.client_id}",
  defaultNetwork: "${app.network}",
});

const { address } = await beacon.login(); // opens the wallet, the user signs in with Google
console.log(address); // a Stellar address (G...)`;

  return (
    <>
      <PageHeader title={app.name} description={`Created ${formatDate(app.created_at)}`} />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-[repeat(3,minmax(0,1fr))]">
        <Stat label="Users" value={users === null ? "–" : users} hint="People who signed in through this app" />
        <Stat label="Default network" value={app.network === "mainnet" ? "Mainnet" : "Testnet"} hint={app.network === "mainnet" ? "Real funds" : "Free test XLM"} />
        <Stat
          label="Domains"
          value={app.allowed_origins.length}
          hint={app.allowed_origins.length === 0 ? "Localhost works without any" : "Your live sites"}
        />
      </div>

      <div className="mt-6 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[repeat(2,minmax(0,1fr))]">
        <Card title="Client ID" subtitle="Public. Put it in your code to connect your app to Beacon.">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <code className="min-w-0 flex-1 break-all rounded-lg bg-subtle px-3 py-2.5 font-mono text-xs text-ink sm:text-sm">
              {app.client_id}
            </code>
            <CopyButton text={app.client_id} label="Copy ID" />
          </div>
          <p className="text-sm text-muted">
            Before you launch, add your live site's address under{" "}
            <Link to={`/apps/${appsCache.slug(app)}/domains`} className="font-medium text-brand-text hover:underline">
              Domains
            </Link>
            .
          </p>
        </Card>

        <Card
          title="Get started"
          subtitle={
            <>
              Install{" "}
              <a
                href="https://www.npmjs.com/package/@beaconmcu/auth"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-brand-text hover:underline"
              >
                @beaconmcu/auth
              </a>
              , then add this to your app.{" "}
              <Link to="/docs" className="font-medium text-brand-text hover:underline">
                Read the docs
              </Link>
            </>
          }
        >
          <CodeBlock language="bash" code="npm install @beaconmcu/auth" />
          <CodeBlock language="ts" code={code} />
        </Card>
      </div>
    </>
  );
}
