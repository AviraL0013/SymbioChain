"use client";

import Image from "next/image";
import { Search, X } from "lucide-react";
import { useRef, useState, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { networks, type Network } from "./networks";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function NetworkRow({ network }: { network: Network }) {
  return (
    <li className="chain-row">
      <span
        className="chain-badge"
        style={{ backgroundColor: network.color } as CSSProperties}
      >
        <Image
          src={network.icon}
          alt=""
          width={40}
          height={40}
          unoptimized
          loading="eager"
        />
      </span>
      <span>{network.name}</span>
    </li>
  );
}

export function Chains() {
  const section = useRef<HTMLElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const searching = query.trim().length > 0;
  const matches = networks.filter((network) =>
    network.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  useGSAP(
    () => {
      const element = section.current;
      if (!element) return;
      const media = gsap.matchMedia();
      media.add(
        "(min-width: 1024px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)",
        () => {
          const wheel = element.querySelector<HTMLElement>(".chain-mask")!;
          const rows = gsap.utils.toArray<HTMLElement>(
            ".network-wheel > .chain-row",
            element,
          );
          element.classList.add("has-chain-wheel");
          wheel.classList.add("is-wheel");
          gsap.set(rows, { yPercent: -50, y: 0, opacity: 1 });
          const setters = rows.map((row) => ({
            x: gsap.quickSetter(row, "x", "px"),
            y: gsap.quickSetter(row, "y", "px"),
            opacity: gsap.quickSetter(row, "opacity"),
          }));
          const position = { progress: 0 };
          let step = 100;
          let circumference = step * networks.length;
          let height = 600;
          let drift = 0;
          let direction = 1;
          let visible = false;

          function render() {
            const wrap = gsap.utils.wrap(-circumference / 2, circumference / 2);
            const offset =
              (position.progress * networks.length + drift + 4) * step;
            const radius = height * 0.95;
            setters.forEach((setter, index) => {
              const y = wrap(index * step - offset);
              const distance = Math.abs(y) / (height * 0.51);
              const arcY = Math.min(Math.abs(y), height * 0.55);
              setter.x(radius - Math.sqrt(radius * radius - arcY * arcY));
              setter.y(y);
              setter.opacity(Math.max(0, 1 - Math.pow(distance, 1.7)));
            });
          }

          function measure() {
            step = Math.max(76, (rows[0]?.offsetHeight ?? 76) + 20);
            circumference = step * networks.length;
            height = wheel.clientHeight;
            render();
          }

          measure();
          gsap.to(position, {
            progress: 1,
            ease: "none",
            scrollTrigger: {
              trigger: element,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.65,
              onRefresh: measure,
              onToggle: (self) => {
                visible = self.isActive;
              },
              onUpdate: (self) => {
                direction = self.direction;
                visible = self.isActive;
              },
            },
          });

          function tick(_time: number, deltaMs: number) {
            if (
              !visible ||
              document.hidden ||
              wheel.classList.contains("is-filtered")
            )
              return;
            // Keep the wheel alive at rest; scroll adds travel in the same direction.
            drift = gsap.utils.wrap(
              0,
              networks.length,
              drift + (direction * Math.min(deltaMs, 64)) / 2600,
            );
            render();
          }
          gsap.ticker.add(tick);

          return () => {
            gsap.ticker.remove(tick);
            element.classList.remove("has-chain-wheel");
            wheel.classList.remove("is-wheel");
          };
        },
      );
      return () => media.revert();
    },
    { scope: section },
  );

  function clearSearch() {
    setQuery("");
    input.current?.focus();
  }

  return (
    <section
      ref={section}
      id="networks"
      className="chain-section content-width section-space"
      aria-labelledby="networks-heading"
    >
      <div className="chain-directory-copy" data-reveal>
        <h2 id="networks-heading">
          Cross-chain.
          <br />
          One swarm.
        </h2>
        <p className="section-description">
          Explore the wider network ecosystem. NEAR coordinates SymbioChain;
          Ethereum and Solana are its planned execution destinations.
        </p>
        <form
          role="search"
          className="chain-search"
          onSubmit={(event) => event.preventDefault()}
        >
          <label htmlFor="network-search" className="sr-only">
            Search networks
          </label>
          <input
            ref={input}
            id="network-search"
            type="search"
            placeholder="Search"
            value={query}
            maxLength={80}
            autoComplete="off"
            aria-controls="network-results"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") clearSearch();
            }}
          />
          {searching ? (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear network search"
            >
              <X size={23} aria-hidden="true" />
            </button>
          ) : (
            <Search size={25} aria-hidden="true" />
          )}
        </form>
        <p className="chain-search-status" role="status" aria-live="polite">
          {searching
            ? `${matches.length} ${matches.length === 1 ? "network" : "networks"} found`
            : `${networks.length} networks in the directory`}
        </p>
      </div>
      <div
        id="network-results"
        className={`chain-mask${searching ? " is-filtered" : ""}`}
      >
        <ul
          className="network-wheel"
          aria-label="Network directory"
          aria-hidden={searching || undefined}
        >
          {networks.map((network) => (
            <NetworkRow key={network.name} network={network} />
          ))}
        </ul>
        {searching && (
          <div className="chain-search-results">
            {matches.length ? (
              <ul aria-label="Matching networks">
                {matches.map((network) => (
                  <NetworkRow key={network.name} network={network} />
                ))}
              </ul>
            ) : (
              <p className="chain-empty">
                No networks found.
                <button type="button" onClick={clearSearch}>
                  Clear search
                </button>
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
