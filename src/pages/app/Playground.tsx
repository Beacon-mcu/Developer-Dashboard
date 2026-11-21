import "../../lib/polyfills"; // must stay first: Stellar needs a global Buffer
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { NETWORKS, type NetworkId } from "@beaconmcu/auth";
import { EventLog } from "../../components/playground/EventLog";
import { explain } from "../../components/playground/explain";
import { usePlayground, WALLET_ADDRESS } from "../../components/playground/usePlayground";
import { Button, Card, CodeBlock, CopyButton, ErrorNote, Field, inputClass, PageHeader, SuccessNote, WarnNote } from "../../components/ui";
import {
  fetchBalance,
  fundWithFriendbot,
  isStellarAddress,
  trimAmount,
  verifyMessageSignature,
} from "../../lib/stellarTools";
import { appsCache } from "../../lib/cache";
import { useApp } from "./AppLayout";

const AMOUNT = /^\d+(\.\d{1,7})?$/;

// Try the Beacon SDK live, with this app's Client ID: log in, switch network, sign and send. The SDK is built
// exactly the way a developer's own app would build it, and the right-hand log shows what it does.
export default function Playground() {
  const { app } = useApp();
  const [silent, setSilent] = useState(false);
  const { beacon, address, network, logs, clearLogs, log, call } = usePlayground(app.client_id, app.network, silent);
  const net = NETWORKS[network];

  // The balance follows the address and the network.
  const [balance, setBalance] = useState<string | null | undefined>(undefined);
  const [balanceFailed, setBalanceFailed] = useState(false);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!address) return setBalance(undefined);
    setBalance(undefined);
    setBalanceFailed(false);
    fetchBalance(net.horizonUrl, address)
      .then(setBalance)
      .catch(() => setBalanceFailed(true));
  }, [address, net.horizonUrl, tick]);
  const refresh = () => setTick((t) => t + 1);

  return (
    <>
      <PageHeader
        title="Playground"
        description={
          <>
            Try the SDK live with this app's Client ID. Everything here is the real wallet:{" "}
            <code className="font-mono text-xs">{WALLET_ADDRESS}</code>
          </>
        }
      />

      <div className="mb-6">
        <WarnNote>
          Signing in here is a real login: you become one of this app's users (you'll see yourself under Users).
          {app.network === "mainnet" ? " This app's default network is Mainnet, which uses real XLM." : ""}
        </WarnNote>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,1fr)_28rem]">
        <div className="min-w-0 space-y-6">
          <Connection
            address={address}
            network={network}
            balance={balance}
            balanceFailed={balanceFailed}
            ready={!!beacon}
            silent={silent}
            onSilent={setSilent}
            onRefresh={refresh}
            onLogin={() => call("beacon.login()", (b) => b.login())}
            onLogout={() => call("beacon.logout()", (b) => b.logout())}
            onExport={() => call("beacon.exportWallet()", (b) => b.exportWallet())}
            onSwitch={(id) => call(`beacon.switchNetwork("${id}")`, (b) => b.switchNetwork(id))}
            onFund={async () => {
              if (!net.friendbotUrl || !address) return;
              log("call", "Friendbot: fund this account with test XLM");
              await fundWithFriendbot(net.friendbotUrl, address);
              log("ok", "Friendbot funded the account");
              refresh();
            }}
            appSlug={appsCache.slug(app)}
          />

          {address && (
            <div className="grid grid-cols-[minmax(0,1fr)] gap-6 2xl:grid-cols-[repeat(2,minmax(0,1fr))]">
              <SignMessage address={address} call={call} />
              <SendPayment network={network} balance={balance} call={call} onSent={refresh} />
            </div>
          )}
        </div>

        <div className="xl:sticky xl:top-20 xl:self-start">
          <EventLog logs={logs} onClear={clearLogs} />
        </div>
      </div>
    </>
  );
}

type Call = ReturnType<typeof usePlayground>["call"];

// ---- connection: log in, address, network, balance ----

