import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { benchExercises } from "@/db/schema";

export const dynamic = "force-dynamic";

const CATEGORIES = ["push", "pull", "legs"];
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function errorResponse(message, status, errors = null) {
  return NextResponse.json(
    { success: false, message, ...(errors && { errors }) },
    { status }
  );
}

function dbError(err, fallback) {
  const code = err?.code ?? err?.cause?.code;
  if (code === "42P01" || code === "42703") {
    return errorResponse(
      "Database tables are out of date. Run your migration (drizzle-kit push).",
      500
    );
  }
  if (code === "ECONNREFUSED" || code === "ENOTFOUND") {
    return errorResponse("Cannot reach the database. Try again later.", 503);
  }
  return errorResponse(fallback, 500);
}

function checkImage(value, label) {
  if (typeof value !== "string" || !value.trim()) return `${label} is required.`;
  try {
    if (new URL(value).protocol !== "https:") return `${label} must use https.`;
  } catch {
    return `${label} is not a valid URL.`;
  }
  return null;
}

// Optional: empty/null removes the video
function checkVideo(value) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") return "Video URL is not valid.";
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:") return "Video URL must use https.";
    if (url.hostname !== "res.cloudinary.com")
      return "Video must be uploaded to Cloudinary.";
    if (!url.pathname.includes("/video/upload/"))
      return "The uploaded file is not a video.";
  } catch {
    return "Video URL is not a valid URL.";
  }
  return null;
}

// Admin access is enforced by middleware.js (/api/admin/*)

// Read one workout
export async function GET(_request, { params }) {
  const { id } = await params;
  if (!UUID_REGEX.test(id)) return errorResponse("Invalid workout id.", 400);

  try {
    const [workout] = await db
      .select()
      .from(benchExercises)
      .where(eq(benchExercises.id, id))
      .limit(1);

    if (!workout) return errorResponse("This workout no longer exists.", 404);
    return NextResponse.json({ success: true, workout });
  } catch (err) {
    console.error("workouts GET error:", err);
    return dbError(err, "Could not load the workout.");
  }
}

// Update a workout (the form sends all fields)
export async function PATCH(request, { params }) {
  const { id } = await params;
  if (!UUID_REGEX.test(id)) return errorResponse("Invalid workout id.", 400);

  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Request body must be valid JSON.", 400);
  }

  const {
    title,
    category,
    startImageUrl,
    finishImageUrl,
    videoUrl,
    instructions,
  } = body ?? {};
  const errors = {};

  if (typeof title !== "string" || !title.trim()) {
    errors.title = "Workout title is required.";
  } else if (title.trim().length > 150) {
    errors.title = "Title must be 150 characters or less.";
  }

  if (!CATEGORIES.includes(category)) {
    errors.category = "Please select a category.";
  }

  const startError = checkImage(startImageUrl, "Start image");
  if (startError) errors.startImageUrl = startError;

  const finishError = checkImage(finishImageUrl, "Finish image");
  if (finishError) errors.finishImageUrl = finishError;

  const videoError = checkVideo(videoUrl);
  if (videoError) errors.videoUrl = videoError;

  if (typeof instructions !== "string" || !instructions.trim()) {
    errors.instructions = "Instructions are required.";
  } else if (instructions.trim().length > 5000) {
    errors.instructions = "Instructions must be 5000 characters or less.";
  }

  if (Object.keys(errors).length > 0) {
    return errorResponse("Please fix the highlighted fields.", 422, errors);
  }

  try {
    const [workout] = await db
      .update(benchExercises)
      .set({
        title: title.trim(),
        category,
        startImageUrl: startImageUrl.trim(),
        finishImageUrl: finishImageUrl.trim(),
        videoUrl: videoUrl ? videoUrl.trim() : null,
        instructions: instructions.trim(),
      })
      .where(eq(benchExercises.id, id))
      .returning();

    if (!workout) return errorResponse("This workout no longer exists.", 404);

    return NextResponse.json({
      success: true,
      message: "Workout updated.",
      workout,
    });
  } catch (err) {
    console.error("workouts PATCH error:", err);
    return dbError(err, "Something went wrong while updating the workout.");
  }
}

// Delete a workout
export async function DELETE(_request, { params }) {
  const { id } = await params;
  if (!UUID_REGEX.test(id)) return errorResponse("Invalid workout id.", 400);

  try {
    const [deleted] = await db
      .delete(benchExercises)
      .where(eq(benchExercises.id, id))
      .returning({ id: benchExercises.id });

    if (!deleted) return errorResponse("This workout no longer exists.", 404);

    return NextResponse.json({ success: true, message: "Workout deleted." });
  } catch (err) {
    console.error("workouts DELETE error:", err);
    return dbError(err, "Something went wrong while deleting the workout.");
  }
}