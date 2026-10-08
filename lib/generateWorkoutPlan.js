export const SPLITS = ["push", "pull", "legs"];
const SPLIT_LABELS = { push: "Push", pull: "Pull", legs: "Legs" };

const EXPERIENCE_TIER = { never: 0, beginner: 1, intermediate: 2, advanced: 3 };
const EXPERIENCE_LABEL = {
  never: "Hasn't exercised for 6+ months",
  beginner: "Under 6 months of training",
  intermediate: "6 months to 2 years of training",
  advanced: "More than 2 years of training",
};

// Training volume and timers for each level
const LEVELS = [
  { key: "starter", label: "Starter", exercises: 4, sets: 2, reps: 8, workSeconds: 40, restSetSeconds: 60, restExerciseSeconds: 90 },
  { key: "beginner", label: "Beginner", exercises: 5, sets: 3, reps: 10, workSeconds: 45, restSetSeconds: 60, restExerciseSeconds: 90 },
  { key: "intermediate", label: "Intermediate", exercises: 6, sets: 3, reps: 12, workSeconds: 50, restSetSeconds: 45, restExerciseSeconds: 75 },
  { key: "advanced", label: "Advanced", exercises: 7, sets: 4, reps: 12, workSeconds: 55, restSetSeconds: 45, restExerciseSeconds: 60 },
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

// Seeded random, so the plan stays the same all day but changes tomorrow
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

/**
 * profile:   a row from user_profiles
 * exercises: rows from bench_exercises
 * split:     "push" | "pull" | "legs"
 * seed:      any string; the same seed always gives the same plan
 */
export function generateWorkoutPlan(profile, exercises, split, seed = "") {
  const safeSplit = SPLITS.includes(split) ? split : SPLITS[0];
  const levelIndex = getLevelIndex(profile);
  const base = LEVELS[levelIndex];

  let { sets, restSetSeconds, restExerciseSeconds } = base;
  if (profile.age >= 55) {
    restSetSeconds += 15;
    restExerciseSeconds += 15;
  }
  if (profile.age < 16) sets = Math.min(sets, 3);

  const pool = exercises
    .filter((e) => e.category === safeSplit)
    .sort((a, b) => a.title.localeCompare(b.title) || a.id.localeCompare(b.id));

  const rand = mulberry32(hashSeed(`${seed}|${safeSplit}`));
  const picked = shuffle(pool, rand).slice(0, base.exercises);

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
      startImageUrl: e.startImageUrl,
      finishImageUrl: e.finishImageUrl,
      instructions: e.instructions,
      sets,
      reps: base.reps,
    })),
    estimatedMinutes: Math.ceil(totalSeconds / 60),
  };
}