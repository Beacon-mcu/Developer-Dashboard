import { Link } from "react-router-dom";
import { C, Callout, DocPage, FileCode, Install, P, Section, Tabs } from "../kit";

const VITE_ENV = `VITE_BEACON_CLIENT_ID=bcn_app_xxxxxxxxxxxxxxxxxxxxxxxx`;

const VITE_BEACON = `import { BeaconAuth } from "@beaconmcu/auth";

export const beacon = new BeaconAuth({
  clientId: import.meta.env.VITE_BEACON_CLIENT_ID,
  defaultNetwork: "testnet",
});`;

const VITE_HOOK = `import { useEffect, useState } from "react";
import { BeaconError } from "@beaconmcu/auth";
import { beacon } from "../lib/beacon";

const quiet = (run: Promise<unknown>) =>
  run.catch((e) => {
    if (!(e instanceof BeaconError && e.code === -4)) throw e;
  });

export function useBeacon() {
  const [address, setAddress] = useState(beacon.getAddress());

  useEffect(() => beacon.on("accountChanged", setAddress), []);

  return {
    address,
    login: () => quiet(beacon.login()),
    logout: () => beacon.logout(),
    backupKey: () => quiet(beacon.exportWallet()),
  };
}`;

const VITE_APP = `import { useBeacon } from "./hooks/useBeacon";

export default function App() {
  const { address, login, logout, backupKey } = useBeacon();

  if (!address) return <button onClick={login}>Log in</button>;

  return (
    <div>
      <p>{address}</p>
      <button onClick={backupKey}>Back up key</button>
      <button onClick={logout}>Log out</button>
    </div>
  );
}`;

const NEXT_ENV = `NEXT_PUBLIC_BEACON_CLIENT_ID=bcn_app_xxxxxxxxxxxxxxxxxxxxxxxx`;

const NEXT_BEACON = `import { BeaconAuth } from "@beaconmcu/auth";

export const beacon = new BeaconAuth({
  clientId: process.env.NEXT_PUBLIC_BEACON_CLIENT_ID!,
  defaultNetwork: "testnet",
});`;

const NEXT_HOOK = `"use client";

${VITE_HOOK}`;

const NEXT_PAGE = `"use client";

${VITE_APP.replace('"./hooks/useBeacon"', '"@/hooks/useBeacon"')}`;

const JS_BEACON = `import { BeaconAuth } from "@beaconmcu/auth";

export const beacon = new BeaconAuth({
  clientId: import.meta.env.VITE_BEACON_CLIENT_ID,
  defaultNetwork: "testnet",
});`;

const JS_MAIN = `import { beacon } from "./beacon";

const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = \`
  <button id="login">Log in</button>
  <button id="backup" hidden>Back up key</button>
  <button id="logout" hidden>Log out</button>
  <p id="address"></p>\`;

const $ = (id: string) => document.getElementById(id)!;

function show(address: string | null) {
  $("address").textContent = address ?? "";
  $("login").hidden = !!address;
  $("backup").hidden = !address;
  $("logout").hidden = !address;
}

$("login").onclick = async () => show((await beacon.login()).address);
$("backup").onclick = () => beacon.exportWallet();
$("logout").onclick = () => beacon.logout();
beacon.on("accountChanged", show);`;

function ClientId() {
  return (
    <Callout>
      Your Client ID is in the <Link to="/apps" className="font-medium text-brand-text hover:underline">dashboard</Link>: open your
      app and copy it. It is public, so it is safe in browser code.
    </Callout>
  );
}

function Next() {
  return (
    <Section id="next" title="Next">
      <ul className="list-disc space-y-1 pl-5 text-sm text-ink-soft">
        <li>
          <Link to="/docs/signing" className="text-brand-text hover:underline">
            Send XLM and sign
          </Link>
        </li>
        <li>
          <Link to="/docs/email" className="text-brand-text hover:underline">
            Add email, passkeys or wallets
          </Link>
        </li>
        <li>
          <Link to="/docs/domains" className="text-brand-text hover:underline">
            Add your live site before you launch
          </Link>{" "}
          (<C>localhost</C> works as is, on testnet)
        </li>
      </ul>
    </Section>
  );
}

export function ReactPage() {
  return (
    <DocPage title="React" description="Add Beacon to a React or Next.js app.">
      <Section id="installation" title="Installation">
        <Install pkg="@beaconmcu/auth" />
      </Section>

      <Section id="environment" title="Environment">
        <ClientId />
        <Tabs
          tabs={[
            { id: "vite", label: "Vite", content: <FileCode name=".env" code={VITE_ENV} note="Stores your Client ID." /> },
            { id: "next", label: "Next.js", content: <FileCode name=".env.local" code={NEXT_ENV} note="Stores your Client ID." /> },
          ]}
        />
      </Section>

      <Section id="code" title="Code">
        <Tabs
          tabs={[
            {
              id: "vite",
              label: "Vite",
              content: (
                <>
                  <FileCode name="src/lib/beacon.ts" code={VITE_BEACON} note="Creates the one Beacon connection your whole app uses." />
                  <FileCode
                    name="src/hooks/useBeacon.ts"
                    code={VITE_HOOK}
                    note="A hook that gives your components the address, login, logout and key backup."
                  />
                  <FileCode
                    name="src/App.tsx"
                    code={VITE_APP}
                    note="Shows a Log in button, then the address with Back up key and Log out once signed in."
                  />
                </>
              ),
            },
            {
              id: "next",
              label: "Next.js",
              content: (
                <>
                  <FileCode name="lib/beacon.ts" code={NEXT_BEACON} note="Creates the one Beacon connection your whole app uses." />
                  <FileCode
                    name="hooks/useBeacon.ts"
                    code={NEXT_HOOK}
                    note="The same hook, marked as a client component. It gives your components the address, login, logout and key backup."
                  />
                  <FileCode
                    name="app/page.tsx"
                    code={NEXT_PAGE}
                    note="The home page: a Log in button, then the address with Back up key and Log out once signed in."
                  />
                </>
              ),
            },
          ]}
        />
        <P>
          Run it and click <strong>Log in</strong>. Create one <C>BeaconAuth</C> for the whole app, as in <C>beacon.ts</C>.
        </P>
      </Section>

      <Next />
    </DocPage>
  );
}

export function JavaScriptPage() {
  return (
    <DocPage title="JavaScript" description="Use Beacon with plain JavaScript or TypeScript, with no framework.">
      <Section id="installation" title="Installation">
        <Install pkg="@beaconmcu/auth" />
      </Section>

      <Section id="environment" title="Environment">
        <ClientId />
        <FileCode name=".env" code={VITE_ENV} note="Stores your Client ID." />
      </Section>

      <Section id="code" title="Code">
        <FileCode name="src/beacon.ts" code={JS_BEACON} note="Creates the one Beacon connection your whole app uses." />
        <FileCode name="src/main.ts" code={JS_MAIN} note="Draws the buttons and shows the address once the user signs in." />
      </Section>

      <Next />
    </DocPage>
  );
}
