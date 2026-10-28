"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Search, Wallet, X } from "lucide-react";
import { AppShell, WalletPreview } from "@/features/application/app-shell";
import { Dialog } from "@/components/ui/dialog";
import { filterTokens, type SampleToken } from "./collection-data";
import { MetabolismArt } from "./metabolism-art";

export function NftsPage() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [owned, setOwned] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [selected, setSelected] = useState<SampleToken | null>(null);
  const tokens = useMemo(() => filterTokens(query, sort), [query, sort]);
  return (
    <AppShell
      title="Proof of Metabolism"
      description="A record of the swarm’s earning cycles."
      notice="Sample NFT collection. No tokens have been minted."
    >
      <div className="collection-toolbar">
        <div
          className="collection-tabs"
          role="group"
          aria-label="Collection view"
        >
          <button aria-pressed={!owned} onClick={() => setOwned(false)}>
            All samples <span>03</span>
          </button>
          <button aria-pressed={owned} onClick={() => setOwned(true)}>
            Owned by me
          </button>
        </div>
        <div className="collection-tools">
          <label className="collection-search">
            <Search size={17} />
            <span className="sr-only">Search tokens</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or number"
              disabled={owned}
            />
            {query && (
              <button onClick={() => setQuery("")} aria-label="Clear search">
                <X size={15} />
              </button>
            )}
          </label>
          <label className="app-select">
            <span className="sr-only">Sort tokens</span>
            <select
              value={sort}
              disabled={owned}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="newest">Newest first</option>
              <option value="profit">Highest profit</option>
              <option value="liquidity">Most liquidity</option>
            </select>
          </label>
        </div>
      </div>
      {owned ? (
        <section className="collection-empty">
          <Wallet size={52} strokeWidth={1} />
          <h2>Your collection starts with your wallet.</h2>
          <p>
            Connect a wallet after integration to see the NFTs you own.
            Ownership is not available in this preview.
          </p>
          <button
            className="sc-button sc-button-dark"
            onClick={() => setWalletOpen(true)}
          >
            Connect wallet <ArrowUpRight size={16} />
          </button>
          <button className="sc-text-button" onClick={() => setOwned(false)}>
            Browse sample collection
          </button>
        </section>
      ) : tokens.length ? (
        <div className="collection-grid">
          {tokens.map((token) => (
            <article className="token-card" key={token.id}>
              <button
                className={`token-art sc-${token.palette}`}
                onClick={() => setSelected(token)}
                aria-label={`View Metabolism ${token.id}`}
              >
                <div className="token-art-top">
                  <span>SYMBIOCHAIN</span>
                  <span>#{token.id}</span>
                </div>
                <MetabolismArt pattern={token.pattern} />
                <span className="token-art-bottom">
                  <span>Proof of Metabolism</span>
                  <span className="token-view">
                    <ArrowUpRight size={21} />
                  </span>
                </span>
              </button>
              <div className="token-card-title">
                <h2>
                  <button onClick={() => setSelected(token)}>
                    Metabolism #{token.id}
                  </button>
                </h2>
                <span>Sample</span>
              </div>
              <p>{token.name}</p>
              <dl className="token-stats">
                <div>
                  <dt>Profit generated</dt>
                  <dd>
                    {token.profit.toFixed(2)} <span>USDC</span>
                  </dd>
                </div>
                <div>
                  <dt>Liquidity held</dt>
                  <dd>
                    {token.liquidity} <span>NEAR</span>
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      ) : (
        <section className="collection-empty">
          <Search size={45} strokeWidth={1} />
          <h2>No matching tokens.</h2>
          <p>Try a cycle name or a token number, such as 001.</p>
          <button className="sc-button" onClick={() => setQuery("")}>
            Clear search
          </button>
        </section>
      )}
      {!owned && (
        <div className="collection-caption">
          <span>
            {tokens.length} sample {tokens.length === 1 ? "token" : "tokens"}
          </span>
          <p>
            Illustrative profit and liquidity. No minting or on-chain ownership
            is represented.
          </p>
        </div>
      )}
      <section className="collection-note">
        <h2>Each cycle leaves a record.</h2>
        <p>
          Proof of Metabolism is designed to link a swarm’s earned profit with
          its liquidity. Mint details, settlement references, and ownership will
          come from the deployed contract.
        </p>
      </section>
      <WalletPreview open={walletOpen} onClose={() => setWalletOpen(false)} />
      <Dialog
        open={!!selected}
        title={selected ? `Metabolism #${selected.id}` : "Token details"}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <>
            <div className={`token-detail-art sc-${selected.palette}`}>
              <MetabolismArt pattern={selected.pattern} />
            </div>
            <p>
              This is a sample token. It has not been minted and has no on-chain
              owner or settlement transaction.
            </p>
            <dl className="sc-transaction-detail">
              <div>
                <dt>Cycle</dt>
                <dd>{selected.name}</dd>
              </div>
              <div>
                <dt>Sample profit</dt>
                <dd>{selected.profit.toFixed(2)} USDC</dd>
              </div>
              <div>
                <dt>Sample liquidity</dt>
                <dd>{selected.liquidity} NEAR</dd>
              </div>
              <div>
                <dt>Token standard</dt>
                <dd>NEP-171 (planned)</dd>
              </div>
              <div>
                <dt>Owner</dt>
                <dd>Not minted</dd>
              </div>
            </dl>
            <div className="sc-dialog-note">
              NEAR explorer and settlement links will appear when a real token
              is available.
            </div>
            <button
              className="sc-button sc-dialog-primary"
              onClick={() => setSelected(null)}
            >
              Back to collection
            </button>
          </>
        )}
      </Dialog>
    </AppShell>
  );
}
