import { useCallback, useEffect, useRef, useState } from "react";
import { BeaconAuth, type NetworkId } from "@beaconmcu/auth";
import { explain } from "./explain";

const WALLET_URL = import.meta.env.VITE_WALLET_URL || undefined; // undefined = the production wallet

// The wallet this Playground opens, shown on the page and in the log so a wrong address is easy to spot.
export const WALLET_ADDRESS = WALLET_URL ?? "https://wallet.beaconmcu.space";

export type LogKind = "event" | "call" | "ok" | "error";
export type LogEntry = { id: number; time: string; kind: LogKind; text: string };

const SHORT = 280; // long results (like a signed transaction) are cut in the log

// One live BeaconAuth for the Playground, built exactly the way a developer's own app would build it,
// plus a running log of everything it does. A new instance is made when the app, network or
// confirmation setting changes; a saved sign-in is picked up again by the wallet silently.
export function usePlayground(clientId: string, defaultNetwork: NetworkId, silent: boolean) {
  const [beacon, setBeacon] = useState<BeaconAuth | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<NetworkId>(defaultNetwork);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const nextId = useRef(0);

  const log = useCallback((kind: LogKind, text: string) => {
    const entry: LogEntry = {
      id: ++nextId.current,
      time: new Date().toLocaleTimeString([], { hour12: false }),
      kind,
      text: text.length > SHORT ? text.slice(0, SHORT) + "…" : text,
    };
    setLogs((all) => [...all.slice(-199), entry]);
  }, []);

  useEffect(() => {
    const instance = new BeaconAuth({
      clientId,
      walletUrl: WALLET_URL,
      defaultNetwork,
      supportedNetworks: silent ? ["testnet"] : ["testnet", "mainnet"], // no silent signing anywhere near real funds
      showWalletUI: !silent,
    });
    log("event", `new BeaconAuth({ defaultNetwork: "${defaultNetwork}", showWalletUI: ${!silent} })  wallet: ${WALLET_ADDRESS}`);
    setBeacon(instance);
    setNetwork(instance.getNetwork().id);
    setAddress(instance.getAddress());

    const stops = [
      instance.on("connect", ({ address, network }) => {
        setAddress(address);
        setNetwork(network);
        log("event", `connect → ${address} on ${network}`);
      }),
      instance.on("disconnect", () => log("event", "disconnect")),
      instance.on("accountChanged", (next) => {
        setAddress(next);
        log("event", `accountChanged → ${next ?? "null"}`);
      }),
      instance.on("networkChanged", (next) => {
        setNetwork(next);
        log("event", `networkChanged → ${next}`);
      }),
    ];

    return () => {
      stops.forEach((stop) => stop());
      instance.destroy();
      setBeacon(null);
    };
  }, [clientId, defaultNetwork, silent, log]);

  // Runs an SDK call and writes it, and what came back, to the log.
  const call = useCallback(
    async <T,>(label: string, run: (b: BeaconAuth) => Promise<T>): Promise<T> => {
      if (!beacon) throw new Error("The SDK is still starting. Try again in a moment.");
      log("call", label);
      const started = performance.now();
      try {
        const result = await run(beacon);
        log("ok", `${label} → ${JSON.stringify(result) ?? "done"}  (${Math.round(performance.now() - started)} ms)`);
        return result;
      } catch (error) {
        const { message, code } = explain(error);
        log("error", `${label} failed${code !== undefined ? ` [${code}]` : ""}: ${message}`);
        throw error;
      }
    },
    [beacon, log],
  );

  return { beacon, address, network, logs, clearLogs: () => setLogs([]), log, call };
}
