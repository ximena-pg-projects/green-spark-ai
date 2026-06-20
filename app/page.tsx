"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  ShieldCheck,
  Gauge,
  SlidersHorizontal,
  Gift,
  Megaphone,
  type Icon,
} from "@phosphor-icons/react";
import demoSchool from "@/data/school.json";
import { estimateFromProfile } from "@/lib/estimate";
import { buildEvidencePacket } from "@/lib/benchmarks";
import { SiteHeader, SiteFooter } from "@/components/brand";
import { Reveal, CountUp, Parallax } from "@/components/motion";
import { ShaderField } from "@/components/fx";
import { CaseWalkthrough } from "@/components/CaseWalkthrough";
import type { SchoolData, SchoolProfile } from "@/lib/schema";

const school = demoSchool as unknown as SchoolData;

const SCHOOL_TYPES: SchoolProfile["schoolType"][] = [
  "Primary",
  "Middle",
  "Secondary",
  "K-12",
];

const GRID_REGIONS: { code: string; label: string }[] = [
  { code: "", label: "US average" },
  { code: "ISNE", label: "New England (ISO-NE)" },
  { code: "ERCT", label: "Texas (ERCOT)" },
  { code: "CAMX", label: "California" },
  { code: "NYCW", label: "New York City" },
  { code: "RFCE", label: "Mid-Atlantic" },
  { code: "SRSO", label: "Southeast" },
  { code: "RMPA", label: "Rockies" },
];

const EASE = [0.16, 1, 0.3, 1] as const;

function usd(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    notation: n >= 100000 ? "compact" : "standard",
  }).format(n);
}

