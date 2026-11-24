import { C, DocPage, Faq, H3, P, Section, Table } from "../kit";

export function DomainsPage() {
  return (
    <DocPage title="Domains" description="Only sites you allow can open the wallet for your app.">
      <Section id="allowed" title="Allowed sites">
        <Table
          head={["Where your app runs", "What to do"]}
          rows={[
            [
              <>
                <C>http://localhost:3000</C>, <C>127.0.0.1</C> (any port)
              </>,
              "Nothing for testnet. For mainnet, add that exact address (for example http://localhost:3000) under Domains.",
            ],
            [
              <C key="a">https://myapp.com</C>,
              <>
                Add it under <strong>Domains</strong> on your app's page before you launch.
              </>,
            ],
          ]}
        />
        <P>
          Enter just the address, like <C>https://myapp.com</C>, with no path. Use https (http only works for localhost). You can add up to
          10. If users see "This site isn't authorized for this app", the address is missing from the list.
        </P>
      </Section>
    </DocPage>
  );
}

export function ReferencePage() {
  return (
    <DocPage title="API reference" description="Options, methods, events and errors of @beaconmcu/auth.">
      <Section id="options" title="Options">
        <Table
          head={["Option", "Default", "What it does"]}
          rows={[
            [<C key="1">clientId</C>, "required", "Your app's Client ID from the dashboard."],
            [<C key="2">defaultNetwork</C>, "the dashboard's network", <>"testnet" or "mainnet", used on login.</>],
            [<C key="3">supportedNetworks</C>, "just the default", <>Networks <C>switchNetwork</C> may use.</>],
            [<C key="4">showWalletUI</C>, "true", "false signs low-risk requests without a prompt."],
            [<C key="5">walletUrl</C>, "built in", "Only to test a different wallet. Must be https (http only for localhost)."],
          ]}
        />
      </Section>

      <Section id="methods" title="Methods">
        <Table
          head={["Method", "Returns"]}
          rows={[
            [<C key="1">login()</C>, <><C>{"{ address, network, provider }"}</C>. Opens the wallet and signs the user in. <C>network</C> is the one the wallet is on. <C>provider</C> is <C>"beacon"</C> or <C>"external"</C>. The address is not proof of who someone is: see Verify an address.</>],
            [<C key="2">logout()</C>, "Signs the user out."],
            [<C key="3">switchNetwork(network)</C>, "Switches to another supported network."],
            [<C key="4">sendPayment({"{ to, amount, memo? }"})</C>, <><C>{"{ hash }"}</C>. Builds, signs and submits an XLM payment.</>],
            [<C key="5">signMessage(message)</C>, <C>{"{ signedMessage, signerAddress }"}</C>],
            [<C key="6">signTransaction(xdr)</C>, <C>{"{ signedTxXdr, signerAddress }"}</C>],
            [<C key="7">signAuthEntry(preimage)</C>, <C>{"{ signedAuthEntry, signerAddress }"}</C>],
            [<C key="8">exportWallet()</C>, <><C>{"{ revealed: true }"}</C>. Shows the user their secret key.</>],
            [<><C>getAddress()</C> <C>getNetwork()</C></>, "The current address (or null) and network."],
            [<C key="9">getWalletInterface()</C>, "The SEP-43 wallet shape."],
            [<C key="10">on(event, callback)</C>, "Subscribes. Returns a function that unsubscribes."],
            [<C key="11">destroy()</C>, "Removes the wallet from the page."],
          ]}
        />
      </Section>

      <Section id="events" title="Events">
        <Table
          head={["Event", "When", "Value"]}
          rows={[
            [<C key="1">connect</C>, "The user signed in, or was signed back in after a refresh.", <C key="a">{"{ address, network }"}</C>],
            [<C key="2">disconnect</C>, "The user signed out.", "none"],
            [<C key="3">accountChanged</C>, "The address changed, or the user signed out.", <><C>string</C> or <C>null</C></>],
            [<C key="4">networkChanged</C>, "The active network changed.", <C key="b">"testnet" | "mainnet"</C>],
          ]}
        />
      </Section>

      <Section id="errors" title="Errors">
        <P>
          Errors are <C>BeaconError</C> objects with a numeric <C>code</C>, following the Stellar wallet standard.
        </P>
        <Table
          head={["Code", "Meaning"]}
          rows={[
            [<C key="1">-1</C>, "Internal wallet error."],
            [<C key="2">-2</C>, "An outside service (the network) failed."],
            [<C key="3">-3</C>, "Invalid request: bad parameters, malformed transaction, or wrong network."],
            [<C key="4">-4</C>, "The user rejected the request. Do not retry automatically."],
            [<C key="5">-5</C>, "Not connected. Call login() first."],
            [<C key="6">-6</C>, "Not supported, for example a network you did not list."],
            [<C key="7">-7</C>, "Another request is already waiting for the user."],
            [<C key="8">-8</C>, "A payment was sent but the result is not known. Look up error.hash before sending it again."],
            [<C key="9">-9</C>, "The wallet did not answer in time. The request was cancelled."],
          ]}
        />
      </Section>
    </DocPage>
  );
}

