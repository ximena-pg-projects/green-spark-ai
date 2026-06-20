"use client";

// components/StackedImpacts.tsx
// Ranked opportunities move as one horizontal evidence rail on desktop. The
// user's vertical scroll scrubs the rail, without a visible tracker or page
// counter. Smaller screens and reduced-motion users keep native horizontal
// scrolling with snap points and no pinning.

import { Children, type ReactNode, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function StackedImpacts({ children }: { children: ReactNode }) {
  const items = Children.toArray(children);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!viewport.current || !track.current || items.length < 2) return;
    const viewportElement = viewport.current;
    const trackElement = track.current;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      () => {
        const distance = () =>
          Math.max(0, trackElement.scrollWidth - viewportElement.clientWidth);

        const horizontalTween = gsap.to(trackElement, {
          x: () => -distance(),
          ease: "none",
          paused: true,
        });

        const trigger = ScrollTrigger.create({
          trigger: viewportElement,
          start: "top top+=88",
          end: () => `+=${Math.max(1, distance())}`,
          pin: true,
          scrub: 0.9,
          animation: horizontalTween,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        });

        return () => {
          trigger.kill();
          horizontalTween.kill();
          gsap.set(trackElement, { clearProps: "transform" });
        };
      },
    );

    return () => mm.revert();
  }, [items.length]);

  return (
    <div
      ref={viewport}
      className="relative w-full max-w-full overflow-x-auto overscroll-x-contain pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:min-h-[calc(100dvh-112px)] lg:overflow-hidden lg:pb-0"
    >
      <div
        ref={track}
        className="flex w-max items-stretch gap-6 pr-5 sm:pr-8 lg:min-h-[calc(100dvh-112px)] lg:gap-10 lg:pr-[18vw]"
      >
        {items.map((child, index) => (
          <article
            key={index}
            className="h-auto shrink-0 snap-start lg:flex lg:min-h-[calc(100dvh-112px)] lg:items-center"
            style={{ width: "min(78vw, 860px)" }}
          >
            <div className="w-full">{child}</div>
          </article>
        ))}
      </div>
    </div>
  );
}
