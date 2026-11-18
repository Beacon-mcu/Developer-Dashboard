import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/ui";

// Where people can send privacy questions and deletion requests. Fill this in; the contact line is hidden while it is empty.
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

// Public page (no sign-in needed). Keep it true to what the backend stores (backend/schema.sql).
export function Privacy() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Privacy Policy" description={`Last updated ${UPDATED}`} />

      <p className="text-ink-soft">
        Beacon gives people a Stellar wallet behind Google sign-in, and gives developers a dashboard to add that wallet to
        their apps. This page explains what we collect, why, and what we do not do. There are two kinds of people:{" "}
        <strong>developers</strong> who use this dashboard, and <strong>wallet users</strong> who sign in to a developer's
        app with Beacon.
      </p>

      <Section title="What we collect">
        <p>
          <strong>Developers</strong> (this dashboard): your Google account's email address and Google's account ID, the
          apps you create (name, Client ID, network, allowed websites) and when you created them.
        </p>
        <p>
          <strong>Wallet users</strong> (inside an app that uses Beacon): your Google account's email address and Google's
          account ID, your Stellar wallet address, your encrypted wallet key (see below), and which apps you have used
          your wallet with, with the first and last time you did.
        </p>
        <p>
          We receive these from Google when you sign in. We do not receive your Google password, and we do not read your
          Google contacts, mail, files or anything else in your Google account.
        </p>
      </Section>

      <Section title="Your wallet key">
        <p>
          Your wallet's private key is created inside your browser. It is encrypted there before it leaves your device,
          so what we store is only the encrypted copy and your public address. The key is decrypted again in your browser
          when you sign in. The developer's app never sees it, and we never log it.
        </p>
        <p>
          The encryption depends on a secret kept on Beacon's servers, so the service is trusted to protect it. Beacon is
          early software and has not had an independent security audit. There is no recovery option: if you lose access
          to your Google account, you lose access to the wallet. Do not keep more in it than you can afford to lose.
        </p>
      </Section>

      <Section title="Why we use it">
        <ul className="list-disc space-y-1 pl-5">
          <li>To sign you in and give you the same wallet every time and in every app.</li>
          <li>To show developers how many people use their apps, and which addresses they are.</li>
          <li>To keep the service secure and working.</li>
        </ul>
        <p>
          Developers can see the wallet address, email and first and last use of people who signed in to <em>their own</em>{" "}
          apps. They cannot see anyone's key.
        </p>
      </Section>

      <Section title="What we do not do">
        <ul className="list-disc space-y-1 pl-5">
          <li>We do not sell your data.</li>
          <li>We do not show ads, and we do not use advertising trackers.</li>
          <li>We do not share your data with anyone except the services that run Beacon, listed below.</li>
        </ul>
        <p>
          Anything you do on the Stellar network, such as a payment, is public by design and is not something we can
          remove.
        </p>
      </Section>

      <Section title="Storage in your browser">
        <p>
          After you sign in, a short-lived sign-in token (about an hour) is kept in your browser so you do not have to
          sign in again on every page. The wallet keeps it in the tab's session storage, which is cleared when you close
          the tab. The dashboard also remembers your light or dark theme choice. We do not use these for tracking.
        </p>
      </Section>

      <Section title="Who runs it for us">
        <p>
          Beacon runs on <strong>Cloudflare</strong> (the servers and database) and <strong>Vercel</strong> (this
          dashboard's website). Sign-in is provided by <strong>Google</strong>. These providers handle data on our behalf
          under their own privacy terms.
        </p>
      </Section>

      <Section title="How long we keep it">
        <p>
          We keep your information while your account exists. Developers can delete apps in the dashboard. To have your
          information removed entirely, ask us using the contact below.
        </p>
      </Section>

      <Section title="Your choices">
        <p>
          You can ask to see, correct or delete the information we hold about you. Deleting a wallet means its encrypted
          key is removed, and you will no longer be able to use it. Any funds in it would be lost unless you moved them
          first.
        </p>
        {CONTACT_EMAIL && (
          <p>
            Contact:{" "}
            <a className="font-medium text-ink underline" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
          </p>
        )}
      </Section>

      <Section title="Children">
        <p>Beacon is not meant for children under 13, and we do not knowingly collect their information.</p>
      </Section>

      <Section title="Changes">
        <p>If this policy changes we will update the date at the top of the page.</p>
      </Section>

      <p className="mt-10 text-sm text-muted">
        <Link to="/docs" className="underline">
          Back to the docs
        </Link>
      </p>
    </div>
  );
}
