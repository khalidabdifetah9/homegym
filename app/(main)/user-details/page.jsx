import React from "react";
import UserDetails from "@/Components/UserDetails/UserDetails";

export const metadata = {
  title: "Profile & Fitness Metrics | ወንዳወንድ Home Gym",
  description:
    "Keep your body measurements up to date so the system can accurately calibrate your set volume, rep targets, and rest intervals",
  icons: {
    icon: "/logo_black.svg",
  },
};

const Details = () => {
  return <UserDetails />;
};

export default Details;
