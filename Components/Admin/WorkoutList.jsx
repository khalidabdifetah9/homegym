"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MUSCLE_CONFIG, muscleLabel } from "@/lib/muscleGroups";

const TABS = [
  { key: "all", label: "All" },
  { key: "push", label: "Push" },
  { key: "pull", label: "Pull" },
  { key: "legs", label: "Legs" },
];
const LABELS = { push: "Push", pull: "Pull", legs: "Legs" };

export default function WorkoutList({ workouts }) {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  const q = search.trim().toLowerCase();
  const filtered = workouts.filter(
    (w) =>
      (tab === "all" || w.category === tab) &&
      (!q ||
        w.title.toLowerCase().includes(q) ||
        muscleLabel(w.category, w.muscleGroup, w.subMuscle)
          .toLowerCase()
          .includes(q))
  );

  const needsFix = workouts.filter(
    (w) => !MUSCLE_CONFIG[w.category]?.some((g) => g.key === w.muscleGroup)
  ).length;

  const groups = ["push", "pull", "legs"]
    .map((key) => {
      const items = filtered.filter((w) => w.category === key);
      const known = new Set(MUSCLE_CONFIG[key].map((g) => g.key));

      const sections = MUSCLE_CONFIG[key]
        .map((g) => ({
          key: g.key,
          label: g.label,
          items: items.filter((w) => w.muscleGroup === g.key),
        }))
        .filter((s) => s.items.length > 0);

      const other = items.filter((w) => !known.has(w.muscleGroup));
      if (other.length > 0) {
        sections.push({
          key: "other",
          label: "Needs a muscle group",
          items: other,
        });
      }

      return { key, label: LABELS[key], count: items.length, sections };
    })
    .filter((g) => g.count > 0);

  return (
    <section className="px-5 pb-16 pt-24 font-poppins text-white md:ml-64 md:px-10 md:pt-12">
      <h1 className="mb-2 text-2xl font-semibold uppercase leading-none sm:text-3xl md:text-4xl">
        Update workouts
      </h1>
      <p className="mb-6 text-sm text-white/50">
        {workouts.length} {workouts.length === 1 ? "workout" : "workouts"}. Pick
        one to edit or delete it.
      </p>

      {needsFix > 0 && (
        <p className="mb-6 border-l-2 border-yellow-500 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
          {needsFix} {needsFix === 1 ? "workout needs" : "workouts need"} a
          muscle group. Open {needsFix === 1 ? "it" : "them"} and pick one.
        </p>
      )}

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`border px-4 py-2.5 text-xs uppercase tracking-[0.15em] transition-colors ${
                tab === t.key
                  ? "border-[#d4d4d4] bg-[#d4d4d4] text-black"
                  : "border-white/30 text-white/70 hover:bg-white/10"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or muscle"
          className="w-full border-b border-white/40 bg-transparent py-2.5 text-base text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#d4d4d4] md:w-64"
        />
      </div>

      {workouts.length === 0 ? (
        <p className="text-sm uppercase tracking-[0.1em] text-white/60">
          No workouts yet. Add one first.
        </p>
      ) : groups.length === 0 ? (
        <p className="text-sm uppercase tracking-[0.1em] text-white/60">
          No workouts match your search.
        </p>
      ) : (
        <div className="flex flex-col gap-14">
          {groups.map((g) => (
            <div key={g.key}>
              <h2 className="mb-6 border-b border-white/20 pb-3 text-xl font-semibold uppercase md:text-2xl">
                {g.label}
                <span className="ml-3 text-sm font-light text-white/40">
                  {g.count}
                </span>
              </h2>

              <div className="flex flex-col gap-8">
                {g.sections.map((s) => (
                  <div key={s.key}>
                    <h3
                      className={`mb-3 text-xs uppercase tracking-[0.2em] ${
                        s.key === "other" ? "text-yellow-400" : "text-white/60"
                      }`}
                    >
                      {s.label}
                      <span className="ml-2 text-white/30">
                        {s.items.length}
                      </span>
                    </h3>

                    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 xl:grid-cols-4">
                      {s.items.map((w) => (
                        <Link
                          key={w.id}
                          href={`/admin/update-workout/${w.id}`}
                          className="group block bg-[#141414] transition-colors duration-300 hover:bg-[#1c1c1c]"
                        >
                          <div className="relative aspect-square w-full bg-[#d4d4d4]">
                            <Image
                              src={w.startImageUrl}
                              alt={w.title}
                              fill
                              sizes="(min-width: 1280px) 20vw, (min-width: 768px) 28vw, 45vw"
                              className="object-contain"
                            />
                            {w.hasVideo && (
                              <span className="absolute left-2 top-2 bg-black/80 px-2 py-1 text-[9px] uppercase tracking-[0.15em] text-white">
                                Video
                              </span>
                            )}
                          </div>
                          <div className="px-3 py-3">
                            <p className="truncate text-[11px] uppercase tracking-[0.08em] text-white/70 transition-colors group-hover:text-[#d4d4d4] sm:text-xs">
                              {w.title}
                            </p>
                            <p className="mt-1 flex items-center justify-between text-[10px] text-white/40">
                              <span className="truncate">
                                {s.key === "other"
                                  ? "Uncategorized"
                                  : muscleLabel(
                                      w.category,
                                      w.muscleGroup,
                                      w.subMuscle
                                    )}
                              </span>
                              <span className="shrink-0">Edit →</span>
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}