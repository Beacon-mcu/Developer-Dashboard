import type { ReactNode } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { CodeBlock, PromptBlock } from "../components/ui";
import { buildPrompt } from "../lib/prompt";

const GUIDE_SECTIONS = [
  { id: "overview", title: "Overview" },
  { id: "build-with-ai", title: "Build with AI" },
  { id: "quick-start", title: "Quick start" },
  { id: "frameworks", title: "React and Next.js" },
  { id: "domains", title: "Domains" },
  { id: "email", title: "Email" },
  { id: "passkeys", title: "Passkeys" },
  { id: "networks", title: "Networks" },
  { id: "signing", title: "Signing" },
  { id: "backup", title: "Back up the key" },
  { id: "silent-signing", title: "Silent signing" },
  { id: "wallet-libraries", title: "Wallet libraries" },
  { id: "reference", title: "Options, events and errors" },
  { id: "security", title: "Security" },
  { id: "faq", title: "FAQ" },
];

const WALLET_SECTIONS = [
  { id: "enable", title: "Turn it on" },
  { id: "use", title: "Use it" },
  { id: "differences", title: "What is different" },
  { id: "errors", title: "Handle errors" },
  { id: "verify", title: "Verify an address" },
];

const TABS = [
  { id: "guide", title: "Guide" },
  { id: "external-wallets", title: "External wallets" },
] as const;

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="space-y-3 border-b border-line pb-10">
      <h2 className="text-xl font-semibold tracking-tight text-ink">{title}</h2>
      {children}
    </section>
  );
}

const P = ({ children }: { children: ReactNode }) => <p className="text-sm leading-relaxed text-ink-soft">{children}</p>;
const C = ({ children }: { children: ReactNode }) => (
  <code className="rounded bg-subtle px-1.5 py-0.5 font-mono text-[0.8rem] text-ink">{children}</code>
);
const H3 = ({ children }: { children: ReactNode }) => (
  <h3 className="pt-2 text-sm font-semibold text-ink">{children}</h3>
);

function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full text-left text-sm">
        <thead className="bg-subtle text-xs text-muted">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-3 py-2 font-medium">
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

