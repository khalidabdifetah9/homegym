import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { userProfiles } from "@/db/schema";

export const dynamic = "force-dynamic";

const GENDERS = ["male", "female"];
const EXPERIENCE = ["never", "beginner", "intermediate", "advanced"];

function errorResponse(message, status, errors = null) {
  return NextResponse.json(
    { success: false, message, ...(errors && { errors }) },
    { status }
  );
}

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.id ?? null;
}

// Whole number within a range, or null if invalid
function toInt(value, min, max) {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n < min || n > max) return null;
  return n;
}

// Load the current profile (used to pre-fill the form)
export async function GET() {
  const userId = await getUserId();
  if (!userId) return errorResponse("Please sign in first.", 401);

  try {
    const [profile] = await db
      .select({
        gender: userProfiles.gender,
        age: userProfiles.age,
        weightKg: userProfiles.weightKg,
        maxPullUps: userProfiles.maxPullUps,
        maxDips: userProfiles.maxDips,
        experienceYears: userProfiles.experienceYears,
      })
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    return NextResponse.json({ success: true, profile: profile ?? null });
  } catch (err) {
    console.error("profile GET error:", err);
    return errorResponse("Could not load your details.", 500);
  }
}

export async function POST(request) {
  const userId = await getUserId();
  if (!userId) return errorResponse("Please sign in first.", 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Request body must be valid JSON.", 400);
  }

  const { age, gender, weightKg, maxPullUps, maxDips, experienceYears } =
    body ?? {};
  const errors = {};

  const ageValue = toInt(age, 10, 100);
  if (ageValue === null) errors.age = "Enter your age (10 to 100).";

  if (!GENDERS.includes(gender)) errors.gender = "Please select your gender.";

  const weightValue = toInt(weightKg, 20, 300);
  if (weightValue === null)
    errors.weightKg = "Enter your weight in whole kg (20 to 300).";

  const pullUpsValue = toInt(maxPullUps, 0, 100);
  if (pullUpsValue === null)
    errors.maxPullUps = "Enter a whole number from 0 to 100.";

  const dipsValue = toInt(maxDips, 0, 200);
  if (dipsValue === null) errors.maxDips = "Enter a whole number from 0 to 200.";

  if (!EXPERIENCE.includes(experienceYears))
    errors.experienceYears = "Please select how long you have been exercising.";

  if (Object.keys(errors).length > 0) {
    return errorResponse("Please fix the highlighted fields.", 422, errors);
  }

  const values = {
    gender,
    age: ageValue,
    weightKg: weightValue,
    maxPullUps: pullUpsValue,
    maxDips: dipsValue,
    experienceYears,
  };

  try {
    await db
      .insert(userProfiles)
      .values({ userId, ...values })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: { ...values, updatedAt: new Date() },
      });

    return NextResponse.json(
      { success: true, message: "Your details have been saved." },
      { status: 201 }
    );
  } catch (err) {
    console.error("profile POST error:", err);

    const code = err?.code ?? err?.cause?.code;
    if (code === "23503") {
      return errorResponse("Your account could not be found.", 404);
    }
    if (code === "42703" || code === "42P01") {
      return errorResponse(
        "Database tables are out of date. Run your migration (drizzle-kit push).",
        500
      );
    }
    if (code === "ECONNREFUSED" || code === "ENOTFOUND") {
      return errorResponse("Cannot reach the database. Try again later.", 503);
    }
    return errorResponse("Something went wrong while saving.", 500);
  }
}