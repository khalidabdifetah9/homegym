import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  userProfiles,
  workoutLogs,
  workoutLogDetails,
  benchExercises,
} from "@/db/schema";
import StatsView from "@/components/dashboard/Status/StatsView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Workout Dashboard & Daily Target | ወንዳወንድ Home Gym",
  description:
    "Your central command for tracking consistency, reviewing physical metrics, and launching today's personalized home gym routine.",
};

const EAT = 3 * 60 * 60 * 1000;
const WEEKLY_GOAL = 3;
const dayNum = (date) => Math.floor((date.getTime() + EAT) / 86400000);
const dayLabel = (n) =>
  new Date(n * 86400000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

export default async function StatsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/signin");
  const userId = session.user.id;
  const username = session.user.name

  const [profile] = await db
    .select({
      age: userProfiles.age,
      weightKg: userProfiles.weightKg,
      maxPullUps: userProfiles.maxPullUps,
      maxDips: userProfiles.maxDips,
      experienceYears: userProfiles.experienceYears,
    })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  const logs = await db
    .select({
      id: workoutLogs.id,
      split: workoutLogs.splitCategory,
      durationMinutes: workoutLogs.durationMinutes,
      completedAt: workoutLogs.completedAt,
    })
    .from(workoutLogs)
    .where(eq(workoutLogs.userId, userId))
    .orderBy(desc(workoutLogs.completedAt));

  const details = await db
    .select({
      logId: workoutLogDetails.workoutLogId,
      exerciseId: workoutLogDetails.exerciseId,
      title: benchExercises.title,
      sets: workoutLogDetails.setsCompleted,
      reps: workoutLogDetails.repsCompleted,
    })
    .from(workoutLogDetails)
    .innerJoin(workoutLogs, eq(workoutLogDetails.workoutLogId, workoutLogs.id))
    .innerJoin(
      benchExercises,
      eq(workoutLogDetails.exerciseId, benchExercises.id),
    )
    .where(eq(workoutLogs.userId, userId));

  const today = dayNum(new Date());

  const totalMinutes = logs.reduce((n, l) => n + (l.durationMinutes ?? 0), 0);
  const totalSets = details.reduce((n, d) => n + d.sets, 0);
  const totalReps = details.reduce((n, d) => n + d.reps, 0);

  const days = [...new Set(logs.map((l) => dayNum(l.completedAt)))].sort(
    (a, b) => a - b,
  );
  let bestStreak = 0;
  let run = 0;
  let prev = null;
  for (const d of days) {
    run = prev !== null && d === prev + 1 ? run + 1 : 1;
    bestStreak = Math.max(bestStreak, run);
    prev = d;
  }
  const daySet = new Set(days);
  let cursor = daySet.has(today) ? today : today - 1;
  let currentStreak = 0;
  while (daySet.has(cursor)) {
    currentStreak++;
    cursor--;
  }

  const thisWeekStart = today - ((today + 3) % 7);
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const start = thisWeekStart - 7 * (7 - i);
    return { start, label: dayLabel(start), workouts: 0, minutes: 0 };
  });
  for (const l of logs) {
    const n = dayNum(l.completedAt);
    const w = weeks.find((x) => x.start === n - ((n + 3) % 7));
    if (w) {
      w.workouts++;
      w.minutes += l.durationMinutes ?? 0;
    }
  }

  const perDay = new Map();
  for (const l of logs) {
    const n = dayNum(l.completedAt);
    perDay.set(n, (perDay.get(n) ?? 0) + 1);
  }
  const calendar = Array.from({ length: 28 }, (_, i) => {
    const n = thisWeekStart - 21 + i;
    return {
      key: n,
      label: dayLabel(n),
      count: perDay.get(n) ?? 0,
      future: n > today,
      isToday: n === today,
    };
  });

  const splitCounts = { push: 0, pull: 0, legs: 0 };
  for (const l of logs) splitCounts[l.split]++;

  const byExercise = new Map();
  for (const d of details) {
    const cur = byExercise.get(d.exerciseId) ?? { title: d.title, sets: 0 };
    cur.sets += d.sets;
    byExercise.set(d.exerciseId, cur);
  }
  const topExercises = [...byExercise.values()]
    .sort((a, b) => b.sets - a.sets)
    .slice(0, 6);

  const perLog = new Map();
  for (const d of details) {
    const cur = perLog.get(d.logId) ?? { exercises: 0, sets: 0 };
    cur.exercises++;
    cur.sets += d.sets;
    perLog.set(d.logId, cur);
  }
  const recent = logs.slice(0, 5).map((l) => ({
    id: l.id,
    split: l.split,
    minutes: l.durationMinutes ?? 0,
    exercises: perLog.get(l.id)?.exercises ?? 0,
    sets: perLog.get(l.id)?.sets ?? 0,
    date: l.completedAt.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: "Africa/Addis_Ababa",
    }),
  }));

  const stats = {
    totals: {
      workouts: logs.length,
      minutes: totalMinutes,
      sets: totalSets,
      reps: totalReps,
    },
    streak: { current: currentStreak, best: bestStreak },
    week: { done: weeks[7].workouts, goal: WEEKLY_GOAL },
    weeks: weeks.map(({ label, workouts, minutes }) => ({
      label,
      workouts,
      minutes,
    })),
    calendar,
    splitCounts,
    topExercises,
    recent,
  };

  return <StatsView username = {username} stats={stats} profile={profile ?? null} />;
}
