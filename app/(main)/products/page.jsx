export const dynamic = "force-dynamic";
import React from "react";
import ProductsPage from "@/Components/Products/Products";
export const metadata = {
  title: "Products & Gear | ወንዳወንድ Home Gym",
  description:
    "Explore imported commercial grade home gym benches and workout attachments in Ethiopia. Heavy duty steel, multi angle performance.",
  icons: {
    icon: "/logo_black.svg",
  },
};

const Products_Page = () => {
  return (
    <>
      <ProductsPage />
    </>
  );
};

export default Products_Page;
