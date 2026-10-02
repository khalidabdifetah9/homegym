"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const headline = "Build your gym";

const ease = [0.22, 1, 0.36, 1];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2 } },
};

const headlineVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const word = {
  hidden: { clipPath: "inset(0 100% 0 0)", x: -24, opacity: 0 },
  visible: {
    clipPath: "inset(0 0% 0 0)",
    x: 0,
    opacity: 1,
    transition: { duration: 0.7, ease },
  },
};

const fadeUp = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease } },
};

export default function ProductsView({ products }) {
  const words = headline.split(" ");

  return (
    <main className="min-h-svh bg-[#0a0a0a] px-6 pb-16 pt-28 text-white md:px-17.5 md:pb-25 md:pt-36">
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
          Everything you need for a complete home gym. Pick a product to see the
          details.
        </motion.p>
      </motion.div>

      {products.length === 0 ? (
        <p className="font-poppins text-sm uppercase tracking-[0.1em] text-white/60">
          No products yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4">
          {products.map((item) => (
            <Link
              key={item.id}
              href={`/products/${item.id}`}
              className="group block bg-[#141414] transition-colors duration-300 hover:bg-[#1c1c1c]"
            >
              <div className="relative aspect-square w-full bg-[#d4d4d4]">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                  className="object-contain"
                />
              </div>

              <div className="px-4 py-4 font-poppins text-[10px] uppercase tracking-[0.1em] sm:text-xs">
                <span className="text-white/60 transition-colors duration-300 group-hover:text-[#d4d4d4]">
                  {item.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
