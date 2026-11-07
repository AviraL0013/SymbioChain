"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  NearConnector,
  WalletManifest,
  Account,
} from "@hot-labs/near-connect";
import { MainnetWallet } from "@symbiochain/shared";
import manifest from "./manifest.json";
type Balance = ReturnType<typeof MainnetWallet.parse>;
const Context = createContext<{
  account: Account | null;
  balance: Balance | null;
  pending: boolean;
  error: string | null;
  connect: (walletId?: string) => Promise<void>;
  disconnect: () => Promise<void>;
} | null>(null);
export function WalletProvider({ children }: { children: ReactNode }) {
  const connector = useRef<NearConnector | null>(null);
  const [account, setAccount] = useState<Account | null>(null),
    [balance, setBalance] = useState<Balance | null>(null),
    [pending, setPending] = useState(false),
    [error, setError] = useState<string | null>(null);
  async function getConnector() {
    if (connector.current) return connector.current;
    const { NearConnector } = await import("@hot-labs/near-connect");
    const next = new NearConnector({
      network: "mainnet",
      autoConnect: false,
      features: { signInWithoutAddKey: true },
      providers: { mainnet: ["https://free.rpc.fastnear.com"] },
      manifest: {
        version: manifest.version,
        wallets: manifest.wallets.map((wallet): WalletManifest => ({
          ...wallet,
          type: "sandbox",
          platform: Object.keys(wallet.platform),
          features: {
            signMessage: false,
            signTransaction: false,
            signAndSendTransaction: false,
            signAndSendTransactions: false,
            signInAndSignMessage: false,
            signInWithFunctionCallKey: false,
            signDelegateActions: false,
            signInWithoutAddKey: true,
            mainnet: true,
            testnet: false,
          },
        })),
      },
    });
    next.on("wallet:signIn", (event) => {
      if (event.success && event.accounts[0]) {
        setAccount(event.accounts[0]);
        setBalance(null);
      }
    });
    next.on("wallet:signOut", () => {
      setAccount(null);
      setBalance(null);
    });
    connector.current = next;
    return next;
  }
  async function connect(walletId?: string) {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const next = await getConnector();
      await next.connect(walletId ? { walletId } : undefined);
      const connected = await next.getConnectedWallet();
      if (!connected.accounts[0]) throw Error();
      setAccount(connected.accounts[0]);
    } catch {
      setError(
        "Wallet connection was not confirmed. Try again in your NEAR wallet.",
      );
    } finally {
      setPending(false);
    }
  }
  async function disconnect() {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      await connector.current?.disconnect();
      setAccount(null);
      setBalance(null);
    } catch {
      setError("Wallet disconnection was not confirmed. Check your wallet.");
    } finally {
      setPending(false);
    }
  }
  useEffect(() => {
    if (!account) return;
    const controller = new AbortController();
    async function load() {
      try {
        const r = await fetch(
          "/api/swarm/mainnet/wallet?accountId=" +
            encodeURIComponent(account!.accountId),
          { cache: "no-store", signal: controller.signal },
        );
        if (!r.ok) throw Error();
        const value = MainnetWallet.parse(await r.json());
        if (!controller.signal.aborted) setBalance(value);
      } catch {
        if (!controller.signal.aborted)
          setError("Connected. Mainnet balance is temporarily unavailable.");
      }
    }
    void load();
    const timer = setInterval(() => void load(), 20_000);
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, [account]);
  return (
    <Context.Provider
      value={{ account, balance, pending, error, connect, disconnect }}
    >
      {children}
    </Context.Provider>
  );
}
export function useWallet() {
  const c = useContext(Context);
  if (!c) throw Error("WalletProvider required");
  return c;
}
