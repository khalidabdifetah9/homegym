"use client";

import { useState, useEffect } from "react";
import CldUpload from "./CldUpload";

const CATEGORY_OPTIONS = [
  { value: "push", label: "Push" },
  { value: "pull", label: "Pull" },
  { value: "legs", label: "Legs" },
];

export default function AddWorkout() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [startImageUrl, setStartImageUrl] = useState("");
  const [startImageName, setStartImageName] = useState("");
  const [finishImageUrl, setFinishImageUrl] = useState("");
  const [finishImageName, setFinishImageName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });
  const [visible, setVisible] = useState(false);

  // Message fades in, fades out at 2.7s, removed at 3s
  useEffect(() => {
    if (!message.text) return;

    const show = setTimeout(() => setVisible(true), 20);
    const fade = setTimeout(() => setVisible(false), 2700);
    const clear = setTimeout(() => setMessage({ type: "", text: "" }), 3000);

    return () => {
      clearTimeout(show);
      clearTimeout(fade);
      clearTimeout(clear);
    };
  }, [message]);

  const clearFieldError = (field) =>
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });

  const handleSubmit = async () => {
    setVisible(false);
    setMessage({ type: "", text: "" });
    setFieldErrors({});

    const localErrors = {};
    if (!title.trim()) localErrors.title = "Workout title is required.";
    if (!category) localErrors.category = "Please select a category.";
    if (!startImageUrl) localErrors.startImageUrl = "Start image is required.";
    if (!finishImageUrl)
      localErrors.finishImageUrl = "Finish image is required.";
    if (!instructions.trim())
      localErrors.instructions = "Instructions are required.";

    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      setMessage({ type: "error", text: Object.values(localErrors).join(" ") });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          startImageUrl,
          finishImageUrl,
          instructions,
        }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        // no JSON body
      }

      if (!res.ok) {
        if (data?.errors) setFieldErrors(data.errors);
        const details = data?.errors
          ? Object.values(data.errors).join(" ")
          : "";
        setMessage({
          type: "error",
          text: details || data?.message || `Request failed (${res.status})`,
        });
        return;
      }

      setMessage({ type: "success", text: data?.message || "Workout added." });
      setTitle("");
      setCategory("");
      setStartImageUrl("");
      setStartImageName("");
      setFinishImageUrl("");
      setFinishImageName("");
      setInstructions("");
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err instanceof TypeError
            ? "Network error. Check your connection and try again."
            : err.message || "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  const labelClass =
    "mb-2 block text-[10px] uppercase tracking-[0.2em] text-zinc-500 sm:text-[11px]";
  const fieldClass =
    "w-full border-0 border-b border-zinc-600 bg-transparent py-3 text-base text-white placeholder:text-zinc-600 focus:border-white focus:outline-none disabled:opacity-50";
  const errorClass = "mt-2 text-xs text-red-500";

  const isSuccess = message.type === "success";

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-5 py-12 sm:px-6 sm:py-24">
      <div className="mx-auto w-full max-w-[585px]">
        <h1
          className="mb-8 text-2xl font-bold uppercase leading-tight text-white sm:mb-10 sm:text-4xl"
          style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
        >
          Add a workout
        </h1>

        <div className="mb-6 sm:mb-8">
          <label className={labelClass}>Title</label>
          <input
            type="text"
            placeholder="Incline Bench Press"
            value={title}
            maxLength={150}
            disabled={loading}
            onChange={(e) => {
              setTitle(e.target.value);
              clearFieldError("title");
            }}
            className={fieldClass}
          />
          {fieldErrors.title && (
            <p className={errorClass}>{fieldErrors.title}</p>
          )}
        </div>

        <div className="mb-6 sm:mb-8">
          <label className={labelClass}>Category</label>
          <select
            value={category}
            disabled={loading}
            onChange={(e) => {
              setCategory(e.target.value);
              clearFieldError("category");
            }}
            className={`${fieldClass} [color-scheme:dark] ${
              category ? "" : "text-zinc-600"
            }`}
          >
            <option value="" disabled className="bg-black text-zinc-500">
              Select a category
            </option>
            {CATEGORY_OPTIONS.map((o) => (
              <option
                key={o.value}
                value={o.value}
                className="bg-black text-white"
              >
                {o.label}
              </option>
            ))}
          </select>
          {fieldErrors.category && (
            <p className={errorClass}>{fieldErrors.category}</p>
          )}
        </div>

        <div className="mb-6 sm:mb-8">
          <label className={labelClass}>Start Position Image</label>
          <div className="flex items-center gap-3 border-b border-zinc-600 pb-3 sm:gap-4">
            <CldUpload
              onUploadSuccess={(url, name) => {
                setStartImageUrl(url);
                setStartImageName(name);
                clearFieldError("startImageUrl");
              }}
            />
            <span
              className={`min-w-0 flex-1 truncate text-sm ${
                startImageName ? "text-white" : "text-zinc-500"
              }`}
              title={startImageName}
            >
              {startImageName || "No file chosen"}
            </span>
          </div>
          {fieldErrors.startImageUrl && (
            <p className={errorClass}>{fieldErrors.startImageUrl}</p>
          )}
        </div>

        <div className="mb-6 sm:mb-8">
          <label className={labelClass}>Finish Position Image</label>
          <div className="flex items-center gap-3 border-b border-zinc-600 pb-3 sm:gap-4">
            <CldUpload
              onUploadSuccess={(url, name) => {
                setFinishImageUrl(url);
                setFinishImageName(name);
                clearFieldError("finishImageUrl");
              }}
            />
            <span
              className={`min-w-0 flex-1 truncate text-sm ${
                finishImageName ? "text-white" : "text-zinc-500"
              }`}
              title={finishImageName}
            >
              {finishImageName || "No file chosen"}
            </span>
          </div>
          {fieldErrors.finishImageUrl && (
            <p className={errorClass}>{fieldErrors.finishImageUrl}</p>
          )}
        </div>

        <div className="mb-6 sm:mb-8">
          <label className={labelClass}>Instructions</label>
          <textarea
            placeholder="Explain how to perform the exercise from start to finish"
            value={instructions}
            rows={6}
            maxLength={5000}
            disabled={loading}
            onChange={(e) => {
              setInstructions(e.target.value);
              clearFieldError("instructions");
            }}
            className={`${fieldClass} resize-none`}
          />
          {fieldErrors.instructions && (
            <p className={errorClass}>{fieldErrors.instructions}</p>
          )}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-zinc-300 py-4 text-xs uppercase tracking-[0.2em] text-black transition-colors hover:bg-white disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Workout"}
        </button>

        {message.text && (
          <div
            role="alert"
            className={`mt-4 flex items-start gap-3 border-l-2 px-4 py-3 text-sm transition-all duration-300 ${
              visible ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
            } ${
              isSuccess
                ? "border-green-500 bg-green-500/10 text-green-400"
                : "border-red-500 bg-red-500/10 text-red-400"
            }`}
          >
            <svg
              className="mt-0.5 h-4 w-4 shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              {isSuccess ? (
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.58 7.7 9.3a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4z"
                  clipRule="evenodd"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 6a1 1 0 112 0v4a1 1 0 11-2 0V6zm1 8a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              )}
            </svg>
            <p className="flex-1 leading-snug">{message.text}</p>
          </div>
        )}
      </div>
    </div>
  );
}
