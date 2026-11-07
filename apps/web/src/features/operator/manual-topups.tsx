"use client";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { ManualTopupTask } from "@symbiochain/shared";

export function ManualTopups() {
  const [tasks, setTasks] = useState<
    ReturnType<typeof ManualTopupTask.parse>[]
  >([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  async function refresh(signal?: AbortSignal) {
    try {
      const response = await fetch("/api/operator/topups", {
        cache: "no-store",
        credentials: "same-origin",
        ...(signal ? { signal } : {}),
      });
      if (!response.ok) throw Error();
      const next = z
        .array(ManualTopupTask)
        .max(100)
        .parse(await response.json());
      if (!signal?.aborted) {
        setTasks(next);
        setError("");
      }
    } catch {
      if (!signal?.aborted)
        setError(
          "Manual top-up tasks unavailable. Retained tasks are stale; no purchase is inferred.",
        );
    }
  }
  useEffect(() => {
    const controller = new AbortController();
    const initial = setTimeout(() => void refresh(controller.signal), 0);
    const timer = setInterval(() => void refresh(controller.signal), 15000);
    return () => {
      controller.abort();
      clearTimeout(initial);
      clearInterval(timer);
    };
  }, []);
  return (
    <section className="operator-card">
      <h2>Human-in-the-loop credit bridge</h2>
      <p>
        These controls record PAPER purchase reports only. Make any real
        purchase separately in the matching NEAR AI Cloud organization. No card
        details, wallet keys or checkout URLs are requested here.
      </p>
      <p>
        A report keeps the proceeds reservation held. It cannot add provider
        credits, verify a purchase, or open the TEE gate. LIVE reports use the
        private backend administrator API.
      </p>
      {error && <p role="alert">{error}</p>}
      {notice && <p role="status">{notice}</p>}
      {!tasks.length && !error && (
        <p>
          No manual top-up tasks recorded. The bridge requires a closed positive
          cost window and a compute reservation.
        </p>
      )}
      {tasks.map((task) => (
        <TopupForm
          key={task.reference}
          task={task}
          onReported={async () => {
            setNotice(
              "Operator report recorded. Provider credits remain unverified; TEE stays quarantined.",
            );
            await refresh();
          }}
        />
      ))}
    </section>
  );
}

function TopupForm({
  task,
  onReported,
}: {
  task: ReturnType<typeof ManualTopupTask.parse>;
  onReported: () => Promise<void>;
}) {
  const [receipt, setReceipt] = useState("");
  const [credit, setCredit] = useState(() => {
    const atoms = BigInt(task.requestedCreditUsdMicros);
    return `${atoms / 1000000n}.${(atoms % 1000000n).toString().padStart(6, "0")}`;
  });
  const [source, setSource] = useState<
    "OPERATOR_FUNDED" | "EARNED_PROCEEDS_REPORTED"
  >("OPERATOR_FUNDED");
  const [acknowledged, setAcknowledged] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    try {
      if (
        !/^(0|[1-9]\d{0,6})(\.\d{1,6})?$/.test(credit) ||
        !receipt.trim() ||
        receipt.length > 200 ||
        /https?:\/\/|Bearer|ed25519:/.test(receipt)
      )
        throw Error(
          "Enter a receipt reference and an exact USD credit amount; exclude keys and checkout URLs.",
        );
      const [whole, fraction = ""] = credit.split(".");
      const reportedCreditUsdMicros = (
        BigInt(whole!) * 1000000n +
        BigInt(fraction.padEnd(6, "0"))
      ).toString();
      const hashed = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(receipt.trim()),
      );
      const receiptDigest = Array.from(new Uint8Array(hashed), (byte) =>
        byte.toString(16).padStart(2, "0"),
      ).join("");
      const response = await fetch("/api/operator/action", {
        method: "POST",
        cache: "no-store",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "report-compute-topup",
          report: {
            reference: task.reference,
            organizationId: task.organizationId,
            receiptDigest,
            reportedCreditUsdMicros,
            fundingSource: source,
          },
          acknowledged,
        }),
      });
      if (!response.ok)
        throw Error(
          "Report not confirmed. Refresh and retry the same receipt and amount; no provider credit balance changed.",
        );
      setReceipt("");
      await onReported();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Report unavailable.",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <form onSubmit={submit} className="operator-topup-form">
      <p>
        <strong>{task.reference}</strong> ·{" "}
        {task.state === "WAITING_OPERATOR"
          ? "Awaiting operator"
          : "Operator reported — provider unverified"}
      </p>
      <p>
        Organization: {task.organizationId} · Spend budget:{" "}
        {task.spendBudgetAtoms} payment-asset atoms ·{" "}
        {task.simulated ? "PAPER fixture" : "LIVE"}
      </p>
      {task.state === "WAITING_OPERATOR" && (
        <fieldset disabled={pending}>
          <label>
            Receipt reference (hashed in your browser)
            <input
              value={receipt}
              onChange={(event) => setReceipt(event.target.value)}
              maxLength={200}
              required
              autoComplete="off"
            />
          </label>
          <label>
            Reported credits in USD
            <input
              value={credit}
              onChange={(event) => setCredit(event.target.value)}
              inputMode="decimal"
              required
            />
          </label>
          <label>
            Reported source of payment
            <select
              value={source}
              onChange={(event) =>
                setSource(event.target.value as typeof source)
              }
            >
              <option value="OPERATOR_FUNDED">Operator funded</option>
              <option value="EARNED_PROCEEDS_REPORTED">
                Earned proceeds (operator reported)
              </option>
            </select>
          </label>
          <label>
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(event) => setAcknowledged(event.target.checked)}
              required
            />
            I understand this is a PAPER report, not verified provider credit
            provisioning.
          </label>
          <button className="sc-button" disabled={!acknowledged || pending}>
            {pending ? "Recording…" : "Record simulated top-up report"}
          </button>
        </fieldset>
      )}
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
