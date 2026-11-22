import type { Network } from "./api";

// The copy-and-paste prompt for AI coding assistants (Claude, ChatGPT, Cursor, ...).
// It is a complete, self-contained description of Beacon's SDK, so an assistant can build a working app from it.
// Keep it in step with the SDK (SDK/src/BeaconAuth.ts) and the docs.

export function buildPrompt({ clientId, network }: { clientId: string; network: Network }): string {
  return `You are helping me build a web app that uses Beacon, an embedded Stellar wallet with Google sign-in (and, if the app turns them on, email codes, passkeys or external wallets). Users click "Log in", sign in and instantly get a Stellar wallet. No browser extension and no seed phrase. The private key lives only inside Beacon's wallet window (an iframe), so my app never sees it.

## What I want to build
[DESCRIBE YOUR APP HERE. For example: "a tipping page where visitors log in and send XLM to the creator".]

## My Beacon app
- Client ID: ${clientId}
- Default network: ${network}   ("testnet" = free test XLM, "mainnet" = real money)

## Install
npm install @beaconmcu/auth
(Also install @stellar/stellar-sdk only if I need to build custom transactions.)

## API  (package @beaconmcu/auth: ESM + CommonJS, TypeScript types included. Wallet code for External wallets loads only when that is turned on)

import { BeaconAuth } from "@beaconmcu/auth";

const beacon = new BeaconAuth({
  clientId: "${clientId}",
  defaultNetwork: "${network}",                 // optional. "testnet" or "mainnet". Defaults to the app's dashboard setting.
  supportedNetworks: ["testnet", "mainnet"],   // optional. Networks switchNetwork() may use. Defaults to just the default one.
  showWalletUI: true,                          // optional. false = sign low-risk requests (text messages, plain XLM payments) without a prompt.
  walletUrl: "...",                            // optional. Beacon's wallet is built in, so leave this out.
});

Methods (async unless marked sync):
- login(): Promise<{ address }>   Opens the wallet; the user signs in with Google, or with an external wallet if the app turned External wallets on (see below). address is a Stellar address (starts with G).
- logout(): Promise<void>
- getAddress(): string | null   (sync)
- getNetwork(): { id: "testnet" | "mainnet", name, passphrase, horizonUrl, explorerUrl, friendbotUrl? }   (sync; friendbotUrl exists on testnet only)
- switchNetwork("testnet" | "mainnet"): Promise<void>   Only between supportedNetworks.
- sendPayment({ to, amount, memo? }): Promise<{ hash }>   The wallet builds the XLM payment, asks the user to approve, signs and submits it. amount is a string like "10" or "1.5" (at most 7 decimals). memo is text up to 28 bytes.
- signMessage(message: string): Promise<{ signedMessage, signerAddress }>   signedMessage is a base64 signature (SEP-53).
- signTransaction(xdr, { networkPassphrase?, address? }): Promise<{ signedTxXdr, signerAddress }>   Signs a transaction I built with @stellar/stellar-sdk. I submit it myself (for example with Horizon).
- Smart contract calls: build, simulate (prepareTransaction) and send the call with @stellar/stellar-sdk using new rpc.Server(import.meta.env.VITE_SOROBAN_RPC_URL), and use beacon.signTransaction(prepared.toXDR()) to sign. The developer puts the RPC address in .env (testnet has a free public one, https://soroban-testnet.stellar.org; Stellar runs no mainnet RPC: on mainnet they use a provider's address, for example https://mainnet.sorobanrpc.com for light use). Beacon only signs, it does not need the RPC address.
- signAuthEntry(preimageBase64): Promise<{ signedAuthEntry, signerAddress }>   Soroban authorization entries.
- exportWallet(): Promise<{ revealed: true }>   Shows the user their secret key inside the Beacon window after they sign in again, so they can back it up. The app never receives the key. Rejects with -4 if the user closes it, -6 for external wallets. Needs 0.1.13 or newer.
- getWalletInterface(): the standard Stellar wallet shape (SEP-43) for libraries such as Stellar Wallets Kit.
- on(event, callback): returns a function that unsubscribes. Events: "connect" ({ address, network }), "disconnect", "accountChanged" (address | null), "networkChanged" ("testnet" | "mainnet").
- destroy()

Errors are BeaconError objects with a numeric code: -1 internal, -2 network/service problem, -3 invalid request, -4 user rejected (do not retry, and do not show it as a red error), -5 not connected, -6 not supported, -7 another request is already waiting for the user.

## External wallets (optional)
If External wallets is switched on for the app (dashboard > the app > Authentication), login() shows Google and a list of Stellar wallets (Freighter/Varial, xBull, LOBSTR, Hana, Albedo, Rabet) in one window. The code does not change. Requires @beaconmcu/auth 0.1.12 or newer.
- sendPayment, signTransaction, signMessage, signAuthEntry and switchNetwork all work; the user approves each one in their own wallet. showWalletUI: false does not apply.
- These users are not in the Users list or monthly active users, and they must sign in again after a page reload.
- The address is NOT verified by Beacon's servers. Do not use it to log someone in to my own backend without checking a signed message myself. The format of a signMessage signature depends on the wallet.

## Wallets are per app
Every person gets their own wallet in each app: the same person has a different Stellar address (and key) in each app, and no app can reach a wallet that belongs to another app. A new wallet starts empty and not activated, so the user has to fund it before it can send.

## Email (optional)
If Email is switched on for the app (dashboard > the app > Authentication), login() also offers an email box: the user gets a 6-digit code by email and types it in the same window. The code does not change and any SDK version works. An email user gets a normal Stellar wallet (G... address), counts as a user, and appears in the Users list with their email. The same email with Google gives a different wallet.

## Passkeys (optional)
If Passkeys is switched on for the app (dashboard > the app > Authentication), login() also offers "Continue with a passkey". The code does not change and any SDK version works. A passkey user gets a normal Stellar wallet (G... address), counts as a user, and has no email. A passkey and a Google account are separate sign-ins with separate wallets.

## Rules and gotchas
1. Create ONE BeaconAuth instance for the whole app, in its own module. It is safe to import on the server, but call its methods only from client-side code (event handlers and effects). In Next.js, mark those components "use client".
2. Never handle private keys, seed phrases or secrets, and never ask the user for them. All signing goes through Beacon.
3. A Stellar account only exists after it receives at least 1 XLM, so a brand-new wallet is "not activated" until funded. On testnet, fund it with Friendbot: await fetch(\`\${beacon.getNetwork().friendbotUrl}?addr=\${address}\`). On mainnet the user must receive at least 1 XLM first.
4. An account must keep a 1 XLM reserve, so it cannot send its whole balance. Sending to an account that does not exist yet creates it and needs at least 1 XLM.
5. Read balances from Horizon yourself: GET {horizonUrl}/accounts/{address}. The XLM balance is the entry in balances[] where asset_type === "native". A 404 means the account is not activated yet.
6. Call getNetwork() after login(). Before login it can only report the default, not the network the wallet is on.
7. Show clear loading, success and error states. When error.code === -4 the user simply declined: show a neutral message.
8. Domains: http://localhost (any port) works automatically while developing. Before launch, add the live site's address (like https://myapp.com, no path) under Domains in the Beacon dashboard. Otherwise users see "This site isn't authorized for this app".
9. Mainnet is real money. Keep the default network on testnet while building, and label mainnet clearly in the UI.
10. Amounts are always strings, and XLM has at most 7 decimal places.
11. Always add a "Back up key" button for signed-in users that calls beacon.exportWallet(). It shows the user their secret key inside the Beacon window; the app never receives it. It does not work for external wallets (rejects with -6), so hide the button for those users or handle that error.

## What to deliver
- Complete, working code for every file (not snippets). Use React with TypeScript (Vite) unless my description says otherwise.
- Short setup steps I can run.
- Keep the code simple and readable.`;
}
