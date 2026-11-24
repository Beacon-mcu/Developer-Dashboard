import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/ui";

// Where people can reach Beacon. Fill this in; the contact line is hidden while it is empty.
const CONTACT_EMAIL = "";

const UPDATED = "18 November 2026";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <div className="mt-2 space-y-3 text-ink-soft">{children}</div>
    </section>
  );
}

// Public page (no sign-in needed). Plain-language draft: have it checked by a lawyer before relying on it.
export function Terms() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Terms of Service" description={`Last updated ${UPDATED}`} />

      <p className="text-ink-soft">
        These terms apply when you use the Beacon dashboard, the Beacon SDK (<code>@beaconmcu/auth</code>) or the Beacon
        wallet. By using them you agree to these terms. If you do not agree, please do not use Beacon.
      </p>

      <Section title="What Beacon is">
        <p>
          Beacon lets people sign in with Google and get a Stellar wallet, and lets developers add that wallet to their
          apps. Beacon is early software, offered as it is.
        </p>
      </Section>

      <Section title="Your account">
        <ul className="list-disc space-y-1 pl-5">
          <li>You sign in with a Google account. You are responsible for keeping it secure.</li>
          <li>Your wallet is tied to that Google account. Anyone who can sign in to it can use the wallet.</li>
          <li>You must give correct information and be old enough to use these services under the law where you live.</li>
        </ul>
      </Section>

      <Section title="Your money, your responsibility">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>There is no recovery.</strong> If you lose access to your Google account, you lose access to your
            wallet and anything in it. Beacon cannot restore it.
          </li>
          <li>
            Transactions on the Stellar network are final. We cannot reverse, cancel or refund them, and we are not a
            bank or a financial institution.
          </li>
          <li>
            Beacon has not had an independent security audit. Keep only what you can afford to lose, and use testnet
            while learning.
          </li>
          <li>Mainnet uses real money. Check every approval screen before you confirm it.</li>
        </ul>
      </Section>

      <Section title="For developers">
        <ul className="list-disc space-y-1 pl-5">
          <li>You are responsible for your app, how it uses Beacon and what it asks your users to approve.</li>
          <li>
            Do not use Beacon to deceive users, to steal or trick people into approving transactions, or to break the law.
          </li>
          <li>
            Only list websites you control under Domains. Keep your Client ID's allowed sites accurate. You are
            responsible for what happens on them.
          </li>
          <li>Tell your own users what you collect and why. Beacon's privacy policy covers Beacon, not your app.</li>
          <li>Do not try to break, overload or get around Beacon's limits, security or other people's apps.</li>
        </ul>
      </Section>

      <Section title="Things you may not do">
        <ul className="list-disc space-y-1 pl-5">
          <li>Use Beacon for anything illegal, including fraud, money laundering or sanctions evasion.</li>
          <li>Try to access wallets, keys or data that are not yours, or probe Beacon for weaknesses without permission.</li>
          <li>Send spam, malware or harmful content through Beacon.</li>
        </ul>
        <p>If you find a security problem, please tell us instead of using it.</p>
      </Section>

      <Section title="Stopping or suspending access">
        <p>
          You can stop using Beacon at any time. We may suspend or remove an app or account that breaks these terms or
          puts users at risk. We may also change or end parts of the service. If we can, we will give notice first.
        </p>
      </Section>

      <Section title="No promises, and limits on our responsibility">
        <p>
          Beacon is provided "as is" and "as available". We do not promise that it will always work, be secure or be free
          of mistakes. Networks and third parties we depend on, such as Stellar, Google, Cloudflare, Amazon Web Services (which holds the key service for wallets), Vercel, Resend and Bachs, can fail
          or change.
        </p>
        <p>
          To the fullest extent the law allows, Beacon is not responsible for lost funds, lost access, lost profits or
          other indirect damages that come from using the service, including a loss caused by a developer's app. Nothing
          here limits anything the law does not allow us to limit.
        </p>
      </Section>

      <Section title="Privacy">
        <p>
          How we handle your information is explained in our{" "}
          <Link to="/privacy" className="font-medium text-ink underline">
            Privacy Policy
          </Link>
          .
        </p>
      </Section>

      <Section title="Changes">
        <p>
          We may update these terms. If we do, we will change the date at the top. Continuing to use Beacon after a change
          means you accept the new terms.
        </p>
      </Section>

      {CONTACT_EMAIL && (
        <Section title="Contact">
          <p>
            <a className="font-medium text-ink underline" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
          </p>
        </Section>
      )}

      <p className="mt-10 text-sm text-muted">
        <Link to="/docs" className="underline">
          Back to the docs
        </Link>
      </p>
    </div>
  );
}
