"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const SPLIT_COLORS = { push: "#d4d4d4", pull: "#38bdf8", legs: "#4ade80" };
const SPLIT_LABELS = { push: "Push", pull: "Pull", legs: "Legs" };
const EXPERIENCE = {
  never: "Restarting after 6+ months",
  beginner: "Under 6 months",
  intermediate: "6 months to 2 years",
  advanced: "2+ years",
};

const tooltipStyle = {
  contentStyle: {
    background: "#0a0a0a",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 0,
    fontSize: 12,
    color: "#fff",
  },
  labelStyle: { color: "#fff" },
  itemStyle: { color: "#d4d4d4" },
  cursor: { fill: "rgba(255,255,255,0.06)" },
};

const axisProps = {
  stroke: "rgba(255,255,255,0.4)",
  tick: { fontSize: 11, fill: "rgba(255,255,255,0.5)" },
  tickLine: false,
};

function formatDuration(min) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export default function StatsView({ stats, profile,username}) {
  const [metric, setMetric] = useState("workouts");
  const { totals, streak, week, weeks, calendar, splitCounts, topExercises, recent } =
    stats;

  const splitData = Object.keys(splitCounts)
    .map((k) => ({ key: k, name: SPLIT_LABELS[k], value: splitCounts[k] }))
    .filter((d) => d.value > 0);

  const weekPct = Math.min(100, Math.round((week.done / week.goal) * 100));

  return (
    <main className="min-h-svh bg-[#0a0a0a] px-5 pb-16 pt-24 font-poppins text-white md:px-17.5 md:pt-32">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-white/50 sm:text-xs">
              Your progress
            </p>
            <h1 className="text-4xl font-semibold uppercase leading-none md:text-6xl">
              {` Welcome ${username}`}
            </h1>
          </div>
          <Link
            href="/dashboard/workouts"
            className="border border-[#d4d4d4] bg-[#d4d4d4] px-6 py-3.5 text-xs uppercase tracking-[0.15em] text-black transition-colors duration-300 hover:bg-transparent hover:text-[#d4d4d4]"
          >
            Start workout
          </Link>
        </div>

        {profile && (
          <div className="mb-6 grid grid-cols-2 gap-2 md:grid-cols-5">
            <Mini label="Age" value={profile.age} />
            <Mini label="Weight" value={`${profile.weightKg} kg`} />
            <Mini label="Max pull-ups" value={profile.maxPullUps} />
            <Mini label="Max dips" value={profile.maxDips} />
            <Mini label="Training" value={EXPERIENCE[profile.experienceYears]} small />
          </div>
        )}

        {totals.workouts === 0 ? (
          <div className="border border-white/20 p-8 text-center">
            <p className="mb-2 text-xl font-semibold uppercase">No workouts yet</p>
            <p className="mb-6 text-sm text-white/60">
              Finish your first workout and your progress will show up here.
            </p>
            <Link
              href="/dashboard/workouts"
              className="inline-block border border-[#d4d4d4] px-6 py-3.5 text-xs uppercase tracking-[0.15em] text-[#d4d4d4] transition-colors hover:bg-[#d4d4d4] hover:text-black"
            >
              Start your first workout
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-2 gap-2 md:grid-cols-4">
              <Stat label="Workouts" value={totals.workouts} />
              <Stat
                label="Streak"
                value={`${streak.current} ${streak.current === 1 ? "day" : "days"}`}
                hint={`Best: ${streak.best}`}
              />
              <Stat label="Time trained" value={formatDuration(totals.minutes)} />
              <Stat
                label="Sets · Reps"
                value={`${totals.sets} · ${totals.reps}`}
                hint="Reps are your set targets"
              />
            </div>

            <Card title="This week">
              <div className="mb-2 flex items-baseline justify-between">
                <p className="text-3xl font-semibold">
                  {week.done}
                  <span className="text-lg text-white/40"> / {week.goal}</span>
                </p>
                <p className="text-xs uppercase tracking-[0.15em] text-white/50">
                  {week.done >= week.goal ? "Goal reached" : `${week.goal - week.done} to go`}
                </p>
              </div>
              <div className="h-2 w-full bg-white/10">
                <div
                  className={`h-full transition-all duration-700 ${
                    week.done >= week.goal ? "bg-green-400" : "bg-[#d4d4d4]"
                  }`}
                  style={{ width: `${weekPct}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-white/40">
                Goal: one Push, one Pull and one Legs day each week.
              </p>
            </Card>

            <div className="mt-2">
              <Card
                title="Last 8 weeks"
                action={
                  <div className="flex gap-1">
                    {[
                      ["workouts", "Workouts"],
                      ["minutes", "Minutes"],
                    ].map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setMetric(key)}
                        className={`border px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] transition-colors ${
                          metric === key
                            ? "border-[#d4d4d4] bg-[#d4d4d4] text-black"
                            : "border-white/30 text-white/70 hover:bg-white/10"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                }
              >
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeks} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="label" {...axisProps} />
                      <YAxis allowDecimals={false} {...axisProps} axisLine={false} />
                      <Tooltip {...tooltipStyle} />
                      <Bar
                        dataKey={metric}
                        name={metric === "workouts" ? "Workouts" : "Minutes"}
                        fill="#d4d4d4"
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            <div className="mt-2 grid gap-2 md:grid-cols-2">
              <Card title="Split balance">
                <div className="flex items-center gap-4">
                  <div className="h-44 w-44 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={splitData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius="60%"
                          outerRadius="95%"
                          paddingAngle={2}
                          stroke="none"
                        >
                          {splitData.map((d) => (
                            <Cell key={d.key} fill={SPLIT_COLORS[d.key]} />
                          ))}
                        </Pie>
                        <Tooltip {...tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="flex flex-1 flex-col gap-2">
                    {Object.keys(splitCounts).map((k) => (
                      <li key={k} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5"
                            style={{ background: SPLIT_COLORS[k] }}
                          />
                          {SPLIT_LABELS[k]}
                        </span>
                        <span className="text-white/60">{splitCounts[k]}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>

              <Card title="Last 4 weeks">
                <div className="mb-1 grid grid-cols-7 gap-1.5 text-center text-[10px] uppercase tracking-[0.1em] text-white/40">
                  {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                    <span key={i}>{d}</span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {calendar.map((c) => (
                    <div
                      key={c.key}
                      title={`${c.label}${c.count ? ` · ${c.count} workout${c.count > 1 ? "s" : ""}` : ""}`}
                      className={`aspect-square ${
                        c.future
                          ? "border border-white/10"
                          : c.count === 0
                          ? "bg-white/10"
                          : c.count === 1
                          ? "bg-[#d4d4d4]/60"
                          : "bg-[#d4d4d4]"
                      } ${c.isToday ? "ring-1 ring-white" : ""}`}
                    />
                  ))}
                </div>
                <p className="mt-3 text-xs text-white/40">Each square is one day.</p>
              </Card>
            </div>

            <div className="mt-2">
              <Card title="Most trained exercises (sets)">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topExercises}
                      layout="vertical"
                      margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.08)" />
                      <XAxis type="number" allowDecimals={false} {...axisProps} axisLine={false} />
                      <YAxis
                        type="category"
                        dataKey="title"
                        width={110}
                        {...axisProps}
                        axisLine={false}
                        tickFormatter={(t) => (t.length > 16 ? `${t.slice(0, 15)}…` : t)}
                      />
                      <Tooltip {...tooltipStyle} />
                      <Bar dataKey="sets" name="Sets" fill="#4ade80" radius={[0, 2, 2, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            <div className="mt-2">
              <Card title="Recent workouts">
                <ul className="flex flex-col divide-y divide-white/10">
                  {recent.map((r) => (
                    <li key={r.id} className="flex items-center gap-4 py-3">
                      <span
                        className="h-8 w-1 shrink-0"
                        style={{ background: SPLIT_COLORS[r.split] }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold uppercase">
                          {SPLIT_LABELS[r.split]} day
                        </p>
                        <p className="text-xs text-white/50">{r.date}</p>
                      </div>
                      <div className="text-right text-xs text-white/60">
                        <p>
                          {r.exercises} exercises · {r.sets} sets
                        </p>
                        <p>{formatDuration(r.minutes)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </>
        )}

        <p className="mt-8 text-center text-xs text-white/40">
          Update your max reps in{" "}
          <Link
            href="/user-details"
            className="underline underline-offset-4 hover:text-white"
          >
            your details
          </Link>{" "}
          to keep your plan matched to your level.
        </p>
      </div>
    </main>
  );
}

function Stat({ label, value, hint }) {
  return (
    <div className="border border-white/20 p-4">
      <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-white/50">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
      {hint && <p className="mt-0.5 text-[10px] text-white/40">{hint}</p>}
    </div>
  );
}

function Mini({ label, value, small }) {
  return (
    <div className="bg-[#141414] p-3">
      <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-white/40">{label}</p>
      <p className={small ? "text-xs leading-snug text-white/80" : "text-lg font-semibold"}>
        {value}
      </p>
    </div>
  );
}

function Card({ title, action, children }) {
  return (
    <section className="border border-white/20 p-4 md:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-white/50 sm:text-xs">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}