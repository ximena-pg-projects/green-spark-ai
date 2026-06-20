"use client";

// components/motion.tsx
// Small, reusable motion leaves. All honor prefers-reduced-motion: reveals
// render statically, count-ups jump straight to the final value.

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  animate,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

/** True once the viewport is desktop-width. Scroll motion is gated to desktop
 *  to match the hero / walkthrough choreography and avoid drift on mobile. */
function useDesktop() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return desktop;
}

/** Scroll-linked motion. Content rises and falls (and optionally fades + scales)
 *  as its section crosses the viewport, resting at neutral when centered — so it
 *  animates in BOTH scroll directions and never clips at the page edges.
 *  Desktop-only and honors prefers-reduced-motion (both render fixed). */
export function Parallax({
  children,
  className,
  from = 90,
  to = -90,
  fade = false,
  scaleFrom,
  anchor = "center",
}: {
  children: ReactNode;
  className?: string;
  from?: number;
  to?: number;
  fade?: boolean;
  scaleFrom?: number;
  /** "center" rests neutral mid-viewport; "end" settles neutral once fully in
   *  view — use for the last element on the page so it never clips. */
  anchor?: "center" | "end";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const desktop = useDesktop();
  const end = anchor === "end";
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: end ? ["start end", "end end"] : ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    end ? [0, 1] : [0, 0.5, 1],
    end ? [from, 0] : [from, 0, to],
  );
  const opacity = useTransform(
    scrollYProgress,
    end ? [0, 0.6, 1] : [0, 0.26, 0.74, 1],
    end ? [0.3, 1, 1] : [0.25, 1, 1, 0.25],
  );
  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [scaleFrom ?? 1, 1, scaleFrom ?? 1],
  );
  const active = desktop && !reduce;
  return (
    <motion.div
      ref={ref}
      style={
        active
          ? {
              y,
              opacity: fade ? opacity : undefined,
              scale: scaleFrom ? scale : undefined,
            }
          : undefined
      }
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Scroll-triggered fade + rise. Use for sections, cards, list items. */
export function Reveal({
  children,
  delay = 0,
  y = 18,
  className,
  amount = 0.2,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  amount?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Number that counts up from 0 the first time it scrolls into view. */
export function CountUp({
  value,
  format,
  className,
  duration = 1.4,
}: {
  value: number;
  format?: (n: number) => string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const fmt = format ?? ((n: number) => Math.round(n).toLocaleString());

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) {
      el.textContent = fmt(value);
      return;
    }
    if (!inView) return;
    const controls = animate(0, value, {
      duration,
      ease: EASE,
      onUpdate: (v) => {
        el.textContent = fmt(v);
      },
    });
    return () => controls.stop();
    // fmt is derived from format; value/inView/reduce drive the animation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, inView, reduce, duration]);

  return (
    <span ref={ref} className={className}>
      {fmt(value)}
    </span>
  );
}