export function Docs() {
  const [params, setParams] = useSearchParams();
  const { hash } = useLocation();
  const tab = params.get("tab") === "external-wallets" || hash === "#external-wallets" ? "external-wallets" : "guide";
  const SECTIONS = tab === "external-wallets" ? WALLET_SECTIONS : GUIDE_SECTIONS;

  return (
    <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_13rem] xl:gap-12">
      <aside className="hidden xl:order-2 xl:block">
        <nav className="sticky top-20 space-y-1 text-sm">
          <p className="pb-2 text-xs font-medium text-muted">On this page</p>
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="block rounded-lg px-3 py-1.5 text-ink-soft hover:bg-subtle hover:text-ink">
              {s.title}
            </a>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 max-w-4xl space-y-10 xl:order-1">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Beacon docs</h1>
          <p className="mt-2 text-muted">Add Google sign-in and a Stellar wallet to your app in a few minutes.</p>

          {/* smaller screens: jump to a section */}
          <label className="mt-4 block xl:hidden">
            <span className="sr-only">Jump to a section</span>
            <select
              className="min-h-11 w-full rounded-xl border border-line-strong bg-surface px-3 text-base text-ink"
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) window.location.hash = e.target.value;
                e.target.value = "";
              }}
            >
              <option value="" disabled>
                Jump to a section…
              </option>
              {SECTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div role="tablist" aria-label="Docs" className="flex gap-1 border-b border-line">
          {TABS.map((item) => (
            <button
              key={item.id}
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => {
                setParams(item.id === "guide" ? {} : { tab: item.id }, { replace: true });
                window.scrollTo({ top: 0 });
              }}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                tab === item.id ? "border-brand text-brand-text" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>

        {tab === "external-wallets" ? (
          <ExternalWalletsTab />
        ) : (
          <>
        <Section id="overview" title="Overview">
          <P>
            Beacon gives every Google account a Stellar wallet. Your users click Login, sign in with Google, and can
            sign transactions straight away. They install nothing and never see a seed phrase.
          </P>
          <Table
            head={["Step", "What happens"]}
            rows={[
              ["1. Login", "Your app opens the Beacon wallet in a secure window."],
              ["2. Google", "The user picks a Google account. A wallet is created on their first login."],
              ["3. Sign", "Your app asks the wallet to sign. The user approves inside the wallet."],
            ]}
          />
          <P>
            Every person gets <strong>their own wallet in each app</strong>, with its own address. One app can only ever reach the
            money its own users put in that app's wallet, never a wallet from another app. The private key is created and used
            only inside the wallet window, so your app never sees it.
          </P>
        </Section>

        <Section id="build-with-ai" title="Build with AI">
          <P>
            Want an AI assistant to build your app? Copy this prompt into Claude, ChatGPT, Cursor or any AI coding tool.
            It explains Beacon completely: the install, every method, and the Stellar rules that trip people up. Replace the
            line in square brackets with what you want to build, and paste it in.
          </P>
          <PromptBlock prompt={buildPrompt({ clientId: "bcn_app_YOUR_CLIENT_ID", network: "testnet" })} />
          <P>
            Using an agent that can open links (Claude Code, Cursor, ChatGPT with browsing)? Give it this address instead. It is
            the same text as plain text, so the agent can read it:
          </P>
          <CodeBlock language="url" code="https://dash.beaconmcu.space/llms.txt" />
          <P>
            Open one of your apps in the dashboard to get the same prompt with that app's own Client ID and network already
            filled in.
          </P>
        </Section>

        <Section id="quick-start" title="Quick start">
          <H3>1. Create an app</H3>
          <P>
            In the <Link to="/apps" className="underline">dashboard</Link>, click Create app and give it a name. You get
            a public <strong>Client ID</strong> that looks like <C>bcn_app_xxxxxxxxxxxxxxxxxxxxxxxx</C>.
          </P>
          <P>
            <strong>Want to try it before writing any code?</strong> Open your app in the dashboard and choose{" "}
            <strong>Playground</strong>. It is the real SDK and the real wallet: log in, switch network, sign a message and
            send XLM, while a live log shows every call, answer and event. Each action shows the code that does it, ready to
            copy.
          </P>
          <H3>2. Install</H3>
          <CodeBlock language="bash" code="npm install @beaconmcu/auth" />
          <H3>3. Add login</H3>
          <CodeBlock
            language="ts"
            code={`import { BeaconAuth } from "@beaconmcu/auth";

const beacon = new BeaconAuth({ clientId: "bcn_app_..." });

const { address } = await beacon.login(); // opens the wallet; the user signs in with Google
console.log(address);                     // a Stellar address, starting with G

beacon.on("accountChanged", (address) => console.log(address));
await beacon.logout();`}
          />
          <P>
            <strong>Requirements:</strong> a modern browser. The package includes TypeScript types and
            works as ESM or CommonJS. It is published on npm as{" "}
            <a href="https://www.npmjs.com/package/@beaconmcu/auth" target="_blank" rel="noreferrer" className="underline">
              @beaconmcu/auth
            </a>
            .
          </P>
          <H3>4. Add a "Back up key" button</H3>
          <P>
            Every wallet made with Google or a passkey has a secret key the user may want to keep. Always give signed-in users
            a way to back it up. It takes one call (version 0.1.13 or newer):
          </P>
          <CodeBlock
            language="ts"
            code={`<button onClick={() => beacon.exportWallet()}>Back up key</button>`}
          />
          <P>
            The key appears only inside the Beacon window, after the user signs in again. Your app never receives it. See{" "}
            <a href="#backup" className="underline">
              Back up the key
            </a>
            .
          </P>
          <P>
            That's it for local development. <C>beacon.getAddress()</C> returns the address (or <C>null</C> when signed
            out), and <C>beacon.getNetwork()</C> returns the active network.
          </P>
        </Section>

        <Section id="frameworks" title="React and Next.js">
          <P>
            Create one <C>BeaconAuth</C> for the whole app, in its own file, and read it from your components:
          </P>
          <CodeBlock
            language="tsx"
            code={`// beacon.ts
import { BeaconAuth } from "@beaconmcu/auth";
export const beacon = new BeaconAuth({ clientId: "bcn_app_...", defaultNetwork: "testnet" });

// LoginButton.tsx   (in Next.js, add "use client" at the top)
import { useEffect, useState } from "react";
import { beacon } from "./beacon";

export function LoginButton() {
  const [address, setAddress] = useState(beacon.getAddress());

  useEffect(() => beacon.on("accountChanged", setAddress), []); // returns the function that unsubscribes

  return address ? (
    <button onClick={() => beacon.logout()}>Log out ({address.slice(0, 6)}…)</button>
  ) : (
    <button onClick={() => beacon.login()}>Log in</button>
  );
}`}
          />
          <P>
            It is safe to import on the server, because it only touches the page in the browser. Call <C>login()</C>,{" "}
            <C>sendPayment()</C> and the other methods from client-side code, such as event handlers and effects.
          </P>
        </Section>

        <Section id="domains" title="Domains">
          <P>
            Only websites you allow can open the wallet for your app. This stops someone else from using your Client ID
            on their own site.
          </P>
          <Table
            head={["Where your app runs", "What you need to do"]}
            rows={[
              [
                <>
                  <C>http://localhost:3000</C>, <C>127.0.0.1</C> (any port)
                </>,
                "Nothing. Local development always works.",
              ],
              [
                <C>https://myapp.com</C>,
                <>
                  Add it under <strong>Domains</strong> on your app's page before you launch.
                </>,
              ],
            ]}
          />
          <P>
            Enter just the site address: <C>https://myapp.com</C>, with no path. Use https (plain http is only allowed
            for localhost). You can add up to 10. If users see <em>"This site isn't authorized for this app"</em>, the
            site's address is missing from this list.
          </P>
        </Section>

        <Section id="email" title="Email">
          <P>
            Let people sign in with their email. Beacon sends a 6-digit code and the user types it in the same sign-in window.
            Open your app in the dashboard, go to <strong>Authentication</strong> and switch on <strong>Email</strong>. Your code
            does not change, and any SDK version works.
          </P>
          <Table
            head={["With email", ""]}
            rows={[
              ["Wallet", "A normal Stellar wallet (G… address), made the same way as for Google users. Every feature works."],
              ["Users", "They appear in your Users list and monthly active users, with their email address."],
              ["The code", "6 digits, valid for 10 minutes, works once. Five wrong tries cancel it."],
              ["Separate from Google", "The same email signed in with Google and with a code gives two different wallets."],
            ]}
          />
        </Section>

        <Section id="passkeys" title="Passkeys">
          <P>
            Let people sign in with their fingerprint, face or screen lock instead of a Google account. Open your app in the
            dashboard, go to <strong>Authentication</strong> and switch on <strong>Passkeys</strong>. Your code does not change, and
            any SDK version works.
          </P>
          <Table
            head={["With a passkey", ""]}
            rows={[
              ["Wallet", "A normal Stellar wallet (G… address), made the same way as for Google users. Every feature works."],
              ["Users", "They appear in your Users list and monthly active users. They have no email."],
              ["Separate from Google", "A passkey and a Google account are different sign-ins with different wallets."],
              ["Keeping it safe", "The passkey lives on the user's device or in their password manager (iCloud, Google, 1Password). Losing every copy loses the wallet."],
            ]}
          />
        </Section>

        <Section id="networks" title="Networks">
          <P>
            Beacon works on Stellar <strong>testnet</strong> (free test XLM) and <strong>mainnet</strong> (real money).
            You choose in your code:
          </P>
          <CodeBlock
            language="ts"
            code={`const beacon = new BeaconAuth({
  clientId: "bcn_app_...",
  defaultNetwork: "testnet",                 // used on login
  supportedNetworks: ["testnet", "mainnet"], // the app may switch between these
});

await beacon.switchNetwork("mainnet");
beacon.on("networkChanged", (network) => console.log(network));`}
          />
          <H3>Which network is used?</H3>
          <P>
            Each app has a <strong>default network</strong> in the dashboard (Settings). It is the fallback: it applies when
            your code doesn't say. If your code sets <C>defaultNetwork</C>, the code wins.
          </P>
          <Table
            head={["Your code", "Dashboard setting", "The wallet uses"]}
            rows={[
              ["no defaultNetwork", "Mainnet", <strong key="a">Mainnet</strong>],
              ["no defaultNetwork", "Testnet", <strong key="b">Testnet</strong>],
              [<C key="c">defaultNetwork: "testnet"</C>, "Mainnet", <><strong>Testnet</strong> (the code wins)</>],
              [<C key="d">defaultNetwork: "mainnet"</C>, "Testnet", <><strong>Mainnet</strong> (the code wins)</>],
            ]}
          />
          <P>
            A network that is not in <C>supportedNetworks</C> is rejected with error code <C>-6</C>. Without{" "}
            <C>supportedNetworks</C>, the app can only use its default network. Every approval screen in the wallet shows
            the network and marks mainnet as real funds.
          </P>
          <div className="rounded-xl border border-warn-line bg-warn-soft p-4 text-sm text-warn-text">
            <strong>Call getNetwork() after login().</strong> Before the user signs in, the SDK has not heard from the
            wallet yet, so if you did not set <C>defaultNetwork</C> in code it reports testnet even when your dashboard says
            Mainnet. After login it reports the wallet's real network (and fires <C>networkChanged</C> if that differs).
            Set <C>defaultNetwork</C> in code to avoid the gap.
          </div>
          <H3>New accounts need funding</H3>
          <P>
            A Stellar account only exists after it receives at least <strong>1 XLM</strong>. On testnet, fund it for
            free with Stellar's Friendbot:
          </P>
          <CodeBlock
            language="ts"
            code={`const { friendbotUrl } = beacon.getNetwork(); // testnet only
await fetch(\`\${friendbotUrl}?addr=\${address}\`);`}
          />
          <P>On mainnet, send at least 1 XLM to the user's address to create the account.</P>
        </Section>

        <Section id="signing" title="Signing">
          <P>
            Your app never holds a key. It asks the wallet to sign, the wallet shows what is being signed, and the user
            approves.
          </P>
          <H3>Send XLM (one call)</H3>
          <CodeBlock
            language="ts"
            code={`const { hash } = await beacon.sendPayment({ to: "G...", amount: "10" });`}
          />
          <P>
            The wallet builds the payment, shows it to the user, signs it and submits it, then returns the transaction
            hash. You can add a <C>memo</C> (text, up to 28 bytes). Sending to an account that doesn't exist yet creates
            it, which needs at least 1 XLM. For anything beyond a plain XLM payment, build the transaction yourself and
            use <C>signTransaction</C> below.
          </P>
          <H3>Sign a message</H3>
          <CodeBlock
            language="ts"
            code={`const { signedMessage, signerAddress } = await beacon.signMessage("Hello Stellar");
// signedMessage is a base64 signature (SEP-53)`}
          />
          <H3>Sign any transaction</H3>
          <P>
            For payments in other assets, trustlines, contract calls and the like, build the transaction with the Stellar
            SDK, ask Beacon to sign it, then submit it yourself:
          </P>
          <CodeBlock
            language="ts"
            code={`import { Asset, Horizon, Operation, TransactionBuilder } from "@stellar/stellar-sdk";

const network = beacon.getNetwork();
const server = new Horizon.Server(network.horizonUrl);
const account = await server.loadAccount(address);

const tx = new TransactionBuilder(account, { fee: "100", networkPassphrase: network.passphrase })
  .addOperation(Operation.payment({ destination: "G...", asset: Asset.native(), amount: "10" }))
  .setTimeout(180)
  .build();

const { signedTxXdr } = await beacon.signTransaction(tx.toXDR());
await server.submitTransaction(TransactionBuilder.fromXDR(signedTxXdr, network.passphrase));`}
          />
          <H3>Call a smart contract</H3>
          <P>Build, simulate and send the call with the Stellar SDK. Beacon only signs.</P>
          <CodeBlock
            language="ts"
            code={`import { Contract, TransactionBuilder, nativeToScVal, rpc } from "@stellar/stellar-sdk";

const network = beacon.getNetwork();
const server = new rpc.Server("https://soroban-testnet.stellar.org"); // mainnet: your RPC provider
const account = await server.getAccount(address);

const tx = new TransactionBuilder(account, { fee: "100", networkPassphrase: network.passphrase })
  .addOperation(new Contract("C...").call("hello", nativeToScVal("world", { type: "symbol" })))
  .setTimeout(60)
  .build();

const prepared = await server.prepareTransaction(tx); // simulates, adds fees and footprint
const { signedTxXdr } = await beacon.signTransaction(prepared.toXDR());

const sent = await server.sendTransaction(TransactionBuilder.fromXDR(signedTxXdr, network.passphrase));
if (sent.status === "ERROR") throw new Error("Rejected");

let result = await server.getTransaction(sent.hash);
for (let i = 0; i < 30 && result.status === "NOT_FOUND"; i++) {
  await new Promise((r) => setTimeout(r, 1000));
  result = await server.getTransaction(sent.hash);
}
// "SUCCESS" or "FAILED". Still "NOT_FOUND": the result is unknown, check again later`}
          />
          <H3>Sign a Soroban authorization entry</H3>
          <CodeBlock
            language="ts"
            code={`const { signedAuthEntry } = await beacon.signAuthEntry(preimageBase64);`}
          />
          <P>
            The wallet's confirmation screen shows what the transaction does: payments, new accounts, trusted assets,
            contract calls. It warns about operations that could change who controls an account.
          </P>
        </Section>

        <Section id="backup" title="Back up the key">
          <P>
            Let users save their secret key so they can use the wallet in any Stellar app. The key is shown only inside the
            Beacon window, after the user signs in again. Your app never receives it.
          </P>
          <CodeBlock
            language="ts"
            code={`await beacon.exportWallet(); // resolves once the user has seen their key; rejects with code -4 if they close it`}
          />
          <P>
            It works for Google and passkey wallets. With an external wallet it rejects with code -6, because that wallet
            keeps its own key. Needs <C>@beaconmcu/auth</C> 0.1.13 or newer.
          </P>
        </Section>

        <Section id="silent-signing" title="Silent signing">
          <P>
            By default every signature asks the user to approve. If you prefer no prompt for everyday actions, turn the
            confirmation screen off:
          </P>
          <CodeBlock language="ts" code={`const beacon = new BeaconAuth({ clientId: "bcn_app_...", showWalletUI: false });`} />
          <P>Only low-risk requests are then signed without a prompt:</P>
          <Table
            head={["Signed silently", "Always asks, even with showWalletUI: false"]}
            rows={[
              [
                "Text messages, and transactions made only of plain XLM payments from the user's own account.",
                "Smart contract calls, authorization entries, signer or threshold changes, account merges, trusting assets, fee bumps, and anything that acts for another account.",
              ],
            ]}
          />
          <P>Turn the screen off only if you are comfortable with your app moving the user's XLM without a prompt.</P>
        </Section>

        <Section id="wallet-libraries" title="Wallet libraries">
          <P>
            <C>beacon.getWalletInterface()</C> returns the standard Stellar wallet shape (SEP-43), so libraries such as
            Stellar Wallets Kit can use Beacon:
          </P>
          <CodeBlock
            language="ts"
            code={`const wallet = beacon.getWalletInterface();

const { address } = await wallet.getAddress();      // logs in if needed
const { signedTxXdr } = await wallet.signTransaction(xdr);
// Each call returns the result, or { error: { code, message } }`}
          />
        </Section>

        <Section id="reference" title="Options, events and errors">
          <H3>Options</H3>
          <Table
            head={["Option", "Default", "What it does"]}
            rows={[
              [<C>clientId</C>, "required", "Your app's Client ID from the dashboard."],
              [<C>defaultNetwork</C>, "the dashboard's network", <>"testnet" or "mainnet", used on login.</>],
              [<C>supportedNetworks</C>, "just the default", <>Networks <C>switchNetwork</C> may use.</>],
              [<C>showWalletUI</C>, "true", "false = sign low-risk requests without a prompt."],
              [<C>walletUrl</C>, "built in", "Optional. Only to test a different wallet."],
            ]}
          />
          <H3>Methods</H3>
          <Table
            head={["Method", "Returns"]}
            rows={[
              [<C>login()</C>, <><C>{"{ address }"}</C>. Opens the wallet and signs the user in.</>],
              [<C>logout()</C>, "Signs the user out."],
              [<C>switchNetwork(network)</C>, "Switches to another supported network."],
              [<C>sendPayment({"{ to, amount, memo? }"})</C>, <><C>{"{ hash }"}</C>. Builds, signs and submits an XLM payment.</>],
              [<C>signMessage(message)</C>, <><C>{"{ signedMessage, signerAddress }"}</C></>],
              [<C>signTransaction(xdr)</C>, <><C>{"{ signedTxXdr, signerAddress }"}</C></>],
              [<C>signAuthEntry(preimage)</C>, <><C>{"{ signedAuthEntry, signerAddress }"}</C></>],
              [<><C>getAddress()</C>, <C>getNetwork()</C></>, "The current address (or null) and network."],
              [<C>getWalletInterface()</C>, "The SEP-43 wallet shape."],
              [<C>on(event, callback)</C>, "Subscribe to an event. Returns a function that unsubscribes."],
              [<C>destroy()</C>, "Removes the wallet from the page."],
            ]}
          />
          <H3>Events</H3>
          <Table
            head={["Event", "When", "Value"]}
            rows={[
              [<C>connect</C>, "The user signed in (or was signed back in after a refresh).", <C>{"{ address, network }"}</C>],
              [<C>disconnect</C>, "The user signed out.", "none"],
              [<C>accountChanged</C>, "The address changed, or the user signed out.", <><C>string</C> or <C>null</C></>],
              [<C>networkChanged</C>, "The active network changed.", <C>"testnet" | "mainnet"</C>],
            ]}
          />
          <H3>Errors</H3>
          <P>
            Errors are <C>BeaconError</C> objects with a numeric <C>code</C>, following the Stellar wallet standard.
          </P>
          <Table
            head={["Code", "Meaning"]}
            rows={[
              [<C>-1</C>, "Internal wallet error."],
              [<C>-2</C>, "An outside service (the network) failed."],
              [<C>-3</C>, "Invalid request: bad parameters, malformed transaction, or wrong network."],
              [<C>-4</C>, "The user rejected the request. Do not retry automatically."],
              [<C>-5</C>, "Not connected. Call login() first."],
              [<C>-6</C>, "Not supported, for example a network you did not list."],
              [<C>-7</C>, "Another request is already waiting for the user."],
            ]}
          />
        </Section>

        <Section id="security" title="Security">
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-soft">
            <li>
              <strong>The private key never leaves the wallet window.</strong> It is created, unlocked and used only on
              the wallet's own domain. The Beacon package contains no keys and no crypto.
            </li>
            <li>
              <strong>Your site and the wallet talk only through messages</strong>, and both sides check who sent them.
            </li>
            <li>
              <strong>Only your allowed domains can open the wallet</strong> for your app, plus localhost for
              development.
            </li>
            <li>
              <strong>The server stores only an encrypted copy of the key.</strong> The unlocked key lives in memory only.
              The one-hour sign-in session is kept in the wallet's own tab storage so a page refresh keeps the user
              signed in, and it is cleared on logout.
            </li>
            <li>
              <strong>Nothing risky is signed silently.</strong> Even with the screen turned off, contract calls and
              account changes always ask.
            </li>
          </ul>
        </Section>

        <section id="faq" className="space-y-4 pb-10">
          <h2 className="text-xl font-semibold tracking-tight text-ink">FAQ</h2>
          <div className="space-y-4">
            <Faq q="Users see “This site isn't authorized for this app”.">
              The address of the site that opened the wallet is not in your app's Domains list. Add it in the dashboard.
              Localhost never needs adding.
            </Faq>
            <Faq q="Do I have to set up Google credentials?">
              No. Beacon runs the Google sign-in for every app. You only need a Client ID.
            </Faq>
            <Faq q="Is the wallet address the same across apps?">
              No. A person signs in once, but each app gets a separate wallet with its own address and key. That keeps an
              app from touching funds a person holds in another app.
            </Faq>
            <Faq q="Why does the balance show 0 or “not activated”?">
              A Stellar account must receive at least 1 XLM before it exists. Fund it with Friendbot on testnet.
            </Faq>
            <Faq q="Does a page refresh log the user out?">
              No. The wallet keeps the one-hour session for that browser tab, so a refresh signs the user back in
              silently. After an hour, or after logout, they sign in with Google again.
            </Faq>
          </div>
        </section>
          </>
        )}
      </div>
    </div>
  );
}

