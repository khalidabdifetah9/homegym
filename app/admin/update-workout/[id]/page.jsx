import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { benchExercises } from "@/db/schema";
import EditWorkout from "@/Components/Admin/EditWorkout";

export const dynamic = "force-dynamic";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditWorkoutPage({ params }) {
  const { id } = await params;
  if (!UUID_REGEX.test(id)) notFound();

  const [workout] = await db
    .select({
      id: benchExercises.id,
      title: benchExercises.title,
      category: benchExercises.category,
      startImageUrl: benchExercises.startImageUrl,
      finishImageUrl: benchExercises.finishImageUrl,
      videoUrl: benchExercises.videoUrl,
      instructions: benchExercises.instructions,
    })
    .from(benchExercises)
    .where(eq(benchExercises.id, id))
    .limit(1);

  if (!workout) notFound();

  return <EditWorkout workout={workout} />;
}