import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Header } from "./header";
import { RibbonMark } from "./brand";
import { SwarmDots } from "./artwork";
import { AgentStory } from "./agent-story";
import { Features, Agents, Security, Faq, Footer } from "./sections";
import { Chains } from "./chain-directory";
import { LandingMotion } from "./landing-motion";
import "./landing.css";

export function LandingPage() {
  return (
    <LandingMotion>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Header />
      <Link
        href="/dashboard"
        className="floating-cta"
        aria-label="Open dashboard"
      >
        <SwarmDots />
        <span className="floating-cta-label">Open dashboard</span>
        <ArrowUpRight
          className="floating-cta-arrow"
          size={19}
          aria-hidden="true"
        />
      </Link>
      <main id="main-content" className="landing-main">
        <section className="hero-section">
          <span className="hero-cta-marker" aria-hidden="true" />
          <div className="hero-content content-width">
            <p className="hero-eyebrow">
              Autonomous AI agents
              <br />
              on NEAR.
            </p>
            <h1 className="hero-title" aria-label="Stay alive.">
              <span className="hero-word" aria-hidden="true">
                Stay
              </span>
              <span className="hero-ribbon" aria-hidden="true">
                <RibbonMark hero />
              </span>
              <span className="hero-word" aria-hidden="true">
                alive.
              </span>
            </h1>
            <p className="hero-description">
              A swarm designed to find trading opportunities,
              <br className="desktop-break" /> assess risk privately, and fund
              its own compute.
            </p>
            <div className="hero-actions">
              <Link className="primary-button hero-primary" href="/dashboard">
                <SwarmDots />
                Open dashboard
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
              <a href="#how-it-works" className="hero-scroll">
                See how it works <ArrowDown size={17} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>
        <AgentStory />
        <Chains />
        <Features />
        <Agents />
        <Security />
        <Faq />
      </main>
      <Footer />
    </LandingMotion>
  );
}
