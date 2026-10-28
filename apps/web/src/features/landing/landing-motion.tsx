"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function LandingMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const element = root.current;
      if (!element) return;
      const media = gsap.matchMedia();
      let initialAnchorHandled = false;
      media.add("(prefers-reduced-motion: no-preference)", () => {
        element.classList.add("motion-ready");
        const select = gsap.utils.selector(element);
        const hero = gsap.timeline({ defaults: { ease: "power3.out" } });
        hero
          .from(".hero-eyebrow", { y: 16, opacity: 0, duration: 0.65 })
          .from(
            ".hero-word",
            { yPercent: 75, opacity: 0, duration: 0.9, stagger: 0.1 },
            0.08,
          )
          .from(
            ".hero-ribbon",
            { scale: 0.35, rotate: -24, opacity: 0, duration: 0.85 },
            0.35,
          )
          .from(
            ".hero-description, .hero-scroll",
            { y: 15, opacity: 0, duration: 0.65, stagger: 0.1 },
            0.5,
          )
          .from(".floating-cta", { y: 30, opacity: 0, duration: 0.6 }, 0.65);

        gsap.fromTo(
          ".hero-content",
          { y: 0, opacity: 1 },
          {
            y: () => window.innerHeight * 0.35,
            opacity: 0,
            ease: "none",
            scrollTrigger: {
              trigger: ".hero-section",
              start: "top top",
              end: "65% top",
              scrub: 0.15,
              invalidateOnRefresh: true,
            },
          },
        );
        let pastHero = false;
        let footerVisible = false;
        const updateCta = () =>
          element.classList.toggle("cta-compact", pastHero && !footerVisible);
        const heroObserver = new IntersectionObserver(([entry]) => {
          pastHero = entry ? entry.boundingClientRect.top < 0 : false;
          updateCta();
        });
        const heroMarker = element.querySelector(".hero-cta-marker");
        if (heroMarker) heroObserver.observe(heroMarker);
        const footerObserver = new IntersectionObserver(
          ([entry]) => {
            footerVisible = entry?.isIntersecting ?? false;
            updateCta();
          },
          { rootMargin: "0px 0px -25% 0px" },
        );
        const footer = element.querySelector(".landing-footer");
        if (footer) footerObserver.observe(footer);

        select("[data-reveal]").forEach((node: HTMLElement) => {
          gsap.from(node, {
            y: 34,
            opacity: 0,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: { trigger: node, start: "top 94%", once: true },
          });
        });
        const refresh = () => {
          ScrollTrigger.sort();
          ScrollTrigger.refresh();
        };
        let mounted = true;
        document.fonts.ready.then(() => {
          if (!mounted) return;
          refresh();
          if (initialAnchorHandled) return;
          initialAnchorHandled = true;
          // Initial hash navigation runs before pinned sections add their spacing.
          // Restore the requested section after the final font and pin measurements.
          const hash = window.location.hash.slice(1);
          if (!hash) return;
          let id: string;
          try {
            id = decodeURIComponent(hash);
          } catch {
            return;
          }
          requestAnimationFrame(() => {
            if (mounted)
              document
                .getElementById(id)
                ?.scrollIntoView({ block: "start", behavior: "instant" });
          });
        });
        return () => {
          mounted = false;
          heroObserver.disconnect();
          footerObserver.disconnect();
          element.classList.remove("motion-ready", "cta-compact");
        };
      });

      media.add(
        "(min-width: 1024px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)",
        () => {
          const stage = element.querySelector<HTMLElement>(".story-stage");
          if (!stage) return;
          element.classList.add("has-story-handoff");
          stage.classList.add("is-pinned");
          const frame = stage.querySelector<HTMLElement>(".demo-frame")!;
          const cover = stage.querySelector<HTMLElement>(".demo-cover")!;
          const sidePanels = gsap.utils.toArray<HTMLElement>(
            ".story-left, .story-explanations",
            stage,
          );
          gsap.set(sidePanels, { autoAlpha: 0 });
          gsap.fromTo(
            frame,
            { y: 100 },
            {
              y: 0,
              ease: "none",
              scrollTrigger: {
                trigger: stage,
                start: "top bottom",
                end: "top top+=110",
                scrub: 0.55,
                refreshPriority: 3,
              },
            },
          );
          const cards = gsap.utils.toArray<HTMLElement>(".story-card", stage);
          const bodies = gsap.utils.toArray<HTMLElement>(
            ".story-card-body",
            stage,
          );
          const screens = gsap.utils.toArray<HTMLElement>(
            ".demo-screen",
            stage,
          );
          const descriptions = gsap.utils.toArray<HTMLElement>(
            ".story-explanation",
            stage,
          );
          const activeHeight = () => Math.min(270, window.innerHeight * 0.31);
          gsap.set(cards, { height: 62 });
          gsap.set(cards[0]!, { height: activeHeight });
          gsap.set([bodies.slice(1), screens.slice(1), descriptions.slice(1)], {
            autoAlpha: 0,
          });
          const story = gsap.timeline({
            defaults: { ease: "power2.inOut", duration: 0.7 },
            scrollTrigger: {
              trigger: stage,
              start: "top top+=110",
              end: () => `+=${window.innerHeight * 3.4}`,
              pin: true,
              scrub: 0.65,
              invalidateOnRefresh: true,
              refreshPriority: 2,
            },
          });
          story
            .to({}, { duration: 0.55 })
            .to(cover, { autoAlpha: 0, duration: 0.6 })
            .fromTo(
              sidePanels,
              { autoAlpha: 0, y: 25 },
              { autoAlpha: 1, y: 0, duration: 0.7 },
              "<.15",
            )
            .to({}, { duration: 0.8 });
          for (let i = 1; i < 3; i++) {
            const position = `stage-${i}`;
            story
              .addLabel(position)
              .to(cards[i - 1]!, { height: 62 }, position)
              .to(
                bodies[i - 1]!,
                { autoAlpha: 0, y: -10, duration: 0.3 },
                position,
              )
              .to(cards[i]!, { height: activeHeight }, position)
              .fromTo(
                bodies[i]!,
                { y: 15, autoAlpha: 0 },
                { y: 0, autoAlpha: 1 },
                `${position}+=.2`,
              )
              .to(
                screens[i - 1]!,
                { autoAlpha: 0, y: -25, duration: 0.4 },
                position,
              )
              .fromTo(
                screens[i]!,
                { y: 25, autoAlpha: 0 },
                { y: 0, autoAlpha: 1 },
                `${position}+=.2`,
              )
              .to(
                descriptions[i - 1]!,
                { autoAlpha: 0, y: -20, duration: 0.35 },
                position,
              )
              .fromTo(
                descriptions[i]!,
                { y: 20, autoAlpha: 0 },
                { y: 0, autoAlpha: 1 },
                `${position}+=.2`,
              )
              .to({}, { duration: 0.85 });
          }
          const viewport =
            element.querySelector<HTMLElement>(".security-viewport");
          const track = element.querySelector<HTMLElement>(".security-track");
          if (viewport && track) {
            viewport.classList.add("is-horizontal");
            gsap.to(track, {
              x: () => -Math.max(0, track.scrollWidth - viewport.clientWidth),
              ease: "none",
              scrollTrigger: {
                trigger: viewport,
                start: "top 25%",
                end: () =>
                  `+=${Math.max(600, track.scrollWidth - viewport.clientWidth)}`,
                scrub: 0.7,
                pin: true,
                invalidateOnRefresh: true,
                refreshPriority: 1,
              },
            });
          }
          return () => {
            element.classList.remove("has-story-handoff");
            stage.classList.remove("is-pinned");
            viewport?.classList.remove("is-horizontal");
          };
        },
      );

      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      return () => media.revert();
    },
    { scope: root },
  );

  return (
    <div className="landing" ref={root}>
      {children}
    </div>
  );
}
