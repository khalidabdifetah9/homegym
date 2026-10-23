import { getGroups, groupLabel, subLabel, muscleLabel } from "./muscleGroups";

export const SPLITS = ["push", "pull", "legs"];
const SPLIT_LABELS = { push: "Push", pull: "Pull", legs: "Legs" };

// Exercises shown for a muscle that has no target areas (triceps, back, ...)
const PICKS_WITHOUT_SUBS = 2;

const EXPERIENCE_TIER = { never: 0, beginner: 1, intermediate: 2, advanced: 3 };
const EXPERIENCE_LABEL = {
  never: "Hasn't exercised for 6+ months",
  beginner: "Under 6 months of training",
  intermediate: "6 months to 2 years of training",
  advanced: "More than 2 years of training",
};

// Every level does the same exercises. Only sets, reps and timers change.
const LEVELS = [
  { key: "starter", label: "Starter", sets: 2, reps: 8, workSeconds: 40, restSetSeconds: 60, restExerciseSeconds: 90 },
  { key: "beginner", label: "Beginner", sets: 3, reps: 10, workSeconds: 45, restSetSeconds: 60, restExerciseSeconds: 90 },
  { key: "intermediate", label: "Intermediate", sets: 3, reps: 12, workSeconds: 50, restSetSeconds: 45, restExerciseSeconds: 75 },
  { key: "advanced", label: "Advanced", sets: 4, reps: 12, workSeconds: 55, restSetSeconds: 45, restExerciseSeconds: 60 },
];

function tierFrom(value, thresholds) {
  let tier = 0;
  for (const t of thresholds) if (value >= t) tier++;
  return tier;
}

// Level = 60% training experience + 40% strength (pull-ups and dips).
// Strength can lift you at most one level above your experience.
function getLevelIndex(profile) {
  const experience = EXPERIENCE_TIER[profile.experienceYears] ?? 1;
  const pull = tierFrom(profile.maxPullUps, [3, 8, 15]);
  const dips = tierFrom(profile.maxDips, [5, 12, 25]);
  const strength = (pull + dips) / 2;

  const score = Math.round(experience * 0.6 + strength * 0.4);
  return Math.max(0, Math.min(score, experience + 1, 3));
}

// Seeded random: the same user sees the same plan all day,
// and gets different exercises tomorrow
function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(list, rand) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Sort first so the result depends only on the seed, not on database order
const byTitle = (a, b) =>
  a.title.localeCompare(b.title) || a.id.localeCompare(b.id);

// One exercise per target area, two for muscles without target areas.
// Order follows muscleGroups.js: chest (upper, middle, lower),
// shoulders (front, side, rear), triceps...
function pickDay(pool, category, rand) {
  const picked = [];

  for (const group of getGroups(category)) {
    const inGroup = pool.filter((e) => e.muscleGroup === group.key);

    if (group.subs.length > 0) {
      for (const sub of group.subs) {
        const options = inGroup.filter((e) => e.subMuscle === sub.key).sort(byTitle);
        if (options.length > 0) picked.push(shuffle(options, rand)[0]);
      }
    } else {
      const options = [...inGroup].sort(byTitle);
      picked.push(...shuffle(options, rand).slice(0, PICKS_WITHOUT_SUBS));
    }
  }

  return picked;
}

/**
 * profile:   a row from user_profiles
 * exercises: rows from bench_exercises
 * split:     "push" | "pull" | "legs"
 * seed:      any string; the same seed always gives the same plan
 */
export function generateWorkoutPlan(profile, exercises, split, seed = "") {
  const safeSplit = SPLITS.includes(split) ? split : SPLITS[0];
  const base = LEVELS[getLevelIndex(profile)];

  let { sets, restSetSeconds, restExerciseSeconds } = base;
  if (profile.age >= 55) {
    restSetSeconds += 15;
    restExerciseSeconds += 15;
  }
  if (profile.age < 16) sets = Math.min(sets, 3);

  const rand = mulberry32(hashSeed(`${seed}|${safeSplit}`));
  const picked = pickDay(
    exercises.filter((e) => e.category === safeSplit),
    safeSplit,
    rand
  );

  const n = picked.length;
  const totalSeconds =
    n * (sets * base.workSeconds + (sets - 1) * restSetSeconds) +
    Math.max(0, n - 1) * restExerciseSeconds;

  return {
    split: safeSplit,
    splitLabel: SPLIT_LABELS[safeSplit],
    splits: SPLITS.map((key) => ({ key, label: SPLIT_LABELS[key] })),
    level: {
      key: base.key,
      label: base.label,
      reason: `${EXPERIENCE_LABEL[profile.experienceYears]}, ${profile.maxPullUps} max pull-ups, ${profile.maxDips} max dips`,
    },
    settings: {
      sets,
      reps: base.reps,
      workSeconds: base.workSeconds,
      restSetSeconds,
      restExerciseSeconds,
    },
    exercises: picked.map((e) => ({
      id: e.id,
      title: e.title,
      category: e.category,
      muscleGroup: e.muscleGroup,
      subMuscle: e.subMuscle ?? null,
      groupKey: e.muscleGroup,
      groupLabel: groupLabel(safeSplit, e.muscleGroup),
      subLabel: subLabel(safeSplit, e.muscleGroup, e.subMuscle),
      muscleLabel: muscleLabel(safeSplit, e.muscleGroup, e.subMuscle),
      startImageUrl: e.startImageUrl,
      finishImageUrl: e.finishImageUrl,
      instructions: e.instructions,
      sets,
      reps: base.reps,
    })),
    estimatedMinutes: Math.ceil(totalSeconds / 60),
  };
}