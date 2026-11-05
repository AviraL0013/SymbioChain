"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ArrowRight, ArrowUpRight, Wallet } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { RibbonMark } from "@/features/landing/brand";
import { ConnectionNotice, useSwarm } from "@/features/swarm/swarm-provider";
import "@/features/dashboard/dashboard.css";
import "./application.css";

const navigation = [
  ["/dashboard", "Overview"],
  ["/topology", "Topology"],
  ["/cycles", "Cycles"],
  ["/testnet", "Testnet"],
  ["/verify", "Proofs"],
  ["/nfts", "Receipts"],
  ["/operator", "Operator"],
] as const;

export function AppHeader() {
  const path = usePathname();
  const { data, error, loading } = useSwarm();
  const [walletOpen, setWalletOpen] = useState(false);
  return (
    <>
      <header className="sc-header">
        <div className="sc-header-inner">
          <Link href="/" className="sc-brand" aria-label="SymbioChain home">
            <RibbonMark />
            <span>SymbioChain</span>
          </Link>
          <nav className="sc-navigation" aria-label="Application navigation">
            {navigation.map(([href, label]) => (
              <Link
                href={href}
                key={href}
                aria-current={
                  path === href || path.startsWith(href + "/")
                    ? "page"
                    : undefined
                }
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="sc-header-actions">
            <span className="sc-network">
              <span />
              {error
                ? "Disconnected"
                : loading
                  ? "Connecting"
                  : data
                    ? "PAPER"
                    : "Unavailable"}
            </span>
            <button
              type="button"
              className="sc-button sc-button-dark"
              onClick={() => setWalletOpen(true)}
            >
              <Wallet size={16} />
              Wallet status
            </button>
          </div>
        </div>
      </header>
      <WalletPreview open={walletOpen} onClose={() => setWalletOpen(false)} />
    </>
  );
}

export function WalletPreview({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title="Connect your wallet">
      <div className="sc-dialog-art">
        <Wallet size={34} />
      </div>
      <p>
        The connected dashboard publishes PAPER telemetry. Wallet authentication
        and real deposits are not available here.
      </p>
      <button
        type="button"
        className="sc-button sc-button-dark sc-dialog-primary"
        onClick={onClose}
      >
        Back to dashboard <ArrowRight size={16} />
      </button>
    </Dialog>
  );
}

export function AppFooter() {
  return (
    <footer className="sc-footer">
      <Link href="/" className="sc-footer-brand">
        SymbioChain
      </Link>
      <p>SymbioChain on NEAR</p>
      <Link href="/">
        Back to the website <ArrowUpRight size={14} />
      </Link>
    </footer>
  );
}

export function AppShell({
  title,
  description,
  notice,
  children,
  action,
}: {
  title: string;
  description: string;
  notice: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mission-control app-page">
      <a href="#app-content" className="sc-skip-link">
        Skip to content
      </a>
      <AppHeader />
      <main className="sc-main" id="app-content">
        <ConnectionNotice />
        <p className="app-muted">{notice}</p>
        <section className="sc-page-heading">
          <div>
            <h1>
              {title}
              <span className="sc-heading-period">.</span>
            </h1>
            <p>{description}</p>
          </div>
          {action && <div className="app-heading-action">{action}</div>}
        </section>
        {children}
        <AppFooter />
      </main>
    </div>
  );
}
