import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { userProfiles, benchExercises } from "@/db/schema";
import { generateWorkoutPlan, SPLITS } from "@/lib/generateWorkoutPlan";
import Workout from "@/Components/dashboard/Workouts/Workout";

export const dynamic = "force-dynamic";

export default async function WorkoutGuidePage({ searchParams }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/signin");

  const { split: splitParam } = await searchParams;

  // 1. The user's profile
  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, session.user.id))
    .limit(1);

  // No profile yet: send them to the UserDetails form
  if (!profile) redirect("/workout_guide/details");

  // 2. All workouts added by the admin
  const exercises = await db
    .select({
      id: benchExercises.id,
      title: benchExercises.title,
      category: benchExercises.category,
      muscleGroup: benchExercises.muscleGroup,
      subMuscle: benchExercises.subMuscle,
      startImageUrl: benchExercises.startImageUrl,
      finishImageUrl: benchExercises.finishImageUrl,
      instructions: benchExercises.instructions,
    })
    .from(benchExercises);

  // 3. Today's split rotates Push -> Pull -> Legs (Ethiopia time, UTC+3).
  //    The user can pick another one with ?split=pull
  const eat = new Date(Date.now() + 3 * 60 * 60 * 1000);
  const dateKey = eat.toISOString().slice(0, 10);
  const dayNumber = Math.floor(eat.getTime() / 86400000);
  const todaySplit = SPLITS[dayNumber % SPLITS.length];
  const split = SPLITS.includes(splitParam) ? splitParam : todaySplit;

  // 4. Build the plan on the server
  const plan = {
    ...generateWorkoutPlan(
      profile,
      exercises,
      split,
      `${session.user.id}|${dateKey}`,
    ),
    todaySplit,
  };

  // 5. Pass it to the client UI
  return <Workout key={plan.split} workoutPlan={plan} />;
}
