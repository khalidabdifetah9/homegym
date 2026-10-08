import React from "react";
import Content from "@/Components/Admin/Sidebar/content";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
const Sidebar = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  let User = "Your Name";
  if (session) {
    User = session.user.name;
  }

  const links = [
    { label: "Status", href: "/dashboard", isDefault: true },
    { label: "WorkOuts", href: "/dashboard/workouts" },
    { label: "Profile", href: "/dashboard/profile" },
  ];

  return <Content links={links} name={User} />;
};

export default Sidebar;
