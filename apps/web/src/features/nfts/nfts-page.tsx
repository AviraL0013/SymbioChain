"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Search, X } from "lucide-react";
import type { ViewerSnapshot } from "@symbiochain/shared";
import { AppShell } from "@/features/application/app-shell";
import { Dialog } from "@/components/ui/dialog";
import { useSwarm } from "@/features/swarm/swarm-provider";
import { formatAtoms, timestamp } from "@/features/swarm/format";
import { MetabolismArt } from "./metabolism-art";

type Receipt = ViewerSnapshot["receipts"][number];
const pattern = (id: string) => parseInt(id.slice(0, 2), 16) % 3;
const palette = (id: string) => ["blue", "yellow", "pink"][pattern(id)];

export function NftsPage() {
  const { data } = useSwarm();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [selected, setSelected] = useState<Receipt | null>(null);
  const receipts = useMemo(() => {
    const term = query.trim().toLowerCase();
    return (data?.receipts ?? [])
      .filter((item) =>
        `${item.id} ${item.cycleId}`.toLowerCase().includes(term),
      )
      .sort((a, b) => {
        if (sort === "profit") {
          if (a.grossPnlAtoms === null) return b.grossPnlAtoms === null ? 0 : 1;
          if (b.grossPnlAtoms === null) return -1;
          return BigInt(a.grossPnlAtoms) === BigInt(b.grossPnlAtoms)
            ? 0
            : BigInt(a.grossPnlAtoms) > BigInt(b.grossPnlAtoms)
              ? -1
              : 1;
        }
        return Date.parse(b.timestamp) - Date.parse(a.timestamp);
      });
  }, [data, query, sort]);
  const decimals = data?.treasury.decimals ?? 0;
  const asset = data?.treasury.asset ?? "";
  return (
    <AppShell
      title="Proof of Metabolism"
      description="Persisted receipts from the swarm’s execution cycles."
      notice="PAPER receipts are simulated, unminted records. They do not grant ownership or real revenue rights."
    >
      <div className="collection-toolbar">
        <div
          className="collection-tabs"
          role="group"
          aria-label="Receipt collection"
        >
          <button aria-pressed="true">
            Recorded cycles <span>{data?.receipts.length ?? 0}</span>
          </button>
        </div>
        <div className="collection-tools">
          <label className="collection-search">
            <Search size={17} />
            <span className="sr-only">Search receipts</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search receipt or cycle ID"
            />
            {query && (
              <button onClick={() => setQuery("")} aria-label="Clear search">
                <X size={15} />
              </button>
            )}
          </label>
          <label className="app-select">
            <span className="sr-only">Sort receipts</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="newest">Newest first</option>
              <option value="profit">Highest gross P&amp;L</option>
            </select>
          </label>
        </div>
      </div>
      {receipts.length ? (
        <div className="collection-grid">
          {receipts.map((receipt) => (
            <article className="token-card" key={receipt.id}>
              <button
                className={`token-art sc-${palette(receipt.id)}`}
                onClick={() => setSelected(receipt)}
                aria-label={`View receipt ${receipt.id}`}
              >
                <div className="token-art-top">
                  <span>SYMBIOCHAIN</span>
                  <span>#{receipt.id.slice(0, 8)}</span>
                </div>
                <MetabolismArt pattern={pattern(receipt.id)} />
                <span className="token-art-bottom">
                  <span>PAPER execution receipt</span>
                  <span className="token-view">
                    <ArrowUpRight size={21} />
                  </span>
                </span>
              </button>
              <div className="token-card-title">
                <h2>
                  <button onClick={() => setSelected(receipt)}>
                    Cycle {receipt.cycleId.slice(0, 8)}
                  </button>
                </h2>
                <span>Unminted</span>
              </div>
              <p>{timestamp(receipt.timestamp)} UTC · Simulated</p>
              <dl className="token-stats">
                <div>
                  <dt>Gross trading P&amp;L</dt>
                  <dd>
                    {formatAtoms(receipt.grossPnlAtoms, decimals)}{" "}
                    <span>{asset}</span>
                  </dd>
                </div>
                <div>
                  <dt>Net after approved costs</dt>
                  <dd>
                    {formatAtoms(receipt.approvedNetPnlAtoms, decimals)}{" "}
                    <span>
                      {receipt.approvedNetPnlAtoms === null
                        ? "Unapproved"
                        : asset}
                    </span>
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      ) : (
        <section className="collection-empty">
          <Search size={45} strokeWidth={1} />
          <h2>
            {data
              ? query
                ? "No matching receipts."
                : "No execution receipts yet."
              : "Waiting for the receipt ledger."}
          </h2>
          <p>
            Receipts appear when a backend cycle finishes its cost and
            finalization checks.
          </p>
          {query && (
            <button className="sc-button" onClick={() => setQuery("")}>
              Clear search
            </button>
          )}
        </section>
      )}
      <div className="collection-caption">
        <span>{receipts.length} recent receipts</span>
        <p>
          Artwork identifies a record. No tokens have been minted from these
          PAPER cycles.
        </p>
      </div>
      <section className="collection-note">
        <h2>Each cycle leaves a record.</h2>
        <p>
          Approved net figures use an accountant-approved cost basis, including
          a finalization budget. They are not independently verified realized
          profit. A missing approval remains unknown.
        </p>
      </section>
      <Dialog
        open={!!selected}
        title={
          selected ? `Receipt ${selected.id.slice(0, 8)}` : "Receipt details"
        }
        onClose={() => setSelected(null)}
      >
        {selected && (
          <>
            <div className={`token-detail-art sc-${palette(selected.id)}`}>
              <MetabolismArt pattern={pattern(selected.id)} />
            </div>
            <p>
              This is an unminted PAPER execution receipt. There is no on-chain
              owner or revenue entitlement.
            </p>
            <dl className="sc-transaction-detail">
              <div>
                <dt>Receipt</dt>
                <dd>{selected.id}</dd>
              </div>
              <div>
                <dt>Cycle</dt>
                <dd>{selected.cycleId}</dd>
              </div>
              <div>
                <dt>Gross trading P&amp;L</dt>
                <dd>
                  {formatAtoms(selected.grossPnlAtoms, decimals)} {asset}
                </dd>
              </div>
              <div>
                <dt>Net after approved costs</dt>
                <dd>
                  {formatAtoms(selected.approvedNetPnlAtoms, decimals)}{" "}
                  {selected.approvedNetPnlAtoms === null
                    ? "· Not approved"
                    : asset}
                </dd>
              </div>
              <div>
                <dt>Simulated share</dt>
                <dd>
                  {selected.shareBps === null
                    ? "Not recorded"
                    : `${formatAtoms(String(selected.shareBps), 2)}% · simulation only`}
                </dd>
              </div>
              <div>
                <dt>Cost approval digest</dt>
                <dd>{selected.approvalDigest ?? "Not approved"}</dd>
              </div>
              <div>
                <dt>On-chain status</dt>
                <dd>Not minted</dd>
              </div>
            </dl>
          </>
        )}
      </Dialog>
    </AppShell>
  );
}
