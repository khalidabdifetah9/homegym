import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { workoutLogs, workoutLogDetails } from "@/db/schema";

export const dynamic = "force-dynamic";

const SPLITS = ["push", "pull", "legs"];
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function errorResponse(message, status) {
  return NextResponse.json({ success: false, message }, { status });
}

const isInt = (v, min, max) => Number.isInteger(v) && v >= min && v <= max;

export async function POST(request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return errorResponse("Please sign in first.", 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Request body must be valid JSON.", 400);
  }

  const { split, durationMinutes, exercises } = body ?? {};

  if (!SPLITS.includes(split)) return errorResponse("Invalid workout type.", 422);
  if (!isInt(durationMinutes, 1, 600))
    return errorResponse("Invalid workout duration.", 422);
  if (!Array.isArray(exercises) || exercises.length < 1 || exercises.length > 20)
    return errorResponse("No completed exercises to save.", 422);

  const seen = new Set();
  for (const e of exercises) {
    if (
      typeof e?.exerciseId !== "string" ||
      !UUID_REGEX.test(e.exerciseId) ||
      seen.has(e.exerciseId) ||
      !isInt(e.setsCompleted, 1, 10) ||
      !isInt(e.repsCompleted, 1, 500)
    ) {
      return errorResponse("Invalid exercise data.", 422);
    }
    seen.add(e.exerciseId);
  }

  let logId = null;
  try {
    const [log] = await db
      .insert(workoutLogs)
      .values({ userId: session.user.id, splitCategory: split, durationMinutes })
      .returning({ id: workoutLogs.id });
    logId = log.id;

    await db.insert(workoutLogDetails).values(
      exercises.map((e) => ({
        workoutLogId: logId,
        exerciseId: e.exerciseId,
        setsCompleted: e.setsCompleted,
        repsCompleted: e.repsCompleted,
      }))
    );

    return NextResponse.json(
      { success: true, message: "Workout saved." },
      { status: 201 }
    );
  } catch (err) {
    console.error("workouts log error:", err);

    if (logId) {
      try {
        await db.delete(workoutLogs).where(eq(workoutLogs.id, logId));
      } catch (cleanupErr) {
        console.error("workouts log cleanup error:", cleanupErr);
      }
    }

    const code = err?.code ?? err?.cause?.code;
    if (code === "23503")
      return errorResponse("One of the exercises no longer exists.", 404);
    if (code === "42P01" || code === "42703")
      return errorResponse("Database tables are out of date. Run drizzle-kit push.", 500);
    return errorResponse("Could not save your workout.", 500);
  }
}