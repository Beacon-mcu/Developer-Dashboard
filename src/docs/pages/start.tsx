import { Link, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { PromptBlock } from "../../components/ui";
import { buildPrompt } from "../../lib/prompt";
import { C, DocPage, FileCode, P, Section, Table } from "../kit";

// Links from before the docs had pages ("/docs#signing", "/docs?tab=external-wallets") still land in the right place.
const OLD_ANCHORS: Record<string, string> = {
  "quick-start": "/docs/react",
  frameworks: "/docs/react",
  signing: "/docs/signing",
  backup: "/docs/backup",
  networks: "/docs/networks",
  domains: "/docs/domains",
  email: "/docs/email",
  passkeys: "/docs/passkeys",
  "external-wallets": "/docs/external-wallets",
  "silent-signing": "/docs/silent-signing",
  "wallet-libraries": "/docs/wallet-libraries",
  reference: "/docs/reference",
  security: "/docs/security",
  faq: "/docs/faq",
  "build-with-ai": "/docs/build-with-ai",
};

export function OverviewPage() {
  const { hash } = useLocation();
  const [params] = useSearchParams();
  const old = params.get("tab") === "external-wallets" ? "external-wallets" : hash.slice(1);
  if (old && OLD_ANCHORS[old]) return <Navigate to={OLD_ANCHORS[old]} replace />;

  return (
    <DocPage
      title="Beacon docs"
      description="Give every user a Stellar wallet that works behind a normal sign-in. No extension, no seed phrase."
    >
      <Section id="how-it-works" title="How it works">
        <Table
          head={["Step", "What happens"]}
          rows={[
            ["1. Login", "Your app opens the Beacon wallet in a secure window."],
            ["2. Sign in", "The user signs in with Google, email, a passkey or a wallet. A wallet is created on their first login."],
            ["3. Sign", "Your app asks the wallet to sign. The user approves inside the wallet."],
          ]}
        />
        <P>
          Every person gets their own wallet in each app, with its own address. The private key is created and used only inside the
          wallet window, so your app never sees it.
        </P>
      </Section>

      <Section id="start" title="Start here">
        <ul className="grid gap-3 sm:grid-cols-2">
          {[
            { to: "/docs/react", title: "React", body: "Install and add login with full files." },
            { to: "/docs/javascript", title: "JavaScript", body: "The same, with no framework." },
            { to: "/docs/build-with-ai", title: "Build with AI", body: "A prompt your AI assistant can use." },
            { to: "/docs/signing", title: "Signing", body: "Send XLM, sign, call contracts." },
          ].map((card) => (
            <li key={card.to}>
              <Link to={card.to} className="block h-full rounded-xl border border-line bg-surface p-4 transition hover:border-line-strong">
                <p className="text-sm font-semibold text-ink">{card.title}</p>
                <p className="mt-1 text-sm text-muted">{card.body}</p>
              </Link>
            </li>
          ))}
        </ul>
        <P>
          Want to try it first? Open an app in the <Link to="/apps" className="text-brand-text hover:underline">dashboard</Link> and
          choose <strong>Playground</strong>.
        </P>
      </Section>
    </DocPage>
  );
}

export function BuildWithAiPage() {
  return (
    <DocPage title="Build with AI" description="Give your AI assistant everything it needs to add Beacon to your app.">
      <Section id="prompt" title="Copy the prompt">
        <P>
          Paste it into Claude, ChatGPT, Cursor or any coding assistant. Replace the line in square brackets with what you want to
          build.
        </P>
        <PromptBlock prompt={buildPrompt({ clientId: "bcn_app_YOUR_CLIENT_ID", network: "testnet" })} />
        <P>Open one of your apps in the dashboard to get the same prompt with its Client ID already filled in.</P>
      </Section>

      <Section id="link" title="Or give it a link">
        <P>An agent that can open links can read the same text as a plain file:</P>
        <FileCode name="url" code="https://dash.beaconmcu.space/llms.txt" />
        <P>
          It will ask you for your Client ID, which you keep in <C>.env</C>.
        </P>
      </Section>
    </DocPage>
  );
}
