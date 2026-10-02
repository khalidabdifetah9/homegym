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
  title: "ወንዳወንድ Home Gym | Commercial Grade Multi Functional Benches",
  description:
    "Skip the crowded gyms. Premium, commercial grade all-in-one workout benches imported in Ethiopia. Built for heavy lifts with zero monthly fees.",
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
