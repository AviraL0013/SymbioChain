"use client";

import Link from "next/link";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { RibbonMark } from "./brand";

const links = [
  ["How it works", "#how-it-works"],
  ["Agents", "#agents"],
  ["Privacy", "#privacy"],
  ["FAQ", "#faq"],
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    header.current?.querySelector<HTMLAnchorElement>(".main-nav a")?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
      if (event.key !== "Tab") return;
      const items = Array.from(
        header.current?.querySelectorAll<HTMLElement>("a[href], button") ?? [],
      ).filter((item) => item.getClientRects().length > 0);
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={`site-header${open ? " menu-open" : ""}`} ref={header}>
      <div className="header-inner">
        <Link
          href="/"
          className="brand"
          aria-label="SymbioChain home"
          onClick={() => setOpen(false)}
        >
          <RibbonMark />
          <span>SymbioChain</span>
        </Link>
        <nav
          id="landing-navigation"
          aria-label="Main navigation"
          className="main-nav"
        >
          {links.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <Link
            href="/dashboard"
            className="header-cta"
            onClick={() => setOpen(false)}
          >
            Open dashboard <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
          <button
            ref={toggle}
            type="button"
            className="menu-toggle"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="landing-navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </div>
    </header>
  );
}