function ExternalWalletsTab() {
  return (
    <>
      <Section id="enable" title="Turn it on">
        <P>
          Let people use Freighter (Varial), xBull, LOBSTR, Hana, Albedo or Rabet instead of Google. Open your app in the
          dashboard, go to <strong>Authentication</strong> and switch on <strong>External wallets</strong>.
        </P>
        <CodeBlock language="bash" code={`npm install @beaconmcu/auth@latest   # 0.1.12 or newer`} />
        <P>
          Nothing else to install. The wallet code loads only for apps that turn this on.
        </P>
      </Section>

      <Section id="use" title="Use it">
        <P>
          Your code does not change. <C>login()</C> now opens one window with Google and the wallet list.
        </P>
        <CodeBlock
          language="ts"
          code={`const { address } = await beacon.login();                // Google or a wallet
await beacon.sendPayment({ to: "G...", amount: "10" });  // the wallet asks the user to approve
const { signedTxXdr } = await beacon.signTransaction(xdr);
const { signedMessage } = await beacon.signMessage("Hello");`}
        />
        <P>
          Smart contract calls use <C>signTransaction</C>, the same as for Google users. See{" "}
          <a href="/docs#signing" className="font-medium text-brand-text hover:underline">
            Call a smart contract
          </a>
          .
        </P>
      </Section>

      <Section id="differences" title="What is different">
        <Table
          head={["", "External wallet"]}
          rows={[
            ["Keys", "The user keeps their own keys. Each action is approved in their wallet."],
            ["Works", <>login, logout, sendPayment, signTransaction, signMessage, signAuthEntry, switchNetwork.</>],
            ["Silent signing", <><C>showWalletUI: false</C> does not apply.</>],
            ["Users and billing", "Not in your Users list or your monthly active users."],
            ["Page reload", "The user connects their wallet again."],
            ["New accounts", "sendPayment to an account that does not exist yet creates it and needs at least 1 XLM."],
            ["signMessage", "The signature format is up to the wallet."],
          ]}
        />
      </Section>

      <Section id="errors" title="Handle errors">
        <CodeBlock
          language="ts"
          code={`import { BeaconError } from "@beaconmcu/auth";

try {
  await beacon.sendPayment({ to: "G...", amount: "10" });
} catch (e) {
  if (e instanceof BeaconError) {
    if (e.code === -4) return;        // the user cancelled in their wallet: not an error
    if (e.code === -7) return;        // another request is already waiting for the user
    console.error(e.code, e.message);
  }
}`}
        />
      </Section>

      <Section id="verify" title="Verify an address">
        <P>
          Beacon does not verify an external wallet's address on its servers. If you log someone in to your own backend,
          ask them to sign a one-time text and check it there (SEP-53):
        </P>
        <CodeBlock
          language="ts"
          code={`// client
const nonce = await fetch("/api/nonce").then((r) => r.text());
const { signedMessage, signerAddress } = await beacon.signMessage(nonce);

// server
import { Keypair, hash } from "@stellar/stellar-sdk";

const payload = Buffer.concat([Buffer.from("Stellar Signed Message:\\n"), Buffer.from(nonce)]);
const ok = Keypair.fromPublicKey(signerAddress).verify(hash(payload), Buffer.from(signedMessage, "base64"));`}
        />
        <P>
          Use a new random nonce each time and accept it once. Some wallets return the signature in another format, so test
          with the wallets you support.
        </P>
      </Section>
    </>
  );
}

function Faq({ q, children }: { q: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-line p-4">
      <p className="text-sm font-semibold text-ink">{q}</p>
      <p className="mt-1 text-sm leading-relaxed text-ink-soft">{children}</p>
    </div>
  );
}
