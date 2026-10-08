import React from "react";
import AddWorkout from "@/Components/Admin/AddWorkout";

export const metadata = {
  title: "Add New Bench Exercise | ወንዳወንድ Home Gym",
  description:
    "Expand the master exercise catalog by adding new movement profiles, hardware configurations, and visual form guides",
  icons: {
    icon: "/logo_black.svg",
  },
};
const Workout = () => {
  return <AddWorkout />;
};

export default Workout;
