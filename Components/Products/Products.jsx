"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const headline = "Build your gym";

// Put your product images in public/Products/ and change these items
const products = [
  { slug: "adjustable-bench", name: "Adjustable Bench", price: "25,000 ETB", image: "/Amazon.jpg" },
  { slug: "dumbbell-set", name: "Dumbbell Set", price: "18,000 ETB", image: "/vv.png" },
  { slug: "olympic-barbell", name: "Olympic Barbell", price: "12,500 ETB", image: "/Products/plates.avif" },
  { slug: "weight-plates", name: "Weight Plates", price: "9,800 ETB", image: "/Products/plates.avif" },
  { slug: "squat-rack", name: "Squat Rack", price: "32,000 ETB", image: "/Products/rack.avif" },
  { slug: "kettlebell", name: "Kettlebell", price: "3,200 ETB", image: "/Products/kettlebell.avif" },
  { slug: "pull-up-bar", name: "Pull Up Bar", price: "2,900 ETB", image: "/Products/pullup.avif" },
  { slug: "resistance-bands", name: "Resistance Bands", price: "1,500 ETB", image: "/Products/bands.avif" },
  { slug: "jump-rope", name: "Jump Rope", price: "600 ETB", image: "/Products/rope.avif" },
  { slug: "yoga-mat", name: "Yoga Mat", price: "1,200 ETB", image: "/Products/mat.avif" },
  { slug: "ab-wheel", name: "Ab Wheel", price: "800 ETB", image: "/Products/wheel.avif" },
  { slug: "foam-roller", name: "Foam Roller", price: "1,100 ETB", image: "/Products/roller.avif" },
];

const ease = [0.22, 1, 0.36, 1];

// The page header plays its children one after another
const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2 } },
};

// The headline plays its words one after another
const headlineVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

// Each word is revealed from left to right
const word = {
  hidden: { clipPath: "inset(0 100% 0 0)", x: -24, opacity: 0 },
  visible: {
    clipPath: "inset(0 0% 0 0)",
    x: 0,
    opacity: 1,
    transition: { duration: 0.7, ease },
  },
};

// Simple fade up for everything else
const fadeUp = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease } },
};

export default function ProductsPage() {
  const words = headline.split(" ");

  return (
    <main className="min-h-svh bg-[#0a0a0a] px-6 pb-16 pt-28 text-white md:px-17.5 md:pb-25 md:pt-36">
      {/* Top: label, heading and text */}
      <motion.div variants={container} initial="hidden" animate="visible">
        <motion.p
          variants={fadeUp}
          className="mb-8 flex items-center gap-3 text-xl md:mb-10"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#d4d4d4] opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#d4d4d4]"></span>
          </span>
          Catalog
        </motion.p>

        <motion.h1
          variants={headlineVariants}
          className="mb-6 text-5xl font-semibold uppercase leading-none md:text-7xl"
        >
          {words.map((w, i) => (
            <motion.span
              key={i}
              variants={word}
              className="mr-[0.25em] inline-block align-top"
            >
              {w}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mb-12 max-w-130 font-poppins text-base leading-snug text-white/70 md:mb-16 md:text-lg"
        >
          Everything you need for a complete home gym. Pick a product to see
          the details.
        </motion.p>
      </motion.div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4">
        {products.map((item) => (
          <Link
            key={item.slug}
            href={`/products/${item.slug}`}
            className="group block bg-[#141414] transition-colors duration-300 hover:bg-[#1c1c1c]"
          >
            <div className="relative aspect-square w-full bg-[#d4d4d4]">
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                className="object-contain"
              />
            </div>

            <div className="flex items-center justify-between gap-3 px-4 py-4 font-poppins text-[10px] uppercase tracking-[0.1em] sm:text-xs">
              <span className="text-white/60 transition-colors duration-300 group-hover:text-[#d4d4d4]">
                {item.name}
              </span>
              <span className="shrink-0 text-white">{item.price}</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}