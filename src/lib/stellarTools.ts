import { hash, Keypair, StrKey } from "@stellar/stellar-base";

// What a dApp does with the Stellar network itself. Beacon does the signing and sending.
// (Only the Playground imports this file, so the Stellar library loads only when it is opened.)

export const isStellarAddress = (value: string) => StrKey.isValidEd25519PublicKey(value);

// XLM balance as a decimal string, or null when the account does not exist on this network yet.
export async function fetchBalance(horizonUrl: string, address: string): Promise<string | null> {
  const res = await fetch(`${horizonUrl}/accounts/${encodeURIComponent(address)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Could not read the balance from the Stellar network.");
  const body = (await res.json()) as { balances?: { asset_type: string; balance: string }[] };
  return body.balances?.find((b) => b.asset_type === "native")?.balance ?? "0";
}

// Testnet only: Friendbot creates the account and gives it test XLM.
export async function fundWithFriendbot(friendbotUrl: string, address: string): Promise<void> {
  const res = await fetch(`${friendbotUrl}?addr=${encodeURIComponent(address)}`);
  if (!res.ok) throw new Error("Friendbot could not fund this account. It may already be funded.");
}

// Checks a SEP-53 message signature (what Beacon's signMessage returns, base64).
export function verifyMessageSignature(address: string, message: string, signatureBase64: string): boolean {
  const payload = Buffer.concat([Buffer.from("Stellar Signed Message:\n", "utf8"), Buffer.from(message, "utf8")]);
  try {
    return Keypair.fromPublicKey(address).verify(hash(payload), Buffer.from(signatureBase64, "base64"));
  } catch {
    return false;
  }
}

// Strips trailing zeros: "100.0000000" -> "100".
export function trimAmount(decimal: string): string {
  return decimal.includes(".") ? decimal.replace(/0+$/, "").replace(/\.$/, "") : decimal;
}