export default function Home() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const hero = useRef<HTMLElement>(null);
  const heroCopy = useRef<HTMLDivElement>(null);
  const heroMedia = useRef<HTMLDivElement>(null);

  const [profile, setProfile] = useState<SchoolProfile>({
    name: "",
    city: "",
    state: "",
    country: "USA",
    schoolType: "Secondary",
    squareFootage: null,
    students: 800,
    staff: 60,
    gridRegion: "",
  });

  const set = <K extends keyof SchoolProfile>(key: K, value: SchoolProfile[K]) =>
    setProfile((p) => ({ ...p, [key]: value }));

  const canSubmit = profile.name.trim().length > 0 && profile.students > 0;

  // Real evidence for the flagship so the hero numbers match the dashboard.
  const evidence = useMemo(() => buildEvidencePacket(school), []);
  const co2t = Math.round(evidence.totals.annualCo2eKg / 1000);

  useEffect(() => {
    if (!hero.current || !heroCopy.current || !heroMedia.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      () => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: hero.current,
              start: "top top",
              end: "bottom top",
              scrub: 0.9,
              invalidateOnRefresh: true,
            },
          })
          .to(
            heroCopy.current,
            { yPercent: -8, autoAlpha: 0.45, ease: "none" },
            0,
          )
          .to(
            heroMedia.current,
            { yPercent: 6, scale: 1.08, ease: "none" },
            0,
          );
      },
    );

    return () => mm.revert();
  }, []);

  function runDemo() {
    sessionStorage.removeItem("greenspark.school");
    router.push("/analyze");
  }

  function autofillAndAnalyze() {
    const cleaned: SchoolProfile = {
      ...profile,
      gridRegion: profile.gridRegion || undefined,
    };
    const estimated = estimateFromProfile(cleaned);
    sessionStorage.setItem("greenspark.school", JSON.stringify(estimated));
    router.push("/analyze");
  }

  const fade = (i: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 22 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.75, delay: 0.05 * i, ease: EASE },
        };

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader
        right={
          <>
            <a
              href="#intake"
              className="hidden border-b border-mineral pb-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-mineral transition-colors duration-300 hover:text-botanical-bright sm:inline"
            >
              Analyze yours
            </a>
            <button
              onClick={runDemo}
              className="group inline-flex h-10 items-center gap-3 border border-botanical bg-botanical px-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-forest transition-colors duration-300 hover:bg-botanical-bright active:translate-y-px"
            >
              Explore school
              <ArrowRight
                weight="bold"
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </button>
          </>
        }
      />

      <main className="w-full max-w-full flex-1 overflow-x-clip">
        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section ref={hero} className="relative min-h-[calc(100dvh-72px)] overflow-hidden border-b border-forest bg-botanical text-forest">
          <div className="campaign-grid absolute inset-0 opacity-55" aria-hidden />
          <div className="mx-auto grid min-h-[calc(100dvh-72px)] w-full max-w-[1600px] grid-cols-1 lg:grid-cols-12">
            <div className="relative z-10 flex flex-col justify-between border-r border-forest px-5 py-8 sm:px-8 lg:col-span-7 lg:px-12 lg:py-12">
              <motion.div {...fade(0)} className="flex items-center justify-between gap-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em]">
                <span>Our school / environmental view</span>
                <span className="campaign-stamp">Live view · 001</span>
              </motion.div>

              <div ref={heroCopy} className="py-16 lg:py-10">
                <motion.h1
                  {...fade(1)}
                  className="max-w-[920px] font-display text-[clamp(4.5rem,8.4vw,9.2rem)] font-semibold leading-[0.82] tracking-[-0.065em]"
                >
                  Our school,<br />clearly seen.
                </motion.h1>
                <motion.p {...fade(2)} className="mt-8 max-w-[55ch] text-lg leading-[1.5] lg:text-xl">
                  A clear view of our footprint, the cost behind it, and the changes worth making next.
                </motion.p>
              </div>

              <motion.div {...fade(3)} className="grid gap-6 border-t border-forest pt-6 sm:grid-cols-[auto_1fr] sm:items-end">
                <button
                  onClick={runDemo}
                  className="group inline-flex h-14 w-max items-center border border-forest bg-forest pl-5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-mineral transition-colors duration-300 hover:bg-mineral hover:text-forest active:translate-y-px"
                >
                  Explore our school
                  <span className="ml-5 grid h-full w-14 place-items-center border-l border-current">
                    <ArrowRight weight="bold" className="h-4 w-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1" />
                  </span>
                </button>
                <a href="#intake" className="justify-self-start border-b border-forest pb-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] lg:justify-self-end">
                  Analyze another school ↓
                </a>
              </motion.div>
            </div>

            <motion.div
              ref={heroMedia}
              initial={reduce ? false : { opacity: 0, clipPath: "inset(0 0 100% 0)" }}
              animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
              transition={{ duration: 1.1, delay: 0.18, ease: EASE }}
              className="relative isolate min-h-[540px] overflow-hidden lg:col-span-5 lg:min-h-full"
            >
              <Image src="/images/hanover-high-school.jpg" alt="The front facade of Hanover High School in Hanover, New Hampshire" fill priority loading="eager" sizes="(min-width: 1024px) 42vw, 100vw" className="object-cover object-[50%_48%] saturate-[0.78] contrast-110" />
              <div className="absolute inset-0 bg-forest/25 mix-blend-multiply" />
              <div className="absolute inset-0 z-[1] opacity-35 mix-blend-multiply"><ShaderField className="h-full w-full" /></div>
              <div className="image-halftone absolute inset-0 z-[2]" />

              <div className="absolute inset-x-0 bottom-0 z-20 grid grid-cols-2 border-t border-mineral bg-forest text-mineral">
                <div className="border-r border-mineral p-5">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-botanical-bright">Annual CO₂e</p>
                  <p className="mt-2 font-display text-5xl tracking-[-0.06em]"><CountUp value={co2t} />T</p>
                </div>
                <div className="p-5">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-botanical-bright">Annual cost</p>
                  <p className="mt-2 font-display text-4xl tracking-[-0.06em]"><CountUp value={evidence.totals.annualCostUsd} format={(n) => usd(n)} /></p>
                </div>
              </div>
              <div className="absolute right-4 top-4 z-20 campaign-stamp border-mineral bg-forest text-mineral">
                {school.profile.name}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── REASONING WALKTHROUGH (pinned horizontal scroll) ─────────── */}
        <CaseWalkthrough />

        {/* ── ACTION SYSTEM ────────────────────────────────────────────── */}
        <section id="action-system" className="border-b border-forest/15 bg-mineral text-forest">
          <div className="mx-auto w-full max-w-[1600px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
            <div className="grid items-end gap-12 lg:grid-cols-12 lg:gap-16">
              <Reveal className="lg:col-span-7 lg:pb-8">
                <Parallax from={90} to={-90} fade scaleFrom={0.92}>
                  <span className="campaign-stamp">The action layer / from evidence to choice</span>
                  <h2 className="mt-8 max-w-5xl font-display text-[clamp(3.7rem,6.6vw,7.8rem)] font-semibold leading-[0.86] tracking-[-0.06em]">
                    Turn what we see into what we do.
                  </h2>
                  <p className="mt-8 max-w-[62ch] text-lg leading-[1.55] text-forest/70">
                    Test a move, see what changes, then carry the strongest case to the people who can make it happen.
                  </p>
                </Parallax>
              </Reveal>
              <Reveal delay={0.08} className="relative min-h-[430px] overflow-hidden rounded-[1.5rem] image-halftone lg:col-span-5">
                <Parallax className="absolute -inset-y-[30%] inset-x-0" from={-120} to={120}>
                  <Image src="/images/student-action.webp" alt="Students collaborating around a laptop in a library" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover saturate-[0.76] contrast-110" />
                  <div className="absolute inset-0 bg-botanical/28 mix-blend-multiply" />
                </Parallax>
                <p className="absolute bottom-5 left-5 right-5 z-10 rounded-xl bg-mineral/90 p-4 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-forest backdrop-blur-sm">Our numbers become useful when they support a shared next move.</p>
              </Reveal>
            </div>

            <ActionSimulator annualCost={evidence.totals.annualCostUsd} annualCo2={co2t} />

            <Parallax className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" from={72} to={-72} fade>
              <ActionSystem
                index="01"
                icon={ShieldCheck}
                title="Confidence gate"
                body="Thin evidence lowers the score and names what our school should measure next."
              />
              <ActionSystem
                index="02"
                icon={Gauge}
                title="Peer benchmark"
                body="Similar schools give every category a useful point of comparison."
              />
              <ActionSystem
                index="03"
                icon={Gift}
                title="Local rebates"
                body="Eligible incentives sit beside each fix, cost, and payback window."
              />
              <ActionSystem
                index="04"
                icon={Megaphone}
                title="Student pitch mode"
                body="The analysis becomes three clear points our community can carry forward."
              />
            </Parallax>
          </div>
        </section>

        {/* ── INTAKE FORM ──────────────────────────────────────────────── */}
        <section id="intake" className="border-b border-line-strong bg-forest">
          <div className="mx-auto grid w-full max-w-[1600px] px-5 py-20 sm:px-8 lg:grid-cols-12 lg:px-12 lg:py-24">
            <Reveal className="lg:col-span-4 lg:pr-12">
              <Parallax from={96} to={-96} fade scaleFrom={0.93}>
              <span className="campaign-stamp border-botanical-bright text-botanical-bright">Another school / intake</span>
              <h2 className="mt-8 font-display text-[clamp(3.4rem,5.2vw,5.8rem)] font-semibold leading-[0.88] tracking-[-0.055em]">
                Bring another school into view.
              </h2>
              <p className="mt-6 max-w-[58ch] text-base leading-[1.6] text-muted">
                Enter what you know off the top of your head. Green Spark fills
                every category from published benchmarks for a school your size,
                runs the detective, and stays honest that it is a Low-confidence
                estimate until you add real numbers.
              </p>
              <div className="mt-8 space-y-3 font-mono text-[12px] text-faint">
                <FactLine k="No private data" v="profile only to start" />
                <FactLine k="Time to result" v="~10 seconds" />
                <FactLine k="Confidence" v="rises as you add real figures" />
              </div>
              </Parallax>
            </Reveal>

            <Reveal delay={0.1} className="mt-12 lg:col-span-8 lg:mt-0">
              <Parallax className="evidence-panel p-6 sm:p-8" from={44} to={-44}>
                <div className="mb-8 flex items-center justify-between border-b border-line-strong pb-4">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-botanical-bright">Intake sheet / required fields</span>
                  <span className="font-display text-4xl text-line-strong">01</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="School name" value={profile.name} onChange={(v) => set("name", v)} placeholder="Riverside High School" />
                  <Field label="City" value={profile.city} onChange={(v) => set("city", v)} placeholder="Hanover" />
                  <Field label="State" value={profile.state} onChange={(v) => set("state", v)} placeholder="NH" />
                  <SelectField
                    label="School type"
                    value={profile.schoolType}
                    options={SCHOOL_TYPES.map((t) => ({ value: t, label: t }))}
                    onChange={(v) => set("schoolType", v as SchoolProfile["schoolType"])}
                  />
                  <NumberField label="Students" value={profile.students} onChange={(v) => set("students", v ?? 0)} />
                  <NumberField label="Staff" value={profile.staff} onChange={(v) => set("staff", v ?? 0)} />
                  <NumberField label="Building size" unit="ft² · optional" value={profile.squareFootage} onChange={(v) => set("squareFootage", v)} />
                  <SelectField
                    label="Electric grid region"
                    value={profile.gridRegion ?? ""}
                    options={GRID_REGIONS.map((g) => ({ value: g.code, label: g.label }))}
                    onChange={(v) => set("gridRegion", v)}
                  />
                </div>

                <div className="mt-8 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-xs font-mono text-[11px] leading-5 text-faint">
                    {canSubmit
                      ? "Lands at Low confidence by design. Sharpen it on the dashboard."
                      : "Need a school name and student count."}
                  </p>
                  <button
                    onClick={autofillAndAnalyze}
                    disabled={!canSubmit}
                    className="group inline-flex h-14 shrink-0 items-center justify-center border border-botanical bg-botanical px-6 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-forest transition-colors duration-300 hover:bg-botanical-bright active:translate-y-px disabled:cursor-not-allowed disabled:border-line-strong disabled:bg-panel-2 disabled:text-faint"
                  >
                    Autofill &amp; analyze
                    <ArrowRight
                      weight="bold"
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </button>
                </div>
              </Parallax>
            </Reveal>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

