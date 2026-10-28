"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { BrainArt, EyeArt, HandArt } from "./artwork";
import { RibbonMark } from "./brand";

const stickerCount = 15;

function Sticker({ index }: { index: number }) {
  switch (index % 5) {
    case 0:
      return (
        <Image
          src="/chains/near.svg"
          alt=""
          width={80}
          height={80}
          unoptimized
        />
      );
    case 1:
      return <RibbonMark />;
    case 2:
      return <EyeArt />;
    case 3:
      return <BrainArt />;
    default:
      return <HandArt />;
  }
}

export function FooterHeadline() {
  const title = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const element = title.current;
      if (!element) return;
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const phrases = element.querySelectorAll<HTMLElement>(".footer-phrase");
        const first = phrases[0];
        const second = phrases[1];
        if (!first || !second) return;
        const firstText = first.querySelector<HTMLElement>("span");
        const secondText = second.querySelector<HTMLElement>("span");
        if (!firstText || !secondText) return;
        const reveal = { first: 1, second: 0 };
        const render = () => {
          first.style.width = `${firstText.getBoundingClientRect().width * reveal.first}px`;
          second.style.width = `${secondText.getBoundingClientRect().width * reveal.second}px`;
        };
        render();
        const resize = new ResizeObserver(render);
        resize.observe(firstText);
        resize.observe(secondText);
        const loop = gsap.timeline({
          paused: true,
          repeat: -1,
          defaults: { ease: "none", onUpdate: render },
        });
        loop
          .to(reveal, { first: 0, duration: 0.65 }, "+=4.5")
          .to(reveal, { second: 1, duration: 0.8 }, "+=0.85")
          .to(reveal, { second: 0, duration: 0.7 }, "+=6.5")
          .to(reveal, { first: 1, duration: 0.7 }, "+=0.85");

        let visible = false;
        const update = () => {
          loop.paused(!visible || document.hidden);
        };
        const observer = new IntersectionObserver(
          ([entry]) => {
            visible = entry?.isIntersecting ?? false;
            update();
          },
          { threshold: 0.15 },
        );
        observer.observe(element);
        document.addEventListener("visibilitychange", update);
        return () => {
          observer.disconnect();
          resize.disconnect();
          first.style.removeProperty("width");
          second.style.removeProperty("width");
          document.removeEventListener("visibilitychange", update);
        };
      });
      return () => media.revert();
    },
    { scope: title },
  );

  return (
    <p
      ref={title}
      className="footer-title"
      aria-label="Stay alive. Think ahead."
    >
      <span className="footer-phrase" aria-hidden="true">
        <span>Stay alive</span>
      </span>
      <span className="footer-phrase footer-phrase--next" aria-hidden="true">
        <span>Think ahead</span>
      </span>
      <span aria-hidden="true">.</span>
    </p>
  );
}

export function FooterCursorTrail() {
  const layer = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const element = layer.current;
      const footer = element?.closest("footer");
      if (!element || !footer) return;
      const media = gsap.matchMedia();
      media.add(
        "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
        () => {
          const stickers = Array.from(element.children) as HTMLElement[];
          gsap.set(stickers, { xPercent: -50, yPercent: -50, opacity: 0 });
          let previous: { x: number; y: number } | null = null;
          let index = 0;
          let idleTimer: ReturnType<typeof setTimeout> | undefined;
          let holding = false;

          const visibleStickers = () =>
            stickers.filter(
              (sticker) => Number(gsap.getProperty(sticker, "opacity")) > 0,
            );
          const release = () => {
            const visible = visibleStickers();
            if (!visible.length) {
              holding = false;
              return;
            }
            gsap.killTweensOf(visible);
            gsap.to(visible, {
              opacity: 0,
              scale: 0.15,
              duration: 0.3,
              ease: "power1.out",
            });
            holding = false;
          };
          const holdWhenStopped = () => {
            const visible = visibleStickers();
            if (!visible.length) return;
            holding = true;
            gsap.killTweensOf(visible);
            gsap.to(visible, {
              opacity: 0,
              scale: 0.15,
              delay: 0.85,
              duration: 0.3,
              ease: "power1.out",
            });
          };

          const move = (event: PointerEvent) => {
            if (event.pointerType !== "mouse" || document.hidden) return;
            clearTimeout(idleTimer);
            if (holding) release();
            // Detect a stop after 50 ms; the remaining hold totals 0.9 s from the last movement.
            idleTimer = setTimeout(holdWhenStopped, 50);
            const bounds = footer.getBoundingClientRect();
            const point = {
              x: event.clientX - bounds.left,
              y: event.clientY - bounds.top,
            };
            const spacing = Math.max(
              42,
              Math.min(70, window.innerWidth * 0.034),
            );
            if (!previous) {
              previous = point;
              return;
            }
            const distance = Math.hypot(
              point.x - previous.x,
              point.y - previous.y,
            );
            if (distance < spacing) return;
            // Interpolate along fast mouse movements instead of piling stamps at the endpoint.
            const steps = Math.min(4, Math.floor(distance / spacing));
            const start = previous;
            for (let step = 1; step <= steps; step++) {
              const sticker = stickers[index % stickers.length];
              if (!sticker) continue;
              const fraction = step / steps;
              const rotation = ((index * 29) % 43) - 21;
              gsap.killTweensOf(sticker);
              gsap.set(sticker, {
                x: start.x + (point.x - start.x) * fraction,
                y: start.y + (point.y - start.y) * fraction,
                rotation,
                scale: 0.65,
                opacity: 1,
                zIndex: index + 1,
              });
              gsap
                .timeline()
                .to(sticker, {
                  scale: 1,
                  duration: 0.05,
                  ease: "back.out(1.6)",
                })
                .to(
                  sticker,
                  {
                    scale: 0.15,
                    opacity: 0,
                    duration: 0.22,
                    ease: "power1.out",
                  },
                  "+=0.03",
                );
              index++;
            }
            previous = point;
          };
          const leave = () => {
            previous = null;
            clearTimeout(idleTimer);
            release();
          };
          footer.addEventListener("pointermove", move, { passive: true });
          footer.addEventListener("pointerleave", leave);
          return () => {
            footer.removeEventListener("pointermove", move);
            footer.removeEventListener("pointerleave", leave);
            clearTimeout(idleTimer);
            gsap.killTweensOf(stickers);
          };
        },
      );
      return () => media.revert();
    },
    { scope: layer },
  );

  return (
    <div ref={layer} className="footer-cursor-trail" aria-hidden="true">
      {Array.from({ length: stickerCount }, (_, index) => (
        <span
          key={index}
          className={`cursor-sticker cursor-sticker--${index % 5}`}
        >
          <Sticker index={index} />
        </span>
      ))}
    </div>
  );
}
