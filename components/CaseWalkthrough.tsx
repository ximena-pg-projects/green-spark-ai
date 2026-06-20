"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ClipboardText,
  Calculator,
  ChartBar,
  Brain,
  Megaphone,
  type Icon,
} from "@phosphor-icons/react";

interface Step {
  index: string;
  kicker: string;
  title: string;
  body: string;
  proof: string;
  image: string;
  alt: string;
  photoLabel: string;
  objectPosition?: string;
  icon: Icon;
  tone: string;
}

const STEPS: Step[] = [
  {
    index: "01",
    kicker: "Profile / our school",
    title: "We bring our school into view.",
    body: "We start with size, enrollment and location, then add real utility numbers where we have them. No private student data is required.",
    proof: "8 inputs / zero private records",
    image: "/images/school-profile.jpg",
    alt: "Students gathered for a presentation in a bright school space",
    photoLabel: "School community / profile",
    icon: ClipboardText,
    tone: "bg-botanical text-forest",
  },
  {
    index: "02",
    kicker: "Layer 01 / calculate",
    title: "We translate usage into carbon and cost.",
    body: "Cited EPA, EIA and DOE factors connect our energy, water, waste, transport and food to one defensible baseline.",
    proof: "5 categories / cited factors",
    image: "/images/solar-array.webp",
    alt: "Rows of solar panels beneath a bright sky",
    photoLabel: "Documentary evidence / energy",
    icon: Calculator,
    tone: "bg-mineral text-forest",
  },
  {
    index: "03",
    kicker: "Layer 02 / compare",
    title: "We see where our impact stands out.",
    body: "Each metric is compared with similar schools. Percentiles show us what is typical and where we have the most to gain.",
    proof: "~40 peers / percentile rank",
    image: "/images/school-benchmark.jpg",
    alt: "Students learning together in a classroom",
    photoLabel: "Peer context / compare",
    icon: ChartBar,
    tone: "bg-water text-forest",
  },
  {
    index: "04",
    kicker: "Layer 03 / reason",
    title: "The analysis ranks our strongest moves.",
    body: "The model ranks fixes, explains why they matter to our school, and lowers its confidence when the evidence is thin.",
    proof: "ranked actions / explicit confidence",
    image: "/images/school-analysis.jpg",
    alt: "A classroom working through calculations on large chalkboards",
    photoLabel: "Evidence in practice / reason",
    objectPosition: "50% 46%",
    icon: Brain,
    tone: "bg-amber text-forest",
  },
  {
    index: "05",
    kicker: "Action / make the move",
    title: "We leave with a practical next step.",
    body: "The final view brings together costs, savings, local rebates and clear language our community can act on together.",
    proof: "fundable / explainable / ready",
    image: "/images/school-action.jpg",
    alt: "Students collaborating around laptops at a shared table",
    photoLabel: "Community action / next move",
    icon: Megaphone,
    tone: "bg-botanical-bright text-forest",
  },
];

function CaseVisual({ step }: { step: Step }) {
  return (
    <div className="absolute inset-0 text-mineral">
      <Image
        src={step.image}
        alt={step.alt}
        fill
        sizes="(min-width: 1024px) 34vw, 100vw"
        className="object-cover saturate-[0.76] contrast-115"
        style={{ objectPosition: step.objectPosition ?? "center" }}
      />
      <div className="absolute inset-0 bg-forest/24 mix-blend-multiply" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-forest/75 to-transparent" />
      <div className="absolute left-5 top-5 rounded-full bg-mineral/90 px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-forest">
        {step.photoLabel}
      </div>
      <span className="pointer-events-none absolute bottom-3 right-4 z-20 font-display text-[7rem] leading-none opacity-85 mix-blend-difference lg:text-[9rem]">
        {step.index}
      </span>
    </div>
  );
}

