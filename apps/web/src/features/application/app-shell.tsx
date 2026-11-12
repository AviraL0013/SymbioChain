"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  Blocks,
  ChevronRight,
  FileCheck2,
  Fingerprint,
  GitBranch,
  LayoutDashboard,
  Menu,
  ReceiptText,
  Settings2,
  Wallet,
  X,
} from "lucide-react";
import { WalletPanel } from "@/features/wallet/wallet-panel";
import { useWallet } from "@/features/wallet/wallet-provider";
import { useDeployment } from "@/features/mainnet/deployment-provider";
import { RibbonMark } from "@/features/landing/brand";
import { ConnectionNotice, useSwarm } from "@/features/swarm/swarm-provider";
import { OperatingBoundaries } from "./operating-boundaries";
import "@/features/dashboard/dashboard.css";
import "./application.css";
import "./workspace.css";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/topology", label: "Agents", icon: GitBranch },
  { href: "/cycles", label: "Transactions", icon: ReceiptText },
  { href: "/evidence", label: "Evidence", icon: FileCheck2 },
  { href: "/business", label: "Business", icon: Blocks },
  { href: "/verify", label: "Verification", icon: Fingerprint },
  { href: "/nfts", label: "Receipts", icon: ReceiptText },
  { href: "/operator", label: "Controls", icon: Settings2 },
] as const;

export function AppHeader() {
  const path = usePathname();
  const deployment = useDeployment();
  const wallet = useWallet();
  const { data, error, loading } = useSwarm();
  const [walletOpen, setWalletOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const sidebar = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!menuOpen) return;
    const media = window.matchMedia("(max-width: 800px)");
    const resize = () => {
      if (!media.matches) setMenuOpen(false);
    };
    media.addEventListener("change", resize);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() =>
      sidebar.current?.querySelector<HTMLAnchorElement>("a")?.focus(),
    );
    return () => {
      media.removeEventListener("change", resize);
      document.body.style.overflow = previousOverflow;
      cancelAnimationFrame(frame);
    };
  }, [menuOpen]);
  const active = navigation.find(
    ({ href }) =>
      path === href ||
      path.startsWith(href + "/") ||
      (href === "/evidence" && path === "/testnet"),
  );
  const status =
    deployment.runtime?.mode === "LIVE"
      ? deployment.error
        ? "Mainnet · stale"
        : "NEAR Mainnet"
      : error
        ? "Disconnected"
        : loading
          ? "Connecting"
          : data
            ? "PAPER simulation"
            : "Unavailable";
  return (
    <>
      <header
        className="sc-header"
        onKeyDown={(event) => {
          if (event.key === "Escape" && menuOpen) {
            event.preventDefault();
            setMenuOpen(false);
            menuButton.current?.focus();
          }
          if (event.key === "Tab" && menuOpen) {
            const links = [
              ...(sidebar.current?.querySelectorAll<HTMLElement>(
                "a[href], button:not(:disabled)",
              ) ?? []),
            ];
            const first = links[0];
            const last = links.at(-1);
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first?.focus();
            }
          }
        }}
      >
        <aside
          ref={sidebar}
          role={menuOpen ? "dialog" : undefined}
          aria-modal={menuOpen || undefined}
          aria-label="Workspace navigation"
          className={`sc-sidebar${menuOpen ? " is-open" : ""}`}
        >
          <button
            type="button"
            className="sc-sidebar-close sc-icon-button"
            aria-label="Close workspace navigation"
            onClick={() => {
              setMenuOpen(false);
              menuButton.current?.focus();
            }}
          >
            <X size={16} />
          </button>
          <Link href="/" className="sc-brand" aria-label="SymbioChain home">
            <RibbonMark />
            <span>SymbioChain</span>
          </Link>
          <span className="sc-nav-label">Workspace</span>
          <nav
            id="workspace-navigation"
            className="sc-navigation"
            aria-label="Application navigation"
          >
            {navigation.map(({ href, label, icon: Icon }) => (
              <Link
                href={href}
                key={href}
                onClick={() => setMenuOpen(false)}
                aria-current={active?.href === href ? "page" : undefined}
              >
                <Icon size={17} strokeWidth={1.7} />
                <span>{label}</span>
                {active?.href === href && (
                  <ChevronRight className="sc-nav-current" size={14} />
                )}
              </Link>
            ))}
          </nav>
          <div className="sc-sidebar-bottom">
            <div className="sc-sidebar-network">
              <span className="sc-network-dot" />
              <div>
                <strong>{status}</strong>
                <span>Observed network data</span>
              </div>
            </div>
            <Link href="/">
              Back to website <ArrowUpRight size={15} />
            </Link>
          </div>
        </aside>
        {menuOpen && (
          <button
            type="button"
            className="sc-menu-backdrop"
            tabIndex={-1}
            aria-label="Close navigation"
            onClick={() => {
              setMenuOpen(false);
              menuButton.current?.focus();
            }}
          />
        )}
        <div className="sc-topbar">
          <div className="sc-topbar-location">
            <button
              ref={menuButton}
              type="button"
              className="sc-mobile-menu sc-icon-button"
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={menuOpen}
              aria-controls="workspace-navigation"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span className="sc-breadcrumb-root">Workspace</span>
            <ChevronRight className="sc-breadcrumb-separator" size={13} />
            <strong>
              {path === "/testnet"
                ? "Testnet archive"
                : (active?.label ?? "Overview")}
            </strong>
          </div>
          <div className="sc-header-actions">
            <span className="sc-network">
              <span />
              {status}
            </span>
            <button
              type="button"
              className="sc-button sc-button-dark"
              onClick={() => setWalletOpen(true)}
            >
              <Wallet size={15} />
              <span>
                {wallet.pending
                  ? "Connecting…"
                  : wallet.account
                    ? wallet.account.accountId.length > 18
                      ? wallet.account.accountId.slice(0, 15) + "…"
                      : wallet.account.accountId
                    : "Connect wallet"}
              </span>
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
  return <WalletPanel open={open} onClose={onClose} />;
}

export function AppFooter() {
  return (
    <footer className="sc-footer">
      <p>
        SymbioChain <span>Built on NEAR</span>
      </p>
      <Link href="/evidence">
        Explore the evidence <ArrowUpRight size={13} />
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
  const { runtime } = useDeployment();
  return (
    <div className="mission-control app-page">
      <a href="#app-content" className="sc-skip-link">
        Skip to content
      </a>
      <AppHeader />
      <main className="sc-main" id="app-content">
        <section className="sc-page-heading">
          <div>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          {action && <div className="app-heading-action">{action}</div>}
        </section>
        {runtime?.mode === "PAPER" && <ConnectionNotice />}
        <OperatingBoundaries />
        <p className="app-page-note">{notice}</p>
        <div className="app-page-content">{children}</div>
        <AppFooter />
      </main>
    </div>
  );
}