export function SecurityPage() {
  return (
    <DocPage title="Security" description="How Beacon keeps keys and sessions safe.">
      <Section id="keys" title="Keys">
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-soft">
          <li>
            <strong>The private key never leaves the wallet window.</strong> It is created, unlocked and used only on the wallet's own
            domain. The Beacon package contains no keys.
          </li>
          <li>
            <strong>One wallet per person per app.</strong> An app can only reach the wallet made for it, never one from another app.
          </li>
          <li>
            <strong>The server stores an encrypted copy of the key.</strong> The unlocked key lives in the wallet window's memory only.
          </li>
          <li>
            <strong>New wallets have a two-part lock.</strong> One part comes from Beacon's backend (a master key held in AWS Key
            Management Service). The other is a secret that stays in the user's browser and is never sent to Beacon, so the backend
            alone cannot unlock the wallet. The wallet then opens only in the browser that created it. If the user clears that
            browser's data or switches device, only the secret key saved with <C>exportWallet()</C> gets them back in, so
            tell your users to use your Back up key button.
          </li>
          <li>
            <strong>Older wallets are still custodial.</strong> Wallets made before the two-part lock are locked by Beacon's backend
            alone, so someone who took control of it could unlock them. Beacon has not had an independent security audit. Do not
            describe Beacon wallets as non-custodial to your own users.
          </li>
        </ul>
      </Section>

      <Section id="sites" title="Sites and sessions">
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-soft">
          <li>
            <strong>Your site and the wallet talk only through messages</strong>, and both sides check who sent them.
          </li>
          <li>
            <strong>Only your allowed domains can open the wallet</strong> for your app, plus localhost for development (testnet only, unless you list it).
          </li>
          <li>
            <strong>The sign-in session</strong> (one hour, two hours for email) is kept in the wallet's own tab storage so a refresh
            keeps the user signed in. It is cleared on logout.
          </li>
          <li>
            <strong>Nothing risky is signed silently.</strong> Even with the prompt off, contract calls and account changes always ask.
          </li>
        </ul>
      </Section>

      <Section id="more" title="Good to know">
        <H3>Backing up</H3>
        <P>Show a "Back up key" button. A key shown inside the Beacon window is never sent to your app.</P>
      </Section>
    </DocPage>
  );
}

export function FaqPage() {
  return (
    <DocPage title="FAQ">
      <div className="space-y-4">
        <Faq q="Users see “This site isn't authorized for this app”.">
          The site's address is not in your app's Domains list. Add it in the dashboard. Localhost works on testnet without adding it; list it only to use mainnet from your own machine.
        </Faq>
        <Faq q="Do I have to set up Google credentials?">No. Beacon runs the Google sign-in for every app. You only need a Client ID.</Faq>
        <Faq q="Is the wallet address the same across apps?">
          No. A person signs in once, but each app gets a separate wallet with its own address and key.
        </Faq>
        <Faq q="Why does the balance show 0 or “not activated”?">
          A Stellar account must receive at least 1 XLM before it exists. Fund it with Friendbot on testnet.
        </Faq>
        <Faq q="Does a page refresh log the user out?">
          No. The wallet keeps the session (one hour, two hours for email) for that browser tab. After that, or after logout, they sign
          in again.
        </Faq>
      </div>
    </DocPage>
  );
}
