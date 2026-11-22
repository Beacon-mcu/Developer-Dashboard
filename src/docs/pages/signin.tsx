import { Link } from "react-router-dom";
import { C, DocPage, FileCode, P, Section, Table } from "../kit";

const WALLETS_APP = `import { useState } from "react";
import { BeaconError } from "@beaconmcu/auth";
import { beacon } from "./lib/beacon";
import { useBeacon } from "./hooks/useBeacon";

export default function App() {
  const { address, login, logout } = useBeacon();
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("1");
  const [result, setResult] = useState("");

  async function run(action: () => Promise<unknown>) {
    try {
      setResult(JSON.stringify(await action()));
    } catch (e) {
      if (!(e instanceof BeaconError)) throw e;
      if (e.code === -4 || e.code === -7) return;
      setResult(e.message);
    }
  }

  if (!address) return <button onClick={login}>Log in</button>;

  return (
    <div>
      <p>{address}</p>

      <input placeholder="To (G...)" value={to} onChange={(e) => setTo(e.target.value)} />
      <input value={amount} onChange={(e) => setAmount(e.target.value)} />
      <button onClick={() => run(() => beacon.sendPayment({ to, amount }))}>Send XLM</button>

      <button onClick={() => run(() => beacon.signMessage("Hello Stellar"))}>Sign message</button>
      <button onClick={() => run(() => beacon.exportWallet())}>Back up key</button>
      <button onClick={logout}>Log out</button>

      <p>{result}</p>
    </div>
  );
}`;

const VERIFY_SERVER = `import express from "express";
import { randomBytes } from "node:crypto";
import { Keypair, hash } from "@stellar/stellar-sdk";

const app = express();
app.use(express.json());

const nonces = new Set<string>();

app.get("/api/nonce", (_req, res) => {
  const nonce = randomBytes(16).toString("hex");
  nonces.add(nonce);
  setTimeout(() => nonces.delete(nonce), 5 * 60_000);
  res.json({ nonce });
});

app.post("/api/verify", (req, res) => {
  const { nonce, address, signedMessage } = req.body;
  if (!nonces.delete(nonce)) return res.status(400).json({ ok: false });

  const payload = Buffer.concat([Buffer.from("Stellar Signed Message:\\n"), Buffer.from(nonce)]);
  try {
    const ok = Keypair.fromPublicKey(address).verify(hash(payload), Buffer.from(signedMessage, "base64"));
    res.json({ ok });
  } catch {
    res.json({ ok: false });
  }
});

app.listen(3001);`;

const VERIFY_CLIENT = `import { beacon } from "./lib/beacon";

export async function proveAddress(): Promise<boolean> {
  const { nonce } = await fetch("/api/nonce").then((r) => r.json());
  const { signedMessage, signerAddress } = await beacon.signMessage(nonce);

  const res = await fetch("/api/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nonce, address: signerAddress, signedMessage }),
  });
  return (await res.json()).ok;
}`;

export function EmailPage() {
  return (
    <DocPage title="Email" description="Sign in with a 6-digit code sent to the user's email.">
      <Section id="turn-on" title="Turn it on">
        <P>
          In the dashboard, open your app, go to <strong>Authentication</strong> and switch on <strong>Email</strong>. Your code does
          not change, and any SDK version works.
        </P>
      </Section>

      <Section id="details" title="Details">
        <Table
          head={["", "With email"]}
          rows={[
            ["Wallet", "A normal Stellar wallet (G… address). Every feature works."],
            ["Users", "They appear in your Users list and monthly active users, with their email."],
            ["The code", "6 digits, valid for 10 minutes, works once. Five wrong tries cancel it."],
            ["Session", "Two hours."],
            ["Separate from Google", "The same email with Google gives a different wallet."],
          ]}
        />
      </Section>
    </DocPage>
  );
}

export function PasskeysPage() {
  return (
    <DocPage title="Passkeys" description="Sign in with a fingerprint, face or screen lock.">
      <Section id="turn-on" title="Turn it on">
        <P>
          In the dashboard, open your app, go to <strong>Authentication</strong> and switch on <strong>Passkeys</strong>. Your code
          does not change, and any SDK version works.
        </P>
      </Section>

      <Section id="details" title="Details">
        <Table
          head={["", "With a passkey"]}
          rows={[
            ["Wallet", "A normal Stellar wallet (G… address). Every feature works."],
            ["Users", "They appear in your Users list and monthly active users. They have no email."],
            ["Separate from Google", "A passkey and a Google account give different wallets."],
            ["Keeping it safe", "The passkey lives on the user's device or in their password manager. Losing every copy loses the wallet. Tell users to back up their key."],
          ]}
        />
      </Section>
    </DocPage>
  );
}

export function ExternalWalletsPage() {
  return (
    <DocPage title="External wallets" description="Let people sign in with Freighter, xBull, LOBSTR, Hana, Albedo or Rabet.">
      <Section id="turn-on" title="Turn it on">
        <P>
          In the dashboard, open your app, go to <strong>Authentication</strong> and switch on <strong>External wallets</strong>. Needs{" "}
          <C>@beaconmcu/auth</C> 0.1.12 or newer. Your code does not change: the sign-in window lists the wallets.
        </P>
      </Section>

      <Section id="code" title="Code">
        <P>
          Uses <C>beacon.ts</C> and <C>useBeacon.ts</C> from the{" "}
          <Link to="/docs/react" className="text-brand-text hover:underline">
            React page
          </Link>
          .
        </P>
        <FileCode
          name="src/App.tsx"
          code={WALLETS_APP}
          note="Logs in, then sends XLM, signs a message and backs up the key, ignoring a cancel and showing any other error."
        />
        <P>
          Back up key shows a message for external wallets (code <C>-6</C>), because they keep their own key. Smart contract calls
          work with <C>signTransaction</C>, as in{" "}
          <Link to="/docs/signing" className="text-brand-text hover:underline">
            Signing
          </Link>
          .
        </P>
      </Section>

      <Section id="differences" title="What is different">
        <Table
          head={["", "External wallet"]}
          rows={[
            ["Keys", "The user keeps their own keys. Each action is approved in their wallet."],
            ["Works", "login, logout, sendPayment, signTransaction, signMessage, signAuthEntry, switchNetwork."],
            ["Silent signing", <><C>showWalletUI: false</C> does not apply.</>],
            ["Users and billing", "Not in your Users list or your monthly active users."],
            ["Page reload", "The user connects their wallet again."],
            ["Back up key", "Rejects with code -6. The wallet keeps its own key."],
            ["signMessage", "The signature format is up to the wallet."],
          ]}
        />
      </Section>

      <Section id="verify" title="Verify an address">
        <P>
          Beacon does not verify an external wallet's address on its servers. To log someone in to your own backend, have them sign a
          one-time text and check it there (SEP-53). Each nonce works once.
        </P>
        <FileCode name="server.ts" code={VERIFY_SERVER} note="Issues a one-time nonce and checks the signed message against the address." />
        <FileCode name="src/verify.ts" code={VERIFY_CLIENT} note="Asks the server for a nonce, has the wallet sign it, and sends the result back." />
        <P>Test with the wallets you support, as signature formats can differ.</P>
      </Section>
    </DocPage>
  );
}
