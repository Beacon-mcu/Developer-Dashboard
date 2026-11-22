import { Link } from "react-router-dom";
import { C, Callout, DocPage, FileCode, P, Section, Table } from "../kit";

export function SigningPage() {
  return (
    <DocPage title="Signing" description="Your app never holds a key. The wallet shows what is being signed and the user approves.">
      <Section id="send-xlm" title="Send XLM">
        <FileCode name="example.ts" code={`const { hash } = await beacon.sendPayment({ to: "G...", amount: "10", memo: "thanks" });`} />
        <P>
          The wallet builds the payment, shows it, signs it and submits it. <C>memo</C> is optional (up to 28 bytes). Sending to an
          account that does not exist yet creates it and needs at least 1 XLM.
        </P>
      </Section>

      <Section id="message" title="Sign a message">
        <FileCode name="example.ts" code={`const { signedMessage, signerAddress } = await beacon.signMessage("Hello Stellar");`} />
        <P>The signature is base64 (SEP-53).</P>
      </Section>

      <Section id="transaction" title="Sign a transaction">
        <P>For other assets, trustlines and similar, build the transaction with the Stellar SDK, sign it with Beacon, then submit it.</P>
        <FileCode
          name="example.ts"
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
      </Section>

      <Section id="contract" title="Call a smart contract">
        <P>
          Your app builds and sends the call through an RPC server that you choose. Beacon only signs it. Keep the address in your{" "}
          <C>.env</C>, like the Client ID.
        </P>
        <FileCode
          name=".env"
          code={`VITE_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org`}
          note="The RPC address for the network your app uses. Testnet has a free public one. On mainnet, use your own provider's address."
        />
        <FileCode
          name="example.ts"
          note="Builds the call, has the user sign it in Beacon, then sends it and waits for the result."
          code={`import { Contract, TransactionBuilder, nativeToScVal, rpc } from "@stellar/stellar-sdk";

const network = beacon.getNetwork();
const server = new rpc.Server(import.meta.env.VITE_SOROBAN_RPC_URL);
const account = await server.getAccount(address);

const tx = new TransactionBuilder(account, { fee: "100", networkPassphrase: network.passphrase })
  .addOperation(new Contract("C...").call("hello", nativeToScVal("world", { type: "symbol" })))
  .setTimeout(60)
  .build();

const prepared = await server.prepareTransaction(tx);
const { signedTxXdr } = await beacon.signTransaction(prepared.toXDR());

const sent = await server.sendTransaction(TransactionBuilder.fromXDR(signedTxXdr, network.passphrase));
if (sent.status === "ERROR") throw new Error("Rejected");

let result = await server.getTransaction(sent.hash);
for (let i = 0; i < 30 && result.status === "NOT_FOUND"; i++) {
  await new Promise((r) => setTimeout(r, 1000));
  result = await server.getTransaction(sent.hash);
}`}
        />
        <P>
          <C>result.status</C> ends as <C>SUCCESS</C> or <C>FAILED</C>. Still <C>NOT_FOUND</C> means the result is unknown, so check
          again later.
        </P>
      </Section>

      <Section id="auth-entry" title="Sign an authorization entry">
        <FileCode name="example.ts" code={`const { signedAuthEntry } = await beacon.signAuthEntry(preimageBase64);`} />
      </Section>
    </DocPage>
  );
}

export function BackupPage() {
  return (
    <DocPage title="Back up the key" description="Let users save their secret key so they can use the wallet in any Stellar app.">
      <Section id="usage" title="Usage">
        <FileCode name="example.tsx" code={`<button onClick={() => beacon.exportWallet()}>Back up key</button>`} />
        <P>
          The key appears only inside the Beacon window, after the user confirms it is them: Google or passkey sign-in again, or a
          code sent to their email. Your app never receives it. Needs <C>@beaconmcu/auth</C> 0.1.13 or newer.
        </P>
      </Section>

      <Section id="results" title="Results">
        <Table
          head={["Result", "Meaning"]}
          rows={[
            [<C key="a">{"{ revealed: true }"}</C>, "The user saw their key."],
            [<C key="b">-4</C>, "The user closed the window."],
            [<C key="c">-6</C>, "An external wallet. It keeps its own key, so hide the button for those users."],
          ]}
        />
        <Callout>Always give signed-in users a way to back up their key. A lost passkey or account means a lost wallet.</Callout>
      </Section>
    </DocPage>
  );
}

