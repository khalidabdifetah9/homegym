"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const EXPERIENCE_OPTIONS = [
  { value: "never", label: "Didn't exercise for more than 6 months" },
  { value: "beginner", label: "Less than 6 months" },
  { value: "intermediate", label: "6 months - 2 years" },
  { value: "advanced", label: "More than 2 years" },
];

const initialForm = {
  age: "",
  gender: "",
  weightKg: "",
  maxPullUps: "",
  maxDips: "",
  experienceYears: "",
};

const inputClass =
  "w-full border-0 border-b border-white/20 bg-transparent pb-3 pt-2.5 text-[0.98rem] font-light text-white outline-none transition-colors " +
  "placeholder:text-white/30 focus:border-white disabled:opacity-50 " +
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

const selectClass =
  "w-full border-0 border-b border-white/20 bg-transparent pb-3 pt-2.5 text-[0.98rem] font-light text-white outline-none transition-colors " +
  "focus:border-white disabled:opacity-50 [color-scheme:dark]";

const errorClass = "text-xs text-red-400";

export default function UserDetails({ onSaved }) {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState({ type: "idle", message: "" });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/user/profile");
        const data = await res.json();
        if (res.ok && data.profile && !cancelled) {
          const p = data.profile;
          setForm({
            age: String(p.age),
            gender: p.gender,
            weightKg: String(p.weightKg),
            maxPullUps: String(p.maxPullUps),
            maxDips: String(p.maxDips),
            experienceYears: p.experienceYears,
          });
        }
      } catch {
        // leave the form empty
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (!status.message) return;
    const timer = setTimeout(
      () => setStatus({ type: "idle", message: "" }),
      3000
    );
    return () => clearTimeout(timer);
  }, [status]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const validate = () => {
    const errors = {};
    const int = (v) => (v === "" ? NaN : Number(v));

    const age = int(form.age);
    if (!Number.isInteger(age) || age < 10 || age > 100)
      errors.age = "Enter your age (10 to 100).";

    if (!form.gender) errors.gender = "Please select your gender.";

    const weight = int(form.weightKg);
    if (!Number.isInteger(weight) || weight < 20 || weight > 300)
      errors.weightKg = "Enter your weight in whole kg (20 to 300).";

    const pullUps = int(form.maxPullUps);
    if (!Number.isInteger(pullUps) || pullUps < 0 || pullUps > 100)
      errors.maxPullUps = "Enter a whole number from 0 to 100.";

    const dips = int(form.maxDips);
    if (!Number.isInteger(dips) || dips < 0 || dips > 200)
      errors.maxDips = "Enter a whole number from 0 to 200.";

    if (!form.experienceYears)
      errors.experienceYears = "Please select how long you have been exercising.";

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "idle", message: "" });

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setStatus({ type: "error", message: "Please fix the highlighted fields." });
      return;
    }

    setFieldErrors({});
    setSaving(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: Number(form.age),
          gender: form.gender,
          weightKg: Number(form.weightKg),
          maxPullUps: Number(form.maxPullUps),
          maxDips: Number(form.maxDips),
          experienceYears: form.experienceYears,
        }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
      }

      if (!res.ok) {
        if (data?.errors) setFieldErrors(data.errors);
        setStatus({
          type: "error",
          message: data?.message || `Request failed (${res.status})`,
        });
        return;
      }

      setStatus({
        type: "success",
        message: data?.message || "Your details have been saved.",
      });
      router.refresh();
      router.push("/dashboard");
      if (onSaved) onSaved();
    } catch (err) {
      setStatus({
        type: "error",
        message:
          err instanceof TypeError
            ? "Network error. Check your connection and try again."
            : err.message || "Something went wrong.",
      });
    } finally {
      setSaving(false);
    }
  };

  const disabled = Boolean(saving || loadingProfile);

  return (
    <main className="flex min-h-screen items-center justify-center bg-black font-poppins text-white">
      <section className="flex w-full max-w-[480px] flex-col gap-9 border-white/20 bg-[#050505] px-6 py-12 sm:border sm:px-12">
        <header>
          <h1 className="mb-2.5 text-[1.6rem] font-medium tracking-[0.01em]">
            Your details
          </h1>
          <p className="max-w-[36ch] text-sm font-light leading-relaxed text-white/60">
            Tell us about yourself so we can build the right training plan.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-[22px]"
        >
          <div className="grid grid-cols-2 gap-5">
            <Field label="Age" error={fieldErrors.age}>
              <input
                name="age"
                type="number"
                inputMode="numeric"
                placeholder="25"
                value={form.age}
                onChange={handleChange}
                disabled={disabled}
                className={inputClass}
              />
            </Field>

            <Field label="Gender" error={fieldErrors.gender}>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                disabled={disabled}
                className={`${selectClass} ${form.gender ? "" : "text-white/30"}`}
              >
                <option value="" disabled className="bg-black text-white/50">
                  Select
                </option>
                <option value="male" className="bg-black text-white">
                  Male
                </option>
                <option value="female" className="bg-black text-white">
                  Female
                </option>
              </select>
            </Field>
          </div>

          <Field label="Weight (kg)" error={fieldErrors.weightKg}>
            <input
              name="weightKg"
              type="number"
              inputMode="numeric"
              placeholder="70"
              value={form.weightKg}
              onChange={handleChange}
              disabled={disabled}
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-5">
            <Field label="Max pull-ups" error={fieldErrors.maxPullUps}>
              <input
                name="maxPullUps"
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={form.maxPullUps}
                onChange={handleChange}
                disabled={disabled}
                className={inputClass}
              />
            </Field>

            <Field label="Max dips" error={fieldErrors.maxDips}>
              <input
                name="maxDips"
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={form.maxDips}
                onChange={handleChange}
                disabled={disabled}
                className={inputClass}
              />
            </Field>
          </div>

          <Field
            label="How long have you been exercising?"
            error={fieldErrors.experienceYears}
          >
            <select
              name="experienceYears"
              value={form.experienceYears}
              onChange={handleChange}
              disabled={disabled}
              className={`${selectClass} ${
                form.experienceYears ? "" : "text-white/30"
              }`}
            >
              <option value="" disabled className="bg-black text-white/50">
                Select an option
              </option>
              {EXPERIENCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-black text-white">
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          {status.message && (
            <p
              role="status"
              className={`border-l-2 px-3.5 py-3 text-sm ${
                status.type === "error"
                  ? "border-red-500 text-red-300"
                  : "border-emerald-500 text-emerald-200"
              }`}
            >
              {status.message}
            </p>
          )}

          <button
            type="submit"
            disabled={disabled}
            className="mt-1.5 border border-[#d9d9d9] bg-[#d9d9d9] px-6 py-4 text-[0.78rem] font-medium uppercase tracking-[0.16em] text-[#111] transition-colors hover:bg-transparent hover:text-white disabled:cursor-wait disabled:opacity-60 disabled:hover:bg-[#d9d9d9] disabled:hover:text-[#111]"
          >
            {saving ? "Saving..." : "Save details"}
          </button>
        </form>
      </section>
    </main>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[0.68rem] uppercase tracking-[0.16em] text-white/60">
        {label}
      </span>
      {children}
      {error && <span className={errorClass}>{error}</span>}
    </label>
  );
}