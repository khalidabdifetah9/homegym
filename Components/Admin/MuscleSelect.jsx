"use client";

import { getGroups, findGroup } from "@/lib/muscleGroups";

const labelClass =
  "mb-2 block text-[10px] uppercase tracking-[0.2em] text-zinc-500 sm:text-[11px]";
const fieldClass =
  "w-full border-0 border-b border-zinc-600 bg-transparent py-3 text-base text-white focus:border-white focus:outline-none disabled:opacity-50 [color-scheme:dark]";
const errorClass = "mt-2 text-xs text-red-500";

export default function MuscleSelect({
  category,
  group,
  sub,
  onGroup,
  onSub,
  disabled,
  errors = {},
}) {
  const groups = getGroups(category);
  const current = findGroup(category, group);
  const subs = current?.subs ?? [];

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <label className={labelClass}>Muscle Group</label>
        <select
          value={group}
          disabled={disabled || !category}
          onChange={(e) => onGroup(e.target.value)}
          className={`${fieldClass} ${group ? "" : "text-zinc-600"}`}
        >
          <option value="" disabled className="bg-black text-zinc-500">
            {category ? "Select a muscle group" : "Select a category first"}
          </option>
          {groups.map((g) => (
            <option key={g.key} value={g.key} className="bg-black text-white">
              {g.label}
            </option>
          ))}
        </select>
        {errors.muscleGroup && <p className={errorClass}>{errors.muscleGroup}</p>}
      </div>

      {subs.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <label className={labelClass}>{current.label} Target Area</label>
          <select
            value={sub}
            disabled={disabled}
            onChange={(e) => onSub(e.target.value)}
            className={`${fieldClass} ${sub ? "" : "text-zinc-600"}`}
          >
            <option value="" disabled className="bg-black text-zinc-500">
              Select a target area
            </option>
            {subs.map((s) => (
              <option key={s.key} value={s.key} className="bg-black text-white">
                {s.label}
              </option>
            ))}
          </select>
          {errors.subMuscle && <p className={errorClass}>{errors.subMuscle}</p>}
        </div>
      )}
    </>
  );
}