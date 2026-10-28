import {
  ArrowDown,
  ArrowUpRight,
  Fingerprint,
  ScanLine,
  Shield,
  Sparkles,
} from "lucide-react";
import { agents } from "./content";
import {
  EyeArt,
  BrainArt,
  HandArt,
  ChainMark,
  LoopArt,
  TokenArt,
} from "./artwork";
import { RibbonMark } from "./brand";

const illustrations = [EyeArt, BrainArt, HandArt];
const icons = [ScanLine, Shield, Fingerprint];

export function AgentStory() {
  return (
    <section id="how-it-works" className="agent-story section-space">
      <div className="section-intro story-intro content-width" data-reveal>
        <p className="eyebrow">How it works</p>
        <h2>
          Three agents.
          <br />
          One survival loop.
        </h2>
        <p className="section-description">
          EYE finds the signal. BRAIN weighs the risk.
          <br className="desktop-break" /> HAND prepares the execution.
        </p>
      </div>
      <ol className="sr-only">
        {agents.map((agent) => (
          <li key={agent.name}>
            {agent.name}: {agent.description}
          </li>
        ))}
      </ol>
      <div className="story-stage content-width" aria-hidden="true">
        <div className="story-left">
          {agents.map((agent, i) => {
            const Icon = icons[i]!;
            return (
              <article
                key={agent.name}
                className={`story-card pastel-${agent.color}`}
              >
                <div className="story-card-label">
                  <span>{agent.name}</span>
                  <Icon size={22} />
                </div>
                <div className="story-card-body">
                  <h3>{agent.title}</h3>
                  <p className="story-mobile-copy">{agent.description}</p>
                </div>
              </article>
            );
          })}
        </div>
        <div className="demo-frame">
          <div className="demo-cover">
            <span className="cover-sticker cover-sticker--eye">
              <EyeArt />
            </span>
            <span className="cover-sticker cover-sticker--brain">
              <BrainArt />
            </span>
            <span className="cover-sticker cover-sticker--hand">
              <HandArt />
            </span>
            <span className="cover-sticker cover-sticker--loop">
              <LoopArt />
            </span>
            <span className="cover-sticker cover-sticker--token">
              <TokenArt />
            </span>
            <span className="cover-logo">
              <RibbonMark />
            </span>
          </div>
          <div className="demo-topbar">
            <span className="demo-wordmark">SymbioChain</span>
            <span className="demo-symbol">
              <Sparkles size={15} />
            </span>
          </div>
          <div className="demo-screens">
            {agents.map((agent, i) => {
              const Illustration = illustrations[i]!;
              return (
                <div
                  key={agent.name}
                  className={`demo-screen demo-screen-${i}`}
                >
                  <div className="demo-step">
                    <span className={`agent-dot pastel-${agent.color}`} />
                    {agent.name}
                    <span>{agent.step} / 03</span>
                  </div>
                  <h3>{agent.screen}</h3>
                  <Illustration className="demo-illustration" />
                  {i === 0 ? (
                    <div className="signal-route">
                      <span>
                        <ChainMark chain="near" /> NEAR
                      </span>
                      <ArrowUpRight size={18} />
                      <span>
                        <ChainMark chain="solana" /> Solana
                      </span>
                    </div>
                  ) : i === 1 ? (
                    <div className="assessment-list">
                      <span>
                        <i /> Agent policy
                      </span>
                      <span>
                        <i /> Compute cost
                      </span>
                      <span>
                        <i /> Execution risk
                      </span>
                    </div>
                  ) : (
                    <div className="signing-flow">
                      <span>NEAR</span>
                      <ArrowDown size={16} />
                      <span>Chain Signatures</span>
                      <ArrowDown size={16} />
                      <span>Ethereum / Solana</span>
                    </div>
                  )}
                  <div className="demo-task">
                    {agent.task}
                    <ArrowUpRight size={15} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="demo-caption">Illustrative sequence</div>
        </div>
        <div className="story-explanations">
          {agents.map((agent) => (
            <div className="story-explanation" key={agent.name}>
              <span className="explanation-step">
                {agent.step} / {agent.role}
              </span>
              <p>{agent.description}</p>
              <span className="explanation-foot">
                Part of the same loop.
                <span className={`small-agent pastel-${agent.color}`} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