export function CaseWalkthrough() {
  const wrap = useRef<HTMLElement>(null);
  const panels = useRef<HTMLElement[]>([]);

  useEffect(() => {
    if (!wrap.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const items = panels.current.filter(Boolean);
      const media = items.map((item) => item.querySelector("[data-case-media]"));
      const restoreFirstPanel = () => {
        gsap.set(items, {
          autoAlpha: 1,
          clipPath: "inset(0 0 0 100%)",
          xPercent: 5,
          scale: 0.98,
          rotationY: -3,
          transformPerspective: 1400,
          transformOrigin: "center center",
        });
        gsap.set(items[0], {
          clipPath: "inset(0 0 0 0%)",
          xPercent: 0,
          scale: 1,
          rotationY: 0,
        });
        gsap.set(media, { scale: 1.08, yPercent: 3, transformOrigin: "center center" });
        gsap.set(media[0], { scale: 1, yPercent: 0 });
      };

      restoreFirstPanel();

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: wrap.current,
          start: "top top",
          end: `+=${items.length * 900}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onLeaveBack: restoreFirstPanel,
          onRefresh: (self) => {
            if (self.progress === 0) restoreFirstPanel();
          },
        },
      });

      items.forEach((item, index) => {
        if (index === 0) return;
        timeline
          .to(items[index - 1], {
            xPercent: -3,
            scale: 0.995,
            rotationY: 1.5,
            duration: 1,
            ease: "none",
          })
          .fromTo(
            item,
            {
              clipPath: "inset(0 0 0 100%)",
              xPercent: 5,
              scale: 0.98,
              rotationY: -3,
            },
            {
              clipPath: "inset(0 0 0 0%)",
              xPercent: 0,
              scale: 1,
              rotationY: 0,
              duration: 1,
              ease: "none",
            },
            "<",
          )
          .fromTo(
            media[index],
            { scale: 1.08, yPercent: 3 },
            { scale: 1, yPercent: 0, duration: 1, ease: "none" },
            "<",
          );
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section id="walkthrough" ref={wrap} data-case-walkthrough className="relative overflow-hidden border-b border-line-strong bg-forest text-mineral">
      <div className="campaign-grid absolute inset-0 opacity-40" aria-hidden />
      <div className="relative mx-auto grid w-full max-w-[1600px] gap-12 px-5 py-20 sm:px-8 lg:h-dvh lg:grid-cols-12 lg:gap-0 lg:px-12 lg:py-0">
        <div className="flex flex-col justify-between lg:col-span-4 lg:py-16 lg:pr-12">
          <div>
            <span className="campaign-stamp border-botanical-bright text-botanical-bright">How we understand our school</span>
            <h2 className="mt-8 font-display text-[clamp(3.4rem,5.5vw,6.4rem)] font-semibold leading-[0.88] tracking-[-0.055em]">
              From footprint<br /><span className="text-botanical-bright">to next move.</span>
            </h2>
          </div>
          <div className="mt-12">
            <p className="max-w-[38ch] text-base leading-[1.55] text-muted">Five stages help us turn ordinary school data into decisions we can explain and fund.</p>
          </div>
        </div>

        <div className="relative grid gap-6 [perspective:1400px] lg:col-span-8 lg:block lg:py-16 lg:pl-12">
          {STEPS.map((step, index) => {
            const Ico = step.icon;
            return (
              <article
                key={step.index}
                data-case-panel={step.index}
                ref={(node) => { if (node) panels.current[index] = node; }}
                className="relative overflow-hidden rounded-[1.5rem] bg-panel shadow-[0_40px_120px_oklch(0.08_0.03_158_/_0.32)] lg:absolute lg:inset-y-16 lg:left-12 lg:right-0"
              >
                <div className="grid min-h-[620px] lg:h-full lg:grid-cols-[1.02fr_0.98fr]">
                  <div data-case-media className="relative min-h-[300px] overflow-hidden image-halftone">
                    <CaseVisual step={step} />
                  </div>
                  <div className={`flex flex-col justify-between p-8 ${step.tone}`}>
                    <div className="flex items-center justify-between border-b border-current pb-4">
                      <Ico className="h-8 w-8" weight="bold" />
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em]">{step.kicker}</span>
                    </div>
                    <div className="py-12">
                      <h3 className="font-display text-[clamp(2.5rem,3.7vw,4.8rem)] font-semibold leading-[0.92] tracking-[-0.05em]">{step.title}</h3>
                      <p className="mt-6 max-w-[52ch] text-lg leading-[1.5]">{step.body}</p>
                    </div>
                    <p className="border-t border-current pt-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em]">{step.proof}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
