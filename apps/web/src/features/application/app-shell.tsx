"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ArrowRight, ArrowUpRight, Wallet } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { RibbonMark } from "@/features/landing/brand";
import "@/features/dashboard/dashboard.css";
import "./application.css";

const navigation = [
  ["/dashboard", "Overview"],
  ["/topology", "Topology"],
  ["/verify", "Proofs"],
  ["/nfts", "NFTs"],
] as const;

export function AppHeader() {
  const path = usePathname();
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
                aria-current={path === href ? "page" : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="sc-header-actions">
            <span className="sc-network">
              <span />
              NEAR Testnet
            </span>
            <button
              type="button"
              className="sc-button sc-button-dark"
              onClick={() => setWalletOpen(true)}
            >
              <Wallet size={16} />
              Connect wallet
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
        Wallet connections will be available after integration. This preview
        does not connect an account or move funds.
      </p>
      <button
        type="button"
        className="sc-button sc-button-dark sc-dialog-primary"
        onClick={onClose}
      >
        Back to preview <ArrowRight size={16} />
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
        <div className="sc-demo-notice">
          <div className="sc-demo-label">
            <strong>Frontend preview</strong>
            <span className="sc-demo-separator" />
            <span>{notice}</span>
          </div>
        </div>
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
