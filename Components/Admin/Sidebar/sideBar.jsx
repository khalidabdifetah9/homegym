import React from "react";
import Content from "./content";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
const Sidebar = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  let Admin = "Your Name";
  if (session) {
    Admin = session.user.name;
  }

  const links = [
    { label: "Post Product", href: "/admin", isDefault: true },
    { label: "Add Product Type", href: "/admin/add-product-type" },
    { label: "Products", href: "/admin/products" },
    { label: "Generate QR Code", href: "/admin/generate-qr" },
    { label: "Add Workout", href: "/admin/add-workout" },
  ];

  return <Content links={links} name={Admin} />;
};

export default Sidebar;
