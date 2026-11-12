"use client";
import { useState, type ReactNode } from "react";
import { Check, ChevronDown, Copy } from "lucide-react";

export function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  return (
    <span className={`data-badge data-badge-${tone}`}>
      <i />
      {children}
    </span>
  );
}

export function Identifier({
  value,
  label = "identifier",
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }
  return (
    <span className="data-identifier">
      <button
        type="button"
        className="data-identifier-value"
        aria-expanded={expanded}
        aria-label={`${expanded ? "Collapse" : "Show full"} ${label}: ${value}`}
        onClick={() => setExpanded(!expanded)}
      >
        <code title={value}>{value}</code>
      </button>
      <button
        type="button"
        onClick={() => void copy()}
        aria-label={`Copy ${label}`}
        title={copied ? "Copied" : `Copy ${label}`}
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
      </button>
      <span className="sr-only" role="status">
        {copied ? `${label} copied` : ""}
      </span>
    </span>
  );
}

export function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="data-section-heading">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function DataDisclosure({
  title,
  description,
  children,
  open = false,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  open?: boolean;
}) {
  return (
    <details className="data-disclosure" open={open || undefined}>
      <summary>
        <span>
          <strong>{title}</strong>
          {description && <span>{description}</span>}
        </span>
        <ChevronDown size={17} />
      </summary>
      <div className="data-disclosure-body">{children}</div>
    </details>
  );
}