/* ── Action system ────────────────────────────────────────────────────── */

function ActionSystem({
  index,
  icon: Ico,
  title,
  body,
}: {
  index: string;
  icon: Icon;
  title: string;
  body: string;
}) {
  return (
    <Reveal className="h-full">
      <div className="group flex h-full min-h-[220px] flex-col justify-between rounded-[1.25rem] bg-forest/[0.055] p-6 transition-colors duration-300 ease-[var(--ease-out-quart)] hover:bg-botanical/25">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-forest/45">System {index}</span>
          <Ico weight="duotone" className="h-6 w-6 text-forest transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:-translate-y-1" />
        </div>
        <div className="mt-10">
          <h3 className="font-display text-2xl font-semibold leading-[1.05] tracking-[-0.03em]">
            {title}
          </h3>
          <p className="mt-3 text-[15px] leading-[1.5] text-forest/65">{body}</p>
        </div>
      </div>
    </Reveal>
  );
}

function ActionSimulator({ annualCost, annualCo2 }: { annualCost: number; annualCo2: number }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const scenarios = [
    { id: "today", label: "Our baseline", note: "No changes yet", costFactor: 1, co2Factor: 1 },
    { id: "quick", label: "Quick wins", note: "LEDs + controls", costFactor: 0.86, co2Factor: 0.89 },
    { id: "deep", label: "Full package", note: "Efficiency + solar", costFactor: 0.63, co2Factor: 0.48 },
  ];
  const [active, setActive] = useState(scenarios[1]);
  const projectedCost = annualCost * active.costFactor;
  const projectedCo2 = annualCo2 * active.co2Factor;

  return (
    <Reveal className="mt-16">
      <div className="group/preview relative transform-gpu transition-transform duration-[600ms] ease-[var(--ease-out-expo)] will-change-transform hover:-translate-y-2.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
        <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[1.5rem] opacity-0 shadow-[0_44px_100px_-32px_oklch(0.09_0.03_158_/_0.55)] transition-opacity duration-[600ms] ease-[var(--ease-out-expo)] group-hover/preview:opacity-100 motion-reduce:hidden" />
        <div data-what-if-preview className="grid overflow-hidden rounded-[1.5rem] bg-botanical text-forest lg:grid-cols-[0.9fr_1.1fr]">
        <div className="p-7 sm:p-9 lg:p-12">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-forest text-mineral">
              <SlidersHorizontal weight="bold" className="h-5 w-5" />
            </span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em]">What-if preview / live</span>
          </div>
          <h3 className="mt-8 max-w-[12ch] font-display text-[clamp(2.7rem,4.2vw,5rem)] font-semibold leading-[0.9] tracking-[-0.05em]">
            Choose a move. See the result.
          </h3>
          <p className="mt-5 max-w-[48ch] text-base leading-[1.55] text-forest/70">
            Select one scenario below. The yearly cost and carbon estimate update immediately, so the tradeoff is visible before we open the full analysis.
          </p>
          <div className="mt-8 grid gap-2">
            {scenarios.map((scenario) => {
              const selected = active.id === scenario.id;
              return (
                <button
                  key={scenario.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setActive(scenario)}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-left transition-colors duration-300 ${
                    selected
                      ? "bg-forest text-mineral"
                      : "bg-mineral/35 text-forest hover:bg-botanical-bright/65"
                  }`}
                >
                  <span className="font-display text-lg font-semibold">{scenario.label}</span>
                  <span className={`font-mono text-[10px] uppercase tracking-[0.12em] ${selected ? "text-botanical-bright" : "text-forest/55"}`}>{scenario.note}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col justify-between bg-mineral/82 p-7 sm:p-9 lg:p-12">
          <div className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-forest/55">
            <span>Projected annual view</span>
            <span>{active.label}</span>
          </div>

          <div className="my-10 grid gap-10 sm:grid-cols-2">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-forest/50">Annual cost</p>
              <motion.p key={`cost-${active.id}`} initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }} className="mt-3 font-display text-[clamp(3rem,5vw,6rem)] font-semibold leading-none tracking-[-0.06em]">
                {usd(projectedCost)}
              </motion.p>
              <p className="mt-3 text-sm text-forest/60">{active.id === "today" ? "Current estimated spend" : `${usd(annualCost - projectedCost)} less each year`}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-forest/50">Annual CO₂e</p>
              <motion.p key={`co2-${active.id}`} initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }} className="mt-3 font-display text-[clamp(3rem,5vw,6rem)] font-semibold leading-none tracking-[-0.06em]">
                {Math.round(projectedCo2)}t
              </motion.p>
              <p className="mt-3 text-sm text-forest/60">{active.id === "today" ? "Current estimated footprint" : `${Math.round(annualCo2 - projectedCo2)} tonnes avoided`}</p>
            </div>
          </div>

          <div>
            <div className="flex h-3 overflow-hidden rounded-full bg-forest/10" aria-hidden>
              <motion.div
                className="h-full rounded-full bg-forest"
                animate={{ width: `${active.co2Factor * 100}%` }}
                transition={{ duration: 0.55, ease: EASE }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-forest/50">
              <span>Projected footprint</span>
              <span>{Math.round(active.co2Factor * 100)}% remains</span>
            </div>
            <button onClick={() => router.push("/analyze")} className="group mt-8 inline-flex items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-forest">
              Open the full analysis
              <ArrowRight weight="bold" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
        </div>
      </div>
    </Reveal>
  );
}

/* ── Form fields ──────────────────────────────────────────────────────── */

function FactLine({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-2 w-2 bg-signal" />
      <span className="text-muted">{k}</span>
      <span className="h-px flex-1 bg-line" />
      <span className="text-fg">{v}</span>
    </div>
  );
}

const fieldBase =
  "w-full border border-line-strong bg-ink px-3.5 py-3 text-base text-fg outline-none transition-colors duration-300 placeholder:text-faint focus:border-botanical-bright focus:bg-ink-2";
const labelBase =
  "mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted";

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className={labelBase}>{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={fieldBase}
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  unit,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  unit?: string;
}) {
  return (
    <label className="block">
      <span className={labelBase}>
        {label}
        {unit ? ` (${unit})` : ""}
      </span>
      <input
        type="number"
        min={0}
        inputMode="numeric"
        value={value != null && Number.isFinite(value) ? value : ""}
        onChange={(e) =>
          onChange(e.target.value === "" ? null : Number(e.target.value))
        }
        className={`${fieldBase} tabular-nums`}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className={labelBase}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${fieldBase} appearance-none bg-[length:0] [color-scheme:dark]`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
