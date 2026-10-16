import { Poppins, Krona_One } from "next/font/google";
import "./globals.css";
import Navbar from "@/Components/Landing/Navbar";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const kronaOne = Krona_One({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-krona",
});

export const metadata = {
  title: "ወንዳወንድ Home Gym",
  description:
    "Your entire gym at home adjustable bench with pullup & dips attachment and adjustable dumbbells and barbell set.",
  icons: {
    icon: "/logo_black.svg",
  },
  other: { "color-scheme": "only light" },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${kronaOne.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
