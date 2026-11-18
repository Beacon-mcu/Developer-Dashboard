import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { CodeBlock, PromptBlock } from "../components/ui";
import { buildPrompt } from "../lib/prompt";

const SECTIONS = [
  { id: "overview", title: "Overview" },
  { id: "build-with-ai", title: "Build with AI" },
  { id: "quick-start", title: "Quick start" },
  { id: "frameworks", title: "React and Next.js" },
  { id: "domains", title: "Domains" },
  { id: "networks", title: "Networks" },
  { id: "signing", title: "Signing" },
  { id: "silent-signing", title: "Silent signing" },
  { id: "wallet-libraries", title: "Wallet libraries" },
  { id: "reference", title: "Options, events and errors" },
  { id: "security", title: "Security" },
  { id: "faq", title: "FAQ" },
];

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
            The same Google account gets the <strong>same wallet address in every app</strong> that uses Beacon. The
            private key is created and used only inside the wallet window, so your app never sees it.
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
            <strong>Requirements:</strong> a modern browser. The package has no dependencies, includes TypeScript types, and
            works as ESM or CommonJS. It is published on npm as{" "}
            <a href="https://www.npmjs.com/package/@beaconmcu/auth" target="_blank" rel="noreferrer" className="underline">
              @beaconmcu/auth
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
              [<C>walletUrl</C>, "https://wallet.beaconmcu.space", "Override for development."],
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
              Yes. One Google account has one wallet, so the same address appears in every app that uses Beacon.
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
      </div>
    </div>
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