function Connection(props: {
  address: string | null;
  network: NetworkId;
  balance: string | null | undefined;
  balanceFailed: boolean;
  ready: boolean;
  silent: boolean;
  appSlug: string;
  onSilent: (value: boolean) => void;
  onRefresh: () => void;
  onLogin: () => Promise<unknown>;
  onLogout: () => Promise<unknown>;
  onExport: () => Promise<unknown>;
  onSwitch: (id: NetworkId) => Promise<unknown>;
  onFund: () => Promise<void>;
}) {
  const { address, network, balance, balanceFailed } = props;
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"login" | "fund" | null>(null);
  const net = NETWORKS[network];

  const run = async (kind: "login" | "fund" | null, fn: () => Promise<unknown>) => {
    setError(null);
    setBusy(kind);
    try {
      await fn();
    } catch (e) {
      const { message, cancelled } = explain(e);
      if (!cancelled) setError(message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card title="Connection" subtitle={address ? "Signed in. This is the user's wallet." : "Log in to create or open a wallet."}>
      {!address ? (
        <>
          <div className="rounded-lg bg-subtle p-4 text-sm text-ink-soft">
            Click <strong>Log in</strong>. The Beacon wallet opens, the user picks a Google account, and a Stellar wallet is
            created on the first login.
          </div>
          {error && (
            <ErrorNote>
              {error}
              {/did not load/i.test(error) && (
                <>
                  {" "}
                  Check that <code className="font-mono">{WALLET_ADDRESS}</code> opens in a new tab. If it does not, set{" "}
                  <code className="font-mono">VITE_WALLET_URL</code> and restart. Otherwise check this app's{" "}
                  <Link to={`/apps/${props.appSlug}/domains`} className="font-medium underline">
                    Domains
                  </Link>
                  .
                </>
              )}
            </ErrorNote>
          )}
          <Button onClick={() => run("login", props.onLogin)} disabled={!props.ready || busy === "login"}>
            {busy === "login" ? "Waiting for the wallet…" : "Log in"}
          </Button>
          <CodeBlock language="ts" code={`const { address } = await beacon.login();`} />
        </>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <code className="min-w-0 flex-1 break-all rounded-lg bg-subtle px-3 py-2.5 font-mono text-xs text-ink">{address}</code>
            <CopyButton text={address} />
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-muted">Balance on {net.name}</p>
              <p className="text-3xl font-semibold tracking-tight text-ink">
                {balanceFailed ? "unavailable" : balance === null ? "0" : balance === undefined ? "…" : trimAmount(balance)}{" "}
                <span className="text-lg text-muted">XLM</span>
              </p>
            </div>
            <div className="flex gap-2">
              {(["testnet", "mainnet"] as const).map((id) => (
                <button
                  key={id}
                  onClick={() => run(null, () => props.onSwitch(id))}
                  aria-pressed={id === network}
                  className={`min-h-10 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                    id === network
                      ? "border-brand bg-brand-soft text-brand-text"
                      : "border-line-strong bg-surface text-ink-soft hover:bg-subtle"
                  }`}
                >
                  {id === "testnet" ? "Testnet" : "Mainnet"}
                </button>
              ))}
            </div>
          </div>

          {network === "mainnet" && <WarnNote>Mainnet uses real XLM. Transactions cannot be undone.</WarnNote>}

          {balance === null && (
            <div className="space-y-2 rounded-lg border border-line bg-subtle p-4 text-sm text-ink-soft">
              <p>
                This account does not exist on {net.name} yet. A Stellar account is created when it first receives at least
                1 XLM.
              </p>
              {net.friendbotUrl ? (
                <Button onClick={() => run("fund", props.onFund)} disabled={busy === "fund"}>
                  {busy === "fund" ? "Funding…" : "Get free test XLM"}
                </Button>
              ) : (
                <p>Send at least 1 XLM to the address above to activate it.</p>
              )}
            </div>
          )}

          {error && <ErrorNote>{error}</ErrorNote>}

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="ghost" onClick={props.onRefresh}>
              Refresh balance
            </Button>
            <Button variant="ghost" onClick={() => run(null, props.onExport)}>
              Back up key
            </Button>
            <Button variant="ghost" onClick={() => run(null, props.onLogout)}>
              Log out
            </Button>
          </div>

          <label className="flex items-start gap-3 rounded-lg border border-line p-3 text-sm">
            <input
              type="checkbox"
              checked={props.silent}
              onChange={(e) => props.onSilent(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[var(--brand)]"
            />
            <span>
              <span className="font-medium text-ink">Skip the confirmation screen for low-risk requests</span>
              <span className="mt-0.5 block text-muted">
                <code className="font-mono">showWalletUI: false</code>. Plain messages and XLM payments are signed without a
                prompt. Anything risky still asks.
              </span>
            </span>
          </label>

          <CodeBlock
            language="ts"
            code={`await beacon.switchNetwork("${network === "testnet" ? "mainnet" : "testnet"}");
beacon.getNetwork(); // → { id: "${network}", passphrase, horizonUrl, ... }`}
          />
        </>
      )}
    </Card>
  );
}

// ---- sign a message ----

function SignMessage({ address, call }: { address: string; call: Call }) {
  const [message, setMessage] = useState("Hello from Beacon!");
  const [busy, setBusy] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [valid, setValid] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sign = async () => {
    setBusy(true);
    setError(null);
    setSignature(null);
    setValid(null);
    try {
      const { signedMessage, signerAddress } = await call(`beacon.signMessage("${message.slice(0, 30)}")`, (b) =>
        b.signMessage(message),
      );
      setSignature(signedMessage);
      setValid(signerAddress === address && verifyMessageSignature(address, message, signedMessage));
    } catch (e) {
      const { message: text, cancelled } = explain(e);
      if (!cancelled) setError(text);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title="Sign a message" subtitle="Prove the user owns this wallet. Nothing is sent to the network.">
      <Field label="Message">
        <input className={inputClass} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} />
      </Field>
      <Button onClick={sign} disabled={busy || !message}>
        {busy ? "Waiting for approval…" : "Sign message"}
      </Button>
      {error && <ErrorNote>{error}</ErrorNote>}
      {signature && (
        <>
          <p className="break-all rounded-lg bg-subtle p-3 font-mono text-xs text-ink-soft">{signature}</p>
          {valid === true && <SuccessNote>Valid ✓ The signature was made by this wallet.</SuccessNote>}
          {valid === false && <ErrorNote>The signature does not match this address.</ErrorNote>}
        </>
      )}
      <CodeBlock language="ts" code={`const { signedMessage } = await beacon.signMessage(${JSON.stringify(message)});`} />
    </Card>
  );
}

// ---- send XLM ----

function SendPayment({
  network,
  balance,
  call,
  onSent,
}: {
  network: NetworkId;
  balance: string | null | undefined;
  call: Call;
  onSent: () => void;
}) {
  const net = NETWORKS[network];
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [busy, setBusy] = useState(false);
  const [hash, setHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    setError(null);
    setHash(null);
    const destination = to.trim();
    if (!isStellarAddress(destination)) return setError("Enter a valid Stellar address (it starts with G).");
    if (!AMOUNT.test(amount.trim()) || Number(amount) <= 0) return setError("Enter an amount like 1.5 (at most 7 decimals).");
    if (typeof balance === "string" && Number(amount) + 1 > Number(balance)) {
      return setError("That is more than you can send. An account must keep a 1 XLM reserve.");
    }

    setBusy(true);
    try {
      const payment = { to: destination, amount: amount.trim(), ...(memo.trim() && { memo: memo.trim() }) };
      const result = await call(`beacon.sendPayment(${JSON.stringify(payment)})`, (b) => b.sendPayment(payment));
      setHash(result.hash);
      onSent();
    } catch (e) {
      const { message, cancelled } = explain(e);
      if (!cancelled) setError(message);
    } finally {
      setBusy(false);
    }
  };

  const codeArgs = `{ to: ${JSON.stringify(to || "G...")}, amount: ${JSON.stringify(amount || "10")}${memo.trim() ? `, memo: ${JSON.stringify(memo.trim())}` : ""} }`;

  return (
    <Card title="Send XLM" subtitle={`On ${net.name}. The wallet builds, shows, signs and submits the payment.`}>
      <Field label="To">
        <input className={inputClass} value={to} onChange={(e) => setTo(e.target.value)} placeholder="G…" spellCheck={false} />
      </Field>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-[repeat(2,minmax(0,1fr))]">
        <Field label="Amount (XLM)">
          <input className={inputClass} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1.5" inputMode="decimal" />
        </Field>
        <Field label="Memo (optional)">
          <input className={inputClass} value={memo} onChange={(e) => setMemo(e.target.value)} maxLength={28} placeholder="up to 28 characters" />
        </Field>
      </div>
      <Button onClick={send} disabled={busy || !to || !amount}>
        {busy ? "Waiting for approval…" : "Send"}
      </Button>
      {error && <ErrorNote>{error}</ErrorNote>}
      {hash && (
        <SuccessNote>
          Confirmed ✓{" "}
          <a href={`${net.explorerUrl}/tx/${hash}`} target="_blank" rel="noreferrer" className="font-mono underline">
            {hash.slice(0, 8)}…{hash.slice(-8)}
          </a>
        </SuccessNote>
      )}
      <CodeBlock language="ts" code={`const { hash } = await beacon.sendPayment(${codeArgs});`} />
    </Card>
  );
}
