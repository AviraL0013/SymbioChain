import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Cpu,
  Fingerprint,
  KeyRound,
  SlidersHorizontal,
} from "lucide-react";
import { agents, faqs } from "./content";
import { FooterCursorTrail, FooterHeadline } from "./footer-effects";
import {
  BrainArt,
  ChainMark,
  EnclaveArt,
  EyeArt,
  HandArt,
  LoopArt,
  TokenArt,
} from "./artwork";

function ComputeArt() {
  return (
    <div className="compute-art" aria-hidden="true">
      <div className="compute-ticket ticket-blue">
        <span>Opportunity</span>
        <EyeArt />
      </div>
      <div className="compute-ticket ticket-yellow">
        <span>Inference</span>
        <Cpu size={68} strokeWidth={1.4} />
      </div>
      <div className="compute-ticket ticket-pink">
        <span>Next thought</span>
        <BrainArt />
      </div>
      <span className="compute-arrow">
        <ArrowRight size={28} />
      </span>
    </div>
  );
}

export function Features() {
  return (
    <section className="feature-section section-space">
      <div className="content-width">
        <h2 className="statement" data-reveal>
          Find opportunity.
          <br />
          Fund the next thought.
        </h2>
        <div className="feature-row">
          <div className="feature-copy" data-reveal>
            <span className="feature-index">01</span>
            <h3>
              Compute
              <br />
              has a cost.
            </h3>
            <p>
              The swarm tracks its treasury against the cost of running its
              agents.
            </p>
          </div>
          <div className="feature-art feature-art--compute" data-reveal>
            <ComputeArt />
            <span className="art-caption">
              A signal becomes the next thought.
            </span>
          </div>
        </div>
        <div className="feature-row feature-row--reverse">
          <div className="feature-copy" data-reveal>
            <span className="feature-index">02</span>
            <h3>
              Survival is
              <br />
              the constraint.
            </h3>
            <p>
              A metabolic rule is designed to tie continued operation to
              available funds.
            </p>
          </div>
          <div className="feature-art feature-art--loop" data-reveal>
            <LoopArt />
            <span className="art-caption">Find. Assess. Execute. Repeat.</span>
          </div>
        </div>
        <div className="feature-row">
          <div className="feature-copy" data-reveal>
            <span className="feature-index">03</span>
            <h3>
              Proof follows
              <br />
              the work.
            </h3>
            <p>
              The planned Proof of Metabolism NFTs connect swarm activity with
              on-chain records.
            </p>
            <Link className="text-link" href="/nfts">
              Explore the NFT gallery{" "}
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <div className="feature-art feature-art--token" data-reveal>
            <div className="metabolism-card">
              <div className="token-card-heading">
                <span>Proof of Metabolism</span>
                <span>Concept</span>
              </div>
              <TokenArt />
              <span className="token-card-foot">
                A record of the loop.
                <ArrowUpRight size={20} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Agents() {
  const art = [EyeArt, BrainArt, HandArt];
  return (
    <section id="agents" className="agents-section content-width section-space">
      <div className="section-heading-row" data-reveal>
        <div>
          <p className="eyebrow">Independent minds. Shared purpose.</p>
          <h2>Meet the swarm.</h2>
        </div>
        <Link href="/topology" className="text-link">
          Explore the topology <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </div>
      <div className="agents-grid">
        {agents.map((agent, i) => {
          const Illustration = art[i]!;
          return (
            <article
              className={`agent-card pastel-${agent.color}`}
              key={agent.name}
              data-reveal
            >
              <div className="agent-card-top">
                <span>{agent.name}</span>
                <span>{agent.step}</span>
              </div>
              <h3>{agent.role}</h3>
              <p>{agent.summary}</p>
              <Illustration className="agent-card-art" />
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function Security() {
  return (
    <section id="privacy" className="security-section section-space">
      <div className="content-width section-intro" data-reveal>
        <p className="eyebrow">Private by design</p>
        <h2>
          Private reasoning.
          <br />
          Visible proof.
        </h2>
        <p className="section-description">
          The architecture separates assessment, signing, and execution so each
          step can be inspected.
        </p>
        <Link className="text-link" href="/verify">
          Open the proof verifier <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </div>
      <div className="security-viewport content-width">
        <div className="security-track">
          <article className="security-card">
            <span className="security-icon">
              <Cpu size={21} />
            </span>
            <h3>TEE assessment</h3>
            <p>
              Risk inference is intended to run inside a trusted execution
              environment.
            </p>
            <EnclaveArt />
          </article>
          <article className="security-card">
            <span className="security-icon">
              <KeyRound size={21} />
            </span>
            <h3>Signing boundaries</h3>
            <p>
              Chain Signatures supports the planned cross-chain signing flow
              from NEAR.
            </p>
            <div className="signing-art" aria-hidden="true">
              <div className="signing-key">
                <KeyRound size={52} strokeWidth={1.5} />
              </div>
              <div className="signing-chains">
                <span className="pastel-blue">
                  <ChainMark chain="ethereum" />
                </span>
                <span className="pastel-pink">
                  <ChainMark chain="solana" />
                </span>
              </div>
            </div>
          </article>
          <article className="security-card">
            <span className="security-icon">
              <SlidersHorizontal size={21} />
            </span>
            <h3>Agent policies</h3>
            <p>
              Separate accounts and policies define the actions each agent may
              take.
            </p>
            <div className="policy-art" aria-hidden="true">
              {agents.map((agent, i) => (
                <div key={agent.name}>
                  <span className={`pastel-${agent.color}`}>{agent.name}</span>
                  <i
                    style={
                      {
                        "--position": `${[65, 35, 75][i]}%`,
                      } as React.CSSProperties
                    }
                  >
                    <b />
                  </i>
                </div>
              ))}
            </div>
          </article>
          <article className="security-card">
            <span className="security-icon">
              <Fingerprint size={21} />
            </span>
            <h3>Proof visibility</h3>
            <p>
              Attestations and transaction records are intended to make activity
              inspectable.
            </p>
            <div className="proof-art" aria-hidden="true">
              <Fingerprint size={76} strokeWidth={1.2} />
              <span>Assessment</span>
              <span>Signing</span>
              <span>Execution</span>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section id="faq" className="faq-section content-width section-space">
      <div className="section-heading-row" data-reveal>
        <h2>FAQ</h2>
        <p>Questions are part of the process.</p>
      </div>
      <div className="faq-list">
        {faqs.map(([question, answer]) => (
          <details key={question}>
            <summary>
              {question}
              <span className="faq-plus" aria-hidden="true" />
            </summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="landing-footer" id="footer">
      <div className="content-width">
        <div className="footer-invitation">
          <p>Meet your swarm.</p>
          <Link href="/dashboard" className="footer-outline">
            Follow the loop from signal to execution.
            <span>
              Open Mission Control <ArrowUpRight size={22} aria-hidden="true" />
            </span>
          </Link>
        </div>
        <FooterHeadline />
        <div className="footer-links">
          <span className="footer-brand">SymbioChain</span>
          <nav aria-label="Product">
            <span>Product</span>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/topology">Topology</Link>
            <Link href="/nfts">NFT gallery</Link>
          </nav>
          <nav aria-label="Explore">
            <span>Explore</span>
            <a href="#how-it-works">How it works</a>
            <a href="#agents">Agents</a>
            <a href="#faq">FAQ</a>
          </nav>
          <nav aria-label="Proof">
            <span>Proof</span>
            <a href="#privacy">Privacy</a>
            <Link href="/verify">TEE verifier</Link>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>Built on NEAR.</span>
          <span>An autonomous swarm. A shared survival loop.</span>
        </div>
      </div>
      <FooterCursorTrail />
    </footer>
  );
}
