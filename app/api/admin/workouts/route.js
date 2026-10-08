import { NextResponse } from "next/server";
import { db } from "@/db";
import { benchExercises } from "@/db/schema";

export const dynamic = "force-dynamic";

const CATEGORIES = ["push", "pull", "legs"];

function errorResponse(message, status, errors = null) {
  return NextResponse.json(
    { success: false, message, ...(errors && { errors }) },
    { status }
  );
}

function checkImage(value, label) {
  if (typeof value !== "string" || !value.trim()) {
    return `${label} is required.`;
  }
  try {
    if (new URL(value).protocol !== "https:") {
      return `${label} must use https.`;
    }
  } catch {
    return `${label} is not a valid URL.`;
  }
  return null;
}

// Admin access is enforced by middleware.js (/api/admin/*)
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Request body must be valid JSON.", 400);
  }

  const { title, category, startImageUrl, finishImageUrl, instructions } =
    body ?? {};
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
      .insert(benchExercises)
      .values({
        title: title.trim(),
        category,
        startImageUrl: startImageUrl.trim(),
        finishImageUrl: finishImageUrl.trim(),
        instructions: instructions.trim(),
      })
      .returning();

    return NextResponse.json(
      { success: true, message: "Workout added.", workout },
      { status: 201 }
    );
  } catch (err) {
    console.error("workouts POST error:", err);

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
    return errorResponse("Something went wrong while saving the workout.", 500);
  }
}