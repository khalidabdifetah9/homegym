import { asc } from "drizzle-orm";
import { db } from "@/db";
import { benchExercises } from "@/db/schema";
import WorkoutList from "@/Components/Admin/WorkoutList";

export const dynamic = "force-dynamic";

export default async function AdminWorkoutsPage() {
  const rows = await db
    .select({
      id: benchExercises.id,
      title: benchExercises.title,
      category: benchExercises.category,
      startImageUrl: benchExercises.startImageUrl,
      videoUrl: benchExercises.videoUrl,
    })
    .from(benchExercises)
    .orderBy(asc(benchExercises.title));

  const workouts = rows.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    startImageUrl: r.startImageUrl,
    hasVideo: Boolean(r.videoUrl),
  }));

  return <WorkoutList workouts={workouts} />;
}
