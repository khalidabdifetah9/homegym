"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

let audioCtx = null;
function beep(freq = 880, duration = 0.15) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = freq;
    gain.gain.value = 0.08;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch {}
}

function buzz(ms = 250) {
  try {
    navigator.vibrate?.(ms);
  } catch {}
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const primaryBtn =
  "flex-1 border border-[#d4d4d4] bg-[#d4d4d4] px-6 py-4 text-xs uppercase tracking-[0.15em] text-black transition-colors duration-300 hover:bg-transparent hover:text-[#d4d4d4] disabled:cursor-not-allowed disabled:opacity-50";
const secondaryBtn =
  "border border-white/40 px-5 py-4 text-xs uppercase tracking-[0.15em] text-white transition-colors duration-300 hover:bg-white/10";

export default function Workout({ workoutPlan }) {
  const {
    exercises,
    settings,
    level,
    split,
    splitLabel,
    splits,
    todaySplit,
    estimatedMinutes,
  } = workoutPlan;

  const [phase, setPhase] = useState("overview"); // overview | ready | work | rest | done
  const [exIndex, setExIndex] = useState(0);
  const [setNumber, setSetNumber] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [paused, setPaused] = useState(false);
  const [setsDone, setSetsDone] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [saveStatus, setSaveStatus] = useState("idle");

  const endAtRef = useRef(0);
  const pausedMsRef = useRef(0);
  const startedAtRef = useRef(0);
  const setsLogRef = useRef({});

  const current = exercises[exIndex];
  const totalSets = exercises.reduce((n, e) => n + e.sets, 0);
  const doneBefore =
    exercises.slice(0, exIndex).reduce((n, e) => n + e.sets, 0) +
    (setNumber - 1) +
    (phase === "rest" ? 1 : 0);
  const progress =
    phase === "done" ? 1 : totalSets ? doneBefore / totalSets : 0;

  const startTimer = (seconds) => {
    endAtRef.current = Date.now() + seconds * 1000;
    setTotalTime(seconds);
    setTimeLeft(seconds);
    setPaused(false);
  };

  useEffect(() => {
    if ((phase !== "work" && phase !== "rest") || paused) return;
    const id = setInterval(() => {
      setTimeLeft(
        Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000)),
      );
    }, 250);
    return () => clearInterval(id);
  }, [phase, paused]);

  useEffect(() => {
    if ((phase !== "work" && phase !== "rest") || paused) return;
    if (timeLeft > 0 && timeLeft <= 3) beep(660, 0.12);
  }, [timeLeft, phase, paused]);

  useEffect(() => {
    if (paused || timeLeft > 0) return;
    if (phase === "work") {
      beep(990, 0.3);
      finishSet();
    } else if (phase === "rest") {
      beep(990, 0.3);
      finishRest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, phase, paused]);

  useEffect(() => {
    const active = phase === "ready" || phase === "work" || phase === "rest";
    if (!active || !("wakeLock" in navigator)) return;

    let lock = null;
    let cancelled = false;
    navigator.wakeLock
      .request("screen")
      .then((l) => {
        if (cancelled) l.release();
        else lock = l;
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      try {
        lock?.release()?.catch(() => {});
      } catch {}
    };
  }, [phase]);

  const saveWorkout = async (durationMinutes) => {
    const done = exercises
      .filter((e) => setsLogRef.current[e.id] > 0)
      .map((e) => ({
        exerciseId: e.id,
        setsCompleted: setsLogRef.current[e.id],
        repsCompleted: setsLogRef.current[e.id] * e.reps,
      }));

    if (done.length === 0) {
      setSaveStatus("idle");
      return;
    }

    setSaveStatus("saving");
    try {
      const res = await fetch("/api/user/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ split, durationMinutes, exercises: done }),
      });
      setSaveStatus(res.ok ? "saved" : "error");
    } catch {
      setSaveStatus("error");
    }
  };

  const finish = () => {
    const seconds = Math.round((Date.now() - startedAtRef.current) / 1000);
    setElapsed(seconds);
    setPhase("done");
    buzz(500);
    saveWorkout(Math.max(1, Math.round(seconds / 60)));
  };

  const startWorkout = () => {
    setsLogRef.current = {};
    setSaveStatus("idle");
    beep(440, 0.01);
    startedAtRef.current = Date.now();
    setExIndex(0);
    setSetNumber(1);
    setSetsDone(0);
    setPhase("ready");
  };

  const startSet = () => {
    setPhase("work");
    startTimer(settings.workSeconds);
  };

  function finishSet() {
    setsLogRef.current[current.id] = (setsLogRef.current[current.id] || 0) + 1;
    buzz();
    setSetsDone((n) => n + 1);

    const isLastSet = setNumber >= current.sets;
    const isLastExercise = exIndex >= exercises.length - 1;

    if (isLastSet && isLastExercise) {
      finish();
      return;
    }
    setPhase("rest");
    startTimer(
      isLastSet ? settings.restExerciseSeconds : settings.restSetSeconds,
    );
  }

  function finishRest() {
    buzz();
    if (setNumber < current.sets) {
      setSetNumber((n) => n + 1);
    } else {
      setExIndex((i) => i + 1);
      setSetNumber(1);
    }
    setPhase("ready");
  }

  const skipExercise = () => {
    if (exIndex >= exercises.length - 1) {
      finish();
      return;
    }
    setExIndex((i) => i + 1);
    setSetNumber(1);
    setPhase("ready");
  };

  const togglePause = () => {
    if (paused) {
      endAtRef.current = Date.now() + pausedMsRef.current;
      setPaused(false);
    } else {
      pausedMsRef.current = Math.max(0, endAtRef.current - Date.now());
      setPaused(true);
    }
  };

  const addTime = () => {
    if (paused) pausedMsRef.current += 15000;
    else endAtRef.current += 15000;
    setTimeLeft((t) => t + 15);
    setTotalTime((t) => t + 15);
  };

  const resetToOverview = () => {
    setPhase("overview");
    setExIndex(0);
    setSetNumber(1);
    setSetsDone(0);
    setPaused(false);
  };

  const endWorkout = () => {
    if (window.confirm("End this workout?")) resetToOverview();
  };

  // ---------- overview ----------
  if (phase === "overview") {
    return (
      <main className="min-h-svh bg-[#0a0a0a] px-5 pb-16 pt-24 font-poppins text-white md:px-17.5 md:pt-32">
        <div className="mx-auto w-full max-w-3xl">
          <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-white/50 sm:text-xs">
            Your workout
          </p>
          <h1 className="mb-8 text-4xl font-semibold uppercase leading-none md:text-6xl">
            {splitLabel} day
          </h1>

          {/* Split tabs */}
          <div className="mb-8 grid grid-cols-3 gap-2">
            {splits.map((s) => (
              <Link
                key={s.key}
                href={`/dashboard/workouts?split=${s.key}`}
                className={`border px-2 py-3 text-center text-xs uppercase tracking-[0.15em] transition-colors ${
                  s.key === split
                    ? "border-[#d4d4d4] bg-[#d4d4d4] text-black"
                    : "border-white/30 text-white hover:bg-white/10"
                }`}
              >
                {s.label}
                {s.key === todaySplit && (
                  <span className="mt-0.5 block text-[9px] tracking-[0.15em] opacity-60">
                    Today
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Level */}
          <div className="mb-6 border border-white/20 p-4">
            <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-white/50">
              Your level
            </p>
            <p className="mb-1 text-xl font-semibold uppercase">
              {level.label}
            </p>
            <p className="text-xs leading-snug text-white/50">{level.reason}</p>
          </div>

          {exercises.length === 0 ? (
            <p className="border-l-2 border-red-500 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              No {splitLabel.toLowerCase()} workouts have been added yet. Try
              another day.
            </p>
          ) : (
            <>
              <div className="mb-8 grid grid-cols-2 gap-2 md:grid-cols-4">
                <Stat label="Exercises" value={exercises.length} />
                <Stat
                  label="Sets × reps"
                  value={`${settings.sets} × ${settings.reps}`}
                />
                <Stat
                  label="Rest"
                  value={`${settings.restSetSeconds}s / ${settings.restExerciseSeconds}s`}
                  hint="sets / exercises"
                />
                <Stat label="Time" value={`~${estimatedMinutes} min`} />
              </div>

              <ol className="mb-8 flex flex-col gap-2">
                {exercises.map((e, i) => (
                  <li
                    key={e.id}
                    className="flex items-center gap-4 bg-[#141414] p-3"
                  >
                    <span className="w-6 text-sm text-white/40">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="relative h-14 w-14 shrink-0 bg-[#d4d4d4]">
                      <Image
                        src={e.startImageUrl}
                        alt={e.title}
                        fill
                        sizes="56px"
                        className="object-contain"
                      />
                    </div>
                    <span className="min-w-0 flex-1 truncate text-sm uppercase tracking-[0.05em]">
                      {e.title}
                    </span>
                    <span className="shrink-0 text-xs text-white/60">
                      {e.sets} × {e.reps}
                    </span>
                  </li>
                ))}
              </ol>

              <button
                type="button"
                onClick={startWorkout}
                className={`${primaryBtn} w-full`}
              >
                Start workout
              </button>
              <p className="mt-4 text-center text-xs text-white/40">
                Warm up for 3 to 5 minutes before you begin.
              </p>
            </>
          )}
        </div>
      </main>
    );
  }

  // ---------- done ----------
  if (phase === "done") {
    const otherSplits = splits.filter((s) => s.key !== split);
    return (
      <main className="flex min-h-svh items-center justify-center bg-[#0a0a0a] px-5 pb-16 pt-24 font-poppins text-white">
        <div className="w-full max-w-md text-center">
          <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-green-400 sm:text-xs">
            Workout complete
          </p>
          <h1 className="mb-8 text-4xl font-semibold uppercase leading-none md:text-5xl">
            Great work
          </h1>

          <div className="mb-8 grid grid-cols-2 gap-2">
            <Stat label="Sets done" value={setsDone} />
            <Stat
              label="Time"
              value={`${Math.max(1, Math.round(elapsed / 60))} min`}
            />
          </div>

          {saveStatus !== "idle" && (
            <p
              className={`mb-4 text-xs uppercase tracking-[0.15em] ${
                saveStatus === "saved"
                  ? "text-green-400"
                  : saveStatus === "error"
                    ? "text-red-400"
                    : "text-white/50"
              }`}
            >
              {saveStatus === "saving" && "Saving your workout..."}
              {saveStatus === "saved" && "Saved to My Status"}
              {saveStatus === "error" && (
                <>
                  Could not save.{" "}
                  <button
                    type="button"
                    onClick={() =>
                      saveWorkout(Math.max(1, Math.round(elapsed / 60)))
                    }
                    className="underline underline-offset-4"
                  >
                    Try again
                  </button>
                </>
              )}
            </p>
          )}

          <div className="flex flex-col gap-2">
            {otherSplits.map((s) => (
              <Link
                key={s.key}
                href={`/dashboard/workouts?split=${s.key}`}
                className={`${secondaryBtn} block`}
              >
                Plan a {s.label} day
              </Link>
            ))}
            <button
              type="button"
              onClick={resetToOverview}
              className={primaryBtn}
            >
              Back to overview
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ---------- ready / work / rest ----------
  const nextExercise = setNumber < current.sets ? null : exercises[exIndex + 1];

  return (
    <main className="min-h-svh bg-[#0a0a0a] px-5 pb-40 pt-24 font-poppins text-white md:px-17.5 md:pt-28">
      <div className="mx-auto w-full max-w-3xl">
        {/* Progress */}
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-white/50 sm:text-xs">
            <span>
              Exercise {exIndex + 1} / {exercises.length}
            </span>
            <button
              type="button"
              onClick={endWorkout}
              className="uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-white"
            >
              End
            </button>
          </div>
          <div className="h-1 w-full bg-white/10">
            <div
              className="h-full bg-[#d4d4d4] transition-all duration-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>

        {phase === "rest" ? (
          <div className="text-center">
            <TimerRing
              timeLeft={timeLeft}
              total={totalTime}
              label={paused ? "Paused" : "Rest"}
              tone="text-sky-400"
            />

            <div className="mx-auto mt-8 max-w-md border border-white/20 p-4 text-left">
              <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/50">
                Up next
              </p>
              {nextExercise ? (
                <>
                  <p className="mb-3 text-lg font-semibold uppercase">
                    {nextExercise.title}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <PoseImage
                      src={nextExercise.startImageUrl}
                      alt={`${nextExercise.title} start`}
                      label="Start"
                    />
                    <PoseImage
                      src={nextExercise.finishImageUrl}
                      alt={`${nextExercise.title} finish`}
                      label="Finish"
                    />
                  </div>
                </>
              ) : (
                <p className="text-lg font-semibold uppercase">
                  {current.title}
                  <span className="block text-xs font-normal normal-case tracking-normal text-white/60">
                    Set {setNumber + 1} of {current.sets}
                  </span>
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="mb-2 text-3xl font-semibold uppercase leading-tight md:text-5xl">
                {current.title}
              </h1>
              <p className="text-xs uppercase tracking-[0.15em] text-white/60">
                Set {setNumber} of {current.sets} · {current.reps} reps
              </p>
            </div>

            {/* Start and finish side by side */}
            <div className="mb-8 grid grid-cols-2 gap-2 md:gap-3">
              <PoseImage
                src={current.startImageUrl}
                alt={`${current.title} start position`}
                label="1 · Start"
              />
              <PoseImage
                src={current.finishImageUrl}
                alt={`${current.title} finish position`}
                label="2 · Finish"
              />
            </div>

            {phase === "work" && (
              <div className="mb-8">
                <TimerRing
                  timeLeft={timeLeft}
                  total={totalTime}
                  label={paused ? "Paused" : `Do ${current.reps} reps`}
                  tone="text-green-400"
                />
              </div>
            )}

            <div className="border-t border-white/20 pt-6">
              <h2 className="mb-3 text-[10px] uppercase tracking-[0.2em] text-white/50 sm:text-xs">
                How to do it
              </h2>
              <p className="whitespace-pre-line text-base leading-relaxed text-white/80">
                {current.instructions}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Bottom action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/20 bg-black/95 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-col gap-2">
          <div className="flex gap-2">
            {phase === "ready" && (
              <>
                <button
                  type="button"
                  onClick={skipExercise}
                  className={secondaryBtn}
                >
                  Skip
                </button>
                <button type="button" onClick={startSet} className={primaryBtn}>
                  Start set {setNumber} · {settings.workSeconds}s
                </button>
              </>
            )}

            {phase === "work" && (
              <>
                <button
                  type="button"
                  onClick={togglePause}
                  className={secondaryBtn}
                >
                  {paused ? "Resume" : "Pause"}
                </button>
                <button
                  type="button"
                  onClick={finishSet}
                  className={primaryBtn}
                >
                  Set done
                </button>
              </>
            )}

            {phase === "rest" && (
              <>
                <button
                  type="button"
                  onClick={addTime}
                  className={secondaryBtn}
                >
                  +15s
                </button>
                <button
                  type="button"
                  onClick={finishRest}
                  className={primaryBtn}
                >
                  Skip rest
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value, hint }) {
  return (
    <div className="border border-white/20 p-4 text-left">
      <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-white/50">
        {label}
      </p>
      <p className="text-lg font-semibold">{value}</p>
      {hint && <p className="text-[10px] text-white/40">{hint}</p>}
    </div>
  );
}

function PoseImage({ src, alt, label }) {
  return (
    <figure>
      <div className="relative aspect-square w-full bg-[#d4d4d4]">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 768px) 360px, 45vw"
          className="object-contain"
        />
      </div>
      <figcaption className="mt-2 text-center text-[10px] uppercase tracking-[0.2em] text-white/60">
        {label}
      </figcaption>
    </figure>
  );
}

function TimerRing({ timeLeft, total, label, tone }) {
  const R = 54;
  const C = 2 * Math.PI * R;
  const fraction = total ? Math.min(1, timeLeft / total) : 0;

  return (
    <div className="relative mx-auto h-48 w-48 sm:h-56 sm:w-56">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={R}
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          className="text-white/10"
        />
        <circle
          cx="60"
          cy="60"
          r={R}
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - fraction)}
          className={`${tone} transition-[stroke-dashoffset] duration-300 ease-linear`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-semibold tabular-nums sm:text-6xl">
          {formatTime(timeLeft)}
        </span>
        <span className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/50">
          {label}
        </span>
      </div>
    </div>
  );
}
