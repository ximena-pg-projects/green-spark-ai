'use client';

import Link from "next/link";
import { useMemo, useState } from "react";
import demoSchool from "@/data/school.json";
import type { SchoolData } from "@/lib/schema";

const school = demoSchool as unknown as SchoolData;

const initialForm = {
  schoolName: school.profile.name,
  city: school.profile.city,
  state: school.profile.state,
  students: school.profile.students,
  staff: school.profile.staff,
  size: school.profile.squareFootage,
  electricityUse: school.energy?.annualElectricityKwh ?? 0,
  electricityCost: school.energy?.monthlyElectricBill ?? 0,
  waterUse: school.water?.annualGallons ?? 0,
  waterCost: school.water?.monthlyWaterBill ?? 0,
  wasteBags: school.waste?.collectionsPerWeek ?? 0,
  recycling: school.waste?.recycling !== "none",
  composting: (school.waste?.annualCompostTons ?? 0) > 0,
  car: school.transportation?.pctCar ?? 0,
  bus: school.transportation?.pctBus ?? 0,
  walk: school.transportation?.pctWalkBike ?? 0,
  transit: 0,
};

export default function Home() {
  const [form, setForm] = useState(initialForm);

  const previewSummary = useMemo(() => {
    const totalStudents = form.students || 0;
    const totalStaff = form.staff || 0;
    return {
      label: form.schoolName || "Your school",
      size: form.size ? `${form.size.toLocaleString()} ft²` : "Not available",
      people: totalStudents + totalStaff,
    };
  }, [form]);

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
              Uncover your school&apos;s hidden environmental impact.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Green Spark AI helps schools identify their biggest environmental
              impact areas and discover practical, cost-saving sustainability
              actions.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/analyze"
                className="inline-flex h-12 items-center justify-center rounded-full bg-emerald-600 px-7 text-base font-medium text-white transition-colors hover:bg-emerald-700"
              >
                View Dashboard
              </Link>
              <a
                href="#audit-form"
                className="inline-flex h-12 items-center justify-center rounded-full border border-slate-300 bg-white px-7 text-base font-medium text-slate-700 transition-colors hover:border-emerald-300 hover:text-emerald-700"
              >
                Start School Audit
              </a>
            </div>
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Demo preview
              </p>
              <div className="mt-3 flex flex-wrap gap-4">
                <div>
                  <p className="text-xs text-slate-400">School</p>
                  <p className="font-semibold">{previewSummary.label}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Size</p>
                  <p className="font-semibold">{previewSummary.size}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">People</p>
                  <p className="font-semibold">{previewSummary.people} people</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  School profile
                </p>
                <h2 className="mt-1 text-2xl font-semibold">{form.schoolName}</h2>
              </div>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                Demo data
              </span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Students</p>
                <p className="font-semibold">{form.students.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-400">Staff</p>
                <p className="font-semibold">{form.staff.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-400">City</p>
                <p className="font-semibold">{form.city}</p>
              </div>
              <div>
                <p className="text-slate-400">State</p>
                <p className="font-semibold">{form.state}</p>
              </div>
            </div>
          </div>
        </section>

        <section id="audit-form" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
                School input form
              </p>
              <h2 className="mt-1 text-2xl font-semibold">Audit details</h2>
            </div>
            <Link
              href="/analyze"
              className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
            >
              Open dashboard →
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[
              {
                label: "School name",
                key: "schoolName",
                type: "text",
              },
              { label: "City", key: "city", type: "text" },
              { label: "State", key: "state", type: "text" },
              { label: "Students", key: "students", type: "number" },
              { label: "Staff", key: "staff", type: "number" },
              { label: "Building size", key: "size", type: "number" },
              { label: "Monthly electricity use", key: "electricityUse", type: "number" },
              { label: "Monthly electricity cost", key: "electricityCost", type: "number" },
              { label: "Monthly water use", key: "waterUse", type: "number" },
              { label: "Monthly water cost", key: "waterCost", type: "number" },
              { label: "Waste bags / week", key: "wasteBags", type: "number" },
              { label: "Transportation (car %)", key: "car", type: "number" },
              { label: "Transportation (bus %)", key: "bus", type: "number" },
              { label: "Transportation (walk/bike %)", key: "walk", type: "number" },
              { label: "Transportation (transit %)", key: "transit", type: "number" },
            ].map((field) => (
              <label key={field.key} className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">{field.label}</span>
                <input
                  type={field.type}
                  value={String(form[field.key as keyof typeof form] ?? "")}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      [field.key]:
                        field.type === "number"
                          ? Number(e.target.value)
                          : e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none ring-0 focus:border-emerald-500"
                />
              </label>
            ))}
          </div>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-7xl px-6 py-8 text-sm text-slate-400">
        Green Spark AI · USAII Global AI Hackathon 2026
      </footer>
    </div>
  );
}
