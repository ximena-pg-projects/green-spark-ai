"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, Sparkle } from "@phosphor-icons/react";
import { Parallax } from "./motion";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-3 text-mineral">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-botanical text-forest transition-colors duration-300 group-hover:bg-botanical-bright">
        <Sparkle weight="fill" className="h-4 w-4 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:rotate-90" />
      </span>
      {!compact && (
        <span className="flex items-baseline font-display text-[15px] font-semibold tracking-[-0.01em]">
          Green Spark <span className="ml-2 font-mono text-[9px] uppercase tracking-[0.18em] text-botanical-bright">AI</span>
        </span>
      )}
    </Link>
  );
}

export function SiteHeader({ right }: { right?: ReactNode }) {
  return (
    <header className="sticky top-0 z-50 border-b border-line-strong bg-forest/95">
      <div className="mx-auto flex h-[72px] w-full max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Logo />
        <div className="flex items-center gap-3">{right}</div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line-strong bg-botanical text-forest">
      <div className="mx-auto grid w-full max-w-[1600px] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_auto] lg:px-12">
        <Parallax from={72} anchor="end">
          <p className="font-display text-[clamp(2.5rem,5vw,5.5rem)] font-semibold leading-[0.88] tracking-[-0.055em]">See our school.<br />Shape what comes next.</p>
        </Parallax>
        <Parallax className="flex flex-col justify-between gap-8 font-mono text-[10px] uppercase tracking-[0.15em]" from={50} anchor="end">
          <Link href="/analyze" className="inline-flex items-center gap-2 border-b border-forest pb-2 font-bold">
            Explore our school <ArrowUpRight className="h-4 w-4" weight="bold" />
          </Link>
          <p>USAII Global AI Hackathon 2026<br />Our school / environmental view</p>
        </Parallax>
      </div>
    </footer>
  );
}

export function StatusChip({
  children,
  tone = "signal",
  pulse = false,
}: {
  children: ReactNode;
  tone?: "signal" | "amber" | "rose" | "muted";
  pulse?: boolean;
}) {
  const tones = {
    signal: "text-botanical-bright border-botanical-bright",
    amber: "text-amber border-amber",
    rose: "text-rose border-rose",
    muted: "text-muted border-line-strong",
  };
  const dots = { signal: "bg-botanical-bright", amber: "bg-amber", rose: "bg-rose", muted: "bg-muted" };
  return (
    <span className={`inline-flex items-center gap-2 border px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.16em] ${tones[tone]}`}>
      <span className={`h-1.5 w-1.5 ${dots[tone]} ${pulse ? "gs-pulse" : ""}`} />
      {children}
    </span>
  );
}
