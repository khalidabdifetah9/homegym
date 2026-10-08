import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { userProfiles, benchExercises } from "@/db/schema";
import { generateWorkoutPlan, SPLITS } from "@/lib/generateWorkoutPlan";
import Workout from "@/Components/dashboard/Workouts/Workout";

export const metadata = {
  title: "Guided Workout Session | ወንዳወንድ Home Gym",
  description:
    "Step by step form guidance and real time set logging tailored specifically for your ወንዳወንድ Home Gym bench",
};

export const dynamic = "force-dynamic";

export default async function WorkoutGuidePage({ searchParams }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/signin");

  const { split: splitParam } = await searchParams;

  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, session.user.id))
    .limit(1);

  if (!profile) redirect("/user-details");

  const exercises = await db
    .select({
      id: benchExercises.id,
      title: benchExercises.title,
      category: benchExercises.category,
      startImageUrl: benchExercises.startImageUrl,
      finishImageUrl: benchExercises.finishImageUrl,
      instructions: benchExercises.instructions,
    })
    .from(benchExercises);
  const eat = new Date(Date.now() + 3 * 60 * 60 * 1000);
  const dateKey = eat.toISOString().slice(0, 10);
  const dayNumber = Math.floor(eat.getTime() / 86400000);
  const todaySplit = SPLITS[dayNumber % SPLITS.length];
  const split = SPLITS.includes(splitParam) ? splitParam : todaySplit;

  const plan = {
    ...generateWorkoutPlan(
      profile,
      exercises,
      split,
      `${session.user.id}|${dateKey}`,
    ),
    todaySplit,
  };

  return <Workout key={plan.split} workoutPlan={plan} />;
}
