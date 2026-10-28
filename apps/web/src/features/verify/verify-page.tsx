"use client";

import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  Check,
  Copy,
  Fingerprint,
  ShieldCheck,
  ShieldX,
  Unplug,
} from "lucide-react";
import { AppShell } from "@/features/application/app-shell";

type Result = "valid" | "invalid" | "unavailable" | null;
const sampleHash =
  "a4c97e21d5f08b36c1924fa7e0bd6839f2a6d145c9e30b782f5a61d4b8e097c3";

export function VerifyPage() {
  const [hash, setHash] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result>(null);
  const [sample, setSample] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  function submit(event: FormEvent) {
    event.preventDefault();
    const value = hash.trim();
    if (!/^(0x)?[a-fA-F0-9]{64}$/.test(value)) {
      setError("Enter a 64-character hexadecimal hash, with or without 0x.");
      setResult(null);
      return;
    }
    setError("");
    setSample(false);
    setResult("unavailable");
  }
  function preview(value: Exclude<Result, null>) {
    setHash(sampleHash);
    setError("");
    setCopyStatus("");
    setSample(true);
    setResult(value);
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(hash);
      setCopyStatus("Hash copied");
    } catch {
      setCopyStatus("Copy unavailable. Select the hash in the field above.");
    }
  }
  return (
    <AppShell
      title="TEE proofs"
      description="Inspect the evidence behind an agent’s decision."
      notice="Verification service is not connected."
    >
      <div className="proof-layout">
        <section className="proof-input" aria-labelledby="proof-form-heading">
          <div className="proof-emblem">
            <Fingerprint size={53} strokeWidth={1} />
          </div>
          <h2 id="proof-form-heading">Verify an attestation</h2>
          <p>
            Paste the attestation hash supplied with a decision. The verifier
            will check its signature and execution details.
          </p>
          <form onSubmit={submit} noValidate>
            <label htmlFor="attestation-hash">Attestation hash</label>
            <textarea
              id="attestation-hash"
              value={hash}
              onChange={(e) => {
                setHash(e.target.value);
                setResult(null);
                setSample(false);
                setError("");
                setCopyStatus("");
              }}
              placeholder="0x… or a 64-character hash"
              spellCheck={false}
              autoCapitalize="off"
              maxLength={66}
              aria-invalid={!!error}
              aria-describedby={error ? "hash-error" : "hash-hint"}
            />
            <p id="hash-hint" className="app-field-hint">
              64 hexadecimal characters. No wallet connection required.
            </p>
            {error && (
              <p className="app-field-error" id="hash-error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="sc-button sc-button-dark">
              Verify attestation <ArrowRight size={17} />
            </button>
          </form>
          <div className="proof-examples">
            <span>Preview a result</span>
            <div>
              {(["valid", "invalid", "unavailable"] as const).map((value) => (
                <button
                  type="button"
                  key={value}
                  aria-pressed={sample && result === value}
                  onClick={() => preview(value)}
                >
                  {value === "valid"
                    ? "Valid example"
                    : value === "invalid"
                      ? "Invalid example"
                      : "Service offline"}
                </button>
              ))}
            </div>
            <p>
              Examples show interface states only. They do not verify a
              signature.
            </p>
          </div>
        </section>
        <section
          className={`proof-result${result ? ` is-${result}` : ""}`}
          aria-label="Attestation result"
          aria-live="polite"
        >
          {!result ? (
            <div className="proof-idle">
              <ShieldCheck size={82} strokeWidth={0.8} />
              <h2>Your result appears here.</h2>
              <p>
                Signature status, model, enclave identity, and execution time
                belong to the same proof.
              </p>
              <span>No attestation checked</span>
            </div>
          ) : (
            <>
              <div className="proof-result-top">
                <span>{sample ? "Example result" : "Verification status"}</span>
                {result === "valid" ? (
                  <ShieldCheck size={27} />
                ) : result === "invalid" ? (
                  <ShieldX size={27} />
                ) : (
                  <Unplug size={27} />
                )}
              </div>
              <h2>
                {result === "valid"
                  ? "Valid signature"
                  : result === "invalid"
                    ? "Signature rejected"
                    : "Verifier unavailable"}
              </h2>
              <p>
                {result === "valid"
                  ? "This example shows how a verified attestation would be displayed."
                  : result === "invalid"
                    ? "This example shows a signature that does not match the supplied attestation."
                    : "The verification service is not connected yet. This hash has not been checked."}
              </p>
              {sample && (
                <div className="proof-sample-label">
                  Sample only · no cryptographic verification performed
                </div>
              )}
              <dl className="proof-fields">
                <div>
                  <dt>Signature</dt>
                  <dd>
                    {result === "valid"
                      ? "Valid (example)"
                      : result === "invalid"
                        ? "Invalid (example)"
                        : "Not checked"}
                  </dd>
                </div>
                <div>
                  <dt>Model</dt>
                  <dd>
                    {result === "valid"
                      ? "Demo inference model"
                      : "Unavailable"}
                  </dd>
                </div>
                <div>
                  <dt>Enclave ID</dt>
                  <dd>
                    {result === "valid" ? "sample-enclave-001" : "Unavailable"}
                  </dd>
                </div>
                <div>
                  <dt>Executed at</dt>
                  <dd>
                    {result === "valid"
                      ? "01 Nov 2026 · 08:30 UTC (sample)"
                      : "Unavailable"}
                  </dd>
                </div>
              </dl>
              <div className="proof-result-actions">
                <button className="sc-text-button" onClick={copy}>
                  {copyStatus === "Hash copied" ? (
                    <Check size={15} />
                  ) : (
                    <Copy size={15} />
                  )}
                  Copy hash
                </button>
                <button
                  className="sc-text-button"
                  onClick={() => {
                    setHash("");
                    setResult(null);
                    setSample(false);
                    setCopyStatus("");
                  }}
                >
                  Clear result
                </button>
              </div>
              <p className="app-field-hint" role="status">
                {copyStatus}
              </p>
            </>
          )}
        </section>
      </div>
      <section
        className="proof-explainer"
        aria-labelledby="proof-checks-heading"
      >
        <h2 id="proof-checks-heading">What a proof checks</h2>
        <div>
          {[
            {
              n: "01",
              title: "Signature",
              text: "Whether the attestation was signed by a trusted authority.",
            },
            {
              n: "02",
              title: "Execution environment",
              text: "The enclave identity and model reported by the attestation.",
            },
            {
              n: "03",
              title: "Execution time",
              text: "When the attested operation took place.",
            },
          ].map((item) => (
            <article key={item.n}>
              <span>{item.n}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
        <p className="proof-scope-note">
          An attestation provides evidence about execution. It does not
          guarantee a profitable trade.
        </p>
      </section>
    </AppShell>
  );
}
