"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import demoSchool from "@/data/school.json";
import { FLAGSHIP } from "@/lib/flagship";
import { estimateFromProfile } from "@/lib/estimate";
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
  { code: "ERCT", label: "Texas (ERCOT)" },
  { code: "CAMX", label: "California" },
  { code: "NYCW", label: "New York City" },
  { code: "RFCE", label: "Mid-Atlantic" },
  { code: "SRSO", label: "Southeast" },
  { code: "RMPA", label: "Rockies" },
];

export default function Home() {
  const router = useRouter();
  const [profile, setProfile] = useState<SchoolProfile>({
    name: "",
    city: "",
    state: "",
    country: "USA",
    schoolType: "Secondary",
    squareFootage: 100000,
    students: 800,
    staff: 60,
    gridRegion: "",
  });

  const set = <K extends keyof SchoolProfile>(key: K, value: SchoolProfile[K]) =>
    setProfile((p) => ({ ...p, [key]: value }));

  const canSubmit =
    profile.name.trim().length > 0 &&
    profile.students > 0 &&
    profile.squareFootage > 0;

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white text-slate-900">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 font-semibold">
          <span className="text-2xl">🌱</span>
          <span className="text-lg tracking-tight">Green Spark AI</span>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
          USAII Hackathon 2026
        </span>
      </header>

      <main className="mx-auto w-full max-w-7xl px-6 pb-16">
        <section className="grid gap-10 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-medium text-emerald-700">
              🔍 Environmental AI Detective
            </span>
            <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              {FLAGSHIP.hero.name} wants to fix {school.profile.name}&apos;s
              hidden footprint.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              {FLAGSHIP.hero.name} is the {FLAGSHIP.hero.role} at{" "}
              {school.profile.name} in {school.profile.city},{" "}
              {school.profile.state}. {FLAGSHIP.problem} Green Spark AI starts
              from the school&apos;s profile and hands back a ranked, costed
              action plan she can take to the principal.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={runDemo}
                className="inline-flex h-12 items-center justify-center rounded-full bg-emerald-600 px-7 text-base font-medium text-white transition-colors hover:bg-emerald-700"
              >
                See the {school.profile.name} demo →
              </button>
              <a
                href="#audit-form"
                className="inline-flex h-12 items-center justify-center rounded-full border border-slate-300 bg-white px-7 text-base font-medium text-slate-700 transition-colors hover:border-emerald-300 hover:text-emerald-700"
              >
                Analyze your own school
              </a>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <HowItWorks step="1" title="Input" body="A school profile, or full usage numbers. No private data required." />
              <HowItWorks step="2" title="AI reasoning" body="Calc engine → anomaly + peer detection → Claude ranks the fixes." />
              <HowItWorks step="3" title="Action" body="A costed plan, local rebates, and a what-if simulator." />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Flagship school
                </p>
                <h2 className="mt-1 text-2xl font-semibold">{school.profile.name}</h2>
              </div>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                {FLAGSHIP.dataBadge}
              </span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <Field label="Students" value={school.profile.students.toLocaleString()} />
              <Field label="Staff" value={school.profile.staff.toLocaleString()} />
              <Field label="City" value={`${school.profile.city}, ${school.profile.state}`} />
              <Field label="Building" value={`${school.profile.squareFootage.toLocaleString()} ft²`} />
              <Field label="Hero user" value={`${FLAGSHIP.hero.name}`} />
              <Field label="Grid region" value="Texas (ERCOT)" />
            </div>
            <button
              onClick={runDemo}
              className="mt-6 w-full rounded-full bg-slate-900 py-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              Open the case file
            </button>
          </div>
        </section>

        {/* Working intake: profile only -> benchmark autofill -> analyze */}
        <section
          id="audit-form"
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
              Analyze your own school
            </p>
            <h2 className="mt-1 text-2xl font-semibold">
              Just the profile. We estimate the rest.
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Enter what you know off the top of your head. Green Spark fills
              every category from published benchmarks for a school your size,
              runs the detective, and is honest that it is a Low-confidence
              estimate until you add real numbers.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Input label="School name" value={profile.name} onChange={(v) => set("name", v)} placeholder="e.g. Riverside High School" />
            <Input label="City" value={profile.city} onChange={(v) => set("city", v)} placeholder="Austin" />
            <Input label="State" value={profile.state} onChange={(v) => set("state", v)} placeholder="TX" />
            <Select
              label="School type"
              value={profile.schoolType}
              options={SCHOOL_TYPES.map((t) => ({ value: t, label: t }))}
              onChange={(v) => set("schoolType", v as SchoolProfile["schoolType"])}
            />
            <NumberInput label="Students" value={profile.students} onChange={(v) => set("students", v)} />
            <NumberInput label="Staff" value={profile.staff} onChange={(v) => set("staff", v)} />
            <NumberInput label="Building size (ft²)" value={profile.squareFootage} onChange={(v) => set("squareFootage", v)} />
            <Select
              label="Electric grid region"
              value={profile.gridRegion ?? ""}
              options={GRID_REGIONS.map((g) => ({ value: g.code, label: g.label }))}
              onChange={(v) => set("gridRegion", v)}
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={autofillAndAnalyze}
              disabled={!canSubmit}
              className="inline-flex h-12 items-center justify-center rounded-full bg-emerald-600 px-7 text-base font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Autofill from benchmarks & analyze →
            </button>
            <span className="text-xs text-slate-400">
              {canSubmit
                ? "Lands at Low confidence by design — add real numbers on the dashboard to sharpen it."
                : "Enter at least a school name, student count, and building size."}
            </span>
          </div>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-7xl px-6 py-8 text-sm text-slate-400">
        Green Spark AI · USAII Global AI Hackathon 2026 · Challenge Brief 2,
        Direction B
      </footer>
    </div>
  );
}

function HowItWorks({ step, title, body }: { step: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
        {step}
      </span>
      <p className="mt-2 font-semibold">{title}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{body}</p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-slate-400">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

function Input({
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
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-700">{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500"
      />
    </label>
  );
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-700">{label}</span>
      <input
        type="number"
        min={0}
        value={Number.isFinite(value) ? value : ""}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500"
      />
    </label>
  );
}

function Select({
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
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-emerald-500"
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
