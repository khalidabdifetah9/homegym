import React from "react";
import GenerateQR from "@/Components/Admin/generateQR";

export const metadata = {
  title: "QR Code & Serial Generator| ወንዳወንድ Home Gym",
  description:
    "Generate batches of unique serial QR codes linked to equipment models and export them for factory sticker printing.",
  other: { "color-scheme": "only light" },
};

const QrGeneration = () => {
  return <GenerateQR />;
};

export default QrGeneration;
