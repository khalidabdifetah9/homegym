export const MUSCLE_CONFIG = {
  push: [
    {
      key: "chest",
      label: "Chest",
      subs: [
        { key: "upper", label: "Upper" },
        { key: "middle", label: "Middle" },
        { key: "lower", label: "Lower" },
      ],
    },
    {
      key: "shoulders",
      label: "Shoulders",
      subs: [
        { key: "front", label: "Front delt" },
        { key: "side", label: "Side delt" },
        { key: "rear", label: "Rear delt" },
      ],
    },
    { key: "triceps", label: "Triceps", subs: [] },
  ],
  pull: [
    { key: "back", label: "Back", subs: [] },
    { key: "biceps", label: "Biceps", subs: [] },
  ],
  legs: [
    { key: "hamstrings", label: "Hamstrings", subs: [] },
    { key: "quadriceps", label: "Quadriceps", subs: [] },
    { key: "calves", label: "Calves", subs: [] },
  ],
};

export const getGroups = (category) => MUSCLE_CONFIG[category] ?? [];

export const findGroup = (category, groupKey) =>
  getGroups(category).find((g) => g.key === groupKey) ?? null;

export function groupLabel(category, groupKey) {
  return findGroup(category, groupKey)?.label ?? "Other";
}

export function subLabel(category, groupKey, subKey) {
  return (
    findGroup(category, groupKey)?.subs.find((s) => s.key === subKey)?.label ??
    null
  );
}

// "Chest · Upper", "Triceps", or "Other"
export function muscleLabel(category, groupKey, subKey) {
  const g = groupLabel(category, groupKey);
  const s = subLabel(category, groupKey, subKey);
  return s ? `${g} · ${s}` : g;
}

// Returns an errors object. Empty when valid, or when the category itself
// is invalid (that error is reported separately).
export function validateMuscle(category, muscleGroup, subMuscle) {
  const errors = {};
  const groups = getGroups(category);
  if (groups.length === 0) return errors;

  const group = findGroup(category, muscleGroup);
  if (!group) {
    errors.muscleGroup = "Please select a muscle group.";
    return errors;
  }

  if (group.subs.length > 0) {
    if (!group.subs.some((s) => s.key === subMuscle)) {
      errors.subMuscle = `Please select the ${group.label.toLowerCase()} target area.`;
    }
  } else if (subMuscle) {
    errors.subMuscle = "This muscle group has no target areas.";
  }
  return errors;
}