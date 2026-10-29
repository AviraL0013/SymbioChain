"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Check,
  Copy,
  Fingerprint,
  ShieldCheck,
  Unplug,
} from "lucide-react";
import { ViewerProof } from "@symbiochain/shared";
import { AppShell } from "@/features/application/app-shell";
import { timestamp } from "@/features/swarm/format";

type Result = "recorded" | "not-found" | "unavailable" | null;
export function VerifyPage() {
  const [hash, setHash] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result>(null);
  const [proof, setProof] = useState<ViewerProof | null>(null);
  const [pending, setPending] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);

  function reset(value: string) {
    request.current?.abort();
    request.current = null;
    setHash(value);
    setResult(null);
    setProof(null);
    setError("");
    setCopyStatus("");
    setPending(false);
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    const value = hash.trim().replace(/^0x/i, "").toLowerCase();
    if (!/^[a-f0-9]{64}$/.test(value)) {
      setError("Enter a 64-character hexadecimal hash, with or without 0x.");
      setResult(null);
      return;
    }
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setError("");
    setResult(null);
    setProof(null);
    setCopyStatus("");
    setPending(true);
    try {
      const response = await fetch(`/api/swarm/proof?hash=${value}`, {
        cache: "no-store",
        signal: AbortSignal.any([
          controller.signal,
          AbortSignal.timeout(20_000),
        ]),
      });
      if (response.status === 404) {
        if (request.current === controller) setResult("not-found");
        return;
      }
      if (!response.ok) throw new Error("Proof service unavailable");
      const record = ViewerProof.parse(await response.json());
      if (request.current === controller) {
        setProof(record);
        setResult("recorded");
      }
    } catch {
      if (request.current === controller && !controller.signal.aborted)
        setResult("unavailable");
    } finally {
      if (request.current === controller) setPending(false);
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(hash);
      setCopyStatus("Hash copied");
    } catch {
      setCopyStatus("Copy unavailable. Select the hash in the input field.");
    }
  }
  return (
    <AppShell
      title="TEE proofs"
      description="Look up recorded inference verification evidence."
      notice="This lookup returns recorded backend verification metadata. It does not perform a fresh hardware attestation check. PAPER fixtures are never marked verified."
    >
      <div className="proof-layout">
        <section className="proof-input" aria-labelledby="proof-form-heading">
          <div className="proof-emblem">
            <Fingerprint size={53} strokeWidth={1} />
          </div>
          <h2 id="proof-form-heading">Find an inference record</h2>
          <p>
            Paste a request or response hash from a NEAR AI inference record.
            Only records previously verified by the backend are eligible.
          </p>
          <form onSubmit={submit} noValidate>
            <label htmlFor="attestation-hash">Request or response hash</label>
            <textarea
              id="attestation-hash"
              value={hash}
              onChange={(event) => reset(event.target.value)}
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
            <button
              type="submit"
              className="sc-button sc-button-dark"
              disabled={pending}
            >
              {pending ? "Looking up record…" : "Look up recorded proof"}
              <ArrowRight size={17} />
            </button>
          </form>
        </section>
        <section
          className={`proof-result${result === "recorded" ? " is-valid" : result ? " is-unavailable" : ""}`}
          aria-label="Recorded proof result"
          aria-live="polite"
          aria-busy={pending}
        >
          {!result ? (
            <div className="proof-idle">
              <ShieldCheck size={82} strokeWidth={0.8} />
              <h2>
                {pending
                  ? "Looking up the record…"
                  : "Your result appears here."}
              </h2>
              <p>
                Model, enclave identity, request hash and verification time are
                returned from the same stored record.
              </p>
              <span>No fresh attestation performed</span>
            </div>
          ) : (
            <>
              <div className="proof-result-top">
                <span>Recorded verification lookup</span>
                {proof ? <ShieldCheck size={27} /> : <Unplug size={27} />}
              </div>
              <h2>
                {result === "recorded"
                  ? "Verification record found"
                  : result === "not-found"
                    ? "No verified record found"
                    : "Proof lookup unavailable"}
              </h2>
              <p>
                {result === "recorded"
                  ? "The backend previously verified this inference record. This response does not reverify its signature or hardware evidence."
                  : result === "not-found"
                    ? "No verified NEAR AI record in this PAPER feed matches the hash. This does not establish that a signature is invalid."
                    : "The connection is unavailable. The hash has not been checked."}
              </p>
              {proof && (
                <>
                  <div className="proof-sample-label">
                    PAPER feed · stored metadata · no fresh attestation
                  </div>
                  <dl className="proof-fields">
                    <div>
                      <dt>Model</dt>
                      <dd>{proof.model ?? "Not recorded"}</dd>
                    </div>
                    <div>
                      <dt>Signer</dt>
                      <dd>{proof.signer ?? "Not recorded"}</dd>
                    </div>
                    <div>
                      <dt>Enclave measurement</dt>
                      <dd>{proof.measurement ?? "Not recorded"}</dd>
                    </div>
                    <div>
                      <dt>Verified at</dt>
                      <dd>
                        {proof.verifiedAt
                          ? `${timestamp(proof.verifiedAt)} UTC`
                          : "Not recorded"}
                      </dd>
                    </div>
                    <div>
                      <dt>Request hash</dt>
                      <dd>{proof.requestHash ?? "Not recorded"}</dd>
                    </div>
                    <div>
                      <dt>Response hash</dt>
                      <dd>{proof.responseHash ?? "Not recorded"}</dd>
                    </div>
                  </dl>
                </>
              )}
              <div className="proof-result-actions">
                <button className="sc-text-button" onClick={copy}>
                  {copyStatus === "Hash copied" ? (
                    <Check size={15} />
                  ) : (
                    <Copy size={15} />
                  )}
                  Copy hash
                </button>
                <button className="sc-text-button" onClick={() => reset("")}>
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
        <h2 id="proof-checks-heading">What this lookup establishes</h2>
        <div>
          {[
            {
              n: "01",
              title: "Recorded status",
              text: "The backend persisted a VERIFIED NEAR AI record. Simulated fixtures do not qualify.",
            },
            {
              n: "02",
              title: "Recorded identity",
              text: "Model and enclave metadata refer to that stored inference record.",
            },
            {
              n: "03",
              title: "Recorded time",
              text: "The timestamp is when the backend recorded verification, not a new verification time.",
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
          Attestation metadata does not establish trade profitability, and a
          missing record is not an invalid signature verdict.
        </p>
      </section>
    </AppShell>
  );
}
