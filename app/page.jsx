import Hero from "@/Components/Landing/Hero";
import BrandOverview from "@/Components/Landing/BrandOverview";
import Features from "@/Components/Landing/Features";
import WorkoutGuide from "@/Components/Landing/WorkoutGuide";
import FAQ from "@/Components/Landing/FAQ";
import CTA from "@/Components/Landing/BottomCTA";
import Footer from "@/Components/Landing/Footer";
export default function Home() {
  return (
    <>
        <Hero/>
        <BrandOverview/>
        <Features/>
        <WorkoutGuide/>
        <FAQ/>
        <CTA/>
        <Footer/>
    </>
  );
}
