"use client";

// components/fx.tsx
// High-impact motion primitives: a scroll-progress rail, magnetic buttons, a
// forensic decode/scramble text effect, and an animated radar-scan hero field.
// All degrade cleanly under prefers-reduced-motion.

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

/* ── Scroll progress rail ─────────────────────────────────────────────── */

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.3,
  });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-signal"
    />
  );
}

/* ── Magnetic wrapper ─────────────────────────────────────────────────── */

export function Magnetic({
  children,
  strength = 0.45,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 });

  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy }}
      className={className}
      onMouseMove={(e) => {
        if (reduce || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/* ── Decode / scramble text ───────────────────────────────────────────── */

const GLYPHS = "ABCDEFGHJKLMNPRSTUVWXYZ0123456789/#%<>*".split("");

export function Scramble({
  text,
  className,
  duration = 1100,
  delay = 0,
}: {
  text: string;
  className?: string;
  duration?: number;
  delay?: number;
}) {
  const [out, setOut] = useState(text); // SSR + no-JS fallback = final text
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOut(text);
      return;
    }
    let raf = 0;
    let startTs: number | null = null;
    const tick = (t: number) => {
      if (startTs === null) startTs = t;
      const elapsed = t - startTs - delay;
      if (elapsed < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const p = Math.min(1, elapsed / duration);
      const revealed = Math.floor(p * text.length);
      let s = "";
      for (let i = 0; i < text.length; i++) {
        if (i < revealed || text[i] === " ") s += text[i];
        else s += GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      setOut(s);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setOut(text);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, reduce, duration, delay]);

  return <span className={className}>{out}</span>;
}

/* ── Radar-scan hero field (canvas) ───────────────────────────────────── */

export function HeroField({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const GAP = 40;
    let w = 0;
    let h = 0;

    const resize = () => {
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    const drawDots = (scan: number | null) => {
      ctx.clearRect(0, 0, w, h);
      for (let x = GAP; x < w; x += GAP) {
        for (let y = GAP; y < h; y += GAP) {
          let a = 0.05;
          let r = 1;
          let signal = false;
          if (scan !== null) {
            const near = Math.max(0, 1 - Math.abs(x - scan) / 150);
            if (near > 0.02) {
              a = 0.05 + near * 0.7;
              r = 1 + near * 2;
              signal = true;
            }
          }
          ctx.fillStyle = signal
            ? `rgba(184,242,61,${a})`
            : `rgba(150,170,165,${a})`;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (scan !== null) {
        const g = ctx.createLinearGradient(scan - 70, 0, scan + 70, 0);
        g.addColorStop(0, "rgba(184,242,61,0)");
        g.addColorStop(0.5, "rgba(184,242,61,0.09)");
        g.addColorStop(1, "rgba(184,242,61,0)");
        ctx.fillStyle = g;
        ctx.fillRect(scan - 70, 0, 140, h);
      }
    };

    let raf = 0;
    if (reduce) {
      drawDots(null);
    } else {
      let scan = -160;
      const loop = () => {
        scan += 1.1;
        if (scan > w + 200) scan = -160;
        drawDots(scan);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [reduce]);

  return <canvas ref={ref} aria-hidden className={className} />;
}

/* ── WebGL signal field (shader hero backdrop) ────────────────────────────
   A flowing, domain-warped noise field rendered on the GPU: dark ink-green
   structure with signal-lime veins, lit by a pointer-following glow. Falls
   back to the canvas radar (HeroField) if WebGL is unavailable, and renders a
   single still frame under prefers-reduced-motion. */

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}
void main() {
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  float aspect = u_res.x / max(u_res.y, 1.0);
  vec2 p = vec2(uv.x * aspect, uv.y);

  float t = u_time * 0.045;
  vec2 q = vec2(fbm(p * 1.6 + t), fbm(p * 1.6 - t + 4.3));
  vec2 r = vec2(
    fbm(p * 1.6 + 1.1 * q + vec2(1.7, 9.2) + 0.12 * t),
    fbm(p * 1.6 + 1.1 * q + vec2(8.3, 2.8) - 0.10 * t)
  );
  float f = fbm(p * 1.6 + 1.5 * r);

  vec3 ink  = vec3(0.040, 0.072, 0.062);
  vec3 deep = vec3(0.065, 0.150, 0.108);
  vec3 sig  = vec3(0.722, 0.949, 0.239);

  vec3 col = mix(ink, deep, smoothstep(0.22, 0.64, f));
  col = mix(col, sig, smoothstep(0.60, 0.93, f) * 0.62);

  // contour veins, like an instrument readout sweeping the field
  float contour = abs(fract(f * 7.0 - 0.5) - 0.5);
  float veins = smoothstep(0.06, 0.0, contour);
  col += sig * veins * 0.18 * smoothstep(0.30, 0.9, f);

  // slow botanical pulse, independent of pointer position
  float pulse = 0.5 + 0.5 * sin(u_time * 0.16 + f * 5.0);
  col += sig * pulse * 0.055 * smoothstep(0.35, 0.88, f);

  // vignette to keep the edges quiet under text
  float vig = smoothstep(1.18, 0.22, length((uv - 0.5) * vec2(aspect, 1.0)));
  col *= mix(0.45, 1.0, vig);

  gl_FragColor = vec4(col, 1.0);
}
`;

export function ShaderField({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    const gl = canvas.getContext("webgl", {
      antialias: true,
      alpha: true,
      premultipliedAlpha: false,
      powerPreference: "low-power",
    }) as WebGLRenderingContext | null;
    if (!gl) {
      setFailed(true);
      return;
    }

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type);
      if (!sh) return null;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    };

    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram();
    if (!vs || !fs || !prog) {
      setFailed(true);
      return;
    }
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      setFailed(true);
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");

    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    const resize = () => {
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    const render = (timeSec: number) => {
      gl.uniform1f(uTime, timeSec);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const visible = { current: true };
    const io = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting;
    });
    io.observe(canvas);

    let raf = 0;
    if (reduce) {
      render(8.0);
    } else {
      const loop = (t: number) => {
        if (visible.current) render(t * 0.001);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [reduce]);

  if (failed) return <HeroField className={className} />;
  return <canvas ref={ref} aria-hidden className={className} />;
}

/* ── Scroll-scrubbed count-up ─────────────────────────────────────────────
   Two honest modes, chosen per element at mount:
   • Above the fold (a dashboard headline at rest): a plain entrance count-up.
     There is no scroll room before it, so the figure must land exactly right.
   • Below the fold: a true scrub. The number tracks scroll progress, counting
     up from zero as the element rises into view and settling on the exact
     value once it is in frame.
   Either way the value is exact at rest and under prefers-reduced-motion. */

export function ScrubCount({
  value,
  format,
  className,
  duration = 1.6,
}: {
  value: number;
  format?: (n: number) => string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const fmt = format ?? ((n: number) => Math.round(n).toLocaleString());

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 60%"],
  });
  const scrub = useTransform(scrollYProgress, [0, 1], [0, value]);
  const entrance = useMotionValue(reduce ? value : 0);
  // Decided once at mount: only scrub elements that actually start below the
  // fold, so an above-the-fold headline can never read a fractional value.
  const scrubMode = useRef(false);
  const shown = useTransform([entrance, scrub], (latest: number[]) =>
    scrubMode.current ? Math.min(latest[0], latest[1]) : latest[0],
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    scrubMode.current =
      !reduce && el.getBoundingClientRect().top > window.innerHeight * 0.85;
    const write = (v: number) => {
      el.textContent = fmt(v);
    };
    write(shown.get());
    const unsub = shown.on("change", write);
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, value, reduce]);

  useEffect(() => {
    if (reduce) {
      entrance.set(value);
      return;
    }
    const controls = animate(entrance, value, { duration, ease: EASE });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduce, duration]);

  return (
    <span ref={ref} className={className}>
      {fmt(value)}
    </span>
  );
}