export function NetworksPage() {
  return (
    <DocPage title="Networks" description="Stellar testnet has free test XLM. Mainnet is real money.">
      <Section id="choose" title="Choose a network">
        <FileCode
          name="beacon.ts"
          code={`const beacon = new BeaconAuth({
  clientId: import.meta.env.VITE_BEACON_CLIENT_ID,
  defaultNetwork: "testnet",
  supportedNetworks: ["testnet", "mainnet"],
});

await beacon.switchNetwork("mainnet");
beacon.on("networkChanged", (network) => console.log(network));`}
        />
        <P>
          <C>defaultNetwork</C> is used on login. <C>switchNetwork</C> only works between the <C>supportedNetworks</C>. Anything else
          is rejected with code <C>-6</C>.
        </P>
      </Section>

      <Section id="which" title="Which network is used?">
        <P>Each app has a default network in the dashboard (Settings). If your code sets <C>defaultNetwork</C>, the code wins.</P>
        <Table
          head={["Your code", "Dashboard", "The wallet uses"]}
          rows={[
            ["no defaultNetwork", "Mainnet", <strong key="a">Mainnet</strong>],
            ["no defaultNetwork", "Testnet", <strong key="b">Testnet</strong>],
            [<C key="c">defaultNetwork: "testnet"</C>, "Mainnet", <strong key="d">Testnet</strong>],
            [<C key="e">defaultNetwork: "mainnet"</C>, "Testnet", <strong key="f">Mainnet</strong>],
          ]}
        />
        <Callout tone="warn">
          Call <C>getNetwork()</C> after <C>login()</C>. Before sign-in the SDK reports testnet unless your code sets{" "}
          <C>defaultNetwork</C>.
        </Callout>
      </Section>

      <Section id="managed" title="What Beacon manages">
        <P>
          Beacon already knows the network details, so you never type them. <C>beacon.getNetwork()</C> returns them for the active
          network.
        </P>
        <Table
          head={["", "Testnet", "Mainnet"]}
          rows={[
            ["Passphrase", <C key="a">Test SDF Network ; September 2015</C>, <C key="b">Public Global Stellar Network ; September 2015</C>],
            ["Horizon", <C key="c">https://horizon-testnet.stellar.org</C>, <C key="d">https://horizon.stellar.org</C>],
            ["Explorer", <C key="e">https://stellar.expert/explorer/testnet</C>, <C key="f">https://stellar.expert/explorer/public</C>],
            ["Friendbot", <C key="g">https://friendbot.stellar.org</C>, "none"],
          ]}
        />
        <P>
          Horizon is what Beacon uses for payments and balances. The Stellar docs do not list a mainnet Horizon address of their own,
          so use <C>getNetwork().horizonUrl</C> rather than copying it.
        </P>
      </Section>

      <Section id="rpc" title="RPC address (you set this)">
        <P>
          Smart contract calls go through an RPC server. Beacon does not choose one for you: you put the address in your own{" "}
          <C>.env</C>, the same way as the Client ID. See{" "}
          <Link to="/docs/signing" className="text-brand-text hover:underline">
            Signing
          </Link>{" "}
          for the code.
        </P>
        <FileCode
          name=".env (testnet)"
          code={`VITE_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org`}
          note="Stellar runs a free public RPC for testnet."
        />
        <FileCode
          name=".env (mainnet)"
          code={`VITE_SOROBAN_RPC_URL=https://mainnet.sorobanrpc.com`}
          note="Stellar does not run a mainnet RPC. Use a provider's address. This is one of the public ones from the Stellar docs."
        />
        <Table
          head={["Provider", "Public mainnet address"]}
          rows={[
            ["sorobanrpc.com", <C key="a">https://mainnet.sorobanrpc.com</C>],
            ["Gateway", <C key="b">https://soroban-rpc.mainnet.stellar.gateway.fm</C>],
            ["Nodies", <C key="c">https://stellar-soroban-public.nodies.app</C>],
            ["OnFinality", <C key="d">https://stellar.api.onfinality.io/public</C>],
            ["Lightsail", <C key="e">https://rpc.lightsail.network/</C>],
          ]}
        />
        <Callout tone="warn">
          Public addresses can be limited or change. For a live app, take a plan from a provider on{" "}
          <a
            href="https://developers.stellar.org/docs/data/apis/rpc/providers"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline"
          >
            Stellar's RPC providers list
          </a>{" "}
          and keep its address, which may contain a key, in your <C>.env</C>.
        </Callout>
      </Section>

      <Section id="funding" title="Fund a new account">
        <P>A Stellar account exists only after it receives at least 1 XLM. On testnet, Friendbot sends free test XLM.</P>
        <FileCode
          name="example.ts"
          code={`const { friendbotUrl } = beacon.getNetwork();
await fetch(\`\${friendbotUrl}?addr=\${address}\`);`}
        />
        <P>On mainnet, send at least 1 XLM to the user's address.</P>
      </Section>
    </DocPage>
  );
}

export function SilentSigningPage() {
  return (
    <DocPage title="Silent signing" description="Sign low-risk requests without a prompt.">
      <Section id="turn-off" title="Turn the prompt off">
        <FileCode name="beacon.ts" code={`const beacon = new BeaconAuth({ clientId, showWalletUI: false });`} />
        <P>Only low-risk requests are then signed silently:</P>
        <Table
          head={["Signed silently", "Always asks"]}
          rows={[
            [
              "Text messages, and transactions made only of plain XLM payments from the user's own account.",
              "Contract calls, authorization entries, signer or threshold changes, account merges, trusting assets, fee bumps, and anything for another account.",
            ],
          ]}
        />
        <Callout tone="warn">Use it only if you are comfortable with your app moving the user's XLM without asking.</Callout>
      </Section>
    </DocPage>
  );
}

export function WalletLibrariesPage() {
  return (
    <DocPage title="Wallet libraries" description="Beacon speaks the standard Stellar wallet interface (SEP-43).">
      <Section id="interface" title="Use Beacon with other libraries">
        <FileCode
          name="example.ts"
          code={`const wallet = beacon.getWalletInterface();

const { address } = await wallet.getAddress();
const { signedTxXdr } = await wallet.signTransaction(xdr);`}
        />
        <P>
          Each call returns its result, or <C>{"{ error: { code, message } }"}</C>. Libraries such as Stellar Wallets Kit can use it.
        </P>
      </Section>
    </DocPage>
  );
}
