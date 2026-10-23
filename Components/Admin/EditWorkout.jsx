"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CldUpload from "./CldUpload";
import CldVideoUpload from "./CldVideoUpload";
import MuscleSelect from "./MuscleSelect";
import { validateMuscle } from "@/lib/muscleGroups";

const CATEGORY_OPTIONS = [
  { value: "push", label: "Push" },
  { value: "pull", label: "Pull" },
  { value: "legs", label: "Legs" },
];

export default function EditWorkout({ workout }) {
  const router = useRouter();

  // What is saved in the database right now (updated after each save)
  const [saved, setSaved] = useState(workout);

  const [title, setTitle] = useState(workout.title);
  const [category, setCategory] = useState(workout.category);
  const [muscleGroup, setMuscleGroup] = useState(workout.muscleGroup ?? "");
  const [subMuscle, setSubMuscle] = useState(workout.subMuscle ?? "");
  const [startImageUrl, setStartImageUrl] = useState(workout.startImageUrl);
  const [finishImageUrl, setFinishImageUrl] = useState(workout.finishImageUrl);
  const [videoUrl, setVideoUrl] = useState(workout.videoUrl ?? "");
  const [instructions, setInstructions] = useState(workout.instructions);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });
  const [visible, setVisible] = useState(false);

  const busy = saving || deleting;

  const dirty =
    title !== saved.title ||
    category !== saved.category ||
    muscleGroup !== (saved.muscleGroup ?? "") ||
    subMuscle !== (saved.subMuscle ?? "") ||
    startImageUrl !== saved.startImageUrl ||
    finishImageUrl !== saved.finishImageUrl ||
    videoUrl !== (saved.videoUrl ?? "") ||
    instructions !== saved.instructions;

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

  const notify = (type, text) => {
    setVisible(false);
    setMessage({ type, text });
  };

  const clearFieldError = (field) =>
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });

  const handleSave = async () => {
    setFieldErrors({});

    const localErrors = {};
    if (!title.trim()) localErrors.title = "Workout title is required.";
    if (!category) localErrors.category = "Please select a category.";
    Object.assign(localErrors, validateMuscle(category, muscleGroup, subMuscle));
    if (!startImageUrl) localErrors.startImageUrl = "Start image is required.";
    if (!finishImageUrl)
      localErrors.finishImageUrl = "Finish image is required.";
    if (!instructions.trim())
      localErrors.instructions = "Instructions are required.";

    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      notify("error", Object.values(localErrors).join(" "));
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/workouts/${workout.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          muscleGroup,
          subMuscle: subMuscle || null,
          startImageUrl,
          finishImageUrl,
          videoUrl: videoUrl || null,
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
        notify(
          "error",
          details || data?.message || `Request failed (${res.status})`
        );
        return;
      }

      setSaved({
        ...workout,
        title: title.trim(),
        category,
        muscleGroup,
        subMuscle: subMuscle || null,
        startImageUrl,
        finishImageUrl,
        videoUrl: videoUrl || null,
        instructions: instructions.trim(),
      });
      notify("success", data?.message || "Workout updated.");
      router.refresh();
    } catch (err) {
      notify(
        "error",
        err instanceof TypeError
          ? "Network error. Check your connection and try again."
          : err.message || "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/workouts/${workout.id}`, {
        method: "DELETE",
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        // no JSON body
      }

      if (!res.ok) {
        notify("error", data?.message || `Request failed (${res.status})`);
        setConfirmDelete(false);
        return;
      }

      router.push("/admin/update-workout");
      router.refresh();
    } catch (err) {
      notify(
        "error",
        err instanceof TypeError
          ? "Network error. Check your connection and try again."
          : err.message || "Something went wrong."
      );
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  const labelClass =
    "mb-2 block text-[10px] uppercase tracking-[0.2em] text-zinc-500 sm:text-[11px]";
  const fieldClass =
    "w-full border-0 border-b border-zinc-600 bg-transparent py-3 text-base text-white placeholder:text-zinc-600 focus:border-white focus:outline-none disabled:opacity-50";
  const errorClass = "mt-2 text-xs text-red-500";

  const isSuccess = message.type === "success";

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-5 pb-16 pt-24 font-poppins text-white md:ml-64 md:px-10 md:pt-12">
      <div className="mx-auto w-full max-w-[585px]">
        <Link
          href="/admin/workouts"
          className="mb-6 inline-block text-[10px] uppercase tracking-[0.2em] text-zinc-500 transition-colors hover:text-white sm:text-[11px]"
        >
          ← All workouts
        </Link>

        <h1
          className="mb-8 text-2xl font-bold uppercase leading-tight text-white sm:mb-10 sm:text-4xl"
          style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
        >
          Edit workout
        </h1>

        {/* Title */}
        <div className="mb-6 sm:mb-8">
          <label className={labelClass}>Title</label>
          <input
            type="text"
            value={title}
            maxLength={150}
            disabled={busy}
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

        {/* Category */}
        <div className="mb-6 sm:mb-8">
          <label className={labelClass}>Category</label>
          <select
            value={category}
            disabled={busy}
            onChange={(e) => {
              setCategory(e.target.value);
              setMuscleGroup("");
              setSubMuscle("");
              clearFieldError("category");
              clearFieldError("muscleGroup");
              clearFieldError("subMuscle");
            }}
            className={`${fieldClass} [color-scheme:dark]`}
          >
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

        {/* Muscle group + target area */}
        <MuscleSelect
          category={category}
          group={muscleGroup}
          sub={subMuscle}
          disabled={busy}
          errors={fieldErrors}
          onGroup={(v) => {
            setMuscleGroup(v);
            setSubMuscle("");
            clearFieldError("muscleGroup");
            clearFieldError("subMuscle");
          }}
          onSub={(v) => {
            setSubMuscle(v);
            clearFieldError("subMuscle");
          }}
        />

        {/* Start image */}
        <div className="mb-6 sm:mb-8">
          <label className={labelClass}>Start Position Image</label>
          <div className="flex items-center gap-3 border-b border-zinc-600 pb-3 sm:gap-4">
            <div className="relative h-16 w-16 shrink-0 bg-[#d4d4d4]">
              <Image
                src={startImageUrl}
                alt="Start position"
                fill
                sizes="64px"
                className="object-contain"
              />
            </div>
            <CldUpload
              onUploadSuccess={(url) => {
                setStartImageUrl(url);
                clearFieldError("startImageUrl");
              }}
            />
            <span className="min-w-0 flex-1 truncate text-xs text-zinc-500">
              {startImageUrl !== saved.startImageUrl
                ? "New image selected"
                : "Current image"}
            </span>
          </div>
          {fieldErrors.startImageUrl && (
            <p className={errorClass}>{fieldErrors.startImageUrl}</p>
          )}
        </div>

        {/* Finish image */}
        <div className="mb-6 sm:mb-8">
          <label className={labelClass}>Finish Position Image</label>
          <div className="flex items-center gap-3 border-b border-zinc-600 pb-3 sm:gap-4">
            <div className="relative h-16 w-16 shrink-0 bg-[#d4d4d4]">
              <Image
                src={finishImageUrl}
                alt="Finish position"
                fill
                sizes="64px"
                className="object-contain"
              />
            </div>
            <CldUpload
              onUploadSuccess={(url) => {
                setFinishImageUrl(url);
                clearFieldError("finishImageUrl");
              }}
            />
            <span className="min-w-0 flex-1 truncate text-xs text-zinc-500">
              {finishImageUrl !== saved.finishImageUrl
                ? "New image selected"
                : "Current image"}
            </span>
          </div>
          {fieldErrors.finishImageUrl && (
            <p className={errorClass}>{fieldErrors.finishImageUrl}</p>
          )}
        </div>

        {/* Video */}
        <div className="mb-6 sm:mb-8">
          <label className={labelClass}>Demonstration Video (optional)</label>
          {videoUrl && (
            <video
              key={videoUrl}
              src={videoUrl}
              controls
              preload="metadata"
              className="mb-3 aspect-video w-full bg-black"
            />
          )}
          <div className="flex items-center gap-3 border-b border-zinc-600 pb-3 sm:gap-4">
            <CldVideoUpload
              hasVideo={Boolean(videoUrl)}
              onUploadSuccess={(url) => {
                setVideoUrl(url);
                clearFieldError("videoUrl");
              }}
            />
            <span className="min-w-0 flex-1 truncate text-xs text-zinc-500">
              {!videoUrl
                ? "No video"
                : videoUrl !== (saved.videoUrl ?? "")
                ? "New video selected"
                : "Current video"}
            </span>
            {videoUrl && (
              <button
                type="button"
                disabled={busy}
                onClick={() => setVideoUrl("")}
                className="shrink-0 text-xs uppercase tracking-[0.15em] text-zinc-500 transition-colors hover:text-red-400 disabled:opacity-50"
              >
                Remove
              </button>
            )}
          </div>
          {fieldErrors.videoUrl && (
            <p className={errorClass}>{fieldErrors.videoUrl}</p>
          )}
        </div>

        {/* Instructions */}
        <div className="mb-8">
          <label className={labelClass}>Instructions</label>
          <textarea
            value={instructions}
            rows={7}
            maxLength={5000}
            disabled={busy}
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

        {/* Save */}
        <button
          type="button"
          onClick={handleSave}
          disabled={busy || !dirty}
          className="w-full bg-zinc-300 py-4 text-xs uppercase tracking-[0.2em] text-black transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : dirty ? "Save changes" : "No changes to save"}
        </button>

        {/* Message */}
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
            <p className="flex-1 leading-snug">{message.text}</p>
          </div>
        )}

        {/* Delete */}
        <div className="mt-12 border-t border-white/10 pt-8">
          <h2 className="mb-2 text-[10px] uppercase tracking-[0.2em] text-red-400 sm:text-[11px]">
            Danger zone
          </h2>

          {confirmDelete ? (
            <div className="border border-red-500/50 bg-red-500/5 p-4">
              <p className="mb-4 text-sm leading-snug text-white/80">
                Delete &quot;{saved.title}&quot;? It will also be removed from
                every user&apos;s workout history and stats. This can&apos;t be
                undone.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setConfirmDelete(false)}
                  className="border border-white/40 px-4 py-3.5 text-xs uppercase tracking-[0.15em] transition-colors hover:bg-white/10 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDelete}
                  className="border border-red-500 bg-red-500 px-4 py-3.5 text-xs uppercase tracking-[0.15em] text-white transition-colors hover:bg-transparent hover:text-red-400 disabled:cursor-wait disabled:opacity-60"
                >
                  {deleting ? "Deleting..." : "Yes, delete"}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirmDelete(true)}
              className="w-full border border-red-500/60 py-4 text-xs uppercase tracking-[0.2em] text-red-400 transition-colors hover:bg-red-500 hover:text-white disabled:opacity-50"
            >
              Delete workout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}